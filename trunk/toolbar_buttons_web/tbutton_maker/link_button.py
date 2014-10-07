
import urlparse
import base64
import zipfile
import io
import hashlib
import os
import urllib

from PIL import Image

from django.contrib.sites.models import Site
from django.template import RequestContext
from django.shortcuts import render_to_response, redirect
from django.template.loader import render_to_string
from django.core.urlresolvers import reverse
from django.http import HttpResponse, QueryDict
from django.conf import settings
from django.utils.html import escape
from django.views.decorators.csrf import csrf_exempt
from django.core.cache import cache
from django.utils.encoding import force_str


from codefisher_apps.favicon_getter.views import get_sized_icons
from toolbar_buttons.builder.app_versions import get_app_versions

def index(request, template_name="tbutton_maker/link-button.html"):
    data = {
        "icon_range": range(1,11),
    }
    return render_to_response(template_name, data, context_instance=RequestContext(request))

@csrf_exempt
def create(request):
    if request.method == 'POST':
        url = request.POST.get("url")
        parsed_url = urlparse.urlparse(url)
        if parsed_url[0] == "":
            url = "http://" + url
        elif parsed_url[0] not in ["http", "https", "ftp", "ftps", "javascript", "file"]:
            redirect(reverse('lbutton-custom'))
        button_id = "lbutton-%s" % hashlib.md5(url).hexdigest()
        icon_type = request.POST.get("icon-type")
        icon_data = {}
        if icon_type == "default":
            icon_name = request.POST.get("default-icon")
            if not icon_name in ["www-%s" % i for i in range(1,11)]:
                icon_name = "www-1"
            for size in [16, 24, 32]:
                icon_path = os.path.join(settings.BASE_DIR, settings.DEFAULT_LINK_ICONS, '%s-%s.png' % (icon_name, size))
                if os.path.exists(icon_path):
                    with open(icon_path) as fp:
                        icon_data["icon-%s" % size] = base64.encodestring(fp.read())
        elif icon_type == "favicon":
            icons = get_sized_icons(url, [16, 24, 32])
            if icons is None:
                return redirect(reverse('lbutton-custom'))
            for size in [16, 24, 32]:
                value = io.BytesIO()
                icons[size].save(value, "png")
                icon_data["icon-%s" % size] = base64.b64encode(value.getvalue())
                value.close()
        elif icon_type == "custom":
            have = []
            for size in [16, 24, 32]:
                if "icon-%s" % size in request.FILES:
                    have.append("icon-%s" % size)
                    icon_data["icon-%s" % size] = base64.encodestring("".join(c for c in request.FILES["icon-%s" % size].chunks()))
            if len(have) == 0:
                return redirect(reverse('lbutton-custom'))
            elif len(have) != 3:
                for size in [16, 24, 32]:
                    if "icon-%s" % size not in have:
                        imagefile  = io.BytesIO("".join(c for c in request.FILES[have[-1]].chunks()))
                        im = Image.open(imagefile)
                        im = im.resize((size, size), Image.BICUBIC)
                        png = io.BytesIO()
                        im.save(png, format='PNG')
                        imagefile.close()
                        icon_data["icon-%s" % size] = base64.encodestring(png.getvalue())
        else:
            return redirect(reverse('lbutton-custom'))
        data = {
            "button_id": button_id,
            "button_url": url,
            "chrome_name": button_id,
            "extension_uuid": "%s@codefisher.org" % button_id,
            "name": force_str(request.POST.get("title")),
            "button_label": force_str(request.POST.get("label")),
            "button_tooltip": force_str(request.POST.get("tooltip")),
            "offer-download": request.POST.get("offer-download") == "true",
        }
        data.update(icon_data)
        url_data = urllib.urlencode(data)
        key = 'lbytton-%s' % hashlib.sha1(url_data).hexdigest()
        cache.set(key, url_data, 3*60*60)
        request.session["lbutton-key"] = key
        return build(request, data)
    else:
        if request.session.get("lbutton-key"):
            # this means they have already requested it, but firefox kill the request
            # because our site did not have permissions to install an addon
            # it then restarts the request, as a GET, without the POST data
            # so if we have saved data, we use it
            data = QueryDict(cache.get(request.session.get("lbutton-key")))
            del request.session['lbutton-key']
            return build(request, data)
        else:
            return redirect(reverse('lbutton-custom'))

def make(request):
    return build(request, request.GET)

def build(request, data):
    update_query = QueryDict("").copy()
    update_query.update(data)
    del update_query['offer-download']
    app_data = {
        "item_id": "%ITEM_ID%",
        "item_version": "%ITEM_VERSION%",
        "item_maxapversion": "%ITEM_MAXAPPVERSION%",
        "app_version": "%APP_VERSION%",
    }
    extra_query = "&".join("%s=%s" % (key, value) for key, value in app_data.items())
    domain = Site.objects.get_current().domain
    data = dict(data.items())
    data.update({
        "update_url": "https://%s%s?%s&%s" % (domain, reverse("lbutton-update"),
                update_query.urlencode(), extra_query),
        "home_page": "http://%s%s" % (domain, reverse("lbutton-custom")),
        # firefox max version number
        "max_version": get_app_versions().get("{ec8030f7-c20a-464f-9b0e-13a3a9e97384}", "35.0"),
    })
    output = io.BytesIO()
    xpi = zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED)
    for template in ["button.css", "button.js", "button.xul", "chrome.manifest", "install.rdf"]:
        xpi.writestr(template,
            render_to_string(os.path.join("tbutton_maker", "link", template), data).encode("utf-8"))
    for name in ["icon-16", "icon-24", "icon-32"]:
        xpi.writestr("%s.png" % name, base64.b64decode(data[name]))
    xpi.writestr(os.path.join("defaults", "preferences", "link.js"),
        ("""pref("extension.link-buttons.url.%(button_id)s", "%(button_url)s");""" % data).encode("utf-8"))
    xpi.close()
    if data.get('offer-download'):
        responce = HttpResponse(output.getvalue(), content_type="application/octet-stream")
        responce['Content-Disposition'] = 'attachment; filename=%(button_id)s.xpi' % data
    else:
        responce = HttpResponse(output.getvalue(), content_type="application/x-xpinstall")
        responce['Content-Disposition'] = 'filename=%(button_id)s.xpi' % data
    return responce

def compare_versions(version, other):
    def _convert(ver):
        return [int(item) if item.isdigit() else item for item in ver.split(".")]
    return _convert(version) < _convert(other)

def update(request):
    max_version = get_app_versions().get("{ec8030f7-c20a-464f-9b0e-13a3a9e97384}", "4.0.*")
    update_query = QueryDict("").copy()
    update_query.update(request.GET)
    if compare_versions(request.GET.get("item_maxapversion"), request.GET.get("app_version")):
        _version = request.GET.get("version").split(".")
        _version[-1] = str(int(_version[-1]) + 1)
        version = ".".join(_version)
    else:
        version = request.GET.get("version")
    domain = Site.objects.get_current().domain
    data = {
        "version": version,
        "max_version":max_version,
        "update_url":"https://%s%s?%s" % (domain, reverse("lbutton-make"),
                update_query.urlencode()),
        "extension_uuid": request.GET.get("extension_uuid")
    }
    return render_to_response("tbutton_maker/link/update.rdf", data, content_type="application/xml+rdf")

@csrf_exempt
def favicons(request):
    if not request.POST.get("url"):
        return HttpResponse("fail")
    url = request.POST.get("url")
    parsed_url = urlparse.urlparse(url)
    if parsed_url[0] == "":
        url = "http://" + url
    elif parsed_url[0] not in ["http", "https", "ftp", "ftps", "javascript", "file"]:
        return HttpResponse("fail")
    sizes = (16, 24, 32)
    icons = get_sized_icons(url, sizes)
    if icons is None:
        return HttpResponse("fail")
    tags = []
    for size in sizes:
        value = io.BytesIO()
        icons[size].save(value, "png")
        data = "data:image/png;base64," + base64.b64encode(value.getvalue())
        value.close()
        tags.append('<img src="%s" width="%s" height="%s" alt="">' % (data, size, size))
    return HttpResponse("\n".join(tags))

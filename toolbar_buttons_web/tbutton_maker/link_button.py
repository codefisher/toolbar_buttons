
import urlparse
import base64
import zipfile
import io
import hashlib
import os

from django.contrib.sites.models import Site
from django.template import RequestContext
from django.shortcuts import render_to_response, redirect
from django.template.loader import render_to_string
from django.core.urlresolvers import reverse
from django.http import HttpResponse, QueryDict
from django.conf import settings
from django.utils.html import escape

from codefisher_apps.favicon_getter.views import get_sized_icons
from toolbar_buttons.builder.app_versions import get_app_versions

def index(request, template_name="tbutton_maker/link-button.html"):
    data = {
        "icon_range": range(1,11),
    }
    return render_to_response(template_name, data, context_instance=RequestContext(request))

def create(request):
    url = request.REQUEST.get("url")
    parsed_url = urlparse.urlparse(url)
    if parsed_url[0] == "":
        url = "http://" + url
    elif parsed_url[0] not in ["http", "https", "ftp", "ftps", "javascript", "file"]:
        redirect(reverse('lbutton-custom'))
    button_id = "lbutton-%s" % hashlib.md5(url).hexdigest()
    icon_type = request.REQUEST.get("icon-type")
    icon_data = {}
    if icon_type == "default":
        icon_name = request.REQUEST.get("default-icon")
        for size in [16, 24, 32]:
            icon_path = os.path.join(settings.MEDIA_ROOT, settings.DEFAULT_LINK_ICONS, '%s-%s.png' % (icon_name, size))
            if os.path.exists(icon_path):
                with open(icon_path) as fp:
                    icon_data["icon-%s" % size] = base64.encodestring(fp.read())
    elif icon_type == "favicon":
        icons = get_sized_icons(url, sizes)
        if icons is None:
            redirect(reverse('lbutton-custom'))

    elif icon_type == "custom":
        pass
    else:
        redirect(reverse('lbutton-custom'))
    data = {
        "button_id": button_id,
        "button_url": url,
        "chrome_name": button_id,
        "extension_uuid": "%s@codefisher.org" % button_id,
        "name":request.REQUEST.get("title"),
        "version":"1.0.0",
        "button_label": request.REQUEST.get("label"),
        "button_tooltip": request.REQUEST.get("tooltip"),
    }
    data.update(icon_data)
    return build(request, data)

def make(request):
    return build(request, data.REQUEST)

def build(request, data):
    update_query = QueryDict("").copy()
    update_query.update(data)
    app_data = {
        "item_id": "%ITEM_ID%",
        "item_version": "%ITEM_VERSION%",
        "item_maxapversion": "%ITEM_MAXAPPVERSION%",
        "app_version": "%APP_VERSION%",
    }
    extra_query = "&".join("%s=%s" % (key, value) for key, value in app_data.items())
    domain = Site.objects.get_current().domain
    data.update({
        "update_url": "https://%s%s?%s&%s" % (domain, reverse("lbutton-update"),
                update_query.urlencode(), extra_query),
        "home_page": "http://%s%s" % (domain, reverse("lbutton-custom")),
        # firefox max version number
        "max_version": get_app_versions().get("{ec8030f7-c20a-464f-9b0e-13a3a9e97384}", "4.0.*"),
    })
    output = io.BytesIO()
    xpi = zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED)
    for template in ["button.css", "button.js", "button.xul", "chrome.manifest", "install.rdf"]:
        xpi.writestr(template,
            render_to_string(os.path.join("tbutton_maker", "link", template), data))
    for name in ["icon-16", "icon-24", "icon-32"]:
        xpi.writestr("%s.png" % name, base64.b64decode(data[name]))
    xpi.writestr(os.path.join("defaults", "preferences", "link.js"),
        """pref("extension.link-buttons.url.%(button_id)s", "%(button_url)s");""" % data)
    xpi.close()
    responce = HttpResponse(output.getvalue(), mimetype="application/octet-stream")#"application/x-xpinstall"
    responce['Content-Disposition'] = 'filename=%(button_id)s.xpi' % data
    #output.close()
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
    return render_to_response("tbutton_maker/link/update.rdf", data, mimetype="text/plain")#"application/xml+rdf")

def favicons(request):
    if not request.REQUEST.get("url"):
        return HttpResponse("fail")
    url = request.REQUEST.get("url")
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
        tags.append('<img src="%s" width="%s" heiht="%s" alt="">' % (data, size, size))
    return HttpResponse("\n".join(tags))

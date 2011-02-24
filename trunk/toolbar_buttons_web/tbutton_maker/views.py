# Create your views here.

import os
import re
import operator
import io
import datetime
import hashlib

from django.contrib.sites.models import Site
from django.shortcuts import render_to_response, redirect
from django.http import HttpResponse
from django.conf import settings
from django.http import HttpResponseNotFound, HttpResponse, Http404, QueryDict
from django.template import RequestContext
from django.views.decorators.csrf import csrf_protect
from django.core.urlresolvers import reverse
from django.db.models import Count

from toolbar_buttons.config.settings import config
from toolbar_buttons.builder import button, locales, util, build

from toolbar_buttons.toolbar_buttons_web.tbutton_maker.models import Application, Button, DownloadSession


class WebButton(button.SimpleButton):
    def __init__(self, folders, buttons, settings, applications):
        button.SimpleButton.__init__(self, folders, buttons, settings, applications)
        self._description = {}
        self._icons = {}

        for folder, buttonId, files in self._info:
            if "description" in files:
                with open(os.path.join(folder, "description"), "r") as description:
                    self._description[buttonId] = description.read()
                    if not self._description[buttonId].strip():
                        print buttonId
            if "image" in files:
                with open(os.path.join(folder, "image"), "r") as image_fp:
                    for line in image_fp:
                        image, _, selector = line.strip().partition(" ")
                        if image and not selector.strip():
                            self._icons[buttonId] = image
                            break

    def get_xul_files(self, button):
        return self._xul_files[button]

    def get_icons(self, button):
        return self._icons[button]

    def description(self, button):
        return self._description.get(button)

def locale_string(button_locale, locale_name, buttons_obj):
    def locale_str(str, buttonId):
        value = button_locale.get_dtd_value(locale_name, "%s.%s" % (buttonId, str), buttons_obj)
        if value is None:
            if str == "label":
                regexp = r'label="&(.*\.label);"'
            else:
                regexp = r'tooltiptext="&(.*\.tooltip);"'
            with open(buttons_obj.get_xul_files(buttonId)[0]) as fp:
                data = fp.read()
                match = re.search(regexp, data)
                value = button_locale.get_dtd_value(locale_name, match.group(1), buttons_obj)
            if value is None:
                value = button_locale.get_dtd_value(default_local, match.group(1), buttons_obj)
        if value is None:
            print buttonId
        return value.replace("&brandShortName;", "").replace("&apos;", "'")
    return locale_str

def get_extenion_data(locale_name=None, applications=None):
    extension_settings = dict(config)
    extension_settings["project_root"] = settings.TBUTTON_DATA
    default_local = extension_settings.get("default_locale")
    if locale_name == None:
        locale_name = default_local
    if applications == None:
        applications = extension_settings.get("applications_data").keys()
    else:
        applications = applications.split(',')
    locale_folder, locale = util.get_locale_folders(set([locale_name, default_local]), extension_settings)
    if locale:
        button_locale = locales.Locale(config, locale_folder,
            locale, load_properites=False)
    else:
        raise Http404
    button_folders, buttons = util.get_button_folders("all", extension_settings)
    buttons_obj = WebButton(button_folders, buttons, extension_settings, applications)
    locale_str = locale_string(button_locale=button_locale, locale_name=locale_name, buttons_obj=buttons_obj)
    return buttons_obj, locale_str, extension_settings, locale_name, applications

def list_buttons(request, locale_name=None, applications=None, template_name='tbutton_maker/list.html'):
    return index(request, locale_name, applications, template_name)

def index(request, locale_name=None, applications=None, template_name='tbutton_maker/index.html'):
    buttons_obj, locale_str, extension_settings, locale_name, applications = get_extenion_data(locale_name, applications)

    button_data = []
    for buttonId, apps in buttons_obj.button_applications().items():
        button_data.append((buttonId, sorted(list(apps)), locale_str("label", buttonId),
                locale_str("tooltip", buttonId), buttons_obj.get_icons(buttonId),
                buttons_obj.description(buttonId)))
    def button_key(item):
        return item[2].lower() if item[2] else None
    locale_folders, locales_names = util.get_locale_folders(extension_settings.get("locale"), extension_settings)
    locale_meta = locales.Locale(extension_settings, locale_folders,
                locales_names, only_meta=True)
    local_data = []
    for locales_name in locales_names:
        local_data.append((
            locales_name,
            locale_meta.get_dtd_value(locales_name, 'name'),
            locale_meta.get_dtd_value(locales_name, 'native_name'),
            locale_meta.get_dtd_value(locales_name, 'country'),
        ))
    button_data.sort(key=button_key)
    local_data.sort(key=button_key)
    application_data = extension_settings.get("applications_data")
    application_names = dict((key, [item[0] for item in value]) for key, value in application_data.iteritems())
    #TODO: add option for what update "stream" to follow, the size of icon,
    # and the icon set (if I get more then one)
    data = {
        "locale": locale_name,
        "all_applications": sorted(application_data.keys()),
        "applications": applications,
        "button_data": button_data,
        "application_names": application_names,
        "local_data": local_data,
    }
    return render_to_response(template_name, data, context_instance=RequestContext(request))

def create_buttons(request, query):
    buttons = query.getlist("button")
    locale = query.get("locale")

    extension_settings = dict(config)
    extension_settings.update({
        "show_updated_prompt": False,
        "project_root": settings.TBUTTON_DATA,
        "icon": os.path.join(settings.TBUTTON_DATA, extension_settings.get("icon")),
        "licence": os.path.join(settings.TBUTTON_DATA, extension_settings.get("licence")),
        "buttons": buttons,
    })

    # I need to set the update url

    if not locale or query.get("include-all-locales") == "true":
        locale = "all"
    if query.get("create-toolbars") == "true":
        extension_settings["include_toolbars"] = -1
    extension_settings["locale"] = locale
    applications = query.get("application")
    if not applications:
        applications = "all"
    extension_settings["applications"] = applications

    extension_settings["extension_id"] = "%s@button.codefisher.org" % hashlib.md5("_".join(sorted(buttons))).hexdigest()
    extension_settings["update_url"] = "https://%s%s?%s" % (Site.objects.get_current().domain,
            reverse("tbutton-update"), query.urlencode())

    output = io.BytesIO()
    buttons, button_locales = build.build_extension(extension_settings, output=output)
    responce = HttpResponse(output.getvalue(), mimetype="application/x-xpinstall")
    if request.POST.get("offer-download") == "true":
        responce['Content-Disposition'] = 'attachment; filename=%s' % (extension_settings.get("output_file") % extension_settings)
    else:
        responce['Content-Disposition'] = 'filename=%s' % (extension_settings.get("output_file") % extension_settings)
    session = DownloadSession()
    session.query_string = query.urlencode()
    session.save()
    for button in buttons.buttons():
        Button.objects.create(name=button, session=session)
    for button in buttons.applications():
        Application.objects.create(name=button, session=session)
    return responce

def create(request):
    if request.method != "POST":
        raise Http404()
    buttons = request.POST.getlist("button")
    if not buttons or "update-submit" in request.POST:
        applications = ",".join(request.POST.getlist("button-application"))
        locale = request.POST.get("button-locale")
        kwargs = {}
        if locale:
            kwargs["locale_name"] = locale
        if applications:
            kwargs["applications"] = applications
        return redirect(reverse("tbutton-custom", kwargs=kwargs))
    return create_buttons(request, request.POST)


def statistics(request, days=30, template_name='tbutton_maker/statistics.html'):
    locale_str = get_extenion_data()[1]

    time = datetime.datetime.now() - datetime.timedelta(days)
    buttons = Button.objects.filter(session__time__gt=time)
    stats = list(buttons.values('name').annotate(downloads=Count('name')).order_by("-downloads"))
    sum = buttons.count()
    total = 0
    for item in stats:
        count = item["downloads"]
        total += count
        item.update({
            "label": locale_str('label', item["name"]),
            "average": (float(count) / days),
            "percent": (float(count) / sum * 100),
            "total": (float(total) / sum * 100)
        })
    data = {
        "stats": stats,
        "count": sum,
        "average": float(sum)/(len(stats)*days)
    }
    return render_to_response(template_name, data, RequestContext(request))

def old_update(request):
    query = QueryDict('').copy()
    query.setlist('button', request.GET.get('buttons').split('_'))
    return redirect("%s?%s" % (reverse('tbutton-update'), query.urlencode()))

def update(request):
    buttons = request.GET.getlist("button")
    update_url = "https://%s%s?%s" % (Site.objects.get_current().domain,
            reverse("tbutton-make-button"), request.GET.urlencode())

    data = {
        "applications": sum(config.get("applications_data").values(), ()),
        "version": config.get("version"),
        "update_url": update_url,
        "extension_id": "%s@button.codefisher.org" % hashlib.md5("_".join(sorted(buttons))).hexdigest(),
    }

    return render_to_response("tbutton_maker/update.rdf", data, mimetype="text/xml")

def make(request):
    return create_buttons(request, request.GET)
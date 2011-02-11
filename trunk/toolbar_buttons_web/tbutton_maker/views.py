# Create your views here.

import os
import re
import operator
import io

from django.shortcuts import render_to_response, redirect
from django.http import HttpResponse
from django.conf import settings
from django.http import HttpResponseNotFound, HttpResponse, Http404
from django.template import RequestContext
from django.views.decorators.csrf import csrf_protect
from django.core.urlresolvers import reverse

from toolbar_buttons.config.settings import config
from toolbar_buttons.builder import button, locales, util, build

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
                with open(os.path.join(folder, "image"), "r") as image:
                    for line in image:
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

def index(request, locale_name=None, applications=None, template_name='tbutton_maker/index.html'):
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
        return HttpResponseNotFound("Locale not supported")
    button_folders, buttons = util.get_button_folders("all", extension_settings)
    buttons_obj = WebButton(button_folders, buttons, extension_settings, applications)
    button_data = []
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
        return value.replace("&brandShortName;", "")

    for buttonId, apps in buttons_obj.button_applications().items():
        button_data.append((buttonId, sorted(list(apps)), locale_str("label", buttonId),
                locale_str("tooltip", buttonId), buttons_obj.get_icons(buttonId),
                buttons_obj.description(buttonId)))
    def button_key(item):
        return item[2].lower()
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
    data = {
        "locale": locale_name,
        "all_applications": sorted(application_data.keys()),
        "applications": applications,
        "button_data": button_data,
        "application_names": application_names,
        "local_data": local_data,
    }
    return render_to_response(template_name, data, context_instance=RequestContext(request))


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

    extension_settings = dict(config)
    extension_settings.update({
        "show_updated_prompt": False,
        "project_root": settings.TBUTTON_DATA,
        "icon": os.path.join(settings.TBUTTON_DATA, extension_settings.get("icon")),
        "licence": os.path.join(settings.TBUTTON_DATA, extension_settings.get("licence")),
        "buttons": buttons,
    })
    locale = request.POST.get("locale")

    # I need to set the update url
    print request.POST.urlencode()
    if not locale or request.POST.get("include-all-locales") == "true":
        locale = "all"
    if request.POST.get("create-toolbars") == "true":
        extension_settings["include_toolbars"] = -1
    extension_settings["locale"] = locale
    applications = request.POST.get("application")
    if not applications:
        applications = "all"
    extension_settings["applications"] = applications
    output = io.BytesIO()
    build.build_extension(extension_settings, output=output)
    responce = HttpResponse(output.getvalue(), mimetype="application/x-xpinstall")
    if request.POST.get("offer-download") == "true":
        responce['Content-Disposition'] = 'attachment; filename=%s' % (extension_settings.get("output_file") % extension_settings)
    else:
        responce['Content-Disposition'] = 'filename=%s' % (extension_settings.get("output_file") % extension_settings)
    return responce
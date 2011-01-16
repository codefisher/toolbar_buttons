# Create your views here.

import os
import re

from django.shortcuts import render_to_response
from django.http import HttpResponse
from django.conf import settings
from django.http import HttpResponseNotFound
from django.template import RequestContext
from django.views.decorators.csrf import csrf_protect

from ToolbarButtons.config.settings import config
from ToolbarButtons.builder import button, locales, util

class WebButton(button.SimpleButton):
    def __init__(self, folders, buttons, settings, applications):
        button.SimpleButton.__init__(self, folders, buttons, settings, applications)
        self._description = {}

        for folder, buttonId, files in self._info:
            if "description" in files:
                with open(os.path.join(folder, "description"), "r") as description:
                    self._description[buttonId] = description.read()

    def get_xul_files(self, button):
        return self._xul_files[button]

    def description(self, button):
        return self._description.get(button)

@csrf_protect
def index(request, locale_name=None, applications=None):
    if locale_name == None:
        locale_name = config.get("default_locale")
    if applications == None:
        applications = config.get("applications_data").keys()
    else:
        applications = applications.split(',')
    locale_folder, locale = util.get_locale_folders(locale_name,
            os.path.join(settings.TBUTTON_DATA, "locale"))
    if locale:
        button_locale = locales.Locale(config, locale_folder,
                locale, load_properites=False)
        locale_str = lambda str: button_locale.get_dtd_value(locale_name, str)
    else:
        return HttpResponseNotFound("Locale not supported")
    button_folders, buttons = util.get_button_folders("all",
            os.path.join(settings.TBUTTON_DATA, "data"))
    buttons_obj = WebButton(button_folders, buttons, config, ",".join(applications))
    button_data = []
    def locale_str(str, buttonId):
        value = button_locale.get_dtd_value(locale_name, "%s.%s" % (buttonId, str))
        if value is None:
            if str == "label":
                regexp = r'label="&(.*\.label);"'
            else:
                regexp = r'tooltiptext="&(.*\.tooltip);"'
            with open(buttons_obj.get_xul_files(buttonId)[0]) as fp:
                data = fp.read()
                match = re.search(regexp, data)
                value = button_locale.get_dtd_value(locale_name, match.group(1))
        return value.replace("&brandShortName;", "")
    for buttonId, apps in buttons_obj.button_applications().items():
        button_data.append((buttonId, apps,
                locale_str("label", buttonId), locale_str("tooltip", buttonId)))
    data = {
        "locale": locale_name,
        "applications":applications,
        "button_data": button_data,
    }
    return render_to_response('index.html' , data, context_instance=RequestContext(request))

@csrf_protect
def create(request):
    extension_settings = dict(config)
    print request.POST.getlist("button")
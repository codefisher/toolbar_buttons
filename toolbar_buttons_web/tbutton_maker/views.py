# Create your views here.

import os
import re
import operator
import io
import datetime
import hashlib
import json

from django.contrib.sites.models import Site
from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.conf import settings
from django.http import HttpResponseNotFound, HttpResponse, Http404, QueryDict
from django.views.decorators.csrf import csrf_protect
from django.core.urlresolvers import reverse
from django.db.models import Count
from django.utils.html import escape
from django.core.paginator import Paginator, InvalidPage, EmptyPage
from django.views.decorators.csrf import csrf_exempt


from toolbar_buttons.config.settings import config
from toolbar_buttons.builder import button, locales, util, build

from toolbar_buttons.toolbar_buttons_web.tbutton_maker.models import Application, Button, DownloadSession

from codefisher_apps.extension_downloads.models import ExtensionDownload
from codefisher_apps.downloads.models import DownloadGroup


class WebButton(button.SimpleButton):
    def __init__(self, folders, buttons, settings, applications):
        button.SimpleButton.__init__(self, folders, buttons, settings, applications)
        self._description = {}
        self._source_folder = {}
        for folder in folders:
            head, button_id = os.path.split(folder)
            self._source_folder[button_id] = os.path.split(head)[1]

        for folder, button_id, files in self._info:
            if "description" in files:
                with open(os.path.join(folder, "description"), "r") as description:
                    self._description[button_id] = description.read()
                    if not self._description[button_id].strip():
                        print button_id
              
    def get_source_folder(self, button):
        return self._source_folder[button] 

    def description(self, button):
        return self._description.get(button)

def get_extenion_data(extension_settings, locale_name=None, applications=None, buttons_ids="all"):
    if applications == None:
        applications = extension_settings.get("applications_data").keys()
    else:
        applications = applications.split(',')        
    button_locale, locale_folder, locale_name = get_locale_obj(extension_settings, locale_name)
    buttons_obj = get_buttons_obj(extension_settings, applications, buttons_ids)
    locale_str = buttons_obj.locale_string(button_locale=button_locale, locale_name=locale_name)
    return buttons_obj, locale_str, locale_name, applications

def get_locale_obj(extension_settings, locale_name):
    default_local = extension_settings.get("default_locale")
    if locale_name == None:
        locale_name = default_local
    locale_folder, locale = util.get_locale_folders(set([locale_name, default_local]), extension_settings)
    if locale:
        button_locale = locales.Locale(extension_settings, locale_folder,
            locale, load_properites=False)
    else:
        raise Http404 
    return button_locale, locale_folder, locale_name

def get_buttons_obj(extension_settings, applications, buttons_ids="all"):
    button_folders, buttons = util.get_button_folders(buttons_ids, extension_settings)
    for name, use_setting in (('staging', 'use_staging'), ('pre', 'use_pre')):
        if extension_settings.get(use_setting):
            staging_button_folders, staging_buttons = util.get_button_folders(buttons_ids, extension_settings, name)
            button_folders.extend(staging_button_folders)
            buttons.extend(staging_buttons)
    return WebButton(button_folders, buttons, extension_settings, applications)
    
def list_buttons(request, locale_name=None, applications=None, template_name='tbutton_maker/list.html'):
    return index(request, locale_name, applications, template_name)

def index(request, locale_name=None, applications=None, template_name='tbutton_maker/index.html'):
    extension_settings = dict(config)
    extension_settings["project_root"] = settings.TBUTTON_DATA
    buttons_obj, locale_str, locale_name, applications = get_extenion_data(extension_settings, locale_name, applications)

    button_data = []
    for button_id, apps in buttons_obj.button_applications().items():
        button_data.append((button_id, sorted(list(apps)), locale_str("label", button_id),
                locale_str("tooltip", button_id), buttons_obj.get_icons(button_id),
                buttons_obj.description(button_id), buttons_obj.get_source_folder(button_id)))
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
        "icon_sets": [(name, label) for name, (label, _) in settings.TBUTTON_ICONS.items()],
        "default_icons": settings.TBUTTON_DEFAULT_ICONS,
    }
    if template_name is None:
        return data
    return render(request, template_name, data)

def create_buttons(request, query, log_creation=True):
    buttons = query.getlist("button")
    locale = query.get("button-locale", query.get("locale", "all"))

    extension_settings = dict(config)
    extension_settings.update({
        "show_updated_prompt": False,
        "project_root": settings.TBUTTON_DATA,
        "icon": os.path.join(settings.TBUTTON_DATA, extension_settings.get("icon")),
        "licence": os.path.join(settings.TBUTTON_DATA, extension_settings.get("licence")),
        "buttons": buttons,
    })

    if not locale or query.get("include-all-locales") == "true":
        locale = "all"
        
    extension_settings["fix_meta"] = True
     
    if query.get("create-toolbars") == "true":
        extension_settings["put_button_on_toolbar"] = True
        extension_settings["include_toolbars"] = -1
    else:
        extension_settings["include_toolbars"] = 0
    if query.get("add-to-toolbar"):
        extension_settings["add_to_main_toolbar"] = buttons
    extension_settings["create_menu"] = query.get("create-menu") == "true"
    extension_settings["locale"] = "all" # always include everything
    applications = query.getlist("button-application")
    if not applications:
        applications = query.get("application", "all").split(",")
    extension_settings["applications"] = applications
    update_query = query.copy()
    #update_query["application"] = ",".join(applications)
    update_query.setlist('button-application', applications)
    update_query["locale"] = locale
    allowed_options = set(("button-application", "locale", "button", "create-menu", "create-toolbars", "icon-size", "add-to-toolbar"))
    for key in update_query.keys():
        if key not in allowed_options:
            del update_query[key]
    icons_size = settings.TBUTTON_ICON_SET_SIZES.get(settings.TBUTTON_DEFAULT_ICONS).get(query.get("icon-size"))
    if icons_size:
        extension_settings["icon_size"] = icons_size
    extension_settings["chrome_name"] = "toolbar-button-%s" % hashlib.md5("_".join(buttons)).hexdigest()[0:10]
    extension_settings["extension_id"] = "%s@button.codefisher.org" % hashlib.md5("_".join(sorted(buttons))).hexdigest()
    extension_settings["update_url"] = "https://%s%s?%s" % (Site.objects.get_current().domain,
            reverse("tbutton-update"), escape(update_query.urlencode()))

    output = io.BytesIO()
    buttons, button_locales = build.build_extension(extension_settings, output=output)
    content_type = 'application/x-xpinstall'
    disposition = 'filename=%s'
    if query.get('offer-download') == 'true' or ('browser' not in applications):
        content_type = 'application/octet-stream'
        disposition = 'attachment; filename=%s'
    responce = HttpResponse(output.getvalue(), content_type=content_type)
    output.close()
    responce['Content-Disposition'] = disposition % (extension_settings.get('output_file') % extension_settings)
    
    if log_creation:
        session = DownloadSession()
        session.query_string = query.urlencode()
        session.save()
        for button_record in buttons.buttons():
            Button.objects.create(name=button_record, session=session)
        for button_record in buttons.applications():
            Application.objects.create(name=button_record, session=session)
    return responce

@csrf_exempt
def create(request):
    #if request.method != "POST":
    #    raise Http404()
    buttons = request.GET.getlist("button")
    if not buttons or "update-submit" in request.GET:
        applications = ",".join(request.GET.getlist("button-application"))
        locale = request.GET.get("button-locale")
        kwargs = {}
        if locale:
            kwargs["locale_name"] = locale
        if applications:
            kwargs["applications"] = applications
        return redirect(reverse("tbutton-custom", kwargs=kwargs))
    return create_buttons(request, request.GET)


def statistics(request, days=30, template_name='tbutton_maker/statistics.html'):
    extension_settings = dict(config)
    extension_settings["project_root"] = settings.TBUTTON_DATA
    buttons_obj, locale_str = get_extenion_data(extension_settings)[:2]
    time = datetime.datetime.now() - datetime.timedelta(days)
    buttons = Button.objects.filter(session__time__gt=time)
    sessions = DownloadSession.objects.filter(time__gt=time).count()
    stats = list(buttons.values('name').annotate(downloads=Count('name')).order_by("-downloads"))
    sum = buttons.count()
    applications = dict(buttons_obj.button_applications().items())
    total = 0
    found = set()
    for item in stats:
        found.add(item["name"])
        count = item["downloads"]
        total += count
        apps = list(applications[item["name"]])
        apps.sort()
        item.update({
            "applications": apps,
            "icon": buttons_obj.get_icons(item["name"]),
            "label": locale_str('label', item["name"]),
            "average": (float(count) / days),
            "percent": (float(count) / sum * 100),
            "total": (float(total) / sum * 100),
            "folder": buttons_obj.get_source_folder(item["name"]),
        })
    for name in set(buttons_obj.buttons()).difference(found):
        apps = list(applications[item["name"]])
        apps.sort()
        stats.append({
               "name": name,
               "downloads": 0,  
               "applications": apps,
               "icon": buttons_obj.get_icons(name),
               "label": locale_str('label', name),
               "average": 0,
               "percent": 0,
               "total": (float(total) / sum * 100),
               "folder": buttons_obj.get_source_folder(name),   
        })
    data = {
        "stats": stats,
        "count": sum,
        "sessions": sessions,
        "average": float(sum)/(len(stats)*days) if stats else 0
    }
    return render(request, template_name, data)

def suggestions(request):
    days = 30
    time = datetime.datetime.now() - datetime.timedelta(days)
    button = request.GET.getlist('button')
    inner_qs = Button.objects.filter(name__in=button, session__time__gt=time).values('session')
    results = Button.objects.filter(session__in=inner_qs).exclude(name__in=button)
    stats = list(results.values('name').annotate(downloads=Count('name')).order_by("-downloads"))[0:int(request.GET.get('count', 10))]
    return HttpResponse(
        json.dumps(stats),
        content_type = 'application/javascript; charset=utf8'
    )

def old_update(request):
    query = QueryDict('').copy()
    query.setlist('button', request.GET.get('buttons').split('_'))
    return redirect("%s?%s" % (reverse('tbutton-update'), query.urlencode()))

def update(request):
    def flat(l):
        return [item for sublist in l for item in sublist]
    buttons = request.GET.getlist("button")
    applications = request.GET.getlist("button-application")
    if not applications:
        applications = request.GET.get("application", "all").split(",")
    if applications == ["all"]:
        app_data = flat(config.get("applications_data").values())
    else:
        app_data = flat([config.get("applications_data").get(app) for app in applications])
    update_url = "https://%s%s?%s" % (Site.objects.get_current().domain,
            reverse("tbutton-make-button"), request.GET.urlencode())
    
    data = {
        "applications": app_data,
        "version": config.get("version"),
        "update_url": update_url,
        "extension_id": "%s@button.codefisher.org" % hashlib.md5("_".join(sorted(buttons))).hexdigest(),
    }

    return render(request, "tbutton_maker/update.rdf", data, content_type="application/xml+rdf")

def update_static(request):
    app_data = [item for sublist in config.get("applications_data").values() for item in sublist]
    group = DownloadGroup.objects.get(identifier=config.get("extension_id"))
    extension = ExtensionDownload.objects.get(pk=group.latest.pk)
    site = Site.objects.get_current()
    scheme = "https" if request.is_secure() else "http"
    data = {
        "applications": app_data,
        "version": config.get("version"),
        "update_url": "%s://%s%s" % (scheme, site.domain, extension.get_absolute_url()),
        "extension_id": config.get("extension_id"),
    }
    return render(request, "tbutton_maker/update.rdf", data, content_type="application/xml+rdf")  

def make(request):
    return create_buttons(request, request.GET, log_creation=False)

def page_it(request, entries_list):
    paginator = Paginator(entries_list, 10)
    # todo: this does not work now
    try:
        page = int(request.GET.get('page', '1'))
    except ValueError:
        page = 1

    try:
        entries = paginator.page(page)
    except (EmptyPage, InvalidPage):
        # todo: better raise a redirect
        if page != 1:
            entries = paginator.page(paginator.num_pages)
    return entries

def list_app_buttons(request, app_name, days=30, template_name='tbutton_maker/app_list.html'):
    app_data = config.get("applications_data")
    if app_name not in app_data:
        for key, items in app_data.iteritems():
            if app_name.lower() in [item[0].lower() for item in items]:
                app_name = key
                break
        else:
            raise Http404
    time = datetime.datetime.now() - datetime.timedelta(days)
    buttons = Button.objects.filter(session__time__gt=time)
    stats = dict((item["name"], item["downloads"]) for item in buttons.values('name').annotate(downloads=Count('name')).order_by("-downloads"))
    def button_key(item):
        return 0 - stats.get(item[0], 0)
    data = index(request, applications=app_name, template_name=None)
    data["button_data"].sort(key=button_key)
    data["entries"] = page_it(request, data["button_data"])
    data["application"] = app_name
    return render(request, template_name, data)
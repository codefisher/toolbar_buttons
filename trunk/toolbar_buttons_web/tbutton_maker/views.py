# Create your views here.

import os
import re
import operator
import io
import datetime
import hashlib
import json

from django.contrib.sites.models import Site
from django.shortcuts import render, redirect, get_object_or_404
from django.conf import settings
from django.http import HttpResponseNotFound, HttpResponse, Http404, QueryDict, HttpResponseRedirect
from django.views.decorators.csrf import csrf_protect
from django.core.urlresolvers import reverse
from django.db.models import Count
from django.utils.html import escape
from django.core.paginator import Paginator, InvalidPage, EmptyPage
from django.views.decorators.csrf import csrf_exempt
from django.db.models import F

from toolbar_buttons.config.settings import config
from toolbar_buttons.builder import button, locales, util, build, custombutton
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
                        print "Button %s lacks description" % button_id
              
    def get_source_folder(self, button):
        return self._source_folder[button] 

    def description(self, button):
        return self._description.get(button)
    
def get_buttons_obj(extension_settings, applications="all", buttons_ids="all"):
    button_folders, buttons = util.get_button_folders(buttons_ids, extension_settings)
    for name, use_setting in (('staging', 'use_staging'), ('pre', 'use_pre')):
        if extension_settings.get(use_setting):
            staging_button_folders, staging_buttons = util.get_button_folders(buttons_ids, extension_settings, name)
            button_folders.extend(staging_button_folders)
            buttons.extend(staging_buttons)
    return WebButton(button_folders, buttons, extension_settings, applications)
    
SETTINGS = dict(config)
SETTINGS["project_root"] = settings.TBUTTON_DATA

def create_locales():
    locale_folder, locale = util.get_locale_folders("all", SETTINGS)
    return locales.Locale(SETTINGS, locale_folder, locale, load_properites=False)

LOCALE = create_locales()
BUTTONS = get_buttons_obj(SETTINGS)

def locale_str_getter(locale_name):
    return BUTTONS.locale_string(button_locale=LOCALE, locale_name=locale_name)

def list_buttons(request, locale_name=None, applications=None, template_name='tbutton_maker/list.html'):
    return index(request, locale_name, applications, template_name)

def button_key(item):
    return item[2].lower() if item[2] else None

def get_local_data(extension_settings):
    locale_meta = LOCALE
    local_data = []
    for locales_name in locale_meta.get_locales():
        local_data.append((locales_name, locale_meta.get_dtd_value(locales_name, 'name'), locale_meta.get_dtd_value(locales_name, 'native_name'), locale_meta.get_dtd_value(locales_name, 'country')))
    local_data.sort(key=button_key)
    return local_data

def get_applications(request, applications=None):
    if applications == None:
        applications = request.GET.getlist('button-application')
    else:
        if ',' in applications:
            applications = applications.split(",")
        else:
            applications = applications.split("-")
    default_apps = set(SETTINGS["applications_data"].keys())
    applications = default_apps.intersection(applications)
    if not applications:
        applications = list(default_apps)
    return applications

def get_locale_name(request, locale_name=None):
    if locale_name == None:
        locale_name = request.GET.get('button-locale')
    if locale_name not in LOCALE.get_locales():
        locale_name = SETTINGS.get("default_locale")
    return locale_name

def lazy_button_list(applications, locale_str):
    applications = set(applications)
    def _func():
        button_data = []
        for button_id, apps in BUTTONS.button_applications().items():
            button_apps = applications.intersection(apps)
            if button_apps:
                button_data.append((button_id, sorted(list(button_apps)), locale_str("label", button_id),
                                    locale_str("tooltip", button_id), BUTTONS.get_icons(button_id),
                                    BUTTONS.description(button_id), BUTTONS.get_source_folder(button_id)))
        button_data.sort(key=button_key)
        return button_data
    return _func

def index(request, locale_name=None, applications=None, template_name='tbutton_maker/index.html'):
    locale_name = get_locale_name(request, locale_name)
    applications = get_applications(request, applications)
    locale_str = locale_str_getter(locale_name)
    button_data = lazy_button_list(applications, locale_str)
    local_data = get_local_data(SETTINGS)
    application_data = SETTINGS.get("applications_data")
    application_names = dict((key, [item[0] for item in value]) for key, value in application_data.iteritems())
    data = {
        "locale": locale_name,
        "all_applications": sorted(application_data.keys()),
        "applications": applications,
        "button_data": button_data,
        "buttons": request.GET.getlist('button'),
        "application_names": application_names,
        "local_data": local_data,
        "icon_sets": [(name, label) for name, (label, _) in settings.TBUTTON_ICONS.items()],
        "default_icons": settings.TBUTTON_DEFAULT_ICONS,
        "add_to_toolbar": request.GET.get('add-to-toolbar'),
        "offer_download": request.GET.get('offer-download'),
        "create_toolbars": request.GET.get('create-toolbars'),
        "channel": request.GET.get('channel', 'stable'),
        "create_menu": request.GET.get('create-menu'),
        "custom_button": 'custom_button' in request.GET,
        "icon_size": request.GET.get('icon-size', 'standard'),
    }
    if template_name is None:
        return data
    return render(request, template_name, data)

def buttons_page(request, button_id, locale_name=None):
    #try:
    locale_name = get_locale_name(request, locale_name)
    locale_str = locale_str_getter(locale_name)
    file_to_name = [(file_name, name) for file_name, name in SETTINGS.get("file_to_name").items() if file_name in BUTTONS._button_windows[button_id]]
    file_to_name.sort(key=lambda item: item[1].lower() if item[1] else None)
    local_data = get_local_data(SETTINGS)
    
    days = 30
    time = datetime.datetime.now() - datetime.timedelta(days)
    inner_qs = Button.objects.filter(name__in=[button_id], session__time__gt=time).values('session')
    results = Button.objects.filter(session__in=inner_qs).exclude(name__in=[button_id])
    stats = list(results.values('name').annotate(downloads=Count('name')).order_by("-downloads"))[0:5]
    for stat in stats:
        stat.update({
            "label": locale_str("label", stat["name"]),
            "tooltip": locale_str("tooltip", stat["name"]),
            "icon": BUTTONS.get_icons(stat["name"]),
        })
    data = {
        "button": button_id,
        "apps": sorted(list(BUTTONS.button_applications()[button_id])),
        "label": locale_str("label", button_id),
        "tooltip": locale_str("tooltip", button_id),
        "icon": BUTTONS.get_icons(button_id),
        "description": BUTTONS.description(button_id),
        "local_data": local_data,
        "locale": locale_name,
        "file_to_name": file_to_name,
        "related": stats,
    }
    #except:
    #    raise Http404
    return render(request, "tbutton_maker/button.html", data)

def create_custombutton(request):
    if request.method == 'post':
        button = request.POST.get("button")
        button_locale = request.POST.get("button-locale")
        window = request.POST.get("application-window")
    else:
        button = request.GET.get("button")
        button_locale = request.GET.get("button-locale")
        window = request.GET.get("application-window")
    if not window in BUTTONS._button_windows[button]:
        return redirect(reverse("tbutton-button", kwargs={"button_id": button, "locale_name": button_locale}))
    application = SETTINGS.get("file_to_application").get(window)[0]
    extension_settings = dict(SETTINGS)
    extension_settings.update({
        "icon": os.path.join(settings.TBUTTON_DATA, extension_settings.get("icon")),
    })
    url = custombutton.custombutton(extension_settings, application, window, button_locale, button)
    result = buttons_page(request, button, button_locale)
    response = HttpResponse(result.content, status=302)
    response['Location'] = url
    return response

def create_buttons(request, query, log_creation=True):
    buttons = query.getlist("button")
    locale = query.get("button-locale", "all")

    extension_settings = dict(SETTINGS)
    extension_settings.update({
        "show_updated_prompt": False,
        "icon": os.path.join(settings.TBUTTON_DATA, extension_settings.get("icon")),
        "licence": os.path.join(settings.TBUTTON_DATA, extension_settings.get("licence")),
        "buttons": buttons,
    })

    if not locale or query.get("include-all-locales") == "true":
        locale = "all"
        
    extension_settings["fix_meta"] = True
     
    if query.get("create-toolbars") == "true":
        if not query.get("add-to-toolbar") == "true":
            extension_settings["put_button_on_toolbar"] = True
        extension_settings["include_toolbars"] = -1
    else:
        extension_settings["include_toolbars"] = 0

    if query.get("create-menu") == "true":
        extension_settings["create_menu"] = True
        if len(buttons) == 1:
            extension_settings["as_submenu"] = False

    extension_settings["locale"] = "all" # always include everything
    applications = get_applications(request)
    extension_settings["applications"] = applications
    update_query = query.copy()
    #update_query["application"] = ",".join(applications)
    update_query.setlist('button-application', applications)
    update_query["locale"] = locale
    allowed_options = set(("button-application", "locale", "button", "create-menu", "create-toolbars", "icon-size", "channel"))
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
    if query.get("add-to-toolbar") == "true":
        extension_settings["add_to_main_toolbar"] = buttons
        extension_settings["current_version_pref"] = "current.version.%s" % extension_settings["chrome_name"]
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
        applications = "-".join(request.GET.getlist("button-application"))
        locale = request.GET.get("button-locale")
        kwargs = {}
        if locale:
            kwargs["locale_name"] = locale
        if applications:
            kwargs["applications"] = applications
        return redirect(reverse("tbutton-custom", kwargs=kwargs))
    return create_buttons(request, request.GET)


def statistics(request, days=30, template_name='tbutton_maker/statistics.html'):
    locale_str = locale_str_getter(None)
    time = datetime.datetime.now() - datetime.timedelta(days)
    buttons = Button.objects.filter(session__time__gt=time)
    sessions = DownloadSession.objects.filter(time__gt=time).count()
    stats = list(buttons.values('name').annotate(downloads=Count('name')).order_by("-downloads"))
    sum = buttons.count()
    applications = dict(BUTTONS.button_applications().items())
    total = 0
    found = set()
    for item in stats:
        try:
            found.add(item["name"])
            count = item["downloads"]
            total += count
            apps = list(applications.get(item["name"], ()))
            apps.sort()
            item.update({
                "applications": apps,
                "icon": BUTTONS.get_icons(item["name"]),
                "label": locale_str('label', item["name"]),
                "average": (float(count) / days),
                "percent": (float(count) / sum * 100),
                "total": (float(total) / sum * 100),
                "folder": BUTTONS.get_source_folder(item["name"]),
            })
        except:
            pass # if we change an id, this will happen, but we don't care
    for name in set(BUTTONS.buttons()).difference(found):
        apps = list(applications.get(name, ()))
        apps.sort()
        stats.append({
               "name": name,
               "downloads": 0,  
               "applications": apps,
               "icon": BUTTONS.get_icons(name),
               "label": locale_str('label', name),
               "average": 0,
               "percent": 0,
               "total": (float(total) / sum * 100),
               "folder": BUTTONS.get_source_folder(name),   
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
    version = SETTINGS.get("version")
    buttons = request.GET.getlist("button")
    applications = get_applications(request)
    args = request.GET.copy()
    args.setlist("button-application", applications)
    channel = request.GET.get("channel", "stable")
    if re.search(r'[a-z]+', version) and channel == "stable":
        app_data = None
    else:
        if "all" in applications:
            app_data = flat(SETTINGS.get("applications_data").values())
        else:
            app_data = flat([SETTINGS.get("applications_data").get(app) for app in applications])
    if channel == "nightly":
        version = "%s.r%s" %(version, util.get_reveision(SETTINGS))
    update_url = "https://%s%s?%s" % (Site.objects.get_current().domain,
            reverse("tbutton-make-button"), args.urlencode())
    
    data = {
        "applications": app_data,
        "version": version,
        "update_url": update_url,
        "extension_id": "%s@button.codefisher.org" % hashlib.md5("_".join(sorted(buttons))).hexdigest(),
    }

    return render(request, "tbutton_maker/update.rdf", data, content_type="application/xml+rdf")

def update_static(request):
    app_data = [item for sublist in SETTINGS.get("applications_data").values() for item in sublist]
    group = DownloadGroup.objects.get(identifier=SETTINGS.get("extension_id"))
    extension = ExtensionDownload.objects.get(pk=group.latest.pk)
    site = Site.objects.get_current()
    scheme = "https" if request.is_secure() else "http"
    data = {
        "applications": app_data,
        "version": SETTINGS.get("version"),
        "update_url": "%s://%s%s" % (scheme, site.domain, extension.get_absolute_url()),
        "extension_id": SETTINGS.get("extension_id"),
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
    app_data = SETTINGS.get("applications_data")
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
    data["entries"] = page_it(request, sorted(data["button_data"](), key=button_key))
    data["application"] = app_name
    return render(request, template_name, data)

def installed(request, mode, version):
    tbutton = get_object_or_404(ExtensionDownload, version=version, group__identifier='{03B08592-E5B4-45ff-A0BE-C1D975458688}')
    template_name = "tbutton_maker/%s.html" % mode
    compatibility = [(settings.MOZ_APP_NAMES.get(compat.app_id), compat.min_version, compat.max_version)
                              for compat in tbutton.compatibility.all() if compat.app_id in settings.MOZ_APP_NAMES]
    compatibility.sort()
    def previous_notes(release):
        while release.previous_release and release.previous_release.release_notes:
            release = release.previous_release
            yield release
    return render(request, template_name, {"tbutton": tbutton, "previous": previous_notes(tbutton), "compatibility": compatibility})

def homepage(request):
    tbutton = ExtensionDownload.objects.select_related('group').get(group__identifier='{03B08592-E5B4-45ff-A0BE-C1D975458688}', group__latest=F('pk'))
    compatibility = [(settings.MOZ_APP_NAMES.get(compat.app_id), compat.min_version, compat.max_version)
                              for compat in tbutton.compatibility.all() if compat.app_id in settings.MOZ_APP_NAMES]
    compatibility.sort()
    return render(request, "tbutton_maker/homepage.html", {"tbutton": tbutton, "compatibility": compatibility})

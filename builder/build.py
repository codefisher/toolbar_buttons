"""Takes some settings in the build_extension and creates a Toolbar Buttons
   extension from it"""

import os
import zipfile
import io
from locales import Locale
from button import Button, get_image
from util import get_button_folders, get_locale_folders, get_folders
from app_versions import get_app_versions
import codecs
from collections import defaultdict

def bytes_string(string):
    if type(string) == unicode:
        return str(string.encode("utf-8"))
    return string

def apply_max_version(settings):
    versions = get_app_versions()
    app_data = settings.get("applications_data")
    for key, app_set in app_data.iteritems():
        rows = []
        for item in app_set:
            item = list(item)
            item[3] = versions.get(item[1], item[3])
            rows.append(item)
        app_data[key] = rows


def get_buttons(settings, cls=Button):
    if "all" in settings.get("applications", "all"):
        applications = settings.get("applications_data").keys()
    elif isinstance(settings.get("applications"), basestring):
        if "," in settings.get("applications"):
            applications = settings.get("applications").split(',')
        else:
            applications = settings.get("applications").split('-')
    else:
        applications = settings.get("applications")
    button_list = settings.get("buttons")
    button_folders, button_names = [], []
    for name, use_setting in ('data', 'use_data'), ('staging', 'use_staging'), ('pre', 'use_pre'):
        if settings.get(use_setting):
            staging_button_folders, staging_buttons = get_folders(button_list, settings, name)
            button_folders.extend(staging_button_folders)
            button_names.extend(staging_buttons)
    
    buttons = cls(button_folders, button_names, settings, applications)
    return buttons

def build_extension(settings, output=None, project_root=None):
    if os.path.join(settings.get("image_path")) is None:
        print "Please set the image_path setting"
        return
    if settings.get("lookup_max_versions"):
        apply_max_version(settings)
    locale_folders, locales = get_locale_folders(settings.get("locale"), settings)
    button_locales = Locale(settings, locale_folders, locales, all_files=True)
    options_locales = button_locales #Locale(settings, locale_folders, locales, all_files=True)
    buttons = get_buttons(settings)

    xpi_file_name = os.path.join(settings.get("project_root"), settings.get("output_folder"), settings.get("output_file", "toolbar_buttons.xpi") % settings)
    if output:
        xpi = zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED)
    else:
        xpi = zipfile.ZipFile(xpi_file_name, "w", zipfile.ZIP_DEFLATED)
        
    for file, data in buttons.get_js_files().iteritems():
        xpi.writestr(os.path.join("chrome", "content", file + ".js"),
                data.replace("{{uuid}}", settings.get("extension_id")))

    if settings.get('restartless'):
        for file, data in buttons.get_jsm_files().iteritems():
            xpi.writestr(os.path.join("chrome", "content", file + ".jsm"), bytes_string(data))
    else:
        for file, data in buttons.get_xul_files().iteritems():
            xpi.writestr(os.path.join("chrome", "content", file + ".xul"), bytes_string(data)) 

    locale_prefix = settings.get("locale_file_prefix")    
    if settings.get('restartless'):
        dtd_data = button_locales.get_dtd_data(buttons.get_locale_strings(), buttons, untranslated=False, format="%s=%s")
        for locale, data in dtd_data.iteritems():
            data = data.replace("&amp;", "&").replace("&apos;", "'")
            xpi.writestr(os.path.join("chrome", "locale", locale, "%sbutton_labels.properties" % locale_prefix), bytes_string(data))
    else:
        dtd_data = button_locales.get_dtd_data(buttons.get_locale_strings(), buttons, untranslated=False)
        for locale, data in dtd_data.iteritems():
            xpi.writestr(os.path.join("chrome", "locale", locale, "%sbutton.dtd" % locale_prefix), bytes_string(data))
    locales_inuse = set(dtd_data.keys())
    extra_strings = button_locales.get_dtd_data(buttons.get_extra_locale_strings(), buttons)
    if extra_strings[settings.get("default_locale")]:
        for locale, data in extra_strings.iteritems():
            if locale in locales_inuse:
                xpi.writestr(os.path.join("chrome", "locale", locale, "%sfiles.dtd" % locale_prefix), bytes_string(data))
    if settings.get("include_local_meta"):
        for locale, (path, data) in button_locales.get_meta().iteritems():
            xpi.writestr(os.path.join("chrome", "locale", locale, "meta.dtd"), data)
    properties_data = button_locales.get_properties_data(buttons.get_properties_strings(), buttons)
    if properties_data[settings.get("default_locale")]:
        for locale, data in properties_data.iteritems():
            if locale in locales_inuse:
                xpi.writestr(os.path.join("chrome", "locale", locale, "%sbutton.properties" % locale_prefix), bytes_string(data))
    for name, path in buttons.get_extra_files().iteritems():
        with open(path) as fp:
            xpi.writestr(os.path.join("chrome", "content", "files", name), 
                         fp.read().replace("{{chrome-name}}", settings.get("chrome_name"))
                            .replace("{{locale_file_prefix}}", settings.get("locale_file_prefix")))
    resources = buttons.get_resource_files()
    has_resources = bool(resources)
    for name, path in resources.iteritems():
        xpi.write(path, os.path.join("chrome", "content", "resources", name))

    options = buttons.get_options()
    for file, data in options.iteritems():
        xpi.writestr(os.path.join("chrome", "content", "%s.xul" % file), data)
    for image in buttons.get_option_icons():
        xpi.write(get_image(settings, "32", image), os.path.join("chrome", "skin", "option", image))
    if options:
        options_strings = buttons.get_options_strings()
        for locale, data in options_locales.get_dtd_data(options_strings, buttons).iteritems():
            if locale in locales_inuse:
                xpi.writestr(os.path.join("chrome", "locale", locale, "%soptions.dtd" % locale_prefix), bytes_string(data))
    option_applicaions = buttons.get_options_applications()

    css, image_list, image_data = buttons.get_css_file()
    icon_sizes = set(buttons.get_icon_size().values())
    xpi.writestr(os.path.join("chrome", "skin", "button.css"), bytes(css))
    for image in set(image_list):
        for size in icon_sizes:
            if size is not None:
                try:
                    xpi.write(get_image(settings, size, image), os.path.join("chrome", "skin", size, image))
                except (OSError, IOError):
                    xpi.write(get_image(settings, size, "picture-empty.png"), os.path.join("chrome", "skin", size, image))
                    print "can not find file %s" % image
    for file_name, data in image_data.iteritems():
        xpi.writestr(os.path.join("chrome", file_name), data)
    
    if settings.get("fix_meta"):
        locale_str = buttons.locale_string(button_locale=button_locales, locale_name=locales[0] if len(locales) == 1 else None)
        labels = sorted([locale_str("label", button) for button in buttons.buttons()], key=unicode.lower)
        settings["description"] = "A customized version of Toolbar Buttons including the buttons: %s" % ", ".join(labels)

    if settings.get("fix_meta") and len(buttons) == 1:
        button = buttons.buttons()[0]
        settings["name"] = "%s Button" % labels[0]
        settings["description"] = buttons.get_description(button)
        xpi.write(get_image(settings, "32", buttons.get_icons(button)), "icon.png")
    else:
        xpi.write(os.path.join(settings.get("project_root"), settings.get("icon")), "icon.png")
    xpi.writestr("chrome.manifest", create_manifest(settings, locales, buttons, has_resources, option_applicaions))
    xpi.writestr("install.rdf", create_install(settings, buttons.get_suported_applications(), option_applicaions))
    if settings.get('restartless'):
        xpi.writestr("bootstrap.js", create_bootstrap(settings, buttons, has_resources))
        xpi.write(os.path.join(settings.get("project_root"), "files", "customizable.jsm"), 
                  os.path.join("chrome", "content", "customizable.jsm"))
    xpi.write(os.path.join(settings.get("project_root"), settings.get("licence")), "LICENCE")
    defaults =  buttons.get_defaults()
    if defaults:
        if settings.get('restartless'):
            xpi.writestr(os.path.join("chrome", "content", "defaultprefs.js"), defaults)   
        else:
            xpi.writestr(os.path.join("defaults", "preferences", "toolbar_buttons.js"), defaults)
    xpi.close()
    if not output and settings.get("profile_folder"):
        with open(xpi_file_name, "r") as xpi_fp:
            data = xpi_fp.read()
            for folder in settings.get("profile_folder"):
                try:
                    with open(os.path.join(folder, settings.get("output_folder"),
                        settings.get("extension_id") + ".xpi"), "w") as fp:
                        fp.write(data)
                except IOError:
                    print("Failed to write extension to profile folder")
    return buttons, button_locales

def create_bootstrap(settings, buttons, has_resources):
    chrome_name = settings.get("chrome_name")
    loaders = []
    resource = ""
    if has_resources:
        resource = "createResource('%s', 'chrome://%s/content/resources/');" % (chrome_name, chrome_name)
    install = ""
    window_modules = defaultdict(list)
    for file_name in buttons.get_file_names():
        for overlay in settings.get("files_to_window").get(file_name, ()):
            window_modules[overlay].append(file_name)
            
    for overlay, modules in window_modules.items():
            mods = "\n\t\t".join(["modules.push('chrome://%s/content/%s.jsm');" % (chrome_name, file_name) for file_name in modules])
            loaders.append("(uri == '%s') {\n\t\t%s\n\t}" % (overlay, mods))
    template = open(os.path.join(settings.get("project_root"), "files", "bootstrap.js") ,"r").read()
    if settings.get("show_updated_prompt"):
        install = (open(os.path.join(settings.get("project_root"), "files", "install.js") ,"r").read()
                            .replace("{{homepage_url}}", settings.get("homepage"))
                            .replace("{{version}}", settings.get("version"))
                            .replace("{{pref_root}}", settings.get("pref_root"))
                            .replace("{{current_version_pref}}", settings.get("current_version_pref")))
    return (template.replace("{{chrome-name}}", settings.get("chrome_name"))
                    .replace("{{resource}}", resource)
                    .replace("{{install}}", install)
                    .replace("{{loaders}}", "if" + " else if".join(loaders)))

def create_manifest(settings, locales, buttons, has_resources, options=[]):
    lines = []
    values = {"chrome": settings.get("chrome_name"), "jar": settings.get("jar_file")}

    lines.append("content\t%(chrome)s\tchrome/content/" % values)
    lines.append("skin\t%(chrome)s\tclassic/1.0\t"
                 "chrome/skin/" % values)
    if not settings.get('restartless'):
        lines.append("style\tchrome://global/content/customizeToolbar.xul"
                 "\tchrome://%(chrome)s/skin/button.css" % values)

    lines.append("content\t%(chrome)s-root\t./" % values)
    lines.append("skin\t%(chrome)s-root\tclassic/1.0\t./" % values)

    lines.append("override\tchrome://%(chrome)s/skin/icon.png\t"
                 "chrome://%(chrome)s-root/skin/icon.png" % values)
    if has_resources and not settings.get('restartless'):
        lines.append("resource\t%(chrome)s\tchrome://%(chrome)s/content/resources/" % values)
    for option in options:
        values["application"] = option
        for _, application_id, _, _ in settings.get("applications_data")[option]:
            values["id"] = application_id
            lines.append("override\tchrome://%(chrome)s/content/options.xul\t"
                         "chrome://%(chrome)s/content/%(application)s"
                         "-options.xul\tapplication=%(id)s" % values)

    if not settings.get('restartless'):
        for file_name in buttons.get_file_names():
            values["file"] = file_name
            for overlay in settings.get("files_to_overlay").get(file_name, ()):
                values["overlay"] = overlay
                lines.append("overlay\t%(overlay)s\t"
                             "chrome://%(chrome)s/content/%(file)s.xul" % values)
    manifest = buttons.get_manifest()
    if manifest:
        lines.append(manifest % values)

    for locale in locales:
        values["locale"] = locale
        lines.append("locale\t%(chrome)s\t%(locale)s"
                     "\tchrome/locale/%(locale)s/" % values)
    return "\n".join(lines)

def create_install(settings, applications, options=[]):
    """Creates the install.rdf file for the extension"""
    if options:
        options_url = ("\t\t<em:optionsURL>chrome://%s/content/options.xul"
                       "</em:optionsURL>\n" % settings.get("chrome_name"))
    else:
        options_url = ""
    if settings.get("restartless"):
        bootstrap = "<em:bootstrap>true</em:bootstrap>"
    else:
        bootstrap = ""
    if settings.get("update_url"):
        update_url = bytes_string("\t\t<em:updateURL>%s</em:updateURL>\n" % settings.get("update_url"))
    else:
        update_url = ""
    supported_applications = []
    for application in applications:
        for values in settings.get("applications_data")[application]:
            supported_applications.append("""
        \t\t<!-- %s -->
        \t\t<em:targetApplication>
            \t\t\t<Description>
                \t\t\t\t<em:id>%s</em:id>
                \t\t\t\t<em:minVersion>%s</em:minVersion>
                \t\t\t\t<em:maxVersion>%s</em:maxVersion>
            \t\t\t</Description>
        \t\t</em:targetApplication>""".replace(" ","") % tuple(values))
    template = codecs.open(os.path.join(settings.get("project_root"), "files", "install.rdf"),"r", encoding='utf-8').read()
    return bytes_string(template.replace("{{uuid}}", settings.get("extension_id"))
                    .replace("{{name}}", settings.get("name"))
                    .replace("{{version}}", settings.get("version"))
                    .replace("{{description}}", settings.get("description"))
                    .replace("{{creator}}", settings.get("creator"))
                    .replace("{{chrome-name}}", settings.get("chrome_name"))
                    .replace("{{homepageURL}}", settings.get("homepage"))
                    .replace("{{optionsURL}}", options_url)
                    .replace("{{bootstrap}}", bootstrap)
                    .replace("{{updateUrl}}", update_url)
                    .replace("{{applications}}",
                             "".join(supported_applications))
            )

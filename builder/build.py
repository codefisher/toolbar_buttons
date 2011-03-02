"""Takes some settings in the build_extension and creates a Toolbar Buttons
   extension from it"""

import os
import zipfile
import io
from locales import Locale
from button import Button, get_image
from util import get_button_folders, get_locale_folders, get_folders

def bytes_string(string):
    if type(string) == unicode:
        return str(string.decode("utf-8"))
    return string

def build_extension(settings, output=None, project_root=None):
    if os.path.join(settings.get("image_path")) is None:
        print "Please set the image_path setting"
        return
    locale_folders, locales = get_locale_folders(settings.get("locale"), settings)
    button_locales = Locale(settings, locale_folders, locales)
    options_locales = Locale(settings, locale_folders, locales, True)

    if settings.get("applications", "all") == "all":
        applications = settings.get("applications_data").keys()
    elif isinstance(settings.get("applications"), basestring):
        applications = settings.get("applications").split(',')
    else:
        applications = settings.get("applications")
    button_list = settings.get("buttons")
    button_folders, button_names = get_button_folders(button_list, settings)
    if settings.get("use_staging"):
        staging_button_folders, staging_buttons = get_folders(button_list, settings, "staging")
        button_folders.extend(staging_button_folders)
        button_names.extend(staging_buttons)
    buttons = Button(button_folders, button_names, settings, applications)

    jar_file = io.BytesIO()
    jar = zipfile.ZipFile(jar_file, "w", zipfile.ZIP_STORED)
    #write files to jar
    for file, data in buttons.get_js_files().iteritems():
        jar.writestr(os.path.join("content", file + ".js"),
                data.replace("{{uuid}}", settings.get("extension_id")))

    for file, data in buttons.get_xul_files().iteritems():
        jar.writestr(os.path.join("content", file + ".xul"), bytes_string(data))

    for locale, data in button_locales.get_dtd_data(buttons.get_locale_strings(), buttons).iteritems():
        jar.writestr(os.path.join("locale", locale, "button.dtd"), data)
    if settings.get("include_local_meta"):
        for locale, (path, data) in button_locales.get_meta().iteritems():
            jar.writestr(os.path.join("locale", locale, "meta.dtd"), data)
    for locale, data in button_locales.get_properties_data(buttons.get_properties_strings(), buttons).iteritems():
        jar.writestr(os.path.join("locale", locale, "button.properties"), data)
    for name, path in buttons.get_extra_files().iteritems():
        with open(path) as fp:
            jar.writestr(os.path.join("content", name), fp.read().replace("{{chrome-name}}", settings.get("chrome_name")))
    resources = buttons.get_resource_files()
    has_resources = bool(resources)
    for name, path in resources.iteritems():
        jar.write(path, os.path.join("resources", name))

    for file, data in buttons.get_options().iteritems():
        jar.writestr(os.path.join("content", "%s.xul" % file), data)
    options_strings = buttons.get_options_strings()
    if options_strings:
        for locale, data in options_locales.get_dtd_data(options_strings, buttons).iteritems():
            jar.writestr(os.path.join("locale", locale, "options.dtd"), bytes_string(data))
    option_applicaions = buttons.get_options_applications()

    css, image_list, image_data = buttons.get_css_file()
    small, large = settings.get("icon_size")
    jar.writestr(os.path.join("skin", "button.css"), bytes(css))
    for image in set(image_list):
        if small is not None:
            try:
                jar.write(get_image(settings, small, image), os.path.join("skin", small, image))
            except (OSError, IOError):
                jar.write(os.path.join(settings.get("project_root"), "files", "default16.png"), os.path.join("skin", small, image))
                print "can not find file %s" % image
        try:
            jar.write(get_image(settings, large, image), os.path.join("skin", large, image))
        except (OSError, IOError):
            jar.write(os.path.join(settings.get("project_root"), "files", "default24.png"), os.path.join("skin", large, image))
            #print "can not find file %s" % image
    for file_name, data in image_data.iteritems():
        jar.writestr(file_name, data)
    jar.close()
    if settings.get("profile_folder"):
        with open(os.path.join(settings.get("profile_folder"), "extensions",
                settings.get("extension_id"), "chrome", settings.get("jar_file")), "w") as fp:
            fp.write(jar_file.getvalue())
    if output:
        xpi = zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED)
    else:
        file_name = os.path.join(settings.get("output_folder"), settings.get("output_file", "toolbar_buttons.xpi") % settings)
        xpi = zipfile.ZipFile(file_name, "w", zipfile.ZIP_DEFLATED)
    xpi.writestr(os.path.join("chrome", settings.get("jar_file")), jar_file.getvalue())
    jar_file.close()

    xpi.writestr("chrome.manifest", create_manifest(settings, locales, buttons, has_resources, option_applicaions))
    xpi.writestr("install.rdf", create_install(settings, buttons.get_suported_applications(), option_applicaions))
    xpi.write(settings.get("icon"), "icon.png")
    xpi.write(settings.get("licence"), "LICENCE")
    xpi.writestr(os.path.join("defaults", "preferences", "toolbar_buttons.js"),
                 buttons.get_defaults())
    xpi.close()
    return buttons, button_locales

def create_manifest(settings, locales, buttons, has_resources, options=[]):
    lines = []
    values = {"chrome": settings.get("chrome_name"), "jar": settings.get("jar_file")}

    lines.append("content\t%(chrome)s\tjar:chrome/%(jar)s!/content/" % values)
    lines.append("skin\t%(chrome)s\tclassic/1.0\t"
                 "jar:chrome/%(jar)s!/skin/" % values)
    lines.append("style\tchrome://global/content/customizeToolbar.xul"
                 "\tchrome://%(chrome)s/skin/button.css" % values)

    lines.append("content\t%(chrome)s-root\t./" % values)
    lines.append("skin\t%(chrome)s-root\tclassic/1.0\t./" % values)

    lines.append("override\tchrome://%(chrome)s/skin/icon.png\t"
                 "chrome://%(chrome)s-root/skin/icon.png" % values)
    if has_resources:
        lines.append("resource\t%(chrome)s\tjar:chrome/%(jar)s!/resources/" % values)
    for option in options:
        values["application"] = option
        for _, application_id, _, _ in settings.get("applications_data")[option]:
            values["id"] = application_id
            lines.append("overlay\tchrome://%(chrome)s/content/options.xul\t"
                         "chrome://%(chrome)s/content/%(application)s"
                         "-options.xul\tapplication=%(id)s" % values)

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
                     "\tjar:chrome/%(jar)s!/locale/%(locale)s/" % values)
    return "\n".join(lines)

def create_install(settings, applications, options=[]):
    """Creates the install.rdf file for the extension"""
    if options:
        options_url = ("\t\t<em:optionsURL>chrome://%s/content/options.xul"
                       "</em:optionsURL>\n" % settings.get("chrome_name"))
    else:
        options_url = ""
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
        \t\t</em:targetApplication>""".replace(" ","") % values)
    template = open(os.path.join(settings.get("project_root"), "files", "install.rdf") ,"r").read()
    return (template.replace("{{uuid}}", settings.get("extension_id"))
                    .replace("{{name}}", settings.get("name"))
                    .replace("{{version}}", settings.get("version"))
                    .replace("{{description}}", settings.get("description"))
                    .replace("{{creator}}", settings.get("creator"))
                    .replace("{{chrome-name}}", settings.get("chrome_name"))
                    .replace("{{homepageURL}}", settings.get("homepage"))
                    .replace("{{optionsURL}}", options_url)
                    .replace("{{updateUrl}}", update_url)
                    .replace("{{applications}}",
                             "".join(supported_applications))
            )

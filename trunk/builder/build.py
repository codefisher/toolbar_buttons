"""Takes some settings in the build_extension and creates a Toolbar Buttons
   extension from it"""

import os
import zipfile
import StringIO
from locales import Locale
from button import Button
from util import get_button_folders, get_locale_folders

def build_extension(settings):
    locale_folders, locales = get_locale_folders(settings.LOCALE)
    button_locales = Locale(settings, locale_folders, locales)
    options_locales = Locale(settings, locale_folders, locales, True)

    if settings.APPLICATIONS == "all":
        applications = settings.APPLICATIONS_DATA.keys()
    else:
        applications = settings.APPLICATIONS.split(',')

    button_folders, buttons = get_button_folders(settings.BUTTONS)
    buttons = Button(button_folders, buttons, settings, applications)

    jar_file = StringIO.StringIO()
    jar = zipfile.ZipFile(jar_file, "w", zipfile.ZIP_STORED)
    #write files to jar
    for file, data in buttons.get_js_files().iteritems():
        jar.writestr(os.path.join("content", file + ".js"), data)

    for file, data in buttons.get_xul_files().iteritems():
        jar.writestr(os.path.join("content", file + ".xul"), data)

    for locale, data in button_locales.get_dtd_data(buttons.get_locale_strings()).iteritems():
        jar.writestr(os.path.join("locale", locale, "button.dtd"), data)

    for locale, data in button_locales.get_properties_data(buttons.get_properties_strings()).iteritems():
        jar.writestr(os.path.join("locale", locale, "button.properties"), data)

    options_strings = buttons.get_options_strings()
    if options_strings:
        for locale, data in options_locales.get_dtd_data(options_strings).iteritems():
            jar.writestr(os.path.join("locale", locale, "options.dtd"), data)
    for file, data in buttons.get_options().iteritems():
        jar.writestr(os.path.join("content", "%s.xul" % file), data)
    option_applicaions = buttons.get_options_applications()

    css, image_list, image_data = buttons.get_css_file()
    small, large = settings.ICON_SIZE
    jar.writestr(os.path.join("skin", "button.css"), css)
    for image in set(image_list):
        try:
            jar.write(os.path.join(settings.IMAGE_PATH, small, image), os.path.join("skin", small, image))
        except (OSError, IOError):
            print "can not find file %s" % image
        try:
            jar.write(os.path.join(settings.IMAGE_PATH, large, image), os.path.join("skin", large, image))
        except (OSError, IOError):
            print "can not find file %s" % image
    for file_name, data in image_data.iteritems():
        jar.writestr(file_name, data)
    jar.close()

    xpi = zipfile.ZipFile(settings.OUTPUT, "w", zipfile.ZIP_DEFLATED)
    xpi.writestr(os.path.join("chrome", settings.JAR_FILE), jar_file.getvalue())
    jar_file.close()

    xpi.writestr("chrome.manifest", create_manifest(settings, locales, buttons, option_applicaions))
    xpi.writestr("install.rdf", create_install(settings, buttons.get_suported_applications(), option_applicaions))
    xpi.write(settings.ICON, "icon.png")
    xpi.write(settings.LICENCE, "LICENCE")
    xpi.writestr(os.path.join("defaults", "preferences", "toolbar_buttons.js"),
                 buttons.get_defaults())

    xpi.close()

def create_manifest(settings, locales, buttons, options=[]):
    lines = []
    values = {"chrome": settings.CHROME_NAME, "jar": settings.JAR_FILE}

    lines.append("content\t%(chrome)s\tjar:chrome/%(jar)s!/content/" % values)
    lines.append("skin\t%(chrome)s\tclassic/1.0\t"
                 "jar:chrome/%(jar)s!/skin/" % values)
    lines.append("style\tchrome://global/content/customizeToolbar.xul"
                 "\tchrome://%(chrome)s/skin/button.css" % values)

    lines.append("skin\t%(chrome)s-icon\tclassic/1.0\t./" % values)
    lines.append("override chrome://%(chrome)s/skin/icon.png "
                 "chrome://%(chrome)s-icon/skin/icon.png" % values)

    for option in options:
        values["application"] = option
        for _, application_id, _, _ in settings.APPLICATIONS_DATA[option]:
            values["id"] = application_id
            lines.append("overlay\tchrome://%(chrome)s/content/options.xul\t"
                         "chrome://%(chrome)s/content/%(application)s"
                         "-options.xul\tapplication=%(id)s" % values)

    for file_name in buttons.get_file_names():
        values["file"] = file_name
        for overlay in settings.FILES_TO_OVERLAY[file_name]:
            values["overlay"] = overlay
            lines.append("overlay\t%(overlay)s\t"
                         "chrome://%(chrome)s/content/%(file)s.xul" % values)

    for locale in locales:
        values["locale"] = locale
        lines.append("locale\t%(chrome)s\t%(locale)s"
                     "\tjar:chrome/%(jar)s!/locale/%(locale)s/" % values)
    return "\n".join(lines)

def create_install(settings, applications, options=[]):
    """Creates the install.rdf file for the extension"""
    if options:
        options_url = ("<em:optionsURL>chrome://%s/content/options.xul"
                       "</em:optionsURL>" % settings.CHROME_NAME)
    else:
        options_url = ""
    supported_applications = []
    for application in applications:
        for values in settings.APPLICATIONS_DATA[application]:
            supported_applications.append("""
        <!-- %s -->
        <em:targetApplication>
            <Description>
                <em:id>%s</em:id>
                <em:minVersion>%s</em:minVersion>
                <em:maxVersion>%s</em:maxVersion>
            </Description>
        </em:targetApplication>""" % values)
    template = open(os.path.join("files", "install.rdf") ,"r").read()
    return (template.replace("{{uuid}}", settings.EXTENSION_ID)
                    .replace("{{name}}", settings.NAME)
                    .replace("{{version}}", settings.VERSION)
                    .replace("{{description}}", settings.DESCRIPTION)
                    .replace("{{creator}}", settings.CREATOR)
                    .replace("{{chrome-name}}", settings.CHROME_NAME)
                    .replace("{{homepageURL}}", settings.HOMEPAGE)
                    .replace("{{optionsURL}}", options_url)
                    .replace("{{applications}}",
                             "\n".join(supported_applications))
            )

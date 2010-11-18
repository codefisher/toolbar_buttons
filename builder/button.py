import os
import re
from collections import defaultdict

class Button():
    def __init__(self, folders, buttons, settings, applications):
        self._folders = folders
        self._buttons = buttons
        self._settings = settings
        self._applications = applications
        self._suported_applications = set()
        self._button_applications = defaultdict(set)
        self._button_files = set()
        self._button_xul = defaultdict(dict)
        self._button_js = defaultdict(list)
        self._button_image = defaultdict(list)
        self._properties_strings = set()
        self._preferences = {}
        self._button_options = {}
        self._button_options_js = {}
        self._option_applications = set()

        self._button_js["button"].append("") # we always want this file

        button_files = self._settings.FILE_TO_APPLICATION.keys()
        button_files.sort()
        group_files = self._settings.FILE_MAP.keys()
        group_files.sort()
        button_files = list(set(button_files).difference(group_files))

        for folder, button in zip(self._folders, self._buttons):
            files = os.listdir(folder)
            button_wanted = False

            #file that belong to more then one window
            for group_name in group_files:
                xul_file = group_name + ".xul"
                if xul_file in files:
                    for file_name in self._settings.FILE_MAP[group_name]:
                        if (self._settings.FILE_TO_APPLICATION[file_name]
                                in self._applications):
                            self._process_xul_file(folder, button,
                                                   xul_file, file_name)
                            button_wanted = True
            #single window files
            for file_name in button_files:
                xul_file = file_name + ".xul"
                if (xul_file in files
                        and self._settings.FILE_TO_APPLICATION[file_name]
                            in self._applications):
                    self._process_xul_file(folder, button, xul_file, file_name)
                    button_wanted = True

            if not button_wanted:
                continue

            for file_name in (button_files + group_files):
                js_file = file_name + ".js"
                if (js_file in files
                    and (file_name == "button"
                         or self._settings.FILE_TO_APPLICATION[file_name]
                            in self._applications)):
                    self._button_js[file_name].append(
                                open(os.path.join(folder, js_file)).read())

            if "image" in files:
                images = open(os.path.join(folder, "image"), "r")
                for line in images:
                    name, _, modifier = line.partition(" ")
                    self._button_image[button].append((name.strip(),
                                                       modifier.strip()))
            else:
                raise ValueError("%s does not contain image listing." % folder)

            if "preferences" in files:
                preferences = open(os.path.join(folder, "preferences"), "r")
                for line in preferences:
                    name, value = line.split(":")
                    self._preferences[name] = value

            if "option.xul" in files:
                self._button_options[button] = open(os.path.join(folder, "option.xul"), "r").read()

            if "option.js" in files:
                self._button_options_js[button] = open(os.path.join(folder, "option.js"), "r").read()

    def _process_xul_file(self, folder, button, xul_file, file_name):
        application = self._settings.FILE_TO_APPLICATION[file_name]
        self._suported_applications.add(application)
        self._button_files.add(file_name)
        self._button_applications[button].add(
                                self._settings.FILE_TO_APPLICATION[file_name])
        self._button_xul[file_name][button] = open(
                                        os.path.join(folder, xul_file)).read()

    def get_options(self):
        result = {}
        if self._button_options_js:
            javascript = ("""<script type="application/x-javascript" src="chrome://%s/content/button.js"/>"""
                          """<script type="application/x-javascript" src="chrome://%s/content/option.js"/>"""
                          % (self._settings.CHROME_NAME, self._settings.CHROME_NAME))
        else:
            javascript = ""
        base_window = (open(os.path.join("files", "options.xul"), "r").read()
                       .replace("{{chrome-name}}", self._settings.CHROME_NAME)
                       .replace("{{javascript}}", javascript))
        result["options"] = base_window
        overlay_window = (open(os.path.join("files", "option.xul"), "r").read()
                       .replace("{{chrome-name}}", self._settings.CHROME_NAME))
        files = defaultdict(list)
        for button, data in self._button_options.iteritems():
            for application in self._button_applications[button]:
                self._option_applications.add(application)
                files[application].append(data)
        for application, data in files.iteritems():
            result["%s-options" % application] = overlay_window.replace("{{options}}",
                                    "\n\t\t".join(",\n".join(data).split("\n")))
        return result

    def get_options_applications(self):
        """Returns a list of applications with options

        precondition: get_options() has been called
        """
        return self._option_applications

    def get_file_names(self):
        return self._button_files

    def get_locale_strings(self):
        locale_match = re.compile("&([a-zA-Z0-9.-]*);")
        strings = []
        for _, buttons in self._button_xul.iteritems():
            for _, button in buttons.iteritems():
                strings.extend(locale_match.findall(button))
        strings = list(set(strings))
        strings.sort()
        return strings

    def get_options_strings(self):
        locale_match = re.compile("&([a-zA-Z0-9.-]*);")
        strings = []
        if self._button_options:
            strings.append("options.window.title")
        for value in self._button_options.itervalues():
            strings.extend(locale_match.findall(value))
        return strings

    def get_defaults(self):
        settings = []
        settings.append("""pref("extensions.%s.description","chrome://%s/locale/button.properties");"""
                        % (self._settings.EXTENSION_ID, self._settings.CHROME_NAME))
        if self._settings.SHOW_UPDATED_PROMPT:
            settings.append("""pref("extension.tbutton.current.version", "");""")
        for name, value in self._preferences.iteritems():
            settings.append("""pref("%s", %s);""" % (name, value))
        return "\n".join(settings)

    def get_css_file(self):
        image_list = []
        lines = ["""@namespace url("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul");"""]
        values = {"chrome_name": self._settings.CHROME_NAME}
        small, large = self._settings.ICON_SIZE
        for button, image_data in self._button_image.iteritems():
            values["id"] = button
            for image, modifier in image_data:
                values["image"] = image
                image_list.append(image)
                values["modifier"] = modifier
                values["size"] = large
                lines.append("""#%(id)s%(modifier)s {\n\tlist-style-image:"""
                             """url("chrome://%(chrome_name)s/skin/%(size)s/"""
                             """%(image)s") !important;\n}""" % values)
                values["size"] = small
                lines.append("""toolbar[iconsize='small'] #%(id)s%(modifier)s {\n\tlist-style-image: url("chrome://%(chrome_name)s/skin/%(size)s/%(image)s") !important;\n}""" % values)
        return "\n".join(lines), image_list

    def get_js_files(self):
        interface_match = re.compile("(?<=toolbar_button_interfaces.)[a-zA-Z]*")
        function_match = re.compile("^[a-zA-Z0-9_]*:\s*"
                                    "function\([^\)]*\)\s*{.*?^}",
                                    re.MULTILINE | re.DOTALL)
        function_name_match = re.compile("((^[a-zA-Z0-9_]*):\s*"
                                         "function\([^\)]*\)\s*{.*?^})",
                                          re.MULTILINE | re.DOTALL)
        include_match = re.compile("(?<=^#include )[a-zA-Z0-9_]*",
                                   re.MULTILINE)
        include_match_replace = re.compile("^#include [a-zA-Z0-9_]*\n?",
                                           re.MULTILINE)
        string_match = re.compile("StringFromName\(\"([a-zA-Z-]*)\"")

        multi_line_replace = re.compile("\n{2,}")
        js_files = defaultdict(str)
        js_files_end = {}
        js_includes = set()


        for file_name, js in self._button_js.iteritems():
            js_file = "\n".join(js)
            js_includes.update(include_match.findall(js_file))
            js_file = include_match_replace.sub("", js_file)

            js_files[file_name] = "\t" + "\n\t".join(
                        ",\n".join(function_match.findall(js_file)).split("\n"))
            js_files_end[file_name] = multi_line_replace.sub("\n",
                                        function_match.sub("", js_file).strip())
        js_functions = open(os.path.join("files", "functions.js"), "r").read()
        extra_functions = [function for function, name
                           in function_name_match.findall(js_functions)
                           if name in js_includes]
        js_extra_file = "\n\t".join(",\n".join(extra_functions).split("\n"))
        if js_files["button"]:
            js_files["button"] += ",\n\t" + js_extra_file
        else:
            js_files["button"] += js_extra_file
        for file_name in js_files_end:
            if file_name == "button":
                js_files[file_name] = ("var toolbar_buttons = {\n%s\n}\n%s"
                                    % (js_files[file_name],
                                       js_files_end[file_name]))
            else:
                js_files[file_name] = ("var toolbar_buttons_%s = {\n%s\n}\n"
                                       "toolbar_button_loader(toolbar_buttons, "
                                       "toolbar_buttons_%s)\n%s"
                                    % (file_name, js_files[file_name],
                                       file_name, js_files_end[file_name]))
        if self._button_options_js:
            js_files["option"] = ("var toolbar_buttons_option = {\n%s\n}\n"
                                  "toolbar_button_loader(toolbar_buttons, "
                                  "toolbar_buttons_opyion)"
                                  % "\n\t".join(",\n".join(
                                     self._button_options_js.values())
                                     .split("\n")))
        if self._settings.SHOW_UPDATED_PROMPT:
            show_update = (open(os.path.join("files", "update.js"), "r").read()
                           .replace("{{uuid}}", self._settings.EXTENSION_ID)
                           .replace("{{version_url}}",
                                    self._settings.VERSION_URL)
                           .replace("{{version}}",
                                    self._settings.VERSION)
                           )
            js_files["button"] = show_update + "\n" + js_files["button"]
        interfaces_data = open(os.path.join("files", "interfaces"), "r")
        interfaces = {}
        for line in interfaces_data:
            name, _ = line.split(":")
            interfaces[name] = line.strip()
        js_global_interfaces = set(interface_match.findall(js_files["button"]))
        for js_file, js_data in js_files.iteritems():
            self._properties_strings.update(string_match.findall(js_data))
            js_interfaces = set(interface_match.findall(js_data))
            if js_interfaces:
                lines = []
                for interface, constructor in interfaces.iteritems():
                    if (interface in js_interfaces
                        and (interface not in js_global_interfaces
                             or js_file == "button")):
                        lines.append(constructor)
                if js_file == "button":
                    js_files[js_file] = (("\nif (!this.Cc)\n\tthis.Cc = Components.classes;"
                                         "\nif (!this.Ci)\n\tthis.Ci = Components.interfaces;"
                                  "\nvar toolbar_button_interfaces = {\n\t%s\n}"
                                        % ",\n\t".join(lines))
                                        + "\n" + js_files[js_file])
                else:
                    js_files[js_file] = ("var toolbar_button_interfaces_%s"
                                         " = {\n\t%s\n}"
                                         % (js_file, ",\n\t".join(lines))
                                         + "\ntoolbar_button_loader("
                                           "toolbar_button_interfaces, "
                                           "toolbar_button_interfaces_%s);\n"
                                         % js_file + js_files[js_file])
            js_files[js_file] = js_files[js_file].replace("{{chrome_name}}",
                                                     self._settings.CHROME_NAME)
        js_files["button"] = open(os.path.join("files", "loader.js"),
                                  "r").read() + js_files["button"]
        return js_files

    def get_properties_strings(self):
        """Returns the .properties strings used by the buttons.

        Precondition: get_js_files() has been called
        """
        return self._properties_strings

    def get_xul_files(self):
        template = open(os.path.join('files', 'button.xul')).read()
        group_files = self._settings.FILE_MAP.keys()
        result = {}
        for file, values in self._button_xul.iteritems():
            js_includes = []
            for group_file in group_files:
                if group_file in self._button_js and file in self._settings.FILE_MAP[group_file]:
                    js_includes.append("""<script type="application/x-javascript" src="chrome://%s/content/%s.js"/>""" % (self._settings.CHROME_NAME, group_file))
            if file in self._button_js:
                js_includes.append("""<script type="application/x-javascript" src="chrome://%s/content/%s.js"/>""" % (self._settings.CHROME_NAME, file))
            xul_file = (template.replace("{{buttons}}", "\n  ".join(values.values()))
                                .replace("{{script}}", "\n ".join(js_includes))
                                .replace("{{chrome-name}}", self._settings.CHROME_NAME)
                                .replace("{{palette}}", self._settings.FILE_TO_PALETTE[file])
                        )
            result[file] = xul_file
        return result

    def get_suported_applications(self):
        return self._suported_applications


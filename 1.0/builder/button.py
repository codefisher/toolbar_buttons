import os
import re
import io
from collections import defaultdict
import grayscale
from util import get_pref_folders
try:
    from PIL import Image
except ImportError:
    pass

class SimpleButton():

    def __init__(self, folders, buttons, settings, applications):
        self._folders = folders
        self._buttons = buttons
        self._settings = settings
        try:
            Image
        except NameError:
            self._settings["merge_images"] = False
        self._applications = applications
        self._button_image = defaultdict(list)
        self._button_keys = {}
        self._button_applications = defaultdict(set)

        button_files = self._settings.get("file_to_application").keys()
        button_files.sort()
        self._app_files = self._settings.get("file_map").keys()
        self._app_files.sort()
        self._window_files = list(set(button_files).difference(self._app_files))
        self._info = []
        self._xul_files = defaultdict(list)

        for folder, button in zip(self._folders, self._buttons):
            files = os.listdir(folder)
            button_wanted = False

            #file that belong to more then one window
            for group_name in self._app_files:
                xul_file = group_name + ".xul"
                if xul_file in files:
                    for file_name in self._settings.get("file_map")[group_name]:
                        for exclude in self._settings.get("file_exclude").get(file_name, []):
                            if exclude + ".xul" in files:
                                break
                        else:
                            if (self._settings.get("file_to_application")[file_name]
                                    in self._applications):
                                self._process_xul_file(folder, button,
                                                       xul_file, file_name)
                                self._xul_files[button].append(os.path.join(folder, xul_file))
                                button_wanted = True
            #single window files
            for file_name in self._window_files:
                xul_file = file_name + ".xul"
                if (xul_file in files
                        and self._settings.get("file_to_application")[file_name]
                            in self._applications):
                    self._process_xul_file(folder, button, xul_file, file_name)
                    self._xul_files[button].append(os.path.join(folder, xul_file))
                    button_wanted = True

            if not button_wanted:
                continue
            else:
                self._info.append((folder, button, files))

            if "image" in files:
                with open(os.path.join(folder, "image"), "r") as images:
                    for line in images:
                        name, _, modifier = line.partition(" ")
                        self._button_image[button].append((name.strip(),
                                                           modifier.rstrip()))
            else:
                raise ValueError("%s does not contain image listing." % folder)
            if "key" in files:
                with open(os.path.join(folder, "key"), "r") as keys:
                    key_shortcut = list(keys.read().partition(":"))
                    key_shortcut.pop(1)
                    self._button_keys[button] = key_shortcut

    def _process_xul_file(self, folder, button, xul_file, file_name):
        application = self._settings.get("file_to_application")[file_name]
        self._button_applications[button].add(application)
        return application

    def button_applications(self):
        return self._button_applications

class Button(SimpleButton):
    def __init__(self, folders, buttons, settings, applications):
        self._suported_applications = set()
        self._button_files = set()
        self._button_xul = defaultdict(dict)

        SimpleButton.__init__(self, folders, buttons, settings, applications)

        self._button_js = defaultdict(list)
        self._properties_strings = set()
        self._preferences = {}
        self._button_options = {}
        self._button_options_js = {}
        self._option_applications = set()
        self._has_javascript = False
        self._manifest = []
        self._extra_files = {}
        self._res = {}
        self._pref_list = defaultdict(list)
        self._button_style = {}

        # we always want these file
        self._button_js["loader"].append("")
        self._button_js["button"].append("")

        for folder, button, files in self._info:

            for file_name in (self._window_files + self._app_files):
                js_file = file_name + ".js"
                if (js_file in files
                    and (file_name == "button"
                         or self._settings.get("file_to_application")[file_name]
                            in self._applications)):
                    with open(os.path.join(folder, js_file)) as js:
                        self._button_js[file_name].append(js.read())

            if button in self._settings.get("keyboard_custom_keys"):
                self._button_keys[button] = self._settings.get("keyboard_custom_keys")[button]

            if "preferences" in files:
                with open(os.path.join(folder, "preferences"), "r") as preferences:
                    for line in preferences:
                        name, value = line.split(":", 1)
                        self._preferences[name] = value.strip()
                        self._pref_list[name].append(button)
            if "manifest" in files:
                with open(os.path.join(folder, "manifest"), "r") as manifest:
                    self._manifest.append(manifest.read())
            if "option.xul" in files:
                with open(os.path.join(folder, "option.xul"), "r") as option:
                    self._button_options[button] = option.read()
            if "option.js" in files:
                with open(os.path.join(folder, "option.js"), "r") as option:
                    self._button_options_js[button] = option.read()
            if "files" in files:
                for file in os.listdir(os.path.join(folder, "files")):
                    if file[0] != ".":
                        self._extra_files[file] = os.path.join(folder, "files", file)
            if "res" in files:
                for file in os.listdir(os.path.join(folder, "res")):
                    if file[0] != ".":
                        self._res[file] = os.path.join(folder, "res", file)
            if "style.css" in files:
                with open(os.path.join(folder, "style.css"), "r") as style:
                    self._button_style[button] = style.read()

    def get_extra_files(self):
        return self._extra_files

    def get_resource_files(self):
        return self._res

    def _process_xul_file(self, folder, button, xul_file, file_name):
        application = SimpleButton._process_xul_file(self, folder, button, xul_file, file_name)
        self._suported_applications.add(application)
        self._button_files.add(file_name)
        with open(os.path.join(folder, xul_file)) as xul:
            self._button_xul[file_name][button] = xul.read()

    def get_manifest(self):
        return "\n".join(self._manifest)

    def get_options(self):
        result = {}
        if self._button_options_js:
            javascript = ("""<script type="application/x-javascript" src="chrome://%s/content/loader.js"/>\n"""
                          """<script type="application/x-javascript" src="chrome://%s/content/button.js"/>\n"""
                          """<script type="application/x-javascript" src="chrome://%s/content/option.js"/>\n"""
                          % (self._settings.get("chrome_name"), self._settings.get("chrome_name"),
                             self._settings.get("chrome_name")))
        else:
            javascript = ""
        with open(os.path.join("files", "options.xul"), "r") as base_window_file:
            base_window = (base_window_file.read()
                       .replace("{{chrome-name}}", self._settings.get("chrome_name"))
                       .replace("{{javascript}}", javascript))
        with open(os.path.join("files", "option.xul"), "r") as overlay_window_file:
            overlay_window = (overlay_window_file.read()
                       .replace("{{chrome-name}}", self._settings.get("chrome_name")))
        files = defaultdict(list)
        for button, data in self._button_options.iteritems():
            for application in self._button_applications[button]:
                self._option_applications.add(application)
                files[application].append(data.replace("{{pref-root}}", self._settings.get("pref_root")))
        if self._pref_list:
            limit = ".xul,".join(self._pref_list.keys()) + ".xul"
            pref_files = get_pref_folders(limit)
            for file_name, name in zip(*pref_files):
                data_fp = open(file_name, "r")
                data = data_fp.read()
                data_fp.close()
                applications = set()
                for button in self._pref_list[name[:-4]]:
                    for application in self._button_applications[button]:
                        self._option_applications.add(application)
                        applications.add(application)
                    self._button_options[button] = data
                for application in applications:
                    files[application].append(data.replace("{{pref-root}}", self._settings.get("pref_root")))
        if files:
            result["options"] = base_window
        for application, data in files.iteritems():
            result["%s-options" % application] = overlay_window.replace("{{options}}",
                                    "\n\t\t\t".join("\n".join(data).split("\n")))
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
        for buttons in self._button_xul.itervalues():
            for button in buttons.itervalues():
                strings.extend(locale_match.findall(button))
        for key, modifies in self._button_keys.itervalues():
            strings.extend(locale_match.findall(key))
            strings.extend(locale_match.findall(modifies))
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
        return list(set(strings))

    def get_defaults(self):
        settings = []
        settings.append("""pref("extensions.%s.description","chrome://%s/locale/button.properties");"""
                        % (self._settings.get("extension_id"), self._settings.get("chrome_name")))
        if self._settings.get("show_updated_prompt"):
            settings.append("""pref("%scurrent.version", "");""" % self._settings.get("pref_root"))
        for name, value in self._preferences.iteritems():
            settings.append("""pref("%s%s", %s);""" % (self._settings.get("pref_root"), name, value))
        return "\n".join(settings)

    def get_css_file(self):
        image_list = []
        image_datas = {}
        lines = ["""@namespace url("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul");"""]
        values = {"chrome_name": self._settings.get("chrome_name")}
        small, large = self._settings.get("icon_size")
        image_count = 0
        image_map = {}
        if self._settings.get("merge_images"):
            image_set = set()
            for button, image_data in self._button_image.iteritems():
                for image, modifier in image_data:
                    image_set.add(image)
            image_count = len(image_set)
            image_map_small = Image.new("RGBA", (image_count*int(small), int(small)), (0, 0, 0, 0))
            image_map_large = Image.new("RGBA", (image_count*int(large), int(large)), (0, 0, 0, 0))
        count = 0
        offset = 0
        for button, image_data in self._button_image.iteritems():
            values["id"] = button
            for image, modifier in image_data:
                if image[0] == "*" or image[0] == "-":
                    name = list(image[1:].rpartition('.'))
                    name.insert(1, "-disabled")
                    _image = "".join(name)
                    opacity = 1.0 if image[0] == "-" else 0.9
                    small_data, small_fp = grayscale.image_to_graysacle(os.path.join(self._settings.get("image_path"), small, image[1:]), opacity)
                    large_data, large_fp = grayscale.image_to_graysacle(os.path.join(self._settings.get("image_path"), large, image[1:]), opacity)
                    if self._settings.get("merge_images"):
                        if image_map.get(_image):
                            offset = image_map.get(_image)
                        else:
                            offset = count
                            image_map[_image] = offset
                            box = (offset * int(small), 0, (offset + 1) * int(small), int(small))
                            small_fp.seek(0)
                            image_map_small.paste(Image.open(small_fp), box)
                            box = (offset * int(large), 0, (offset + 1) * int(large), int(large))
                            large_fp.seek(0)
                            image_map_large.paste(Image.open(large_fp), box)
                            count += 1
                    else:
                        offset = count
                        image_datas[os.path.join("skin", small, _image)] = small_data
                        image_datas[os.path.join("skin", large, _image)] = large_data
                        count += 1
                    small_fp.close()
                    large_fp.close()
                    image = _image
                else:
                    if self._settings.get("merge_images"):
                        if image_map.get(image):
                            offset = image_map.get(image)
                        else:
                            offset = count
                            image_map[image] = offset
                            box = (offset * int(small), 0, (offset + 1) * int(small), int(small))
                            small_im = Image.open(os.path.join(self._settings.get("image_path"), small, image))
                            image_map_small.paste(small_im, box)
                            box = (offset * int(large), 0, (offset + 1) * int(large), int(large))
                            large_im = Image.open(os.path.join(self._settings.get("image_path"), large, image))
                            image_map_large.paste(large_im, box)
                            count += 1
                    else:
                        offset = count
                        image_list.append(image)
                        count += 1
                values["modifier"] = modifier
                if self._settings.get("merge_images"):
                    values["size"] = large
                    values["top"] = 0
                    values.update({"left": offset * int(large), "bottom": large, "right": (offset + 1) * int(large)})
                    lines.append("""#%(id)s%(modifier)s, toolbar #%(id)s%(modifier)s {"""
                                 """\n\tlist-style-image:url("chrome://%(chrome_name)s/skin/%(size)s/button.png") !important;"""
                                 """\n\t-moz-image-region: rect(%(top)spx %(right)spx %(bottom)spx %(left)spx);\n}""" % values)
                    values.update({"left": offset * int(small), "bottom": small, "right": (offset + 1) * int(small)})
                    values["size"] = small
                    lines.append("""toolbar[iconsize='small'] #%(id)s%(modifier)s {\n\t"""
                                 """list-style-image: url("chrome://%(chrome_name)s/skin/%(size)s/button.png") !important;"""
                                 """\n\t-moz-image-region: rect(%(top)spx %(right)spx %(bottom)spx %(left)spx);\n}""" % values)
                else:
                    values["image"] = image
                    values["size"] = large
                    lines.append("""#%(id)s%(modifier)s, toolbar #%(id)s%(modifier)s {\n\tlist-style-image:"""
                                 """url("chrome://%(chrome_name)s/skin/%(size)s/"""
                                 """%(image)s") !important;\n}""" % values)
                    values["size"] = small
                    lines.append("""toolbar[iconsize='small'] #%(id)s%(modifier)s {\n\tlist-style-image: url("chrome://%(chrome_name)s/skin/%(size)s/%(image)s") !important;\n}""" % values)
        if self._settings.get("merge_images"):
            small_io = io.BytesIO()
            image_map_small.save(small_io, "png")
            image_datas[os.path.join("skin", small, "button.png")] = small_io.getvalue()
            small_io.close()
            large_io = io.BytesIO()
            image_map_large.save(large_io, "png")
            image_datas[os.path.join("skin", large, "button.png")] = large_io.getvalue()
            large_io.close()
        for item in set(self._button_style.values()):
            lines.append(item)
        return "\n".join(lines), image_list, image_datas

    def get_js_files(self):
        interface_match = re.compile("(?<=toolbar_buttons.interfaces.)[a-zA-Z]*")
        function_match = re.compile("^[a-zA-Z0-9_]*\s*:\s*"
                                    "(?:function\([^\)]*\)\s*)?{.*?^}[^\n]*",
                                    re.MULTILINE | re.DOTALL)
        function_name_match = re.compile("((^[a-zA-Z0-9_]*)\s*:\s*"
                                         "(?:function\s*\([^\)]*\)\s*)?{.*?^})",
                                          re.MULTILINE | re.DOTALL)
        include_match = re.compile("(?<=^#include )[a-zA-Z0-9_]*",
                                   re.MULTILINE)
        include_match_replace = re.compile("^#include [a-zA-Z0-9_]*\n?",
                                           re.MULTILINE)
        detect_depandancy = re.compile("(?<=toolbar_buttons.)[a-zA-Z]*")
        string_match = re.compile("StringFromName\(\"([a-zA-Z.-]*?)\"")

        multi_line_replace = re.compile("\n{2,}")
        js_files = defaultdict(str)
        js_files_end = {}
        js_includes = set()
        js_options_include = set()
        js_imports = set()
        for file_name, js in self._button_js.iteritems():
            js_file = "\n".join(js)
            js_includes.update(include_match.findall(js_file))
            js_file = include_match_replace.sub("", js_file)
            js_functions = function_match.findall(js_file)
            js_imports.update(detect_depandancy.findall(js_file))
            if js_functions:
                js_functions.sort(key=lambda x: x.lower())
                js_files[file_name] = "\t" + "\n\t".join(
                        ",\n".join(js_functions).split("\n"))
            js_files_end[file_name] = multi_line_replace.sub("\n",
                                        function_match.sub("", js_file).strip())
        with  open(os.path.join("files", "functions.js"), "r") as shared_functions_file:
            shared_functions = shared_functions_file.read()
        externals = dict((name, function) for function, name
                         in function_name_match.findall(shared_functions))

        extra_functions = []
        js_imports.update(js_includes)
        loop_imports = js_imports
        while loop_imports:
            new_extra = [externals[func_name] for func_name in loop_imports
                           if func_name in js_imports if func_name in externals]
            extra_functions.extend(new_extra)
            new_imports = set(detect_depandancy.findall("\n".join(new_extra)))
            loop_imports = new_imports.difference(js_imports)
            js_imports.update(loop_imports)

        js_extra_file = "\n\t".join(",\n".join(extra_functions).split("\n"))
        if js_files.get("button"):
            js_files["button"] += ",\n\t" + js_extra_file
        elif js_extra_file:
            js_files["button"] += js_extra_file
        for file_name in js_files_end:
            if js_files.get(file_name):
                js_files[file_name] = (
                    "toolbar_buttons.toolbar_button_loader(toolbar_buttons, {\n\t%s\n});\n%s"
                     % (js_files[file_name].strip(), js_files_end[file_name]))
            else:
                js_files[file_name] = js_files_end[file_name]
        if self._button_options_js:
            extra_javascript = []
            for button, value in self._button_options_js.iteritems():
                # dependency resolution is not enabled here yet
                js_options_include.update(include_match.findall(value))
                value = include_match_replace.sub("", value)
                js_functions = function_match.findall(value)
                self._button_options_js[button] = ",\n".join(js_functions)
                extra_javascript.append(multi_line_replace.sub("\n",
                                        function_match.sub("", value).strip()));
            self._button_options_js.update(dict((name, function) for function, name
                               in function_name_match.findall(shared_functions)
                               if name in js_options_include))
            js_files["option"] = (
                    "toolbar_buttons.toolbar_button_loader(toolbar_buttons, {\n\t%s\n});%s"
                    % ("\n\t".join(",\n".join(val for val in self._button_options_js.values() if val).split("\n")), "\n".join(extra_javascript)))
        if self._settings.get("show_updated_prompt"):
            with open(os.path.join("files", "update.js"), "r") as update_js:
                show_update = (update_js.read()
                           .replace("{{uuid}}", self._settings.get("extension_id"))
                           .replace("{{version_url}}",
                                    self._settings.get("version_url"))
                           .replace("{{version}}",
                                    self._settings.get("version"))
                           )
            js_files["button"] = show_update + "\n" + js_files["button"]
        interfaces_data = open(os.path.join("files", "interfaces"), "r")
        interfaces = {}
        for line in interfaces_data:
            name, _ = line.split(":")
            interfaces[name] = line.strip()
        interfaces_data.close()
        js_global_interfaces = set(interface_match.findall(js_files["button"]))
        for js_file, js_data in js_files.iteritems():
            self._properties_strings.update(string_match.findall(js_data))
            js_interfaces = set(interface_match.findall(js_data))
            if js_interfaces:
                lines = []
                interfaces_list = interfaces.items()
                interfaces_list.sort(key=lambda x: x[0].lower())
                for interface, constructor in interfaces_list:
                    if (interface in js_interfaces
                        and (interface not in js_global_interfaces
                             or js_file == "button")):
                        lines.append(constructor)
                if lines:
                    js_files[js_file] = ("toolbar_buttons.toolbar_button_loader("
                                       "toolbar_buttons.interfaces, {\n\t%s\n});\n%s"
                                     % (",\n\t".join(lines).replace("{{pref-root}}", self._settings.get("pref_root")), js_files[js_file]))
            js_files[js_file] = js_files[js_file].replace("{{chrome_name}}",
                    self._settings.get("chrome_name")).replace("{{pref_root}}",
                    self._settings.get("pref_root"))
        js_files = dict((key, value) for key, value in js_files.iteritems() if value)
        if js_files:
            self._has_javascript = True
            with open(os.path.join("files", "loader.js"), "r") as loader:
                js_files["loader"] = loader.read()
        return js_files

    def get_properties_strings(self):
        """Returns the .properties strings used by the buttons.

        Precondition: get_js_files() has been called
        """
        return self._properties_strings

    def get_keyboard_shortcuts(self, application):
        if not self._settings.get("use_keyboard_shortcuts") and not self._settings.get("keyboard_custom_keys"):
            return ""
        keys = []
        for button, (key, modifier) in self._button_keys.iteritems():
            if application in self._button_applications[button]:
                keys.append("""<key key="%s" modifiers="%s" id="%s-key" command="%s" />""" % (key, modifier, button, button))
        if keys:
            return """\n <keyset id="mainKeyset">\n\t%s\n </keyset>""" % "\n\t".join(keys)
        else:
            return ""

    def get_xul_files(self):
        """

        Precondition: get_js_files() has been called
        """
        with open(os.path.join('files', 'button.xul')) as template_file:
            template = template_file.read()
        group_files = self._settings.get("file_map_keys")
        result = {}
        for file, values in self._button_xul.iteritems():
            js_includes = []
            for group_file in group_files:
                if self._has_javascript and group_file in self._button_js and file in self._settings.get("file_map")[group_file]:
                    js_includes.append("""<script type="application/x-javascript" src="chrome://%s/content/%s.js"/>""" % (self._settings.get("chrome_name"), group_file))
            if  self._has_javascript and file in self._button_js:
                js_includes.append("""<script type="application/x-javascript" src="chrome://%s/content/%s.js"/>""" % (self._settings.get("chrome_name"), file))
            xul_file = (template.replace("{{buttons}}", "\n  ".join(values.values()))
                                .replace("{{script}}", "\n ".join(js_includes))
                                .replace("{{keyboard_shortcut}}", self.get_keyboard_shortcuts(file))
                                .replace("{{chrome-name}}", self._settings.get("chrome_name"))
                                .replace("{{palette}}", self._settings.get("file_to_palette")[file])
                        )
            result[file] = xul_file
        return result

    def get_suported_applications(self):
        return self._suported_applications


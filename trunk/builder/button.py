import os
import re
import io # we might not need this as much now, that PIL as .tobytes()
import math
import hashlib
from collections import defaultdict
import grayscale
from util import get_pref_folders
try:
    from PIL import Image
except ImportError:
    pass

def get_image(settings, size, name):
    if isinstance(settings.get("image_path"), str):
        return os.path.join(settings.get("image_path"), size, name)
    else:
        for folder in settings.get("image_path"):
            file_name = os.path.join(folder, size, name)
            if os.path.exists(file_name):
                return file_name
    return os.path.join(settings.get("image_path")[0], size, name)

class SimpleButton():

    def __init__(self, folders, buttons, settings, applications):
        self._folders = folders
        self._buttons = buttons
        self._button_names = set(buttons)
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
        self._strings = {}
        self._xul_files = {}
        large_icon_size = settings.get("icon_size")[1]
        skip_without_icons = settings.get("skip_buttons_without_icons")

        for folder, button in zip(self._folders, self._buttons):
            files = os.listdir(folder)
            button_wanted = False
            xul_data = []
            xul_files = []
            #file that belong to more then one window
            for group_name in self._app_files:
                xul_file = group_name + ".xul"
                if xul_file in files:
                    for file_name in self._settings.get("file_map")[group_name]:
                        for exclude in self._settings.get("file_exclude").get(file_name, []):
                            if exclude + ".xul" in files:
                                break
                        else:
                            if set(self._settings.get("file_to_application")[file_name]
                                   ).intersection(self._applications):
                                xul_data.append((folder, button,
                                                       xul_file, file_name))
                                xul_files.append(os.path.join(folder, xul_file))
                                button_wanted = True
            #single window files
            for file_name in self._window_files:
                xul_file = file_name + ".xul"
                if (xul_file in files
                        and set(self._settings.get("file_to_application")[file_name]
                                   ).intersection(self._applications)):
                    xul_data.append((folder, button, xul_file, file_name))
                    xul_files.append(os.path.join(folder, xul_file))
                    button_wanted = True

            if "image" in files and button_wanted:
                with open(os.path.join(folder, "image"), "r") as images:
                    for line in images:
                        name, _, modifier = line.partition(" ")
                        self._button_image[button].append((name.strip(),
                                                           modifier.rstrip()))
                        if skip_without_icons:
                            name = name.strip().lstrip("*").lstrip("-")
                            if not os.path.exists(get_image(settings, large_icon_size, name)):
                                button_wanted = False
                                del self._button_image[button]
                                continue
            elif button_wanted:
                raise ValueError("%s does not contain image listing." % folder)

            if not button_wanted:
                self._button_names.remove(button)
                continue
            else:
                for item in xul_data:
                    self._process_xul_file(*item)
                self._info.append((folder, button, files))
                self._xul_files[button] = xul_files

            if "key" in files:
                with open(os.path.join(folder, "key"), "r") as keys:
                    key_shortcut = list(keys.read().partition(":"))
                    key_shortcut.pop(1)
                    self._button_keys[button] = key_shortcut
            if "strings" in files:
                with open(os.path.join(folder, "strings"), "r") as strings:
                    for line in strings:
                        name, _, value = line.strip().partition("=")
                        if name:
                            self._strings[name] = value

    def _process_xul_file(self, folder, button, xul_file, file_name):
        application = self._settings.get("file_to_application")[file_name]
        self._button_applications[button].update(set(application).intersection(self._applications))
        return application

    def button_applications(self):
        return self._button_applications

    def applications(self):
        return self._applications

    def buttons(self):
        return self._button_names

    def get_string(self, name, locale=None):
        return self._strings.get(name, "")

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
                         or set(self._settings.get("file_to_application")[file_name]
                                   ).intersection(self._applications))):
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
        self._suported_applications.update(set(application).intersection(self._applications))
        self._button_files.add(file_name)
        with open(os.path.join(folder, xul_file)) as xul:
            self._button_xul[file_name][button] = xul.read().strip()

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
        with open(os.path.join(self._settings.get("project_root"), "files", "options.xul"), "r") as base_window_file:
            base_window = (base_window_file.read()
                       .replace("{{chrome-name}}", self._settings.get("chrome_name"))
                       .replace("{{javascript}}", javascript))
        with open( os.path.join(self._settings.get("project_root"), "files", "option.xul"), "r") as overlay_window_file:
            overlay_window = (overlay_window_file.read()
                       .replace("{{chrome-name}}", self._settings.get("chrome_name")))
        files = defaultdict(list)
        for button, data in self._button_options.iteritems():
            for application in self._button_applications[button]:
                self._option_applications.add(application)
                files[application].append(data.replace("{{pref-root}}", self._settings.get("pref_root")))
        if self._pref_list:
            limit = ".xul,".join(self._pref_list.keys()) + ".xul"
            pref_files = get_pref_folders(limit, self._settings)
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

    def get_css_file(self, toolbars=None):
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
            if small is not None:
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
                    
                    try:
                        if small is not None:
                            small_data = grayscale.image_to_graysacle(get_image(self._settings, small, image[1:]), opacity)
                        large_data = grayscale.image_to_graysacle(get_image(self._settings, large, image[1:]), opacity)
                    except IOError:
                        print "image %s does not exist" % image
                        continue
                    if self._settings.get("merge_images"):
                        if image_map.get(_image):
                            offset = image_map.get(_image)
                        else:
                            offset = count
                            image_map[_image] = offset
                            if small is not None:
                                box = (offset * int(small), 0, (offset + 1) * int(small), int(small))
                                image_map_small.paste(Image.frombytes(small_data), box)
                            box = (offset * int(large), 0, (offset + 1) * int(large), int(large))
                            image_map_large.paste(Image.frombytes(large_data), box)
                            count += 1
                    else:
                        offset = count
                        if small is not None:
                            image_datas[os.path.join("skin", small, _image)] = small_data
                        image_datas[os.path.join("skin", large, _image)] = large_data
                        count += 1
                    image = _image
                else:
                    if self._settings.get("merge_images"):
                        if image_map.get(image):
                            offset = image_map.get(image)
                        else:
                            try:
                                offset = count
                                image_map[image] = offset
                                if small is not None:
                                    box = (offset * int(small), 0, (offset + 1) * int(small), int(small))
                                    small_im = Image.open(get_image(self._settings, small, image))
                                    image_map_small.paste(small_im, box)
                                box = (offset * int(large), 0, (offset + 1) * int(large), int(large))
                                large_im = Image.open(get_image(self._settings, large, image))
                                image_map_large.paste(large_im, box)
                                count += 1
                            except IOError:
                                print "image %s does not exist" % image
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
                    if small is not None:
                        values.update({"left": offset * int(small), "bottom": small, "right": (offset + 1) * int(small)})
                        values["size"] = small
                        lines.append("""#%(id)s-menu-item%(modifier)s, toolbar[iconsize='small'] #%(id)s%(modifier)s {\n\t"""
                                     """list-style-image: url("chrome://%(chrome_name)s/skin/%(size)s/button.png") !important;"""
                                     """\n\t-moz-image-region: rect(%(top)spx %(right)spx %(bottom)spx %(left)spx);\n}""" % values)
                else:
                    values["image"] = image
                    values["size"] = large
                    lines.append("""#%(id)s%(modifier)s, toolbar #%(id)s%(modifier)s {\n\tlist-style-image:"""
                                 """url("chrome://%(chrome_name)s/skin/%(size)s/"""
                                 """%(image)s") !important;\n}""" % values)
                    if small is not None:
                        values["size"] = small
                        lines.append("""#%(id)s-menu-item%(modifier)s, toolbar[iconsize='small'] #%(id)s%(modifier)s {\n\tlist-style-image: url("chrome://%(chrome_name)s/skin/%(size)s/%(image)s") !important;\n}""" % values)
        if self._settings.get("merge_images"):
            if small is not None:
                small_io = io.BytesIO()
                image_map_small.save(small_io, "png")
                image_datas[os.path.join("skin", small, "button.png")] = small_io.getvalue()
                small_io.close()
            large_io = io.BytesIO()
            image_map_large.save(large_io, "png")
            image_datas[os.path.join("skin", large, "button.png")] = large_io.getvalue()
            large_io.close()
        if self._settings.get("include_toolbars"):
            image_list.append("toolbar-button.png")
            lines.append(('''.toolbar-buttons-toolbar-toggle {'''
                    '''\n\tlist-style-image:url("chrome://%(chrome_name)s/skin/%(large)s/toolbar-button.png") !important;'''
                    '''\n}''') % {"large": large,
                       "chrome_name": self._settings.get("chrome_name")})
            if small is not None:
                lines.append(('''toolbar[iconsize='small'] .toolbar-buttons-toolbar-toggle {'''
                    '''\n\tlist-style-image:url("chrome://%(chrome_name)s/skin/%(small)s/toolbar-button.png") !important;\n}''')
                 % {"small": small,
                       "chrome_name": self._settings.get("chrome_name")})
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
        with  open(os.path.join(self._settings.get("project_root"),
                "files", "functions.js"), "r") as shared_functions_file:
            shared_functions = shared_functions_file.read()
        externals = dict((name, function) for function, name
                         in function_name_match.findall(shared_functions))
        if self._settings.get("include_toolbars"):
            js_imports.add("toggleToolbarButtonToolbar")
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
            with open(os.path.join(self._settings.get("project_root"), "files", "update.js"), "r") as update_js:
                show_update = (update_js.read()
                           .replace("{{uuid}}", self._settings.get("extension_id"))
                           .replace("{{version_url}}",
                                    self._settings.get("version_url"))
                           .replace("{{version}}",
                                    self._settings.get("version"))
                           )
            js_files["button"] = show_update + "\n" + js_files["button"]
        interfaces_data = open(os.path.join(self._settings.get("project_root"), "files", "interfaces"), "r")
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
            with open(os.path.join(self._settings.get("project_root"), "files", "loader.js"), "r") as loader:
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

    def _create_menu(self, file_name, buttons):
        if not self._settings.get("file_to_menu").get(file_name):
            return ""
        data = []
        menu_name, insert_after = self._settings.get("file_to_menu").get(file_name)
        simple_button_re = re.compile(r"^<toolbarbutton.*/>$", re.DOTALL)
        attr_match = re.compile(r'''\b([\w\-]+)=("[^"]*")''', re.DOTALL)
        for button_id, xul in buttons.iteritems():
            if simple_button_re.match(xul):
                attrs = [
                     ("%s=%s" % (name, value.replace("toolbarbutton-1", "").strip()))
                            if name == "class" else ("%s=%s" % (name, value))
                     for name, value in attr_match.findall(xul)
                     if name not in ("id", "tooltiptext", "class")
                        or (name == "class" and value != "toolbarbutton-1")]
                attrs.append('id="%s-menu-item"' % button_id)
                data.append("<menuitem %s/>" % "\n\t\t".join(attrs))
        if not data:
            return ""
        return """\n<menu id="%s"><menu insertafter="%s" id="toolbar-buttons-menu" label="&tb-toolbar-buttons.menu;">\n\t<menupopup id="toolbar-buttons-popup">\n\t\t%s\n\t</menupopup>\n\t</menu></menu>\n""" % (menu_name, insert_after, "\n\t".join(data))

    def get_xul_files(self):
        """

        Precondition: get_js_files() has been called
        """
        button_hash = None
        toolbar_template = None
        if self._settings.get("include_toolbars"):
            with open(os.path.join(self._settings.get("project_root"), 'files', 'toolbar-toggle.xul')) as template_file:
                toolbar_template = template_file.read()
            button_hash = hashlib.md5(''.join(sorted(self._buttons)))
        with open(os.path.join(self._settings.get("project_root"), 'files', 'button.xul')) as template_file:
            template = template_file.read()
        group_files = self._settings.get("file_map_keys")
        result = {}
        for file_name, values in self._button_xul.iteritems():
            js_includes = []
            toolbars = []
            for group_file in group_files:
                if self._has_javascript and group_file in self._button_js and file_name in self._settings.get("file_map")[group_file]:
                    js_includes.append("""<script type="application/x-javascript" src="chrome://%s/content/%s.js"/>""" % (self._settings.get("chrome_name"), group_file))
            if  self._has_javascript and file_name in self._button_js:
                js_includes.append("""<script type="application/x-javascript" src="chrome://%s/content/%s.js"/>""" % (self._settings.get("chrome_name"), file_name))
            toolbar_box = self._settings.get("file_to_toolbar_box").get(file_name)
            if self._settings.get("include_toolbars") and toolbar_box:
                number = self._settings.get("include_toolbars")
                max_count = self._settings.get("buttons_per_toolbar")
                if number == -1:
                    number = int(math.ceil(float(len(values))/max_count))
                buttons = values.keys()
                defaultset = ""
                for i in range(number):
                    if self._settings.get("put_button_on_toolbar"):
                        defaultset = 'defaultset="%s"' % ",".join(buttons[i*max_count:(i+1)*max_count])
                    button_hash.update(str(i))
                    hash = button_hash.hexdigest()[:6]
                    toolbars.append('''<toolbar persist="collapsed,hidden" context="toolbar-context-menu" id="tb-toolbar-%s" mode="icons" iconsize="small" customizable="true" %s toolbarname="&tb-toolbar-buttons-toggle-toolbar.name;"/>''' % (hash, defaultset))
                    values["tb-toolbar-buttons-toggle-toolbar-%s" % hash] = toolbar_template.replace("{{hash}}", hash)
            menu = self._create_menu(file_name, values) if self._settings.get("create_menu") else ""
            xul_file = (template.replace("{{buttons}}", "\n  ".join(values.values()))
                                .replace("{{script}}", "\n ".join(js_includes))
                                .replace("{{keyboard_shortcut}}", self.get_keyboard_shortcuts(file_name))
                                .replace("{{chrome-name}}", self._settings.get("chrome_name"))
                                .replace("{{toolbars}}", "" if not toolbars else '\n<toolbox id="%s">\n%s\n</toolbox>' % (toolbar_box, '\n'.join(toolbars)))
                                .replace("{{palette}}", self._settings.get("file_to_palette").get(file_name, ""))
                                .replace("{{menu}}", menu)
                        )
            result[file_name] = xul_file
        return result

    def get_suported_applications(self):
        return self._suported_applications


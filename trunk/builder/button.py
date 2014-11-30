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
        if applications == "all":
            self._applications = applications
        else:
            self._applications = self._settings["applications_data"].keys()
        self._button_image = defaultdict(list)
        self._icons = {}
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
        self._button_folders = {}
        large_icon_size = settings.get("icon_size")[1]
        skip_without_icons = settings.get("skip_buttons_without_icons")

        for folder, button in zip(self._folders, self._buttons):
            if self._settings.get("exclude_buttons") and button in self._settings.get("exclude_buttons"):
                continue
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
                                if self._settings.get("extended_buttons") and ("extended_%s" % xul_file) in files:
                                    xul_file = "extended_%s" % xul_file
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
                    if self._settings.get("extended_buttons") and ("extended_%s" % xul_file) in files:
                        xul_file = "extended_%s" % xul_file
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
                        if name and not modifier:
                            self._icons[button] = name.strip()
                            
            elif button_wanted:
                raise ValueError("%s does not contain image listing." % folder)

            if not button_wanted:
                self._button_names.remove(button)
                continue
            else:
                for item in xul_data:
                    self._process_xul_file(*item)
                self._info.append((folder, button, files))
                self._button_folders[button] = folder
                self._xul_files[button] = xul_files

            if "key" in files and self._settings.get("use_keyboard_shortcuts"):
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
                            
    def __len__(self):
        return len(self._buttons)

    def _process_xul_file(self, folder, button, xul_file, file_name):
        application = self._settings.get("file_to_application")[file_name]
        self._button_applications[button].update(set(application).intersection(self._applications))
        return application

    def button_applications(self):
        return self._button_applications

    def applications(self):
        return self._applications

    def buttons(self):
        return list(self._button_names)

    def get_string(self, name, locale=None):
        return self._strings.get(name, "")

    def get_icons(self, button):
        return self._icons[button]
    
    def locale_string(self, button_locale, locale_name):
        def locale_str(str_type, button_id):
            default_locale = self._settings.get('default_locale', 'en-US')
            value = button_locale.get_dtd_value(locale_name, "%s.%s" % (button_id, str_type), self)
            if value is None:
                if str_type == "tooltip":
                    regexp = r'tooltiptext="&(.*\.tooltip);"'
                else:
                    regexp = r'label="&(.*\.label);"'                
                with open(self._xul_files[button_id][0]) as fp:
                    data = fp.read()
                    match = re.search(regexp, data)
                    value = button_locale.get_dtd_value(locale_name, match.group(1), self)
                if value is None:
                    value = button_locale.get_dtd_value(default_locale, match.group(1), self)
            if value is None:
                return '' #print button_id
            return value.replace("&brandShortName;", "").replace("&apos;", "'")
        return locale_str

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
        self._option_titles = set()
        self._option_icons = set()

        # we always want these file
        self._button_js["loader"].append("")
        self._button_js["button"].append("")

        for folder, button, files in self._info:
            for file_name in (self._window_files + self._app_files):
                js_file = file_name + ".js"
                if (file_name == "button"
                         or set(self._settings.get("file_to_application").get(file_name, [])
                                   ).intersection(self._applications)):
                    if js_file in files:
                        with open(os.path.join(folder, js_file)) as js:
                            self._button_js[file_name].append(js.read())
                    if self._settings.get("extended_buttons") and ("extended_%s" % js_file) in files:
                        with open(os.path.join(folder, "extended_%s" % js_file)) as js:
                            self._button_js[file_name].append(js.read())

            if button in self._settings.get("keyboard_custom_keys"):
                self._button_keys[button].update(self._settings.get("keyboard_custom_keys")[button])

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
                    self._button_options[button] = (option.readline(), option.read())
            if self._settings.get("extra_options") and "extended_option.xul" in files:
                with open(os.path.join(folder, "extended_option.xul"), "r") as option:
                    self._button_options[button] = (option.readline(), option.read())
            if "option.js" in files:
                with open(os.path.join(folder, "option.js"), "r") as option:
                    self._button_options_js[button] = option.read()
            if "files" in files:
                for file in os.listdir(os.path.join(folder, "files")):
                    if file[0] != ".":
                        self._extra_files[file] = os.path.join(folder, "files", file)
            if "file_list" in files:
                with open(os.path.join(folder, "file_list"), "r") as file_list:
                    for file in file_list:
                        if file.strip():
                            self._extra_files[file.strip()] = os.path.join(self._settings.get("project_root"), "files", file.strip())
            if "res" in files:
                for file in os.listdir(os.path.join(folder, "res")):
                    if file[0] != ".":
                        self._res[file] = os.path.join(folder, "res", file)
            if "res_list" in files:
                with open(os.path.join(folder, "res_list"), "r") as res_list:
                    for file in res_list:
                        if file.strip():
                            self._res[file.strip()] = os.path.join(self._settings.get("project_root"), "files", file.strip())
            if "style.css" in files:
                with open(os.path.join(folder, "style.css"), "r") as style:
                    self._button_style[button] = style.read()
                    
    def get_button_xul(self):
        return self._button_xul

    def get_extra_files(self):
        return self._extra_files

    def get_resource_files(self):
        return self._res
    
    def get_description(self, button):
        folder = self._button_folders[button]
        with open(os.path.join(folder, "description"), "r") as description:
            return description.read()
        return ""

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
        with open( os.path.join(self._settings.get("project_root"), "files", "option.xul"), "r") as overlay_window_file:
            overlay_window = (overlay_window_file.read()
                       .replace("{{chrome-name}}", self._settings.get("chrome_name"))
                       .replace("{{javascript}}", javascript))
        files = defaultdict(dict)
        def append(files, application, first, data):
            title, _, icon = first.strip().partition(':')
            if title in files[application]:
                files[application][title]['data'].append(data)
            else:
                files[application][title] = {'data': [data], 'icon': icon}
        for button, (first, data) in self._button_options.iteritems():
            for application in self._button_applications[button]:
                self._option_applications.add(application)
                append(files, application, first, data.replace("{{pref-root}}", self._settings.get("pref_root")))
        if self._pref_list:
            limit = ".xul,".join(self._pref_list.keys()) + ".xul"
            pref_files = get_pref_folders(limit, self._settings)
            for file_name, name in zip(*pref_files):
                data_fp = open(file_name, "r")
                first = data_fp.readline()
                data = data_fp.read()
                data_fp.close()
                applications = set()
                for button in self._pref_list[name[:-4]]:
                    for application in self._button_applications[button]:
                        self._option_applications.add(application)
                        applications.add(application)
                    self._button_options[file_name] = (first, data)
                for application in applications:
                    append(files, application, first, data.replace("{{pref-root}}", self._settings.get("pref_root")))
        for application, data in files.iteritems():
            button_pref = []
            for panel, info in data.iteritems():
                icon = info['icon']
                self._option_icons.add(icon)
                self._option_titles.add(panel)
                data = "\n\t\t\t\t".join("\n".join(info['data']).split("\n"))
                panel_xml = """\t\t\t<prefpane id="toolbar-buttons-prefpane-%s" image="chrome://%s/skin/option/%s" label="&%s;"><vbox>%s</vbox></prefpane>"""  % (
                                    panel.replace('.', '-'), self._settings.get("chrome_name"), icon, panel, data)
                button_pref.append(panel_xml)
            result["%s-options" % application] = overlay_window.replace("{{options}}",
                                    "\n".join(button_pref))
        return result

    def get_options_applications(self):
        """Returns a list of applications with options

        precondition: get_options() has been called
        """
        return self._option_applications

    def get_option_icons(self):
        """Returns a list of icons used by the options window

        precondition: get_options() has been called
        """
        return self._option_icons
        
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
        """Returns a list of strings used by the options window

        precondition: get_options() has been called
        """
        locale_match = re.compile("&([a-zA-Z0-9.-]*);")
        strings = list(self._option_titles)
        if self._button_options:
            strings.append("options.window.title")
        for first, value in self._button_options.itervalues():
            strings.extend(locale_match.findall(value))
        return list(set(strings))

    def get_defaults(self, format_dict=False):
        settings = []
        if self._settings.get("translate_description"):
            settings.append(("extensions.%s.description" % self._settings.get("extension_id"), 
                         """'chrome://%s/locale/button.properties'""" % self._settings.get("chrome_name")))
        if self._settings.get("show_updated_prompt"):
            settings.append(("%scurrent.version" % self._settings.get("pref_root"), "''"))
        for name, value in self._preferences.iteritems():
            settings.append(("%s%s" % (self._settings.get("pref_root"), name), value))
        if format_dict:
            result = ["%s: %s," % setting for setting in settings]
            return "\n\t".join(result)
        else:
            result = ["pref('%s', %s);" % setting for setting in settings]
            return "\n".join(result)
    
    def get_icon_size(self):
        small, large = self._settings.get("icon_size")
        icon_size = {
            "small": small,
            "large": large,
        }
        if self._settings.get("include_icons_for_custom_window") and "32" not in self._settings.get("icon_size"):
            icon_size["window"] = "32"
        elif "32" in self._settings.get("icon_size"):
            icon_size["window"] = "32"
        else:
            icon_size["window"] = small if int(small) >= 32 else large
        if self._settings.get('create_menu'):
            icon_size["menu"] = "16"
        return icon_size

    def get_css_file(self, toolbars=None):
        image_list = []
        image_datas = {}
        lines = ["""@namespace url("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul");"""]
        values = {"chrome_name": self._settings.get("chrome_name")}
        #small, large = self._settings.get("icon_size")
        icon_sizes = self.get_icon_size()
        icon_size_set = set(icon_sizes.values())
        image_count = 0
        image_map = {}
        if self._settings.get("merge_images"):
            image_set = list()
            for button, image_data in self._button_image.iteritems():
                for image, modifier in image_data:
                    image_set.append(image)
            image_count = len(image_set)
            image_map_size = {}
            image_map_x = {}
            for size in icon_size_set:
                if size is not None:
                    y, x = int(math.ceil(image_count*int(size) / 1000.0)), (1000 / int(size))                    
                    image_map_x[size] = x
                    image_map_size[size] = Image.new("RGBA", (x * int(size), y * int(size)), (0, 0, 0, 0))
        count = 0
        offset = 0
        def box_cmp(x, offset):
            y_offset = offset / x
            x_offset = offset % x
            return (x_offset * int(size), y_offset * int(size), (x_offset + 1) * int(size), (y_offset + 1) * int(size))
        for button, image_data in self._button_image.iteritems():
            values["id"] = button
            for image, modifier in image_data:
                if image[0] == "*" or image[0] == "-":
                    name = list(image[1:].rpartition('.'))
                    name.insert(1, "-disabled")
                    _image = "".join(name)
                    opacity = 1.0 if image[0] == "-" else 0.9
                    
                    try:
                        data = {}
                        for size in icon_size_set:
                            if size is not None:
                                data[size] = grayscale.image_to_graysacle(get_image(self._settings, size, image[1:]), opacity)
                    except IOError:
                        print "image %s does not exist" % image
                        continue
                    if self._settings.get("merge_images"):
                        if image_map.get(_image):
                            offset = image_map.get(_image)
                        else:
                            offset = count
                            image_map[_image] = offset
                            image_map = {}
                            for size in icon_size_set:
                                if size is not None:
                                    image_map_size[size].paste(Image.open(io.BytesIO(data[size])), box_cmp(image_map_x[size], offset))
                            count += 1
                    else:
                        offset = count
                        for size in icon_size_set:
                            if size is not None:                            
                                image_datas[os.path.join("skin", size, _image)] = data[size]
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
                                for size in icon_size_set:
                                    if size is not None:
                                        im = Image.open(get_image(self._settings, size, image))
                                        image_map_size[size].paste(im, box_cmp(image_map_x[size], offset))
                                count += 1
                            except IOError:
                                print "image %s does not exist" % image
                    else:
                        offset = count
                        image_list.append(image)
                        count += 1
                #values["modifier"] = modifier
                selectors = dict((key, list()) for key in icon_size_set)
                for name, size in icon_sizes.items():
                    if size is None:
                        continue
                    if name == "small":
                        selectors[size].append("toolbar[iconsize='small'] #%s%s" % (button, modifier))
                    elif name == "large":
                        selectors[size].append("toolbar #%s%s" % (button, modifier))
                    elif name == "menu":
                        selectors[size].append("#%s-menu-item%s" % (button, modifier))
                    elif name == "window":
                        selectors[size].append("#%s%s" % (button, modifier))
                if self._settings.get("merge_images"):
                    for size in icon_size_set:
                        if size is not None:
                            values["size"] = size        
                            values["selectors"] = ", ".join(selectors[size])
                            left, top, right, bottom = box_cmp(image_map_x[size], offset)
                            values.update({"top": top, "left": left, "bottom": bottom, "right": right})
                            lines.append("""%(selectors)s {"""
                                     """\n\tlist-style-image:url("chrome://%(chrome_name)s/skin/%(size)s/button.png") !important;"""
                                     """\n\t-moz-image-region: rect(%(top)spx %(right)spx %(bottom)spx %(left)spx);\n}""" % values)
                else:
                    values["image"] = image
                    for size in icon_size_set:
                        if size is not None:
                            values["size"] = size
                            values["selectors"] = ", ".join(selectors[size])   
                            lines.append("""%(selectors)s {\n\tlist-style-image:"""
                                 """url("chrome://%(chrome_name)s/skin/%(size)s/"""
                                 """%(image)s") !important;\n}""" % values)
        if self._settings.get("merge_images"):
            for size in icon_size_set:
                if size is not None:
                    size_io = io.BytesIO()
                    image_map_size[size].save(size_io, "png")
                    image_datas[os.path.join("skin", size, "button.png")] = size_io.getvalue()
                    size_io.close()
        if self._settings.get("include_toolbars"):
            image_list.append("toolbar-button.png")
            for name, selector in (('small', "toolbar[iconsize='small'] .toolbar-buttons-toolbar-toggle"), 
                                   ('large', 'toolbar .toolbar-buttons-toolbar-toggle'), 
                                   ('window', '.toolbar-buttons-toolbar-toggle')):
                if icon_sizes[name] is not None:
                    lines.append(('''%(selector)s {'''
                    '''\n\tlist-style-image:url("chrome://%(chrome_name)s/skin/%(size)s/toolbar-button.png") !important;'''
                    '''\n}''') % {"size": icon_sizes[name], "selector": selector,
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
        string_match = re.compile("StringFromName\(\"([a-zA-Z0-9.-]*?)\"")

        multi_line_replace = re.compile("\n{2,}")
        js_files = defaultdict(str)
        js_files_end = {}
        js_includes = set()
        js_options_include = set()
        js_imports = set()
        
        # we look though the XUL for functions first
        for file_name, values in self._button_xul.iteritems():
            for button, xul in values.iteritems():
                js_imports.update(detect_depandancy.findall(xul))
        if self._settings.get("create_menu"):
            js_imports.add("sortMenu")
        
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
        shared = []
        lib_folder = os.path.join(self._settings.get("project_root"), "files", "lib")
        for file_name in os.listdir(lib_folder):
            with open(os.path.join(lib_folder, file_name), "r") as shared_functions_file:
                shared.append(shared_functions_file.read())
        shared_functions = "\n\n".join(shared)
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
                js_options_include.update(detect_depandancy.findall(self._button_options[button][1]))
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
        if not self._settings.get("use_keyboard_shortcuts"):
            return ""
        keys = []
        for button, (key, modifier) in self._button_keys.iteritems():
            if application in self._button_applications[button]:
                keys.append("""<key key="%s" modifiers="%s" id="%s-key" command="%s" />""" % (key, modifier, button, button))
                if self._settings.get("create_menu"):
                    keys.append("""<key key="%s" modifiers="%s" id="%s-key" command="%s-menu-item" />""" % (key, modifier, button, button))
        if keys:
            return """\n <keyset id="mainKeyset">\n\t%s\n </keyset>""" % "\n\t".join(keys)
        else:
            return ""

    def _create_menu(self, file_name, buttons):
        if not self._settings.get("file_to_menu").get(file_name):
            return ""
        data = []
        menu_name, insert_after = self._settings.get("file_to_menu").get(file_name)
        simple_button_re = re.compile(r"^<toolbarbutton(.*)/>$", re.DOTALL)
        menu_button_re = re.compile(r"^<toolbarbutton(.*?)>(.*)</toolbarbutton>", re.DOTALL)
        attr_match = re.compile(r'''\b([\w\-]+)=("[^"]*")''', re.DOTALL)
        for button_id, xul in buttons.iteritems():
            attr_data_match = simple_button_re.findall(xul)
            menu = None
            if attr_data_match:
                attr_data = attr_data_match[0]
            else:
                attr_data, menu = menu_button_re.findall(xul)[0]
            attrs = [
                 ("%s=%s" % (name, value.replace("toolbarbutton-1", "menu-iconic menuitem-iconic").strip()))
                        if name == "class" else ("%s=%s" % (name, value))
                 for name, value in attr_match.findall(attr_data)
                 if name not in ("id", "tooltiptext", "class")
                    or (name == "class" and value != "toolbarbutton-1")]
            attrs.append('id="%s-menu-item"' % button_id)
            if self._settings.get("use_keyboard_shortcuts") and button_id in self._button_keys:
                attrs.append('key="%s-key"' % button_id)
            if menu:
                data.append("<menu %s>%s</menu>" % ("\n\t\t".join(attrs), menu))
            else:
                data.append("<menuitem %s/>" % "\n\t\t".join(attrs))
        if not data:
            return ""
        return """\n<menu id="%s"><menu insertafter="%s" id="toolbar-buttons-menu" label="&tb-toolbar-buttons.menu;">\n\t<menupopup onpopupshowing="toolbar_buttons.sortMenu(event, this);" id="toolbar-buttons-popup">\n\t\t%s\n\t</menupopup>\n\t</menu></menu>\n""" % (menu_name, insert_after, "\n\t".join(data))

    def get_xul_files(self):
        """

        Precondition: get_js_files() has been called
        """
        button_hash = None
        toolbar_template = None
        if self._settings.get("include_toolbars"):
            with open(os.path.join(self._settings.get("project_root"), 'files', 'toolbar-toggle.xul')) as template_file:
                toolbar_template = template_file.read()
            button_hash = hashlib.md5(self._settings.get('extension_id'))
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
                    label_number = "" if number == 1 else " %s" % (i + 1)
                    toolbars.append('''<toolbar persist="collapsed,hidden" context="toolbar-context-menu" id="tb-toolbar-%s" mode="icons" iconsize="small" customizable="true" %s toolbarname="&tb-toolbar-buttons-toggle-toolbar.name;%s"/>''' % (hash, defaultset, label_number))
                    values["tb-toolbar-buttons-toggle-toolbar-%s" % hash] = toolbar_template.replace("{{hash}}", hash).replace("{{ number }}", label_number)
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


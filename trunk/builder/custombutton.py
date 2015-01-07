from build import get_buttons, get_locale_folders, Locale, Button, get_image
import os
import re
import base64
import urllib
import xml.etree.ElementTree as ET

CUSTOM_XUL = '''<?xml version="1.0" encoding="UTF-8"?>
<custombutton xmlns:cb="http://xsms.nm.ru/custombuttons/">
  <name>%(name)s</name>
  <image><![CDATA[%(image)s]]></image>
  <mode>0</mode>
  <initcode><![CDATA[%(init)s]]></initcode>
  <code><![CDATA[%(code)s]]></code>
  <accelkey><![CDATA[%(key)s]]></accelkey>
  <help><![CDATA[%(about)s]]></help>
  <attributes/>
</custombutton>'''

class CButton(Button):
    def __init__(self, folders, buttons, settings, applications):
        Button.__init__(self, folders, buttons, settings, applications)
        self._description = {}
        self._local = None
        self._interfaces = {}
        self._command = ""
        
        if len(buttons) != 1:
            raise ValueError("Custombutton can only be created for on button at a time")
        self._the_button = buttons[0]

        for folder, button_id, files in self._info:
            if "description" in files:
                with open(os.path.join(folder, "description"), "r") as description:
                    self._description[button_id] = description.read()
                    if not self._description[button_id].strip():
                        print button_id
                        
    def set_local(self, local):
        self._local = local

    def description(self):
        return self._description.get(self._the_button)
    
    def get_modifier(self):
        data = self._button_keys.get(self._the_button)
        if not data:
            return ""
        mapper = {
               "alt": "Alt",
               "control": "Ctrl",
               "meta": "Meta",
               "shift": "Shift",
               "os": "Win",
               "accel": "Ctrl",
        }
        key, modifiers = data
        if len(key) != 1:
            key = key[2:]
        if "," in modifiers:
            mods = modifiers.split(",")
        else:
            mods = modifiers.split()
        return "%s %s" % (key, " ".join(mapper.get(mod, "") for mod in mods))
    
    def _dom_string_lookup(self, value):
        result = self._local.get_string(value, self._local.get_locales()[0])
        if not result:
            result = self._local.get_string(value, self._settings.get("default_locale")
        if "&brandShortName;" in result:
            return "'%s'.replace('&brandShortName;', Cc['@mozilla.org/xre/app-info;1'].createInstance(Ci.nsIXULAppInfo).name)" % result
        return '"%s"' % result.replace("&amp;", "&").replace("&apos;", "'")
        
    def _prop_string_lookup(self, value):
        return '"%s"' % self._local.get_string(value, self._local.get_locales()[0], table=self._local._properties)
    
    def get_init(self, window):
        xul = self._button_xul[window][self._the_button]
        root = ET.fromstring(re.sub(r'&([^;]+);', r'\1', xul))
        statements, _ = self._create_dom(root, doc='document')
        statements.pop(-1)
        statements.pop(0)
        self._button_js_setup
        js_files = self.get_js_files()
        js_data = []
        js_interfaces = []
        for js_file in self._get_js_file_list(window):
            if js_file == "loader":
                continue
            if js_file in js_files:
                js_data.append(js_files[js_file])
            if js_file in self._interfaces:
                js_interfaces.append(self._interfaces[js_file])
        js_data.insert(0, "interfaces: {\n\t\t%s\n\t}" % ",\n\t\t".join(js_interfaces).replace("{{pref_root}}", self._settings.get("pref_root")))
        functions = "var toolbar_buttons = {\n\t%s\n}\nthis.toolbar_buttons = toolbar_buttons;\n" % ",\n\t".join(js_data)
        prefs = self.get_defaults()
        if prefs:
            with open(os.path.join(self._settings.get("project_root"), "files", "pref.js"), "r") as prefs_js:
                prefs = prefs_js.read() + prefs
        #TODO: add something to update image state if needed
        modules_import = "\n".join("Cu.import('%s');" % mod for mod in self._modules[self._the_button] if mod)
        end = "\n\t".join(self._button_js_setup.get(window, {}).values())
        end = end.replace("'%s'" % self._the_button, 'this.id').replace('"%s"' % self._the_button, 'this.id')
        script = u"""var Cc = Components.classes;\nvar Ci = Components.interfaces;\nvar Cu = Components.utils;\n%s\n%s\n%s\n\n%s\n%s""" % (modules_import, prefs, functions, "\n".join(statements).replace('toolbarbutton_0', 'this'), end)
        def string_fix(matchobj):
            if matchobj.group(1) == "GetStringFromName":
                return self._prop_string_lookup(matchobj.group(2));
            else:
                match = re.split(r'\[|\]', matchobj.group(0), flags=re.DOTALL)[1].split(',')
                return "function() {var i = 0;return %s.replace(/%%S/g, function(match) {return [%s][i++];});}()" % (self._prop_string_lookup(matchobj.group(2)), ','.join(match))
        script = re.sub(r'[a-zA-Z]+\.([a-zA-Z]+StringFromName)\(\"([a-zA-Z0-9.-]*?)\".*?\)', string_fix, script, flags=re.DOTALL)
        script = re.sub(r'.+Bundle.+', '', script)
        return script 
    
    def create_custombuttons(self, window):
        image_file = get_image(self._settings, "16", self.get_icons(self._the_button))
        with open(image_file, "rb") as image_fp:
            encoded_string = "data:image/png;base64,%s" % base64.b64encode(image_fp.read())
        init = self.get_init(window)
        code = """/*
    This is a custom button based on Toolbar Buttons %s
    https://codefisher.org/toolbar_button/
*/\n%s""" % (self._settings.get("version"), self._command.replace('toolbar_buttons.', 'this.toolbar_buttons.'))
        data = {
            "name": self._local.get_string("%s.label" % self._the_button, self._local.get_locales()[0]),
            "image": encoded_string,
            "init": init,
            "code": code,
            "key": self.get_modifier(),
            "about": self.description(),
        }
        xml = CUSTOM_XUL % data
        return "custombutton://%s" % urllib.quote(xml)

def create_custombutton(settings, window):
    settings.update({
        "include_toolbars": False,
        "create_menu": False,
        "custom_button_mode": True,
        "show_updated_prompt": False,
        "add_to_main_toolbar": False,
    })
    locale_folders, locales = get_locale_folders(settings.get("locale"), settings)
    button_locales = Locale(settings, locale_folders, locales)
    buttons = get_buttons(settings, CButton)
    buttons.set_local(button_locales)
    return buttons.create_custombuttons(window)
    
def custombutton(config, application, window, locale, button):
    settings = dict(config)
    settings["applications"] = [application]
    settings["locale"] = [locale]
    settings["buttons"] = [button]
    return create_custombutton(settings, window)
    
if __name__ == "__main__":
    from os import sys, path
    sys.path.append(path.dirname(path.dirname(path.abspath(__file__))))
    from config import settings    
    print custombutton(config, "browser", "browser", "en-US", "restart-app")

"""Parses the localisation files of the extension and queries it for data"""

import os
import re
from collections import defaultdict

entity_re = re.compile(r"<!ENTITY ([\w\-\.]+) [\"'](.*?)[\"']>")

class Locale(object):
    """Parses the localisation files of the extension and queries it for data"""
    def __init__(self, settings, folders, locales, options=False, load_properites=True, only_meta=False):
        self._settings = settings
        self._missing_strings = settings.get("missing_strings")
        self._folders = folders
        self._locales = locales
        self._dtd = defaultdict(dict)
        self._properties = defaultdict(dict)
        self._meta = {}

        for folder, locale in zip(folders, locales):
            files = [os.path.join(folder, file_name)
                     for file_name in os.listdir(folder)
                     if not file_name.startswith(".")]
            for file_name in files:
                if only_meta and not file_name.endswith("meta.dtd"):
                    continue
                if not options and file_name.endswith("options.dtd"):
                    continue
                elif options and not file_name.endswith("options.dtd"):
                    continue
                elif not load_properites and file_name.endswith(".properties"):
                    continue
                if file_name.endswith(".dtd"):
                    with open(file_name) as data:
                        if file_name.endswith("meta.dtd"):
                            self._meta[locale] = (file_name, data.read())
                        data.seek(0)
                        for line in data:
                            match = entity_re.match(line.strip())
                            if match:
                                name, value = match.group(1), match.group(2)
                                self._dtd[locale][name] = value
                elif file_name.endswith(".properties"):
                    with open(file_name) as data:
                        for line in data:
                            name, value = line.strip().split('=', 1)
                            if name:
                                self._properties[locale][name] = value.strip()
    def get_meta(self):
        return self._meta

    def get_locales(self):
        return self._locales

    def get_dtd_value(self, locale, name, button=None):
        """Returns the value of a given dtd string

        get_dtd_value(str, str) -> str
        """
        value = self._dtd[locale].get(name,
                self._dtd[self._settings.get("default_locale")].get(name))
        if not value and button and locale == self._settings.get("default_locale"):
            button.get_string(name)
        return value if value else None

    def get_dtd_data(self, strings, button=None):
        """Gets a set of files with all the strings wanted

        get_dtd_data(list<str>) -> dict<str: str>
        """
        result = {}
        if self._settings.get("include_toolbars"):
            strings = list(strings)
            strings.extend((
                   "tb-toolbar-buttons-toggle-toolbar.label",
                   "tb-toolbar-buttons-toggle-toolbar.tooltip",
                   "tb-toolbar-buttons-toggle-toolbar.name"))
        for locale in self._locales:
            dtd_file = []
            for string in strings:
                if self._missing_strings == "replace":
                    dtd_file.append("""<!ENTITY %s "%s">"""
                                % (string, self._dtd[locale].get(string,
                                        self._dtd[self._settings.get("default_locale")]
                                        .get(string, button.get_string(string, locale) if button else ""))))
                elif self._missing_strings == "empty":
                    dtd_file.append("""<!ENTITY %s "%s">"""
                             % (string, self._dtd[locale].get(string, "")))
                elif (self._missing_strings == "skip"
                      and string in self._dtd[locale]):
                    dtd_file.append("""<!ENTITY %s "%s">"""
                                  % (string, self._dtd[locale][string]))
            result[locale] = "\n".join(dtd_file)
        return result

    def get_properties_data(self, strings, button=None):
        """Gets a set of files with all the .properties strings wanted

        get_dtd_data(list<str>) -> dict<str: str>
        """
        description = "extensions.%s.description" % self._settings.get("extension_id")
        result = {}
        for locale in self._locales:
            properties_file = []
            for string in strings:
                if self._missing_strings == "replace":
                    properties_file.append("%s=%s"
                                % (string, self._properties[locale].get(string,
                                        self._properties[self._settings.get("default_locale")]
                                        .get(string, ""))))
                elif self._missing_strings == "empty":
                    properties_file.append("%s=%s"
                             % (string, self._properties[locale].get(string, "")))
                elif (self._missing_strings == "skip"
                      and string in self._properties[locale]):
                    properties_file.append("%s=%s"
                                  % (string, self._properties[locale][string]))
                elif button and button.get_string(string):
                    properties_file.append("%s=%s" % (string, button.get_string(string)))

            if locale == "en-US":
                properties_file.append("%s=%s" % (description, self._settings.get("description")))
            elif description in self._properties[locale]:
                properties_file.append("%s=%s" % (description, self._properties[locale][description]))
            result[locale] = "\n".join(properties_file)
        return result

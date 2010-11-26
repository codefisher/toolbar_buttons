"""Parses the localisation files of the extension and queries it for data"""

import os
from collections import defaultdict

class Locale(object):
    """Parses the localisation files of the extension and queries it for data"""
    def __init__(self, settings, folders, locales, options=False):
        self._settings = settings
        self._folders = folders
        self._locales = locales
        self._dtd = defaultdict(dict)
        self._properties = defaultdict(dict)

        for folder, locale in zip(folders, locales):
            files = [os.path.join(folder, file_name)
                     for file_name in os.listdir(folder)
                     if not file_name.startswith(".")]
            for file_name in files:
                if options == False and file_name.endswith("options.dtd"):
                    continue
                elif options == True and not file_name.endswith("options.dtd"):
                    continue
                with open(file_name) as data:
                    for line in data:
                        line = line.strip()
                        if line:
                            if file_name.endswith(".dtd"):
                                name, value = line[9:-1].split(' ', 1)
                                self._dtd[locale][name] = value
                            elif file_name.endswith(".properties"):
                                name, value = line.split('=', 1)
                                self._properties[locale][name] = value.strip()

    def get_dtd_data(self, strings):
        """Gets a set of files with all the strings wanted

        get_dtd_data(list<str>) -> dict<str: str>
        """
        result = {}
        for locale in self._locales:
            dtd_file = []
            for string in strings:
                if self._settings.MISSING_STRINGS == "replace":
                    dtd_file.append("""<!ENTITY %s %s>"""
                                % (string, self._dtd[locale].get(string,
                                        self._dtd[self._settings.DEFAULT_LOCALE]
                                        .get(string, ""))))
                elif self._settings.MISSING_STRINGS == "empty":
                    dtd_file.append("""<!ENTITY %s %s>"""
                             % (string, self._dtd[locale].get(string, "")))
                elif (self._settings.MISSING_STRINGS == "skip"
                      and string in self._dtd[locale]):
                    dtd_file.append("""<!ENTITY %s %s>"""
                                  % (string, self._dtd[locale][string]))
            result[locale] = "\n".join(dtd_file)
        return result

    def get_properties_data(self, strings):
        """Gets a set of files with all the .properties strings wanted

        get_dtd_data(list<str>) -> dict<str: str>
        """
        description = "extensions.%s.description" % self._settings.EXTENSION_ID
        result = {}
        for locale in self._locales:
            properties_file = []
            for string in strings:
                if self._settings.MISSING_STRINGS == "replace":
                    properties_file.append("%s=%s"
                                % (string, self._properties[locale].get(string,
                                        self._properties[self._settings.DEFAULT_LOCALE]
                                        .get(string, ""))))
                elif self._settings.MISSING_STRINGS == "empty":
                    properties_file.append("%s=%s"
                             % (string, self._properties[locale].get(string, "")))
                elif (self._settings.MISSING_STRINGS == "skip"
                      and string in self._properties[locale]):
                    properties_file.append("%s=%s"
                                  % (string, self._properties[locale][string]))
            if locale == "en-US":
                properties_file.append("%s=%s" % (description, self._settings.DESCRIPTION))
            elif description in self._properties[locale]:
                properties_file.append("%s=%s" % (description, self._properties[locale][description]))
            result[locale] = "\n".join(properties_file)
        return result

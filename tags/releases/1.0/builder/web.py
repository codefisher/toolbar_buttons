
from locales import Locale
from util import get_button_folders, get_locale_folders
import os
    
class Buttons(object):
    def __init__(self, settings, locale, applications):
        self._settings = settings
        self._buttons = []
        locale_folders, locales = get_locale_folders(locale, "../locale/")
        button_locales = Locale(settings, locale_folders, locales)
        for folder, button in get_button_folders(applications, "../data/"):
            description = open(os.path.join(folder, "description"), "r")
            self._buttons.append(Button(button_locales, button, description))
            
    def __iter__(self):
        return self._buttons
        
class Button(object):
    def __init__(self, locales, button_id, description):
        self._locales = locales
        self._button_id = button_id
        self._description = description
        
    
        
Buttons(None, 'en-US', 'all')
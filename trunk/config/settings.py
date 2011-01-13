import os

config = {
    # Meta data the belongs to the extension
    "name": "Toolbar Buttons",
    "creator": "Michael Buckley",
    "description": "Adds toolbar buttons to the customize toolbar window in several programs including Firefox, Thunderbird and Sunbird.  Some of the buttons make commonly preformed actions quicker, others add new functionality.",
    "version": "1.0b1",
    "extension_id": "{03B08592-E5B4-45ff-A0BE-C1D975458688}",
    "homepage": "http://codefisher.org/toolbar_button/",
    "icon": os.path.join("files", "button.png"),
    "licence": os.path.join("files", "LICENCE"),

    # makes the build system run with debuging enabled
    "debug": False,
    # if true buttons in the staging folder are also added
    "use_staging": True,
    # should a page be shown when the extension is installed
    "show_updated_prompt": True,
    "version_url": "http://codefisher.org/toolbar_button/version/",

    # sets what is added to the extension, this is either a comer seperated
    # list of values, or the special value "all"
    "buttons": "all",
    "applications": "all",
    "locale": "all",

    # these settings change the internals of the extension
    "pref_root": "extension.tbutton.",
    "jar_file": "tbutton.jar",
    "chrome_name": "toolbar-button",
    "icon_size": ("16", "24"),
    "image_path": "/home/michael/Pictures/PastelSVG/png",

    # controls for the locales
    "default_locale": "en-US",
    # what is done with strings that are missing, values are replace, skip or empty
    "missing_strings": "replace",

    # keyboard short cuts
    "use_keyboard_shortcuts": False,
    "keyboard_custom_keys": {},

    "output": os.path.join("extenions", "toolbar_buttons.xpi"),

    # parts of the extension are copied here, if set
    "profile_folder": "/home/michael/.mozilla/firefox/0xq1gim8.Michael",

    # the below sets application support
    "applications_data": {
        "browser":   (
                      ("Firefox", "{ec8030f7-c20a-464f-9b0e-13a3a9e97384}", "3.0", "4.0.*"),
                      ("Flock", "{a463f10c-3994-11da-9945-000d60ca027b}", "2.0", "2.5.*")
                      ),
        "messenger": (
                      ("Thunerbird", "{3550f703-e582-4d05-9a08-453d09bdfdc6}","3.0a1pre", "3.3a2pre"),
                      ("Postbox", "postbox@postbox-inc.com", "1.0.0", "2.0.*")
                      ),
        "calendar":  (
                      ("Sunbird", "{718e30fb-e89b-41dd-9da7-e25a45638b28}", "1.0pre", "1.0pre"),
                      )
    },
    "files_to_overlay": {
        "browser": ("chrome://browser/content/browser.xul", ),
        "mail": ("chrome://messenger/content/messenger.xul", ),
        "compose": ("chrome://messenger/content/messengercompose/messengercompose.xul", ),
        "read": ("chrome://messenger/content/messageWindow.xul", ),
        "calendar": ("chrome://calendar/content/calendar.xul", "chrome://sunbird/content/calendar.xul"),
        "lightning": ("chrome://lightning/content/messenger-overlay-toolbar.xul", )
    },
    "file_to_application": {
         "browser": "browser",
         "messenger": "messenger",
         "mail": "messenger",
         "compose": "messenger",
         "read": "messenger",
         "calendar": "calendar",
         "lightning": "messenger",
    },
    "file_map": {
        "loader": ("browser","mail","compose","read","calendar"),
        "button": ("browser","mail","compose","read","calendar"),
        "messenger": ("mail", "compose", "read"),
        "calendar": ("lightning", "calendar"),
    },
     # order is important
    "file_map_keys": ["loader","button", "messenger", "calendar"],
    "file_to_palette": {
         "browser": "BrowserToolbarPalette",
         "mail": "MailToolbarPalette",
         "compose": "MsgComposeToolbarPalette",
         "read": "MailToolbarPalette",
         "calendar": "calendarToolbarPalette",
         "lightning": "MailToolbarPalette",
    },
    "file_exclude": {
        "lightning": ("mail", "messenger")
    }
}

"""
NAME = "Toolbar Buttons"
CREATOR = "Michael Buckley"
DESCRIPTION = "Adds toolbar buttons to the customize toolbar window in several programs including Firefox, Thunderbird and Sunbird.  Some of the buttons make commonly preformed actions quicker, others add new functionality."
VERSION = "1.0b1"
EXTENSION_ID = "{03B08592-E5B4-45ff-A0BE-C1D975458688}"
HOMEPAGE = "http://codefisher.org/toolbar_button/"
ICON = os.path.join("files", "button.png")
LICENCE = os.path.join("files", "LICENCE")
VERSION_URL = "http://codefisher.org/toolbar_button/version/"
PREF_ROOT = "extension.tbutton."
DEBUG=False

BUTTONS = "all"
APPLICATIONS = "all"
LOCALE = "all"

JAR_FILE = "tbutton.jar"
CHROME_NAME = "toolbar-button"

ICON_SIZE = ("16", "24")

DEFAULT_LOCALE = "en-US"
MISSING_STRINGS = "skip" # replace, skip, empty
SHOW_UPDATED_PROMPT = True
USE_KEYBOARD_SHORTCUTS = False
KEYBOARD_CUSTOM_KEYS = {}
USE_STAGING = False

# I need to add SeaMonkey in here somewhere
APPLICATIONS_DATA = {
    "browser":   (
                  ("Firefox", "{ec8030f7-c20a-464f-9b0e-13a3a9e97384}", "3.0", "4.0.*"),
                  ("Flock", "{a463f10c-3994-11da-9945-000d60ca027b}", "2.0", "2.5.*")
                  ),
    "messenger": (
                  ("Thunerbird", "{3550f703-e582-4d05-9a08-453d09bdfdc6}","3.0a1pre", "3.3a2pre"),
                  ("Postbox", "postbox@postbox-inc.com", "1.0.0", "2.0.*")
                  ),
    "calendar":  (
                  ("Sunbird", "{718e30fb-e89b-41dd-9da7-e25a45638b28}", "1.0pre", "1.0pre"),
                  )
}

FILES_TO_OVERLAY = {
    "browser": ("chrome://browser/content/browser.xul", ),
    "mail": ("chrome://messenger/content/messenger.xul", ),
    "compose": ("chrome://messenger/content/messengercompose/messengercompose.xul", ),
    "read": ("chrome://messenger/content/messageWindow.xul", ),
    "calendar": ("chrome://calendar/content/calendar.xul", "chrome://sunbird/content/calendar.xul"),
    "lightning": ("chrome://lightning/content/messenger-overlay-toolbar.xul", )
}

FILE_TO_APPLICATION = {
     "browser": "browser",
     "messenger": "messenger",
     "mail": "messenger",
     "compose": "messenger",
     "read": "messenger",
     "calendar": "calendar",
     "lightning": "messenger",
}

FILE_MAP = {
    "loader": ("browser","mail","compose","read","calendar"),
    "button": ("browser","mail","compose","read","calendar"),
    "messenger": ("mail", "compose", "read"),
    "calendar": ("lightning", "calendar"),
}
FILE_MAP_KEYS = ["loader","button", "messenger", "calendar"] # order is important

FILE_TO_PALETTE = {
     "browser": "BrowserToolbarPalette",
     "mail": "MailToolbarPalette",
     "compose": "MsgComposeToolbarPalette",
     "read": "MailToolbarPalette",
     "calendar": "calendarToolbarPalette",
     "lightning": "MailToolbarPalette",
}

FILE_EXCLUDE = {
    "lightning": ("mail", "messenger")
}

OUTPUT = os.path.join("extenions", "toolbar_buttons.xpi")

PROFILE_FOLDER = "/home/michael/.thunderbird/qkx2vqjm.default" # "/home/michael/.mozilla/firefox/0xq1gim8.Michael" #
IMAGE_PATH = "/home/michael/Pictures/PastelSVG/png"
"""
NAME = "Toolbar Buttons"
CREATOR = "Michael Buckley"
DESCRIPTION = "Adds toolbar buttons to the customize toolbar window in several programs including Firefox, Thunderbird and Sunbird.  Some of the buttons make commonly preformed actions quicker, others add new functionality."
VERSION = "1.0a1"
EXTENSION_ID = "{03B08592-E5B4-45ff-A0BE-C1D975458688}"
HOMEPAGE = "http://codefisher.org/toolbar_button/"
ICON = "files/button.png"
VERSION_URL = "http://codefisher.org/toolbar_button/version/"

IMAGE_PATH = "/home/michael/Pictures/PastelSVG/png"
BUTTONS = "all"
APPLICATIONS = "all"
LOCALE = "all"

DATA_FOLDER = "data"
LOCALE_FOLDER = "locale"

JAR_FILE = "tbutton.jar"
CHROME_NAME = "toolbar-button"

ICON_SIZE = ("16", "24")

DEFAULT_LOCALE = "en-US"
MISSING_STRINGS = "replace" # replace, skip, empty
SHOW_UPDATED_PROMPT = True

APPLICATIONS_DATA = {
    "browser":   (
                  ("Firefox", "{ec8030f7-c20a-464f-9b0e-13a3a9e97384}", "3.0", "3.7a1pre"),
                  ("Flock", "{a463f10c-3994-11da-9945-000d60ca027b}", "2.0", "2.5.*")
                  ),
    "messenger": (
                  ("Thunerbird", "{3550f703-e582-4d05-9a08-453d09bdfdc6}","3.0a1pre","3.1a1pre"),
                  ("Postbox", "postbox@postbox-inc.com", "1.0.0", "1.1.*")
                  ),
    "calendar":  (
                  ("Sunbird", "{718e30fb-e89b-41dd-9da7-e25a45638b28}", "1.0pre", "1.0pre"),
                  )
}

FILES_TO_OVERLAY = {
    "browser": ("chrome://browser/content/browser.xul",),
    "mail": ("chrome://messenger/content/messenger.xul",),
    "compose": ("chrome://messenger/content/messengercompose/messengercompose.xul",),
    "read": ("chrome://messenger/content/messageWindow.xul",),
    "calendar": ("chrome://calendar/content/calendar.xul","chrome://sunbird/content/calendar.xul")
}

FILE_TO_APPLICATION = {
     "browser": "browser",
     "messenger": "messenger",
     "mail": "messenger",
     "compose": "messenger", 
     "read": "messenger",
     "calendar": "calendar"
}

FILE_MAP = {
    "button": ("browser","mail","compose","read","calendar"),
    "messenger": ("mail","compose","read")
}

FILE_TO_PALETTE = {
     "browser": "BrowserToolbarPalette",
     "mail": "MailToolbarPalette",
     "compose": "MsgComposeToolbarPalette", 
     "read": "MailToolbarPalette",
     "calendar": "calendarToolbarPalette"                  
}

OUTPUT = "/home/michael/Dev/Extension/ToolbarButtons/extenions/extension.xpi"



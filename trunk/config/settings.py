import os

config = {
    # Meta data the belongs to the extension
    "name": "Toolbar Buttons",
    "creator": "Michael Buckley",
    "description": "Adds toolbar buttons to the customize toolbar window in several programs including Firefox, Thunderbird and Sunbird.  Some of the buttons make commonly preformed actions quicker, others add new functionality.",
    "version": "1.0.1b1",
    "extension_id": "{03B08592-E5B4-45ff-A0BE-C1D975458688}",
    "homepage": "http://codefisher.org/toolbar_button/",
    "icon": os.path.join("files", "button.png"),
    "licence": os.path.join("files", "LICENCE"),

    # makes the build system run with debuging enabled
    "debug": False,
    # if true buttons in the staging folder are also added
    "use_staging": False,
    # all the image files are put into a bit map if enabled
    "merge_images": False,
    # should a page be shown when the extension is installed
    "show_updated_prompt": True,
    "version_url": "http://codefisher.org/toolbar_button/version/",

    # sets what is added to the extension, this is either a comer seperated
    # list of values, or the special value "all"
    "buttons": "all",
    "applications": "all",
    # this setting may include locals to skip even if we we have them
    # simply specify "all" the a "-" in front of locals to remove
    "locale": "all,-ar,-zh-TW,-tr-TR,-da,-cs-CZ",

    # these settings change the internals of the extension
    "pref_root": "extension.tbutton.",
    "jar_file": "tbutton.jar",
    "chrome_name": "toolbar-button",
    "icon_size": ("16", "24"),
    "image_path": None,

    # controls for the locales
    "default_locale": "en-US",
    # what is done with strings that are missing, values are replace, skip or empty
    "missing_strings": "replace",

    # keyboard short cuts
    "use_keyboard_shortcuts": False,
    "keyboard_custom_keys": {},

    "output_folder": "extensions",
    "output_file": "toolbar-buttons-%(version)s.xpi",

    # parts of the extension are copied here, if set
    "profile_folder": None,

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

try:
    from local_settings import config as local_config
    config.update(local_config)
except ImportError:
    pass

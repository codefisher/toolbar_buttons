import os

config_default = {
    # Meta data the belongs to the extension
    "name": "Toolbar Buttons",
    "creator": "Michael Buckley",
    "description": "Adds toolbar buttons to the customize toolbar window in several programs including Firefox, Thunderbird and Sunbird.  Some of the buttons make commonly preformed actions quicker, others add new functionality.",
    "version": "1.0.2",
    "extension_id": "{03B08592-E5B4-45ff-A0BE-C1D975458688}",
    "homepage": "https://codefisher.org/toolbar_button/",
    "icon": os.path.join("files", "button.png"),
    "licence": os.path.join("files", "LICENCE"),
    "update_url": None,

    # makes the build system run with debuging enabled
    "debug": False,
    # if true buttons in the staging folder are also added
    "use_staging": False,
    "use_pre": False,
    # all the image files are put into a bit map if enabled
    "merge_images": False,
    # should a page be shown when the extension is installed
    "show_updated_prompt": True,
    "version_url": "https://codefisher.org/toolbar_button/version/",

    # sets what is added to the extension, this is either a comer seperated
    # list of values, or the special value "all"
    "buttons": "all",
    "applications": "all",
    # this setting may include locals to skip even if we we have them
    # simply specify "all" the a "-" in front of locals to remove
    "locale": "all",

    # these settings change the internals of the extension
    "pref_root": "extension.tbutton.",
    "jar_file": "tbutton.jar",
    "chrome_name": "toolbar-button",
    "icon_size": ("16", "24"),
    "image_path": None,
    "include_icons_for_custom_window": False,
    "project_root": "",
    #buttons can be left out if their icon is not in the given set.
    #the default action it to use a place holder image
    "skip_buttons_without_icons": False,
    # if include_toolbars, is positive that many toolbars will be added.
    # if it is -1, a number will be chosen by looking at buttons_per_toolbar
    "include_toolbars": 0,
    "buttons_per_toolbar": 32,
    # if the buttons should be added to the new toolbars.
    # if all buttons can't fix given buttons_per_toolbar they will be left out
    "put_button_on_toolbar": True,
    # if a menu should be added with all the buttons that can be changed into menu items
    "create_menu": False,
    # if set, the disciption will be change to list the buttons in the extension
    # and if there is only one button, also the title and icon will be change
    "fix_meta": False,


    # controls for the locales
    "default_locale": "en-US",
    "include_local_meta": False,
    # what is done with strings that are missing, values are replace, skip or empty
    "missing_strings": "replace",

    # keyboard short cuts
    "use_keyboard_shortcuts": False,
    "keyboard_custom_keys": {},

    "output_folder": "extensions",
    "output_file": "%(chrome_name)s-%(version)s.xpi",

    # parts of the extension are copied here, if set
    "profile_folder": None,

    # the below sets application support
    "applications_data": {
        "browser":   (
                      ("Firefox", "{ec8030f7-c20a-464f-9b0e-13a3a9e97384}", "3.0", "35.0"),
                      ),
        "messenger": (
                      ("Thunderbird", "{3550f703-e582-4d05-9a08-453d09bdfdc6}","3.0", "35.0"),
                      ("Postbox", "postbox@postbox-inc.com", "1.0.0", "3.0.*")
                      ),
        "calendar":  (
                      ("Sunbird", "{718e30fb-e89b-41dd-9da7-e25a45638b28}", "1.0b1", "1.0pre"),
                      ),
        "suite": (
                      ("SeaMonkey", "{92650c4d-4b8e-4d2a-b7eb-24ecf4f6b63a}", "2.0", "2.32"),
                      ),
    },
    # the latest max version for support applications can be lookup
    # and changed to what ever values are found.
    "lookup_max_versions": False,
    "files_to_overlay": {
        "browser": ("chrome://browser/content/browser.xul", ),
        "suite_browser": ("chrome://navigator/content/navigator.xul", ),
        "mail": ("chrome://messenger/content/messenger.xul", ),
        "compose": ("chrome://messenger/content/messengercompose/messengercompose.xul", ),
        "read": ("chrome://messenger/content/messageWindow.xul", ),
        "calendar": ("chrome://calendar/content/calendar.xul", "chrome://sunbird/content/calendar.xul"),
        "lightning": ("chrome://lightning/content/messenger-overlay-toolbar.xul", ),
        "mail-header": ("chrome://messenger/content/msgHdrViewOverlay.xul",),
        "mail-address-book": ("chrome://messenger/content/addressbook/addressbook.xul", )
    },
    "file_to_application": {
         "browser": ("browser", "suite"),
         "messenger": ("messenger", "suite"),
         "mail": ("messenger", "suite"),
         "compose": ("messenger", "suite"),
         "read": ("messenger", "suite"),
         "calendar": ("calendar", "suite"),
         "lightning": ("messenger", ),
         "mail-header": ("messenger", ),
         "mail-address-book": ("messenger", ),
         "suite_browser": ("suite", )
    },
    "file_map": {
        "loader": ("browser","mail","compose","read","calendar","suite_browser"),
        "button": ("browser","mail","compose","read","calendar","suite_browser"),
        "messenger": ("mail", "compose", "read"),
        "calendar": ("lightning", "calendar"),
        "browser": ("browser", "suite_browser"),
    },
     # order is important
    "file_map_keys": ["loader","button", "messenger", "calendar", "browser"],
    "file_to_palette": {
         "browser": "BrowserToolbarPalette",
         "mail": "MailToolbarPalette",
         "compose": "MsgComposeToolbarPalette",
         "read": "MailToolbarPalette",
         "calendar": "calendarToolbarPalette",
         "lightning": "MailToolbarPalette",
         "mail-header": "header-view-toolbar-palette",
         "mail-address-book": "AddressBookToolbarPalette",
         "suite_browser": "BrowserToolbarPalette",
    },
    "file_to_toolbar_box": {
        "browser": "navigator-toolbox",
        "mail": "mail-toolbox",
        "compose": "compose-toolbox",
        "read": "mail-toolbox",
        "calendar": "calendar-toolbox",
        "suite_browser": "navigator-toolbox",
    },
    "file_to_menu": {
        "browser": ("menu_ToolsPopup", "devToolsSeparator"),
        "mail": ("taskPopup", "devToolsSeparator"),
        "compose": ("taskPopup", "tasksMenuMail"),
        "read": ("taskPopup", "devToolsSeparator"),
        "suite_browser": ("menu_ToolsPopup", "devToolsSeparator"),
    },
    "file_exclude": {
        "lightning": ("mail", "messenger")
    }
}

config = dict(config_default)

try:
    from local_settings import config as local_config
    config.update(local_config)
except ImportError:
    pass

import os
import toolbar_buttons

#The parent folder of the data folder
TBUTTON_DATA = os.path.dirname(toolbar_buttons.__file__)

# the icon sets to use for the buttons
TBUTTON_ICONS = {
    #"name": ("label", "path"),
}
TBUTTON_ICONS_SIZES = [
    "standard", "large", "jumbo",
]
TBUTTON_ICON_SET_SIZES = {
    #"name": {"standard": ("16", "24"), "large": ("24", "32"), "large": ("32", "48"), }
}
TBUTTON_DEFAULT_ICONS = ""
TBUTTON_TAGS_DIR = None

# the default icons to use for the link buttons
DEFAULT_LINK_ICONS = ""
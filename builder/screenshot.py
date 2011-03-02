import os
import button
import math
from util import get_button_folders
from PIL import Image, ImageDraw, ImageFont

class IconButton(button.SimpleButton):
    def __init__(self, folders, buttons, settings, applications):
        button.SimpleButton.__init__(self, folders, buttons, settings, applications)
        self._icons = {}

        for buttonId, icons in self._button_image.iteritems():
            for image, selector in icons:
                if image and not selector:
                    self._icons[buttonId] = image
                    break

    def get_icons(self):
        return self._icons

def create_screenshot(settings):
    icons_size = int(settings.get("icon_size")[0])
    application = settings.get("applications")[0]

    button_list = settings.get("buttons")
    button_folders, button_names = get_button_folders(button_list, settings)
    buttons = IconButton(button_folders, button_names, settings, settings.get("applications"))
    icons = buttons.get_icons().values()
    icons_per_row = settings.get("icons_per_row", 18)
    rows = int(math.ceil(float(len(icons))/icons_per_row))
    top_image = Image.open(os.path.join("files", "top.png"))
    toolbar_image = Image.open(os.path.join("files", "toolbar-back.png"))
    app_icon = Image.open(os.path.join("files", "icons", "%s.png" % application))
    if app_icon.mode != 'RGBA':
        app_icon = app_icon.convert('RGBA')

    height = top_image.size[1] + (toolbar_image.size[1] * rows)
    width = (icons_size + 8) * icons_per_row

    image = Image.new("RGB", (width, height), (0, 0, 0, 0))
    sized_top = top_image.resize((width, top_image.size[1]))
    top_height = top_image.size[1]
    image.paste(sized_top, (0, 0) + sized_top.size)

    icon_width, icon_height = app_icon.size
    image.paste(app_icon, (4, (top_height-icon_height)/2), app_icon)
    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype(settings.get("screen_shot_font"), settings.get("screen_shot_font_size", 11))
    app_name = settings.get("applications_data")[application][0][0]
    draw.text((icon_width + 9, (top_height-icon_height)/2 + 1), app_name, font=font, fill=(0, 0, 0))
    draw.text((icon_width + 8, (top_height-icon_height)/2), app_name, font=font, fill=(255, 255, 255))

    sized_toolbar = toolbar_image.resize((width, toolbar_image.size[1]))
    toolbar_width, toolbar_height = sized_toolbar.size
    for i in range(rows):
        image.paste(sized_toolbar, (0, top_height + (i * toolbar_height), toolbar_width, top_height + ((i + 1) * toolbar_height)))

    for i, icon in enumerate(icons):
        icon_img = Image.open(button.get_image(settings, settings.get("icon_size")[0], icon))
        image.paste(icon_img, (4 + (i % icons_per_row) * (icons_size + 8), (i // icons_per_row * toolbar_height)+top_height+(toolbar_height-icons_size)/2), icon_img)

    file_name = os.path.join(settings.get("output_folder"), settings.get("output_file", "%s.png" % "".join(settings.get("applications"))))
    image.save(file_name, "png")
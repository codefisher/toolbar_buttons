
import io
import Image, ImageEnhance
    
def image_to_graysacle(file_name, drop_opacity=0.9):
    output = io.BytesIO()
    img = Image.open(file_name).convert('LA')
    img = reduce_opacity(img, drop_opacity)
    img.save(output, format="png")
    data = output.getvalue()
    output.close()
    return data

def reduce_opacity(im, opacity):
    """Returns an image with reduced opacity."""
    assert opacity >= 0 and opacity <= 1
    if im.mode != 'RGBA':
        im = im.convert('RGBA')
    alpha = im.split()[3]
    alpha = ImageEnhance.Brightness(alpha).enhance(opacity)
    im.putalpha(alpha)
    return im
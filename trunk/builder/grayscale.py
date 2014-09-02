try:
    import png
except ImportError:
    print "pypng module has not been installed"
import io
import itertools
import tempfile
import os
import hashlib

def image_to_graysacle(file_name, drop_opacity=0.9):
    #this could be used as a kind of caching method, but I don't want to now.
    #temp_path = os.path.join(tempfile.gettempdir(),
    #        "grayscale.%s.png" % hashlib.md5(file_name + str(drop_opacity)).hexdigest())
    #if os.path.exists(temp_path):
    #    fp = open(temp_path, "r")
    #    return fp.read(), fp
    output = io.BytesIO()
    try:
        image = png.Reader(filename=file_name)
    except IOError as err:
        print "File missing"
        raise err
    except NameError:
        with open(file_name, "r") as fp:
            return fp.read()
    _, _, color_data, info = image.asRGBA8()
    info["greyscale"] = True
    info["background"] = (255,)
    out_image = png.Writer(**info)
    out_image.write_packed(output, gray_data(color_data, info, drop_opacity))
    data = output.getvalue()
    output.close()
    #with open(temp_path, "w") as fp:
    #    fp.write(data)
    return data

def gray_data(color_data, info, drop_opacity=0.9):
    data = []
    for row in color_data:
        new_row = []
        for item in grouper(4, row):
            r,g,b,a = item
            new_row.append(int((0.30* r + 0.59 * g + 0.11*b)*drop_opacity))
            new_row.append(int(a*drop_opacity))
        data.append(new_row)
    return data

def grouper(n, iterable, fillvalue=None):
    "grouper(3, 'ABCDEFG', 'x') --> ABC DEF Gxx"
    args = [iter(iterable)] * n
    return itertools.izip_longest(fillvalue=fillvalue, *args)

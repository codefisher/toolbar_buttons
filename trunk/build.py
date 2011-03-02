#!/usr/bin/python
from builder.build import build_extension
from builder.screenshot import create_screenshot
import time
import sys
import imp
import getopt
import textwrap

try:
    from config import settings
except ImportError:
    print "Failed to load settings."
    sys.exit(1)

def main():
    opts, args = getopt.getopt(sys.argv[1:], "b:l:a:o:f:s:m:", ["help", "screen-shot", "icons-per-row=", "screen-shot-font="])
    opts_table = dict(opts)
    if "--help" in opts_table:
        print textwrap.dedent("""
        Toolbar Buttons

            -b    - a button to inlcude
            -a    - an application to include
            -l    - a locale to include
            -o    - the folder to put the created extension in
            -f    - the file name for the created extension
            -s    - the sizes to use for the icons, but be two numbers separated
                        by a hyphen.
            -m    - merge all images into single large image, either y or n

            --screen-shot create  - a fake screen shot of all the buttons in the extension
            --icons-per-row       - the number of icons to put on each row of the screen shot
            --screen-shot-font    - the file to the font to use for the window title
        """).strip()
        return
    config = dict(settings.config)
    for name, setting in (("-b", "buttons"), ("-l", "locale"), ("-a", "applications")):
        if name in opts_table:
            config[setting] = [value for arg, value in opts if arg == name]
    if "-o" in opts_table:
        config["output_folder"] = opts_table["-o"]
    if "-f" in opts_table:
        config["output_file"] = opts_table["-f"]
    if "-s" in opts_table:
        config["icon_size"] = tuple(opts_table["-s"].split('-'))
    if "-m" in opts_table:
        config["merge_images"] = opts_table["-m"].lower() == "y"
    start = time.time()
    if "--screen-shot" in opts_table:
        if "--icons-per-row" in opts_table:
            config["icons_per_row"] = int(opts_table["--icons-per-row"])
        if "--screen-shot-font" in opts_table:
            config["screen_shot_font"] = opts_table["--screen-shot-font"]
        create_screenshot(config)
        return
    elif config.get("debug", False):
        import cProfile
        import pstats
        cProfile.runctx("build_extension(settings)",
                    {"build_extension": build_extension, "settings": settings.config}, {},
                    "./stats")
        prof = pstats.Stats("./stats")
        prof.sort_stats('time') # time, cumulative
        prof.print_stats()
    else:
        build_extension(config)
    print time.time() - start

if __name__ == "__main__":
    main()
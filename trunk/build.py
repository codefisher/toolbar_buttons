#!/usr/bin/python
from builder.build import build_extension
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
    opts, args = getopt.getopt(sys.argv[1:], "b:l:a:o:f:", ["help"])
    opts_table = dict(opts)
    if "--help" in opts_table:
        print textwrap.dedent("""
        Toolbar Buttons

            -b    - a button to inlcude
            -a    - an application to include
            -l    - a locale to include
            -o    - the folder to put the created extension in
            -f    - the file name for the created extension
        """).strip()
        return
    config = dict(settings.config)
    for name, setting in (("-b", "buttons"), ("-l", "locale"), ("-a", "applications")):
        if name in opts_table:
            config[setting] = ",".join(value for arg, value in opts if arg == name)
    if "-o" in opts_table:
        config["output_folder"] = opts_table["-o"]
    if "-f" in opts_table:
        config["output_file"] = opts_table["-f"]
    start = time.time()
    if config.get("debug", False):
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
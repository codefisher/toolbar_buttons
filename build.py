#!/usr/bin/python
from builder.build import build_extension
import time
import sys
import imp

if len(sys.argv) > 1:
    settings = imp.load_source("settings", sys.argv[1])
else:
    try:
        from config import settings
    except ImportError:
        print "Failed to load settings."
        sys.exit(1)

if __name__ == "__main__":
    start = time.time()
    if settings.config.get("debug", False):
        import cProfile
        import pstats
        cProfile.runctx("build_extension(settings)",
                    {"build_extension": build_extension, "settings": settings.config}, {},
                    "./stats")
        prof = pstats.Stats("./stats")
        prof.sort_stats('time') # time, cumulative
        prof.print_stats()
    else:
        build_extension(settings.config)
    print time.time() - start
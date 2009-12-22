#!/usr/bin/python
from builder.build import build_extension
import time
import sys

try:
    from config import settings
except ImportError:
    print "Failed to load settings."    
    sys.exit(1)

if __name__ == "__main__":
    start = time.time()
    build_extension(settings)
    print time.time() - start
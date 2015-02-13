#!/usr/bin/python

import os
import sys


def main():
    button_id, app = sys.argv[1:]
    files = {
         "fx": "browser",
         "tb": "messenger",
         "sb": "calendar",
         "b": "button",    
    }
    try:
        os.mkdir(os.path.join("pre", button_id))
    except:
        pass
    for name in ["image", "description"]:
        f = open(os.path.join("pre", button_id, name), 'w+')
        f.write('')
        f.close()
    strings = open(os.path.join("pre", button_id, "strings"), 'w+')
    strings.write("%s.label=\n%s.tooltip=" % (button_id, button_id))
    strings.close()
    xul = open(os.path.join("pre", button_id, "%s.xul" % files[app]), 'w+')
    xul.write("""<toolbarbutton
	class="toolbarbutton-1 chromeclass-toolbar-additional" 
	id="%s"
	label="&%s.label;"
	tooltiptext="&%s.tooltip;"
	oncommand=""/>""" % (button_id, button_id, button_id))
    xul.close()    

if __name__ == "__main__":
    main()

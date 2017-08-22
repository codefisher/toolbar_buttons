import sys
import json
import os
from collections import OrderedDict

def main():
    button = sys.argv[1]
    config = OrderedDict()
    config["buttons"] = [button]
    config["extension_id"] = "%s-single@codefisher.org" % button
    config["add_to_main_toolbar"] = [button]
    config["fix_meta"] = True
    config["current_version_pref"] = 'current.version.%s' % button
    config["chrome_name"] = "%s-toolbar-button" % button
    config["locale_file_prefix"] = "%s_" % button
    with open(os.path.join("configs", "%s.json" % button), "w") as f:
        f.write(json.dumps(config, indent=4, separators=(',', ': ')))
        
if __name__ == "__main__":
    main()
import os

from builder.build import build_extension
from builder.util import get_reveision

try:
    from config import settings
except ImportError:
    print "Failed to load settings."
    sys.exit(1)
    
def flat(l):
    return [item for sublist in l for item in sublist]
    
def create_update_rdf(config):
    xml = """<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:em="http://www.mozilla.org/2004/em-rdf#">
    <rdf:Description
        rdf:about="urn:mozilla:extension:%s">
        <em:updates>
            <rdf:Seq>
                <rdf:li>
                    <rdf:Description>
                        <em:version>%s</em:version>
                        %s
                    </rdf:Description>
                </rdf:li>
            </rdf:Seq>
        </em:updates>
    </rdf:Description>"""
    
    update_xml = """<!--  %%s -->
                        <em:targetApplication>
                            <rdf:Description>
                                <em:id>%%s</em:id>
                                <em:minVersion>%%s</em:minVersion>
                                <em:maxVersion>%%s</em:maxVersion>
                                <em:updateLink>%s</em:updateLink>
                            </rdf:Description>
                        </em:targetApplication>""" % config.get("update_file")
                        
    app_data = flat(config.get("applications_data").values())
    updates = []
    for data in app_data:
        updates.append(update_xml % (data))
    return xml % (config.get("extension_id"), config.get("version"), "\n".join(updates))
    
def main():
    config = dict(settings.configs.get("nightly"))
    config["version"] = "%s.r%s" %(config["version"], get_reveision(config))
    build_extension(config)
    with open(os.path.join(config.get("project_root"), config.get("output_folder"), "update.rdf"), "w") as rdf_fp:
        rdf_fp.write(create_update_rdf(config))

if __name__ == "__main__":
    main()
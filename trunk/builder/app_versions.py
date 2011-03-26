import urllib
import HTMLParser

AMO_VERSION_PAGE = "https://addons.mozilla.org/en-US/firefox/pages/appversions/"

class AppVersionParser(HTMLParser.HTMLParser):

    def __init__(self):
        HTMLParser.HTMLParser.__init__(self)
        self._apps = []
        self._current = None
        self._read = False

    def handle_starttag(self, tag, attrs):
        if tag == "div" and ("class", "appversion prose") in attrs:
            self._current = []
        elif tag == "code" and self._current is not None:
            self._read = True

    def handle_data(self, data):
        if self._read:
            self._read = False
            self._current.append(data)

    def handle_endtag(self, tag):
        if self._current and tag == "div":
            self._apps.append(self._current)
            self._current = None

    def get_apps(self):
        return self._apps

    def get_latest(self):
        return [(uuid, versions.split(", ")[-1])
                for uuid, versions in self._apps]

def get_app_versions():
    try:
        data = urllib.urlopen(AMO_VERSION_PAGE).read()
    except IOError:
        return {}
    parser = AppVersionParser()
    parser.feed(data)
    parser.close()
    return dict(parser.get_latest())

if __name__ == "__main__":
    print get_app_versions()
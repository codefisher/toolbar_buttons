import sys
import os
import codecs
import json
import urllib2
from urlparse import urlparse

def main():
    input_folder, output_folder = sys.argv[1], sys.argv[2]
    for file_name in os.listdir(input_folder):
        with codecs.open(os.path.join(input_folder, file_name), "rw", encoding='utf-8') as fp:
            try:
                data = json.load(fp)
            except ValueError:
                raise ValueError("Failed to parse settings file: " + file_name)
        if "amo_download" in data:
            url = data["amo_download"]
            response = urllib2.urlopen(url)
            new_url = response.geturl()
            output_file = urlparse(new_url).path.rpartition("/")[2].replace("+", "-")
            with open(os.path.join(output_folder, output_file), "w") as out:
                out.write(response.read())
            download_link = "https://codefisher.org/static/xpi/" + output_file
            if data.get('download_link') != download_link:
                print(file_name)
                print(download_link)
                print("-" * 30)

if __name__ == "__main__":
    main()
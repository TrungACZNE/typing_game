#!/usr/bin/env python2

from functools import wraps
import json
import os.path
import re
import tarfile
import time
import urllib2
import xml.etree.ElementTree as ET
import zipfile


def cache(cache_filename, encoder="text", no_dump=False):
    def cache_decorator(func):
        @wraps(func)
        def func_wrapper(*args, **kwargs):
            str_content = None
            existed = False

            if (os.path.exists(cache_filename)):
                existed = True

            if not existed:
                enc_content = func(*args, **kwargs)

                if not no_dump:
                    if encoder == "json":
                        str_content = json.dumps(enc_content)
                    else:
                        str_content = enc_content
                    open(cache_filename, "w").write(str_content)
            elif not no_dump:
                str_content = open(cache_filename).read()

            if not no_dump:
                if encoder == "json":
                    enc_content = json.loads(str_content)
                else:
                    enc_content = str_content
                return enc_content

        return func_wrapper
    return cache_decorator


def load_url(url):
    return urllib2.urlopen(url).read()


@cache("cache/rdf-files.tar.zip")
def load_gutenberg_catalog_zipped():
    return load_url("https://www.gutenberg.org/cache/epub/feeds/rdf-files.tar.zip")


@cache("cache/rdf-files.tar", no_dump=True)
def load_gutenberg_catalog_tar():
    f = zipfile.ZipFile("cache/rdf-files.tar.zip", "r")
    f.extractall("cache/")
    f.close()


@cache("cache", no_dump=True)
def load_gutenberg_catalog():
    f = tarfile.open("cache/rdf-files.tar")
    f.extractall(".")
    f.close()


@cache("catalog", encoder="json")
def load_catalog():
    def parse_rdf(path):
        tree = ET.parse(path)
        root = tree.getroot()

        pgterms = "http://www.gutenberg.org/2009/pgterms/"
        dcterms = "http://purl.org/dc/terms/"
        rdf = "http://www.w3.org/1999/02/22-rdf-syntax-ns#"

        title = root.find(".//{%s}title" % dcterms)
        title = title.text if title is not None else None

        name = root.find(".//{%s}name" % pgterms)
        name = name.text if name is not None else None

        formats = root.findall(".//{%s}file" % pgterms)
        txt_url = None
        for f in formats:
            if f.attrib["{%s}about" % rdf].endswith(".txt"):
                txt_url = f.attrib["{%s}about" % rdf]
                break

        return title, name, txt_url

    catalog = {}
    for root, dirs, files in os.walk('cache/'):
        for f in files:
            if f.endswith(".rdf"):
                path = os.path.join(root, f)
                title, name, txt_url = parse_rdf(path)
                if not txt_url:
                    print "\"{}\" does not have a txt url".format(f)
                else:
                    print "\"{}\" DOES have a txt url".format(f)
                catalog[f[:-4]] = {
                    "title": title,
                    "author": name,
                    "txt_url": txt_url
                }
    return catalog


def main():
    print "Downloading zip file ..."
    load_gutenberg_catalog_zipped()
    print "Unzipping ..."
    load_gutenberg_catalog_tar()
    print "Untarring ..."
    load_gutenberg_catalog()
    print "Building catalog ..."
    load_catalog()


if __name__ == "__main__":
    main()

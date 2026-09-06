#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""按关键词在 Wikimedia Commons 上搜索公有领域 / CC BY-SA 的真实历史图片，
打印候选结果（文件名、直链、许可、作者、尺寸），供人工挑选。
用法: python3 tools/fetch_commons.py "Isaac Newton portrait"
"""
import json
import sys
import urllib.parse
import urllib.request

API = "https://commons.wikimedia.org/w/api.php"
UA = "NewtonEduSite/1.0 (educational static site; contact: local)"


def api(params):
    params = dict(params, format="json")
    url = API + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def search(kw, limit=8):
    d = api({
        "action": "query",
        "list": "search",
        "srsearch": f"filetype:bitmap {kw}",
        "srnamespace": 6,
        "srlimit": limit,
    })
    return [h["title"] for h in d.get("query", {}).get("search", [])]


def info(titles):
    d = api({
        "action": "query",
        "titles": "|".join(titles),
        "prop": "imageinfo",
        "iiprop": "url|size|extmetadata|mime",
        "iiurlwidth": 1200,
    })
    out = []
    for pid, page in d.get("query", {}).get("pages", {}).items():
        ii = page.get("imageinfo")
        if not ii:
            continue
        m = ii[0]
        em = m.get("extmetadata", {})
        g = lambda k: (em.get(k, {}).get("value") or "").strip()
        lic = g("LicenseShortName")
        if any(x in lic.lower() for x in ("fair use", "non-free")):
            continue
        out.append({
            "title": page["title"],
            "thumb": m.get("thumburl"),
            "full": m.get("url"),
            "w": m.get("width"),
            "h": m.get("height"),
            "lic": lic,
            "author": g("Artist")[:120],
            "credit": g("Credit")[:120],
            "desc": g("ImageDescription")[:180],
            "date": g("DateTimeOriginal")[:40],
        })
    return out


def main():
    kws = sys.argv[1:] or [
        "Isaac Newton Kneller portrait 1702",
        "Woolsthorpe Manor Newton birthplace",
        "Newton reflecting telescope replica",
        "Philosophiae Naturalis Principia Mathematica 1687 title page",
        "Isaac Newton tomb Westminster Abbey",
        "Newton prism experiment dispersive",
        "Isaac Newton statue Trinity College Cambridge",
        "Newton apple tree Botanic Gardens Cambridge",
        "Edmond Halley portrait",
        "Royal Society Isaac Newton president",
    ]
    for kw in kws:
        print("=" * 78)
        print("QUERY:", kw)
        try:
            titles = search(kw)
            for it in info(titles):
                print(f"  - {it['title']}")
                print(f"    lic   : {it['lic']}  |  {it.get('date','')}")
                print(f"    author: {it['author']}")
                print(f"    size  : {it['w']}x{it['h']}")
                print(f"    thumb : {it['thumb']}")
        except Exception as e:
            print("  ERROR:", e)


if __name__ == "__main__":
    main()

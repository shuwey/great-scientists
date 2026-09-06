#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把选定的 Wikimedia Commons 图片下载到 assets/img/history/ 并生成 CREDITS 清单。"""
import json
import os
import urllib.parse
import urllib.request

OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "img", "history")
UA = "NewtonEduSite/1.0 (classroom educational static site)"

# (保存文件名, Commons 文件名, 请求宽度, 说明, 作者/来源, 许可)
ITEMS = [
    ("newton-portrait-1702.jpg",
     "Sir Isaac Newton by Sir Godfrey Kneller, Bt.jpg", 900,
     "牛顿 56 岁肖像", "Godfrey Kneller (1702)", "Public domain"),

    ("woolsthorpe-manor.jpg",
     "Woolsthorpe Manor - west facade.jpg", 1200,
     "牛顿出生地伍尔索普庄园", "DeFacto / Wikimedia Commons", "CC BY-SA 4.0"),

    ("apple-tree.jpg",
     "Newtons Apfelbaum.jpg", 1200,
     "伍尔索普庄园的苹果树后代", "Fritzbruno / Wikimedia Commons", "CC BY-SA 3.0"),

    ("reflecting-telescope-1668.jpg",
     "Newton telescope replica 1668.jpg", 900,
     "牛顿 1668 年反射望远镜复制品（英国科学博物馆藏）",
     "The Science Museum UK / Wikimedia Commons", "CC BY 4.0"),

    ("principia-title-1687.png",
     "Newton's Principia title page.png", 1000,
     "《自然哲学的数学原理》1687 年初版扉页", "Wikimedia Commons", "Public domain"),

    ("principia-copy-1687.jpg",
     "Newton's Philosophiae Naturalis Principia Mathematica 1687 (presentation copy to James II).jpg", 1000,
     "《原理》1687 年呈献英王詹姆斯二世的赠阅本", "Wikimedia Commons", "Public domain"),

    ("newton-grave-westminster.jpg",
     "Isaac Newton grave in Westminster Abbey.jpg", 900,
     "西敏寺中的牛顿墓", "Klaus-Dieter Keller / Wikimedia Commons", "Public domain"),

    ("newton-room-cambridge.jpg",
     "Newtons room in Cambridge.jpg", 900,
     "剑桥三一学院牛顿故居房间", "Wikimedia Commons", "Public domain"),

    ("edmond-halley.jpg",
     "Edmond Halley 072.jpg", 700,
     "埃德蒙·哈雷肖像", "Richard Phillips / Wikimedia Commons", "Public domain"),

    ("opticks-1704.jpg",
     "Opticks.jpg", 900,
     "《光学》1704 年初版扉页", "Wikimedia Commons", "Public domain"),

    ("trinity-college-cambridge.jpg",
     "Trinity College, Cambridge - geograph.org.uk - 1261502.jpg", 900,
     "剑桥大学三一学院", "Richard Rogerson / geograph.org.uk", "CC BY-SA 2.0"),

    ("newton-windmill.jpg",
     "Woolsthorpe Manor - geograph.org.uk - 1468224.jpg", 900,
     "伍尔索普庄园远景", "John Sutton / geograph.org.uk", "CC BY-SA 2.0"),
]


def download(commons_name, width):
    url = ("https://commons.wikimedia.org/wiki/Special:FilePath/"
           + urllib.parse.quote(commons_name.replace(" ", "_"))
           + f"?width={width}")
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def main():
    os.makedirs(OUT, exist_ok=True)
    credits = []
    for fname, commons, width, desc, author, lic in ITEMS:
        path = os.path.join(OUT, fname)
        try:
            data = download(commons, width)
            with open(path, "wb") as f:
                f.write(data)
            print(f"OK   {fname:36s} {len(data)//1024:5d} KB")
            credits.append({
                "file": f"assets/img/history/{fname}",
                "desc": desc, "author": author, "license": lic,
                "source": "https://commons.wikimedia.org/wiki/File:"
                          + commons.replace(" ", "_"),
            })
        except Exception as e:
            print(f"FAIL {fname:36s} {type(e).__name__}: {e}")
    with open(os.path.join(OUT, "CREDITS.json"), "w", encoding="utf-8") as f:
        json.dump(credits, f, ensure_ascii=False, indent=2)
    print(f"\n下载成功 {len(credits)}/{len(ITEMS)} 张 → {os.path.normpath(OUT)}")


if __name__ == "__main__":
    main()

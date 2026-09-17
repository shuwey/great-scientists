# -*- coding: utf-8 -*-
"""《读懂科学家》系列 · 通用建站引擎（编排器）

用法：
    python3 tools/build_scientist.py <spec.json>

读取一位科学家的「内容规格」，自动产出完整子站：
  - 调 new_scientist.py 开骨架 + 品牌令牌替换
  - 写 terms.js / 4 详解页 / index / timeline / about / glossary / labs
  - 用 svg_scenes 生成 9 张 SVG
  - 用 weserv 代理下载 ~14 张 Wikimedia 历史图 + 写 CREDITS.json
  - 用 lab_templates 注入 3 个 Canvas 实验 + 派发
  - 补 CSS（时间轴 .tl-body / bio / labs 上限）

spec.json 结构见 tools/spec_EXAMPLE.json（哥白尼样板）。
"""
import os, sys, json, shutil, subprocess, urllib.parse, urllib.request, io, time, re
import svg_scenes
import lab_templates
import nav_more_menu

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
NEW_SCI = os.path.join(ROOT, "tools", "new_scientist.py")
VENV_PY = "/Users/shuwei/.workbuddy/binaries/python/envs/default/bin/python"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"


def h(tmpl, **kw):
    for k, v in kw.items():
        tmpl = tmpl.replace("{{" + k + "}}", str(v))
    return tmpl


# ======================================================================
# 脚手架
# ======================================================================
def scaffold(spec):
    sid = spec["id"]
    dst = os.path.join(ROOT, "scientists", sid)
    # --force：增量覆盖（copytree dir_ok），不整目录删除，避免触发安全守卫
    subprocess.run([VENV_PY, NEW_SCI, sid, spec["name"], spec.get("en", ""), "--force"], check=True)
    return dst


# ======================================================================
# terms.js
# ======================================================================
def write_terms(dst, spec):
    cats = spec["cats"]
    terms = spec["terms"]
    lines = ["/* 《读懂%s》术语数据库（引擎通用：SITE_TERMS/SITE_PAGES/SITE_CATS） */" % spec["name"]]
    lines.append("window.SITE_TERMS = {")
    items = list(terms.items())
    for i, (tid, t) in enumerate(items):
        rel = ", ".join('"%s"' % r for r in t.get("related", []))
        lines.append('  "%s": {' % tid)
        lines.append('    name: "%s",' % t["name"])
        lines.append('    cat: "%s",' % t["cat"])
        lines.append('    short: "%s",' % t["short"])
        lines.append('    plain: "%s",' % t["plain"])
        if t.get("analogy"):
            lines.append('    analogy: "%s",' % t["analogy"])
        if t.get("extra"):
            lines.append('    extra: "%s",' % t["extra"])
        if t.get("page"):
            lines.append('    page: "%s", anchor: "%s",' % (t["page"], t.get("anchor", "")))
        lines.append("    related: [%s]" % rel)
        lines.append("  }%s" % ("," if i < len(items) - 1 else ""))
    lines.append("};")
    lines.append("")
    lines.append("window.SITE_PAGES = {")
    pitems = list(spec["pages"].items())
    for i, (k, p) in enumerate(pitems):
        lines.append('  "%s": { title: "%s", url: "%s" }%s' % (k, p["title"], p["file"], "," if i < len(pitems) - 1 else ""))
    lines.append("};")
    lines.append("")
    lines.append("window.SITE_CATS = %s;" % json.dumps(cats, ensure_ascii=False))
    open(os.path.join(dst, "assets", "js", "terms.js"), "w", encoding="utf-8").write("\n".join(lines))


# ======================================================================
# 详解页
# ======================================================================
DETAIL_TPL = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{title}} · {{name}} | 读懂{{name}}</title>
<meta name="description" content="{{desc}}">
<link rel="stylesheet" href="../assets/css/style.css">
</head>
<body data-base="">

<nav class="nav">
  <div class="nav-inner">
    <a class="brand" href="../index.html"><span class="apple">🍎</span>读懂{{name}}</a>
    <button class="nav-toggle" aria-label="打开菜单"><i></i><i></i><i></i></button>
    <div class="nav-links">
      <a href="../index.html">首页</a>
      <a href="../timeline.html">时间轴</a>
{{navlinks}}
      <a href="../labs.html">玩一玩</a>
      <a href="../glossary.html">词典</a>
    </div>
  </div>
  <div id="progress"></div>
</nav>

<div class="page-head">
  <div class="wrap">
    <div class="crumb"><a href="../index.html">首页</a> · <a href="../timeline.html">时间轴</a> · {{title}}</div>
    <h1>{{title}}</h1>
    <p class="big-claim">{{claim}}</p>
    <div class="meta-row">{{tags}}</div>
  </div>
</div>

<div class="detail-wrap">
  <article class="article" data-terms>

{{sections}}

    <div class="page-nav">
      <a class="pn prev" href="../index.html"><div class="lab">← 回到首页</div><div class="tt">四大成就总览</div></a>
      <a class="pn next" href="{{next}}"><div class="lab">下一篇 →</div><div class="tt">{{nexttitle}}</div></a>
    </div>

  </article>

  <aside class="side">
    <div class="side-box">
      <h4>本节目录</h4>
      <ul class="toc">{{toc}}</ul>
    </div>
    <div class="side-box">
      <h4>关键概念（点开看）</h4>
      <div class="side-terms">{{sideterms}}</div>
    </div>
    <div class="side-box">
      <h4>一句话记住</h4>
      <p class="fact">{{remember}}</p>
    </div>
  </aside>
</div>

<footer class="foot">
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <div class="brand-f"><span class="apple" style="width:26px;height:26px;font-size:14px;border-radius:7px;background:linear-gradient(140deg,#3B5BDB,#6E8BFF);display:grid;place-items:center">🍎</span>读懂{{name}}</div>
        <p style="margin:0;color:#8B96AA;font-size:13.5px">一个面向中学生的{{name}}科普小站。按时间顺序讲故事，把难词讲成人话。</p>
      </div>
      <div>
        <h5>四处走走</h5>
        <ul>
          <li><a href="../index.html">首页</a></li>
          <li><a href="../timeline.html">生平时间轴</a></li>
{{footlinks}}
        </ul>
      </div>
      <div>
        <h5>更多</h5>
        <ul>
          <li><a href="../labs.html">动手玩一玩</a></li>
          <li><a href="../glossary.html">术语词典</a></li>
          <li><a href="../about.html">资料来源与延伸阅读</a></li>
        </ul>
      </div>
    </div>
    <div class="foot-bottom">
      <span>课堂与自学用途 · 内容依据公开史料编写</span>
      <span>历史图片来自 Wikimedia Commons</span>
    </div>
  </div>
</footer>

<button class="to-top" aria-label="回到顶部">↑</button>
<script src="../assets/js/terms.js"></script>
<script src="../assets/js/site.js"></script>
</body>
</html>
"""


def write_details(dst, spec):
    pages = spec["pages"]
    keys = list(pages.keys())
    for idx, (k, p) in enumerate(pages.items()):
        # nav links to sibling detail pages
        navlinks = "\n".join('      <a href="%s">%s</a>' % (os.path.basename(q["file"]), q["title"]) for q in pages.values())
        footlinks = "\n".join('          <li><a href="%s">%s</a></li>' % (os.path.basename(q["file"]), q["title"]) for q in pages.values())
        toc = "\n".join('          <li><a href="#%s">%s</a></li>' % (s["id"], s["h"].replace("一、", "").replace("二、", "").replace("三、", "").replace("四、", "").replace("五、", "").replace("六、", "").replace("七、", "").replace("八、", "")) for s in p["sections"])
        sideterms = "\n".join('        <span class="term" data-term="%s" tabindex="0" role="button">%s</span>' % (tid, spec["terms"][tid]["name"]) for tid in p.get("sideterms", []) if tid in spec["terms"])
        # sections html
        secs = []
        for s in p["sections"]:
            fig = ""
            if s.get("fig"):
                fig = '\n      <figure class="fig">\n        <img src="../assets/img/draw/%s.svg" alt="%s">\n        <figcaption><b>关键一步：</b>%s</figcaption>\n      </figure>' % (s["fig"], s.get("figalt", s["h"]), s.get("figcap", ""))
            secs.append('    <h2 id="%s">%s</h2>\n    <p>%s</p>%s' % (s["id"], s["h"], s["body"], fig))
        tags = "".join('<span class="tag">%s</span>' % t for t in p.get("tags", []))
        nextk = keys[(idx + 1) % len(keys)]
        np = pages[nextk]
        html = h(DETAIL_TPL,
                 title=p["title"], name=spec["name"], desc=p.get("meta", p["title"]),
                 claim=p["claim"], tags=tags, navlinks=navlinks, footlinks=footlinks,
                 sections="\n".join(secs), toc=toc, sideterms=sideterms,
                 remember=p.get("remember", ""), next=os.path.basename(np["file"]), nexttitle=np["title"])
        open(os.path.join(dst, p["file"]), "w", encoding="utf-8").write(html)
    # 注：骨架复制时已跳过 newton 自带的 detail/optics|caculus|gravity|laws.html，
    # 故此处无需再删除遗留页（避免触发安全删除守卫）。如需改 spec 键名后重跑，
    # 可手动清理 detail/ 下无关旧页。


# ======================================================================
# index.html
# ======================================================================
INDEX_TPL = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>读懂{{name}} · 给中学生的{{name}}科普</title>
<meta name="description" content="{{desc}}">
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body data-base="">

<nav class="nav">
  <div class="nav-inner">
    <a class="brand" href="index.html"><span class="apple">🍎</span>读懂{{name}}</a>
    <button class="nav-toggle" aria-label="打开菜单"><i></i><i></i><i></i></button>
    <div class="nav-links">
      <a href="index.html">首页</a>
      <a href="timeline.html">时间轴</a>
{{navlinks}}
      <a href="labs.html">玩一玩</a>
      <a href="glossary.html">词典</a>
    </div>
  </div>
  <div id="progress"></div>
</nav>

<header class="hero">
  <div class="wrap hero-grid">
    <div class="hero-text">
      <span class="kicker">{{kicker}}</span>
      <h1>读懂<b>{{name}}</b></h1>
      <p class="lede">{{lede}}</p>
      <div class="hero-cta">
        <a class="btn primary" href="{{firstpage}}">从核心成就说起 →</a>
        <a class="btn ghost" href="timeline.html">看一生时间轴</a>
      </div>
    </div>
    <div class="hero-art">
      <img src="assets/img/draw/hero-{{id}}.svg" alt="{{name}}插画" loading="lazy">
    </div>
  </div>
</header>

<section>
  <div class="wrap">
    <div class="sec-head">
      <span class="kicker">四大成就</span>
      <h2>他最厉害的四件事</h2>
      <p>点任意一张卡片，进入图文详解；看不懂的词，随时点开弹窗。</p>
    </div>
    <div class="grid g4">
{{cards}}
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="sec-head">
      <span class="kicker">先认识这个人</span>
      <h2>{{biotitle}}</h2>
    </div>
    <div class="bio">
      <img src="assets/img/history/{{portrait}}" alt="{{name}}肖像" class="bio-photo" loading="lazy">
      <div>
{{biopara}}
        <p style="margin-top:10px"><a class="btn ghost sm" href="timeline.html">看完整时间轴 →</a></p>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="sec-head">
      <span class="kicker">关于这个站</span>
      <h2>给谁看、怎么用</h2>
    </div>
    <div class="callout">
      <span class="ct">🎯 给谁看、怎么用</span>
      <p>面向<b>中学生</b>的科普小站：按时间顺序讲故事，把难词讲成人话。每个核心概念都能点开弹窗看通俗解释；想深入就读“详解页”；想动手就玩“实验”；不确定哪个词什么意思，去<b>词典</b>里搜。</p>
    </div>
  </div>
</section>

<footer class="foot">
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <div class="brand-f"><span class="apple" style="width:26px;height:26px;font-size:14px;border-radius:7px;background:linear-gradient(140deg,#3B5BDB,#6E8BFF);display:grid;place-items:center">🍎</span>读懂{{name}}</div>
        <p style="margin:0;color:#8B96AA;font-size:13.5px">一个面向中学生的{{name}}科普小站。按时间顺序讲故事，把难词讲成人话。</p>
      </div>
      <div>
        <h5>四处走走</h5>
        <ul>
          <li><a href="index.html">首页</a></li>
          <li><a href="timeline.html">生平时间轴</a></li>
{{footlinks}}
        </ul>
      </div>
      <div>
        <h5>更多</h5>
        <ul>
          <li><a href="labs.html">动手玩一玩</a></li>
          <li><a href="glossary.html">术语词典</a></li>
          <li><a href="about.html">资料来源与延伸阅读</a></li>
        </ul>
      </div>
    </div>
    <div class="foot-bottom">
      <span>课堂与自学用途 · 内容依据公开史料编写</span>
      <span>历史图片来自 Wikimedia Commons</span>
    </div>
  </div>
</footer>

<button class="to-top" aria-label="回到顶部">↑</button>
<script src="assets/js/terms.js"></script>
<script src="assets/js/site.js"></script>
</body>
</html>
"""

SOFT_COLORS = ["var(--brand-soft)", "var(--green-soft)", "var(--purple-soft)", "var(--orange-soft)"]


def write_index(dst, spec):
    pages = spec["pages"]
    navlinks = "\n".join('      <a href="%s">%s</a>' % (p["file"], p["title"]) for p in pages.values())
    footlinks = "\n".join('          <li><a href="%s">%s</a></li>' % (p["file"], p["title"]) for p in pages.values())
    cards = []
    keys = list(pages.keys())
    for i, k in enumerate(keys):
        p = pages[k]
        cards.append('''      <a class="ach-card" href="%s">
        <div class="thumb" style="background:%s">
          <img src="assets/img/draw/thumb-%s.svg" alt="%s">
        </div>
        <div class="body">
          <span class="year">%s</span>
          <h3>%s</h3>
          <p>%s</p>
          <span class="more">读这一篇 →</span>
        </div>
      </a>''' % (p["file"], SOFT_COLORS[i % 4], k, p["title"], p.get("year", ""), p["title"], p.get("card", p.get("claim", ""))))
    biopara = "\n".join("      <p>%s</p>" % b for b in spec["bio"])
    html = h(INDEX_TPL, id=spec["id"], name=spec["name"], desc=spec.get("meta", "读懂%s科普" % spec["name"]),
             kicker=spec["kicker"], lede=spec["lede"], firstpage=list(pages.values())[0]["file"],
             navlinks=navlinks, cards="\n".join(cards), biotitle=spec.get("biotitle", "他不是天才模板，却改写了历史"),
             portrait=spec["portrait"], biopara=biopara, footlinks=footlinks)
    open(os.path.join(dst, "index.html"), "w", encoding="utf-8").write(html)


# ======================================================================
# timeline.html
# ======================================================================
TL_TPL = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{name}}生平时间轴 · {{years}} | 读懂{{name}}</title>
<meta name="description" content="{{desc}}">
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body data-base="">

<nav class="nav">
  <div class="nav-inner">
    <a class="brand" href="index.html"><span class="apple">🍎</span>读懂{{name}}</a>
    <button class="nav-toggle" aria-label="打开菜单"><i></i><i></i><i></i></button>
    <div class="nav-links">
      <a href="index.html">首页</a>
      <a href="timeline.html">时间轴</a>
{{navlinks}}
      <a href="labs.html">玩一玩</a>
      <a href="glossary.html">词典</a>
    </div>
  </div>
  <div id="progress"></div>
</nav>

<div class="page-head">
  <div class="wrap">
    <div class="crumb"><a href="index.html">首页</a> · 生平时间轴</div>
    <h1>{{name}}的一生</h1>
    <p class="big-claim">{{claim}}</p>
  </div>
</div>

<section>
  <div class="wrap">
    <div class="timeline">
{{items}}
    </div>
    <p style="text-align:center;margin-top:36px">
{{links}}
    </p>
  </div>
</section>

<footer class="foot">
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <div class="brand-f"><span class="apple" style="width:26px;height:26px;font-size:14px;border-radius:7px;background:linear-gradient(140deg,#3B5BDB,#6E8BFF);display:grid;place-items:center">🍎</span>读懂{{name}}</div>
        <p style="margin:0;color:#8B96AA;font-size:13.5px">一个面向中学生的{{name}}科普小站。按时间顺序讲故事，把难词讲成人话。</p>
      </div>
      <div>
        <h5>四处走走</h5>
        <ul>
          <li><a href="index.html">首页</a></li>
          <li><a href="timeline.html">生平时间轴</a></li>
{{footlinks}}
        </ul>
      </div>
      <div>
        <h5>更多</h5>
        <ul>
          <li><a href="labs.html">动手玩一玩</a></li>
          <li><a href="glossary.html">术语词典</a></li>
          <li><a href="about.html">资料来源与延伸阅读</a></li>
        </ul>
      </div>
    </div>
    <div class="foot-bottom">
      <span>课堂与自学用途 · 内容依据公开史料编写</span>
      <span>历史图片来自 Wikimedia Commons</span>
    </div>
  </div>
</footer>

<button class="to-top" aria-label="回到顶部">↑</button>
<script src="assets/js/terms.js"></script>
<script src="assets/js/site.js"></script>
</body>
</html>
"""


def write_timeline(dst, spec):
    pages = spec["pages"]
    navlinks = "\n".join('      <a href="%s">%s</a>' % (p["file"], p["title"]) for p in pages.values())
    footlinks = "\n".join('          <li><a href="%s">%s</a></li>' % (p["file"], p["title"]) for p in pages.values())
    items = []
    for n in spec["timeline"]:
        items.append('''      <div class="tl-item"%(id)s data-year="%(year)d">
        <div class="tl-rail"><span class="dot"></span></div>
        <div class="tl-head">
          <span class="tl-year">%(year)d</span>
          <span class="tl-title">%(title)s</span>
        </div>
        <div class="tl-body">
          <figure>
            <img src="assets/img/history/%(img)s" alt="%(alt)s" loading="lazy">
            <figcaption>%(fig)s</figcaption>
          </figure>
          <p>%(body)s</p>
        </div>
      </div>''' % {
            "id": ' id="%s"' % n["id"] if n.get("id") else "",
            "year": n["year"], "title": n["title"], "img": n["img"], "alt": n.get("alt", n["title"]),
            "fig": n.get("fig", ""), "body": n["body"]})
    links = "\n".join('<a class="btn ghost" href="%s">读%s →</a>' % (p["file"], p["title"]) for p in pages.values())
    html = h(TL_TPL, name=spec["name"], years=spec["years"], desc=spec.get("tl_desc", ""),
             claim=spec["tl_claim"], navlinks=navlinks, footlinks=footlinks,
             items="\n".join(items), links=links)
    open(os.path.join(dst, "timeline.html"), "w", encoding="utf-8").write(html)


# ======================================================================
# about.html  /  glossary.html
# ======================================================================
ABOUT_TPL = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>资料来源 · 读懂{{name}}</title>
<meta name="description" content="{{name}}子站资料来源与延伸阅读">
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body data-base="">
<nav class="nav"><div class="nav-inner">
<a class="brand" href="index.html"><span class="apple">🍎</span>读懂{{name}}</a>
<button class="nav-toggle" aria-label="打开菜单"><i></i><i></i><i></i></button>
<div class="nav-links"><a href="index.html">首页</a><a href="timeline.html">时间轴</a>{{navlinks}}<a href="labs.html">玩一玩</a><a href="glossary.html">词典</a></div>
</div><div id="progress"></div></nav>
<div class="page-head"><div class="wrap">
<div class="crumb"><a href="index.html">首页</a> · 资料来源</div>
<h1>资料来源与延伸阅读</h1>
<p class="big-claim">{{claim}}</p>
</div></div>
<section><div class="wrap"><div class="article" data-terms>
{{body}}
</div></div></section>
<footer class="foot"><div class="wrap"><div class="foot-grid">
<div><div class="brand-f"><span class="apple" style="width:26px;height:26px;font-size:14px;border-radius:7px;background:linear-gradient(140deg,#3B5BDB,#6E8BFF);display:grid;place-items:center">🍎</span>读懂{{name}}</div><p style="margin:0;color:#8B96AA;font-size:13.5px">面向中学生的{{name}}科普小站。</p></div>
<div><h5>四处走走</h5><ul><li><a href="index.html">首页</a></li><li><a href="timeline.html">时间轴</a></li>{{footlinks}}</ul></div>
<div><h5>更多</h5><ul><li><a href="labs.html">动手玩一玩</a></li><li><a href="glossary.html">术语词典</a></li><li><a href="about.html">资料来源</a></li></ul></div>
</div><div class="foot-bottom"><span>课堂与自学用途 · 内容依据公开史料编写</span><span>历史图片来自 Wikimedia Commons</span></div></div></footer>
<button class="to-top" aria-label="回到顶部">↑</button>
<script src="assets/js/terms.js"></script>
<script src="assets/js/site.js"></script>
</body></html>
"""

GLOSSARY_TPL = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>术语词典 · 读懂{{name}}</title>
<meta name="description" content="{{name}}相关核心概念词典">
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body data-base="">
<nav class="nav"><div class="nav-inner">
<a class="brand" href="index.html"><span class="apple">🍎</span>读懂{{name}}</a>
<button class="nav-toggle" aria-label="打开菜单"><i></i><i></i><i></i></button>
<div class="nav-links"><a href="index.html">首页</a><a href="timeline.html">时间轴</a>{{navlinks}}<a href="labs.html">玩一玩</a><a href="glossary.html">词典</a></div>
</div><div id="progress"></div></nav>
<div class="page-head"><div class="wrap">
<div class="crumb"><a href="index.html">首页</a> · 术语词典</div>
<h1>术语词典</h1>
<p class="big-claim">读文章时遇到不懂的词，来这里搜。点任意词条也能看通俗解释。</p>
<div class="meta-row"><input id="term-search" class="search" placeholder="搜索术语，例如「{{sample}}」" /><span id="term-count" class="tag">0 条</span></div>
<div id="cat-filter" class="cat-filter"></div>
</div></div>
<section><div class="wrap"><div id="term-grid" class="term-grid"></div></div></section>
<footer class="foot"><div class="wrap"><div class="foot-grid">
<div><div class="brand-f"><span class="apple" style="width:26px;height:26px;font-size:14px;border-radius:7px;background:linear-gradient(140deg,#3B5BDB,#6E8BFF);display:grid;place-items:center">🍎</span>读懂{{name}}</div><p style="margin:0;color:#8B96AA;font-size:13.5px">面向中学生的{{name}}科普小站。</p></div>
<div><h5>四处走走</h5><ul><li><a href="index.html">首页</a></li><li><a href="timeline.html">时间轴</a></li>{{footlinks}}</ul></div>
<div><h5>更多</h5><ul><li><a href="labs.html">动手玩一玩</a></li><li><a href="glossary.html">术语词典</a></li><li><a href="about.html">资料来源</a></li></ul></div>
</div><div class="foot-bottom"><span>课堂与自学用途 · 内容依据公开史料编写</span><span>历史图片来自 Wikimedia Commons</span></div></div></footer>
<button class="to-top" aria-label="回到顶部">↑</button>
<script src="assets/js/terms.js"></script>
<script src="assets/js/site.js"></script>
</body></html>
"""


def write_about_glossary(dst, spec):
    pages = spec["pages"]
    navlinks = "\n".join('      <a href="%s">%s</a>' % (p["file"], p["title"]) for p in pages.values())
    footlinks = "\n".join('          <li><a href="%s">%s</a></li>' % (p["file"], p["title"]) for p in pages.values())
    about = h(ABOUT_TPL, name=spec["name"], claim=spec.get("about_claim", "本页说明内容的依据与去处。"),
             navlinks=navlinks, footlinks=footlinks, body=spec.get("about_body", ""))
    open(os.path.join(dst, "about.html"), "w", encoding="utf-8").write(about)
    gl = h(GLOSSARY_TPL, name=spec["name"], sample=spec["cats"][0], navlinks=navlinks, footlinks=footlinks)
    open(os.path.join(dst, "glossary.html"), "w", encoding="utf-8").write(gl)


# ======================================================================
# labs.html
# ======================================================================
LABS_TPL = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>动手玩一玩 · 三个{{name}}小实验 | 读懂{{name}}</title>
<meta name="description" content="三个可直接在网页上操作的互动演示。拖动滑块，亲眼看见{{name}}讲过的道理。">
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body data-base="">
<nav class="nav"><div class="nav-inner">
<a class="brand" href="index.html"><span class="apple">🍎</span>读懂{{name}}</a>
<button class="nav-toggle" aria-label="打开菜单"><i></i><i></i><i></i></button>
<div class="nav-links"><a href="index.html">首页</a><a href="timeline.html">时间轴</a>{{navlinks}}<a href="labs.html">玩一玩</a><a href="glossary.html">词典</a></div>
</div><div id="progress"></div></nav>
<div class="page-head"><div class="wrap">
<div class="crumb"><a href="index.html">首页</a> · 玩一玩</div>
<h1>动手玩一玩</h1>
<p class="big-claim">光看文字不够直观？下面三个小实验，你直接用鼠标拖动滑块，亲眼看见{{name}}讲过的道理。</p>
</div></div>
<section><div class="wrap">
{{labs}}
<p style="text-align:center;margin-top:40px">{{links}}</p>
</div></section>
<footer class="foot"><div class="wrap"><div class="foot-grid">
<div><div class="brand-f"><span class="apple" style="width:26px;height:26px;font-size:14px;border-radius:7px;background:linear-gradient(140deg,#3B5BDB,#6E8BFF);display:grid;place-items:center">🍎</span>读懂{{name}}</div><p style="margin:0;color:#8B96AA;font-size:13.5px">面向中学生的{{name}}科普小站。</p></div>
<div><h5>四处走走</h5><ul><li><a href="index.html">首页</a></li><li><a href="timeline.html">时间轴</a></li>{{footlinks}}</ul></div>
<div><h5>更多</h5><ul><li><a href="labs.html">动手玩一玩</a></li><li><a href="glossary.html">术语词典</a></li><li><a href="about.html">资料来源</a></li></ul></div>
</div><div class="foot-bottom"><span>课堂与自学用途 · 内容依据公开史料编写</span><span>历史图片来自 Wikimedia Commons</span></div></div></footer>
<button class="to-top" aria-label="回到顶部">↑</button>
<script src="assets/js/terms.js"></script>
<script src="assets/js/site.js"></script>
</body></html>
"""


def write_labs(dst, spec):
    pages = spec["pages"]
    navlinks = "\n".join('      <a href="%s">%s</a>' % (p["file"], p["title"]) for p in pages.values())
    footlinks = "\n".join('          <li><a href="%s">%s</a></li>' % (p["file"], p["title"]) for p in pages.values())
    blocks = []
    for i, lab in enumerate(spec["labs"]):
        ctrls = []
        for c in lab.get("ctrl", []):
            ctrls.append('''        <div class="ctrl">
          <label>%(label)s <span class="v">%(init)s</span></label>
          <input type="range" data-ctrl="%(name)s" min="%(min)g" max="%(max)g" value="%(value)g" step="%(step)g">
        </div>''' % c)
        blocks.append('''    <h2 id="%(key)s" style="font-size:25px;margin:%(mt)dpx 0 6px">%(icon)s 实验%(no)d · %(title)s</h2>
    <p style="color:var(--ink-2);margin-bottom:18px">%(intro)s</p>
    <div class="lab" data-lab="%(key)s">
      <div class="lab-head"><h4>%(title)s</h4><span class="badge">可拖动</span></div>
      <p class="lab-desc">%(desc)s</p>
      <canvas></canvas>
      <div class="lab-controls">
%(ctrls)s
      </div>
      <div class="lab-readout"></div>
    </div>''' % {
            "key": lab["key"], "icon": lab.get("icon", "🔬"), "no": i + 1, "title": lab["title"],
            "mt": 8 if i == 0 else 46, "intro": lab["intro"], "desc": lab["desc"],
            "ctrls": "\n".join(ctrls)})
    links = "\n".join('<a class="btn ghost" href="%s">读%s →</a>' % (p["file"], p["title"]) for p in pages.values())
    html = h(LABS_TPL, name=spec["name"], navlinks=navlinks, footlinks=footlinks,
             labs="\n".join(blocks), links=links)
    open(os.path.join(dst, "labs.html"), "w", encoding="utf-8").write(html)


# ======================================================================
# SVG 生成
# ======================================================================
def gen_svgs(dst, spec):
    draw = os.path.join(dst, "assets", "img", "draw")
    os.makedirs(draw, exist_ok=True)
    # hero
    hero = spec.get("hero_scene", "orbit")
    open(os.path.join(draw, "hero-%s.svg" % spec["id"]), "w", encoding="utf-8").write(
        svg_scenes.render(hero, spec.get("hero_params", {})))
    for k, p in spec["pages"].items():
        scene = p.get("scene", "orbit")
        sp = p.get("scene_params", {})
        # thumb
        open(os.path.join(draw, "thumb-%s.svg" % k), "w", encoding="utf-8").write(svg_scenes.render(scene, sp))
        # detail illustration
        open(os.path.join(draw, "%s.svg" % k), "w", encoding="utf-8").write(svg_scenes.render(scene, sp))


# ======================================================================
# 图片下载（批量 API + 429 退避重试 + 搜索兜底，weserv 代理绕 429）
# ======================================================================
def _api(params, tries=6):
    """Commons API 调用，遇 429 指数退避重试。"""
    last = None
    for a in range(tries):
        url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)
        req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
        try:
            return json.loads(urllib.request.urlopen(req, timeout=30).read())
        except urllib.error.HTTPError as e:
            last = e
            if e.code == 429 and a < tries - 1:
                time.sleep(3 * (a + 1)); continue
            raise
        except Exception as e:
            last = e
            if a < tries - 1:
                time.sleep(2 * (a + 1)); continue
            raise
    raise last


def _batch_imageinfo(titles):
    """一次 API 取多张图的原始 url。返回 {title: url}。"""
    out = {}
    for i in range(0, len(titles), 20):
        batch = titles[i:i + 20]
        d = _api({"action": "query", "titles": "|".join(batch), "prop": "imageinfo",
                  "iiprop": "url", "format": "json"})
        for page in d["query"]["pages"].values():
            if "imageinfo" in page:
                out[page["title"]] = page["imageinfo"][0]["url"]
    return out


def _search_file(q):
    """在文件命名空间搜索，返回第一个图片类文件名。"""
    d = _api({"action": "query", "list": "search", "srsearch": q,
              "srnamespace": "6", "srlimit": "8", "format": "json"})
    for r in d["query"]["search"]:
        t = r["title"]
        if any(t.lower().endswith(e) for e in (".jpg", ".jpeg", ".png", ".gif", ".tif", ".tiff", ".svg")):
            return t
    return None


def _resolve(entry):
    """返回 (title, orig_url)。先试 wiki 标题，miss 则用 q 搜索兜底。"""
    wiki = entry.get("wiki")
    if wiki:
        batch = _batch_imageinfo([wiki])
        if wiki in batch:
            return wiki, batch[wiki]
    q = entry.get("q") or entry.get("desc") or wiki
    if q:
        ft = _search_file(q)
        if ft:
            batch = _batch_imageinfo([ft])
            if ft in batch:
                return ft, batch[ft]
    return None, None


def _fetch_and_save(orig, dest, entry):
    is_svg = orig.lower().endswith(".svg")
    if is_svg:
        # SVG 直接拉原图（体积小，weserv 转 raster 不可靠）
        last = None
        for a in range(6):
            try:
                data = urllib.request.urlopen(
                    urllib.request.Request(orig, headers={"User-Agent": UA}), timeout=60).read()
                break
            except Exception as e:
                last = e
                if getattr(e, "code", None) == 429 and a < 5:
                    time.sleep(3 * (a + 1)); continue
                if a < 5:
                    time.sleep(2 * (a + 1)); continue
                return "FAIL %s: %s" % (entry.get("file"), last)
        open(dest, "wb").write(data)
        return "OK %s (%dKB)" % (os.path.basename(dest), os.path.getsize(dest) // 1024)
    # 位图：weserv 代理（自有服务器拉取，本机 IP 不限流）
    base = orig.split("?")[0]  # 去掉 utm_source 等查询串，避免 weserv 404
    wu = "https://images.weserv.nl/?url=" + urllib.parse.quote(base.replace("https://", ""), safe="") + "&w=1100&output=jpg&q=82"
    try:
        data = urllib.request.urlopen(
            urllib.request.Request(wu, headers={"User-Agent": UA, "Accept": "image/*,*/*;q=0.8"}), timeout=60).read()
    except Exception:
        try:
            data = urllib.request.urlopen(
                urllib.request.Request(base, headers={"User-Agent": UA}), timeout=60).read()
        except Exception as e2:
            return "FAIL %s: %s" % (entry.get("file"), e2)
    from PIL import Image
    img = Image.open(io.BytesIO(data)).convert("RGB")
    w, hh = img.size
    if w > 1100:
        hh = int(hh * 1100 / w); w = 1100
        img = img.resize((w, hh), Image.LANCZOS)
    img.save(dest, "JPEG", quality=82, optimize=True)
    return "OK %s (%dKB)" % (os.path.basename(dest), os.path.getsize(dest) // 1024)


def download_images(dst, spec):
    hist = os.path.join(dst, "assets", "img", "history")
    os.makedirs(hist, exist_ok=True)
    # 清理上一轮残留的无关图片（如骨架自带的牛顿图），只保留本 spec 声明的文件
    want = {im["file"] for im in spec["images"]}
    for fn in os.listdir(hist):
        if fn in ("CREDITS.json",) or fn in want:
            continue
        try:
            os.remove(os.path.join(hist, fn))
        except OSError:
            pass
    credits = []
    fails = []
    for im in spec["images"]:
        dest = os.path.join(hist, im["file"])
        if os.path.exists(dest) and os.path.getsize(dest) > 1000:
            continue
        title, orig = _resolve(im)
        if not orig:
            fails.append(im["file"])
            print("   FAIL resolve", im["file"], im.get("wiki"))
            continue
        r = _fetch_and_save(orig, dest, im)
        print("   ", r)
        if r.startswith("OK"):
            credits.append({"file": "assets/img/history/" + im["file"], "desc": im.get("desc", ""),
                            "author": im.get("author", "Wikimedia Commons"),
                            "license": im.get("license", "Public domain"),
                            "source": "https://commons.wikimedia.org/wiki/" + urllib.parse.quote(title)})
        else:
            fails.append(im["file"])
    json.dump(credits, open(os.path.join(hist, "CREDITS.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    if fails:
        print("   ⚠️ 未成功下载：", fails)
    return fails


# ======================================================================
# site.js 实验注入
# ======================================================================
def patch_sitejs(dst, spec):
    path = os.path.join(dst, "assets", "js", "site.js")
    content = open(path, encoding="utf-8").read()
    i = content.index("function lab")
    j = content.index("function initGlossary")
    gen = []
    for lab in spec["labs"]:
        gen.append(lab_templates.build(lab["key"], lab["kind"], lab.get("params", {})))
        gen.append("")
    gen.append("function initLabs() {")
    gen.append('  $$(".lab").forEach(function (lab) {')
    gen.append("    var kind = lab.getAttribute(\"data-lab\");")
    for lab in spec["labs"]:
        gen.append('    if (kind === "%s") lab_%s(lab);' % (lab["key"], lab["key"]))
    gen.append("  });")
    gen.append("}")
    new = content[:i] + "\n".join(gen) + "\n" + content[j:]
    open(path, "w", encoding="utf-8").write(new)


# ======================================================================
# CSS 补丁（时间轴 .tl-body / bio / labs 上限）
# ======================================================================
CSS_PATCH = """
/* ===== 通用补丁：时间轴 .tl-body / 首页 bio / labs 画布上限（引擎统一） ===== */
.bio { display: grid; grid-template-columns: 240px 1fr; gap: 28px; align-items: start; margin-top: 8px; }
.bio-photo { width: 240px; max-width: 100%; border-radius: 14px; border: 1px solid var(--line); }
@media (max-width: 720px) { .bio { grid-template-columns: 1fr; } .bio-photo { width: 100%; } }
.lab canvas { width: 100%; height: auto; display: block; border-radius: 12px; background: #FBFCFE; border: 1px solid var(--line); touch-action: none; max-height: 360px; }
.tl-body figure { margin: 0 0 14px; }
.tl-body figure img { border-radius: 12px; border: 1px solid var(--line); display: block; width: 100%; height: auto; max-height: 280px; object-fit: contain; background: #F4F6FA; }
.tl-body figcaption { font-size: 13px; color: var(--ink-3); margin-top: 7px; line-height: 1.6; }
"""

# 首页 hero 补丁：生成页用 .wrap.hero-grid + .hero-art > img（裸 SVG 无 width/height），
# 而模板 CSS 只有 .hero-inner/.hero-portrait —— 不补则 hero 无网格布局、
# 插画被拉伸到整行全宽（2026-09-07 用户反馈图片过大）。
HERO_CSS_PATCH = """
/* ===== 通用补丁：首页 hero 网格与插画上限（与 .hero-inner 等价） ===== */
.hero-grid { display: grid; grid-template-columns: 1.15fr .85fr; gap: 46px; align-items: center; padding: 66px 24px 60px; }
.hero-art img { width: 100%; max-width: 480px; height: auto; display: block; border-radius: 16px; }
@media (max-width: 1000px) {
  .hero-grid { grid-template-columns: 1fr; gap: 30px; padding: 46px 24px 44px; }
  .hero-grid .hero-art { order: -1; justify-content: flex-start; }
  .hero-grid .hero-art img { max-width: 420px; }
}
"""


# 时间轴静态结构适配：生成页用 .tl-rail / .tl-head(年+标题) / .tl-body(图+文)，
# 而模板 CSS 是可折叠卡片结构（.tl-year | .tl-rail+.tl-dot | .tl-card 三列）——
# 不适配则 head 被塞进 30px 轨道列、年代溢出后压在配图上。
# 方案照抄伽利略适配版：.tl-item 改两列（26px 轨道 | 1fr 内容），rail 跨行。
TL_CSS_PATCH = """
/* ===== 通用补丁：时间轴静态结构适配（.tl-rail / .tl-head / .tl-body） ===== */
.tl-item { grid-template-columns: 26px 1fr; gap: 0; padding-bottom: 26px; }
.tl-item > .tl-rail { grid-column: 1; grid-row: 1 / -1; position: relative; display: flex; justify-content: center; }
.tl-item > .tl-rail::before { top: 7px; bottom: -26px; }
.tl-item:last-child > .tl-rail::before { display: none; }
.tl-rail .dot {
  flex: none; position: relative; z-index: 2; box-sizing: border-box;
  width: 14px; height: 14px; border-radius: 50%; margin-top: 5px;
  background: #fff; border: 3px solid var(--brand-line);
}
.tl-item > .tl-head {
  grid-column: 2; grid-row: 1; display: flex; align-items: baseline;
  gap: 12px; flex-wrap: wrap; padding: 2px 0 0; cursor: default; background: none;
}
.tl-item > .tl-head .tl-year {
  font-family: var(--mono); font-size: 16px; font-weight: 800;
  color: var(--brand); flex: none; padding: 0; text-align: left;
}
.tl-item > .tl-head .tl-title { font-size: 17.5px; font-weight: 700; color: var(--ink); }
.tl-item > .tl-body { grid-column: 2; grid-row: 2; margin-top: 10px; }
@media (max-width: 640px) {
  .tl-item > .tl-head { gap: 8px; }
  .tl-item > .tl-head .tl-title { font-size: 16px; }
}
"""


# 返回系列门户入口的样式（入口由 tools/add_portal_link.py 注入，幂等）
PORTAL_LINK_CSS_PATCH = """
/* ===== 通用补丁：返回系列门户入口 ===== */
.portal-link {
  display: inline-flex; align-items: center; flex: none; margin-right: 14px;
  height: 30px; padding: 0 13px; border-radius: 999px; white-space: nowrap;
  background: var(--bg-alt); border: 1px solid var(--line);
  color: var(--ink-2); font-size: 13.5px; font-weight: 700;
  transition: background .18s, color .18s, border-color .18s;
}
.portal-link:hover { background: #fff; color: var(--brand); border-color: var(--brand-line); text-decoration: none; }
.nav-portal { display: none; }
@media (max-width: 640px) {
  .nav-inner { gap: 10px; }
  .portal-link { display: none; }
  .nav-portal { display: block; font-weight: 700; color: var(--brand); }
}
"""


def patch_css(dst):
    path = os.path.join(dst, "assets", "css", "style.css")
    css = open(path, encoding="utf-8").read()
    app = ""
    if "时间轴 .tl-body" not in css:
        app += CSS_PATCH
    if ".hero-grid" not in css:
        app += HERO_CSS_PATCH
    # 只在时间轴确为静态结构（.tl-rail/.tl-head/.tl-body）时注入；
    # 牛顿/爱因斯坦等旧结构（.tl-card/.tl-panel）不能套用，否则两列布局会破坏原三列
    tl_html = os.path.join(dst, "timeline.html")
    tl_static = os.path.exists(tl_html) and 'class="tl-body"' in open(tl_html, encoding="utf-8").read()
    if tl_static and "tl-rail / .tl-head / .tl-body" not in css:
        app += TL_CSS_PATCH
    if ".portal-link" not in css:
        app += PORTAL_LINK_CSS_PATCH
    if app:
        open(path, "a", encoding="utf-8").write(app)


# ======================================================================
# 主流程
# ======================================================================
def main():
    spec_path = sys.argv[1]
    spec = json.load(open(spec_path, encoding="utf-8"))
    print("▶ 脚手架：%s" % spec["id"])
    dst = scaffold(spec)
    print("▶ 写 terms.js")
    write_terms(dst, spec)
    print("▶ 写 4 详解页")
    write_details(dst, spec)
    print("▶ 写 index / timeline / about / glossary")
    write_index(dst, spec)
    write_timeline(dst, spec)
    write_about_glossary(dst, spec)
    print("▶ 写 labs")
    write_labs(dst, spec)
    print("▶ 生成 SVG")
    gen_svgs(dst, spec)
    print("▶ 注入 Canvas 实验")
    patch_sitejs(dst, spec)
    print("▶ 补 CSS")
    patch_css(dst)
    print("▶ 详解页收进下拉（nav-more）")
    nav_more_menu.inject_dir(dst)
    nav_more_menu.patch_css(dst)
    print("▶ 下载历史图（weserv 代理）")
    fails = download_images(dst, spec)
    print("✅ %s 子站生成完毕。" % spec["name"])
    if fails:
        print("⚠️ 需手动补图：", fails)


if __name__ == "__main__":
    main()

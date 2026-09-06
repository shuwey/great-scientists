#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""《读懂牛顿》全站静态校验：资源/锚点/术语/ SVG / JS / 控件绑定。"""
import os, re, sys, json, subprocess, xml.dom.minidom as minidom

ROOT = "/Users/shuwei/WorkBuddy/读懂牛顿"
NODE = "/Users/shuwei/.workbuddy/binaries/node/versions/22.22.2-2/bin/node"
TERMS_JS = os.path.join(ROOT, "assets/js/terms.js")

SKIP_DIRS = ("prototype", ".workbuddy", ".git", "__pycache__")
IGNORE_RES = ("http://", "https://", "//", "mailto:", "javascript:", "data:", "tel:")
VOID = {"area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"}

errors, warns, oks = [], [], []
def E(m): errors.append(m)
def W(m): warns.append(m)
def O(m): oks.append(m)

# ---------- 收集 HTML 文件 ----------
htmls = []
for dp, _, fs in os.walk(ROOT):
    if any(s in dp.split(os.sep) for s in SKIP_DIRS):
        continue
    for f in fs:
        if f.endswith(".html"):
            htmls.append(os.path.join(dp, f))
htmls.sort()

# ---------- 0. 先全量收集每个文件的 id / name（避免前向引用误报） ----------
file_ids = {}
all_ids_dup = {}
for hp in htmls:
    txt = open(hp, encoding="utf-8").read()
    ids = set(re.findall(r'\bid="([^"]+)"', txt))
    names = set(re.findall(r'\bname="([^"]+)"', txt))
    ids |= names
    file_ids[hp] = ids

# ---------- 1. 逐文件：资源/锚点/术语/重复 id ----------
all_terms_used = set()
for hp in htmls:
    rel = os.path.relpath(hp, ROOT)
    txt = open(hp, encoding="utf-8").read()
    base = os.path.dirname(hp)
    ids = file_ids[hp]

    # 重复 id
    seen = {}
    for i in re.findall(r'\bid="([^"]+)"', txt):
        seen[i] = seen.get(i, 0) + 1
    dup = sorted([i for i, n in seen.items() if n > 1])
    if dup:
        E("[%s] 重复 id: %s（锚点会指向第一个，其余失效）" % (rel, ", ".join(dup)))

    # 资源与锚点
    for m in re.finditer(r'(?:href|src)="([^"]+)"', txt):
        v = m.group(1)
        if any(v.startswith(p) for p in IGNORE_RES) or v == "":
            continue
        if v.startswith("#"):
            frag = v[1:]
            if frag and frag not in ids:
                E("[%s] 页内锚点 #%s 不存在" % (rel, frag))
            continue
        if "#" in v:
            path, frag = v.split("#", 1)
        else:
            path, frag = v, None
        target = os.path.normpath(os.path.join(base, path)) if path else hp
        if not os.path.exists(target):
            E("[%s] 缺失资源/链接: %s" % (rel, v))
        elif frag and frag.lstrip("#") not in file_ids.get(target, set()):
            E("[%s] 跨页锚点 %s#%s 在目标页不存在" % (rel, path, frag))

    # data-term
    for tid in re.findall(r'data-term="([^"]+)"', txt):
        all_terms_used.add(tid)

# ---------- 2. 术语库完整性（通过 node 载入） ----------
dump_js = 'global.window={};require(%s);const w=global.window;process.stdout.write(JSON.stringify({t:w.NEWTON_TERMS,p:w.NEWTON_PAGES,c:w.NEWTON_CATS}));' % json.dumps(TERMS_JS)
try:
    out = subprocess.run([NODE, "-e", dump_js], capture_output=True, text=True, timeout=30)
    data = json.loads(out.stdout)
    TERMS, PAGES, CATS = data["t"], data["p"], data["c"]
except Exception as e:
    E("无法载入 terms.js: %s" % e)
    TERMS = PAGES = CATS = {}

if TERMS:
    O("术语库载入：%d 条；页面 %d 个；分类 %d 个" % (len(TERMS), len(PAGES), len(CATS)))
    keys = set(TERMS.keys())
    # 正文用到的术语是否都合法
    bad_used = sorted(all_terms_used - keys)
    if bad_used:
        E("正文引用了不存在的术语 id: %s" % ", ".join(bad_used))
    else:
        O("正文全部 %d 个 data-term 均合法" % len(all_terms_used))
    # 每条术语字段与跳转
    for tid, t in TERMS.items():
        for fld in ("short", "plain", "analogy"):
            if not t.get(fld):
                E("术语 %s 缺字段 %s" % (tid, fld))
        cat = t.get("cat")
        if cat and cat not in CATS:
            E("术语 %s 的分类 %r 未在 NEWTON_CATS 定义" % (tid, cat))
        for rel in (t.get("related") or []):
            if rel not in keys:
                E("术语 %s 的关联 %s 不存在" % (tid, rel))
        pg = t.get("page")
        if pg:
            if pg not in PAGES:
                E("术语 %s 的 page=%s 未在 NEWTON_PAGES 定义" % (tid, pg))
            else:
                url = PAGES[pg].get("url", "")
                tgt = os.path.normpath(os.path.join(ROOT, url))
                if not os.path.exists(tgt):
                    E("术语 %s 跳转目标 %s 不存在" % (tid, url))
                else:
                    anc = (t.get("anchor") or "").lstrip("#")
                    if anc and anc not in file_ids.get(tgt, set()):
                        E("术语 %s 的 anchor #%s 在 %s 不存在" % (tid, anc, url))
        elif t.get("anchor"):
            W("术语 %s 设了 anchor 但无 page，跳转无效" % tid)
    # 分类是否被引用
    used_cats = {t.get("cat") for t in TERMS.values()}
    for c in CATS:
        if c not in used_cats:
            W("分类 %s 定义了但无术语使用" % c)

# ---------- 3. SVG 是否为合法 XML ----------
svg_dir = os.path.join(ROOT, "assets/img/draw")
if os.path.isdir(svg_dir):
    svgs = sorted(f for f in os.listdir(svg_dir) if f.endswith(".svg"))
    for s in svgs:
        try:
            minidom.parse(os.path.join(svg_dir, s))
        except Exception as e:
            E("SVG 非法 XML: %s (%s)" % (s, e))
    O("SVG 插图 %d 张，XML 校验完成" % len(svgs))

# ---------- 4. 历史图片存在性 ----------
hist = os.path.join(ROOT, "assets/img/history")
if os.path.isdir(hist):
    imgs = [f for f in os.listdir(hist) if f.lower().endswith((".jpg", ".jpeg", ".png"))]
    O("历史图片 %d 张" % len(imgs))

# ---------- 5. JS 语法 ----------
for js in ("assets/js/terms.js", "assets/js/site.js"):
    p = os.path.join(ROOT, js)
    if os.path.exists(p):
        r = subprocess.run([NODE, "--check", p], capture_output=True, text=True)
        if r.returncode == 0:
            O("%s 语法通过" % js)
        else:
            E("%s 语法错误:\n%s" % (js, r.stderr.strip()))

# ---------- 6. 图片裁切风险 object-fit:cover ----------
cover_hits = []
for dp, _, fs in os.walk(ROOT):
    if any(s in dp.split(os.sep) for s in SKIP_DIRS):
        continue
    for f in fs:
        if f.endswith((".css", ".html")):
            t = open(os.path.join(dp, f), encoding="utf-8").read()
            for mm in re.finditer(r'object-fit\s*:\s*cover', t):
                cover_hits.append(os.path.relpath(os.path.join(dp, f), ROOT))
if cover_hits:
    E("发现 object-fit:cover（有裁切风险）: %s" % ", ".join(sorted(set(cover_hits))))
else:
    O("无 object-fit:cover 裁切风险")

# ---------- 7. labs 控件 ↔ site.js 绑定 ----------
labs = os.path.join(ROOT, "labs.html")
sitejs = os.path.join(ROOT, "assets/js/site.js")
if os.path.exists(labs) and os.path.exists(sitejs):
    lt = open(labs, encoding="utf-8").read()
    st = open(sitejs, encoding="utf-8").read()
    html_ctrls = set(re.findall(r'data-ctrl="([^"]+)"', lt))
    # site.js 用 $('[data-ctrl="X"]', lab) 这类选择器读取，直接按字面量提取
    js_ctrls = set(re.findall(r'data-ctrl="([^"]+)"', st))
    missing = html_ctrls - js_ctrls
    unused = js_ctrls - html_ctrls
    if missing:
        E("labs 有控件但 site.js 未处理: %s" % ", ".join(sorted(missing)))
    if unused:
        W("site.js 引用了 labs 不存在的控件: %s" % ", ".join(sorted(unused)))
    if not missing:
        O("labs 控件 ↔ site.js 绑定一致: %s" % ", ".join(sorted(html_ctrls)) or "（无）")

# ---------- 汇总 ----------
print("=" * 64)
print("全站校验报告")
print("=" * 64)
for m in oks: print("  ✅ " + m)
for m in warns: print("  ⚠️  " + m)
for m in errors: print("  ❌ " + m)
print("-" * 64)
print("通过 %d · 警告 %d · 错误 %d" % (len(oks), len(warns), len(errors)))
print("=" * 64)
sys.exit(1 if errors else 0)

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""《读懂科学家》系列 · 全站静态校验（多科学家版）

校验范围：
  - 全站 HTML 的 资源/锚点/跨页锚点/重复 id
  - 每位科学家的术语库完整性（字段、关联、跳转目标）
  - 每位科学家的 SVG 是否为合法 XML
  - 每位科学家的 JS 语法
  - 每位科学家 labs 控件 ↔ site.js 绑定
  - 全站 object-fit:cover 裁切风险

ROOT 自动取脚本所在目录的父目录（即项目根），不再写死路径。
"""
import os, re, sys, json, subprocess, glob, shutil, xml.dom.minidom as minidom

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))


def _find_node():
    """动态定位 node：先扫托管版本目录（取的版本号会随升级变化），再退回 PATH。"""
    base = "/Users/shuwei/.workbuddy/binaries/node/versions"
    cands = sorted(glob.glob(os.path.join(base, "*", "bin", "node")))
    for c in reversed(cands):          # 优先较新版本
        if os.path.isfile(c) and os.access(c, os.X_OK):
            return c
    return shutil.which("node") or "node"


NODE = _find_node()

SKIP_DIRS = (".git", ".workbuddy", "__pycache__", "node_modules", "prototype", "tools")
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

# ---------- 0. 全量收集每个文件的 id / name（避免前向引用误报） ----------
file_ids = {}
for hp in htmls:
    txt = open(hp, encoding="utf-8").read()
    ids = set(re.findall(r'\bid="([^"]+)"', txt))
    ids |= set(re.findall(r'\bname="([^"]+)"', txt))
    file_ids[hp] = ids

# ---------- 1. 逐文件：资源/锚点/重复 id（全站） ----------
for hp in htmls:
    rel = os.path.relpath(hp, ROOT)
    txt = open(hp, encoding="utf-8").read()
    base = os.path.dirname(hp)
    ids = file_ids[hp]

    seen = {}
    for i in re.findall(r'\bid="([^"]+)"', txt):
        seen[i] = seen.get(i, 0) + 1
    dup = sorted([i for i, n in seen.items() if n > 1])
    if dup:
        E("[%s] 重复 id: %s（锚点会指向第一个，其余失效）" % (rel, ", ".join(dup)))

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

# ---------- 2. 逐科学家：术语库 / SVG / JS / labs ----------
def find_scientists():
    sites = []
    sd = os.path.join(ROOT, "scientists")
    if os.path.isdir(sd):
        for name in sorted(os.listdir(sd)):
            d = os.path.join(sd, name)
            if os.path.isdir(d) and os.path.isfile(os.path.join(d, "assets/js/terms.js")):
                sites.append((name, d))
    return sites

def load_terms(terms_js):
    dump = ('global.window={};require(%s);const w=global.window;'
            'process.stdout.write(JSON.stringify({'
            't:w.SITE_TERMS||w.NEWTON_TERMS,'
            'p:w.SITE_PAGES||w.NEWTON_PAGES,'
            'c:w.SITE_CATS||w.NEWTON_CATS}));') % json.dumps(terms_js)
    try:
        out = subprocess.run([NODE, "-e", dump], capture_output=True, text=True, timeout=30)
        return json.loads(out.stdout)
    except Exception as e:
        E("无法载入 %s: %s" % (terms_js, e))
        return {}

for sname, sdir in find_scientists():
    O("=== 科学家子站：%s (%s) ===" % (sname, os.path.relpath(sdir, ROOT)))
    terms_js = os.path.join(sdir, "assets/js/terms.js")
    data = load_terms(terms_js)
    TERMS, PAGES, CATS = data.get("t") or {}, data.get("p") or {}, data.get("c") or []
    if TERMS:
        O("  术语库载入：%d 条；页面 %d 个；分类 %d 个" % (len(TERMS), len(PAGES), len(CATS)))
    else:
        W("  %s 术语库为空或载入失败" % sname)

    # 该子站自己的 html
    shtmls = [h for h in htmls if os.path.abspath(os.path.dirname(h)) == sdir or
              os.path.abspath(h).startswith(sdir + os.sep)]

    # 子站内 data-term 收集
    used_here = set()
    for hp in shtmls:
        t = open(hp, encoding="utf-8").read()
        for tid in re.findall(r'data-term="([^"]+)"', t):
            used_here.add(tid)

    if TERMS:
        keys = set(TERMS.keys())
        bad = sorted(used_here - keys)
        if bad:
            E("  [%s] 正文引用了不存在的术语 id: %s" % (sname, ", ".join(bad)))
        else:
            O("  正文 %d 个 data-term 均合法" % len(used_here))
        for tid, t in TERMS.items():
            for fld in ("short", "plain", "analogy"):
                if not t.get(fld):
                    E("  术语 %s 缺字段 %s" % (tid, fld))
            cat = t.get("cat")
            if cat and cat not in CATS:
                E("  术语 %s 的分类 %r 未在分类表定义" % (tid, cat))
            for rel in (t.get("related") or []):
                if rel not in keys:
                    E("  术语 %s 的关联 %s 不存在" % (tid, rel))
            pg = t.get("page")
            if pg:
                if pg not in PAGES:
                    E("  术语 %s 的 page=%s 未在页面表定义" % (tid, pg))
                else:
                    url = PAGES[pg].get("url", "")
                    tgt = os.path.normpath(os.path.join(sdir, url))
                    if not os.path.exists(tgt):
                        E("  术语 %s 跳转目标 %s 不存在" % (tid, url))
                    else:
                        anc = (t.get("anchor") or "").lstrip("#")
                        if anc and anc not in file_ids.get(tgt, set()):
                            E("  术语 %s 的 anchor #%s 在 %s 不存在" % (tid, anc, url))
            elif t.get("anchor"):
                W("  术语 %s 设了 anchor 但无 page，跳转无效" % tid)
        used_cats = {t.get("cat") for t in TERMS.values()}
        for c in CATS:
            if c not in used_cats:
                W("  分类 %s 定义了但无术语使用" % c)

    # SVG 校验
    svg_dir = os.path.join(sdir, "assets/img/draw")
    if os.path.isdir(svg_dir):
        svgs = sorted(f for f in os.listdir(svg_dir) if f.endswith(".svg"))
        for s in svgs:
            try:
                minidom.parse(os.path.join(svg_dir, s))
            except Exception as e:
                E("  SVG 非法 XML: %s (%s)" % (s, e))
        O("  SVG 插图 %d 张，XML 校验完成" % len(svgs))

    # JS 语法
    js_dir = os.path.join(sdir, "assets/js")
    if os.path.isdir(js_dir):
        for js in sorted(f for f in os.listdir(js_dir) if f.endswith(".js")):
            p = os.path.join(js_dir, js)
            r = subprocess.run([NODE, "--check", p], capture_output=True, text=True)
            if r.returncode == 0:
                O("  %s 语法通过" % js)
            else:
                E("  %s 语法错误:\n%s" % (js, r.stderr.strip()))

    # labs 控件绑定
    labs = os.path.join(sdir, "labs.html")
    sitejs = os.path.join(sdir, "assets/js/site.js")
    if os.path.exists(labs) and os.path.exists(sitejs):
        lt = open(labs, encoding="utf-8").read()
        st = open(sitejs, encoding="utf-8").read()
        html_ctrls = set(re.findall(r'data-ctrl="([^"]+)"', lt))
        js_ctrls = set(re.findall(r'data-ctrl="([^"]+)"', st))
        missing = html_ctrls - js_ctrls
        unused = js_ctrls - html_ctrls
        if missing:
            E("  labs 有控件但 site.js 未处理: %s" % ", ".join(sorted(missing)))
        if unused:
            W("  site.js 引用了 labs 不存在的控件: %s" % ", ".join(sorted(unused)))
        if not missing:
            O("  labs 控件 ↔ site.js 绑定一致: %s" % (", ".join(sorted(html_ctrls)) or "（无）"))

# ---------- 3. 全站 object-fit:cover 裁切风险 ----------
cover_hits = []
for dp, _, fs in os.walk(ROOT):
    if any(s in dp.split(os.sep) for s in SKIP_DIRS):
        continue
    for f in fs:
        if f.endswith((".css", ".html")):
            t = open(os.path.join(dp, f), encoding="utf-8").read()
            for _ in re.finditer(r'object-fit\s*:\s*cover', t):
                cover_hits.append(os.path.relpath(os.path.join(dp, f), ROOT))
if cover_hits:
    E("发现 object-fit:cover（有裁切风险）: %s" % ", ".join(sorted(set(cover_hits))))
else:
    O("无 object-fit:cover 裁切风险")

# ---------- 汇总 ----------
print("=" * 64)
print("全站校验报告（多科学家）")
print("=" * 64)
for m in oks: print("  ✅ " + m)
for m in warns: print("  ⚠️  " + m)
for m in errors: print("  ❌ " + m)
print("-" * 64)
print("通过 %d · 警告 %d · 错误 %d" % (len(oks), len(warns), len(errors)))
print("=" * 64)
sys.exit(1 if errors else 0)

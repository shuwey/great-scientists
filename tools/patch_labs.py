#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把 tools/newlabs/<site>.py 里的实验规格，应用到对应子站的 labs.html 与 site.js。

规格文件需导出：
  SITE   = "hawking"
  TITLE  = "动手玩一玩 · 三个霍金小实验 | 读懂霍金"
  META   = "……"
  CLAIM  = "光看文字不够直观？……"
  LABS   = [ {id,h2,intro,kind,card,badge,desc,controls:[{ctrl,label,v,min,max,value,step}],
              callout:"…", callout_cls:""}, ×3 ]
  FUNCS  = [("lab_x", "  function lab_x(lab) { … }"), …]   # 顺序即写入顺序
  INIT   = [("bh","lab_bh"), …]                              # data-lab -> 函数名

用法：
  python3 tools/patch_labs.py copernicus kepler …      只处理指定站
  python3 tools/patch_labs.py --all                    处理 newlabs/ 下全部
  python3 tools/patch_labs.py --check copernicus       只做语法/一致性检查，不落盘
"""
import os
import re
import sys
import json
import importlib.util

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SITES = os.path.join(ROOT, "scientists")
NEWLABS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "newlabs")

H2_FIRST = "font-size:25px;margin:8px 0 6px"
H2_REST = "font-size:25px;margin:46px 0 6px"


def match_brace(src, i):
    """src[i] == '{'，返回配对的 '}' 下标。"""
    depth = 0
    while i < len(src):
        if src[i] == "{":
            depth += 1
        elif src[i] == "}":
            depth -= 1
            if depth == 0:
                return i
        i += 1
    raise ValueError("括号不配对")


def load_spec(site):
    path = os.path.join(NEWLABS, site + ".py")
    if not os.path.isfile(path):
        return None
    spec = importlib.util.spec_from_file_location("newlab_" + site, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def build_lab_html(labs):
    out = []
    for n, L in enumerate(labs):
        cnt = list(L["controls"])
        ctrls = []
        for c in cnt:
            vdef = c.get("v", "")
            ctrls.append(
                '        <div class="ctrl">\n'
                '          <label>%s <span class="v">%s</span></label>\n'
                '          <input type="range" data-ctrl="%s" min="%s" max="%s" value="%s" step="%s">\n'
                '        </div>' % (c["label"], vdef, c["ctrl"], c["min"], c["max"], c["value"], c["step"])
            )
        fire = '      <button class="btn lab-fire" style="margin-top:16px">%s</button>\n' % L["fire"] if L.get("fire") else ""
        out.append(
            '    <h2 id="%s" style="%s">%s</h2>\n'
            '    <p style="color:var(--ink-2);margin-bottom:18px">%s</p>\n'
            '    <div class="lab" data-lab="%s">\n'
            '      <div class="lab-head"><h4>%s</h4><span class="badge">%s</span></div>\n'
            '      <p class="lab-desc">%s</p>\n'
            '      <canvas></canvas>\n'
            '      <div class="lab-controls">\n%s\n      </div>\n'
            '%s'
            '      <div class="lab-readout"></div>\n'
            '    </div>\n'
            '%s'
            % (L["id"], H2_FIRST if n == 0 else H2_REST, L["h2"], L["intro"], L["kind"],
               L["card"], L["badge"], L["desc"], "\n".join(ctrls), fire, build_callout(L))
        )
    return "\n".join(out)


def build_callout(L):
    if not L.get("callout"):
        return ""
    cls = (" " + L["callout_cls"]) if L.get("callout_cls") else ""
    return ('    <div class="callout%s" style="margin-top:18px">\n'
            '      <span class="ct">🧠 看明白了吗？</span>\n'
            '      <p>%s</p>\n'
            '    </div>\n\n' % (cls, L["callout"]))


def patch_html(site, mod, check=False):
    p = os.path.join(SITES, site, "labs.html")
    html = open(p, encoding="utf-8").read()
    orig = html

    html = re.sub(r'<title>.*?</title>', '<title>%s</title>' % mod.TITLE, html, count=1, flags=re.S)
    if "<meta name=\"description\"" in html:
        html = re.sub(r'<meta name="description" content=".*?">',
                      '<meta name="description" content="%s">' % mod.META, html, count=1, flags=re.S)
    html = re.sub(r'(<p class="big-claim">).*?(</p>)', r'\1%s\2' % mod.CLAIM, html, count=1, flags=re.S)

    m = re.search(r'(<section><div class="wrap">)(.*?)(<p style="text-align:center;margin-top:40px">)', html, re.S)
    if not m:
        raise SystemExit("[%s] 找不到 labs 的 section 结构" % site)
    blocks = build_lab_html(mod.LABS)
    html = html[:m.start(2)] + "\n" + blocks + "\n    " + html[m.end(2):]

    if check:
        return len(html) - len(orig)
    open(p, "w", encoding="utf-8").write(html)
    return len(html) - len(orig)


def extract_func(src, name):
    """从已存在的 site.js 里原样抽出 function <name>(…) { … }。"""
    marker = "function " + name
    i = src.index(marker)
    j = match_brace(src, src.index("{", i))
    return src[i:j + 1].rstrip("\n")


def patch_js(site, mod, check=False):
    p = os.path.join(SITES, site, "assets/js/site.js")
    src = open(p, encoding="utf-8").read()

    i = src.index("function setupCanvas")
    j = match_brace(src, src.index("{", i))
    k = src.index("function initLabs")
    k2 = match_brace(src, src.index("{", k))

    blocks = []
    names = set()
    for name, body in mod.FUNCS:
        blocks.append(body.rstrip())
        names.add(name)
    # INIT 里引用但本次未重写的函数：从原文件原样保留
    for _, fn in mod.INIT:
        if fn not in names:
            try:
                blocks.append("  " + extract_func(src, fn))
                names.add(fn)
            except ValueError:
                raise SystemExit("[%s] INIT 引用了 %s，但原文件里也没有" % (site, fn))
    funcs = "\n\n".join(blocks)

    init_lines = "\n".join('      if (kind === "%s") %s(lab);' % (kind, fn) for kind, fn in mod.INIT)
    init = ("  function initLabs() {\n"
            "    $$(\".lab\").forEach(function (lab) {\n"
            "      var kind = lab.getAttribute(\"data-lab\");\n"
            "%s\n"
            "    });\n"
            "  }" % init_lines)

    new = src[:j + 1] + "\n\n" + funcs + "\n\n" + init + src[k2 + 1:]
    if check:
        return len(new) - len(src)
    open(p, "w", encoding="utf-8").write(new)
    return len(new) - len(src)


def blank_strings(s):
    """把字符串字面量内容抹空，避免把 '[data-ctrl="x"]' 这类当成赋值语句。"""
    out = []
    i = 0
    n = len(s)
    while i < n:
        c = s[i]
        if c in "'\"":
            q = c
            j = i + 1
            while j < n:
                if s[j] == "\\":
                    j += 2
                    continue
                if s[j] == q:
                    break
                j += 1
            out.append(q + q)
            i = j + 1
        else:
            out.append(c)
            i += 1
    return "".join(out)


def _split_top(seg):
    """按顶层逗号切分（忽略括号内的逗号）。"""
    depth = 0
    start = 0
    parts = []
    for k, ch in enumerate(seg):
        if ch in "([{":
            depth += 1
        elif ch in ")]}":
            depth -= 1
        elif ch == "," and depth == 0:
            parts.append(seg[start:k])
            start = k + 1
    parts.append(seg[start:])
    return parts


def declared_names(body):
    """收集函数体内所有已声明的名字：var 声明（支持逗号连写）+ 所有函数形参。"""
    names = set()
    for m in re.finditer(r"\bvar\b", body):
        i = m.end()
        depth = 0
        while i < len(body):
            c = body[i]
            if c in "([{":
                depth += 1
            elif c in ")]}":
                if depth == 0:
                    break
                depth -= 1
            elif c in ";" and depth == 0:
                break
            i += 1
        for part in _split_top(body[m.end():i]):
            nm = re.match(r"\s*([A-Za-z_$][\w$]*)", part)
            if nm:
                names.add(nm.group(1))
    for m in re.finditer(r"\bfunction\b[^(]*\(([^)]*)\)", body):
        for part in m.group(1).split(","):
            nm = re.match(r"\s*([A-Za-z_$][\w$]*)", part)
            if nm:
                names.add(nm.group(1))
    return names


def check(site, mod):
    """静态一致性：data-lab 与 INIT 对齐、每个函数体无隐式全局变量。"""
    problems = []
    kinds_html = [L["kind"] for L in mod.LABS]
    kinds_init = [k for k, _ in mod.INIT]
    if kinds_html != kinds_init:
        problems.append("  data-lab 与 INIT 不一致：html=%s init=%s" % (kinds_html, kinds_init))
    fn_names = [f[0] for f in mod.FUNCS]
    # 未重写但被 INIT 引用的函数，需能从现有 site.js 原样取出
    src = open(os.path.join(SITES, site, "assets/js/site.js"), encoding="utf-8").read()
    for _, fn in mod.INIT:
        if fn in fn_names:
            continue
        if ("function " + fn) not in src:
            problems.append("  INIT 引用了 %s，但既未重写、原文件里也没有" % fn)
    for name, body in mod.FUNCS:
        code = blank_strings(body)
        decl = declared_names(code)
        for m in re.finditer(r"(?<![\w.$])([A-Za-z_$][\w$]*)\s*=(?!=)", code):
            v = m.group(1)
            if v not in decl:
                problems.append("  %s: 疑似未声明变量 '%s'（严格模式会抛 ReferenceError）" % (name, v))
    return problems


def main():
    args = [a for a in sys.argv[1:]]
    chk = "--check" in args
    args = [a for a in args if not a.startswith("--")]
    if not args or "--all" in sys.argv:
        args = sorted(f[:-3] for f in os.listdir(NEWLABS) if f.endswith(".py"))

    report = []
    for site in args:
        mod = load_spec(site)
        if mod is None:
            print("!! 找不到规格 tools/newlabs/%s.py" % site)
            continue
        probs = check(site, mod)
        if probs:
            print("== %s 静态检查发现问题 ==" % site)
            print("\n".join(probs))
            report.append((site, "检查未通过"))
            continue
        dh = patch_html(site, mod, chk)
        dj = patch_js(site, mod, chk)
        report.append((site, "html %+d 字 / js %+d 字%s" % (dh, dj, "（dry-run）" if chk else "")))

    print("\n".join("%-12s %s" % r for r in report))


if __name__ == "__main__":
    main()

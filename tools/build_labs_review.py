# -*- coding: utf-8 -*-
"""生成「玩一玩实验重做」本地评审页 tools/labs-review.html。

数据来源：tools/newlabs/<site>.py 的 docstring（改动理由）+ LABS 字段；
配图来源：tools/shots/new/<site>_<kind>_<state>.png —— 内联为 base64 JPEG，
        使该 HTML 自带全部图片，双击即可看、不依赖相对路径。

用法：python3 tools/build_labs_review.py
"""
import os
import io
import html
import base64
import importlib.util

from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
NEWLABS = os.path.join(ROOT, "tools", "newlabs")
SHOTS = os.path.join(ROOT, "tools", "shots", "new")

NAMES = {
    "copernicus": "哥白尼", "kepler": "开普勒", "bohr": "玻尔", "curie": "居里夫人",
    "darwin": "达尔文", "faraday": "法拉第", "feynman": "费曼", "hawking": "霍金",
    "maxwell": "麦克斯韦", "mendeleev": "门捷列夫", "pasteur": "巴斯德", "turing": "图灵",
}
BATCH1 = ["copernicus", "kepler", "bohr", "curie"]
BATCH2 = ["darwin", "faraday", "feynman", "hawking", "maxwell", "mendeleev", "pasteur", "turing"]

_cache = {}


def load(site):
    p = os.path.join(NEWLABS, site + ".py")
    spec = importlib.util.spec_from_file_location("rv_" + site, p)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def parse_changes(doc):
    """抽出「实验N 名称 —— …」条目，支持多行续写。返回 [(名称, 说明正文)]。"""
    entries = []
    for raw in (doc or "").splitlines():
        s = raw.strip()
        if not s:
            continue
        if s.startswith("实验"):
            entries.append(s)
        elif entries:
            entries[-1] += s
    out = []
    for e in entries:
        left, _, right = e.partition("——")
        out.append((left.strip(), right.strip()))
    return out


def data_uri(site, kind, state, width=620, quality=84):
    """把截图缩到指定宽并压成 JPEG，返回 data URI；不存在则 None。"""
    p = os.path.join(SHOTS, "%s_%s_%s.png" % (site, kind, state))
    if not os.path.isfile(p):
        return None
    if p not in _cache:
        im = Image.open(p).convert("RGB")
        if im.width > width:
            im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, "JPEG", quality=quality, optimize=True)
        _cache[p] = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode("ascii")
    return _cache[p]


def site_block(site, idx):
    m = load(site)
    name = NAMES.get(site, site)
    changes = parse_changes(m.__doc__)
    kept_fns = set(fn for _, fn in m.INIT) - set(fn for fn, _ in m.FUNCS)

    rows = []
    for i, L in enumerate(m.LABS):
        text = changes[i][1] if i < len(changes) else ""
        is_kept = dict(m.INIT).get(L["kind"]) in kept_fns

        if is_kept:
            cmp_html = ('<div class="cmp one"><div class="good">'
                        '<span class="tag">保留</span>%s</div></div>'
                        % (html.escape(text) or "原实现已足够好，逐字节保留"))
        else:
            if "改为" in text:
                before, _, after = text.partition("改为")
            else:
                before, after = "", text
            cmp_html = ('<div class="cmp">'
                        '<div class="bad"><span class="tag">原来</span>%s</div>'
                        '<div class="good"><span class="tag">现在</span>%s</div>'
                        "</div>" % (html.escape(before.strip("，。 ")) or "—",
                                    html.escape(after.strip("，。 ")) or "—"))

        imgs = []
        for st in ("a", "b", "c"):
            uri = data_uri(site, L["kind"], st)
            if uri:
                imgs.append('<figure><img loading="lazy" src="%s" alt="%s">'
                            '<figcaption>滑块 %s</figcaption></figure>'
                            % (uri, html.escape(L["card"]), st.upper()))
        rows.append(
            '<article class="lab"><h4>%s</h4>%s<p class="desc">%s</p>'
            '<div class="shots">%s</div></article>'
            % (html.escape(L["h2"]), cmp_html, html.escape(L["desc"]), "".join(imgs))
        )

    return ('<section class="site" id="%s"><h3>%02d · %s <span class="sid">%s</span></h3>%s</section>'
            % (site, idx, html.escape(name), site, "".join(rows)))


def build():
    order = BATCH2 + BATCH1
    blocks = [site_block(s, i + 1) for i, s in enumerate(order)]
    nav = "".join('<a href="#%s">%s</a>' % (s, html.escape(NAMES.get(s, s))) for s in order)

    doc = """<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>「玩一玩」实验重做 · 本地评审</title>
<style>
:root{--ink:#1B2530;--ink2:#5C6B82;--mute:#8B96AA;--line:#E4E8F0;--brand:#3B5BDB;}
*{box-sizing:border-box}
body{margin:0;background:#F2F4F8;color:var(--ink);
font:15px/1.65 -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif}
.wrap{max-width:1080px;margin:0 auto;padding:0 22px}
header.hero{background:linear-gradient(140deg,#22303F,#3B5BDB);color:#fff;padding:44px 0 34px;margin-bottom:26px}
header.hero h1{margin:0 0 8px;font-size:27px}
header.hero p{margin:6px 0;opacity:.9;font-size:14.5px}
.kpis{display:flex;gap:26px;flex-wrap:wrap;margin-top:18px}
.kpi b{display:block;font-size:25px;line-height:1.1}
.kpi span{font-size:12.5px;opacity:.82}
nav.jump{background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px 16px;
margin-bottom:26px;display:flex;flex-wrap:wrap;gap:8px}
nav.jump a{color:var(--brand);text-decoration:none;font-size:13.5px;font-weight:600;
border:1px solid #DCE3F5;background:#F5F8FF;border-radius:999px;padding:4px 12px}
nav.jump a:hover{background:#E7EEFF}
.note{background:#FFF8E7;border:1px solid #F3DDA6;border-left:5px solid #E8A400;border-radius:12px;
padding:14px 18px;margin-bottom:26px;font-size:14px}
.note h2{margin:0 0 6px;font-size:15.5px;color:#8A6100}
section.site{background:#fff;border:1px solid var(--line);border-radius:16px;padding:22px 22px 8px;
margin-bottom:22px}
section.site h3{margin:0 0 16px;font-size:19px;border-bottom:2px solid var(--line);padding-bottom:10px}
.sid{color:var(--mute);font-weight:500;font-size:13px;margin-left:6px}
article.lab{border-top:1px solid #F0F3F8;padding:16px 0 10px}
article.lab:first-of-type{border-top:0}
article.lab h4{margin:0 0 10px;font-size:16px}
.cmp{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:10px}
.cmp.one{grid-template-columns:1fr}
.cmp>div{border-radius:10px;padding:11px 13px;font-size:13.6px;line-height:1.55}
.cmp .bad{background:#FFF1F1;border:1px solid #FBD5D5}
.cmp .good{background:#F0FBF3;border:1px solid #CDEBD6}
.tag{display:inline-block;font-weight:700;font-size:11.5px;border-radius:6px;padding:1px 7px;margin-right:7px}
.cmp .bad .tag{background:#E03131;color:#fff}
.cmp .good .tag{background:#1B7A34;color:#fff}
p.desc{color:var(--ink2);font-size:13.6px;margin:0 0 10px}
.shots{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.shots figure{margin:0}
.shots img{width:100%%;border:1px solid var(--line);border-radius:9px;background:#fff;display:block}
.shots figcaption{text-align:center;color:var(--mute);font-size:11.5px;padding-top:4px}
footer.foot{color:var(--mute);font-size:13px;text-align:center;padding:26px 0 50px}
@media(max-width:760px){.cmp{grid-template-columns:1fr}.shots{grid-template-columns:1fr}}
</style></head><body>
<header class="hero"><div class="wrap">
<h1>「玩一玩」实验重做 · 本地评审</h1>
<p>15 位科学家子站 · 45 个互动实验的「重复与错配」修复</p>
<p>本轮：拆除全部共享模板，为 12 个站点的 36 个实验写回各科学家专属的物理 / 生物 / 化学演示</p>
<div class="kpis">
<div class="kpi"><b>12</b><span>重做站点</span></div>
<div class="kpi"><b>36</b><span>实验全部复验</span></div>
<div class="kpi"><b>0</b><span>运行时报错</span></div>
<div class="kpi"><b>0</b><span>滑块失效 / 静态读数</span></div>
</div>
</div></header>
<div class="wrap">
<nav class="jump">%s</nav>
<div class="note">
<h2>一个需要你拍板的全局问题</h2>
所有实验画布目前被样式压扁了：画布位图约 <b>1068×521</b>，但 CSS 里
<code>.lab canvas{max-height:360px;height:auto}</code> 把显示高度限制在 <b>360px</b>，
于是画面被纵向压缩（圆看起来像扁椭圆）。这是<b>改站之前就存在</b>、且全站一致的观感问题，
不影响任何交互与读数，故本轮未改动它。若你希望，我可以下一步统一放高画布。
</div>
%s
<footer class="foot">本页由 tools/build_labs_review.py 生成 · 图片内联自 tools/shots/new/（已缩图压缩）· 仅供本地评审，尚未发布上线</footer>
</div></body></html>
""" % (nav, "\n".join(blocks))

    out = os.path.join(ROOT, "tools", "labs-review.html")
    open(out, "w", encoding="utf-8").write(doc)
    print("已写出 %s（%d 站，%.1f MB）" % (out, len(order), len(doc) / 1024 / 1024))


if __name__ == "__main__":
    build()

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""以牛顿首页为准，给其余 14 个子站首页补齐牛顿独有的模块。

牛顿首页比其它站多出四样东西：
  ① 时间轴预览（折叠式，点年份展开）   ② 术语云（可点术语 + 词典入口）
  ③ 玩一玩（3 张实验卡 + labs 锚点）    ④ hero 统计卡（寿命 + 代表作）

本脚本从各站**既有产物**里提炼内容（timeline.html 的节点 / terms.js 的术语 /
labs.html 的实验描述 / 成就卡的年份），**不新写任何内容**，因此可安全批量落地。
唯一需要新写内容的是牛顿的「常见误解」模块，不在此脚本范围内。

★ 为什么用增量脚本而不是改生成器：
  tools/build_scientist.py 的模板已与产物脱节——模板里还是 🍎 emoji 与硬编码色值，
  而各站产物早已升级为 mark-standard.svg + portal 链接。重跑生成器会把站点**退回旧形态**，
  所以后续改造一律在产物上做增量，与 tools/ 下既有的 fix_*.py / patch_*.py 同一模式。

★ 为什么要作用域类 .tl-preview：
  spec 站 CSS 里有一条「静态时间轴适配」补丁 `.tl-item{grid-template-columns:26px 1fr}`
  外加 `.tl-item > .tl-rail{grid-column:1}`，会把折叠版的三列布局（年 / 轴 / 卡）压成两列。
  用 .tl-preview 作用域写特异性更高的规则覆盖它，同时不动 timeline.html 的静态版。

用法：
  python tools/align_home_modules.py --dry-run     # 只看会改什么
  python tools/align_home_modules.py               # 实际写入（幂等）
  python tools/align_home_modules.py --only bohr   # 只处理一个站
"""
import os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
SCI = os.path.join(ROOT, "scientists")
BASELINE = "newton"          # 基准站，不动
N_PREVIEW = 5                # 首页时间轴预览取几个节点
DRY = "--dry-run" in sys.argv
ONLY = None
if "--only" in sys.argv:
    ONLY = sys.argv[sys.argv.index("--only") + 1]

ARROW = ('<svg class="tl-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
         'stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>')


def pick_indices(n, k=N_PREVIEW):
    """均匀取 k 个下标（含首尾），确定性、不引入主观判断。"""
    if n <= k:
        return list(range(n))
    return sorted({round(i * (n - 1) / (k - 1)) for i in range(k)})


def strip_tags(s):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", s)).strip()


def extract_nodes(tl):
    """从 timeline.html 提取 [{y,title,body}]，兼容折叠版(.tl-panel)与静态版(.tl-body)。

    ★ 所有按类名定位的地方都必须带 `[^>]*`：手工站（牛顿/伽利略/爱因斯坦）的标签上
      被设计工具回写过 data-page-node-id，写成 `<span class="tl-title">` 这种精确匹配
      会**静默漏光**（伽利略 13 个节点会全解析不到）。本条已在本项目栽过两次。
    """
    out = []
    for b in re.split(r'(?=<div class="tl-item")', tl)[1:]:
        m = re.search(r'data-year="(\d{4})"', b)
        if not m:
            continue
        t = (re.search(r'<span class="tl-title"[^>]*>(.*?)</span>', b, re.S)
             or re.search(r'<p class="t"[^>]*>(.*?)</p>', b, re.S))
        if not t:
            continue
        body = ""
        bm = re.search(r'<div class="(?:tl-body|tl-panel)"[^>]*>', b)
        if bm:
            # 末尾两个 </div> 分别是容器与 .tl-item 的，砍掉后余下的就是内容
            body = b[bm.end():].rsplit("</div>", 2)[0].strip()
        out.append({"y": m.group(1), "title": strip_tags(t.group(1)), "body": body})
    return out


def extract_terms(js):
    """terms.js → [(id, name)]，保持文件顺序。"""
    seen, out = set(), []
    for tid, name in re.findall(r'"([a-z0-9-]+)":\s*\{\s*name:\s*"([^"]+)"', js):
        if tid not in seen:
            seen.add(tid)
            out.append((tid, name))
    return out


def extract_labs(lb):
    """labs.html → [{anchor,name,desc}]，3 个实验。"""
    out = []
    for m in re.finditer(r'<h2 id="([^"]+)"[^>]*>(.*?)</h2>', lb, re.S):
        tail = lb[m.end():]
        d = re.search(r'<p class="lab-desc"[^>]*>(.*?)</p>', tail, re.S)
        if not d:
            continue
        out.append({
            "anchor": m.group(1),
            "name": re.sub(r"^实验[一二三四五六七八九十]\s*·\s*", "", strip_tags(m.group(2))),
            "desc": strip_tags(d.group(1)),
        })
    return out


def extract_hero_stats(idx):
    """寿命 + 第一个成就（牛顿 hero 的两张统计卡）。"""
    stats = []
    m = re.search(r"(\d{4})\s*[—–-]\s*(\d{4})", idx)
    if m:
        a, b = int(m.group(1)), int(m.group(2))
        stats.append((str(b - a), "岁 · %d–%d" % (a, b)))
    m = re.search(r'<span class="year"[^>]*>([^<]*)</span>\s*<h3[^>]*>(.*?)</h3>', idx, re.S)
    if m:
        title = strip_tags(m.group(2)).split("：")[0].split(":")[0]
        stats.append((strip_tags(m.group(1)) or "—", title))
    # 第三张对齐牛顿的「4 / 大成就领域」
    n_ach = len(re.findall(r'<a class="ach-card"', idx))
    if n_ach:
        stats.append((str(n_ach), "大成就领域"))
    return stats


def node_html(n):
    return """      <div class="tl-item" data-year="{y}">
        <div class="tl-year">{y}</div>
        <div class="tl-rail"><span class="tl-dot"></span></div>
        <div class="tl-card">
          <div class="tl-head"><div style="flex:1"><p class="t">{title}</p></div>{arrow}</div>
          <div class="tl-panel">
{body}
          </div>
        </div>
      </div>""".format(y=n["y"], title=n["title"], arrow=ARROW, body=n["body"])


def build_html(nodes, terms, labs, stats):
    skills = "、".join(strip_tags(l["name"]) for l in labs[:3])
    tl = "\n".join(node_html(n) for n in nodes)
    chips = "\n".join(
        '      <span class="term" data-term="%s" tabindex="0" role="button">%s</span>' % (t, n)
        for t, n in terms)
    labs_html = "\n".join("""        <div class="card">
          <h3 style="font-size:18px;margin-bottom:8px">{name}</h3>
          <p style="font-size:15px;color:var(--ink-2);margin-bottom:16px">{desc}</p>
          <a class="btn ghost sm" href="labs.html#{anchor}">去玩 →</a>
        </div>""".format(**l) for l in labs[:3])

    return """
<!-- align:home-modules 以下三个模块由 tools/align_home_modules.py 生成（以牛顿首页为准），勿手工改 -->
<section class="align-mod" style="background:var(--card);border-top:1px solid var(--line);border-bottom:1px solid var(--line)">
  <div class="wrap">
    <div class="sec-head">
      <span class="sec-kicker">一生</span>
      <h2>他这一辈子</h2>
      <p>点开每一个年份，看看那一年发生了什么。<a href="timeline.html">查看完整时间轴 →</a></p>
    </div>
    <div class="tl-preview" data-terms>
{tl}
    </div>
  </div>
</section>

<section class="align-mod">
  <div class="wrap">
    <div class="sec-head">
      <span class="sec-kicker">随时可查</span>
      <h2>看到不懂的词，点一下就有解释</h2>
      <p>全站所有带<span style="color:var(--brand);font-weight:700;border-bottom:1.5px dotted var(--brand)">虚线下划线</span>的词都可以点击。下面这些也行，试试看。</p>
    </div>
    <div class="card" style="display:flex;flex-wrap:wrap;gap:9px">
{chips}
    </div>
    <p style="text-align:center;margin-top:20px"><a class="btn ghost" href="glossary.html">打开完整术语词典（{nt} 条）→</a></p>
  </div>
</section>

<section class="align-mod" style="background:linear-gradient(135deg,var(--brand-soft),var(--accent-soft));border-top:1px solid var(--line)">
  <div class="wrap">
    <div class="sec-head">
      <span class="sec-kicker">动手玩一玩</span>
      <h2>自己动手拖一拖，比读十遍都管用</h2>
      <p>三个可以直接在网页上操作的小演示：{skills}。</p>
    </div>
    <div class="grid g3">
{labs}
    </div>
  </div>
</section>
""".format(tl=tl, chips=chips, nt=len(terms), skills=skills, labs=labs_html)


HERO_STATS_TPL = """
      <div class="hero-stats">
{stats}
      </div>"""


def stat_line(s):
    return '<div class="stat"><div class="n">%s</div><div class="l">%s</div></div>' % s

CSS_BEGIN = "\n/* ===== align:home-modules 首页模块对齐补丁（自动生成，勿手工改）===== */\n"
CSS_END = "/* ===== /align:home-modules ===== */\n"

CSS_PATCH = """
/* 首页时间轴预览要的是**折叠版**（年 / 轴 / 卡片 三列，点标题展开），而各站 CSS 的状态不一：
   · 13 个 spec 站：有折叠版样式，但后面又被一条「静态时间轴适配」补丁
     （.tl-item{grid-template-columns:26px 1fr} + .tl-item > .tl-rail{grid-column:1}）覆盖了两列；
   · 伽利略：只保留了静态版，折叠版的 .tl-panel/.tl-arrow/.tl-card 整段都不在。
   所以这里用 .tl-preview 作用域把折叠版**整套**写全（布局 + 显隐 + 箭头 + 卡片态），
   特异性高于那条补丁，且只作用于首页预览，不动 timeline.html 的静态版。 */
.tl-preview { position: relative; padding-left: 8px; }
.tl-preview .tl-item {
  display: grid; grid-template-columns: 92px 30px 1fr; gap: 0;
  align-items: start; position: relative; padding-bottom: 8px;
}
.tl-preview .tl-item > .tl-rail { grid-column: 2; grid-row: 1; position: relative; display: flex; justify-content: center; height: 100%; }
.tl-preview .tl-item > .tl-rail::before {
  content: ""; position: absolute; top: 0; bottom: -8px; left: 50%;
  width: 2px; transform: translateX(-50%); background: var(--line-2);
}
.tl-preview .tl-item:last-child > .tl-rail::before { display: block; bottom: 40%; }
.tl-preview .tl-year {
  grid-column: 1; grid-row: 1; font-family: var(--mono); font-size: 15.5px;
  font-weight: 700; color: var(--brand); padding-top: 15px; text-align: right; padding-right: 18px;
}
.tl-preview .tl-card {
  grid-column: 3; grid-row: 1; background: var(--white); border: 1px solid var(--line);
  border-radius: 14px; margin: 8px 0; overflow: hidden;
  box-shadow: var(--shadow-s); transition: box-shadow .2s, border-color .2s;
}
.tl-preview .tl-dot {
  position: relative; z-index: 2; width: 15px; height: 15px; border-radius: 50%;
  background: var(--white); border: 3px solid var(--brand-line); margin-top: 20px;
  transition: border-color .2s, transform .2s;
}
.tl-preview .tl-head { padding: 15px 18px; cursor: pointer; display: flex; gap: 12px; align-items: flex-start; }
.tl-preview .tl-head:hover { background: var(--bg-elev); }
.tl-preview .tl-head .t { font-size: 17.5px; font-weight: 700; margin: 0; color: var(--ink); }
.tl-preview .tl-arrow { flex: none; width: 22px; height: 22px; color: var(--ink-3); transition: transform .24s; margin-top: 4px; }
.tl-preview .tl-panel { display: none; padding: 0 18px 18px; border-top: 1px dashed var(--line); }
.tl-preview .tl-panel p { font-size: 15.5px; color: var(--ink-2); margin: 14px 0; }
.tl-preview .tl-panel figure { margin: 14px 0; }
/* 配图必须 width:auto + max-width:100% + margin:0 auto（SVG 例外）——伽利略的 CSS 里
   连 .tl-panel figure img 都没有，不写这条它的预览图会撑满整张卡片。 */
.tl-preview .tl-panel figure img {
  border-radius: 12px; border: 1px solid var(--line); display: block;
  width: auto; max-width: 100%; height: auto; max-height: 280px;
  object-fit: contain; background: var(--img-bg); margin: 0 auto;
}
.tl-preview .tl-panel figure img[src$=".svg"] { width: 100%; max-width: 100%; }
.tl-preview .tl-panel figcaption { font-size: 13px; color: var(--ink-3); margin-top: 7px; line-height: 1.6; text-align: center; }
.tl-preview .tl-item.open .tl-panel { display: block; animation: fadeDown .26s ease; }
.tl-preview .tl-item.open .tl-card { border-color: var(--brand-line); box-shadow: var(--shadow-m); }
.tl-preview .tl-item.open .tl-arrow { transform: rotate(180deg); color: var(--brand); }
.tl-preview .tl-item.open .tl-dot { border-color: var(--brand); transform: scale(1.15); }
@media (max-width: 640px) {
  .tl-preview .tl-item { grid-template-columns: 58px 24px 1fr; }
  .tl-preview .tl-year { font-size: 14px; padding-right: 10px; }
}
"""


OLD_PATCH_HEAD = "/* ===== 首页模块对齐（对齐牛顿首页）"


def apply_css(css_p):
    """把 CSS 补丁写成一个**带首尾标记的整块**，升级补丁时整体替换而非重复追加。

    为什么要有标记：第一版补丁只写了布局、漏了 .tl-panel 的显隐，而伽利略的 CSS
    里折叠版整套都缺 —— 没有标记就没法「只替换补丁、不动其余 CSS」。
    """
    css = open(css_p, encoding="utf-8").read()
    block = CSS_BEGIN + CSS_PATCH + CSS_END
    # 第一版补丁是无标记地追加在文件末尾的，先摘掉，免得同一套规则留两份
    if CSS_BEGIN not in css:
        i = css.find(OLD_PATCH_HEAD)
        if i >= 0:
            css = css[:i].rstrip() + "\n"
    if CSS_BEGIN in css:
        if css.split(CSS_BEGIN, 1)[1].split(CSS_END, 1)[0] == CSS_PATCH:
            return False                      # 已是当前版本
        if not DRY:
            head, rest = css.split(CSS_BEGIN, 1)
            open(css_p, "w", encoding="utf-8").write(head + block + rest.split(CSS_END, 1)[1])
        return True
    if not DRY:
        open(css_p, "w", encoding="utf-8").write(css + block)
    return True


def process(sid):
    base = os.path.join(SCI, sid)
    idx_p = os.path.join(base, "index.html")
    if not os.path.isfile(idx_p):
        return None
    idx = open(idx_p, encoding="utf-8").read()
    done = "align:home-modules" in idx
    changed = False
    stats = extract_hero_stats(idx)
    n_stat_want = len(stats)

    # ① hero 统计卡：确保存在且卡片数与基准一致
    #    （先做这一步且独立于 done 判断：脚本升级补卡时，已对齐的站也要能补齐）
    if stats:
        if "hero-stats" not in idx:
            m = re.search(r'<div class="hero-cta"[^>]*>.*?</div>', idx, re.S)
            if m:
                idx = idx[:m.end()] + HERO_STATS_TPL.format(
                    stats="\n".join("        " + stat_line(s) for s in stats)) + idx[m.end():]
                changed = True
        else:
            cur = len(re.findall(r'class="stat"', idx))
            if cur < n_stat_want:
                head = idx.index('class="hero-stats"')
                close = idx.index("\n      </div>", head)
                idx = idx[:close] + "\n" + "\n".join(
                    "        " + stat_line(s) for s in stats[cur:]) + idx[close:]
                changed = True

    # ② 三个模块：插在「关于这个站」那个 section 之前（找不到就插在 footer 前）
    if not done:
        nodes = extract_nodes(open(os.path.join(base, "timeline.html"), encoding="utf-8").read())
        if len(nodes) < 3:
            return ("fail", sid, "时间轴节点只解析到 %d 个" % len(nodes))
        sel = [nodes[i] for i in pick_indices(len(nodes))]
        terms = extract_terms(open(os.path.join(base, "assets", "js", "terms.js"), encoding="utf-8").read())
        labs = extract_labs(open(os.path.join(base, "labs.html"), encoding="utf-8").read())
        if len(labs) < 3 or not terms:
            return ("fail", sid, "实验 %d 个 / 术语 %d 条，数据不足" % (len(labs), len(terms)))
        marker = re.search(r'<span class="sec-kicker"[^>]*>关于这个站</span>', idx)
        cut = idx.rfind("<section", 0, marker.start()) if marker else idx.find('<footer class="foot"')
        if cut < 0:
            return ("fail", sid, "找不到插入点")
        idx = idx[:cut] + build_html(sel, terms, labs, stats).lstrip("\n") + "\n" + idx[cut:]
        changed = True
    else:
        sel, nodes, terms, labs = [], [], [], []

    if not DRY and changed:
        open(idx_p, "w", encoding="utf-8").write(idx)
    # ③ CSS 补丁（带标记的整块，升级时整体替换）
    if apply_css(os.path.join(base, "assets", "css", "style.css")):
        changed = True

    if not changed:
        return ("skip", sid, "已对齐，无改动")
    if done:
        return ("ok", sid, "补齐 hero 统计卡 → %d 张" % n_stat_want)
    return ("ok", sid, "节点 %d/%d · 术语 %d · 实验 %d · 统计 %d" % (
        len(sel), len(nodes), len(terms), len(labs), n_stat_want))


def main():
    ids = sorted(d for d in os.listdir(SCI) if os.path.isdir(os.path.join(SCI, d)) and d != BASELINE)
    if ONLY:
        ids = [i for i in ids if i == ONLY] or [ONLY]
    ok = skip = fail = 0
    for sid in ids:
        r = process(sid)
        if not r:
            continue
        st, s, msg = r
        print("  %-12s %-5s %s" % (s, st, msg))
        ok += st == "ok"
        skip += st == "skip"
        fail += st == "fail"
    print("\n%s：对齐 %d · 跳过 %d · 失败 %d" % ("将处理" if DRY else "已处理", ok, skip, fail))
    return 1 if fail else 0


if __name__ == "__main__":
    sys.exit(main())

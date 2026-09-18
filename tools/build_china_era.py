# -*- coding: utf-8 -*-
"""给子站时间轴加「同期中国」对照卡片（幂等）。

做法：不改时间轴 HTML 结构，只往 timeline.html 引一个 assets/js/china.js，
由它在浏览器端遍历 `[data-year]` 节点，把卡片 append 到条目末尾。
这样重建子站也不会破坏结构，重跑本脚本即可恢复。

卡片内容（窗口匹配、**同站去重**、名词标注）全部由 tools/china_cards.py 预算好，
china.js 只是一段哑渲染器 —— 计算口径与小程序导出器共用同一份代码。

用法：
    python3 tools/build_china_era.py copernicus      # 单站
    python3 tools/build_china_era.py                 # 全部子站

窗口口径：以节点年份为中心 ±20 年。每个节点必显示朝代年号；大事/人物按
「距节点最近」全局分配，**同一条目在同一站只出现一次**，每节点每类最多 3 条。
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import china_cards as C  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
SCIENTISTS = os.path.join(ROOT, "scientists")

CSS_PATCH = """
/* ===== 通用补丁：同期中国对照（tools/build_china_era.py 注入，幂等） ===== */
.cn-note {
  margin: 14px 0 0; padding: 12px 14px; border-radius: 12px;
  background: var(--bg-alt); border: 1px solid var(--line);
  font-size: 14px; line-height: 1.65;
  grid-column: 3 / -1;  /* 万一直接落在 .tl-item 的 grid 里，跨到正文列，避免被压成竖排 */
}
.cn-note .cn-head { font-weight: 700; color: var(--ink); font-size: 13.5px; margin-bottom: 4px; }
.cn-note .cn-head b { color: var(--brand); }
.cn-note ul { list-style: none; margin: 0; padding: 0; }
.cn-note li { margin: 3px 0; color: var(--ink-2); }
.cn-note .cn-row { display: flex; gap: 8px; align-items: baseline; margin-top: 6px; }
.cn-k {
  flex: none; font-weight: 700; font-size: 12px; color: var(--ink);
  padding: 2px 9px; background: var(--white); border: 1px solid var(--line); border-radius: 999px;
}
.cn-fig b { color: var(--ink); }
.cn-fig i { font-style: normal; font-size: 12.5px; color: var(--ink-2); }
@media (max-width: 640px) { .cn-note { font-size: 13.5px; padding: 10px 12px; } }
"""

# 名词说明：卡片里的名词沿用站点 .term 样式（brand 色 + 虚线下划线），只把下划线
# 调淡一点，免得一张卡片里几处下划线太抢眼。独立成段是因为 CSS_PATCH 只在
# 首次注入时写一次 —— 老站已经含有 .cn-note，加在同一个补丁里对它们不生效。
TERM_CSS = """
/* 同期中国卡片里的名词：下划线调淡（tools/build_china_era.py 注入，幂等） */
.cn-note .term { border-bottom-color: var(--brand-line); }
"""

JS_TMPL = """/* 同期中国对照 —— 由 tools/build_china_era.py 生成，请勿手改 */
(function () {
  "use strict";
  /* 卡片已按节点序号预计算好（含去重结果与名词标注），这里只负责插进 DOM。 */
  var CARDS = %(cards)s;
  var TERMS = %(terms)s;

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function buildCard(c) {
    var box = el("div", "cn-note");
    var hd = el("div", "cn-head");
    hd.innerHTML = "同期中国 · <b>" + (c.h || "") + "</b>";
    box.appendChild(hd);

    if (c.e && c.e.length) {
      var row = el("div", "cn-row");
      row.appendChild(el("span", "cn-k", "大事"));
      var ul = el("ul");
      c.e.forEach(function (it) {
        ul.appendChild(el("li", null, "<b>" + it[0] + "</b> " + it[1]));
      });
      row.appendChild(ul);
      box.appendChild(row);
    }

    if (c.f && c.f.length) {
      var row2 = el("div", "cn-row");
      row2.appendChild(el("span", "cn-k", "人物"));
      var ul2 = el("ul", "cn-fig");
      c.f.forEach(function (f) {
        var life = f[2] == null ? (f[1] + "—") : (f[1] + "–" + f[2]);
        ul2.appendChild(el("li", null,
          "<b>" + f[0] + "</b> <i>" + life + "</i> · " + f[3] + " · " + f[4]));
      });
      row2.appendChild(ul2);
      box.appendChild(row2);
    }
    return box;
  }

  function init() {
    /* 名词解释挂进站点术语库。site.js 里 `var T = window.SITE_TERMS` 拿到的是
       同一个对象引用，而它的 boot() 在本脚本之前跑（脚本顺序 terms.js → site.js
       → china.js）—— 所以这些历史名词不会被当成科学术语去自动标注正文，
       只在点击 .term 时按 id 查表，直接复用站点已有的弹窗。 */
    if (window.SITE_TERMS) {
      for (var k in TERMS) {
        if (TERMS.hasOwnProperty(k) && !window.SITE_TERMS[k]) window.SITE_TERMS[k] = TERMS[k];
      }
    }

    var nodes = document.querySelectorAll("[data-year]");
    for (var i = 0; i < nodes.length; i++) {
      var c = CARDS[i];
      if (!c) continue;
      var y = parseInt(nodes[i].getAttribute("data-year"), 10);
      /* 卡片是按节点序号对齐的（同一年可能有两个节点，如哥白尼 1543 出版+逝世）。
         一旦错位，整站卡片会集体张冠李戴 —— 比少一张卡糟得多，所以对不上就跳过。 */
      if (c.y !== y) continue;
      if (nodes[i].querySelector(".cn-note")) continue;
      // 关键：.tl-item 是三列 grid（年代/轴/正文），卡片必须落在正文容器里，
      // 否则会被当成第 4 个格子、挤进 92px 的年代列变成竖排。
      var host = nodes[i].querySelector(".tl-body") || nodes[i].querySelector(".tl-panel") || nodes[i];
      host.appendChild(buildCard(c));
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
"""


def js(o):
    return json.dumps(o, ensure_ascii=False)


def build(sid):
    site = os.path.join(SCIENTISTS, sid)
    tl = os.path.join(site, "timeline.html")
    if not os.path.exists(tl):
        return "无 timeline.html"
    html = open(tl, encoding="utf-8").read()
    # 文档顺序，**允许重复年份**：卡片刻意按节点序号对齐，不按年份做键。
    years = [int(x) for x in re.findall(r'data-year="(\d{4})"', html)]
    if not years:
        return "无 data-year"

    # 页面没引术语库就别插名词标记，否则留下一堆点了没反应的下划线。
    annotate = "terms.js" in html
    cs = C.cards(years, annotate=annotate)

    used = sorted({t for c in cs for t in c["used"]})
    terms = {t: C.term_entry(t) for t in used}
    cards = [{"y": c["y"], "h": c["head"], "e": c["ev"], "f": c["fg"]} for c in cs]

    js_src = JS_TMPL % {"cards": js(cards), "terms": js(terms)}
    os.makedirs(os.path.join(site, "assets", "js"), exist_ok=True)
    open(os.path.join(site, "assets", "js", "china.js"), "w", encoding="utf-8").write(js_src)

    # 注入 script（幂等）
    if "assets/js/china.js" not in html:
        html = html.replace("</body>", '<script src="assets/js/china.js"></script>\n</body>')
        open(tl, "w", encoding="utf-8").write(html)

    # CSS 补丁（幂等）
    css_path = os.path.join(site, "assets", "css", "style.css")
    css = open(css_path, encoding="utf-8").read()
    if ".cn-note" not in css:
        open(css_path, "a", encoding="utf-8").write(CSS_PATCH)
    elif ".cn-note .term" not in css:
        open(css_path, "a", encoding="utf-8").write(TERM_CSS)

    ev_n = sum(len(c["ev"]) for c in cs)
    fg_n = sum(len(c["fg"]) for c in cs)
    return "节点 %d · 大事 %d · 人物 %d · 名词 %d · %.1fKB" % (
        len(years), ev_n, fg_n, len(used), len(js_src.encode("utf-8")) / 1024.0)


def main():
    if len(sys.argv) > 1:
        sids = sys.argv[1].split(",")
    else:
        sids = sorted(d for d in os.listdir(SCIENTISTS)
                      if os.path.isdir(os.path.join(SCIENTISTS, d)) and not d.startswith("."))
    for sid in sids:
        print("%-14s %s" % (sid, build(sid)))


if __name__ == "__main__":
    main()

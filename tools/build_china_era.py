# -*- coding: utf-8 -*-
"""给子站时间轴加「同期中国」对照卡片（幂等）。

做法：不改时间轴 HTML 结构，只往 timeline.html 引一个 assets/js/china.js，
由它在浏览器端遍历 `[data-year]` 节点，按 ±WIN 年窗口把卡片 append 到条目末尾。
这样重建子站也不会破坏结构，重跑本脚本即可恢复。

用法：
    python3 tools/build_china_era.py copernicus      # 单站
    python3 tools/build_china_era.py                 # 全部子站

窗口口径（与用户确认）：以节点年份为中心 ±20 年，命中该窗口的中国大事与
「生卒区间与窗口相交」的名人。每个节点必显示朝代年号。
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import china_data as D  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
SCIENTISTS = os.path.join(ROOT, "scientists")
WIN = 20

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

JS_TMPL = """/* 同期中国对照 —— 由 tools/build_china_era.py 生成，请勿手改 */
(function () {
  "use strict";
  var WIN = %(win)d;
  var ERAS = %(eras)s;
  var DYN = %(dyn)s;
  var EVENTS = %(events)s;
  var FIGURES = %(figs)s;

  function num2cn(n) {
    if (n === 1) return "元";
    var d = "零一二三四五六七八九", s = "";
    if (n < 10) return d.charAt(n);
    if (n === 10) return "十";
    if (n < 20) return "十" + d.charAt(n - 10);
    var t = Math.floor(n / 10), r = n %% 10;
    s = d.charAt(t) + "十";
    if (r) s += d.charAt(r);
    return s;
  }

  function eraOf(y) {
    for (var i = 0; i < ERAS.length; i++) {
      var e = ERAS[i];
      if (y >= e[0] && y <= e[1]) return { dyn: e[3], era: e[2], n: y - e[0] + 1 };
    }
    for (var j = 0; j < DYN.length; j++) {
      var d2 = DYN[j];
      if (y >= d2[0] && y <= d2[1]) return { dyn: d2[2], era: "", n: 0 };
    }
    return null;
  }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function buildCard(y) {
    var lo = y - WIN, hi = y + WIN;
    var er = eraOf(y);
    var box = el("div", "cn-note");
    var head = er ? (er.era ? (er.dyn + "·" + er.era + num2cn(er.n) + "年") : er.dyn) : "";
    var hd = el("div", "cn-head");
    hd.innerHTML = "同期中国 · <b>" + head + "</b>";
    box.appendChild(hd);

    var evs = EVENTS.filter(function (e) { return e[0] >= lo && e[0] <= hi; })
      .sort(function (a, b) { return Math.abs(a[0] - y) - Math.abs(b[0] - y); }).slice(0, 3);
    if (evs.length) {
      var row = el("div", "cn-row");
      row.appendChild(el("span", "cn-k", "大事"));
      var ul = el("ul");
      evs.forEach(function (e) {
        ul.appendChild(el("li", null, "<b>" + e[0] + "</b> " + e[1]));
      });
      row.appendChild(ul);
      box.appendChild(row);
    }

    var figs = FIGURES.filter(function (f) {
      var b = f[1], d = f[2] == null ? 9999 : f[2];
      return b <= hi && d >= lo;
    }).slice(0, 3);
    if (figs.length) {
      var row2 = el("div", "cn-row");
      row2.appendChild(el("span", "cn-k", "人物"));
      var ul2 = el("ul", "cn-fig");
      figs.forEach(function (f) {
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
    var nodes = document.querySelectorAll("[data-year]");
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var y = parseInt(node.getAttribute("data-year"), 10);
      if (!y || y < 1000) continue;
      if (node.querySelector(".cn-note")) continue;
      // 关键：.tl-item 是三列 grid（年代/轴/正文），卡片必须落在正文容器里，
      // 否则会被当成第 4 个格子、挤进 92px 的年代列变成竖排。
      var host = node.querySelector(".tl-body") || node.querySelector(".tl-panel") || node;
      host.appendChild(buildCard(y));
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
"""


def js_arr(rows):
    return json.dumps(rows, ensure_ascii=False)


def slice_for(years):
    """按本站出现的年份切片，减小体积（年号只保留相关朝代）。"""
    lo, hi = min(years) - WIN, max(years) + WIN
    eras = [list(e) for e in D.ERAS if e[1] >= lo and e[0] <= hi]
    dyn = [list(d) for d in D.DYNASTIES if d[1] >= lo and d[0] <= hi]
    events = [list(e) for e in D.EVENTS if lo <= e[0] <= hi]
    figs = [list(f) for f in D.FIGURES if f[1] <= hi and (f[2] or 9999) >= lo]
    return eras, dyn, events, figs


def build(sid):
    site = os.path.join(SCIENTISTS, sid)
    tl = os.path.join(site, "timeline.html")
    if not os.path.exists(tl):
        return "无 timeline.html"
    html = open(tl, encoding="utf-8").read()
    years = [int(x) for x in re.findall(r'data-year="(\d{4})"', html)]
    if not years:
        return "无 data-year"
    eras, dyn, events, figs = slice_for(years)
    js = JS_TMPL % {
        "win": WIN,
        "eras": js_arr(eras),
        "dyn": js_arr(dyn),
        "events": js_arr(events),
        "figs": js_arr(figs),
    }
    os.makedirs(os.path.join(site, "assets", "js"), exist_ok=True)
    open(os.path.join(site, "assets", "js", "china.js"), "w", encoding="utf-8").write(js)

    # 注入 script（幂等）
    if "assets/js/china.js" not in html:
        html = html.replace("</body>", '<script src="assets/js/china.js"></script>\n</body>')
        open(tl, "w", encoding="utf-8").write(html)

    # CSS 补丁（幂等）
    css_path = os.path.join(site, "assets", "css", "style.css")
    css = open(css_path, encoding="utf-8").read()
    if ".cn-note" not in css:
        open(css_path, "a", encoding="utf-8").write(CSS_PATCH)
    return "节点 %d 个 · 年号 %d · 大事 %d · 人物 %d" % (
        len(years), len(eras), len(events), len(figs))


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

/* 同期中国对照 —— 由 tools/build_china_era.py 生成，请勿手改 */
(function () {
  "use strict";
  var WIN = 20;
  var ERAS = [[1851, 1861, "咸丰", "清"], [1862, 1874, "同治", "清"], [1875, 1908, "光绪", "清"], [1909, 1911, "宣统", "清"]];
  var DYN = [[1644, 1912, "清"], [1912, 1949, "民国"], [1949, 2100, "中华人民共和国"]];
  var EVENTS = [[1861, "洋务运动开始"], [1866, "福州船政局设立"], [1872, "容闳率首批留学生赴美"], [1894, "中日甲午战争爆发"], [1898, "戊戌变法；严复《天演论》出版"], [1905, "科举废除；中国同盟会成立"], [1911, "辛亥革命，武昌起义"], [1912, "中华民国成立，清帝退位"], [1919, "五四运动"], [1921, "中国共产党成立"], [1928, "殷墟科学发掘开始（中国现代考古学起步）"], [1937, "全面抗战开始"], [1949, "中华人民共和国成立"], [1956, "十二年科学技术发展远景规划制定"], [1964, "第一颗原子弹爆炸成功"], [1970, "第一颗人造卫星“东方红一号”发射成功"], [1973, "袁隆平培育成功杂交水稻"]];
  var FIGURES = [["李善兰", 1811, 1882, "数学家", "翻译西方数学与科学著作，创译大量术语"]];

  function num2cn(n) {
    if (n === 1) return "元";
    var d = "零一二三四五六七八九", s = "";
    if (n < 10) return d.charAt(n);
    if (n === 10) return "十";
    if (n < 20) return "十" + d.charAt(n - 10);
    var t = Math.floor(n / 10), r = n % 10;
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

/* 同期中国对照 —— 由 tools/build_china_era.py 生成，请勿手改 */
(function () {
  "use strict";
  var WIN = 20;
  var ERAS = [];
  var DYN = [[1912, 1949, "民国"], [1949, 2100, "中华人民共和国"]];
  var EVENTS = [[1928, "殷墟科学发掘开始（中国现代考古学起步）"], [1937, "全面抗战开始"], [1949, "中华人民共和国成立"], [1956, "十二年科学技术发展远景规划制定"], [1964, "第一颗原子弹爆炸成功"], [1970, "第一颗人造卫星“东方红一号”发射成功"], [1973, "袁隆平培育成功杂交水稻"], [1978, "全国科学大会召开，提出“科学技术是生产力”"], [1986, "“863 计划”启动，布局高技术发展"], [1999, "神舟一号无人试验飞船首次发射成功"], [2003, "神舟五号首次载人航天飞行成功"], [2015, "屠呦呦获诺贝尔生理学或医学奖"], [2016, "“墨子号”量子科学实验卫星发射"], [2020, "嫦娥五号带回月球样品，中国首次地外天体采样返回"]];
  var FIGURES = [["李四光", 1889, 1971, "地质学家", "中国地质力学奠基人"], ["竺可桢", 1890, 1974, "气象·地理", "中国现代气象学与地理学奠基人"], ["侯德榜", 1890, 1974, "化学工程", "侯氏制碱法，中国重化学工业开拓者"], ["茅以升", 1896, 1989, "桥梁工程", "主持设计建造钱塘江大桥"], ["周培源", 1902, 1993, "力学·理论物理", "中国近代力学与理论物理奠基人之一"], ["童第周", 1902, 1979, "生物学家", "中国实验胚胎学主要奠基人"], ["赵九章", 1907, 1968, "大气·空间物理", "中国人造卫星事业倡导者与奠基人之一"], ["华罗庚", 1910, 1985, "数学家", "解析数论等多领域开创性成果"], ["钱学森", 1911, 2009, "航天工程", "中国航天与导弹事业奠基人"], ["钱三强", 1913, 1992, "核物理", "中国原子能科学事业创始人"], ["吴文俊", 1919, 2017, "数学家", "拓扑学与数学机械化，国家最高科技奖"], ["黄昆", 1919, 2005, "固体物理", "中国半导体物理学奠基人之一"], ["邓稼先", 1924, 1986, "核物理", "中国核武器研制开拓者与奠基者"], ["袁隆平", 1930, 2021, "农学家", "杂交水稻之父"], ["屠呦呦", 1930, null, "药学家", "发现青蒿素，2015 年获诺贝尔生理学或医学奖"], ["陈景润", 1933, 1996, "数学家", "哥德巴赫猜想“1+2”证明"], ["王选", 1937, 2006, "计算机", "汉字激光照排系统创始人"], ["南仁东", 1945, 2017, "天文学", "FAST“中国天眼”发起者与奠基人"]];

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

    // 排序口径：「在世中点」离节点年份越近越同期（表本身按年代排列，但同一窗口可能
    // 命中 5–6 人，按中点排序才不会总被早期人物占满名额）。在世者（卒为 null）用生年+40 估。
    var figs = FIGURES.filter(function (f) {
      var b = f[1], d = f[2] == null ? 9999 : f[2];
      return b <= hi && d >= lo;
    }).sort(function (a, c) {
      var ma = (a[1] + (a[2] == null ? a[1] + 40 : a[2])) / 2;
      var mc = (c[1] + (c[2] == null ? c[1] + 40 : c[2])) / 2;
      return Math.abs(ma - y) - Math.abs(mc - y);
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

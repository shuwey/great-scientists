/* 同期中国对照 —— 由 tools/build_china_era.py 生成，请勿手改 */
(function () {
  "use strict";
  var WIN = 20;
  var ERAS = [[1796, 1820, "嘉庆", "清"], [1821, 1850, "道光", "清"], [1851, 1861, "咸丰", "清"], [1862, 1874, "同治", "清"], [1875, 1908, "光绪", "清"], [1909, 1911, "宣统", "清"]];
  var DYN = [[1644, 1911, "清"], [1912, 1949, "民国"]];
  var EVENTS = [[1820, "道光帝即位"], [1838, "林则徐赴广州禁烟"], [1839, "虎门销烟，成为鸦片战争导火索"], [1840, "第一次鸦片战争爆发"], [1842, "签订《南京条约》；魏源《海国图志》初刊，提出“师夷长技以制夷”"], [1851, "太平天国起义（金田起义）"], [1861, "洋务运动开始"], [1866, "福州船政局设立"], [1872, "容闳率首批留学生赴美"], [1894, "中日甲午战争爆发"], [1898, "戊戌变法；严复《天演论》出版"], [1905, "科举废除；中国同盟会成立"], [1911, "辛亥革命，武昌起义"], [1912, "中华民国成立，清帝退位"], [1919, "五四运动"], [1921, "中国共产党成立"]];
  var FIGURES = [["魏源", 1794, 1857, "思想家", "《海国图志》，提出“师夷长技以制夷”"], ["李善兰", 1811, 1882, "数学家", "翻译西方数学与科学著作，创译大量术语"], ["徐寿", 1818, 1884, "化学·工程", "译《化学鉴原》，首创化学元素汉字译名"], ["严复", 1854, 1921, "启蒙思想家", "译《天演论》，倡“信、达、雅”"], ["詹天佑", 1861, 1919, "铁路工程", "主持修建京张铁路，“中国铁路之父”"], ["李四光", 1889, 1971, "地质学家", "中国地质力学奠基人"], ["竺可桢", 1890, 1974, "气象·地理", "中国现代气象学与地理学奠基人"], ["侯德榜", 1890, 1974, "化学工程", "侯氏制碱法，中国重化学工业开拓者"], ["茅以升", 1896, 1989, "桥梁工程", "主持设计建造钱塘江大桥"], ["周培源", 1902, 1993, "力学·理论物理", "中国近代力学与理论物理奠基人之一"], ["童第周", 1902, 1979, "生物学家", "中国实验胚胎学主要奠基人"], ["赵九章", 1907, 1968, "大气·空间物理", "中国人造卫星事业倡导者与奠基人之一"], ["华罗庚", 1910, 1985, "数学家", "解析数论等多领域开创性成果"], ["钱学森", 1911, 2009, "航天工程", "中国航天与导弹事业奠基人"], ["钱三强", 1913, 1992, "核物理", "中国原子能科学事业创始人"], ["吴文俊", 1919, 2017, "数学家", "拓扑学与数学机械化，国家最高科技奖"], ["黄昆", 1919, 2005, "固体物理", "中国半导体物理学奠基人之一"], ["邓稼先", 1924, 1986, "核物理", "中国核武器研制开拓者与奠基者"]];

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

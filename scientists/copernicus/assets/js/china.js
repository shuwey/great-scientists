/* 同期中国对照 —— 由 tools/build_china_era.py 生成，请勿手改 */
(function () {
  "use strict";
  var WIN = 20;
  var ERAS = [[1450, 1456, "景泰", "明"], [1457, 1464, "天顺", "明"], [1465, 1487, "成化", "明"], [1488, 1505, "弘治", "明"], [1506, 1521, "正德", "明"], [1522, 1566, "嘉靖", "明"], [1567, 1572, "隆庆", "明"], [1573, 1620, "万历", "明"], [1621, 1627, "天启", "明"], [1628, 1644, "崇祯", "明"], [1644, 1661, "顺治", "清"], [1662, 1722, "康熙", "清"], [1723, 1735, "雍正", "清"], [1736, 1795, "乾隆", "清"], [1796, 1820, "嘉庆", "清"], [1821, 1850, "道光", "清"], [1851, 1861, "咸丰", "清"]];
  var DYN = [[1368, 1644, "明"], [1644, 1911, "清"]];
  var EVENTS = [[1488, "明孝宗即位，弘治一朝史称“弘治中兴”"], [1506, "明武宗即位，改元正德"], [1510, "宦官刘瑾被诛"], [1519, "王守仁平定宁王朱宸濠之乱"], [1521, "明世宗即位，改元嘉靖"], [1529, "王守仁（王阳明）病逝于归途"], [1565, "潘季驯开始总理河道，后提出“束水攻沙”治河方略"], [1572, "张居正开始辅政，推行改革"], [1578, "李时珍撰成《本草纲目》"], [1584, "朱载堉《律学新说》首次提出十二平均律（新法密率）"], [1592, "程大位《算法统宗》刊行，珠算体系集大成"], [1593, "李时珍去世"], [1601, "利玛窦定居北京，与李之藻合作《坤舆万国全图》"], [1616, "努尔哈赤称汗，建立后金（清的前身）"], [1619, "萨尔浒之战，明军大败，明清兴亡转折"], [1626, "宁远之战，袁崇焕击败后金军，努尔哈赤重伤而死"], [1628, "徐光启编成《农政全书》"], [1629, "徐光启主持开局修历，编译《崇祯历书》，采西洋天文学"], [1633, "徐光启去世"], [1636, "皇太极改国号为清"], [1637, "宋应星《天工开物》刊行"], [1641, "徐霞客去世"], [1644, "李自成攻入北京，明朝灭亡；清军入关"], [1662, "郑成功收复台湾"], [1673, "三藩之乱起（至 1681 年平定）"], [1681, "康熙平定三藩之乱"], [1683, "施琅击败明郑，清朝统一台湾"], [1689, "中俄签订《尼布楚条约》"], [1718, "康熙下令编绘《皇舆全览图》"], [1721, "梅文鼎去世（清代算学第一人）"], [1729, "雍正设立军机处（1732 年定型）"], [1782, "《四库全书》修纂完成"], [1820, "道光帝即位"], [1838, "林则徐赴广州禁烟"], [1839, "虎门销烟，成为鸦片战争导火索"], [1840, "第一次鸦片战争爆发"], [1842, "签订《南京条约》；魏源《海国图志》初刊，提出“师夷长技以制夷”"], [1851, "太平天国起义（金田起义）"]];
  var FIGURES = [["王守仁（王阳明）", 1472, 1529, "思想家", "心学集大成者，提出“知行合一”“致良知”"], ["李时珍", 1518, 1593, "医药学家", "《本草纲目》作者，收药 1892 种"], ["潘季驯", 1521, 1595, "水利学家", "“束水攻沙”治河方略，四任总理河道"], ["程大位", 1533, 1606, "数学家", "《算法统宗》作者，集珠算之大成"], ["朱载堉", 1536, 1611, "乐律·数学·天文", "世界最早创立十二平均律（新法密率）"], ["徐光启", 1562, 1633, "农学·数学·天文", "译《几何原本》，主持编译《崇祯历书》"], ["宋应星", 1587, 1666, "工艺技术", "《天工开物》作者，17 世纪工艺百科全书"], ["徐霞客", 1587, 1641, "地理学家", "《徐霞客游记》，实地考察喀斯特地貌"], ["薛凤祚", 1600, 1680, "数学·天文", "《历学会通》，系统介绍第谷体系算法"], ["王锡阐", 1628, 1682, "天文学家", "《晓庵新法》，兼通中西历法"], ["梅文鼎", 1633, 1721, "天算家", "“清代算学第一人”，会通中西算学"], ["魏源", 1794, 1857, "思想家", "《海国图志》，提出“师夷长技以制夷”"], ["李善兰", 1811, 1882, "数学家", "翻译西方数学与科学著作，创译大量术语"], ["徐寿", 1818, 1884, "化学·工程", "译《化学鉴原》，首创化学元素汉字译名"], ["严复", 1854, 1921, "启蒙思想家", "译《天演论》，倡“信、达、雅”"]];

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

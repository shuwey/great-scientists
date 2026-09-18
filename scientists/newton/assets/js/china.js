/* 同期中国对照 —— 由 tools/build_china_era.py 生成，请勿手改 */
(function () {
  "use strict";
  /* 卡片已按节点序号预计算好（含去重结果与名词标注），这里只负责插进 DOM。 */
  var CARDS = [{"y": 1643, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">明·崇祯十六年</span>", "e": [[1637, "宋应星<span class=\"term\" data-term=\"cn-tiangong\" tabindex=\"0\" role=\"button\">《天工开物》</span>刊行"], [1641, "徐霞客去世"], [1644, "<span class=\"term\" data-term=\"cn-lizicheng\" tabindex=\"0\" role=\"button\">李自成</span>攻入北京，明朝灭亡；清军入关"]], "f": [["宋应星", 1587, 1666, "工艺技术", "<span class=\"term\" data-term=\"cn-tiangong\" tabindex=\"0\" role=\"button\">《天工开物》</span>作者，17 世纪工艺百科全书"], ["徐霞客", 1587, 1641, "地理学家", "<span class=\"term\" data-term=\"cn-xuxiake\" tabindex=\"0\" role=\"button\">《徐霞客游记》</span>，实地考察喀斯特地貌"], ["薛凤祚", 1600, 1680, "数学·天文", "<span class=\"term\" data-term=\"cn-lishihuitong\" tabindex=\"0\" role=\"button\">《历学会通》</span>，系统介绍第谷体系算法"]]}, {"y": 1655, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">清·顺治十二年</span>", "e": [[1636, "皇太极改国号为清"]], "f": [["王锡阐", 1628, 1682, "天文学家", "<span class=\"term\" data-term=\"cn-xiaoan\" tabindex=\"0\" role=\"button\">《晓庵新法》</span>，兼通中西历法"]]}, {"y": 1661, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">清·顺治十八年</span>", "e": [[1662, "<span class=\"term\" data-term=\"cn-zhengchenggong\" tabindex=\"0\" role=\"button\">郑成功收复台湾</span>"]], "f": []}, {"y": 1665, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">清·康熙四年</span>", "e": [], "f": []}, {"y": 1666, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">清·康熙五年</span>", "e": [], "f": []}, {"y": 1669, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">清·康熙八年</span>", "e": [], "f": []}, {"y": 1672, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">清·康熙十一年</span>", "e": [[1673, "<span class=\"term\" data-term=\"cn-sanfanzhiluan\" tabindex=\"0\" role=\"button\">三藩之乱</span>起（至 1681 年平定）"]], "f": [["梅文鼎", 1633, 1721, "天算家", "“清代算学第一人”，会通中西算学"]]}, {"y": 1684, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">清·康熙二十三年</span>", "e": [[1681, "康熙平定<span class=\"term\" data-term=\"cn-sanfanzhiluan\" tabindex=\"0\" role=\"button\">三藩之乱</span>"], [1683, "施琅击败明郑，清朝统一台湾"]], "f": []}, {"y": 1687, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">清·康熙二十六年</span>", "e": [[1689, "中俄签订<span class=\"term\" data-term=\"cn-nibuchu\" tabindex=\"0\" role=\"button\">《尼布楚条约》</span>"]], "f": []}, {"y": 1696, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">清·康熙三十五年</span>", "e": [], "f": []}, {"y": 1703, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">清·康熙四十二年</span>", "e": [], "f": []}, {"y": 1704, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">清·康熙四十三年</span>", "e": [], "f": []}, {"y": 1705, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">清·康熙四十四年</span>", "e": [], "f": []}, {"y": 1727, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">清·雍正五年</span>", "e": [[1718, "康熙下令编绘<span class=\"term\" data-term=\"cn-huangyu\" tabindex=\"0\" role=\"button\">《皇舆全览图》</span>"], [1721, "梅文鼎去世（清代算学第一人）"], [1729, "雍正设立<span class=\"term\" data-term=\"cn-junjichu\" tabindex=\"0\" role=\"button\">军机处</span>（1732 年定型）"]], "f": []}];
  var TERMS = {"cn-huangyu": {"cat": "典籍", "name": "《皇舆全览图》", "short": "康熙年间的全国实测地图", "plain": "康熙年间组织中国与欧洲传教士用经纬度实测法测绘全国，1718 年前后编成，是当时世界领先的实测地图。", "extra": "实测中发现纬度一度的长度各地不同，这在当时是一个重要发现。"}, "cn-junjichu": {"cat": "制度", "name": "军机处", "short": "清代皇帝的机要班子", "plain": "雍正年间设立的最高机要机构。军机大臣由皇帝从亲信中挑选，每天当面听旨、记录下来再传达执行。", "extra": "军机处不是正式衙门，也没有下属机构；它的设立标志着清代君主集权达到高峰。"}, "cn-lishihuitong": {"cat": "典籍", "name": "《历学会通》", "short": "薛凤祚的历法著作", "plain": "薛凤祚编撰，把中西历法会通整理，介绍了丹麦天文学家第谷的宇宙体系。", "extra": ""}, "cn-lizicheng": {"cat": "人物", "name": "李自成", "short": "明末农民起义领袖", "plain": "明末农民起义军领袖，1644 年在西安称帝、国号「大顺」，随后攻入北京，明朝灭亡。不久被清军击败。", "extra": ""}, "cn-nianhao": {"cat": "制度", "name": "年号纪年", "short": "皇帝用来纪年的名号", "plain": "古代皇帝登基后一般会定一个吉祥的名号来纪年。「康熙二十六年」，就是清圣祖玄烨在位的第 26 年。", "extra": "明清两代大多一位皇帝只用同一个年号，所以人们常用年号称呼皇帝，如「康熙帝」「乾隆帝」；唐宋皇帝则常常多次更换年号。"}, "cn-nibuchu": {"cat": "典籍", "name": "《尼布楚条约》", "short": "1689 年中俄边界条约", "plain": "清朝与俄国在尼布楚（今俄罗斯涅尔琴斯克）签订的边界条约，划定了两国东段边界。", "extra": "这是中国与外国签订的第一个具有近代性质的边界条约。"}, "cn-sanfanzhiluan": {"cat": "事件", "name": "三藩之乱", "short": "1673—1681 年南方藩王的叛乱", "plain": "康熙帝决定撤藩后，吴三桂等藩王先后起兵反清，战火遍及南方数省。这场叛乱持续八年，最终被清军平定。", "extra": ""}, "cn-tiangong": {"cat": "典籍", "name": "《天工开物》", "short": "宋应星的工艺技术专著", "plain": "宋应星编写，系统记录了当时农业与手工业的生产技术，被誉为「17 世纪的工艺百科全书」。", "extra": ""}, "cn-xiaoan": {"cat": "典籍", "name": "《晓庵新法》", "short": "王锡阐的历法著作", "plain": "王锡阐编撰的历法著作，兼采中西方法并加以比较评议，是清代重要的历算成果。", "extra": ""}, "cn-xuxiake": {"cat": "典籍", "name": "《徐霞客游记》", "short": "徐霞客的考察笔记", "plain": "徐霞客用三十多年时间实地考察并记录，其中对西南地区石灰岩地貌的描述，是世界上最早的系统的喀斯特地貌文献之一。", "extra": ""}, "cn-zhengchenggong": {"cat": "事件", "name": "郑成功收复台湾", "short": "1662 年驱逐荷兰殖民者", "plain": "1661 年郑成功率军渡海东征，围困荷兰殖民者盘踞的热兰遮城，1662 年荷兰人投降，被侵占 38 年的台湾回到中国人手中。", "extra": "郑成功在收复台湾后不久病逝。"}};

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

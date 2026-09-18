/* 同期中国对照 —— 由 tools/build_china_era.py 生成，请勿手改 */
(function () {
  "use strict";
  /* 卡片已按节点序号预计算好（含去重结果与名词标注），这里只负责插进 DOM。 */
  var CARDS = [{"y": 1809, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">清·嘉庆十四年</span>", "e": [], "f": []}, {"y": 1825, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">清·道光五年</span>", "e": [[1820, "道光帝即位"]], "f": [["魏源", 1794, 1857, "思想家", "<span class=\"term\" data-term=\"cn-haiguo\" tabindex=\"0\" role=\"button\">《海国图志》</span>，提出“师夷长技以制夷”"]]}, {"y": 1828, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">清·道光八年</span>", "e": [], "f": []}, {"y": 1831, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">清·道光十一年</span>", "e": [], "f": []}, {"y": 1835, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">清·道光十五年</span>", "e": [], "f": []}, {"y": 1837, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">清·道光十七年</span>", "e": [[1842, "签订<span class=\"term\" data-term=\"cn-nanjing\" tabindex=\"0\" role=\"button\">《南京条约》</span>；魏源《海国图志》初刊，提出“师夷长技以制夷”"]], "f": []}, {"y": 1838, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">清·道光十八年</span>", "e": [[1838, "<span class=\"term\" data-term=\"cn-linzexu\" tabindex=\"0\" role=\"button\">林则徐</span>赴广州禁烟"], [1839, "<span class=\"term\" data-term=\"cn-humen\" tabindex=\"0\" role=\"button\">虎门销烟</span>，成为鸦片战争导火索"], [1840, "<span class=\"term\" data-term=\"cn-yapian\" tabindex=\"0\" role=\"button\">第一次鸦片战争</span>爆发"]], "f": [["李善兰", 1811, 1882, "数学家", "翻译西方数学与科学著作，创译大量术语"]]}, {"y": 1858, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">清·咸丰八年</span>", "e": [[1851, "<span class=\"term\" data-term=\"cn-taiping\" tabindex=\"0\" role=\"button\">太平天国</span>起义（金田起义）"]], "f": [["徐寿", 1818, 1884, "化学·工程", "译《化学鉴原》，首创化学元素汉字译名"]]}, {"y": 1859, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">清·咸丰九年</span>", "e": [[1861, "<span class=\"term\" data-term=\"cn-yangwu\" tabindex=\"0\" role=\"button\">洋务运动</span>开始"]], "f": []}, {"y": 1871, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">清·同治十年</span>", "e": [[1866, "<span class=\"term\" data-term=\"cn-chuanzheng\" tabindex=\"0\" role=\"button\">福州船政局</span>设立"], [1872, "<span class=\"term\" data-term=\"cn-ronghong\" tabindex=\"0\" role=\"button\">容闳</span>率首批留学生赴美"]], "f": [["竺可桢", 1890, 1974, "气象·地理", "中国现代气象学与地理学奠基人"], ["侯德榜", 1890, 1974, "化学工程", "<span class=\"term\" data-term=\"cn-houshi\" tabindex=\"0\" role=\"button\">侯氏制碱法</span>，中国重化学工业开拓者"]]}, {"y": 1882, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">清·光绪八年</span>", "e": [[1894, "<span class=\"term\" data-term=\"cn-jiawu\" tabindex=\"0\" role=\"button\">中日甲午战争</span>爆发"], [1898, "<span class=\"term\" data-term=\"cn-wuxu\" tabindex=\"0\" role=\"button\">戊戌变法</span>；严复《天演论》出版"]], "f": [["严复", 1854, 1921, "启蒙思想家", "译<span class=\"term\" data-term=\"cn-tianyan\" tabindex=\"0\" role=\"button\">《天演论》</span>，倡“信、达、雅”"], ["詹天佑", 1861, 1919, "铁路工程", "主持修建京张铁路，“中国铁路之父”"], ["李四光", 1889, 1971, "地质学家", "中国<span class=\"term\" data-term=\"cn-dizhilixue\" tabindex=\"0\" role=\"button\">地质力学</span>奠基人"]]}];
  var TERMS = {"cn-chuanzheng": {"cat": "机构", "name": "福州船政局", "short": "洋务运动中的近代造船基地", "plain": "1866 年由左宗棠倡议、沈葆桢主持创办的近代造船厂，附设船政学堂，培养了中国第一代造船与航海人才。", "extra": ""}, "cn-dizhilixue": {"cat": "科技", "name": "地质力学", "short": "李四光创立的地质学理论", "plain": "李四光创立的理论，用力学原理研究地壳构造及其运动规律。", "extra": ""}, "cn-haiguo": {"cat": "典籍", "name": "《海国图志》", "short": "魏源介绍世界的著作", "plain": "魏源编著，系统介绍世界各国的地理、历史与制度，并提出「师夷长技以制夷」，是近代中国「开眼看世界」的代表作。", "extra": ""}, "cn-houshi": {"cat": "科技", "name": "侯氏制碱法", "short": "侯德榜发明的制碱工艺", "plain": "侯德榜发明的制碱新工艺：把制碱与合成氨联合起来，提高食盐利用率、减少废液排放，又称「联合制碱法」。", "extra": ""}, "cn-humen": {"cat": "事件", "name": "虎门销烟", "short": "1839 年在虎门当众销毁鸦片", "plain": "林则徐在广东虎门海滩当众销毁收缴的鸦片二百多万斤，历时二十多天。这是近代中国禁烟运动的顶点，也成为英国发动鸦片战争的借口。", "extra": ""}, "cn-jiawu": {"cat": "事件", "name": "甲午战争", "short": "1894—1895 年的中日战争", "plain": "日本以朝鲜问题为借口发动侵华战争，清朝战败，北洋海军覆没，被迫签订《马关条约》，割地赔款，民族危机空前加深。", "extra": ""}, "cn-linzexu": {"cat": "人物", "name": "林则徐", "short": "清朝禁烟派代表人物", "plain": "清朝官员。1838 年受命赴广东查禁鸦片，1839 年在虎门当众销毁收缴的鸦片。", "extra": ""}, "cn-nanjing": {"cat": "典籍", "name": "《南京条约》", "short": "中国近代第一个不平等条约", "plain": "1842 年鸦片战争后清朝与英国签订：割让香港岛、赔款、开放广州厦门福州宁波上海五处为通商口岸。", "extra": ""}, "cn-nianhao": {"cat": "制度", "name": "年号纪年", "short": "皇帝用来纪年的名号", "plain": "古代皇帝登基后一般会定一个吉祥的名号来纪年。「康熙二十六年」，就是清圣祖玄烨在位的第 26 年。", "extra": "明清两代大多一位皇帝只用同一个年号，所以人们常用年号称呼皇帝，如「康熙帝」「乾隆帝」；唐宋皇帝则常常多次更换年号。"}, "cn-ronghong": {"cat": "人物", "name": "容闳", "short": "中国第一位留美学生", "plain": "中国近代第一位在美国大学毕业的留学生，回国后推动清政府派幼童赴美留学，被称为「中国留学生之父」。", "extra": ""}, "cn-taiping": {"cat": "事件", "name": "太平天国", "short": "清代规模最大的农民战争", "plain": "1851 年洪秀全在广西桂平金田村起义，建立「太平天国」政权，势力一度遍及大半个中国，坚持十余年后失败。", "extra": ""}, "cn-tianyan": {"cat": "典籍", "name": "《天演论》", "short": "严复译介进化论的著作", "plain": "严复翻译赫胥黎的著作，1898 年出版，介绍「物竞天择、适者生存」的进化论思想，对近代中国思想界影响极大。", "extra": ""}, "cn-wuxu": {"cat": "事件", "name": "戊戌变法", "short": "1898 年的改良运动", "plain": "光绪帝在康有为、梁启超等推动下推行变法，主张改革科举、办新式学堂、发展工商业。变法只持续了约一百天就被慈禧太后发动的政变终止。", "extra": ""}, "cn-yangwu": {"cat": "事件", "name": "洋务运动", "short": "19 世纪后期的自强求富运动", "plain": "19 世纪 60—90 年代，清政府在「自强」「求富」的口号下办近代工厂、建新式海军、开学堂、派留学生，开启了中国近代工业的第一步。", "extra": "1894 年甲午战争中北洋海军覆没，标志着洋务运动的失败。"}, "cn-yapian": {"cat": "事件", "name": "鸦片战争", "short": "1840—1842 年英国发动的侵华战争", "plain": "英国为维护鸦片贸易、打开中国市场而发动的战争。清朝战败，被迫签订《南京条约》，中国从此逐步沦为半殖民地半封建社会。", "extra": ""}};

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

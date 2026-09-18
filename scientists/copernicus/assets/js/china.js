/* 同期中国对照 —— 由 tools/build_china_era.py 生成，请勿手改 */
(function () {
  "use strict";
  /* 卡片已按节点序号预计算好（含去重结果与名词标注），这里只负责插进 DOM。 */
  var CARDS = [{"y": 1473, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">明·成化九年</span>", "e": [], "f": []}, {"y": 1491, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">明·弘治四年</span>", "e": [[1488, "明孝宗即位，弘治一朝史称“<span class=\"term\" data-term=\"cn-hongzhi\" tabindex=\"0\" role=\"button\">弘治中兴</span>”"]], "f": []}, {"y": 1496, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">明·弘治九年</span>", "e": [], "f": []}, {"y": 1503, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">明·弘治十六年</span>", "e": [[1506, "明武宗即位，<span class=\"term\" data-term=\"cn-gaiyuan\" tabindex=\"0\" role=\"button\">改元</span>正德"]], "f": [["王守仁（王阳明）", 1472, 1529, "思想家", "<span class=\"term\" data-term=\"cn-xinlixue\" tabindex=\"0\" role=\"button\">心学</span>集大成者，提出“知行合一”“致良知”"]]}, {"y": 1510, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">明·正德五年</span>", "e": [[1510, "<span class=\"term\" data-term=\"cn-huanguan\" tabindex=\"0\" role=\"button\">宦官</span>刘瑾被诛"]], "f": []}, {"y": 1514, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">明·正德九年</span>", "e": [[1519, "王守仁平定<span class=\"term\" data-term=\"cn-ningwang\" tabindex=\"0\" role=\"button\">宁王朱宸濠</span>之乱"], [1521, "明世宗即位，<span class=\"term\" data-term=\"cn-gaiyuan\" tabindex=\"0\" role=\"button\">改元</span>嘉靖"]], "f": []}, {"y": 1530, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">明·嘉靖九年</span>", "e": [[1529, "王守仁（王阳明）病逝于归途"]], "f": []}, {"y": 1543, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">明·嘉靖二十二年</span>", "e": [], "f": [["李时珍", 1518, 1593, "医药学家", "<span class=\"term\" data-term=\"cn-bencao\" tabindex=\"0\" role=\"button\">《本草纲目》</span>作者，收药 1892 种"], ["潘季驯", 1521, 1595, "水利学家", "“<span class=\"term\" data-term=\"cn-houshui\" tabindex=\"0\" role=\"button\">束水攻沙</span>”治河方略，四任总理河道"], ["程大位", 1533, 1606, "数学家", "<span class=\"term\" data-term=\"cn-suanfa\" tabindex=\"0\" role=\"button\">《算法统宗》</span>作者，集珠算之大成"]]}, {"y": 1543, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">明·嘉靖二十二年</span>", "e": [], "f": [["朱载堉", 1536, 1611, "乐律·数学·天文", "世界最早创立十二平均律（新法密率）"]]}, {"y": 1616, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">明·万历四十四年</span>", "e": [[1601, "<span class=\"term\" data-term=\"cn-limadou\" tabindex=\"0\" role=\"button\">利玛窦</span>定居北京，与李之藻合作《坤舆万国全图》"], [1616, "努尔哈赤称汗，建立<span class=\"term\" data-term=\"cn-houjin\" tabindex=\"0\" role=\"button\">后金</span>（清的前身）"], [1629, "徐光启主持开局修历，编译<span class=\"term\" data-term=\"cn-chongzhen\" tabindex=\"0\" role=\"button\">《崇祯历书》</span>，采西洋天文学"]], "f": [["徐光启", 1562, 1633, "农学·数学·天文", "译<span class=\"term\" data-term=\"cn-jihe\" tabindex=\"0\" role=\"button\">《几何原本》</span>，主持编译《崇祯历书》"], ["徐霞客", 1587, 1641, "地理学家", "<span class=\"term\" data-term=\"cn-xuxiake\" tabindex=\"0\" role=\"button\">《徐霞客游记》</span>，实地考察喀斯特地貌"]]}, {"y": 1619, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">明·万历四十七年</span>", "e": [[1619, "<span class=\"term\" data-term=\"cn-salhu\" tabindex=\"0\" role=\"button\">萨尔浒之战</span>，明军大败，明清兴亡转折"], [1626, "<span class=\"term\" data-term=\"cn-ningyuan\" tabindex=\"0\" role=\"button\">宁远之战</span>，袁崇焕击败后金军，努尔哈赤重伤而死"], [1628, "徐光启编成<span class=\"term\" data-term=\"cn-nongzheng\" tabindex=\"0\" role=\"button\">《农政全书》</span>"]], "f": [["宋应星", 1587, 1666, "工艺技术", "<span class=\"term\" data-term=\"cn-tiangong\" tabindex=\"0\" role=\"button\">《天工开物》</span>作者，17 世纪工艺百科全书"], ["薛凤祚", 1600, 1680, "数学·天文", "<span class=\"term\" data-term=\"cn-lishihuitong\" tabindex=\"0\" role=\"button\">《历学会通》</span>，系统介绍第谷体系算法"]]}, {"y": 1687, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">清·康熙二十六年</span>", "e": [[1681, "康熙平定<span class=\"term\" data-term=\"cn-sanfanzhiluan\" tabindex=\"0\" role=\"button\">三藩之乱</span>"], [1683, "施琅击败明郑，清朝统一台湾"], [1689, "中俄签订<span class=\"term\" data-term=\"cn-nibuchu\" tabindex=\"0\" role=\"button\">《尼布楚条约》</span>"]], "f": [["王锡阐", 1628, 1682, "天文学家", "<span class=\"term\" data-term=\"cn-xiaoan\" tabindex=\"0\" role=\"button\">《晓庵新法》</span>，兼通中西历法"], ["梅文鼎", 1633, 1721, "天算家", "“清代算学第一人”，会通中西算学"]]}, {"y": 1835, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">清·道光十五年</span>", "e": [[1838, "<span class=\"term\" data-term=\"cn-linzexu\" tabindex=\"0\" role=\"button\">林则徐</span>赴广州禁烟"], [1839, "<span class=\"term\" data-term=\"cn-humen\" tabindex=\"0\" role=\"button\">虎门销烟</span>，成为鸦片战争导火索"], [1840, "<span class=\"term\" data-term=\"cn-yapian\" tabindex=\"0\" role=\"button\">第一次鸦片战争</span>爆发"]], "f": [["魏源", 1794, 1857, "思想家", "<span class=\"term\" data-term=\"cn-haiguo\" tabindex=\"0\" role=\"button\">《海国图志》</span>，提出“师夷长技以制夷”"], ["李善兰", 1811, 1882, "数学家", "翻译西方数学与科学著作，创译大量术语"], ["徐寿", 1818, 1884, "化学·工程", "译《化学鉴原》，首创化学元素汉字译名"]]}];
  var TERMS = {"cn-bencao": {"cat": "典籍", "name": "《本草纲目》", "short": "李时珍的药物学巨著", "plain": "李时珍历时约三十年编成，收录药物一千八百余种，附有大量药方和插图，是古代药物学的集大成之作。", "extra": ""}, "cn-chongzhen": {"cat": "典籍", "name": "《崇祯历书》", "short": "徐光启主持编译的历法丛书", "plain": "徐光启主持开局修历，引入西方天文学方法编译而成，后成为清代《时宪历》的基础。", "extra": "徐光启去世后由李天经等续成。"}, "cn-gaiyuan": {"cat": "制度", "name": "改元", "short": "换一个年号、重新起算年份", "plain": "新皇帝登基，或在位期间遇到大事时，会换一个新年号重新纪年，这件事叫「改元」。", "extra": ""}, "cn-haiguo": {"cat": "典籍", "name": "《海国图志》", "short": "魏源介绍世界的著作", "plain": "魏源编著，系统介绍世界各国的地理、历史与制度，并提出「师夷长技以制夷」，是近代中国「开眼看世界」的代表作。", "extra": ""}, "cn-hongzhi": {"cat": "事件", "name": "弘治中兴", "short": "明孝宗时期的相对安定局面", "plain": "明孝宗弘治年间（1488—1505），皇帝勤于政事、任用贤臣、减轻赋税，社会比较安定，史称「弘治中兴」。", "extra": ""}, "cn-houjin": {"cat": "人物", "name": "后金", "short": "清朝的前身政权", "plain": "1616 年努尔哈赤在东北建立「后金」，1636 年皇太极改国号为「清」。后金是清朝的前身。", "extra": ""}, "cn-houshui": {"cat": "科技", "name": "束水攻沙", "short": "用急流冲走泥沙的治河方略", "plain": "潘季驯提出的治河主张：把河道收窄，提高水流速度，让急流把河底的泥沙冲走，从而减少淤积、稳定河床。", "extra": "他主张「以堤束水，以水攻沙」，并把黄河、运河、淮河作为一个整体来治理。"}, "cn-huanguan": {"cat": "制度", "name": "宦官", "short": "宫廷内侍奉皇帝后妃的阉人官员", "plain": "宦官在宫廷内服役，因为离皇帝最近，历史上多次出现宦官掌权、干预朝政的局面。", "extra": "明代的东厂、西厂等由宦官掌管，权势极大。"}, "cn-humen": {"cat": "事件", "name": "虎门销烟", "short": "1839 年在虎门当众销毁鸦片", "plain": "林则徐在广东虎门海滩当众销毁收缴的鸦片二百多万斤，历时二十多天。这是近代中国禁烟运动的顶点，也成为英国发动鸦片战争的借口。", "extra": ""}, "cn-jihe": {"cat": "典籍", "name": "《几何原本》", "short": "欧几里得的几何学名著", "plain": "古希腊欧几里得编写的几何学经典。徐光启与利玛窦合作译出前六卷，是西方数学名著最早的汉译本之一，其中「几何」「点」「线」「面」等译名沿用至今。", "extra": ""}, "cn-limadou": {"cat": "人物", "name": "利玛窦", "short": "明末来华的意大利传教士", "plain": "意大利耶稣会传教士，1583 年进入中国内地，1601 年定居北京。他带来西方的天文、数学、地理知识，与徐光启、李之藻等合作译书。", "extra": ""}, "cn-linzexu": {"cat": "人物", "name": "林则徐", "short": "清朝禁烟派代表人物", "plain": "清朝官员。1838 年受命赴广东查禁鸦片，1839 年在虎门当众销毁收缴的鸦片。", "extra": ""}, "cn-lishihuitong": {"cat": "典籍", "name": "《历学会通》", "short": "薛凤祚的历法著作", "plain": "薛凤祚编撰，把中西历法会通整理，介绍了丹麦天文学家第谷的宇宙体系。", "extra": ""}, "cn-nianhao": {"cat": "制度", "name": "年号纪年", "short": "皇帝用来纪年的名号", "plain": "古代皇帝登基后一般会定一个吉祥的名号来纪年。「康熙二十六年」，就是清圣祖玄烨在位的第 26 年。", "extra": "明清两代大多一位皇帝只用同一个年号，所以人们常用年号称呼皇帝，如「康熙帝」「乾隆帝」；唐宋皇帝则常常多次更换年号。"}, "cn-nibuchu": {"cat": "典籍", "name": "《尼布楚条约》", "short": "1689 年中俄边界条约", "plain": "清朝与俄国在尼布楚（今俄罗斯涅尔琴斯克）签订的边界条约，划定了两国东段边界。", "extra": "这是中国与外国签订的第一个具有近代性质的边界条约。"}, "cn-ningwang": {"cat": "事件", "name": "宁王之乱", "short": "1519 年明朝宗室发动的叛乱", "plain": "明宗室宁王朱宸濠在南昌起兵反叛，企图夺取皇位。王守仁（王阳明）临时集结兵力，仅用四十多天就平定，宁王被俘。", "extra": ""}, "cn-ningyuan": {"cat": "事件", "name": "宁远之战", "short": "1626 年明军守住宁远城", "plain": "袁崇焕率明军固守宁远（今辽宁兴城），用红夷大炮击退后金军，努尔哈赤在此战中受重伤，不久去世。", "extra": ""}, "cn-nongzheng": {"cat": "典籍", "name": "《农政全书》", "short": "徐光启的农学巨著", "plain": "徐光启编著，总结中国传统农业技术，并介绍了西方的水利方法，是中国古代农学的集大成之作。", "extra": ""}, "cn-salhu": {"cat": "事件", "name": "萨尔浒之战", "short": "1619 年明清兴亡的转折之战", "plain": "明军分四路进攻后金，被努尔哈赤集中兵力各个击破，明军大败，损失惨重。此战之后明朝在辽东由进攻转为防守。", "extra": ""}, "cn-sanfanzhiluan": {"cat": "事件", "name": "三藩之乱", "short": "1673—1681 年南方藩王的叛乱", "plain": "康熙帝决定撤藩后，吴三桂等藩王先后起兵反清，战火遍及南方数省。这场叛乱持续八年，最终被清军平定。", "extra": ""}, "cn-suanfa": {"cat": "典籍", "name": "《算法统宗》", "short": "程大位的珠算著作", "plain": "程大位编著，系统总结了珠算口诀与算法，明代以后广为流传，推动了珠算在商业和日常生活中的应用。", "extra": ""}, "cn-tiangong": {"cat": "典籍", "name": "《天工开物》", "short": "宋应星的工艺技术专著", "plain": "宋应星编写，系统记录了当时农业与手工业的生产技术，被誉为「17 世纪的工艺百科全书」。", "extra": ""}, "cn-xiaoan": {"cat": "典籍", "name": "《晓庵新法》", "short": "王锡阐的历法著作", "plain": "王锡阐编撰的历法著作，兼采中西方法并加以比较评议，是清代重要的历算成果。", "extra": ""}, "cn-xinlixue": {"cat": "思想", "name": "心学", "short": "王守仁创立的儒家学派", "plain": "明代王守仁（王阳明）创立的学派，主张「心即理」「知行合一」「致良知」，强调修养要在自己的内心下功夫。", "extra": ""}, "cn-xuxiake": {"cat": "典籍", "name": "《徐霞客游记》", "short": "徐霞客的考察笔记", "plain": "徐霞客用三十多年时间实地考察并记录，其中对西南地区石灰岩地貌的描述，是世界上最早的系统的喀斯特地貌文献之一。", "extra": ""}, "cn-yapian": {"cat": "事件", "name": "鸦片战争", "short": "1840—1842 年英国发动的侵华战争", "plain": "英国为维护鸦片贸易、打开中国市场而发动的战争。清朝战败，被迫签订《南京条约》，中国从此逐步沦为半殖民地半封建社会。", "extra": ""}};

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

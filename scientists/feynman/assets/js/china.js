/* 同期中国对照 —— 由 tools/build_china_era.py 生成，请勿手改 */
(function () {
  "use strict";
  /* 卡片已按节点序号预计算好（含去重结果与名词标注），这里只负责插进 DOM。 */
  var CARDS = [{"y": 1918, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">民国</span>", "e": [[1912, "<span class=\"term\" data-term=\"cn-minguo\" tabindex=\"0\" role=\"button\">中华民国</span>成立，清帝退位"], [1919, "<span class=\"term\" data-term=\"cn-wusi\" tabindex=\"0\" role=\"button\">五四运动</span>"], [1921, "中国共产党成立"]], "f": [["严复", 1854, 1921, "启蒙思想家", "译<span class=\"term\" data-term=\"cn-tianyan\" tabindex=\"0\" role=\"button\">《天演论》</span>，倡“信、达、雅”"], ["詹天佑", 1861, 1919, "铁路工程", "主持修建京张铁路，“中国铁路之父”"], ["李四光", 1889, 1971, "地质学家", "中国<span class=\"term\" data-term=\"cn-dizhilixue\" tabindex=\"0\" role=\"button\">地质力学</span>奠基人"]]}, {"y": 1939, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">民国</span>", "e": [[1928, "<span class=\"term\" data-term=\"cn-yinxu\" tabindex=\"0\" role=\"button\">殷墟</span>科学发掘开始（中国现代考古学起步）"], [1937, "<span class=\"term\" data-term=\"cn-kangzhan\" tabindex=\"0\" role=\"button\">全面抗战</span>开始"]], "f": [["竺可桢", 1890, 1974, "气象·地理", "中国现代气象学与地理学奠基人"], ["童第周", 1902, 1979, "生物学家", "中国<span class=\"term\" data-term=\"cn-peitai\" tabindex=\"0\" role=\"button\">实验胚胎学</span>主要奠基人"], ["赵九章", 1907, 1968, "大气·空间物理", "中国人造卫星事业倡导者与奠基人之一"]]}, {"y": 1942, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">民国</span>", "e": [], "f": [["侯德榜", 1890, 1974, "化学工程", "<span class=\"term\" data-term=\"cn-houshi\" tabindex=\"0\" role=\"button\">侯氏制碱法</span>，中国重化学工业开拓者"], ["茅以升", 1896, 1989, "桥梁工程", "主持设计建造<span class=\"term\" data-term=\"cn-qiantang\" tabindex=\"0\" role=\"button\">钱塘江大桥</span>"]]}, {"y": 1948, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">民国</span>", "e": [], "f": [["周培源", 1902, 1993, "力学·理论物理", "中国近代力学与理论物理奠基人之一"], ["华罗庚", 1910, 1985, "数学家", "<span class=\"term\" data-term=\"cn-jiexishulun\" tabindex=\"0\" role=\"button\">解析数论</span>等多领域开创性成果"]]}, {"y": 1949, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">民国</span>", "e": [[1949, "中华人民共和国成立"]], "f": [["屠呦呦", 1930, null, "药学家", "发现<span class=\"term\" data-term=\"cn-qinghaosu\" tabindex=\"0\" role=\"button\">青蒿素</span>，2015 年获诺贝尔生理学或医学奖"]]}, {"y": 1954, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">中华人民共和国</span>", "e": [[1956, "<span class=\"term\" data-term=\"cn-guihua\" tabindex=\"0\" role=\"button\">十二年科学技术发展远景规划</span>制定"]], "f": [["钱三强", 1913, 1992, "核物理", "中国原子能科学事业创始人"], ["邓稼先", 1924, 1986, "核物理", "中国核武器研制开拓者与奠基者"]]}, {"y": 1959, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">中华人民共和国</span>", "e": [], "f": [["钱学森", 1911, 2009, "航天工程", "中国航天与导弹事业奠基人"]]}, {"y": 1961, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">中华人民共和国</span>", "e": [], "f": [["黄昆", 1919, 2005, "固体物理", "中国<span class=\"term\" data-term=\"cn-bandao\" tabindex=\"0\" role=\"button\">半导体物理学</span>奠基人之一"]]}, {"y": 1965, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">中华人民共和国</span>", "e": [[1964, "第一颗<span class=\"term\" data-term=\"cn-yuanzidan\" tabindex=\"0\" role=\"button\">原子弹爆炸成功</span>"], [1970, "第一颗人造卫星“<span class=\"term\" data-term=\"cn-dongfanghong\" tabindex=\"0\" role=\"button\">东方红一号</span>”发射成功"], [1973, "袁隆平培育成功<span class=\"term\" data-term=\"cn-zajiao\" tabindex=\"0\" role=\"button\">杂交水稻</span>"]], "f": [["吴文俊", 1919, 2017, "数学家", "<span class=\"term\" data-term=\"cn-tuopu\" tabindex=\"0\" role=\"button\">拓扑学</span>与数学机械化，国家最高科技奖"], ["陈景润", 1933, 1996, "数学家", "<span class=\"term\" data-term=\"cn-gedebahe\" tabindex=\"0\" role=\"button\">哥德巴赫猜想</span>“1+2”证明"], ["王选", 1937, 2006, "计算机", "<span class=\"term\" data-term=\"cn-hanzijiguang\" tabindex=\"0\" role=\"button\">汉字激光照排</span>系统创始人"]]}, {"y": 1986, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">中华人民共和国</span>", "e": [[1978, "<span class=\"term\" data-term=\"cn-kexuedahui\" tabindex=\"0\" role=\"button\">全国科学大会</span>召开，提出“科学技术是生产力”"], [1986, "“<span class=\"term\" data-term=\"cn-863\" tabindex=\"0\" role=\"button\">863 计划</span>”启动，布局高技术发展"]], "f": [["袁隆平", 1930, 2021, "农学家", "<span class=\"term\" data-term=\"cn-zajiao\" tabindex=\"0\" role=\"button\">杂交水稻</span>之父"], ["南仁东", 1945, 2017, "天文学", "<span class=\"term\" data-term=\"cn-fast\" tabindex=\"0\" role=\"button\">FAST</span>“中国天眼”发起者与奠基人"]]}, {"y": 1988, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">中华人民共和国</span>", "e": [[1999, "<span class=\"term\" data-term=\"cn-shenzhou\" tabindex=\"0\" role=\"button\">神舟一号</span>无人试验飞船首次发射成功"], [2003, "<span class=\"term\" data-term=\"cn-shenzhou\" tabindex=\"0\" role=\"button\">神舟五号</span>首次载人航天飞行成功"]], "f": []}];
  var TERMS = {"cn-863": {"cat": "制度", "name": "「863 计划」", "short": "1986 年启动的高技术研究计划", "plain": "1986 年 3 月，根据四位老科学家的建议，中央批准启动的高技术研究发展计划，布局生物、航天、信息、激光、自动化、能源、新材料等领域。", "extra": ""}, "cn-bandao": {"cat": "科技", "name": "半导体物理学", "short": "芯片技术的物理基础", "plain": "研究半导体材料与器件中电子行为的学科，是晶体管、集成电路（芯片）技术的理论基础。黄昆是中国这一领域的奠基人之一。", "extra": ""}, "cn-dizhilixue": {"cat": "科技", "name": "地质力学", "short": "李四光创立的地质学理论", "plain": "李四光创立的理论，用力学原理研究地壳构造及其运动规律。", "extra": ""}, "cn-dongfanghong": {"cat": "科技", "name": "「东方红一号」", "short": "中国第一颗人造地球卫星", "plain": "1970 年 4 月 24 日发射成功，使中国成为世界上第五个独立发射人造卫星的国家。卫星播放的《东方红》乐曲通过广播传遍全国。", "extra": ""}, "cn-fast": {"cat": "科技", "name": "FAST「中国天眼」", "short": "世界最大的单口径射电望远镜", "plain": "位于贵州平塘的 500 米口径球面射电望远镜，2016 年落成启用，用来观测脉冲星、中性氢等射电信号。", "extra": ""}, "cn-gedebahe": {"cat": "科技", "name": "哥德巴赫猜想", "short": "关于质数之和的著名猜想", "plain": "猜想的内容是：每个大于 2 的偶数都能写成两个质数之和。「1+2」指陈景润证明的结论——任一充分大的偶数都可写成一个质数与两个质数乘积之和，这是至今最接近的成果。", "extra": ""}, "cn-guihua": {"cat": "制度", "name": "十二年科学技术发展远景规划", "short": "1956 年制定的第一个长期科技规划", "plain": "1956 年制定的新中国第一个长期科技发展规划，确定了一系列重点任务，其中原子能、导弹、计算机、半导体、无线电电子学等被列为重中之重。", "extra": ""}, "cn-hanzijiguang": {"cat": "科技", "name": "汉字激光照排", "short": "让中文出版告别铅字的技术", "plain": "王选主持研制的汉字印刷技术，用计算机处理字形信息、用激光直接输出，取代了沿用百年的铅字排版。", "extra": ""}, "cn-houshi": {"cat": "科技", "name": "侯氏制碱法", "short": "侯德榜发明的制碱工艺", "plain": "侯德榜发明的制碱新工艺：把制碱与合成氨联合起来，提高食盐利用率、减少废液排放，又称「联合制碱法」。", "extra": ""}, "cn-jiexishulun": {"cat": "科技", "name": "解析数论", "short": "用分析方法研究整数的数学分支", "plain": "数论的一个方向，用微积分等分析方法研究质数分布等整数问题。华罗庚在这一领域取得了多项开创性成果。", "extra": ""}, "cn-kangzhan": {"cat": "事件", "name": "全面抗战", "short": "1937 年起全国抗击日本侵略", "plain": "1937 年 7 月 7 日卢沟桥事变后，中国进入全国性抗击日本侵略的战争阶段，1945 年 8 月日本宣布无条件投降。", "extra": ""}, "cn-kexuedahui": {"cat": "事件", "name": "全国科学大会", "short": "1978 年召开的科技界大会", "plain": "1978 年召开的全国科学大会，明确提出「科学技术是生产力」，标志着中国科技事业重新走上正轨。", "extra": ""}, "cn-minguo": {"cat": "制度", "name": "中华民国", "short": "1912 年建立的共和政体", "plain": "1912 年 1 月 1 日在南京成立，孙中山任临时大总统。同年 2 月清帝退位，清朝统治结束。", "extra": ""}, "cn-nianhao": {"cat": "制度", "name": "年号纪年", "short": "皇帝用来纪年的名号", "plain": "古代皇帝登基后一般会定一个吉祥的名号来纪年。「康熙二十六年」，就是清圣祖玄烨在位的第 26 年。", "extra": "明清两代大多一位皇帝只用同一个年号，所以人们常用年号称呼皇帝，如「康熙帝」「乾隆帝」；唐宋皇帝则常常多次更换年号。"}, "cn-peitai": {"cat": "科技", "name": "实验胚胎学", "short": "用实验方法研究胚胎发育", "plain": "用实验手段研究胚胎发育规律的学科，中国以童第周为主要奠基人之一。", "extra": ""}, "cn-qiantang": {"cat": "科技", "name": "钱塘江大桥", "short": "中国第一座自行设计建造的双层桥", "plain": "1937 年建成的钱塘江大桥，是中国第一座由中国人自行设计、建造的双层公路铁路两用桥，茅以升主持设计。", "extra": "为阻止日军南侵，建成仅 89 天后大桥曾被自行炸断，抗战胜利后修复。"}, "cn-qinghaosu": {"cat": "科技", "name": "青蒿素", "short": "从青蒿中提取的抗疟药物", "plain": "从黄花蒿（中药称青蒿）中提取的有效抗疟成分。屠呦呦团队在 1970 年代发现并提取成功，挽救了大量疟疾患者的生命。", "extra": "2015 年屠呦呦因此获得诺贝尔生理学或医学奖。"}, "cn-shenzhou": {"cat": "科技", "name": "神舟飞船", "short": "中国的载人航天飞船系列", "plain": "中国载人航天工程的飞船系列。1999 年神舟一号无人试验成功，2003 年神舟五号首次载人飞行成功。", "extra": ""}, "cn-tianyan": {"cat": "典籍", "name": "《天演论》", "short": "严复译介进化论的著作", "plain": "严复翻译赫胥黎的著作，1898 年出版，介绍「物竞天择、适者生存」的进化论思想，对近代中国思想界影响极大。", "extra": ""}, "cn-tuopu": {"cat": "科技", "name": "拓扑学", "short": "研究图形连续变形性质的数学分支", "plain": "数学的一个分支，研究图形在连续拉伸、弯曲（不撕裂、不粘合）下保持不变的性质。吴文俊在拓扑学中有重要贡献。", "extra": ""}, "cn-wusi": {"cat": "事件", "name": "五四运动", "short": "1919 年的学生爱国运动", "plain": "因巴黎和会上中国外交受挫，北京学生率先游行抗议，提出「外争主权、内除国贼」，运动迅速扩展到全国各行各业。", "extra": "五四运动是中国新民主主义革命的开端。"}, "cn-yinxu": {"cat": "地方", "name": "殷墟", "short": "商代晚期都城遗址", "plain": "位于今河南安阳，是商代晚期的都城遗址。1928 年开始科学发掘，出土大批甲骨文与青铜器。", "extra": "殷墟的发掘是中国现代考古学的起点。"}, "cn-yuanzidan": {"cat": "科技", "name": "第一颗原子弹", "short": "1964 年中国的首次核试验", "plain": "1964 年 10 月 16 日，中国在新疆罗布泊成功试爆第一颗原子弹，成为世界上第五个拥有核武器的国家。", "extra": ""}, "cn-zajiao": {"cat": "科技", "name": "杂交水稻", "short": "利用杂种优势提高水稻产量", "plain": "把不同品种的水稻杂交，利用杂种一代生长旺盛、产量高的特点来提高收成。袁隆平团队 1973 年实现三系配套，使中国水稻产量大幅提高。", "extra": ""}};

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

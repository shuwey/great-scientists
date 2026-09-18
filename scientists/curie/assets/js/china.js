/* 同期中国对照 —— 由 tools/build_china_era.py 生成，请勿手改 */
(function () {
  "use strict";
  /* 卡片已按节点序号预计算好（含去重结果与名词标注），这里只负责插进 DOM。 */
  var CARDS = [{"y": 1867, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">清·同治六年</span>", "e": [[1861, "<span class=\"term\" data-term=\"cn-yangwu\" tabindex=\"0\" role=\"button\">洋务运动</span>开始"], [1866, "<span class=\"term\" data-term=\"cn-chuanzheng\" tabindex=\"0\" role=\"button\">福州船政局</span>设立"], [1872, "<span class=\"term\" data-term=\"cn-ronghong\" tabindex=\"0\" role=\"button\">容闳</span>率首批留学生赴美"]], "f": [["魏源", 1794, 1857, "思想家", "<span class=\"term\" data-term=\"cn-haiguo\" tabindex=\"0\" role=\"button\">《海国图志》</span>，提出“师夷长技以制夷”"], ["李善兰", 1811, 1882, "数学家", "翻译西方数学与科学著作，创译大量术语"], ["徐寿", 1818, 1884, "化学·工程", "译《化学鉴原》，首创化学元素汉字译名"]]}, {"y": 1891, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">清·光绪十七年</span>", "e": [], "f": [["严复", 1854, 1921, "启蒙思想家", "译<span class=\"term\" data-term=\"cn-tianyan\" tabindex=\"0\" role=\"button\">《天演论》</span>，倡“信、达、雅”"], ["詹天佑", 1861, 1919, "铁路工程", "主持修建京张铁路，“中国铁路之父”"]]}, {"y": 1895, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">清·光绪二十一年</span>", "e": [[1894, "<span class=\"term\" data-term=\"cn-jiawu\" tabindex=\"0\" role=\"button\">中日甲午战争</span>爆发"]], "f": []}, {"y": 1896, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">清·光绪二十二年</span>", "e": [], "f": []}, {"y": 1898, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">清·光绪二十四年</span>", "e": [[1898, "<span class=\"term\" data-term=\"cn-wuxu\" tabindex=\"0\" role=\"button\">戊戌变法</span>；严复《天演论》出版"]], "f": []}, {"y": 1898, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">清·光绪二十四年</span>", "e": [], "f": []}, {"y": 1902, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">清·光绪二十八年</span>", "e": [], "f": []}, {"y": 1903, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">清·光绪二十九年</span>", "e": [], "f": [["黄昆", 1919, 2005, "固体物理", "中国<span class=\"term\" data-term=\"cn-bandao\" tabindex=\"0\" role=\"button\">半导体物理学</span>奠基人之一"], ["吴文俊", 1919, 2017, "数学家", "<span class=\"term\" data-term=\"cn-tuopu\" tabindex=\"0\" role=\"button\">拓扑学</span>与数学机械化，国家最高科技奖"]]}, {"y": 1906, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">清·光绪三十二年</span>", "e": [[1905, "<span class=\"term\" data-term=\"cn-keju\" tabindex=\"0\" role=\"button\">科举</span>废除；中国同盟会成立"]], "f": [["钱学森", 1911, 2009, "航天工程", "中国航天与导弹事业奠基人"], ["钱三强", 1913, 1992, "核物理", "中国原子能科学事业创始人"], ["邓稼先", 1924, 1986, "核物理", "中国核武器研制开拓者与奠基者"]]}, {"y": 1911, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">清·宣统三年</span>", "e": [[1911, "<span class=\"term\" data-term=\"cn-xinhai\" tabindex=\"0\" role=\"button\">辛亥革命</span>，武昌起义"], [1912, "<span class=\"term\" data-term=\"cn-minguo\" tabindex=\"0\" role=\"button\">中华民国</span>成立，清帝退位"]], "f": [["周培源", 1902, 1993, "力学·理论物理", "中国近代力学与理论物理奠基人之一"], ["华罗庚", 1910, 1985, "数学家", "<span class=\"term\" data-term=\"cn-jiexishulun\" tabindex=\"0\" role=\"button\">解析数论</span>等多领域开创性成果"], ["屠呦呦", 1930, null, "药学家", "发现<span class=\"term\" data-term=\"cn-qinghaosu\" tabindex=\"0\" role=\"button\">青蒿素</span>，2015 年获诺贝尔生理学或医学奖"]]}, {"y": 1914, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">民国</span>", "e": [[1919, "<span class=\"term\" data-term=\"cn-wusi\" tabindex=\"0\" role=\"button\">五四运动</span>"], [1921, "中国共产党成立"]], "f": [["李四光", 1889, 1971, "地质学家", "中国<span class=\"term\" data-term=\"cn-dizhilixue\" tabindex=\"0\" role=\"button\">地质力学</span>奠基人"], ["茅以升", 1896, 1989, "桥梁工程", "主持设计建造<span class=\"term\" data-term=\"cn-qiantang\" tabindex=\"0\" role=\"button\">钱塘江大桥</span>"], ["童第周", 1902, 1979, "生物学家", "中国<span class=\"term\" data-term=\"cn-peitai\" tabindex=\"0\" role=\"button\">实验胚胎学</span>主要奠基人"]]}, {"y": 1934, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">民国</span>", "e": [[1928, "<span class=\"term\" data-term=\"cn-yinxu\" tabindex=\"0\" role=\"button\">殷墟</span>科学发掘开始（中国现代考古学起步）"], [1937, "<span class=\"term\" data-term=\"cn-kangzhan\" tabindex=\"0\" role=\"button\">全面抗战</span>开始"], [1949, "中华人民共和国成立"]], "f": [["竺可桢", 1890, 1974, "气象·地理", "中国现代气象学与地理学奠基人"], ["侯德榜", 1890, 1974, "化学工程", "<span class=\"term\" data-term=\"cn-houshi\" tabindex=\"0\" role=\"button\">侯氏制碱法</span>，中国重化学工业开拓者"], ["赵九章", 1907, 1968, "大气·空间物理", "中国人造卫星事业倡导者与奠基人之一"]]}, {"y": 1995, "h": "<span class=\"term\" data-term=\"cn-nianhao\" tabindex=\"0\" role=\"button\">中华人民共和国</span>", "e": [[1986, "“<span class=\"term\" data-term=\"cn-863\" tabindex=\"0\" role=\"button\">863 计划</span>”启动，布局高技术发展"], [1999, "<span class=\"term\" data-term=\"cn-shenzhou\" tabindex=\"0\" role=\"button\">神舟一号</span>无人试验飞船首次发射成功"], [2003, "<span class=\"term\" data-term=\"cn-shenzhou\" tabindex=\"0\" role=\"button\">神舟五号</span>首次载人航天飞行成功"]], "f": [["袁隆平", 1930, 2021, "农学家", "<span class=\"term\" data-term=\"cn-zajiao\" tabindex=\"0\" role=\"button\">杂交水稻</span>之父"], ["王选", 1937, 2006, "计算机", "<span class=\"term\" data-term=\"cn-hanzijiguang\" tabindex=\"0\" role=\"button\">汉字激光照排</span>系统创始人"], ["南仁东", 1945, 2017, "天文学", "<span class=\"term\" data-term=\"cn-fast\" tabindex=\"0\" role=\"button\">FAST</span>“中国天眼”发起者与奠基人"]]}];
  var TERMS = {"cn-863": {"cat": "制度", "name": "「863 计划」", "short": "1986 年启动的高技术研究计划", "plain": "1986 年 3 月，根据四位老科学家的建议，中央批准启动的高技术研究发展计划，布局生物、航天、信息、激光、自动化、能源、新材料等领域。", "extra": ""}, "cn-bandao": {"cat": "科技", "name": "半导体物理学", "short": "芯片技术的物理基础", "plain": "研究半导体材料与器件中电子行为的学科，是晶体管、集成电路（芯片）技术的理论基础。黄昆是中国这一领域的奠基人之一。", "extra": ""}, "cn-chuanzheng": {"cat": "机构", "name": "福州船政局", "short": "洋务运动中的近代造船基地", "plain": "1866 年由左宗棠倡议、沈葆桢主持创办的近代造船厂，附设船政学堂，培养了中国第一代造船与航海人才。", "extra": ""}, "cn-dizhilixue": {"cat": "科技", "name": "地质力学", "short": "李四光创立的地质学理论", "plain": "李四光创立的理论，用力学原理研究地壳构造及其运动规律。", "extra": ""}, "cn-fast": {"cat": "科技", "name": "FAST「中国天眼」", "short": "世界最大的单口径射电望远镜", "plain": "位于贵州平塘的 500 米口径球面射电望远镜，2016 年落成启用，用来观测脉冲星、中性氢等射电信号。", "extra": ""}, "cn-haiguo": {"cat": "典籍", "name": "《海国图志》", "short": "魏源介绍世界的著作", "plain": "魏源编著，系统介绍世界各国的地理、历史与制度，并提出「师夷长技以制夷」，是近代中国「开眼看世界」的代表作。", "extra": ""}, "cn-hanzijiguang": {"cat": "科技", "name": "汉字激光照排", "short": "让中文出版告别铅字的技术", "plain": "王选主持研制的汉字印刷技术，用计算机处理字形信息、用激光直接输出，取代了沿用百年的铅字排版。", "extra": ""}, "cn-houshi": {"cat": "科技", "name": "侯氏制碱法", "short": "侯德榜发明的制碱工艺", "plain": "侯德榜发明的制碱新工艺：把制碱与合成氨联合起来，提高食盐利用率、减少废液排放，又称「联合制碱法」。", "extra": ""}, "cn-jiawu": {"cat": "事件", "name": "甲午战争", "short": "1894—1895 年的中日战争", "plain": "日本以朝鲜问题为借口发动侵华战争，清朝战败，北洋海军覆没，被迫签订《马关条约》，割地赔款，民族危机空前加深。", "extra": ""}, "cn-jiexishulun": {"cat": "科技", "name": "解析数论", "short": "用分析方法研究整数的数学分支", "plain": "数论的一个方向，用微积分等分析方法研究质数分布等整数问题。华罗庚在这一领域取得了多项开创性成果。", "extra": ""}, "cn-kangzhan": {"cat": "事件", "name": "全面抗战", "short": "1937 年起全国抗击日本侵略", "plain": "1937 年 7 月 7 日卢沟桥事变后，中国进入全国性抗击日本侵略的战争阶段，1945 年 8 月日本宣布无条件投降。", "extra": ""}, "cn-keju": {"cat": "制度", "name": "科举", "short": "古代靠考试选拔官员的制度", "plain": "从隋唐开始，国家按层级组织考试来选拔官员：读书人一级一级考上去，考中就能做官。明清时考试内容以四书五经为主，要写格式固定的八股文。", "extra": "1905 年科举被正式废除，新式学堂和出国留学取而代之。"}, "cn-minguo": {"cat": "制度", "name": "中华民国", "short": "1912 年建立的共和政体", "plain": "1912 年 1 月 1 日在南京成立，孙中山任临时大总统。同年 2 月清帝退位，清朝统治结束。", "extra": ""}, "cn-nianhao": {"cat": "制度", "name": "年号纪年", "short": "皇帝用来纪年的名号", "plain": "古代皇帝登基后一般会定一个吉祥的名号来纪年。「康熙二十六年」，就是清圣祖玄烨在位的第 26 年。", "extra": "明清两代大多一位皇帝只用同一个年号，所以人们常用年号称呼皇帝，如「康熙帝」「乾隆帝」；唐宋皇帝则常常多次更换年号。"}, "cn-peitai": {"cat": "科技", "name": "实验胚胎学", "short": "用实验方法研究胚胎发育", "plain": "用实验手段研究胚胎发育规律的学科，中国以童第周为主要奠基人之一。", "extra": ""}, "cn-qiantang": {"cat": "科技", "name": "钱塘江大桥", "short": "中国第一座自行设计建造的双层桥", "plain": "1937 年建成的钱塘江大桥，是中国第一座由中国人自行设计、建造的双层公路铁路两用桥，茅以升主持设计。", "extra": "为阻止日军南侵，建成仅 89 天后大桥曾被自行炸断，抗战胜利后修复。"}, "cn-qinghaosu": {"cat": "科技", "name": "青蒿素", "short": "从青蒿中提取的抗疟药物", "plain": "从黄花蒿（中药称青蒿）中提取的有效抗疟成分。屠呦呦团队在 1970 年代发现并提取成功，挽救了大量疟疾患者的生命。", "extra": "2015 年屠呦呦因此获得诺贝尔生理学或医学奖。"}, "cn-ronghong": {"cat": "人物", "name": "容闳", "short": "中国第一位留美学生", "plain": "中国近代第一位在美国大学毕业的留学生，回国后推动清政府派幼童赴美留学，被称为「中国留学生之父」。", "extra": ""}, "cn-shenzhou": {"cat": "科技", "name": "神舟飞船", "short": "中国的载人航天飞船系列", "plain": "中国载人航天工程的飞船系列。1999 年神舟一号无人试验成功，2003 年神舟五号首次载人飞行成功。", "extra": ""}, "cn-tianyan": {"cat": "典籍", "name": "《天演论》", "short": "严复译介进化论的著作", "plain": "严复翻译赫胥黎的著作，1898 年出版，介绍「物竞天择、适者生存」的进化论思想，对近代中国思想界影响极大。", "extra": ""}, "cn-tuopu": {"cat": "科技", "name": "拓扑学", "short": "研究图形连续变形性质的数学分支", "plain": "数学的一个分支，研究图形在连续拉伸、弯曲（不撕裂、不粘合）下保持不变的性质。吴文俊在拓扑学中有重要贡献。", "extra": ""}, "cn-wusi": {"cat": "事件", "name": "五四运动", "short": "1919 年的学生爱国运动", "plain": "因巴黎和会上中国外交受挫，北京学生率先游行抗议，提出「外争主权、内除国贼」，运动迅速扩展到全国各行各业。", "extra": "五四运动是中国新民主主义革命的开端。"}, "cn-wuxu": {"cat": "事件", "name": "戊戌变法", "short": "1898 年的改良运动", "plain": "光绪帝在康有为、梁启超等推动下推行变法，主张改革科举、办新式学堂、发展工商业。变法只持续了约一百天就被慈禧太后发动的政变终止。", "extra": ""}, "cn-xinhai": {"cat": "事件", "name": "辛亥革命", "short": "推翻清朝统治的革命", "plain": "1911 年（农历辛亥年）武昌起义后爆发的革命，各省纷纷响应，清朝统治土崩瓦解，延续两千多年的君主专制制度就此结束。", "extra": ""}, "cn-yangwu": {"cat": "事件", "name": "洋务运动", "short": "19 世纪后期的自强求富运动", "plain": "19 世纪 60—90 年代，清政府在「自强」「求富」的口号下办近代工厂、建新式海军、开学堂、派留学生，开启了中国近代工业的第一步。", "extra": "1894 年甲午战争中北洋海军覆没，标志着洋务运动的失败。"}, "cn-yinxu": {"cat": "地方", "name": "殷墟", "short": "商代晚期都城遗址", "plain": "位于今河南安阳，是商代晚期的都城遗址。1928 年开始科学发掘，出土大批甲骨文与青铜器。", "extra": "殷墟的发掘是中国现代考古学的起点。"}, "cn-zajiao": {"cat": "科技", "name": "杂交水稻", "short": "利用杂种优势提高水稻产量", "plain": "把不同品种的水稻杂交，利用杂种一代生长旺盛、产量高的特点来提高收成。袁隆平团队 1973 年实现三系配套，使中国水稻产量大幅提高。", "extra": ""}};

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

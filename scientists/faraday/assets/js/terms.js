/* 《读懂法拉第》术语数据库（引擎通用：SITE_TERMS/SITE_PAGES/SITE_CATS） */
window.SITE_TERMS = {
  "induction": {
    name: "电磁感应",
    cat: "物理",
    short: "磁变生电",
    plain: "当穿过闭合线圈的磁通量发生变化时，线圈中就会产生感应电动势与电流，这叫电磁感应。法拉第 1831 年发现它，它是一切发电机与变压器的基础。",
    analogy: "磁像是风，电像是风车——只有吹动时风车才转。",
    page: "induction", anchor: "#flux",
    related: ["flux", "coil", "generator"]
  },
  "flux": {
    name: "磁通量",
    cat: "物理",
    short: "穿过线圈的磁场总量",
    plain: "磁通量衡量有多少磁场穿过某个面。线圈不动时它不变；磁铁靠近或离开时它变化，这种变化正是感应电流的来源。",
    analogy: "像穿过窗户的风的多少。",
    page: "induction", anchor: "#flux",
    related: ["induction", "magnetic-field"]
  },
  "coil": {
    name: "线圈",
    cat: "物理",
    short: "绕成一圈圈的导线",
    plain: "把导线绕成许多匝就成了线圈。匝数越多，同样的磁通变化产生的感应电动势越大，这是法拉第定律的直接结论。",
    analogy: "匝数像是把风车叠了好几层。",
    page: "induction", anchor: "#law",
    related: ["induction", "generator"]
  },
  "current": {
    name: "电流",
    cat: "物理",
    short: "电荷的定向移动",
    plain: "电流是电荷的定向流动。电磁感应产生的电流叫感应电流，其方向总是反抗引起它的磁通变化（楞次定律）。",
    analogy: "像水管里的水流。",
    page: "generator", anchor: "#ac",
    related: ["induction", "generator"]
  },
  "magnetic-field": {
    name: "磁场",
    cat: "电磁",
    short: "磁体周围的空间状态",
    plain: "磁场是磁体或电流周围空间的一种状态，会对运动电荷与磁体施加力。法拉第首次把“场”当作真实的研究对象。",
    analogy: "看不见的网，撒在磁铁周围。",
    page: "field", anchor: "#concept",
    related: ["field-line", "induction"]
  },
  "field-line": {
    name: "力线（磁感线）",
    cat: "电磁",
    short: "把场画出来的线",
    plain: "力线是法拉第用来描述场的一种图示：线上每点的切线方向就是该点场的方向，线的疏密表示场的强弱。铁屑实验可以直观显示它们。",
    analogy: "像地图上的等高线，画的是看不见的高低。",
    page: "field", anchor: "#iron",
    related: ["magnetic-field", "maxwell"]
  },
  "action-at-a-distance": {
    name: "超距作用",
    cat: "物理",
    short: "隔空直接发力",
    plain: "超距作用指两个物体不借助中间介质、隔着空间直接相互作用。法拉第用“场”的观念取代了它，认为力是通过场逐点传递的。",
    analogy: "不是隔空取物，而是一传一、一传一。",
    page: "field", anchor: "#superaction",
    related: ["magnetic-field", "field-line"]
  },
  "maxwell": {
    name: "麦克斯韦",
    cat: "历史",
    short: "把法拉第写成方程的人",
    plain: "麦克斯韦把法拉第的力线与场的思想数学化，得到麦克斯韦方程组，统一了电、磁与光。他自称只是把法拉第的想法翻译成数学语言。",
    analogy: "法拉第画了图，麦克斯韦配了公式。",
    page: "field", anchor: "#maxwell",
    related: ["field-line", "magnetic-field"]
  },
  "generator": {
    name: "发电机",
    cat: "电磁",
    short: "把运动变成电",
    plain: "发电机利用电磁感应，让线圈在磁场中旋转，把机械能转化为电能。法拉第 1831 年的圆盘发电机是第一台。",
    analogy: "一台把“转”换成“亮”的机器。",
    page: "generator", anchor: "#disk",
    related: ["induction", "motor"]
  },
  "motor": {
    name: "电动机",
    cat: "电磁",
    short: "把电变成运动",
    plain: "电动机是发电机的逆过程：通电的线圈在磁场中受力而转动。法拉第 1821 年的电磁旋转装置是它的雏形。",
    analogy: "发电机反过来开，就是电动机。",
    page: "generator", anchor: "#rotation",
    related: ["generator", "current"]
  },
  "electrolysis": {
    name: "电解",
    cat: "电磁",
    short: "用电推动化学反应",
    plain: "电解是让电流通过电解质溶液或熔融物，引起化学分解的过程。法拉第总结出电解定律，指出析出物的质量正比于通过的电量。",
    analogy: "用电流当“钥匙”，把化合物拆开。",
    page: "chem", anchor: "#electrolysis",
    related: ["current", "faraday"]
  },
  "benzene": {
    name: "苯",
    cat: "化学",
    short: "法拉第发现的分子",
    plain: "苯是一种六元环状有机分子。法拉第 1825 年从照明气的残余液体中分离并测定了它，它是芳香族化学的起点。",
    analogy: "有机化学里的一块基石。",
    page: "chem", anchor: "#benzene",
    related: ["faraday"]
  },
  "faraday-cage": {
    name: "法拉第笼",
    cat: "电磁",
    short: "金属罩住的安静空间",
    plain: "法拉第笼是由金属网或金属壳构成的封闭空间，外部电场无法进入其内部，这就是静电屏蔽。电梯里手机信号变差正是这个原理。",
    analogy: "给电磁波装了一道拉不上的门。",
    page: "chem", anchor: "#cage",
    related: ["magnetic-field", "faraday"]
  },
  "christmas-lecture": {
    name: "圣诞讲座",
    cat: "科普",
    short: "讲给孩子听的科学",
    plain: "圣诞讲座是英国皇家研究所面向青少年的科学讲座传统，由法拉第创办并主讲十九次。他的讲稿《蜡烛的故事》至今仍是科普经典。",
    analogy: "把实验室搬上讲台，搬进孩子心里。",
    page: "chem", anchor: "#lecture",
    related: ["faraday", "popular-science"]
  },
  "popular-science": {
    name: "科学普及",
    cat: "科普",
    short: "把专业讲给大众",
    plain: "科学普及是把专业研究用通俗方式讲给公众。法拉第是近代科普的开创者之一，麦克斯韦、霍金、费曼都延续了这条传统。",
    analogy: "把实验室的话，翻译成街头的话。",
    page: "chem", anchor: "#lecture",
    related: ["christmas-lecture", "faraday"]
  },
  "davy": {
    name: "戴维",
    cat: "历史",
    short: "发现法拉第的人",
    plain: "汉弗莱·戴维是英国化学家，法拉第听他的讲座后毛遂自荐，1813 年成为他的助手。据说戴维被问及一生最重要的发现时答：“法拉第。”",
    analogy: "他最好的发现，是一个人。",
    page: "induction", anchor: "#before",
    related: ["faraday"]
  },
  "royal-institution": {
    name: "皇家研究所",
    cat: "历史",
    short: "法拉第的实验室",
    plain: "英国皇家研究所是法拉第度过几乎整个学术生涯的地方，他在此做出电磁感应等重大发现，也在此开创了圣诞讲座。",
    analogy: "一间老房子，装下半部电磁学史。",
    page: "field", anchor: "#iron",
    related: ["davy", "christmas-lecture"]
  },
  "faraday": {
    name: "法拉第",
    cat: "历史",
    short: "最伟大的实验家",
    plain: "迈克尔·法拉第是英国物理学家、化学家。他发现电磁感应、提出场与力线、造出第一台发电机，并在化学与科普上留下深远影响。他几乎全靠自学成才。",
    analogy: "没读过多少书，却改写了人类用电的方式。",
    page: "induction", anchor: "#ring",
    related: ["induction", "field-line", "generator"]
  },
  "diamagnetism": {
    name: "抗磁性",
    cat: "物理",
    short: "被磁场排斥的物质",
    plain: "抗磁性指某些物质在磁场中被微弱排斥的现象。法拉第 1845 年系统研究了它，并据此把磁性分为顺磁与抗磁两类。",
    analogy: "有的东西往磁场里钻，有的往外躲。",
    page: "field", anchor: "#concept",
    related: ["magnetic-field", "faraday"]
  }
};

window.SITE_PAGES = {
  "induction": { title: "电磁感应：磁铁一动，电就来了", url: "detail/induction.html" },
  "field": { title: "力线：他看见了看不见的“场”", url: "detail/field.html" },
  "generator": { title: "发电机：把运动变成电", url: "detail/generator.html" },
  "chem": { title: "不止电磁：电解、苯与法拉第笼", url: "detail/chem.html" }
};

window.SITE_CATS = ["物理", "电磁", "化学", "历史", "科普"];
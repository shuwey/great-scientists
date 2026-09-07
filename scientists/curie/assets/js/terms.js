/* 《读懂居里夫人》术语数据库（引擎通用：SITE_TERMS/SITE_PAGES/SITE_CATS） */
window.SITE_TERMS = {
  "radioactivity": {
    name: "放射性",
    cat: "物理",
    short: "原子自发放射线",
    plain: "放射性是某些不稳定原子核自发放出 α、β、γ 射线并转变为别种核的现象。它来自核内部，与外界条件无关。",
    analogy: "像一颗定时“吐珠子”的豆子，谁也拦不住。",
    page: "radioactivity", anchor: "#own",
    related: ["alpha", "beta", "gamma", "atomic-nucleus"]
  },
  "alpha": {
    name: "α 射线",
    cat: "物理",
    short: "氦核流，穿透弱",
    plain: "α 射线是高速氦原子核（2 质子 2 中子），带正电、穿透力最弱，一张纸就能挡住，但体内照射危害大。",
    analogy: "像慢速的重炮弹，飞不远却很沉。",
    page: "radioactivity", anchor: "#types",
    related: ["beta", "gamma", "radioactivity"]
  },
  "beta": {
    name: "β 射线",
    cat: "物理",
    short: "电子流，穿透中等",
    plain: "β 射线是高速电子（或正电子）流，穿透力比 α 强，能被薄金属或几毫米铝挡住。",
    analogy: "比 α 轻快些，能钻得深一点。",
    page: "radioactivity", anchor: "#types",
    related: ["alpha", "gamma", "radioactivity"]
  },
  "gamma": {
    name: "γ 射线",
    cat: "物理",
    short: "高能光子，穿透强",
    plain: "γ 射线是高频电磁波（光子），不带电、穿透力最强，需要厚铅或混凝土防护。",
    analogy: "像看不见的硬 X 光，最能钻。",
    page: "radioactivity", anchor: "#types",
    related: ["alpha", "beta", "xray"]
  },
  "atomic-nucleus": {
    name: "原子核",
    cat: "物理",
    short: "原子的中心，放射性的源头",
    plain: "原子核位于原子中心，由质子和中子组成。放射性正源于不稳定的原子核“变身份”。",
    analogy: "原子像一颗带核的果仁，放射来自果仁内部。",
    page: "radioactivity", anchor: "#why",
    related: ["radioactivity", "isotope"]
  },
  "becquerel": {
    name: "贝克勒尔",
    cat: "历史",
    short: "先发现铀的射线",
    plain: "法国物理学家贝克勒尔最早发现铀盐能自发使底片感光（1896），为放射性研究开了头；后与居里夫妇同获诺贝尔物理奖。",
    analogy: "他先点亮了灯，居里夫妇把房间照亮。",
    page: "radioactivity", anchor: "#uranium",
    related: ["radioactivity", "curie", "nobel"]
  },
  "radium": {
    name: "镭",
    cat: "化学",
    short: "居里夫妇发现的元素",
    plain: "镭（Ra）是居里夫妇 1898 年发现的元素，放射性极强、在暗处发光。它的提炼证明了放射性可测量、可分离。",
    analogy: "矿渣里淘出的“夜光石”，贵在它的射线。",
    page: "radium", anchor: "#radium",
    related: ["polonium", "pitchblende", "element"]
  },
  "polonium": {
    name: "钋",
    cat: "化学",
    short: "以波兰命名的新元素",
    plain: "钋（Po）是居里夫人发现的第一种新元素，以祖国波兰命名，放射性来自其不稳定原子核。",
    analogy: "她给新元素起了祖国的名字，像寄回一封家书。",
    page: "radium", anchor: "#polonium",
    related: ["radium", "curie", "element"]
  },
  "pitchblende": {
    name: "沥青铀矿",
    cat: "化学",
    short: "镭与钋的“母矿”",
    plain: "沥青铀矿富含铀，也藏着微量的镭、钋。居里夫妇正是从这里，用吨级矿石换回克级产物。",
    analogy: "大海里捞针，他们捞的是发光的那根。",
    page: "radium", anchor: "#tons",
    related: ["radium", "polonium", "element"]
  },
  "element": {
    name: "元素",
    cat: "化学",
    short: "由同种原子构成",
    plain: "元素由一类原子（质子数相同）构成。发现新元素，意味着在周期表上填了一个新格子。",
    analogy: "元素像是化学的“字母”，新元素就是新字母。",
    page: "radium", anchor: "#polonium",
    related: ["radium", "polonium", "isotope"]
  },
  "isotope": {
    name: "同位素",
    cat: "化学",
    short: "同元素、不同中子数",
    plain: "同位素是质子数相同、中子数不同的原子。放射性往往与某些同位素的不稳定有关。",
    analogy: "同一户人家，兄弟高矮不同——都是这家，却各有脾气。",
    page: "radium", anchor: "#glow",
    related: ["element", "atomic-nucleus", "half-life"]
  },
  "decay": {
    name: "衰变",
    cat: "物理",
    short: "核变成另一种核",
    plain: "衰变是不稳定核放出射线、转变为另一种核的过程。它是放射性的“动作”本身。",
    analogy: "核“吐”出点东西，自己就变成了别种核。",
    page: "decay", anchor: "#random",
    related: ["half-life", "radioactivity"]
  },
  "half-life": {
    name: "半衰期",
    cat: "物理",
    short: "活度减半的时间",
    plain: "半衰期是放射性活度减到一半所需的时间，只取决于核种，与外界无关。它是测年的尺子。",
    analogy: "每过一段固定时间，就只剩一半在“跳”。",
    page: "decay", anchor: "#half",
    related: ["decay", "isotope", "radioactivity"]
  },
  "xray": {
    name: "X 射线",
    cat: "物理",
    short: "能透视的高频电磁波",
    plain: "X 射线是频率极高的电磁波，能穿透软组织、被骨骼遮挡而成像，广泛用于医学检查。",
    analogy: "一束高频波，像给身体拍“影子照”。",
    page: "xray", anchor: "#xray",
    related: ["gamma", "cancer-treatment"]
  },
  "cancer-treatment": {
    name: "放射治疗",
    cat: "医学",
    short: "用射线杀癌细胞",
    plain: "放疗利用射线（如 γ、X）破坏快速分裂的癌细胞，是癌症治疗的重要支柱之一。",
    analogy: "同一束能成像的光，调高剂量就能“定点清除”。",
    page: "xray", anchor: "#therapy",
    related: ["xray", "radiation-safety"]
  },
  "mobile-xray": {
    name: "移动 X 光车",
    cat: "历史",
    short: "居里夫人的战地发明",
    plain: "一战期间，居里夫人组织可机动的 X 光车（“小居里”）上前线，帮医生定位弹片与骨折，挽救无数伤员。",
    analogy: "把实验室搬上卡车，开到伤员身边。",
    page: "xray", anchor: "#war",
    related: ["xray", "curie"]
  },
  "radiation-safety": {
    name: "辐射防护",
    cat: "医学",
    short: "用射线必须懂防护",
    plain: "射线在治病的同时也会伤身。铅屏蔽、距离、时间控制等防护原则，是放射医学的底线。",
    analogy: "火能煮饭也能烧手，离远点、挡一挡才安全。",
    page: "xray", anchor: "#safety",
    related: ["xray", "gamma", "cancer-treatment"]
  },
  "nobel": {
    name: "诺贝尔奖",
    cat: "历史",
    short: "她拿了两回",
    plain: "居里夫人获 1903 年物理奖（与贝克勒尔、皮埃尔分享）与 1911 年化学奖，是首位两获诺奖、且横跨两科的人。",
    analogy: "两座奖杯，一座物理、一座化学，都被她抱回。",
    page: "xray", anchor: "#safety",
    related: ["curie", "becquerel"]
  },
  "curie": {
    name: "居里夫人",
    cat: "历史",
    short: "放射性研究的先驱",
    plain: "玛丽·居里是放射性研究的开创者之一，发现钋与镭，两获诺贝尔奖，并把放射知识用于医学与人道救助。",
    analogy: "她把“看不见的射线”第一次变成了科学与人道的力量。",
    page: "radioactivity", anchor: "#why",
    related: ["pierre", "becquerel", "radium", "nobel"]
  },
  "pierre": {
    name: "皮埃尔·居里",
    cat: "历史",
    short: "并肩作战的丈夫与伙伴",
    plain: "法国物理学家皮埃尔·居里与玛丽共同研究放射性，发明了测量放射性的仪器，1906 年因车祸早逝。",
    analogy: "他与她共用一台“探测仪”，把谜团一点点量出来。",
    page: "radium", anchor: "#tons",
    related: ["curie", "radioactivity"]
  }
};

window.SITE_PAGES = {
  radioactivity: { title: "放射性：原子自己在放东西", url: "detail/radioactivity.html" },
  radium: { title: "镭：从矿渣里淘出的光", url: "detail/radium.html" },
  decay: { title: "衰变与半衰期：放射会变弱", url: "detail/decay.html" },
  xray: { title: "把射线用于人：医学与战时", url: "detail/xray.html" }
};

window.SITE_CATS = ["物理", "化学", "医学", "历史"];
/* 《读懂巴斯德》术语数据库（引擎通用：SITE_TERMS/SITE_PAGES/SITE_CATS） */
window.SITE_TERMS = {
  "microbe": {
    name: "微生物",
    cat: "生物",
    short: "肉眼难见的小生命",
    plain: "微生物是细菌、酵母、霉菌等微小生物的总称。巴斯德证明它们参与发酵、腐败，也引起疾病。",
    analogy: "看不见的小房客，既能帮你酿酒，也能偷走你的健康。",
    page: "germ", anchor: "#theory",
    related: ["germ-theory", "fermentation"]
  },
  "germ-theory": {
    name: "病菌学说",
    cat: "医学",
    short: "特定微生物导致特定疾病",
    plain: "病菌学说认为许多疾病由特定微生物引起，而非“瘴气”或体内失衡。它是现代医学与公共卫生的基石。",
    analogy: "把“生病”从玄学拉回“有具体凶手”的案子。",
    page: "germ", anchor: "#theory",
    related: ["microbe", "contagion", "koch"]
  },
  "fermentation": {
    name: "发酵",
    cat: "生物",
    short: "微生物干的“化学活”",
    plain: "发酵是微生物分解糖类产生酒精、乳酸等的过程。巴斯德证明发酵由活微生物引起，而非纯化学变化。",
    analogy: "微小的“酿酒工”在汤里加班，把糖变成了酒。",
    page: "germ", anchor: "#theory",
    related: ["microbe", "pasteurization"]
  },
  "microscope": {
    name: "显微镜",
    cat: "方法",
    short: "把看不见的放大",
    plain: "显微镜让人第一次直接看到微生物世界，是微生物学诞生的眼睛。",
    analogy: "给眼睛装了一架梯子，够到了原本够不着的微小世界。",
    page: "germ", anchor: "#before",
    related: ["microbe", "germ-theory"]
  },
  "contagion": {
    name: "传染",
    cat: "医学",
    short: "病原从一人到另一人",
    plain: "传染指致病微生物在个体间传播。承认传染，才谈得上隔离、消毒等防控手段。",
    analogy: "坏消息会传，坏病菌也会——而且更快。",
    page: "germ", anchor: "#evidence",
    related: ["germ-theory", "hygiene"]
  },
  "koch": {
    name: "科赫",
    cat: "历史",
    short: "把病菌一一对上号",
    plain: "德国医生科赫提出“科赫法则”，系统证明某病菌对应某疾病（如炭疽、结核），完善了病菌学说。",
    analogy: "给每个“凶手”配一张确切的“通缉照”。",
    page: "germ", anchor: "#evidence",
    related: ["germ-theory", "microbe"]
  },
  "pasteurization": {
    name: "巴氏杀菌",
    cat: "医学",
    short: "温热灭坏菌、留好味",
    plain: "巴氏杀菌用适度加热杀灭液体中的致病与腐败微生物，尽量保留营养风味，广泛用于奶、酒、果汁。",
    analogy: "像给汤“量体温”后刚好烫退坏菌，又不烫糊好味。",
    page: "pasteurization", anchor: "#what",
    related: ["sterilization", "microbe"]
  },
  "sterilization": {
    name: "灭菌",
    cat: "方法",
    short: "彻底清掉微生物",
    plain: "灭菌指用加热、过滤等方法除去或杀灭所有微生物。巴斯德的实验依赖先把器具与液体灭菌，才能看清“有没有外来污染”。",
    analogy: "先把操场清空，才看得出有没有人偷偷溜进来。",
    page: "pasteurization", anchor: "#how",
    related: ["pasteurization", "swan-neck-flask"]
  },
  "vaccination": {
    name: "疫苗",
    cat: "医学",
    short: "用弱敌练兵，以防真敌",
    plain: "疫苗把减毒或灭活的病原送入体内，让免疫系统提前生成保护力，遇真病原时能快速反应。",
    analogy: "先放弱敌人进来彩排，真敌人来时早已练熟。",
    page: "vaccine", anchor: "#method",
    related: ["rabies", "immunity", "attenuated"]
  },
  "rabies": {
    name: "狂犬病",
    cat: "医学",
    short: "巴斯德攻克的第一例",
    plain: "狂犬病由病毒引起、几乎必死。1885 年巴斯德用减毒疫苗救下被疯狗咬伤的少年，开创疫苗对抗该病的先河。",
    analogy: "过去是“咬了就等死”，他硬生生插进了一道生门。",
    page: "vaccine", anchor: "#rabies",
    related: ["vaccination", "immunity"]
  },
  "anthrax": {
    name: "炭疽",
    cat: "医学",
    short: "先在牲畜上验证疫苗",
    plain: "炭疽是由细菌引起的家畜烈性传染病。巴斯德用减毒菌做公开对比实验，证明疫苗可护住牲畜，震动学界。",
    analogy: "先拿羊当“对照试卷”，把疫苗考成了满分。",
    page: "vaccine", anchor: "#anthrax",
    related: ["vaccination", "attenuated"]
  },
  "immunity": {
    name: "免疫",
    cat: "医学",
    short: "身体记住了敌人",
    plain: "免疫是身体识别并清除病原、且“记住”它的能力。疫苗正是利用这种记忆，让保护提前就位。",
    analogy: "身体里藏着一本“通缉相册”，见过的敌人一眼认出。",
    page: "vaccine", anchor: "#legacy",
    related: ["vaccination", "inoculation"]
  },
  "attenuated": {
    name: "减毒",
    cat: "医学",
    short: "把病原练“弱”",
    plain: "减毒指通过特殊培养让病原致病力下降却仍保留“被识别”的特征，用作疫苗。这是巴斯德疫苗的核心技术。",
    analogy: "把猛兽关进小笼子，让它吓唬身体却伤不了人。",
    page: "vaccine", anchor: "#method",
    related: ["vaccination", "rabies"]
  },
  "inoculation": {
    name: "接种",
    cat: "医学",
    short: "把疫苗送进身体",
    plain: "接种是把疫苗引入体内的操作。从种痘到注射，本质都是“提前送入信号”，唤起免疫。",
    analogy: "往身体里递一张“敌人照片”，让它先认个脸。",
    page: "vaccine", anchor: "#method",
    related: ["vaccination", "immunity"]
  },
  "spontaneous-generation": {
    name: "自然发生说",
    cat: "历史",
    short: "生命自己冒出来",
    plain: "自然发生说认为生命可从无生命物质直接产生（如腐肉生蛆）。巴斯德用实验否定了它。",
    analogy: "以为“垃圾放久了自己长出老鼠”——看着像，其实是误会。",
    page: "spontaneous", anchor: "#belief",
    related: ["swan-neck-flask", "biogenesis"]
  },
  "swan-neck-flask": {
    name: "鹅颈瓶",
    cat: "方法",
    short: "留住空气、拦住尘埃",
    plain: "鹅颈瓶的弯管让空气可进、尘埃（带微生物）沉底，肉汤因此久不腐败。它是有史以来最优雅的对照实验之一。",
    analogy: "一道弯管像守门员，放空气进、把坏东西挡在门外。",
    page: "spontaneous", anchor: "#flask",
    related: ["spontaneous-generation", "sterilization"]
  },
  "biogenesis": {
    name: "生源说",
    cat: "方法",
    short: "生命来自生命",
    plain: "生源说主张新生命只能来自已有的生命，而非无中生有。巴斯德的实验是它最有力的证据。",
    analogy: "孩子总有父母——生命不会凭空“冒”出来。",
    page: "spontaneous", anchor: "#result",
    related: ["spontaneous-generation", "microbe"]
  },
  "silkworm": {
    name: "蚕病研究",
    cat: "历史",
    short: "救活一门产业",
    plain: "巴斯德受法国政府之托研究蚕的“微粒病”，找出病原并给出检疫法，挽救了丝绸产业，也展现了他把科学用于实业的本领。",
    analogy: "先救活一群蚕，再救活一整座城的饭碗。",
    page: "spontaneous", anchor: "#meaning",
    related: ["microbe", "pasteurization"]
  },
  "hygiene": {
    name: "卫生",
    cat: "医学",
    short: "切断微生物的路",
    plain: "洗手、消毒、清洁饮水等卫生习惯，本质都是减少致病微生物的传播。病菌学说让它们从“讲究”变成“科学”。",
    analogy: "把微生物的“高速公路”挖断，病就难上门。",
    page: "germ", anchor: "#impact",
    related: ["contagion", "pasteurization"]
  },
  "chemistry": {
    name: "化学",
    cat: "方法",
    short: "他起家的本行",
    plain: "巴斯德是训练有素的化学家，研究晶体与分子不对称。这种“看微观结构”的功底，后来帮他看穿微观生命。",
    analogy: "先学会看分子的“指纹”，才看懂细胞的“脸”。",
    page: "germ", anchor: "#before",
    related: ["microbe", "fermentation"]
  },
  "pasteur-institute": {
    name: "巴斯德研究所",
    cat: "历史",
    short: "他留下的阵地",
    plain: "巴斯德创立的研究所（1888）至今仍是顶尖的传染病研究机构，延续着他“以科学对抗疾病”的志向。",
    analogy: "他留下的一座堡垒，后人仍在里面作战。",
    page: "vaccine", anchor: "#legacy",
    related: ["vaccination", "rabies"]
  }
};

window.SITE_PAGES = {
  germ: { title: "病菌学说：病从微小处来", url: "detail/germ.html" },
  pasteurization: { title: "巴氏杀菌：用温度管住微生物", url: "detail/pasteurization.html" },
  vaccine: { title: "疫苗：用弱敌练兵", url: "detail/vaccine.html" },
  spontaneous: { title: "否定自然发生说", url: "detail/spontaneous.html" }
};

window.SITE_CATS = ["生物", "医学", "方法", "历史"];
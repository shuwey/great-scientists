# -*- coding: utf-8 -*-
"""玻尔子站内容规格。运行后生成 spec_bohr.json。"""
import json, os

SPEC = {
  "id": "bohr",
  "name": "玻尔",
  "en": "Niels Bohr",
  "years": "1885–1962",
  "kicker": "原子结构的奠基者 · 1885—1962",
  "lede": "他给原子画出了第一张“可计算的”结构图：电子只能在固定的能级上待着，跳来跳去时放出或吸收光。这把量子思想第一次装进了原子，也开启了哥本哈根学派。",
  "meta": "读懂玻尔：用中学生能听懂的话，讲清原子为什么发光、量子是什么，以及他如何塑造了现代物理。",
  "biotitle": "他让“原子内部”第一次变得可计算",
  "bio": [
    "尼尔斯·玻尔（1885—1962），丹麦物理学家。他在 1913 年提出“玻尔模型”，把普朗克的量子思想用到了原子结构上。",
    "他创立的哥本哈根学派，是量子力学的思想中心；他与爱因斯坦关于“上帝是否掷骰子”的辩论，至今仍是科学哲学的典范。",
    "二战期间他辗转逃出纳粹占领的丹麦，参与原子弹研究；战后他奔走呼吁科学开放合作，是 CERN 的精神先驱之一。"
  ],
  "portrait": "bohr-portrait.jpg",
  "about_claim": "本页说明玻尔子站内容的依据与延伸去处。",
  "about_body": "<h2>资料来源</h2><p>本子站内容依据公开科学史通识编写，核心事实（1913 玻尔模型、1922 诺贝尔物理奖、哥本哈根学派、与爱因斯坦的论战、战后推动 CERN）与主流科学史一致。历史图片均来自 Wikimedia Commons 公有领域资源。</p><h2>延伸阅读</h2><p>想深入：玻尔《论原子构造与分子构造》；《爱因斯坦与玻尔论战》相关文集。</p>",
  "tl_desc": "从哥本哈根到普林斯顿：玻尔如何把“量子”装进原子。",
  "tl_claim": "1885 年出生，1962 年辞世。他给原子定了“能级”，也给物理学定了“互补”的基调。",
  "cats": ["物理", "量子", "历史", "方法"],
  "hero_scene": "atom",
  "hero_params": {"label": "电子在固定的能级上跳进跳出"},

  "pages": {
    "bohr-model": {
      "title": "玻尔模型：原子的“楼层”",
      "file": "detail/bohr-model.html",
      "claim": "玻尔在 1913 年提出：电子只能待在若干固定的“轨道/能级”上（定态），从一个能级跳到另一个时，才放出或吸收一份特定能量的光。",
      "tags": ["玻尔模型", "能级", "原子"],
      "year": "1913",
      "card": "电子不是乱飞，而是“按层”待着。",
      "scene": "atom",
      "scene_params": {"label": "电子在固定壳层上运动"},
      "remember": "一句话记住：原子像一栋楼，电子只能待在某一层；换层时，就亮起或熄灭一盏“光”。",
      "sideterms": ["bohr-model", "energy-level", "stationary-state", "electron", "photon"],
      "sections": [
        {"id": "problem", "h": "一、卢瑟福的难题", "body": "卢瑟福发现原子中心有个很小的核，电子像行星绕太阳。但按经典物理，绕转的电子会不断辐射能量、掉进核里——原子应该瞬间塌掉。",
         "fig": "bohr-model", "figalt": "原子结构", "figcap": "电子绕着小小的核转。"},
        {"id": "quantize", "h": "二、给轨道“上锁”", "body": "玻尔大胆假设：电子的角动量只能取某些离散值，因此只能在固定的“允许轨道”上运动，不会辐射能量。这就是“量子化”。",
         "figalt": "离散的轨道", "figcap": "轨道不是任意的，而是被“挑”出来的。"},
        {"id": "stationary", "h": "三、定态与跃迁", "body": "在允许轨道上电子处于“定态”，不辐射；只有当它从高能级跳到低能级，才放出一份能量（光子）。能级差决定光的颜色。",
         "figalt": "跃迁发光", "figcap": "跳一下，就放出一束特定颜色的光。"},
        {"id": "why", "h": "四、为什么是革命", "body": "这是第一次用量子思想解释原子内部结构，成功算出氢原子光谱——经典物理在这里彻底失灵。",
         "figalt": "原子可被计算", "figcap": "看不见的原子，第一次有了可算的公式。"}
      ]
    },
    "spectrum": {
      "title": "氢原子光谱：巴尔末系",
      "file": "detail/spectrum.html",
      "claim": "氢原子被电激发后会发出几条离散的彩色谱线（巴尔末系）。玻尔模型用“能级差 = 光子能量”精确解释了它们的位置。",
      "tags": ["光谱", "巴尔末系", "谱线"],
      "year": "1885 / 1913",
      "card": "一条条彩线，藏着能级的“台阶”。",
      "scene": "graph",
      "scene_params": {"label": "能级差决定谱线位置"},
      "remember": "一句话记住：看光谱不是看“一整片颜色”，而是看“几条分立的线”——每一条都对应一次能级跳跃。",
      "sideterms": ["spectral-line", "balmer", "photon", "energy-level", "quantum"],
      "sections": [
        {"id": "lines", "h": "一、分立的谱线", "body": "白光透过棱镜是连续彩虹；但氢气的辉光经棱镜后只出现几条分离的亮线。这说明原子只“认”特定的能量。",
         "fig": "spectrum", "figalt": "分立谱线", "figcap": "不是彩虹，而是几道清晰的亮线。"},
        {"id": "balmer", "h": "二、巴尔末公式", "body": "1885 年巴尔末用一个简洁公式算出了可见区氢谱线的波长，却没有理论解释。它成了检验任何原子理论的标准。",
         "figalt": "公式预言", "figcap": "一串数字，精准地落在实验上。"},
        {"id": "match", "h": "三、玻尔对上了", "body": "玻尔用“能级差 = h×频率”把公式和模型连起来：电子从某个高能级跳到第二能级，就给出巴尔末系。理论第一次预言了实验。",
         "figalt": "理论与实验吻合", "figcap": "模型的台阶，正好对上谱线的位置。"},
        {"id": "meaning", "h": "四、指纹般的证据", "body": "每种元素都有独特谱线，像指纹。今天天文学家靠它辨认遥远星球的成分——源头正是玻尔解释的这条规律。",
         "figalt": "宇宙的化学指纹", "figcap": "看一眼光谱，就知道那里有什么。"}
      ]
    },
    "complementarity": {
      "title": "互补原理：波还是粒子？",
      "file": "detail/complementarity.html",
      "claim": "玻尔提出“互补原理”：微观对象（如电子）既表现出波动性又表现粒子性，但这两面不能在同一实验中同时完整展现，它们互补才构成完整图像。",
      "tags": ["互补原理", "波粒二象性", "量子"],
      "year": "1927",
      "card": "它不是非此即彼，而是互为补充。",
      "scene": "wave",
      "scene_params": {"label": "电子既是波也是粒子"},
      "remember": "一句话记住：电子像“硬币的两面”——你看到哪一面，取决于你怎么看；两面合起来才是完整的它。",
      "sideterms": ["complementarity", "quantum", "uncertainty", "copenhagen"],
      "sections": [
        {"id": "duality", "h": "一、两面性", "body": "电子打在屏上是一个点（粒子），穿过双缝却留下干涉条纹（波）。两种看似矛盾的行为，都在实验里真实出现。",
         "fig": "complementarity", "figalt": "波与粒子", "figcap": "同一对象，两种面孔。"},
        {"id": "complement", "h": "二、互补而非矛盾", "body": "玻尔说：波与粒子不是互相否定，而是互补——要完整描述电子，两种图像都必须保留，只是不能在同一装置里同时显现。",
         "figalt": "互补图像", "figcap": "两面拼一起，才是全貌。"},
        {"id": "measure", "h": "三、测量改变结果", "body": "你想看清它是粒子，装置就逼出粒子性；想看波动，装置就逼出波动性。观测方式本身参与了“显现什么”。",
         "figalt": "测量即参与", "figcap": "你怎么问，它怎么答。"},
        {"id": "philosophy", "h": "四、对科学的冲击", "body": "互补原理把“客观实在”的旧观念搅动起来，引发与爱因斯坦的长期论战，也深刻影响了哲学与方法论。",
         "figalt": "观念的地震", "figcap": "物理不再只是“看见”，而是“约定如何看”。"}
      ]
    },
    "copenhagen": {
      "title": "哥本哈根学派与核裂变",
      "file": "detail/copenhagen.html",
      "claim": "玻尔在哥本哈根创立研究所，聚起一代量子精英；他提出的“液滴模型”为理解原子核裂变提供了关键图像。",
      "tags": ["哥本哈根", "液滴模型", "裂变"],
      "year": "1921 / 1939",
      "card": "一所研究所，养活了整个量子时代。",
      "scene": "atom",
      "scene_params": {"label": "原子核像一颗会抖动的液滴"},
      "remember": "一句话记住：玻尔不只造理论，还造了一个“学派”；裂变这把双刃剑，也沿着他的思路被打开。",
      "sideterms": ["copenhagen", "nucleus", "fission", "rutherford", "nobel"],
      "sections": [
        {"id": "institute", "h": "一、研究所的建立", "body": "1921 年玻尔在哥本哈根建立理论物理研究所，海森堡、泡利、狄拉克等青年才俊云集，量子力学的核心思想在此成形。",
         "fig": "copenhagen", "figalt": "哥本哈根研究所", "figcap": "一代人的思想集散地。"},
        {"id": "debate", "h": "二、与爱因斯坦的论战", "body": "从 1927 年起，玻尔与爱因斯坦反复辩论量子力学的完备性。“上帝不掷骰子”对“我们观测到的就是全部”——这场对话定义了现代物理的边界。",
         "figalt": "世纪辩论", "figcap": "两位巨人，争论“实在”是什么。"},
        {"id": "droplet", "h": "三、液滴模型", "body": "玻尔把原子核比作会抖动的液滴：被中子撞击时可能“晃裂”成两半。这一图像直接帮助理解了核裂变。",
         "figalt": "液滴般的核", "figcap": "核像水珠，撞一下就裂开。"},
        {"id": "fission", "h": "四、裂变的双刃剑", "body": "1939 年前后，裂变机制被阐明。它既是和平利用核能的基础，也通向了原子弹——玻尔晚年为此忧心并呼吁国际合作。",
         "figalt": "能量与责任", "figcap": "同一把钥匙，开两扇门。"}
      ]
    }
  },

  "terms": {
    "bohr-model": {"name": "玻尔模型", "cat": "物理", "short": "电子分层待着的原子图", "plain": "玻尔模型认为电子只能在若干固定的能级（轨道）上运动；在定态不辐射，跃迁时放出或吸收一份光子。它首次成功解释了氢原子光谱。", "analogy": "像一栋楼，人只能待在某一层，换层时灯亮或灭。", "page": "bohr-model", "anchor": "#quantize", "related": ["energy-level", "stationary-state", "electron", "quantum"]},
    "quantization": {"name": "量子化", "cat": "量子", "short": "只能取某些离散值", "plain": "量子化指某些物理量（如角动量、能量）不能连续取值，只能取离散的“一份一份”。这是量子世界与日常连续世界的根本区别。", "analogy": "楼梯只能一级一级走，不能停在半级。", "page": "bohr-model", "anchor": "#quantize", "related": ["quantum", "energy-level", "bohr-model"]},
    "stationary-state": {"name": "定态", "cat": "量子", "short": "不辐射的“停留态”", "plain": "定态是电子在允许能级上稳定停留的状态，此时不向外辐射能量——正因如此原子才不会瞬间塌缩。", "analogy": "停在楼梯某一级上不动，就不会滑下去。", "page": "bohr-model", "anchor": "#stationary", "related": ["energy-level", "bohr-model", "photon"]},
    "energy-level": {"name": "能级", "cat": "物理", "short": "电子能待的“楼层”", "plain": "能级是原子中电子允许具有的离散能量值，由低到高像楼层。电子在能级间跃迁，能量差以光子形式出现。", "analogy": "原子的“楼层表”，每层有固定高度。", "page": "bohr-model", "anchor": "#quantize", "related": ["bohr-model", "photon", "spectral-line"]},
    "electron": {"name": "电子", "cat": "物理", "short": "带负电的轻粒子", "plain": "电子是绕核运动的带负电轻粒子，决定原子的化学性质；在玻尔模型里，它只能待在固定能级上。", "analogy": "原子核是太阳，电子是绕转的小行星。", "page": "bohr-model", "anchor": "#problem", "related": ["nucleus", "photon", "energy-level"]},
    "photon": {"name": "光子", "cat": "量子", "short": "光的“一份”能量", "plain": "光子是光的最小能量单位，能量 = 普朗克常数 × 频率。电子跃迁时，能级差正好等于放出光子的能量。", "analogy": "光不是流水，而是一颗颗能量小珠子。", "page": "bohr-model", "anchor": "#stationary", "related": ["energy-level", "quantum", "spectral-line"]},
    "spectral-line": {"name": "谱线", "cat": "物理", "short": "分光后的一条亮线", "plain": "谱线是物质发光经分光后出现的离散亮线，每条对应特定能级差。元素谱线像指纹，可用于辨认成分。", "analogy": "每种物质都有自己的“光纹身”。", "page": "spectrum", "anchor": "#lines", "related": ["balmer", "energy-level", "photon"]},
    "balmer": {"name": "巴尔末系", "cat": "物理", "short": "氢可见光谱线族", "plain": "巴尔末系是氢原子电子跳到第二能级时发出的可见光谱线族，1885 年被公式精确描述，后被玻尔模型从理论解释。", "analogy": "氢的“可见签名”，几条线排成规律。", "page": "spectrum", "anchor": "#balmer", "related": ["spectral-line", "energy-level", "bohr-model"]},
    "quantum": {"name": "量子", "cat": "量子", "short": "离散的“最小份额”", "plain": "量子指物理量的最小不可分割份额；量子力学研究微观世界里能量、角动量等取离散值的现象。", "analogy": "世界在最小处是“颗粒状”的，不是连续的。", "page": "complementarity", "anchor": "#duality", "related": ["quantization", "photon", "complementarity"]},
    "complementarity": {"name": "互补原理", "cat": "量子", "short": "波与粒子，互补才完整", "plain": "互补原理认为微观对象同时具有波与粒子两面，但这两面不能在同一实验中同时完整显现；二者互补才构成完整描述。", "analogy": "硬币有两面，你一次只能看清一面。", "page": "complementarity", "anchor": "#complement", "related": ["quantum", "uncertainty", "copenhagen"]},
    "uncertainty": {"name": "测不准原理", "cat": "量子", "short": "位置与动量难兼得", "plain": "测不准原理（海森堡）指出，微观粒子的位置与动量无法同时被任意精确测定；这与互补原理共同刻画了量子测量的边界。", "analogy": "越看清它“在哪”，就越糊涂它“要去哪”。", "page": "complementarity", "anchor": "#measure", "related": ["complementarity", "quantum", "copenhagen"]},
    "copenhagen": {"name": "哥本哈根学派", "cat": "历史", "short": "量子力学的思想中心", "plain": "哥本哈根学派以玻尔研究所为核心，是量子力学诠释（互补原理、概率本性）的主要来源，对现代物理影响深远。", "analogy": "一个实验室，养出了整个时代的脑子。", "page": "copenhagen", "anchor": "#institute", "related": ["bohr-model", "complementarity", "rutherford"]},
    "rutherford": {"name": "卢瑟福", "cat": "历史", "short": "先发现原子核", "plain": "卢瑟福通过 α 粒子散射实验发现原子中心有个很小的核，并提出行星式原子模型；玻尔是他的学生，在此基础上加入量子化。", "analogy": "他先画出太阳，玻尔再给行星定轨道。", "page": "copenhagen", "anchor": "#institute", "related": ["nucleus", "bohr-model", "electron"]},
    "nucleus": {"name": "原子核", "cat": "物理", "short": "原子中心的小而重", "plain": "原子核位于原子中心，集中了几乎全部质量与正电荷；玻尔的“液滴模型”把它比作会抖动的液滴，用以理解裂变。", "analogy": "原子像个带核的小宇宙，核是极重的心脏。", "page": "copenhagen", "anchor": "#droplet", "related": ["electron", "rutherford", "fission"]},
    "fission": {"name": "核裂变", "cat": "物理", "short": "重核裂成两半", "plain": "核裂变是重原子核（如铀）被中子撞击后分裂成两个较轻核，并释放能量与更多中子。玻尔的液滴模型帮助理解了这一过程。", "analogy": "一颗水珠被撞裂成两滴，还溅出水花。", "page": "copenhagen", "anchor": "#fission", "related": ["nucleus", "nucleus", "copenhagen"]},
    "correspondence": {"name": "对应原理", "cat": "方法", "short": "量子要退化回经典", "plain": "对应原理要求：在宏观（大量子数）极限下，量子理论的结果必须与经典物理一致。它是玻尔构造新理论的方法论准则。", "analogy": "新理论在“大尺度”上要认老理论这个亲戚。", "page": "bohr-model", "anchor": "#why", "related": ["bohr-model", "quantum", "copenhagen"]},
    "nobel": {"name": "诺贝尔奖", "cat": "历史", "short": "他拿了物理奖", "plain": "玻尔因原子结构及辐射研究获 1922 年诺贝尔物理奖；他主持的研究所也走出了多位诺奖得主。", "analogy": "一座奖杯，背后是一整个学派。", "page": "copenhagen", "anchor": "#institute", "related": ["bohr-model", "copenhagen"]}
  },

  "timeline": [
    {"year": 1885, "id": "born", "title": "生于哥本哈根", "img": "bohr-portrait.jpg", "alt": "玻尔", "fig": "尼尔斯·玻尔 1885 年生于丹麦哥本哈根。", "body": "10 月 7 日，玻尔出生。他后来成为丹麦乃至世界物理的标志性人物。"},
    {"year": 1911, "id": "phd", "title": "博士与卢瑟福", "img": "rutherford.jpg", "alt": "卢瑟福", "fig": "在卢瑟福实验室接触原子模型。", "body": "玻尔获博士学位后赴英国，在卢瑟福手下工作，开始思考原子的结构。"},
    {"year": 1913, "id": "model", "title": "玻尔模型", "img": "bohr-model-diagram.jpg", "alt": "玻尔模型图", "fig": "电子只能在固定能级上。", "body": "他发表三篇论文提出原子模型：定态、量子化轨道、跃迁发光，成功解释氢光谱。"},
    {"year": 1921, "id": "institute", "title": "哥本哈根研究所", "img": "copenhagen-institute.jpg", "alt": "研究所", "fig": "量子精英的聚集地。", "body": "他创立理论物理研究所，海森堡、泡利、狄拉克等在此工作，哥本哈根学派成形。"},
    {"year": 1922, "id": "nobel", "title": "诺贝尔物理奖", "img": "nobel.jpg", "alt": "诺贝尔奖", "fig": "因原子结构研究获奖。", "body": "因原子结构及辐射研究获诺贝尔物理奖。"},
    {"year": 1927, "id": "complement", "title": "互补原理", "img": "complementarity.jpg", "alt": "互补", "fig": "波与粒子互补。", "body": "在索尔维会议上提出互补原理，并开启与爱因斯坦关于量子力学的长期论战。"},
    {"year": 1930, "id": "debate", "title": "与爱因斯坦论战", "img": "einstein-bohr.jpg", "alt": "爱因斯坦与玻尔", "fig": "“上帝不掷骰子”。", "body": "在历次索尔维会议中，玻尔与爱因斯坦反复交锋，定义了现代物理的哲学边界。"},
    {"year": 1943, "id": "escape", "title": "逃离与曼哈顿", "img": "manhattan.jpg", "alt": "曼哈顿计划", "fig": "战时辗转赴美。", "body": "纳粹占领丹麦后，玻尔逃往瑞典、英国，后参与美国的原子弹研究。"},
    {"year": 1952, "id": "cern", "title": "推动 CERN", "img": "cern.jpg", "alt": "CERN", "fig": "呼吁科学开放合作。", "body": "战后他呼吁核研究的国际开放合作，是欧洲核子研究中心（CERN）的精神推手之一。"},
    {"year": 1962, "id": "died", "title": "辞世", "img": "bohr-portrait.jpg", "alt": "玻尔", "fig": "思想长留人间。", "body": "11 月 18 日，玻尔在哥本哈根逝世，留下原子模型、互补原理与一整个学派。"}
  ],

  "images": [
    {"file": "bohr-portrait.jpg", "wiki": "File:Niels Bohr.jpg", "q": "Niels Bohr portrait", "desc": "玻尔肖像", "author": "Public domain", "license": "Public domain"},
    {"file": "rutherford.jpg", "wiki": "File:Ernest Rutherford LOC.jpg", "q": "Ernest Rutherford portrait", "desc": "卢瑟福", "author": "Public domain", "license": "Public domain"},
    {"file": "bohr-model-diagram.jpg", "wiki": "File:Bohr Model.svg", "q": "Bohr model atom diagram", "desc": "玻尔模型图", "author": "Public domain", "license": "Public domain"},
    {"file": "hydrogen-spectrum.jpg", "wiki": "File:Hydrogen spectrum.svg", "q": "hydrogen emission spectrum", "desc": "氢光谱", "author": "Public domain", "license": "Public domain"},
    {"file": "copenhagen-institute.jpg", "wiki": "File:Bohr Institute Copenhagen.jpg", "q": "Niels Bohr Institute Copenhagen", "desc": "哥本哈根研究所", "author": "Public domain", "license": "Public domain"},
    {"file": "complementarity.jpg", "wiki": "File:Bohr Einstein debate.jpg", "q": "Bohr Einstein debate Solvay", "desc": "玻尔与爱因斯坦", "author": "Public domain", "license": "Public domain"},
    {"file": "einstein-bohr.jpg", "wiki": "File:Einstein and Bohr.jpg", "q": "Einstein and Bohr", "desc": "爱因斯坦与玻尔", "author": "Public domain", "license": "Public domain"},
    {"file": "manhattan.jpg", "wiki": "File:Manhattan Project logo.svg", "q": "Manhattan Project", "desc": "曼哈顿计划", "author": "Public domain", "license": "Public domain"},
    {"file": "cern.jpg", "wiki": "File:CERN Meyrin.jpg", "q": "CERN laboratory", "desc": "CERN", "author": "Public domain", "license": "Public domain"},
    {"file": "nobel.jpg", "wiki": "File:Nobel Prize.png", "q": "Nobel Prize medal", "desc": "诺贝尔奖", "author": "Public domain", "license": "Public domain"}
  ],

  "labs": [
    {"key": "shells", "kind": "atom", "icon": "⚛️", "title": "原子的“楼层”",
     "intro": "拖动“动画速度”，看电子在不同壳层上绕核运动——能级是离散的几层，不是任意的。",
     "desc": "电子像住在不同的楼层，跳层就会放出或吸收光。",
     "ctrl": [{"name": "speed", "label": "动画速度", "min": 0.2, "max": 3, "value": 1, "step": 0.1, "init": "1.0×"}],
     "params": {"shells": 4, "label": "电子在固定壳层上运动；能级跃迁放出光"}},
    {"key": "orbit", "kind": "orbit", "icon": "🪐", "title": "允许的轨道",
     "intro": "拖动“速度”，看电子绕核转——玻尔说它只能待在某些固定半径的“允许轨道”上。",
     "desc": "不是任意半径，而是被量子化“挑”出来的轨道。",
     "ctrl": [{"name": "speed", "label": "速度", "min": 0.2, "max": 3, "value": 1, "step": 0.1, "init": "1.0×"}],
     "params": {"center": "核", "centerColor": "#E8590C", "label": "电子只能在某些允许的轨道上（示意）", "bodies": [{"name": "e⁻", "r": 150, "period": 3, "color": "#3B5BDB"}]}},
    {"key": "lines", "kind": "graph", "icon": "🌈", "title": "谱线在哪里？",
     "intro": "拖动滑块，看“能级差”对应的谱线峰如何移动——这就是巴尔末系在图上的样子。",
     "desc": "峰的位置，就是一条谱线的位置。",
     "ctrl": [{"name": "param1", "label": "中心位置", "min": 0.3, "max": 1.8, "value": 1, "step": 0.1, "init": "1.0"}, {"name": "param2", "label": "峰宽", "min": 0.6, "max": 2, "value": 1, "step": 0.1, "init": "1.0"}],
     "params": {"expr": "gauss", "label": "用钟形峰标出一条谱线的位置（示意）"}}
  ]
}


if __name__ == "__main__":
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "spec_bohr.json")
    json.dump(SPEC, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print("wrote", out)

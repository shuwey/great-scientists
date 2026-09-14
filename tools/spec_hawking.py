# -*- coding: utf-8 -*-
"""霍金子站内容规格。运行后生成 spec_hawking.json。"""
import json, os

SPEC = {
  "id": "hawking",
  "name": "霍金",
  "en": "Stephen Hawking",
  "years": "1942–2018",
  "kicker": "黑洞与宇宙的讲述者 · 1942—2018",
  "lede": "他把黑洞、奇点和宇宙开端讲给全世界听，并提出“霍金辐射”——黑洞并非全黑，也会因量子效应缓慢蒸发。轮椅困住了他的身体，却没困住他的思想。",
  "meta": "读懂霍金：用中学生能听懂的话，讲清黑洞为什么会“黑”、霍金辐射是什么，以及他如何把宇宙学变成大众读物。",
  "biotitle": "他用思想丈量了黑洞与时间的边界",
  "bio": [
    "史蒂芬·霍金（1942—2018），英国理论物理学家。21 岁被诊断肌萎缩侧索硬化（ALS），医生预言他只剩数年，他却活到了 76 岁。",
    "他与彭罗斯用广义相对论证明了“奇点定理”，并提出“霍金辐射”，把量子力学与黑洞联系起来。",
    "他写《时间简史》把宇宙学讲给千万读者，是当代最具公众影响力的科学家之一。"
  ],
  "portrait": "hawking-portrait.jpg",
  "about_claim": "本页说明霍金子站内容的依据与延伸去处。",
  "about_body": "<h2>资料来源</h2><p>本子站内容依据公开科学史通识编写，核心事实（奇点定理、黑洞热力学、1974 霍金辐射、ALS、1988《时间简史》）与主流科学史一致。历史图片均来自 Wikimedia Commons 公有领域或自由授权资源。</p><h2>延伸阅读</h2><p>想深入：霍金《时间简史》《大设计》；彭罗斯《通往实在之路》。</p>",
  "tl_desc": "从牛津到黑洞：一个把宇宙讲给世界的人。",
  "tl_claim": "1942 年出生，2018 年辞世。他用思想抵达了连光都逃不出的地方。",
  "cats": ["物理", "宇宙", "历史", "科普"],
  "hero_scene": "blackhole",
  "hero_params": {"label": "黑洞弯曲时空，连光都逃不出"},

  "pages": {
    "singularity": {
      "title": "奇点：时间与空间的尽头",
      "file": "detail/singularity.html",
      "claim": "广义相对论预言：在黑洞中心、也在宇宙大爆炸之初，存在一处密度与曲率无限大的“奇点”。霍金与彭罗斯证明了这类奇点在很一般的条件下必然出现。",
      "tags": ["奇点", "大爆炸", "广义相对论"],
      "year": "1965",
      "card": "在那里，已知物理“算不出”了。",
      "scene": "blackhole",
      "scene_params": {"label": "时空向奇点收拢"},
      "remember": "一句话记住：奇点是“公式的悬崖”——越往里走，物理定律越说不出话。",
      "sideterms": ["singularity", "bigbang", "relativity", "gravity"],
      "sections": [
        {"id": "gr", "h": "一、广义相对论说了什么", "body": "爱因斯坦的广义相对论把引力解释为时空的弯曲。质量越大，时空被压得越深，连光线的路径都被掰弯。",
         "fig": "singularity", "figalt": "弯曲的时空", "figcap": "质量把时空压出“坑”。"},
        {"id": "singularity", "h": "二、奇点是什么", "body": "当物质被压到极致，时空曲率与密度趋于无限，这便是奇点。在奇点处，现有物理定律失效。",
         "figalt": "无限深的坑", "figcap": "坑底没有底。"},
        {"id": "theorem", "h": "三、奇点定理", "body": "霍金与彭罗斯证明：在满足很一般的条件下（如存在足够多的物质），时空必然出现奇点——这不依赖特殊假设。",
         "figalt": "必然出现的奇点", "figcap": "不是巧合，而是推论。"},
        {"id": "bang", "h": "四、宇宙的开端", "body": "把时间倒流，宇宙也指向一个奇点——大爆炸的起点。研究奇点，也是在研究“时间为何有开端”。",
         "figalt": "时间的起点", "figcap": "奇点，也是时间的头。"}
      ]
    },
    "blackhole": {
      "title": "黑洞：连光都逃不掉",
      "file": "detail/blackhole.html",
      "claim": "黑洞是引力强到连光都无法逃逸的天体。它的边界叫“事件视界”：一旦越过，就再也出不来。",
      "tags": ["黑洞", "事件视界", "逃逸"],
      "year": "约1916 / 1960s",
      "card": "不是黑窟窿，是逃不出的陷阱。",
      "scene": "blackhole",
      "scene_params": {"label": "光子在视界外绕行"},
      "remember": "一句话记住：黑洞的“黑”，是因为它的引力把光也按在了里面。",
      "sideterms": ["blackhole", "event-horizon", "spacetime-curvature", "gravity"],
      "sections": [
        {"id": "escape", "h": "一、逃逸速度超过光速", "body": "一个天体若足够致密，其表面的逃逸速度会超过光速，连光也逃不出去——这是理解黑洞的入门近似。严格说来，黑洞真正的边界是事件视界：那里的时空弯曲得连光都只能向内走（见下一节）。",
         "fig": "blackhole", "figalt": "逃不出的引力井", "figcap": "井太深，光也爬不出来。"},
        {"id": "horizon", "h": "二、事件视界", "body": "事件视界是黑洞的“不归点”：视界之内发出的任何信号都到不了外界。它划定了黑洞的边界。",
         "figalt": "不归的边界", "figcap": "跨过这条线，就回不去了。"},
        {"id": "tidal", "h": "三、潮汐撕扯", "body": "越靠近黑洞，引力差越大，会把物体像面条一样纵向拉长——天文学家戏称“意大利面化”。",
         "figalt": "被拉成面条", "figcap": "靠近，就被撕开。"},
        {"id": "real", "h": "四、真的存在", "body": "2019 年事件视界望远镜拍到 M87 星系中心黑洞的“阴影”，坐实了黑洞的真实存在。",
         "figalt": "真实的黑洞照片", "figcap": "理论照进了照片。"}
      ]
    },
    "radiation": {
      "title": "霍金辐射：黑洞也会蒸发",
      "file": "detail/radiation.html",
      "claim": "霍金把量子力学用于黑洞边缘，发现黑洞并非全黑：它会以极慢的速度“蒸发”并放出辐射。质量越小，蒸发越快、越热。",
      "tags": ["霍金辐射", "蒸发", "量子"],
      "year": "1974",
      "card": "黑洞也会“吐”东西出来。",
      "scene": "graph",
      "scene_params": {"label": "霍金辐射随质量变化的示意"},
      "remember": "一句话记住：黑洞不是只进不出——靠着量子效应，它也会一点点“漏”光、直至蒸发。",
      "sideterms": ["hawking-radiation", "evaporation", "thermodynamics", "blackhole"],
      "sections": [
        {"id": "virtual", "h": "一、虚粒子对", "body": "量子世界里，真空中不断冒出又湮灭的“虚粒子对”。在黑洞边缘，其中一个可能被吞掉，另一个逃逸——看起来就像黑洞在发光。",
         "fig": "radiation", "figalt": "虚粒子对", "figcap": "一对粒子，一个被吃，一个逃。"},
        {"id": "hawking", "h": "二、霍金辐射", "body": "霍金算出：逃逸的粒子带走能量，相当于黑洞在向外辐射。这就是“霍金辐射”，让黑洞有了温度。",
         "figalt": "黑洞的温度", "figcap": "黑洞也有“体温”。"},
        {"id": "evaporate", "h": "三、终会蒸发", "body": "辐射让黑洞缓慢失去质量；质量越小，温度越高、蒸发越快，最终可能以一阵爆发结束。",
         "figalt": "越漏越小", "figcap": "漏着漏着，就消失了。"},
        {"id": "paradox", "h": "四、信息去哪了？", "body": "黑洞蒸发后，落进去的信息是否还在？这引出“黑洞信息悖论”，至今仍是理论物理的前沿。",
         "figalt": "未解的悖论", "figcap": "答案，还在路上。"}
      ]
    },
    "cosmology": {
      "title": "把宇宙讲给所有人",
      "file": "detail/cosmology.html",
      "claim": "霍金用《时间简史》等著作把黑洞、奇点与宇宙学讲给千万读者，让高深的物理成为大众话题；他也推动了对“时间是否有开端”的思考。",
      "tags": ["宇宙学", "科普", "时间简史"],
      "year": "1988",
      "card": "高深物理，也能写成畅销书。",
      "scene": "blackhole",
      "scene_params": {"label": "宇宙学的公众面孔"},
      "remember": "一句话记住：他不仅研究宇宙，还把宇宙“翻译”给了每一个普通人。",
      "sideterms": ["cosmology", "brief-history", "popular-science", "universe"],
      "sections": [
        {"id": "time", "h": "一、《时间简史》", "body": "1988 年出版的《时间简史》用通俗语言讲宇宙起源与黑洞，成为全球畅销书，把宇宙学带出象牙塔。",
         "fig": "cosmology", "figalt": "畅销的宇宙书", "figcap": "一本讲宇宙的小书，卖出千万册。"},
        {"id": "questions", "h": "二、关于时间的问题", "body": "霍金追问“时间为何有开端”“宇宙为何如此”，把哲学与物理的古老问题重新摆上桌面。",
         "figalt": "时间之问", "figcap": "他问的，是人类最老的问题。"},
        {"id": "legacy", "h": "三、残障与成就", "body": "在 ALS 轮椅上，他靠思想完成了一流研究，也用公众影响力鼓励无数人——科学属于所有人。",
         "figalt": "思想的自由", "figcap": "身体受限，思想无界。"}
      ]
    }
  },

  "terms": {
    "singularity": {"name": "奇点", "cat": "物理", "short": "曲率无限大的点", "plain": "奇点是广义相对论中密度与时空曲率趋于无限的区域，已知物理定律在此失效。霍金与彭罗斯证明它在很一般的条件下必然出现。", "analogy": "像是公式的悬崖，再往前走定律就说不出话。", "page": "singularity", "anchor": "#singularity", "related": ["gravity", "relativity", "bigbang"]},
    "bigbang": {"name": "大爆炸", "cat": "宇宙", "short": "宇宙的起点", "plain": "大爆炸理论指宇宙从一个极热极密的状态膨胀而来；倒推回去，它指向一个奇点式的开端。", "analogy": "宇宙像一颗倒放的电影，开头是一点光。", "page": "singularity", "anchor": "#bang", "related": ["singularity", "universe", "cosmology"]},
    "relativity": {"name": "广义相对论", "cat": "物理", "short": "引力=时空弯曲", "plain": "广义相对论把引力解释为时空的弯曲：物质告诉时空如何弯，时空告诉物质如何走。它是理解黑洞与宇宙的基础。", "analogy": "时空像一张被重物压出坑的橡胶膜。", "page": "singularity", "anchor": "#gr", "related": ["gravity", "spacetime-curvature", "singularity"]},
    "gravity": {"name": "引力", "cat": "物理", "short": "把东西拉到一起的力", "plain": "引力是质量之间的相互吸引。在广义相对论中，它表现为时空的弯曲；引力越强，对光与时间的扭曲越明显。", "analogy": "宇宙里看不见的“往下拉”的手。", "page": "blackhole", "anchor": "#escape", "related": ["relativity", "spacetime-curvature", "blackhole"]},
    "spacetime-curvature": {"name": "时空曲率", "cat": "物理", "short": "时空被压出的“坑”", "plain": "时空曲率描述时空被物质和能量压弯的程度。黑洞附近曲率极大，连光线路径都被掰弯。", "analogy": "质量越大，橡胶膜上的坑越深。", "page": "blackhole", "anchor": "#escape", "related": ["gravity", "relativity", "blackhole"]},
    "blackhole": {"name": "黑洞", "cat": "物理", "short": "连光也逃不出的天体", "plain": "黑洞是引力强到连光都无法逃逸的天体，边界为事件视界。2019 年事件视界望远镜首次拍到其“阴影”。", "analogy": "宇宙里一口太深的井，光也爬不出来。", "page": "blackhole", "anchor": "#horizon", "related": ["event-horizon", "gravity", "hawking-radiation"]},
    "event-horizon": {"name": "事件视界", "cat": "物理", "short": "黑洞的“不归点”", "plain": "事件视界是黑洞的边界：一旦越过，任何信号（包括光）都到不了外界。它定义了黑洞的“大小”。", "analogy": "一条线，跨过去就再也回不来。", "page": "blackhole", "anchor": "#horizon", "related": ["blackhole", "gravity"]},
    "hawking-radiation": {"name": "霍金辐射", "cat": "物理", "short": "黑洞也会“漏光”", "plain": "霍金把量子效应用于黑洞边缘，发现黑洞会以极慢速度放出辐射（霍金辐射）并因此蒸发；质量越小越热、蒸发越快。", "analogy": "黑洞不是只进不出，也会一点点“漏”光。", "page": "radiation", "anchor": "#hawking", "related": ["blackhole", "evaporation", "thermodynamics"]},
    "evaporation": {"name": "蒸发", "cat": "物理", "short": "黑洞慢慢变小", "plain": "因霍金辐射带走能量，黑洞质量缓慢减少；质量越小温度越高、蒸发越快，最终可能以爆发结束。", "analogy": "漏着漏着，坑就填平了。", "page": "radiation", "anchor": "#evaporate", "related": ["hawking-radiation", "blackhole"]},
    "thermodynamics": {"name": "黑洞热力学", "cat": "物理", "short": "黑洞也讲冷热", "plain": "黑洞热力学把黑洞的面积、温度、熵联系起来，揭示黑洞与热力学定律的深刻对应，是统一引力量子理论的重要线索。", "analogy": "黑洞也有自己的“冷热账本”。", "page": "radiation", "anchor": "#paradox", "related": ["hawking-radiation", "blackhole"]},
    "universe": {"name": "宇宙", "cat": "宇宙", "short": "我们所在的全体时空", "plain": "宇宙是包含一切时空、物质与能量的总体。宇宙学研究的正是它的起源、结构与演化。", "analogy": "所有“这里”和“那时”的总和。", "page": "cosmology", "anchor": "#time", "related": ["bigbang", "cosmology", "singularity"]},
    "cosmology": {"name": "宇宙学", "cat": "宇宙", "short": "研究宇宙的整体", "plain": "宇宙学是研究宇宙起源、演化与结构的学科。霍金的工作把奇点、黑洞与宇宙开端连成一条线。", "analogy": "把整个宇宙当作一个“病例”来读。", "page": "cosmology", "anchor": "#questions", "related": ["universe", "bigbang", "brief-history"]},
    "brief-history": {"name": "《时间简史》", "cat": "科普", "short": "卖出千万册的宇宙书", "plain": "霍金 1988 年出版的《时间简史》用通俗语言讲宇宙与黑洞，成为全球畅销书，极大推动了科学普及。", "analogy": "一本小书，把宇宙讲给全世界听。", "page": "cosmology", "anchor": "#time", "related": ["popular-science", "cosmology", "hawking"]},
    "popular-science": {"name": "科学普及", "cat": "科普", "short": "把高深讲给大众", "plain": "科学普及是把专业研究用通俗方式传递给公众。霍金是科普的典范，让黑洞与宇宙成为大众话题。", "analogy": "把实验室的话，翻译成街头的话。", "page": "cosmology", "anchor": "#legacy", "related": ["brief-history", "hawking"]},
    "hawking": {"name": "霍金", "cat": "历史", "short": "黑洞与宇宙的讲述者", "plain": "史蒂芬·霍金是英国理论物理学家，提出奇点定理与霍金辐射，并以《时间简史》将宇宙学带入大众视野。", "analogy": "他研究最深的黑暗，却把光带给最多人。", "page": "singularity", "anchor": "#theorem", "related": ["blackhole", "hawking-radiation", "brief-history"]},
    "einstein": {"name": "爱因斯坦", "cat": "历史", "short": "相对论的提出者", "plain": "爱因斯坦创立广义相对论，预言了引力对时空的弯曲，为黑洞与宇宙学研究奠定基础。霍金的许多工作都建立在他的框架上。", "analogy": "他画好了时空的图纸，后人照着施工。", "page": "singularity", "anchor": "#gr", "related": ["relativity", "gravity", "hawking"]},
    "lucasian": {"name": "卢卡斯教授", "cat": "历史", "short": "牛顿也曾担任的讲席", "plain": "卢卡斯数学教授是剑桥大学的著名讲席，牛顿、狄拉克都曾任此职；霍金 1979 年出任，接下这一学术传统。", "analogy": "一把传了三百年的“物理交椅”。", "page": "cosmology", "anchor": "#questions", "related": ["hawking", "relativity"]}
  },

  "timeline": [
    {"year": 1942, "id": "born", "title": "生于牛津", "img": "hawking-portrait.jpg", "alt": "霍金", "fig": "史蒂芬·霍金 1942 年生于英国牛津。", "body": "1 月 8 日，霍金出生。这一天恰是伽利略逝世的 300 周年。"},
    {"year": 1959, "id": "oxford", "title": "牛津大学", "img": "oxford.jpg", "alt": "牛津", "fig": "在牛津读物理。", "body": "他进入牛津大学攻读物理，展现过人天赋。"},
    {"year": 1962, "id": "cambridge", "title": "剑桥深造", "img": "cambridge.jpg", "alt": "剑桥", "fig": "转向宇宙学。", "body": "他到剑桥大学研究宇宙学，师从丹尼斯·席艾玛。"},
    {"year": 1963, "id": "als", "title": "确诊 ALS", "img": "als.jpg", "alt": "霍金与轮椅", "fig": "身体被禁锢，思想起飞。", "body": "21 岁他被诊断肌萎缩侧索硬化（ALS），医生预言仅剩数年，他却活到了 76 岁。"},
    {"year": 1965, "id": "singularity", "title": "奇点定理", "img": "singularity.jpg", "alt": "奇点", "fig": "证明奇点必然出现。", "body": "1965 年彭罗斯证明引力坍缩必然产生奇点，霍金随即把这一套用到整个宇宙；1970 年，两人联合证明了著名的奇点定理。"},
    {"year": 1970, "id": "thermo", "title": "黑洞热力学", "img": "blackhole.jpg", "alt": "黑洞", "fig": "黑洞也有温度。", "body": "他提出黑洞面积不减等性质，开启黑洞热力学的研究方向。"},
    {"year": 1974, "id": "radiation", "title": "霍金辐射", "img": "radiation.jpg", "alt": "霍金辐射", "fig": "黑洞会蒸发。", "body": "他把量子效应用于黑洞，证明黑洞会放出辐射并缓慢蒸发——此即霍金辐射。"},
    {"year": 1979, "id": "lucasian", "title": "卢卡斯教授", "img": "cambridge.jpg", "alt": "剑桥讲席", "fig": "接过牛顿的椅子。", "body": "他出任剑桥卢卡斯数学教授，这一讲席曾由牛顿担任。"},
    {"year": 1988, "id": "brief", "title": "《时间简史》", "img": "brief-history.jpg", "alt": "时间简史", "fig": "把宇宙讲给世界。", "body": "《时间简史》出版，成为全球畅销书，把宇宙学带进大众视野。"},
    {"year": 2018, "id": "died", "title": "辞世", "img": "hawking-portrait.jpg", "alt": "霍金", "fig": "思想长留宇宙。", "body": "3 月 14 日，霍金逝世，享年 76 岁。他的思想仍在宇宙学中回响。"}
  ],

  "images": [
    {"file": "hawking-portrait.jpg", "wiki": "File:Stephen Hawking 1980s.jpg", "q": "Stephen Hawking portrait", "desc": "霍金肖像", "author": "Public domain", "license": "Public domain"},
    {"file": "oxford.jpg", "wiki": "File:Oxford skyline.jpg", "q": "University of Oxford", "desc": "牛津大学", "author": "Public domain", "license": "Public domain"},
    {"file": "cambridge.jpg", "wiki": "File:Cambridge University Library.jpg", "q": "University of Cambridge", "desc": "剑桥大学", "author": "Public domain", "license": "Public domain"},
    {"file": "als.jpg", "wiki": "File:Stephen Hawking in wheelchair.jpg", "q": "Stephen Hawking wheelchair", "desc": "霍金与轮椅", "author": "CC BY-SA", "license": "CC BY-SA"},
    {"file": "singularity.jpg", "wiki": "File:Artist's impression of a Black hole-Lupus.jpg", "q": "black hole artist impression", "desc": "黑洞艺术想象", "author": "Public domain", "license": "Public domain"},
    {"file": "blackhole.jpg", "wiki": "File:Black hole - Messier 87.jpg", "q": "M87 black hole", "desc": "M87 黑洞", "author": "CC BY", "license": "CC BY"},
    {"file": "radiation.jpg", "wiki": "File:Hawking radiation.svg", "q": "Hawking radiation diagram", "desc": "霍金辐射示意", "author": "Public domain", "license": "Public domain"},
    {"file": "brief-history.jpg", "wiki": "File:A Brief History of Time.jpg", "q": "A Brief History of Time book", "desc": "时间简史", "author": "Public domain", "license": "Public domain"},
    {"file": "cosmology.jpg", "wiki": "File:Observable universe.jpg", "q": "observable universe illustration", "desc": "可观测宇宙", "author": "CC BY-SA", "license": "CC BY-SA"}
  ],

  "labs": [
    {"key": "bh", "kind": "blackhole", "icon": "🕳️", "title": "走近黑洞",
     "intro": "拖动“质量”，看黑洞把时空压得越深、光子环越小——连光都逃不出视界。",
     "desc": "质量越大，坑越深。",
     "ctrl": [{"name": "mass", "label": "质量", "min": 0.5, "max": 3, "value": 1, "step": 0.1, "init": "1.0×"}],
     "params": {"label": "黑洞弯曲时空，光子在视界外绕行"}},
    {"key": "orbit", "kind": "orbit", "icon": "🪐", "title": "绕着黑洞转",
     "intro": "拖动“速度”，看一颗“光子”沿黑洞周围的轨道运行——轨道是弯曲时空里的路径。",
     "desc": "光也沿着弯曲的时空走。",
     "ctrl": [{"name": "speed", "label": "速度", "min": 0.2, "max": 3, "value": 1, "step": 0.1, "init": "1.0×"}],
     "params": {"center": "黑洞", "centerColor": "#000000", "label": "光子沿弯曲时空里的轨道绕行（示意）", "bodies": [{"name": "光", "r": 140, "period": 4, "color": "#FFE066"}]}},
    {"key": "temp", "kind": "graph", "icon": "🌡️", "title": "霍金辐射的温度",
     "intro": "拖动滑块，看“辐射强度”随黑洞参数如何变化——质量越小的黑洞反而越“热”、蒸发越快。",
     "desc": "小黑洞，更热更快蒸发。",
     "ctrl": [{"name": "param1", "label": "中心位置", "min": 0.3, "max": 1.8, "value": 1, "step": 0.1, "init": "1.0"}, {"name": "param2", "label": "峰宽", "min": 0.6, "max": 2, "value": 1, "step": 0.1, "init": "1.0"}],
     "params": {"expr": "gauss", "label": "用钟形峰示意霍金辐射（质量越小峰越高越热）"}}
  ]
}


if __name__ == "__main__":
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "spec_hawking.json")
    json.dump(SPEC, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print("wrote", out)

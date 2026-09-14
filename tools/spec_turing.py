# -*- coding: utf-8 -*-
"""图灵子站内容规格。运行后生成 spec_turing.json。"""
import json, os

SPEC = {
  "id": "turing",
  "name": "图灵",
  "en": "Alan Turing",
  "years": "1912–1954",
  "kicker": "计算机与人工智能之父 · 1912—1954",
  "lede": "他用一个假想的“纸带机器”定义了什么叫“可计算”，证明了有些问题机器永远算不出；二战中他破译德军密码拯救了无数生命，又率先追问“机器能思考吗”。",
  "meta": "读懂图灵：用中学生能听懂的话，讲清图灵机、可计算性、破译恩尼格玛，以及他如何点燃人工智能。",
  "biotitle": "他用“纸带与规则”定义了计算本身",
  "bio": [
    "阿兰·图灵（1912—1954），英国数学家。1936 年他提出“图灵机”，把“计算”这件事用数学严格地说清楚。",
    "二战期间，他在布莱切利园领导破译德军恩尼格玛密码，设计出改进型的“炸弹机”，大幅缩短了战争。",
    "战后他设计早期计算机，并提出“图灵测试”探讨机器智能；1954 年英年早逝，今天他被视为计算机科学与 AI 的先驱。"
  ],
  "portrait": "turing-portrait.jpg",
  "about_claim": "本页说明图灵子站内容的依据与延伸去处。",
  "about_body": "<h2>资料来源</h2><p>本子站内容依据公开科学史通识编写，核心事实（1936 图灵机、二战破译恩尼格玛与炸弹机、1950 图灵测试、形态发生研究）与主流科学史一致。历史图片均来自 Wikimedia Commons 公有领域资源。</p><h2>延伸阅读</h2><p>想深入：图灵《论可计算数》；《艾伦·图灵传》（安德鲁·霍奇斯）。</p>",
  "tl_desc": "从剑桥到布莱切利园：一个定义了“计算”的人。",
  "tl_claim": "1912 年出生，1954 年辞世。他让“机器能思考吗”成为人类追问了上百年的问题。",
  "cats": ["计算", "数学", "历史", "密码"],
  "hero_scene": "turing",
  "hero_params": {"label": "纸带上的读写头，正在改写世界"},

  "pages": {
    "turing-machine": {
      "title": "图灵机：计算的“最小模型”",
      "file": "detail/turing-machine.html",
      "claim": "图灵机是一台极简的假想机器：一条纸带、一个读写头、一套规则。图灵证明，任何“能算的东西”都能被这样的机器算出来——它定义了“可计算”的边界。",
      "tags": ["图灵机", "可计算", "模型"],
      "year": "1936",
      "card": "一条纸带，撑起了整个计算机世界。",
      "scene": "turing",
      "scene_params": {"label": "图灵机：读一格、写一格、移动"},
      "remember": "一句话记住：图灵机不是真机器，而是“计算”的身份证——能交给它做的，就叫可计算。",
      "sideterms": ["turing-machine", "tape", "computable", "universal", "algorithm"],
      "sections": [
        {"id": "model", "h": "一、一台极简机器", "body": "图灵机由一条无限长的纸带、一个能读写的头、一套“看到什么就做什么”的规则组成。它笨得可笑，却足够强大。",
         "fig": "turing-machine", "figalt": "图灵机示意", "figcap": "读写头在纸带上一步步移动。"},
        {"id": "tape", "h": "二、纸带就是内存", "body": "纸带上的格子存着 0 和 1，相当于今天的内存；头的移动与改写，就是“计算”的过程。",
         "figalt": "纸带即存储", "figcap": "一格一格，藏着全部信息。"},
        {"id": "universal", "h": "三、万能机", "body": "图灵进一步证明：存在“通用图灵机”，它能读取别的机器的规则、模拟别的机器——这正是今天“通用计算机”的理论原型。",
         "figalt": "通用机", "figcap": "一台机器，模拟所有机器。"},
        {"id": "meaning", "h": "四、为什么重要", "body": "在电子计算机诞生前，图灵就用纸笔说清了“计算”的本质，为整个计算机学科打下了地基。",
         "figalt": "理论地基", "figcap": "看不见的图纸，撑起看得见的电脑。"}
      ]
    },
    "computability": {
      "title": "可计算性：有些问题算不出",
      "file": "detail/computability.html",
      "claim": "图灵证明：并非所有问题都能被算法解决。最著名的是“停机问题”——无法写出一个通用程序，判断任意程序会不会永远跑下去。",
      "tags": ["可计算性", "停机问题", "不可判定"],
      "year": "1936",
      "card": "机器很强，但有它永远够不着的问题。",
      "scene": "graph",
      "scene_params": {"label": "可计算与不可计算的边界"},
      "remember": "一句话记住：停机问题像“我能不能预知自己会不会卡死”——答案是否定的，这是计算的硬极限。",
      "sideterms": ["computable", "halting", "decidability", "logic", "algorithm"],
      "sections": [
        {"id": "problem", "h": "一、什么是“能算”", "body": "若一个问题存在一套明确步骤（算法）总能给出答案，它就是“可计算”的。图灵机给出了这套定义。",
         "fig": "computability", "figalt": "算得出与算不出", "figcap": "一条线，分出两边。"},
        {"id": "diagonal", "h": "二、对角线论证", "body": "图灵用类似“对角线”的思路构造出一个反例：把所有程序列出来，再做出一个谁都不等的程序，从而证明不可能有“万能判定程序”。",
         "figalt": "对角构造", "figcap": "越想列全，越漏一个。"},
        {"id": "halting", "h": "三、停机问题", "body": "停机问题问：给定一段程序，它最终会停，还是会永远循环？图灵证明没有通用算法能回答这个问题。",
         "figalt": "停还是不停", "figcap": "有些问题，机器答不上来。"},
        {"id": "impact", "h": "四、极限也是财富", "body": "知道“哪些算不出”，反而帮我们避开徒劳、把精力放在可解之处。极限定义了计算的版图。",
         "figalt": "边界的意义", "figcap": "知道边界，才知往哪走。"}
      ]
    },
    "enigma": {
      "title": "破译恩尼格玛：密码的战争",
      "file": "detail/enigma.html",
      "claim": "二战中德军使用恩尼格玛密码机加密通信。图灵在布莱切利园设计“炸弹机”，用机电方式大规模搜索密钥，大幅加速了破译。",
      "tags": ["恩尼格玛", "炸弹机", "破译"],
      "year": "1939–1945",
      "card": "和密码机赛跑，赢的是速度。",
      "scene": "turing",
      "scene_params": {"label": "从密文里找回明文"},
      "remember": "一句话记住：图灵没造枪，却用机器“读”懂了敌人的心跳，让战争提前结束。",
      "sideterms": ["enigma", "bombe", "cryptography", "bletchley"],
      "sections": [
        {"id": "machine", "h": "一、会变的密码机", "body": "恩尼格玛每天更换接线与转子，可能的密钥多到天文数字。传统人力破译几乎不可能。",
         "fig": "enigma", "figalt": "恩尼格玛密码机", "figcap": "转子一转，密码全变。"},
        {"id": "bombe", "h": "二、炸弹机", "body": "图灵设计的“炸弹机”用电动机电逻辑瞬间尝试成千上万种组合，自动筛掉不可能的密钥，极大缩短破译时间。",
         "figalt": "炸弹机", "figcap": "用速度，碾过天文数字的组合。"},
        {"id": "effect", "h": "三、改变了战争", "body": "盟军由此读到德军动向，史家估计破译工作让二战提前结束、挽救了无数生命。图灵的工作是其中的核心。",
         "figalt": "情报的杠杆", "figcap": "读懂敌人，就握住了胜负的开关。"}
      ]
    },
    "ai-test": {
      "title": "机器能思考吗？图灵测试",
      "file": "detail/ai-test.html",
      "claim": "1950 年图灵提出：与其争辩“机器会不会思考”，不如问“人能否在文字对话中分辨对方是机器还是人”。这开创了人工智能的方向。",
      "tags": ["图灵测试", "人工智能", "模仿游戏"],
      "year": "1950",
      "card": "能骗过人的机器，算不算“会想”？",
      "scene": "turing",
      "scene_params": {"label": "模仿游戏：你分得清吗"},
      "remember": "一句话记住：图灵把“机器能否思考”换成一个可操作的问题——这问题今天仍驱动着 AI。",
      "sideterms": ["turing-test", "imitation-game", "ai", "morphogenesis"],
      "sections": [
        {"id": "question", "h": "一、换个问法", "body": "“机器会思考吗？”太模糊。图灵把它变成：在只靠文字对话时，人能否判断对面是机器？",
         "fig": "ai-test", "figalt": "模仿游戏", "figcap": "看不见对方，只凭对话判断。"},
        {"id": "imitation", "h": "二、模仿游戏", "body": "这就是“模仿游戏”（后称图灵测试）：机器若能在对话中让人误以为它是人，便算通过了某种“智能”门槛。",
         "figalt": "误认成人", "figcap": "以假乱真，也是一种能力。"},
        {"id": "legacy", "h": "三、遗产与追问", "body": "图灵还研究形态发生（生物图案如何形成），并留下对智能本质的追问——今天的大模型仍在回应他。",
         "figalt": "未竟之问", "figcap": "他种下的问题，仍在生长。"}
      ]
    }
  },

  "terms": {
    "turing-machine": {"name": "图灵机", "cat": "计算", "short": "计算的极简模型", "plain": "图灵机是一台假想机器：一条纸带、一个读写头、一套规则。图灵用它严格定义了“可计算”的含义，是计算机理论的基石。", "analogy": "像一台只会“读一格、写一格、挪一步”的极简游戏机，却能玩出整个计算世界。", "page": "turing-machine", "anchor": "#model", "related": ["tape", "computable", "universal", "algorithm"]},
    "tape": {"name": "纸带", "cat": "计算", "short": "图灵机的内存", "plain": "纸带是图灵机上的存储带，分成许多格子，每个格子写 0 或 1。读写头在带上移动、改写，相当于今天的内存。", "analogy": "纸带就是这台机器的“笔记本”，一格一格记着信息。", "page": "turing-machine", "anchor": "#tape", "related": ["turing-machine", "universal"]},
    "computable": {"name": "可计算", "cat": "计算", "short": "有算法能算出来", "plain": "若一个问题存在一套明确步骤（算法）总能给出答案，它就是可计算的。图灵机给出了“可计算”的精确定义。", "analogy": "能写进说明书、照做就出答案的，就是可计算的。", "page": "computability", "anchor": "#problem", "related": ["algorithm", "turing-machine", "halting"]},
    "universal": {"name": "通用图灵机", "cat": "计算", "short": "能模拟一切的机器", "plain": "通用图灵机可以读取别的机器的规则并模拟它运行，相当于“能运行任意程序的计算机”的理论原型。", "analogy": "一台机器能扮演所有机器——今天的电脑正是它的后代。", "page": "turing-machine", "anchor": "#universal", "related": ["turing-machine", "computable"]},
    "algorithm": {"name": "算法", "cat": "计算", "short": "明确的步骤清单", "plain": "算法是求解问题的明确、有限步骤。图灵机把“算法”形式化，使“步骤”可被严格讨论。", "analogy": "菜谱：照着一步步做，就出一道菜。", "page": "computability", "anchor": "#problem", "related": ["computable", "turing-machine"]},
    "halting": {"name": "停机问题", "cat": "数学", "short": "没法预判会不会卡死", "plain": "停机问题问：任意一段程序最终会停止，还是会永远循环？图灵证明不存在通用算法能回答它——这是计算的硬极限。", "analogy": "想预知自己会不会卡死，答案偏偏是“不能”。", "page": "computability", "anchor": "#halting", "related": ["computable", "decidability", "logic"]},
    "decidability": {"name": "可判定性", "cat": "数学", "short": "有没有通用判官", "plain": "一个问题若存在一个算法总能给出“是/否”答案，就是可判定的。停机问题属于“不可判定”的典型。", "analogy": "有没有一位永远公正的判官，对每件事都给结论？有些事没有。", "page": "computability", "anchor": "#diagonal", "related": ["halting", "computable", "logic"]},
    "logic": {"name": "逻辑", "cat": "数学", "short": "推理的规则", "plain": "逻辑研究正确推理的形式规则。图灵的工作建立在数理逻辑之上，把“推理”与“计算”联系起来。", "analogy": "给思维立规矩，让对错有章可循。", "page": "computability", "anchor": "#diagonal", "related": ["decidability", "computable"]},
    "enigma": {"name": "恩尼格玛", "cat": "密码", "short": "德军的密码机", "plain": "恩尼格玛是二战德军使用的转子密码机，每天更换设置使密钥极多，传统手段难以破译。", "analogy": "一把每天自己换锁芯的锁，钥匙有天文数字种。", "page": "enigma", "anchor": "#machine", "related": ["bombe", "cryptography", "bletchley"]},
    "bombe": {"name": "炸弹机", "cat": "密码", "short": "破译恩尼格玛的机电装置", "plain": "炸弹机是图灵团队设计的机电装置，通过快速尝试与剔除不可能的密钥组合，大规模加速恩尼格玛的破译。", "analogy": "一台不知疲倦的“试钥匙”机器，用速度碾压组合爆炸。", "page": "enigma", "anchor": "#bombe", "related": ["enigma", "cryptography", "bletchley"]},
    "cryptography": {"name": "密码学", "cat": "密码", "short": "让信息只有对的人能读", "plain": "密码学研究如何把信息加密，使敌人看不懂、盟友能还原。图灵的破译工作处于密码学的对抗最前线。", "analogy": "把信锁进只有朋友有钥匙的盒子。", "page": "enigma", "anchor": "#machine", "related": ["enigma", "bombe"]},
    "bletchley": {"name": "布莱切利园", "cat": "历史", "short": "二战破译中心", "plain": "布莱切利园是二战中英国破译敌方密码的中心，图灵在此领导恩尼格玛破译，聚集了众多顶尖头脑。", "analogy": "一间改写了战争走向的“密室”。", "page": "enigma", "anchor": "#effect", "related": ["enigma", "bombe", "turing"]},
    "turing-test": {"name": "图灵测试", "cat": "计算", "short": "机器像人吗？", "plain": "图灵测试（模仿游戏）通过一个文字对话实验判断机器是否表现得像人。它是人工智能领域最具影响力的思想实验之一。", "analogy": "隔着屏幕聊，你分不清对面是人还是机器——那它就算“够像”。", "page": "ai-test", "anchor": "#question", "related": ["imitation-game", "ai", "turing-machine"]},
    "imitation-game": {"name": "模仿游戏", "cat": "计算", "short": "图灵测试的原名", "plain": "模仿游戏是图灵对“机器能否思考”的改写：让人在纯文字对话中辨别对方是人还是机器。", "analogy": "一场只看文字的“猜身份”游戏。", "page": "ai-test", "anchor": "#imitation", "related": ["turing-test", "ai"]},
    "ai": {"name": "人工智能", "cat": "计算", "short": "让机器像人一样学", "plain": "人工智能研究如何让机器完成通常需要人类智能的任务。图灵在 1950 年提出的追问，是这一领域的起点。", "analogy": "教机器“懂事”，从图灵的一问开始。", "page": "ai-test", "anchor": "#legacy", "related": ["turing-test", "imitation-game", "morphogenesis"]},
    "morphogenesis": {"name": "形态发生", "cat": "数学", "short": "图案怎么长出来的", "plain": "形态发生研究生物体中图案（如斑点、条纹）如何从无到有地形成。图灵提出反应—扩散模型，用简单数学规则解释复杂图案。", "analogy": "均匀的一锅汤，也能“煮”出豹纹。", "page": "ai-test", "anchor": "#legacy", "related": ["ai", "logic"]},
    "turing": {"name": "图灵", "cat": "历史", "short": "计算机与 AI 先驱", "plain": "阿兰·图灵是计算机科学与人工智能的理论先驱，提出图灵机、证明停机问题、破译恩尼格玛、开创图灵测试。", "analogy": "他给“计算”发了身份证，又给“智能”出了考题。", "page": "turing-machine", "anchor": "#meaning", "related": ["turing-machine", "halting", "enigma", "turing-test"]}
  },

  "timeline": [
    {"year": 1912, "id": "born", "title": "生于伦敦", "img": "turing-portrait.jpg", "alt": "图灵", "fig": "阿兰·图灵 1912 年生于英国伦敦。", "body": "6 月 23 日，图灵出生。他后来成为计算机科学与人工智能的理论奠基人。"},
    {"year": 1931, "id": "cambridge", "title": "剑桥求学", "img": "cambridge.jpg", "alt": "剑桥", "fig": "在剑桥接触数学与逻辑。", "body": "他进入剑桥大学国王学院，研习数学与数理逻辑，打下理论根基。"},
    {"year": 1936, "id": "machine", "title": "图灵机论文", "img": "turing-machine.jpg", "alt": "图灵机", "fig": "用纸带定义了“可计算”。", "body": "发表《论可计算数》，提出图灵机，并证明停机问题不可判定。"},
    {"year": 1938, "id": "princeton", "title": "普林斯顿博士", "img": "princeton.jpg", "alt": "普林斯顿", "fig": "跨洋深造。", "body": "他在普林斯顿获博士学位，进一步锤炼了逻辑与计算的理论。"},
    {"year": 1939, "id": "bletchley", "title": "投身破译", "img": "bletchley.jpg", "alt": "布莱切利园", "fig": "战争中的密室。", "body": "二战爆发，他进入布莱切利园，领导德军恩尼格玛密码的破译。"},
    {"year": 1940, "id": "bombe", "title": "炸弹机", "img": "bombe.jpg", "alt": "炸弹机", "fig": "用机器破机器。", "body": "他设计的炸弹机大规模加速密钥搜索，成为破译的关键装备。"},
    {"year": 1945, "id": "ace", "title": "设计 ACE", "img": "ace.jpg", "alt": "ACE 计算机", "fig": "从理论走向真机。", "body": "战后他参与设计早期的存储程序计算机 ACE，把理论变成实机。"},
    {"year": 1950, "id": "test", "title": "图灵测试", "img": "turing-test.jpg", "alt": "图灵测试", "fig": "机器能思考吗？", "body": "他发表论文提出“模仿游戏”，开创人工智能的思想实验。"},
    {"year": 1952, "id": "morpho", "title": "形态发生研究", "img": "morphogenesis.jpg", "alt": "形态发生", "fig": "用数学解释图案。", "body": "他发表反应—扩散模型，用数学解释生物体上的斑纹与条纹。"},
    {"year": 1954, "id": "died", "title": "英年辞世", "img": "turing-portrait.jpg", "alt": "图灵", "fig": "思想长存。", "body": "6 月 7 日，图灵去世，享年 41 岁。后世尊他为计算机与 AI 之父。"}
  ],

  "images": [
    {"file": "turing-portrait.jpg", "wiki": "File:Alan Turing Aged 16.jpg", "q": "Alan Turing portrait", "desc": "图灵肖像", "author": "Public domain", "license": "Public domain"},
    {"file": "cambridge.jpg", "wiki": "File:Kings College Cambridge front of chapel.jpg", "q": "King's College Cambridge", "desc": "剑桥国王学院", "author": "Public domain", "license": "Public domain"},
    {"file": "turing-machine.jpg", "wiki": "File:Turing machine 2b.svg", "q": "Turing machine diagram", "desc": "图灵机示意图", "author": "Public domain", "license": "Public domain"},
    {"file": "princeton.jpg", "wiki": "File:Princeton University trustees 1904.png", "q": "Princeton University", "desc": "普林斯顿", "author": "Public domain", "license": "Public domain"},
    {"file": "bletchley.jpg", "wiki": "File:Bletchley Park.jpg", "q": "Bletchley Park", "desc": "布莱切利园", "author": "Public domain", "license": "Public domain"},
    {"file": "bombe.jpg", "wiki": "File:Bombe at Bletchley Park.jpg", "q": "Bombe Bletchley Park", "desc": "炸弹机", "author": "Public domain", "license": "Public domain"},
    {"file": "enigma.jpg", "wiki": "File:Enigma machine 1.jpg", "q": "Enigma machine", "desc": "恩尼格玛密码机", "author": "Public domain", "license": "Public domain"},
    {"file": "ace.jpg", "wiki": "File:Pilot ACE computer.jpg", "q": "Pilot ACE computer", "desc": "ACE 计算机", "author": "Public domain", "license": "Public domain"},
    {"file": "turing-test.jpg", "wiki": "File:Alan Turing white house.jpg", "q": "Alan Turing artificial intelligence", "desc": "图灵测试", "author": "Public domain", "license": "Public domain"},
    {"file": "morphogenesis.jpg", "wiki": "File:Gray-Scott reaction-diffusion.png", "q": "reaction diffusion morphogenesis pattern", "desc": "形态发生图案", "author": "CC BY-SA", "license": "CC BY-SA"}
  ],

  "labs": [
    {"key": "turing", "kind": "turing", "icon": "📜", "title": "亲手跑一台图灵机",
     "intro": "拖动“速度”，看读写头在纸带上一步步读、写、移动——再简单的规则，也能完成计算。",
     "desc": "看状态与步数如何随规则滚动。",
     "ctrl": [{"name": "speed", "label": "速度", "min": 0.2, "max": 3, "value": 1, "step": 0.1, "init": "1.0×"}],
     "params": {"label": "图灵机：读一格、写一格、左右移动"}},
    {"key": "tree", "kind": "branching", "icon": "🌿", "title": "一条规则，万千可能",
     "intro": "拖动“深度”，看从一个起点如何一分为二、再分——复杂图案，往往来自极简规则的反复。",
     "desc": "分叉越多，末梢越多。",
     "ctrl": [{"name": "depth", "label": "深度", "min": 1, "max": 7, "value": 4, "step": 1, "init": "4"}],
     "params": {"label": "从简单规则长出复杂结构（形态发生示意）"}},
    {"key": "signal", "kind": "graph", "icon": "📈", "title": "可计算的“波形”",
     "intro": "拖动滑块，看一条由规则生成的波形如何随参数改变——算法输出的结果，常是这样的曲线。",
     "desc": "参数一动，曲线就变。",
     "ctrl": [{"name": "param1", "label": "幅度", "min": 0.3, "max": 1.8, "value": 1, "step": 0.1, "init": "1.0"}, {"name": "param2", "label": "频率", "min": 0.6, "max": 2, "value": 1, "step": 0.1, "init": "1.0"}],
     "params": {"label": "用曲线示意“算法输出”（示意）"}}
  ]
}


if __name__ == "__main__":
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "spec_turing.json")
    json.dump(SPEC, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print("wrote", out)

/* 《读懂图灵》术语数据库（引擎通用：SITE_TERMS/SITE_PAGES/SITE_CATS） */
window.SITE_TERMS = {
  "turing-machine": {
    name: "图灵机",
    cat: "计算",
    short: "计算的极简模型",
    plain: "图灵机是一台假想机器：一条纸带、一个读写头、一套规则。图灵用它严格定义了“可计算”的含义，是计算机理论的基石。",
    analogy: "像一台只会“读一格、写一格、挪一步”的极简游戏机，却能玩出整个计算世界。",
    page: "turing-machine", anchor: "#model",
    related: ["tape", "computable", "universal", "algorithm"]
  },
  "tape": {
    name: "纸带",
    cat: "计算",
    short: "图灵机的内存",
    plain: "纸带是图灵机上的存储带，分成许多格子，每个格子写 0 或 1。读写头在带上移动、改写，相当于今天的内存。",
    analogy: "纸带就是这台机器的“笔记本”，一格一格记着信息。",
    page: "turing-machine", anchor: "#tape",
    related: ["turing-machine", "universal"]
  },
  "computable": {
    name: "可计算",
    cat: "计算",
    short: "有算法能算出来",
    plain: "若一个问题存在一套明确步骤（算法）总能给出答案，它就是可计算的。图灵机给出了“可计算”的精确定义。",
    analogy: "能写进说明书、照做就出答案的，就是可计算的。",
    page: "computability", anchor: "#problem",
    related: ["algorithm", "turing-machine", "halting"]
  },
  "universal": {
    name: "通用图灵机",
    cat: "计算",
    short: "能模拟一切的机器",
    plain: "通用图灵机可以读取别的机器的规则并模拟它运行，相当于“能运行任意程序的计算机”的理论原型。",
    analogy: "一台机器能扮演所有机器——今天的电脑正是它的后代。",
    page: "turing-machine", anchor: "#universal",
    related: ["turing-machine", "computable"]
  },
  "algorithm": {
    name: "算法",
    cat: "计算",
    short: "明确的步骤清单",
    plain: "算法是求解问题的明确、有限步骤。图灵机把“算法”形式化，使“步骤”可被严格讨论。",
    analogy: "菜谱：照着一步步做，就出一道菜。",
    page: "computability", anchor: "#problem",
    related: ["computable", "turing-machine"]
  },
  "halting": {
    name: "停机问题",
    cat: "数学",
    short: "没法预判会不会卡死",
    plain: "停机问题问：任意一段程序最终会停止，还是会永远循环？图灵证明不存在通用算法能回答它——这是计算的硬极限。",
    analogy: "想预知自己会不会卡死，答案偏偏是“不能”。",
    page: "computability", anchor: "#halting",
    related: ["computable", "decidability", "logic"]
  },
  "decidability": {
    name: "可判定性",
    cat: "数学",
    short: "有没有通用判官",
    plain: "一个问题若存在一个算法总能给出“是/否”答案，就是可判定的。停机问题属于“不可判定”的典型。",
    analogy: "有没有一位永远公正的判官，对每件事都给结论？有些事没有。",
    page: "computability", anchor: "#diagonal",
    related: ["halting", "computable", "logic"]
  },
  "logic": {
    name: "逻辑",
    cat: "数学",
    short: "推理的规则",
    plain: "逻辑研究正确推理的形式规则。图灵的工作建立在数理逻辑之上，把“推理”与“计算”联系起来。",
    analogy: "给思维立规矩，让对错有章可循。",
    page: "computability", anchor: "#diagonal",
    related: ["decidability", "computable"]
  },
  "enigma": {
    name: "恩尼格玛",
    cat: "密码",
    short: "德军的密码机",
    plain: "恩尼格玛是二战德军使用的转子密码机，每天更换设置使密钥极多，传统手段难以破译。",
    analogy: "一把每天自己换锁芯的锁，钥匙有天文数字种。",
    page: "enigma", anchor: "#machine",
    related: ["bombe", "cryptography", "bletchley"]
  },
  "bombe": {
    name: "炸弹机",
    cat: "密码",
    short: "破译恩尼格玛的机电装置",
    plain: "炸弹机是图灵团队在波兰 Bomba 基础上改进的机电装置，通过快速尝试与剔除不可能的密钥组合，大规模加速恩尼格玛的破译。",
    analogy: "一台不知疲倦的“试钥匙”机器，用速度碾压组合爆炸。",
    page: "enigma", anchor: "#bombe",
    related: ["enigma", "cryptography", "bletchley"]
  },
  "cryptography": {
    name: "密码学",
    cat: "密码",
    short: "让信息只有对的人能读",
    plain: "密码学研究如何把信息加密，使敌人看不懂、盟友能还原。图灵的破译工作处于密码学的对抗最前线。",
    analogy: "把信锁进只有朋友有钥匙的盒子。",
    page: "enigma", anchor: "#machine",
    related: ["enigma", "bombe"]
  },
  "bletchley": {
    name: "布莱切利园",
    cat: "历史",
    short: "二战破译中心",
    plain: "布莱切利园是二战中英国破译敌方密码的中心，图灵在此领导恩尼格玛破译，聚集了众多顶尖头脑。",
    analogy: "一间改写了战争走向的“密室”。",
    page: "enigma", anchor: "#effect",
    related: ["enigma", "bombe", "turing"]
  },
  "turing-test": {
    name: "图灵测试",
    cat: "计算",
    short: "机器像人吗？",
    plain: "图灵测试（模仿游戏）通过一个文字对话实验判断机器是否表现得像人。它是人工智能领域最具影响力的思想实验之一。",
    analogy: "隔着屏幕聊，你分不清对面是人还是机器——那它就算“够像”。",
    page: "ai-test", anchor: "#question",
    related: ["imitation-game", "ai", "turing-machine"]
  },
  "imitation-game": {
    name: "模仿游戏",
    cat: "计算",
    short: "图灵测试的原名",
    plain: "模仿游戏是图灵对“机器能否思考”的改写：让人在纯文字对话中辨别对方是人还是机器。",
    analogy: "一场只看文字的“猜身份”游戏。",
    page: "ai-test", anchor: "#imitation",
    related: ["turing-test", "ai"]
  },
  "ai": {
    name: "人工智能",
    cat: "计算",
    short: "让机器像人一样学",
    plain: "人工智能研究如何让机器完成通常需要人类智能的任务。图灵在 1950 年提出的追问，是这一领域的起点。",
    analogy: "教机器“懂事”，从图灵的一问开始。",
    page: "ai-test", anchor: "#legacy",
    related: ["turing-test", "imitation-game", "morphogenesis"]
  },
  "morphogenesis": {
    name: "形态发生",
    cat: "数学",
    short: "图案怎么长出来的",
    plain: "形态发生研究生物体中图案（如斑点、条纹）如何从无到有地形成。图灵提出反应—扩散模型，用简单数学规则解释复杂图案。",
    analogy: "均匀的一锅汤，也能“煮”出豹纹。",
    page: "ai-test", anchor: "#legacy",
    related: ["ai", "logic"]
  },
  "turing": {
    name: "图灵",
    cat: "历史",
    short: "计算机与 AI 先驱",
    plain: "阿兰·图灵是计算机科学与人工智能的理论先驱，提出图灵机、证明停机问题、破译恩尼格玛、开创图灵测试。",
    analogy: "他给“计算”发了身份证，又给“智能”出了考题。",
    page: "turing-machine", anchor: "#meaning",
    related: ["turing-machine", "halting", "enigma", "turing-test"]
  }
};

window.SITE_PAGES = {
  "turing-machine": { title: "图灵机：计算的“最小模型”", url: "detail/turing-machine.html" },
  "computability": { title: "可计算性：有些问题算不出", url: "detail/computability.html" },
  "enigma": { title: "破译恩尼格玛：密码的战争", url: "detail/enigma.html" },
  "ai-test": { title: "机器能思考吗？图灵测试", url: "detail/ai-test.html" }
};

window.SITE_CATS = ["计算", "数学", "历史", "密码"];
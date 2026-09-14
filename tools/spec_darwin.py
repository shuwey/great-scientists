# -*- coding: utf-8 -*-
"""达尔文子站内容规格。运行后生成 spec_darwin.json。"""
import json, os

SPEC = {
  "id": "darwin",
  "name": "达尔文",
  "en": "Charles Darwin",
  "years": "1809–1882",
  "kicker": "进化论之父 · 1809—1882",
  "lede": "他乘小猎犬号绕地球一圈，带回一堆雀鸟的喙。一个朴素的观察，最终长成了撼动人类自我认知的进化论。",
  "meta": "读懂达尔文：用中学生能听懂的话，讲清自然选择如何把“物种不变”的旧世界翻了篇。",
  "biotitle": "他不是最先想到进化的人，却给出了机制",
  "bio": [
    "查尔斯·达尔文（1809—1882），英国人。他学医不成、神学不精，却对自然万物有近乎痴迷的好奇。",
    "1831 年，他搭上“小猎犬号”开始五年环球航行，在加拉帕戈斯群岛注意到：明明是近亲的雀鸟，喙却因岛屿不同而大不相同。",
    "他花了二十多年反复推演，才在 1859 年出版《物种起源》——不是宣布“进化发生了”，而是说清了“进化怎么发生”：自然选择。"
  ],
  "portrait": "darwin-portrait.jpg",
  "about_claim": "本页说明达尔文子站内容的依据与延伸去处。",
  "about_body": "<h2>资料来源</h2><p>本子站内容依据公开史料与科学史通识编写，核心事实（生卒、小猎犬号航行、《物种起源》、自然选择）与主流科学史一致。历史图片均来自 Wikimedia Commons 公有领域资源。</p><h2>延伸阅读</h2><p>想深入：达尔文《物种起源》（On the Origin of Species）中译或节选；以及《小猎犬号航海记》（HMS Beagle 航行记，又译《贝格尔号航海记》）。</p>",
  "tl_desc": "从什鲁斯伯里的少年到威斯敏斯特教堂的墓：达尔文一生的关键节点。",
  "tl_claim": "1809 年出生，1882 年逝于唐恩。五年航行、二十年沉淀，换来一本改变人类自我认知的书。",
  "cats": ["生物", "演化", "方法", "历史"],
  "hero_scene": "tree",
  "hero_params": {"label": "从共同祖先分叉而出的生命之树"},

  "pages": {
    "evolution": {
      "title": "进化论：物种也会变",
      "file": "detail/evolution.html",
      "claim": "达尔文最核心的一句：物种不是一成不变的，而是随时间逐渐演变、彼此分化的。",
      "tags": ["进化", "物种起源", "生物"],
      "year": "1859",
      "card": "生物不是被分别创造的固定种类，而是在漫长岁月里慢慢变化、彼此相连。",
      "scene": "tree",
      "scene_params": {"label": "生命之树：共同祖先分出多样物种"},
      "remember": "一句话记住：进化论不是“猴子变人”，而是“所有生物共享一位远古祖先”。",
      "sideterms": ["evolution", "species", "common-ancestor", "hms-beagle", "origin-of-species", "darwin"],
      "sections": [
        {"id": "before", "h": "一、出发之前", "body": "达尔文年轻时学医、后读神学，都不算出色。真正的转折是 1831 年登上“小猎犬号”——一场五年的环球航行，让他见识了地球各处截然不同的生命。",
         "fig": "evolution", "figalt": "小猎犬号航行", "figcap": "五年航行，把世界的生物多样性第一次铺展在他眼前。"},
        {"id": "idea", "h": "二、核心想法", "body": "达尔文提出：物种会随时间改变，现存的种类是从更早的种类演变而来，彼此追溯下去，终会汇向共同祖先。这从根本上动摇了“物种由神分别创造、永不变动”的旧观念。",
         "figalt": "物种演变", "figcap": "一个个固定的“种类”，被_CONNECT成一条流动的河流。"},
        {"id": "evidence", "h": "三、证据从哪来", "body": "他搜集了化石、地理分布、胚胎发育、同源器官等多路证据，说明生物之间存在着亲缘关系。赖尔的统一地质观也让他相信：缓慢的、累积的变化，足以造就巨大的差异。",
         "figalt": "多重证据", "figcap": "化石、分布、胚胎——多条线索指向同一棵“生命之树”。"},
        {"id": "impact", "h": "四、为什么是革命", "body": "进化论的冲击不只在于生物学。它把人类从“被特别创造的顶点”拉回到动物界的一员，迫使我们重新思考自己在自然中的位置。",
         "figalt": "认知的革命", "figcap": "不是世界变了，是我们对自己的定位变了。"}
      ]
    },
    "selection": {
      "title": "自然选择：进化的发动机",
      "file": "detail/selection.html",
      "claim": "达尔文给出的机制只有一句话：能更好适应环境的个体留下更多后代，有利特征便被一点点积累。",
      "tags": ["自然选择", "适应", "遗传"],
      "year": "1859",
      "card": "变异 + 生存竞争 + 遗传 = 一代代积累出的适应。",
      "scene": "wave",
      "scene_params": {"label": "选择压力改变种群特征"},
      "remember": "一句话记住：自然选择不是“强者生存”，而是“更合适的留下更多后代”。",
      "sideterms": ["natural-selection", "variation", "competition", "fitness", "inheritance", "malthus", "survival-of-fittest"],
      "sections": [
        {"id": "variation", "h": "一、个体都有差异", "body": "同一窝后代也不尽相同：有的高一点、有的喙硬一点。这些差异部分可遗传。人工选育（如驯养鸽子、庄稼）早已证明：选某些特征繁殖，几代就能放大它。",
         "fig": "selection", "figalt": "个体差异与人工选择", "figcap": "人工选择能放大特征，自然选择也是同一个原理。"},
        {"id": "struggle", "h": "二、生存竞争", "body": "后代往往多于能活下来的数量，资源有限，于是存在竞争。马尔萨斯的《人口论》点醒了达尔文：在“过多”与“有限”之间，必然有人被淘汰。",
         "figalt": "资源有限下的竞争", "figcap": "生的多、活的少，差异决定谁能留下。"},
        {"id": "inheritance", "h": "三、有利特征被遗传", "body": "若某个差异恰好有助于生存繁殖，带它的个体就更可能留下后代，特征便在下一代中变多。一代代积累，种群整体就被“塑形”。",
         "figalt": "有利特征被传递", "figcap": "不是个体主动变好，而是“刚好合适的”留了下来。"},
        {"id": "result", "h": "四、结果与误解", "body": "长期下来，种群逐渐适应环境，新类型由此产生。注意：这不是“强者生存”，也不是生物“想”变成某种样子，而是环境替差异做了筛选。",
         "figalt": "适应的形成", "figcap": "“适者生存”更准确地说是“更合适的留下更多后代”。"}
      ]
    },
    "finches": {
      "title": "加拉帕戈斯雀：一枚钥匙",
      "file": "detail/finches.html",
      "claim": "群岛上那些近亲雀鸟，喙形因岛屿食物不同而各异——成了“同一祖先、各自适应”的最直观证据。",
      "tags": ["加拉帕戈斯", "雀鸟", "适应"],
      "year": "1835",
      "card": "喙的形状，是环境写在小鸟脸上的简历。",
      "scene": "tree",
      "scene_params": {"label": "同一祖先在孤岛分化"},
      "remember": "一句话记住：达尔文雀不是一种鸟，而是一群用喙讲述“适应”故事的近亲。",
      "sideterms": ["galapagos", "finch", "beak", "biogeography", "adaptation"],
      "sections": [
        {"id": "islands", "h": "一、孤岛实验室", "body": "加拉帕戈斯是太平洋中的火山群岛，各岛彼此隔离又环境迥异。对生物来说，这里是天然的“分化实验场”。",
         "fig": "finches", "figalt": "加拉帕戈斯群岛", "figcap": "一座座孤岛，像一个个独立的小实验室。"},
        {"id": "beaks", "h": "二、喙各有不同", "body": "达尔文收集到的雀鸟，彼此亲缘很近，喙却差别明显：有的尖细吃虫，有的粗壮磕种子。这种“同中有异”，正是适应不同食物的痕迹。",
         "figalt": "不同形状的喙", "figcap": "喙的形状，对应着不同的食谱。"},
        {"id": "drought", "h": "三、干旱的考验", "body": "后来的研究（如格兰特夫妇）发现：干旱年份硬种子变多，喙更粗大的个体更容易存活繁殖，下一代平均喙就变粗——自然选择真的在发生，且快得能观测。",
         "figalt": "干旱改变喙的均值", "figcap": "环境一变，种群的“平均喙形”也跟着变。"},
        {"id": "meaning", "h": "四、它说明了什么", "body": "这些雀鸟暗示：同一群祖先到了不同环境，会沿着不同方向积累适应，最终分化成不同种类。这正是进化论最生动的注脚。",
         "figalt": "适应的意义", "figcap": "一个祖先，多条出路——分化的开始。"}
      ]
    },
    "tree": {
      "title": "生命之树：我们共享祖先",
      "file": "detail/tree.html",
      "claim": "达尔文用“树”来比喻生命：所有物种像枝丫，从一条共同的根慢慢分叉而来。",
      "tags": ["生命之树", "共同祖先", "亲缘"],
      "year": "1837 起",
      "card": "树根只有一条，枝丫却有千万——我们都在同一棵树上。",
      "scene": "tree",
      "scene_params": {"label": "从根到枝：共同祖先的分叉"},
      "remember": "一句话记住：生命之树不是“谁高级谁低级”的梯子，而是一张彼此相连的网。",
      "sideterms": ["tree-of-life", "common-ancestor", "extinction", "fossil", "homology"],
      "sections": [
        {"id": "ancestor", "h": "一、共同祖先", "body": "达尔文推测：今日千姿百态的物种，追溯足够久远，会汇聚到少数、甚至单一的共同祖先。亲缘越近，分家越晚。",
         "fig": "tree", "figalt": "从根分叉的树", "figcap": "越往下追溯，物种越“汇拢”到同一根。"},
        {"id": "branching", "h": "二、分叉与灭绝", "body": "树不断分叉产生新支；有些支因不适应而灭绝，成为“断枝”。现存的物种，是这棵不断修剪的树上活下来的枝叶。",
         "figalt": "分支与断枝", "figcap": "新枝不断冒出，旧枝也会枯掉。"},
        {"id": "fossils", "h": "三、化石是年轮", "body": "化石记录了已消失的枝丫，把“树”在时间上铺开。地层越深，生物越古老、越简单——与“树根在下”完全吻合。",
         "figalt": "化石与地层", "figcap": "化石是这棵大树留在地下的年轮。"},
        {"id": "us", "h": "四、人在树上哪里", "body": "人类并不是树顶的“最高枝”，而是与猿类共享不久前的一个分支。进化论让我们明白：没有谁站在阶梯顶端，大家都是这棵大树上的近亲。",
         "figalt": "人类的位置", "figcap": "人不是梯子的顶端，而是大树上的一根近亲枝。"}
      ]
    }
  },

  "terms": {
    "evolution": {"name": "进化", "cat": "演化", "short": "物种随时间逐渐变化", "plain": "进化指生物种群的特征在世代更替中发生改变。达尔文说明：这种变化是累积的、有方向的，最终造成新类型的产生。", "analogy": "不是单个生物“变成”另一种，而是整个种群的特征像河流一样慢慢改道。", "page": "evolution", "anchor": "#idea", "related": ["species", "natural-selection", "common-ancestor"]},
    "species": {"name": "物种", "cat": "生物", "short": "能互相繁殖的一群生物", "plain": "物种通常指能够自然交配并产生可育后代的一群生物。达尔文之前，人们认为物种是固定不变的种类；他证明物种会分化与演变。", "analogy": "像是自然界里“能互相通婚的家族”，边界并非绝对。", "page": "evolution", "anchor": "#before", "related": ["evolution", "variation"]},
    "common-ancestor": {"name": "共同祖先", "cat": "演化", "short": "亲缘物种追溯到的源头", "plain": "亲缘相近的物种，若一直向上追溯，会汇向一位更早的共同祖先。这是“生命之树”的核心：枝丫再多，根只有一条。", "analogy": "表兄弟再不同，往上数总有同一对爷爷奶奶。", "page": "tree", "anchor": "#ancestor", "related": ["tree-of-life", "evolution"]},
    "hms-beagle": {"name": "小猎犬号", "cat": "历史", "short": "达尔文环球航行的船", "plain": "1831—1836 年，达尔文以随船博物学家的身份搭乘“小猎犬号”（HMS Beagle，又译“贝格尔号”）环球考察，目睹各地迥异的生物，是进化思想的重要起点。", "analogy": "这趟五年航行，像是把他送进了一座露天的“世界生物博物馆”。", "page": "evolution", "anchor": "#before", "related": ["darwin", "galapagos"]},
    "origin-of-species": {"name": "《物种起源》", "cat": "历史", "short": "1859 年那本改变世界的书", "plain": "达尔文 1859 年出版《论借助自然选择（即在生存斗争中保存优良族）的物种起源》，系统提出进化论与自然选择机制。", "analogy": "相当于给“生命为何如此多样”交了一份有据可查的答卷。", "page": "evolution", "anchor": "#idea", "related": ["evolution", "natural-selection"]},
    "darwin": {"name": "查尔斯·达尔文", "cat": "历史", "short": "进化论的主要提出者", "plain": "英国博物学家，以小猎犬号航行观察为基础，提出以自然选择为核心的进化论，深刻改变了生物学与人类自我认知。", "analogy": "他像是把“生物为何这么多样”这个大问题，第一次讲成了可验证的故事。", "page": "evolution", "anchor": "#before", "related": ["evolution", "wallace"]},
    "natural-selection": {"name": "自然选择", "cat": "演化", "short": "环境替差异做筛选", "plain": "个体有差异、繁殖过剩、资源有限，于是对生存繁殖更有利的特征被更多传给后代，逐代积累成适应。这就是进化的主要机制。", "analogy": "像一场没有考官的考试：环境悄悄记下了“更合适的”成绩。", "page": "selection", "anchor": "#result", "related": ["variation", "competition", "fitness"]},
    "variation": {"name": "变异", "cat": "生物", "short": "同种个体间的差异", "plain": "同一物种的个体在形态、生理上总有细微不同，部分差异可遗传。变异是自然选择的“原材料”。", "analogy": "同一批种子，长出来的苗也高矮不一——这就是变异。", "page": "selection", "anchor": "#variation", "related": ["natural-selection", "mutation"]},
    "competition": {"name": "生存竞争", "cat": "演化", "short": "资源有限下的较量", "plain": "生物产生的后代常多于环境能承载的数量，于是在食物、空间、配偶上相互竞争。竞争是自然选择的“压力源”。", "analogy": "一场名额有限的考试，人多座位少，必然有人落选。", "page": "selection", "anchor": "#struggle", "related": ["natural-selection", "malthus"]},
    "fitness": {"name": "适应度", "cat": "演化", "short": "留下后代的能力", "plain": "在进化里，“适合度”不指身体强壮，而指个体留下可育后代的多寡。适应度高的特征会在种群中变多。", "analogy": "考试不在乎你多壮，只在乎你最终“晋级”了几个人。", "page": "selection", "anchor": "#struggle", "related": ["natural-selection", "adaptation"]},
    "inheritance": {"name": "遗传", "cat": "生物", "short": "特征传给下一代", "plain": "父母的部分特征会传给后代，使有利差异得以积累。达尔文时代还不懂基因，却已看出“可遗传”是选择生效的前提。", "analogy": "好手艺能传给徒弟，才谈得上代代精进。", "page": "selection", "anchor": "#inheritance", "related": ["variation", "mutation"]},
    "malthus": {"name": "马尔萨斯", "cat": "历史", "short": "点醒达尔文的经济学家", "plain": "马尔萨斯在《人口论》中指出：人口按几何增长、资源按算术增长，必然导致“过剩”。这启发达尔文想到生物界的生存竞争。", "analogy": "一句“生的多、活的少”，成了进化论的齿轮之一。", "page": "selection", "anchor": "#struggle", "related": ["competition", "natural-selection"]},
    "survival-of-fittest": {"name": "适者生存", "cat": "演化", "short": "更合适的留下更多", "plain": "这是后人（斯宾塞）对自然选择的概括。准确地说，是“更适应环境的个体留下更多后代”，而非字面“最强者活”。", "analogy": "不是拳击冠军活下来，而是“最对路”的那位留下更多孩子。", "page": "selection", "anchor": "#result", "related": ["fitness", "natural-selection"]},
    "galapagos": {"name": "加拉帕戈斯", "cat": "生物", "short": "达尔文灵感的群岛", "plain": "太平洋上的火山群岛，各岛隔离且环境不同。这里的雀鸟、龟类等表现出明显的局部适应，成为进化论的活证据。", "analogy": "一座座孤岛，像一个个被隔开的小实验室。", "page": "finches", "anchor": "#islands", "related": ["finch", "biogeography", "hms-beagle"]},
    "finch": {"name": "达尔文雀", "cat": "生物", "short": "喙形各异的近亲群", "plain": "加拉帕戈斯群岛上一群亲缘相近的雀鸟，因岛屿食物不同演化出不同形状的喙。它们不是一种，而是一组“适应故事”的主角。", "analogy": "同一个家族分住几座岛，各凭本事的“饭碗”长成了不同模样。", "page": "finches", "anchor": "#beaks", "related": ["beak", "galapagos", "adaptation"]},
    "beak": {"name": "喙", "cat": "生物", "short": "鸟的“餐具”也是工具", "plain": "鸟的喙形对应其食性：尖细的吃虫，粗壮的磕种子。喙的差异是适应不同环境最直观的“简历”。", "analogy": "喙就像手的形状——干不同活，长不同样。", "page": "finches", "anchor": "#beaks", "related": ["finch", "adaptation"]},
    "biogeography": {"name": "生物地理", "cat": "方法", "short": "生物分布里的线索", "plain": "研究物种在地球上的分布规律。远离大陆的岛屿常有独特且近缘的特有种，这强烈支持“就地分化”而非“各自被搬来”。", "analogy": "看谁和谁做邻居，就能猜出它们是不是亲戚。", "page": "finches", "anchor": "#islands", "related": ["galapagos", "common-ancestor"]},
    "adaptation": {"name": "适应", "cat": "演化", "short": "特征与环境的契合", "plain": "适应指生物的特征与环境需求相契合，如骆驼储水、鸟的喙形配食性。它是自然选择长期积累的结果。", "analogy": "钥匙磨得久了，就贴合了那把锁。", "page": "finches", "anchor": "#beaks", "related": ["natural-selection", "fitness"]},
    "tree-of-life": {"name": "生命之树", "cat": "演化", "short": "用树比喻亲缘", "plain": "达尔文用树状图表示：物种像枝丫从共同的根分叉而来，亲缘近的枝丫靠得近。它强调连通，而非“谁高级”。", "analogy": "不是登顶的梯子，而是同根生出的繁茂枝丫。", "page": "tree", "anchor": "#branching", "related": ["common-ancestor", "extinction"]},
    "extinction": {"name": "灭绝", "cat": "演化", "short": "枝丫的断落", "plain": "当物种无法适应环境变化，便会消失。灭绝是生命之树上的“断枝”，使树的形态不断被修剪。", "analogy": "树上有些枝丫枯了，整棵树却因此换了形状。", "page": "tree", "anchor": "#branching", "related": ["tree-of-life", "natural-selection"]},
    "fossil": {"name": "化石", "cat": "生物", "short": "留在石头里的远古生命", "plain": "化石是古生物的遗体或痕迹，按地层由深到浅记录着生命的更迭，为“生命之树”提供时间维度。", "analogy": "化石是这棵大树留在地下的年轮。", "page": "tree", "anchor": "#fossils", "related": ["evolution", "common-ancestor"]},
    "homology": {"name": "同源器官", "cat": "生物", "short": "模样不同、来源相同", "plain": "人的手臂、鲸的鳍、蝙蝠的翼，骨骼结构相似却功能各异，说明它们来自共同祖先的同一结构。这是亲缘关系的铁证。", "analogy": "同一款零件，装在不同机器上干不同的活。", "page": "evolution", "anchor": "#evidence", "related": ["common-ancestor", "evolution"]},
    "mutation": {"name": "突变", "cat": "生物", "short": "遗传信息的偶然改动", "plain": "基因在复制时偶尔出错，产生新的变异。现代生物学把突变视为变异的重要来源；达尔文当时尚不知其机制。", "analogy": "抄作业时偶尔抄错一个字，可能变成新版本。", "page": "selection", "anchor": "#variation", "related": ["variation", "inheritance"]},
    "geology": {"name": "地质学", "cat": "方法", "short": "读懂地球的时间厚度", "plain": "地质学通过岩层推断地球的漫长历史。达尔文借重它，才敢相信“缓慢变化”足以造就大差异。", "analogy": "把地球当成一本厚书，一页页都是时间。", "page": "evolution", "anchor": "#evidence", "related": ["uniformitarianism", "lyell"]},
    "lyell": {"name": "赖尔", "cat": "历史", "short": "均变论的代表", "plain": "地质学家赖尔主张“现在是认识过去的钥匙”：同样缓慢的地质作用，长期积累能塑造巨大变化。这深刻影响了达尔文。", "analogy": "今天还在发生的小变化，攒久了能改写大山。", "page": "evolution", "anchor": "#evidence", "related": ["geology", "uniformitarianism"]},
    "uniformitarianism": {"name": "均变论", "cat": "方法", "short": "缓慢累积成巨变", "plain": "均变论认为：今日可见的缓慢自然过程，长期作用足以造成地质与生物的巨大变迁。它是进化论的时间观基础。", "analogy": "每天挪一毫米，十年也能搬走一座山。", "page": "evolution", "anchor": "#evidence", "related": ["geology", "lyell"]},
    "wallace": {"name": "华莱士", "cat": "历史", "short": "独立想到自然选择的人", "plain": "阿尔弗雷德·华莱士几乎同时独立提出自然选择学说。正是他 1858 年的来信，促使达尔文尽快发表自己的成果。", "analogy": "同一个答案，被两个人各自解了出来。", "page": "evolution", "anchor": "#idea", "related": ["darwin", "natural-selection"]},
    "population": {"name": "种群", "cat": "生物", "short": "进化的真正单位", "plain": "进化发生在种群（一群可交配的个体）层面，而非单个生物。自然选择改变的是种群中特征的频率。", "analogy": "改的不是某棵树，而是整片林子的平均身高。", "page": "selection", "anchor": "#struggle", "related": ["natural-selection", "variation"]}
  },

  "timeline": [
    {"year": 1809, "id": "born", "title": "生于什鲁斯伯里", "img": "darwin-portrait.jpg", "alt": "达尔文肖像", "fig": "达尔文 1809 年生于英国什鲁斯伯里一个富裕家庭。", "body": "2 月 12 日，查尔斯·达尔文出生。少年时偏爱自然观察，对标本和矿物着迷。"},
    {"year": 1825, "id": "edinburgh", "title": "爱丁堡学医", "img": "darwin-edinburgh.jpg", "alt": "爱丁堡", "fig": "在爱丁堡接触医学与博物学。", "body": "进入爱丁堡大学学医，却对解剖与手术反感；反而迷上了海洋生物等博物学观察。"},
    {"year": 1828, "id": "cambridge", "title": "剑桥读神学", "img": "darwin-cambridge.jpg", "alt": "剑桥", "fig": "在剑桥结识良师，转向博物学。", "body": "转赴剑桥学神学，同时跟随植物学、地质学老师野外考察，打下扎实的自然研究底子。"},
    {"year": 1831, "id": "beagle", "title": "小猎犬号启航", "img": "hms-beagle.jpg", "alt": "小猎犬号", "fig": "五年航行，改变一生。", "body": "以随船博物学家身份登上“小猎犬号”，开始历时五年的环球考察。"},
    {"year": 1835, "id": "galapagos", "title": "抵达加拉帕戈斯", "img": "galapagos.jpg", "alt": "加拉帕戈斯群岛", "fig": "雀鸟与龟，埋下关键线索。", "body": "在加拉帕戈斯群岛观察到近缘雀鸟与巨龟的局部差异，成为日后思想的重要种子。"},
    {"year": 1837, "id": "notebook", "title": "写下第一本进化笔记", "img": "darwin-tree.jpg", "alt": "达尔文的生命之树草图", "fig": "他画下了著名的“生命之树”草图。", "body": "回国后不久，达尔文在笔记本里首次勾勒“物种可能演变”的想法，并画下生命之树的雏形。"},
    {"year": 1838, "id": "malthus", "title": "读到马尔萨斯", "img": "darwin-malthus.jpg", "alt": "马尔萨斯《人口论》", "fig": "“过剩”点醒了竞争。", "body": "读到马尔萨斯《人口论》，悟出生存竞争是自然选择的引擎，核心机制逐渐成形。"},
    {"year": 1858, "id": "wallace", "title": "收到华莱士来信", "img": "wallace.jpg", "alt": "华莱士", "fig": "独立的同名发现，催他发表。", "body": "华莱士寄来同样主张自然选择的文稿。达尔文在友人安排下，与华莱士联名宣读，并加速写作。"},
    {"year": 1859, "id": "origin", "title": "《物种起源》出版", "img": "origin-title.jpg", "alt": "《物种起源》书名页", "fig": "一本改变世界的书。", "body": "11 月，《论借助自然选择的物种起源》出版，系统提出进化论与自然选择，轰动学界与公众。"},
    {"year": 1871, "id": "descent", "title": "《人类的由来》", "img": "darwin-descent.jpg", "alt": "《人类的由来》", "fig": "把人纳入同一棵树。", "body": "出版《人类的由来及性选择》，把人类也放进进化框架，引发更大争议。"},
    {"year": 1882, "id": "died", "title": "逝于唐恩", "img": "westminster-abbey.jpg", "alt": "威斯敏斯特教堂", "fig": "安葬于威斯敏斯特教堂。", "body": "4 月 19 日，达尔文逝世，享年 73 岁，后安葬于威斯敏斯特教堂，与牛顿等为邻。"}
  ],

  "images": [
    {"file": "darwin-portrait.jpg", "wiki": "File:Charles Darwin aged 51.jpg", "q": "Charles Darwin portrait", "desc": "达尔文肖像", "author": "Public domain", "license": "Public domain"},
    {"file": "darwin-edinburgh.jpg", "wiki": "File:Edinburgh from the north.jpg", "q": "Edinburgh city Scotland", "desc": "爱丁堡", "author": "Public domain", "license": "Public domain"},
    {"file": "darwin-cambridge.jpg", "wiki": "File:Cambridge King's College chapel.jpg", "q": "Cambridge university King's College", "desc": "剑桥", "author": "Public domain", "license": "Public domain"},
    {"file": "hms-beagle.jpg", "wiki": "File:HMS Beagle.jpg", "q": "HMS Beagle ship", "desc": "小猎犬号", "author": "Public domain", "license": "Public domain"},
    {"file": "galapagos.jpg", "wiki": "File:Galapagos Islands map.png", "q": "Galapagos Islands landscape", "desc": "加拉帕戈斯群岛", "author": "Public domain", "license": "Public domain"},
    {"file": "darwin-tree.jpg", "wiki": "File:Darwin's Tree of Life notes.png", "q": "Darwin tree of life sketch", "desc": "达尔文的生命之树草图", "author": "Public domain", "license": "Public domain"},
    {"file": "darwin-malthus.jpg", "wiki": "File:Thomas Robert Malthus.jpg", "q": "Thomas Malthus portrait", "desc": "马尔萨斯", "author": "Public domain", "license": "Public domain"},
    {"file": "wallace.jpg", "wiki": "File:Alfred Russel Wallace.jpg", "q": "Alfred Russel Wallace portrait", "desc": "华莱士", "author": "Public domain", "license": "Public domain"},
    {"file": "origin-title.jpg", "wiki": "File:Origin of Species title page.jpg", "q": "Origin of Species title page", "desc": "《物种起源》书名页", "author": "Public domain", "license": "Public domain"},
    {"file": "darwin-descent.jpg", "wiki": "File:The Descent of Man.jpg", "q": "Descent of Man Darwin", "desc": "《人类的由来》", "author": "Public domain", "license": "Public domain"},
    {"file": "westminster-abbey.jpg", "wiki": "File:Westminster Abbey nave.jpg", "q": "Westminster Abbey interior", "desc": "威斯敏斯特教堂", "author": "Public domain", "license": "Public domain"}
  ],

  "labs": [
    {"key": "population", "kind": "growth", "icon": "🌱", "title": "种群增长：指数与受限",
     "intro": "拖动“速率”，看蓝线（无限制指数增长）与绿线（受环境容量限制的 S 形）如何分道扬镳。",
     "desc": "资源有限时，增长会“踩刹车”——这正是竞争的来源。",
     "ctrl": [{"name": "rate", "label": "增长速率 r", "min": 0.3, "max": 1.5, "value": 0.6, "step": 0.1, "init": "0.6"}],
     "params": {"label": "有限资源下，种群不会一直指数暴涨"}},
    {"key": "selection", "kind": "graph", "icon": "📊", "title": "选择压力：分布整体偏移",
     "intro": "拖动“选择压力”，看种群的性状分布（钟形曲线）整体向某个方向平移。",
     "desc": "环境偏好某一端，几代之后平均特征就跟着偏。",
     "ctrl": [{"name": "param1", "label": "选择压力", "min": 0.2, "max": 1.8, "value": 1, "step": 0.1, "init": "1.0"}, {"name": "param2", "label": "差异宽度", "min": 0.6, "max": 2, "value": 1, "step": 0.1, "init": "1.0"}],
     "params": {"expr": "gauss", "label": "选择压力使种群性状均值整体偏移"}},
    {"key": "tree", "kind": "branching", "icon": "🌳", "title": "生命之树：从一根到千万枝",
     "intro": "拖动“演化级数”，看一根主干如何逐级一分为二，长出越来越多的末梢。",
     "desc": "共同祖先不断分叉，便有了今天多样的物种。",
     "ctrl": [{"name": "depth", "label": "演化级数", "min": 1, "max": 8, "value": 5, "step": 1, "init": "5 级"}],
     "params": {"label": "从共同祖先分叉而出的生命之树", "leafColors": ["#3B5BDB", "#2F9E44", "#E8590C", "#6741D9", "#0C8599", "#C2255C"]}}
  ]
}


if __name__ == "__main__":
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "spec_darwin.json")
    json.dump(SPEC, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print("wrote", out)

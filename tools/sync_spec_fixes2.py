#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把第二轮 23 条修正**同步进生成源**（tools/spec_<id>.py 与 tools/newlabs/<id>.py），
再运行 spec_<id>.py 重生成同名 .json。

为什么必须做：子站的分工是
  · 正文 / 术语库 / 时间轴  ← tools/spec_<id>.py  → spec_<id>.json → build_scientist.py
  · 「玩一玩」实验页与实验 JS ← tools/newlabs/<id>.py
  · newton / galileo / einstein 三站无 spec，正文即手写 HTML（改站点即可）
只改站点不改生成源，下次重建修正会被写回原样（第一轮的血泪教训）。

用法：
  python3 tools/sync_spec_fixes2.py --dry    # 只校验
  python3 tools/sync_spec_fixes2.py          # 校验 → 写入 → 重生成 .json → 复验
"""
import json
import os
import subprocess
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
PY = sys.executable

# ── 文本替换：(相对路径, 原文, 新文, 期望次数, 说明) ──────────────────────
EDITS = [
    # ══ spec_copernicus.py ══
    ("tools/spec_copernicus.py",
     "哥白尼之后的开普勒、牛顿进一步澄清：地轴是斜的（约 23.5°）。正是这点倾斜，让南北半球在不同时间接收阳光多少不同，形成春夏秋冬。",
     "地轴是斜的（约 23.5°）——这不是后来才发现的：哥白尼的日心模型已经用这一点解释四季。正是这点倾斜，让南北半球在不同时间接收阳光多少不同，形成春夏秋冬；开普勒、牛顿后来又从力学上给出了完整的解释。",
     1, "A1 地轴倾斜归属"),
    ("tools/spec_copernicus.py",
     '"title": "开普勒修正为椭圆"',
     '"title": "开普勒给出周期定律"',
     1, "A2 1619 节点标题"),
    ("tools/spec_copernicus.py",
     "开普勒提出行星沿椭圆轨道运行，并给出周期—距离的定量定律，把哥白尼的草图变成精确蓝图。",
     "开普勒先在 1609 年公布行星沿椭圆运行，又在 1619 年给出周期与距离的定量定律，把哥白尼的草图变成精确蓝图。",
     1, "A2 1619 节点正文"),
    ("tools/spec_copernicus.py",
     "用圆和圆 combinations 拟合行星位置",
     "用一圈套一圈的圆去拟合行星位置",
     1, "B1 未译英文词"),

    # ══ spec_kepler.py ══
    ("tools/spec_kepler.py",
     "用肉眼（望远镜还没普及）做出了",
     "用肉眼（那时望远镜尚未发明）做出了",
     1, "A4 第谷时代"),
    ("tools/spec_kepler.py",
     "没 microscope 的“超级视力”",
     "没有望远镜的“超级视力”",
     1, "B2 术语库 analogy"),

    # ══ spec_pasteur.py ══
    ("tools/spec_pasteur.py",
     '"tags": ["巴氏杀菌", "食品", "灭菌"]',
     '"tags": ["巴氏杀菌", "食品", "杀菌"]',
     1, "A8 标签 灭菌→杀菌"),
    ("tools/spec_pasteur.py",
     '"figalt": "加热灭菌"',
     '"figalt": "加热杀菌"',
     1, "A8 配图 alt"),
    ("tools/spec_pasteur.py",
     "这就是加热灭菌的原理。",
     "这就是加热杀菌的原理。",
     1, "A8 实验描述里的同词"),
    ("tools/spec_pasteur.py",
     "天花被消灭，更证明其路线的深远。",
     "而疫苗技术的持续发展，最终让天花这样的烈性传染病被彻底消灭。",
     1, "A9 天花归因"),
    ("tools/spec_pasteur.py",
     '''    {"year": 1862, "id": "spontaneous", "title": "鹅颈瓶实验", "img": "swan-neck-flask.jpg", "alt": "鹅颈瓶", "fig": "否定生命自然发生。", "body": "用鹅颈瓶证明肉汤变质来自空气中的微生物，而非无中生有，力压自然发生说。"},
''',
     '''    {"year": 1862, "id": "spontaneous", "title": "鹅颈瓶实验", "img": "swan-neck-flask.jpg", "alt": "鹅颈瓶", "fig": "否定生命自然发生。", "body": "用鹅颈瓶证明肉汤变质来自空气中的微生物，而非无中生有，力压自然发生说。"},
    {"year": 1864, "id": "pasteurization", "title": "巴氏杀菌", "img": "etudes-sur-le-vin.jpg", "alt": "《酒的研究》1866 年初版书名页", "fig": "把酒加热到刚好，酸败止住了。", "body": "他证明酒的酸败来自微生物，并用适度加热把它们压下去——这就是沿用至今的巴氏杀菌。"},
''',
     1, "B10 时间轴补 1864 节点"),
    ("tools/spec_pasteur.py",
     '''    {"file": "swan-neck-flask.jpg", "wiki": "File:Pasteur experiment.jpg", "q": "Pasteur swan neck flask experiment", "desc": "鹅颈瓶实验", "author": "Public domain", "license": "Public domain"},
''',
     '''    {"file": "swan-neck-flask.jpg", "wiki": "File:Pasteur experiment.jpg", "q": "Pasteur swan neck flask experiment", "desc": "鹅颈瓶实验", "author": "Public domain", "license": "Public domain"},
    {"file": "etudes-sur-le-vin.jpg", "wiki": "File:Étude sur le vin Louis Pasteur.jpg", "q": "Etudes sur le vin Pasteur 1866", "desc": "《酒的研究》1866 年初版书名页", "author": "Public domain", "license": "Public domain"},
''',
     1, "B10 登记新增图片"),

    # ══ spec_hawking.py ══
    ("tools/spec_hawking.py",
     "一个天体若足够致密，其表面逃逸速度会超过光速。按相对论，光也逃不出——这就是黑洞。",
     "一个天体若足够致密，其表面的逃逸速度会超过光速，连光也逃不出去——这是理解黑洞的入门近似。严格说来，黑洞真正的边界是事件视界：那里的时空弯曲得连光都只能向内走（见下一节）。",
     1, "A10 黑洞定义"),

    # ══ spec_maxwell.py ══
    ("tools/spec_maxwell.py",
     "今天所有的 radio、Wi-Fi、光纤",
     "今天所有的无线电、Wi-Fi、光纤",
     1, "B5 未译英文词"),

    # ══ spec_curie.py ══
    ("tools/spec_curie.py",
     "她从一吨矿渣里提炼出零点几克镭",
     "她从数吨矿渣里提炼出零点几克镭",
     1, "B9 首页导语"),
    ("tools/spec_curie.py",
     '"card": "一吨矿渣，换回一小管会发光的镭。"',
     '"card": "数吨矿渣，换回一小管会发光的镭。"',
     1, "B9 首页成就卡"),

    # ══ spec_darwin.py ══
    ("tools/spec_darwin.py",
     "而是一张彼此相连的网。",
     "而是同一根上彼此相连的枝丫。",
     1, "B11 树/网 比喻冲突"),

    # ══ spec_mendeleev.py ══
    ("tools/spec_mendeleev.py",
     '"h": "四、锗坐实"',
     '"h": "四、钪与锗相继坐实"',
     1, "B7 小节标题"),
    ("tools/spec_mendeleev.py",
     "1886 年，锗被发现，几乎完全符合“类硅”的预言。两次应验，让周期表从“巧妙排列”升格为“可信理论”。",
     "1879 年，钪被发现，正对应他预言的“类硼”；1886 年，锗被发现，几乎完全符合“类硅”的预言。三个空格全部应验，让周期表从“巧妙排列”升格为“可信理论”。",
     1, "B7 补第三个应验的预言"),

    # ══ spec_turing.py ══
    ("tools/spec_turing.py",
     "图灵在布莱切利园设计“炸弹机”，用机电方式大规模搜索密钥，大幅加速了破译。",
     "图灵在布莱切利园设计出改进型的“炸弹机”，用机电方式大规模搜索密钥，大幅加速了破译。",
     1, "B13 big-claim"),
    ("tools/spec_turing.py",
     "图灵设计的“炸弹机”用电动机电逻辑瞬间尝试成千上万种组合，自动筛掉不可能的密钥，极大缩短破译时间。",
     "图灵设计的改进型“炸弹机”用电动机电逻辑瞬间尝试成千上万种组合，自动筛掉不可能的密钥，极大缩短破译时间。它的思路并非凭空而来：战前波兰数学家雷耶夫斯基等人已经首破恩尼格玛、造出前驱装置 Bomba；图灵是在此基础上的改进，布莱切利园的胜利是多国协作的结果。",
     1, "B12+B13 正文"),
    ("tools/spec_turing.py",
     "他设计的炸弹机大规模加速密钥搜索，成为破译的关键装备。",
     "他设计的改进型炸弹机大规模加速密钥搜索，成为破译的关键装备。",
     1, "B13 时间轴"),
    ("tools/spec_turing.py",
     '"plain": "炸弹机是图灵团队设计的机电装置，',
     '"plain": "炸弹机是图灵团队在波兰 Bomba 基础上改进的机电装置，',
     1, "B12/B13 术语库"),

    # ══ newlabs/copernicus.py ══
    ("tools/newlabs/copernicus.py",
     "日心说预言了恒星视差，可当年最好的仪器只能测到约 0.1 角秒，星星的摆动小到根本看不出来——这反倒成了反对日心说的理由。直到 1838 年，贝塞尔才测出第一颗恒星的视差。",
     "日心说预言了恒星视差，可这个角度小得可怜——最近的恒星也只有约 0.8 角秒。当年最好的仪器精度只有角分（约 60 角秒）量级，连 0.1 角秒都摸不到，星星那点摆动根本看不出来——这反倒成了反对日心说的理由。直到 1838 年，贝塞尔才测出第一颗恒星的视差。",
     1, "A3 labs callout"),
    ("tools/newlabs/copernicus.py",
     "比当年仪器能测到的 0.1 角秒还小，根本看不出来",
     "已小到 0.1 角秒以下，早年的仪器根本分辨不出",
     1, "A3 实验读数 JS"),

    # ══ newlabs/hawking.py ══
    ("tools/newlabs/hawking.py",
     "在视界以内，连最快的逃逸速度也超过光速。",
     "在事件视界以内，连光都只能向内走（“逃逸速度超过光速”只是入门近似）。",
     1, "A10 labs callout"),

    # ══ newlabs/mendeleev.py ══
    ("tools/newlabs/mendeleev.py",
     "把元素的某种性质按原子序数画成柱子，会出现规律的锯齿：每到稀有气体冲到最高，一到碱金属就跌到最低，然后周而复始。拖动“性质”，换一种性质看看。",
     "把元素的某种性质按原子序数画成柱子，会出现规律的起伏。以默认的第一电离能为例：稀有气体冲到最高、碱金属跌到最低；换成原子半径等性质，趋势会整体反过来。拖动“性质”，换一种性质看看。",
     1, "B6 周期律引言"),

    # ══ newlabs/curie.py ══
    ("tools/newlabs/curie.py",
     "约每吨沥青铀矿残渣只能提出 25 毫克镭，而这点量要用掉几吨矿石。",
     "约每吨沥青铀矿残渣只能提出几十毫克镭；要攒出 0.1 克氯化镭，得处理好几吨矿渣。",
     1, "B8 提纯句"),
]

# 需要重生成 .json 的 spec（只列改动过的）
REGEN = ["copernicus", "kepler", "pasteur", "hawking", "maxwell", "curie", "darwin", "mendeleev", "turing"]


def main():
    dry = "--dry" in sys.argv
    problems, texts = [], {}
    for rel, old, new, expect, note in EDITS:
        p = os.path.join(ROOT, rel)
        if p not in texts:
            texts[p] = open(p, encoding="utf-8").read() if os.path.exists(p) else None
        t = texts[p]
        if t is None:
            problems.append(f"文件不存在：{rel}"); continue
        n = t.count(old)
        if n != expect:
            problems.append(f"[{note}] {rel}：期望 {expect} 次，实际 {n} 次\n     旧文：{old[:70]}…")

    print(f"共 {len(EDITS)} 条替换，涉及 {len({e[0] for e in EDITS})} 个生成源文件")
    if problems:
        print(f"\n❌ 校验未通过（{len(problems)} 条），未写入：\n")
        for x in problems:
            print("   • " + x)
        return 1
    print("✅ 全部命中次数符合预期")
    if dry:
        print("\n(--dry 模式，未写盘)")
        return 0

    # ── 写入 ──
    for p, t in texts.items():
        rel = os.path.relpath(p, ROOT)
        for r2, o2, n2, _e, _n in EDITS:
            if r2 == rel:
                t = t.replace(o2, n2)
        open(p, "w", encoding="utf-8").write(t)
    print(f"\n✅ 已改写 {len(texts)} 个生成源文件")

    # ── 语法 & 残留复核 ──
    bad = []
    for p in texts:
        r = subprocess.run([PY, "-m", "py_compile", p], capture_output=True)
        if r.returncode != 0:
            bad.append(f"{os.path.relpath(p, ROOT)}: {r.stderr.decode()[:300]}")
    if bad:
        print("❌ 编译失败：\n   " + "\n   ".join(bad)); return 1
    print("✅ 全部生成源编译通过")

    # ── 重生成 .json 并校验 .py ↔ .json 等价 ──
    for sid in REGEN:
        p = os.path.join(ROOT, "tools", f"spec_{sid}.py")
        r = subprocess.run([PY, p], capture_output=True, text=True)
        if r.returncode != 0:
            print(f"❌ {sid}: 重生成失败 {r.stderr[:200]}"); return 1
        jp = os.path.join(ROOT, "tools", f"spec_{sid}.json")
        loaded = json.load(open(jp, encoding="utf-8"))
        # 用同样的方式再取一次 .py 里的 SPEC
        ns = {"__name__": "imported_check"}
        exec(compile(open(p, encoding="utf-8").read().split('if __name__')[0], p, "exec"), ns)
        same = loaded == ns["SPEC"]
        print(f"   {'✅' if same else '❌'} spec_{sid}: .py ↔ .json {'等价' if same else '不一致'}")
        if not same:
            return 1

    # ── 残留复核：改了的地方不该再出现旧文 ──
    print("\n── 残留复核（生成源 + 站点） ──")
    SKIP_NAMES = {
        "apply_review_fixes2.py", "sync_spec_fixes2.py", "check_review_fixes2.js",
        "science-review-2.html", "science-review.html",
        "apply_review_fixes.py", "sync_spec_fixes.py", "check_review_fixes.js",
        # 以下两个是「玩一玩」重做轮留下的**快照产物**（带日期，记录当时的文案），
        # 属历史留档、不是线上正文，故有意不随本轮修正改写。
        "labs_audit.json", "labs-review.html",
    }
    payload = {}   # 相对路径 -> 内容
    for dirpath, _dn, fns in os.walk(ROOT):
        if any(s in dirpath for s in (".git", ".workbuddy", "node_modules", "review2", "验证产物")):
            continue
        for fn in fns:
            if not fn.endswith((".py", ".html", ".js", ".json")) or fn in SKIP_NAMES:
                continue
            fp = os.path.join(dirpath, fn)
            try:
                payload[os.path.relpath(fp, ROOT)] = open(fp, encoding="utf-8").read()
            except Exception:
                pass
    print(f"   扫描 {len(payload)} 个文件")
    leftovers = []
    for rel, old, new, expect, note in EDITS:
        for fp, content in payload.items():
            if old in content:
                leftovers.append(f"{fp}  «{old[:40]}…»")
    if leftovers:
        print(f"   ⚠️ 仍有 {len(leftovers)} 处旧文残留（请确认是否属预期）：")
        for x in leftovers[:20]:
            print("      · " + x)
    else:
        print("   ✅ 无旧文残留（脚本自身与审读报告除外）")
    return 0


if __name__ == "__main__":
    sys.exit(main())

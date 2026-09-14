# -*- coding: utf-8 -*-
"""把「审读报告」的修正同步进 12 个子站的**生成源**（tools/spec_<id>.py）。

为什么必须做：这 12 个子站由 spec 生成。只改站点、不改 spec，将来任何一次
「用 spec 重建子站」都会把刚修好的错文案原样写回去。

做法：
  1) 对 tools/spec_<id>.py 施加文本替换 / 节点增删（每条要求精确命中）；
  2) 运行这些 .py 重新生成同名 spec_<id>.json（已验证 .json 就是 .py 的产物，无损）；
  3) 校验 .py 可编译、.json 可解析，并复核旧文案已清零。

用法：
    python tools/sync_spec_fixes.py --dry
    python tools/sync_spec_fixes.py
"""
import sys, os, re, json, subprocess, py_compile

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
os.chdir(ROOT)
DRY = "--dry" in sys.argv
PY = sys.executable

PAIRS = []   # (spec_id, old, new, 期望次数, 说明)


def add(site, old, new, n, note):
    PAIRS.append((site, old, new, n, note))


# ---------------------------- A 类 ----------------------------

# A2 / B6 门捷列夫
add("mendeleev",
    "从 60 多种到今天 118 种人工合成元素，周期表不断加长，框架却始终稳。",
    "从 60 多种到今天 118 种元素——其中不少重元素还是人工合成的，周期表不断加长，框架却始终稳。",
    1, "A2 118 种元素 ≠ 全人工合成")
add("mendeleev",
    '"title": "原子序数登场前夜"',
    '"title": "周期表进入精细打磨期"',
    1, "B6 节点标题")
add("mendeleev",
    '"body": "周期表进入精细打磨期，等待莫塞莱用原子序数给出更深的依据。"',
    '"body": "周期表进入精细打磨期。可惜门捷列夫 1907 年去世，没能等到 1913 年莫塞莱用原子序数给出更深的依据。"',
    1, "B6 节点正文")

# A7 开普勒
add("kepler",
    "太阳不在中心，而在一个焦点上——这正是行星近太阳时更快的原因。",
    "太阳不在中心，而在一个焦点上——所以行星时近时远。至于近时快、远时慢，原因在第二定律：连线在相等时间里扫过相等的面积。",
    1, "A7a 第一/第二定律拆开")
add("kepler",
    "而不是椭圆中心——这正是行星近太阳更快的原因。",
    "而不是椭圆中心——于是行星时近时远。至于近时快、远时慢，是第二定律说的：连线在相等时间扫过相等面积。",
    1, "A7b 术语库焦点条")

# A11 巴斯德
add("pasteur",
    '{"year": 1854, "id": "asymmetry"',
    '{"year": 1848, "id": "asymmetry"',
    1, "A11 分子不对称 1854→1848")

# A12 霍金
add("hawking",
    '"body": "他与彭罗斯证明，在很一般的条件下时空必出现奇点，震动学界。"',
    '"body": "1965 年彭罗斯证明引力坍缩必然产生奇点，霍金随即把这一套用到整个宇宙；1970 年，两人联合证明了著名的奇点定理。"',
    1, "A12 奇点定理年份归属")

# A15 法拉第
add("faraday",
    "1831 年 8 月 29 日，法拉第把一根磁铁插进线圈，发现线圈里瞬间冒出了电流——磁铁不动则没有，一动就有。",
    "1831 年 8 月 29 日，法拉第用铁环实验第一次看到“变化”的磁生出电流；同年 10 月，他又用磁铁插入线圈反复验证——磁铁不动则没有，一动就有。",
    1, "A15 铁环实验（8·29）")

# ---------------------------- B 类 ----------------------------

# B1 费曼
add("feynman",
    "费曼（与惠勒、以及老师惠勒的启发）提出过一个著名图像：",
    "费曼受老师惠勒启发，提出过一个著名图像：",
    1, "B1 术语病句")

# B2 / B3 达尔文
add("darwin",
    "长期下来，种群逐渐适应 environment，新类型由此产生。",
    "长期下来，种群逐渐适应环境，新类型由此产生。",
    1, "B2 environment 漏译")
add("darwin",
    "核心事实（生卒、贝格尔号航行、《物种起源》、自然选择）",
    "核心事实（生卒、小猎犬号航行、《物种起源》、自然选择）",
    1, "B3 about 船名")
add("darwin",
    "以及《贝格尔号航行记》。",
    "以及《小猎犬号航海记》（HMS Beagle 航行记，又译《贝格尔号航海记》）。",
    1, "B3 延伸阅读书名")
add("darwin",
    "以贝格尔号航行观察为基础",
    "以小猎犬号航行观察为基础",
    1, "B3 术语库达尔文条")
add("darwin",
    "搭乘“小猎犬号”环球考察",
    "搭乘“小猎犬号”（HMS Beagle，又译“贝格尔号”）环球考察",
    1, "B3 补括注")

# B4 居里（死因）
add("curie",
    "1934 年逝于贫血（与长期辐射暴露相关）",
    "1934 年逝于再生障碍性贫血（与长期辐射暴露相关）",
    1, "B4 死因写明")

# B8 图灵
add("turing",
    "发明的“炸弹机”大幅缩短了战争。",
    "设计出改进型的“炸弹机”，大幅缩短了战争。",
    1, "B8 炸弹机 发明→设计")

# B9 法拉第
add("faraday",
    '{"name": "苯", "cat": "电磁"',
    '{"name": "苯", "cat": "化学"',
    1, "B9 苯的分类")
add("faraday",
    '"cats": ["物理", "电磁", "历史", "科普"]',
    '"cats": ["物理", "电磁", "化学", "历史", "科普"]',
    1, "B9 分类表补化学")

# ---- 需要"移动/新增节点"的两处，单独用正则 ----
MAX_COLOR_OLD = ('{"year": 1855, "id": "color", "title": "彩色摄影实验", "img": "color-photography.jpg", '
                 '"alt": "最早的彩色照片", "fig": "用三原色叠出彩色。", '
                 '"body": "他演示用红、绿、蓝三滤光底片合成彩色影像，是彩色摄影原理的早期实践。"}')
MAX_COLOR_NEW = ('{"year": 1861, "id": "color", "title": "彩色摄影实验", "img": "color-photography.jpg", '
                 '"alt": "最早的彩色照片", "fig": "用三原色叠出彩色。", '
                 '"body": "他根据自己 1855 年提出的三原色理论，用红、绿、蓝三张滤光底片叠合，演示出世界上第一张彩色照片。"}')
MAX_ANCHOR = '{"year": 1861, "id": "eq1"'

CURIE_WAR = ('{"year": 1914, "id": "war", "title": "战地 X 光车", "img": "xray-car.jpg", "alt": "移动 X 光车", '
             '"fig": "把射线用于救人。", "body": "一战期间她组织移动 X 光车上前线，为伤员定位弹片，挽救无数生命。"}')
CURIE_NEW = [
    '{"year": 1934, "id": "died", "title": "逝于再生障碍性贫血", "img": "curie-portrait.jpg", "alt": "居里夫人", '
    '"fig": "一生与镭为伴，也被镭所伤。", "body": "7 月 4 日，她因长期辐射暴露导致的再生障碍性贫血去世，享年 66 岁。"}',
    '{"year": 1995, "id": "pantheon", "title": "移灵先贤祠", "img": "pantheon.jpg", "alt": "巴黎先贤祠", '
    '"fig": "与皮埃尔一同安息于先贤祠。", "body": "法国政府把她的灵柩移入巴黎先贤祠，她成为首位凭自身成就入葬于此的女性。"}',
]

SITES = sorted({s for s, *_ in PAIRS}) + ["maxwell", "curie"]
SITES = sorted(set(SITES))


def sf(site):
    return "tools/spec_%s.py" % site


def main():
    problems = []
    for site, old, new, n, note in PAIRS:
        f = sf(site)
        if not os.path.isfile(f):
            problems.append("!! 缺文件 %s" % f); continue
        c = open(f, encoding="utf-8").read().count(old)
        if c != n:
            problems.append("!! %-26s [%s] 期望 %d 次，实际 %d 次" % (f, note, n, c))
    for f, needle, tag in [(sf("maxwell"), MAX_COLOR_OLD, "A10 color 节点"),
                           (sf("maxwell"), MAX_ANCHOR, "A10 eq1 锚点"),
                           (sf("curie"), CURIE_WAR, "B4 war 节点")]:
        if open(f, encoding="utf-8").read().count(needle) != 1:
            problems.append("!! %-26s [%s] 未精确命中 1 次" % (f, tag))
    if problems:
        print("❌ 校验未通过，未写入：")
        for p in problems:
            print("   " + p)
        sys.exit(1)
    print("✅ 规格校验通过：%d 条文本替换 + maxwell 移节点 + curie 补节点" % len(PAIRS))
    if DRY:
        print("（--dry：未写入）")
        return

    for site, old, new, n, note in PAIRS:
        f = sf(site)
        s = open(f, encoding="utf-8").read().replace(old, new)
        open(f, "w", encoding="utf-8").write(s)

    # A10 麦克斯韦：把彩色摄影节点从 1855 挪到 1861（紧跟在"方程组初成"之后，保持时间序）
    f = sf("maxwell")
    s = open(f, encoding="utf-8").read()
    # 该行后面还有别的节点，行尾带逗号 → 用正则容忍可选逗号
    s, k = re.subn(r'^[ \t]*' + re.escape(MAX_COLOR_OLD) + r',?[ \t]*\n', '', s, flags=re.M)
    assert k == 1, "maxwell color 节点删除数 = %d" % k
    m = re.search(r'^([ \t]*)' + re.escape(MAX_ANCHOR) + r'.*$', s, re.M)
    indent = m.group(1)
    s = s[:m.end()] + "\n" + indent + MAX_COLOR_NEW + "," + s[m.end():]
    open(f, "w", encoding="utf-8").write(s)

    # B4 居里：在 1914 节点后补 1934 / 1995 两个节点
    f = sf("curie")
    s = open(f, encoding="utf-8").read()
    m = re.search(r'^([ \t]*)' + re.escape(CURIE_WAR) + r'$', s, re.M)
    indent = m.group(1)
    ins = m.group(0) + ",\n" + ",\n".join(indent + x for x in CURIE_NEW)
    s = s[:m.start()] + ins + s[m.end():]
    open(f, "w", encoding="utf-8").write(s)

    print("✅ 已改写 %d 个 spec_*.py" % len(SITES))

    # 重新生成 .json（已验证 .json 与 .py 产物逐字一致）
    for site in SITES:
        f = sf(site)
        py_compile.compile(f, doraise=True)
        r = subprocess.run([PY, f], capture_output=True, text=True)
        if r.returncode != 0:
            print("   !! %s 生成失败: %s" % (f, r.stderr.strip()[:200])); sys.exit(1)
    print("✅ 已重新生成对应的 spec_*.json")

    # 校验
    print("\n--- 规格文件可解析性 ---")
    for site in SITES:
        py_compile.compile(sf(site), doraise=True)
        json.load(open("tools/spec_%s.json" % site, encoding="utf-8"))
    print("   ✅ %d 组 .py 编译通过、.json 解析通过" % len(SITES))

    print("\n--- 规格旧文案残留 ---")
    files = [sf(s) for s in SITES] + ["tools/spec_%s.json" % s for s in SITES]
    for p in ["118 种人工合成元素", "原子序数登场前夜", "逝于贫血", "适应 environment",
              "这正是行星近太阳时更快的原因", "这正是行星近太阳更快的原因",
              "发明的“炸弹机”", "老师惠勒的启发", '"year": 1855', '"year": 1854',
              '"cat": "电磁", "short": "法拉第发现的分子"']:
        hit = [os.path.basename(f) for f in files if p in open(f, encoding="utf-8").read()]
        print("   %-42s → %s" % (p[:40], "✅ 已清零" if not hit else "仍有: " + ", ".join(hit)))


if __name__ == "__main__":
    main()

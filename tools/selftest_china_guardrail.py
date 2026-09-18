# -*- coding: utf-8 -*-
"""变异自证：往生成产物里注入人造错误，确认 check_china_cards.py 真的拦得住。

三个变异分别对应三类只能靠这道护栏发现的静默失效：
  1. dup-ev  把别处的大事文本塞进另一个节点 → 「同站不重复」被破坏
  2. dup-fig 把别处的人物塞进另一个节点
  3. bad-term 把某处 data-term 改成一个不存在的 id → 点了没反应
  4. misalign 改动第一张卡片的年份 → 序号错位（页面照常渲染，但全部张冠李戴）
  5. shadow  把历史名词挂成站点术语库里已有的 id → 静默覆盖
"""
import json
import os
import shutil
import subprocess
import sys

sys.path.insert(0, "tools")
ROOT = os.path.abspath(".")
PY = sys.executable
TARGET = os.path.join(ROOT, "scientists", "copernicus", "assets", "js", "china.js")
CHECK = os.path.join(ROOT, "tools", "check_china_cards.py")


def run_check():
    p = subprocess.run([PY, CHECK], cwd=ROOT, capture_output=True, text=True)
    return p.returncode, p.stdout


def mutate(fn):
    """备份 → 改 → 跑校验 → 还原（无论成功失败都还原）。"""
    shutil.copy2(TARGET, TARGET + ".bak")
    try:
        src = open(TARGET, encoding="utf-8").read()
        open(TARGET, "w", encoding="utf-8").write(fn(src))
        return run_check()
    finally:
        shutil.move(TARGET + ".bak", TARGET)


def _cards(src):
    """取出 CARDS 的值 + 回写函数（避免每个变异各写一遍 raw_decode）。"""
    m = src.index("var CARDS = ") + len("var CARDS = ")
    cards, end = json.JSONDecoder().raw_decode(src, m)
    return cards, (lambda c: src[:m] + json.dumps(c, ensure_ascii=False) + src[end:])


def dup_ev(src):
    """把 B 节点的一条大事**替换**成 A 节点已有的一条 → 同一件事出现在两个节点。

    用替换而不是追加：追加会先撞上「每类 ≤3 条」的上限，那是另一条规则，
    测不到真正想测的「同站不重复」。
    """
    cards, put = _cards(src)
    have = [k for k, c in enumerate(cards) if c["e"]]
    cards[have[1]]["e"][0] = list(cards[have[0]]["e"][0])
    return put(cards)


def dup_fig(src):
    """同理，替换一条人物。

    别写死下标：不是每个节点都有人物行（人物池很薄，去重后更薄）。
    """
    cards, put = _cards(src)
    have = [k for k, c in enumerate(cards) if c["f"]]
    if len(have) < 2:
        raise SystemExit("！这个站点没有两个带人物行的节点，换一个站做变异")
    cards[have[1]]["f"][0] = list(cards[have[0]]["f"][0])
    return put(cards)


def bad_term(src):
    """把某一处的名词 id 改成不存在的 —— 在**解码后的字符串**上改。

    直接在源码文本上 replace 会静默不生效：china.js 是 JSON 序列化的，
    引号写成 \\"，于是 `data-term="x"` 这种字面量根本不存在（改了个寂寞，
    校验当然还是过的 —— 这正是「变异没生效」和「护栏漏报」长得一样的陷阱）。
    """
    cards, put = _cards(src)
    for c in cards:
        head = c.get("h") or ""
        if 'data-term="cn-nianhao"' in head:
            c["h"] = head.replace('data-term="cn-nianhao"',
                                  'data-term="cn-bu-cun-zai"', 1)
            return put(cards)
    raise SystemExit("！没找到可改的名词标记")


def misalign(src):
    cards, put = _cards(src)
    cards[0]["y"] = cards[0]["y"] + 1
    return put(cards)


def shadow(src):
    m = src.index("var TERMS = ") + len("var TERMS = ")
    terms, end = json.JSONDecoder().raw_decode(src, m)
    # 站点术语库里已有 heliocentrism，历史名词挂同名会静默覆盖它
    terms["heliocentrism"] = {"cat": "制度", "name": "冒名", "short": "x", "plain": "y", "extra": ""}
    return src[:m] + json.dumps(terms, ensure_ascii=False) + src[end:]


def main():
    rc, out = run_check()
    print("基准（未变异）: exit=%d %s" % (rc, out.strip().splitlines()[-1]))
    if rc != 0:
        print("！！基准就不过，先修好再谈变异测试")
        return 1

    cases = [
        ("dup-ev   重复大事", dup_ev),
        ("dup-fig  重复人物", dup_fig),
        ("bad-term 名词悬空", bad_term),
        ("misalign 序号错位", misalign),
        ("shadow   覆盖站点术语", shadow),
    ]
    ok = 0
    for name, fn in cases:
        rc, out = run_check()
        rc2, out2 = mutate(fn)
        hit = rc2 != 0
        detail = ""
        for line in out2.splitlines():
            if line.strip().startswith("-"):
                detail = line.strip()[2:]
                break
        print("%-22s → %s   %s" % (name, "拦住了 ✓" if hit else "漏了 ✗", detail[:60]))
        ok += 1 if hit else 0
    print()
    print("%d/%d 变异被拦下" % (ok, len(cases)))
    return 0 if ok == len(cases) else 1


if __name__ == "__main__":
    sys.exit(main())

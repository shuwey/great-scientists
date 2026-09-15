# -*- coding: utf-8 -*-
"""给 16 份样式表的 :root 追加 3 条「深色首屏」令牌（门户首页图标桌面用）。

为什么 16 份都加而不仅是门户：设计系统的不变量是 **16 份 :root 逐字节一致**
（已有 `--accent-wash-2` 这种「门户专用」令牌照样写进全部副本的先例）。
只加根目录那一份会把这个不变量打出一个 60 vs 58 的口子。

- 幂等：已存在即跳过（可重复运行）
- 守卫：先算「逆向还原」（把插入行删掉必须逐字节等于原文件），不通过就不落盘
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

FILES = [ROOT / "assets/css/style.css"] + sorted(
    (ROOT / "scientists").glob("*/assets/css/style.css")
)

ANCHOR_COLOR = "  --white          : #FFFFFF;\n"
ANCHOR_SHADOW = "  --shadow-l: 0 18px 50px rgba(27,37,48,.16);\n"

INS_COLOR = (
    "  --hero-bg        : #0E1219;   /* 深色首屏底（门户首页 · 图标桌面） */\n"
    "  --hero-bg-2      : #171E2B;   /* 深色首屏顶部渐亮端 */\n"
)
INS_SHADOW = "  --shadow-hero    : 0 12px 28px rgba(0, 0, 0, .5);   /* 深底图标浮起投影 */\n"

MARK = "--hero-bg        :"


def patch(text: str):
    """返回 (新文本, 状态)。status: 'skip' | 'ok'"""
    if MARK in text:
        return text, "skip"
    # --- 先验：两个锚点必须各出现一次 ---
    if text.count(ANCHOR_COLOR) != 1 or text.count(ANCHOR_SHADOW) != 1:
        return text, "anchor"
    new = text.replace(ANCHOR_COLOR, ANCHOR_COLOR + INS_COLOR, 1)
    new = new.replace(ANCHOR_SHADOW, ANCHOR_SHADOW + INS_SHADOW, 1)
    # --- 后写之前先做逆向还原校验（删掉插入行必须逐字节等于原文） ---
    back = new.replace(INS_COLOR, "", 1).replace(INS_SHADOW, "", 1)
    if back != text:
        return text, "guard"
    return new, "ok"


def main() -> int:
    ok = skip = 0
    for p in FILES:
        rel = p.relative_to(ROOT)
        text = p.read_text(encoding="utf-8")
        new, st = patch(text)
        if st == "anchor":
            print(f"  ✗ {rel}: 锚点缺失或重复，未改动")
            return 1
        if st == "guard":
            print(f"  ✗ {rel}: 逆向还原校验未通过，未改动")
            return 1
        if st == "skip":
            skip += 1
            continue
        p.write_text(new, encoding="utf-8")
        ok += 1
    print(f"  写入 {ok} 份 / 已存在跳过 {skip} 份 / 共 {len(FILES)} 份")

    # 复查：16 份 :root 令牌数必须一致
    counts = {}
    for p in FILES:
        t = p.read_text(encoding="utf-8")
        m = re.search(r":root\s*\{(.*?)\}", t, re.S)
        counts[p] = len(re.findall(r"(?m)^\s*--[a-z0-9-]+\s*:", m.group(1)))
    uniq = set(counts.values())
    print("  :root 声明数（首块）:", sorted(uniq), "→", "一致 ✅" if len(uniq) == 1 else "不一致 ❌")
    return 0 if len(uniq) == 1 else 1


if __name__ == "__main__":
    sys.exit(main())

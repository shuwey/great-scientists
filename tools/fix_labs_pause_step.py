#!/usr/bin/env python3
"""P1-3 修复：给"画面一直在自己动"的演示加 ⏸暂停 / ▶继续 / ⏭单步。

问题：全站 40 多段演示里，有一部分一打开页面就在自己跑（行星公转、波形推进、
图灵机走格、光点沿轨迹前进……）。老师想说"就停在这一帧，大家看这里"却按不住；
学生想对比"上一帧 / 这一帧"也做不到。速度滑块最小档也是 0.2×，停不下来。

做法（引擎级，一处改动全站受益）：
  1. 在 site.js 的 IIFE 里，把 window.requestAnimationFrame 套一层"闸门"：
     - 暂停：不再推进时间戳（冻结时钟），画面静止，但 rAF 链不断，随时可恢复；
     - 单步：把冻结的时钟往前推一帧（1000/60 ms），走一步再停住。
     闸门按 .lab 分别记账（回调里再排 rAF 时继承同一个 .lab 的归属），
     同一页上几个实验互不干扰；非实验的 rAF 调用（__labNow 为 null）原样放行。
  2. initLabs() 里给每个 .lab 建一条记录；只有**确实排过 rAF**（rec.used）
     的实验才注入按钮 —— 纯静态的图（元素周期表、穿透对比等）不会被塞按钮。
  3. 按钮插在 .lab-readout 之前。

幂等：文件里已有 __labAnims 标记就跳过。
用法：
  python3 tools/fix_labs_pause_step.py [--dry-run]
"""
import re
import sys
import glob
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DRY = "--dry-run" in sys.argv
REWRITE = "--rewrite" in sys.argv

SHIM_HEAD = '  /* ------------------------------------------------------------------ */\n  /* 动画闸门：'

SHIM = r'''  /* ------------------------------------------------------------------ */
  /* 动画闸门：让"画面一直在自己动"的演示能暂停 / 单步                     */
  /* ------------------------------------------------------------------ */
  /* 有些演示一打开就在自己跑（行星公转、波形推进、图灵机走格、光点沿轨迹前进……）。
     老师想说"就停在这一帧，大家看这里"却按不住；学生想对比上一帧 / 这一帧也做不到。
     这里在 requestAnimationFrame 外面套一层闸门：
       暂停 —— 干脆不驱动实验的绘制回调，只把 rAF 链自己续下去，画面必然定格。
              （只冻结时间戳拦不住图灵机这类实验：它每帧固定走几步，与 dt 无关。）
       单步 —— 放行一次绘制，并把时钟往前推一帧，走一步再停住。
       继续 —— 恢复后的第一帧也按"过了一帧"计时，避免暂停很久后画面跳一大步。
     闸门按 .lab 分别记账，同一页上几个实验互不影响。 */
  var __labNow = null;                  /* 正在初始化 / 正在驱动的 .lab 元素 */
  var __labAnims = [];                  /* [{lab, paused, step, clock, used, tools, resume}] */
  var __rafReal = window.requestAnimationFrame.bind(window);

  function __animTrack(lab) {
    var rec = { lab: lab, paused: false, step: false, clock: 0, used: false, tools: false, resume: false };
    __labAnims.push(rec);
    if (!__watchStarted) { __watchStarted = true; setTimeout(__animWatchdog, 1500); }
    return rec;
  }
  var __watchStarted = false;

  /* 兜底探测：有些实验要点了按钮才开始动（如牛顿抛体），初始化时排不到 rAF，
     闸门抓不住它们。这里对"还没有按钮"的实验做轻量探测——把画布缩到 16×16 比指纹，
     一旦发现它动起来了就补上按钮。只在确有未决实验时运行，最多约 4 分钟。 */
  function __animWatchdog() {
    var probe = document.createElement("canvas");
    probe.width = 16; probe.height = 16;
    var pctx = probe.getContext("2d");
    var ticks = 0;
    var timer = setInterval(function () {
      if (++ticks > 340) { clearInterval(timer); return; }
      if (document.hidden) return;
      var pending = false, i, r, cv, h, d, k;
      for (i = 0; i < __labAnims.length; i++) {
        r = __labAnims[i];
        if (r.tools || r.dead) continue;
        pending = true;
        cv = $("canvas", r.lab);
        if (!cv) { r.dead = true; continue; }
        h = 0;
        try {
          pctx.clearRect(0, 0, 16, 16);
          pctx.drawImage(cv, 0, 0, 16, 16);
          d = pctx.getImageData(0, 0, 16, 16).data;
          for (k = 0; k < d.length; k += 4) h = (h * 31 + d[k] + d[k + 1] * 3 + d[k + 2] * 7) | 0;
        } catch (e) { r.dead = true; continue; }
        if (r.probe !== undefined && r.probe !== h) { r.tools = true; __addAnimTools(r.lab, r); }
        r.probe = h;
      }
      if (!pending) clearInterval(timer);
    }, 700);
  }
  function __animOf(lab) {
    for (var i = 0; i < __labAnims.length; i++) if (__labAnims[i].lab === lab) return __labAnims[i];
    return null;
  }

  window.requestAnimationFrame = function (cb) {
    var owner = __labNow;
    var rec = owner ? __animOf(owner) : null;
    if (rec) {
      rec.used = true;
      /* 首次排 rAF 时才注入按钮：这样"打开就在跑"的实验立刻有按钮，
         "点了发射才开始跑"的实验（如牛顿抛体）也会在启动那一刻拿到按钮。 */
      if (!rec.tools) { rec.tools = true; __addAnimTools(rec.lab, rec); }
    }
    function tick(ts) {
      var back = __labNow;
      __labNow = owner;                 /* 回调里再排 rAF 时，归属同一个实验 */
      try {
        if (!rec) { cb(ts); return; }                 /* 非实验的 rAF：原样放行 */
        if (rec.paused && !rec.step) {
          __rafReal(tick);                            /* 暂停：不驱动绘制，只续住链条 */
          return;
        }
        if (rec.step) {                               /* 单步：时钟 +1 帧，放行一次 */
          rec.step = false; rec.clock += 1000 / 60; cb(rec.clock); return;
        }
        var t2;
        if (rec.resume) {                             /* 刚恢复：按"过了一帧"接着走 */
          rec.resume = false; rec.clock += 1000 / 60; t2 = rec.clock;
        } else { rec.clock = ts; t2 = ts; }
        cb(t2);
      } finally { __labNow = back; }
    }
    return __rafReal(tick);
  };

  function __addAnimTools(lab, rec) {
    if ($(".lab-anim-tools", lab)) return;   /* 已经加过就不再重复（闸门与 initLabs 都可能触发） */
    var box = document.createElement("div");
    box.className = "lab-anim-tools";
    box.innerHTML = '<button type="button" class="lab-anim-btn" data-anim="toggle" title="暂停 / 继续这段动画">⏸ 暂停</button>' +
                    '<button type="button" class="lab-anim-btn" data-anim="step" title="画面暂停时，向前走一帧">⏭ 单步</button>' +
                    '<span class="lab-anim-tip">暂停后按「单步」可逐帧对照</span>';
    var btnToggle = $('[data-anim="toggle"]', box);
    var btnStep = $('[data-anim="step"]', box);
    function sync() {
      btnToggle.textContent = rec.paused ? "▶ 继续" : "⏸ 暂停";
      btnToggle.classList.toggle("on", rec.paused);
      box.classList.toggle("paused", rec.paused);
    }
    btnToggle.addEventListener("click", function () {
      rec.paused = !rec.paused;
      if (!rec.paused) rec.resume = true;
      sync();
    });
    btnStep.addEventListener("click", function () {
      if (!rec.paused) { rec.paused = true; sync(); }  /* 没暂停就先按下去，再走一帧 */
      rec.step = true;
    });
    var anchor = $(".lab-readout", lab);
    if (anchor && anchor.parentNode === lab) lab.insertBefore(box, anchor);
    else lab.appendChild(box);
  }

'''

# 匹配 initLabs 的整段：捕获 (1) 头部到 var kind 行, (2) 分发语句, (3) 收尾
# 缩进放宽（galileo 的 initLabs 顶格写，收尾又是 4/2 空格）
PAT = re.compile(
    r'( *function initLabs\(\) \{\n'
    r' *\$\$\("\.lab"\)\.forEach\(function \(lab\) \{\n'
    r' *var kind = lab\.getAttribute\("data-lab"\);\n)'
    r'(.*?)'
    r'(\n *\}\);\n *\})',
    re.S,
)


OLD_INIT_CALL = "      if (rec.used) __addAnimTools(lab, rec);"
NEW_INIT_CALL = "      if (rec.used && !rec.tools) __addAnimTools(lab, rec);"


def fix_initlabs_line(s: str) -> str:
    """老版本 initLabs 里的注入调用加上 tools 判断，避免与闸门重复注入。"""
    return s.replace(OLD_INIT_CALL, NEW_INIT_CALL)


def patch(path: str) -> str:
    src = open(path, encoding="utf-8").read()
    if "__labAnims" in src:
        if not REWRITE:
            return "skip(已打过)"
        # --rewrite：把旧闸门整段换成新闸门（initLabs 已打过就不再动）
        i = src.find(SHIM_HEAD)
        j = src.find("  function initLabs() {", i)
        if i < 0 or j < 0:
            return "FAIL(找不到旧闸门边界)"
        out = fix_initlabs_line(src[:i] + SHIM + src[j:])
        if DRY:
            return "OK(rewrite dry)"
        open(path, "w", encoding="utf-8").write(out)
        return "OK(rewrite)"

    m = PAT.search(src)
    if not m:
        return "FAIL(initLabs 结构与预期不符)"

    dispatch = m.group(2)
    # 分发语句整体多缩进 2 空格，放进 try 里
    indented = "\n".join(("  " + ln) if ln.strip() else ln for ln in dispatch.split("\n"))

    new_init = (
        "  function initLabs() {\n"
        "    $$(\".lab\").forEach(function (lab) {\n"
        "      var kind = lab.getAttribute(\"data-lab\");\n"
        "      var rec = __animTrack(lab);\n"
        "      __labNow = lab;              /* 这段里排的 rAF 都记在这个实验头上 */\n"
        "      try {\n"
        + indented + "\n"
        "      } finally { __labNow = null; }\n"
        "      if (rec.used && !rec.tools) __addAnimTools(lab, rec);\n"
        "    });\n"
        "  }"
    )

    # 闸门代码插在 initLabs 之前，一次拼好
    out = fix_initlabs_line(src[:m.start()] + SHIM + new_init + src[m.end():])

    if DRY:
        return "OK(dry)"
    open(path, "w", encoding="utf-8").write(out)
    return "OK"


def main():
    files = sorted(glob.glob(os.path.join(ROOT, "scientists", "*", "assets", "js", "site.js")))
    ok = 0
    for f in files:
        st = patch(f)
        if st.startswith("OK"):
            ok += 1
        print(f"  {os.path.relpath(f, ROOT):<48} {st}")
    print(f"\n共 {len(files)} 个 site.js，改动 {ok} 个" + ("（dry-run，未写盘）" if DRY else ""))


if __name__ == "__main__":
    main()

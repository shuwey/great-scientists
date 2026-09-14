#!/usr/bin/env python3
"""修复：术语弹窗「了解更多」点了没反应。

根因：术语多数指向它所属的那个详解页，而用户往往正读着那一页。
同址跳转浏览器"原地不动"，同时弹窗仍盖在页面上、body 还被锁着滚动 ——
三件事叠起来，用户看到的就是"点了没反应"。

改法：点「了解更多」时先关弹窗（解除遮挡 + 释放滚动锁）；
若目标就是当前页，再手动滚到锚点并同步地址栏。

16 份 site.js 的这段代码逐字节相同，故用精确整段替换。幂等。
用法：python3 tools/fix_term_go_link.py [--apply]
"""
import hashlib
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
APPLY = "--apply" in sys.argv

OLD = '''  function closeModal() {
    if (!mask) return;
    mask.classList.remove("show");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener("click", function (e) {
    var el = e.target.closest ? e.target.closest(".term, .chip, [data-term]") : null;
    if (!el) return;
    e.preventDefault();
    openTerm(el.getAttribute("data-term"));
  });'''

NEW = '''  function closeModal(skipFocus) {
    if (!mask) return;
    mask.classList.remove("show");
    document.body.style.overflow = "";
    if (!skipFocus && lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener("click", function (e) {
    var t = e.target;

    /* 弹窗里的「了解更多」：术语多半指向它自己所属的那个详解页，
       而读者常常正停在那一页。此时浏览器对同址跳转"原地不动"，
       弹窗又仍盖在页面上、body 还锁着滚动 —— 合起来就是"点了没反应"。
       所以先关弹窗（撤掉遮挡、放开滚动），同页再手动滚到锚点。 */
    var go = t.closest ? t.closest(".modal-foot a.go") : null;
    if (go) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return; // 让"新标签打开"走原生
      var parts = go.href.split("#");
      closeModal(true);
      if (parts[0] === location.href.split("#")[0]) {
        e.preventDefault();
        var node = parts[1] ? document.getElementById(decodeURIComponent(parts[1])) : null;
        if (node) node.scrollIntoView({ behavior: "smooth", block: "start" });
        else window.scrollTo({ top: 0, behavior: "smooth" });
        try { history.replaceState(null, "", go.getAttribute("href")); } catch (err) {}
      }
      return;
    }

    var el = t.closest ? t.closest(".term, .chip, [data-term]") : null;
    if (!el) return;
    e.preventDefault();
    openTerm(el.getAttribute("data-term"));
  });'''

files = [ROOT / "assets/js/site.js"] + sorted(ROOT.glob("scientists/*/assets/js/site.js"))
print(f"目标 {len(files)} 份 site.js\n")
print(f"旧段 md5 = {hashlib.md5(OLD.encode()).hexdigest()[:12]}（应为 c3b3f0225787）\n")

hit, skip_new, miss = [], [], []
for f in files:
    src = f.read_text(encoding="utf-8")
    if NEW in src:
        skip_new.append(f)
        continue
    n = src.count(OLD)
    if n != 1:
        miss.append((f, n))
        continue
    if APPLY:
        f.write_text(src.replace(OLD, NEW, 1), encoding="utf-8")
    hit.append(f)

for f in hit:
    print(f"   {'✓ 已改' if APPLY else '· 待改'} {f.relative_to(ROOT)}")
for f in skip_new:
    print(f"   = 已是新版（跳过）{f.relative_to(ROOT)}")
for f, n in miss:
    print(f"   ✗ 旧段命中 {n} 次（异常）{f.relative_to(ROOT)}")

print(f"\n命中 {len(hit)} · 已是新版 {len(skip_new)} · 异常 {len(miss)}")
if not APPLY:
    print("（预演，未写入；加 --apply 执行）")
sys.exit(1 if miss else 0)

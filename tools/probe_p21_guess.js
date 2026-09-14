/**
 * P2-1 实测探针：45 条"先猜一猜"是否真的落到页面上、可读、不挤坏版面
 *
 * 判据：
 *   ① 15 站 × 3 实验 = 45 处 .lab-guess，每个 .lab 恰好 1 处；
 *   ② 文案以"先猜一猜："开头，含问号（可验证的猜想，不是陈述）；
 *   ③ 实际可见（offsetHeight > 0）且与上方 .lab-desc 不重叠、与画布不重叠；
 *   ④ 文字与底色对比度 ≥ 4.5（WCAG AA 正文），实测计算而非照抄色值。
 *
 * 用法：node tools/probe_p21_guess.js
 */
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const OUT = '/Users/shuwei/WorkBuddy/读懂牛顿-验证产物/labs-anim/p2';
const PORT = 8153;
const BASE = `http://localhost:${PORT}`;
const PY = '/Users/shuwei/.workbuddy/binaries/python/versions/3.13.12/bin/python3';
const VW = 1600;
const IDS = ["copernicus","galileo","kepler","newton","faraday","darwin","pasteur","maxwell",
             "mendeleev","curie","einstein","bohr","turing","feynman","hawking"];

const waitServer = () => new Promise((res, rej) => {
  const t0 = Date.now();
  const tick = () => http.get(`${BASE}/index.html`, (r) => { r.destroy(); res(); })
    .on('error', () => (Date.now() - t0 > 15000 ? rej(new Error('server timeout')) : setTimeout(tick, 300)));
  tick();
});

function scan() {
  const lum = (r, g, b) => {
    const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const parse = (s) => (s.match(/[0-9.]+/g) || []).slice(0, 3).map(Number);
  const ratio = (a, b) => {
    const L1 = lum.apply(null, a), L2 = lum.apply(null, b);
    const hi = Math.max(L1, L2), lo = Math.min(L1, L2);
    return (hi + 0.05) / (lo + 0.05);
  };
  const labs = [].slice.call(document.querySelectorAll('.lab'));
  const rows = labs.map((lab) => {
    const g = lab.querySelectorAll('.lab-guess');
    const el = g[0];
    const d = lab.querySelector('.lab-desc');
    const cv = lab.querySelector('canvas');
    if (!el) return { lab: lab.getAttribute('data-lab'), miss: true };
    const cs = getComputedStyle(el);
    const bd = cs.backgroundColor;
    /* 底色可能是半透明/继承 → 沿祖先找第一个不透明背景 */
    let bgEl = el, bg = bd;
    while (bgEl && (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')) { bgEl = bgEl.parentElement; if (bgEl) bg = getComputedStyle(bgEl).backgroundColor; }
    const fgA = parse(cs.color), bgA = parse(bg || 'rgb(255,255,255)');
    const gr = el.getBoundingClientRect(), dr = d ? d.getBoundingClientRect() : null;
    const cr = cv ? cv.getBoundingClientRect() : null;
    return {
      lab: lab.getAttribute('data-lab'),
      n: g.length,
      text: el.textContent.trim(),
      h: Math.round(gr.height),
      vis: gr.height > 6 && cs.display !== 'none' && cs.visibility !== 'hidden',
      overlapsDesc: dr ? !(gr.top >= dr.bottom - 0.6 || gr.bottom <= dr.top + 0.6) : false,
      overlapsCanvas: cr ? !(gr.top >= cr.bottom - 0.6 || gr.bottom <= cr.top + 0.6) : false,
      contrast: +ratio(fgA, bgA).toFixed(2),
      bg: bg, fg: cs.color
    };
  });
  return { labs: rows };
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const srv = spawn(PY, ['-m', 'http.server', String(PORT), '--directory', ROOT], { stdio: 'ignore' });
  const errs = [];
  let browser = null;
  try {
    await waitServer();
    browser = await chromium.launch();
    const pg = await browser.newPage({ viewport: { width: VW, height: 1200 }, deviceScaleFactor: 1 });
    pg.setDefaultTimeout(20000);
    pg.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
    pg.on('console', (m) => { if (m.type() === 'error') errs.push('console.error: ' + m.text()); });

    let totLab = 0, totGuess = 0, badText = [], badVis = [], badOv = [], lowC = [], dup = [], miss = [];
    for (const sid of IDS) {
      await pg.goto(`${BASE}/scientists/${sid}/labs.html`, { waitUntil: 'load' });
      await pg.waitForTimeout(160);
      const r = await pg.evaluate(scan);
      const labs = r.labs;
      totLab += labs.length;
      const ng = labs.filter((x) => !x.miss).reduce((s, x) => s + x.n, 0);
      totGuess += ng;
      const worst = labs.filter((x) => !x.miss).reduce((m, x) => Math.min(m, x.contrast), 99);
      console.log(`  ${sid.padEnd(11)} 实验 ${labs.length} · 猜一猜 ${ng}` +
        ` · 最低对比度 ${worst.toFixed(2)}` +
        (labs.every((x) => !x.miss && x.n === 1) ? ' ✅' : ' ❌'));
      for (const x of labs) {
        if (x.miss) { miss.push(sid + '/' + x.lab); continue; }
        if (x.n !== 1) dup.push(`${sid}/${x.lab} ×${x.n}`);
        if (!/^先猜一猜：/.test(x.text) || !/[？?]/.test(x.text)) badText.push(sid + '/' + x.lab);
        if (!x.vis) badVis.push(sid + '/' + x.lab);
        if (x.overlapsDesc || x.overlapsCanvas) badOv.push(sid + '/' + x.lab);
        if (x.contrast < 4.5) lowC.push(`${sid}/${x.lab} ${x.contrast}`);
      }
    }
    console.log('\n== 汇总 ==');
    console.log(`  实验总数 ${totLab} · 猜一猜块总数 ${totGuess}  →  ${totLab === 45 && totGuess === 45 ? '✅ 45/45' : '❌'}`);
    console.log(`  缺少块：${miss.length ? '❌ ' + miss.join(', ') : '✅ 0'}`);
    console.log(`  重复注入：${dup.length ? '❌ ' + dup.join(', ') : '✅ 0'}`);
    console.log(`  文案不合规（非"先猜一猜："或不含问号）：${badText.length ? '❌ ' + badText.join(', ') : '✅ 0'}`);
    console.log(`  不可见：${badVis.length ? '❌ ' + badVis.join(', ') : '✅ 0'}`);
    console.log(`  与说明/画布重叠：${badOv.length ? '⚠️ ' + badOv.join(', ') : '✅ 0'}`);
    console.log(`  对比度 < 4.5：${lowC.length ? '❌ ' + lowC.join(', ') : '✅ 0'}`);
    const s = (await pg.evaluate(scan)).labs.find((x) => !x.miss);
    if (s) console.log(`  抽样样式：${s.fg} on ${s.bg} = ${s.contrast}:1`);
    console.log('  运行时报错：' + (errs.length ? '❌ ' + errs.length + ' 条\n    ' + errs.join('\n    ') : '✅ 0 条'));

    await pg.goto(`${BASE}/scientists/newton/labs.html`, { waitUntil: 'load' });
    await pg.waitForTimeout(300);
    const el = await pg.$('.lab[data-lab="prism"]');
    if (el) await el.screenshot({ path: `${OUT}/p21_guess_newton_prism.png` });
    console.log('  截图：' + OUT + '/p21_guess_newton_prism.png');
  } catch (e) {
    console.log('探针异常：' + e.message + '\n' + (errs.length ? errs.join('\n') : ''));
  } finally {
    /* 必须显式关浏览器：只 srv.kill() 的话 chromium 子进程还活着，node 会一直挂着不退出
       （这个坑让上一版探针空跑了 14 分钟没有任何输出）。 */
    try { if (typeof browser !== 'undefined' && browser) await browser.close(); } catch (e) { /* ignore */ }
    try { srv.kill('SIGKILL'); } catch (e) { /* ignore */ }
    setTimeout(() => process.exit(0), 100);
  }
})();

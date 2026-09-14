/**
 * P2-2 取数探针：逐实验量出"画布上真实用到的颜色"与"画布内真实字号"
 *
 * ① 颜色：把每个实验的画布像素做粗量化统计，排除背景色，输出占比最高的几种颜色
 *         及它们的水平重心（cx 用 0~1 表示偏左/偏右），作为写迷你图例的依据。
 *         —— 图例里的色块必须来自实测，不能凭读代码猜。
 * ② 字号：劫持 CanvasRenderingContext2D.fillText 记录每次实际绘制的字号，
 *         用于核对"坐标刻度是否过小"。注意画布内字号是**逻辑坐标 px**，
 *         真实屏效 = 逻辑字号 × ctx.scale(k)（k≈1.3），比较前必须乘上 k。
 *
 * 用法：node tools/probe_lab_palette.js
 */
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const OUT = '/Users/shuwei/WorkBuddy/读懂牛顿-验证产物/labs-anim/p2';
const PORT = 8145;
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

/* 记录每次 fillText 的字号（初始化脚本，页面加载前注入） */
const HOOK = () => {
  window.__fonts = [];
  const p = CanvasRenderingContext2D.prototype;
  const orig = p.fillText;
  p.fillText = function (txt, x, y) {
    try {
      const m = /([0-9.]+)px/.exec(this.font || '');
      if (m) window.__fonts.push({ px: parseFloat(m[1]), t: String(txt).slice(0, 18) });
    } catch (e) {}
    return orig.apply(this, arguments);
  };
};

function scan() {
  const hex = (r, g, b) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
  const out = [];
  const labs = [].slice.call(document.querySelectorAll('.lab'));
  for (const lab of labs) {
    const cv = lab.querySelector('canvas');
    if (!cv) { out.push({ lab: lab.getAttribute('data-lab'), err: 'no canvas' }); continue; }
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    let img;
    try { img = ctx.getImageData(0, 0, W, H); } catch (e) { out.push({ lab: lab.getAttribute('data-lab'), err: e.message }); continue; }
    const d = img.data;
    const tally = {}, cxSum = {}, cySum = {};
    for (let y = 0; y < H; y += 2) {
      for (let x = 0; x < W; x += 2) {
        const i = (y * W + x) * 4;
        if (d[i + 3] < 200) continue;
        const k = hex(d[i] & 0xf0, d[i + 1] & 0xf0, d[i + 2] & 0xf0);
        tally[k] = (tally[k] || 0) + 1;
        cxSum[k] = (cxSum[k] || 0) + x / W;
        cySum[k] = (cySum[k] || 0) + y / H;
      }
    }
    const tot = Object.keys(tally).reduce((s, k) => s + tally[k], 0) || 1;
    const top = Object.keys(tally).sort((a, b) => tally[b] - tally[a]).slice(0, 6)
      .map((k) => ({ c: k, pct: +(tally[k] / tot * 100).toFixed(1), cx: +(cxSum[k] / tally[k]).toFixed(2), cy: +(cySum[k] / tally[k]).toFixed(2) }));
    out.push({ lab: lab.getAttribute('data-lab'), W, H, clientW: cv.clientWidth, top });
  }
  return { labs: out, fonts: (window.__fonts || []).slice(-4000) };
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const srv = spawn(PY, ['-m', 'http.server', String(PORT), '--directory', ROOT], { stdio: 'ignore' });
  const errs = [];
  try {
    await waitServer();
    const browser = await chromium.launch();
    const pg = await browser.newPage({ viewport: { width: VW, height: 1200 }, deviceScaleFactor: 1 });
    pg.setDefaultTimeout(20000);
    await pg.addInitScript(HOOK);
    pg.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
    pg.on('console', (m) => { if (m.type() === 'error') errs.push('console.error: ' + m.text()); });

    const allFonts = [];
    for (const sid of IDS) {
      await pg.goto(`${BASE}/scientists/${sid}/labs.html`, { waitUntil: 'load' });
      await pg.waitForTimeout(1000);
      const r = await pg.evaluate(scan);
      console.log(`\n===== ${sid} =====`);      for (const L of r.labs) {
        if (L.err) { console.log(`  ${L.lab}: ❌ ${L.err}`); continue; }
        console.log(`  [${L.lab}] 画布 ${L.W}×${L.H}`);
        console.log('      ' + L.top.map((t) => `${t.c} ${String(t.pct).padStart(4)}% cx${t.cx}`).join(' | '));
      }
      const sizes = {};
      for (const f of r.fonts) sizes[f.px] = (sizes[f.px] || 0) + 1;
      const keys = Object.keys(sizes).map(Number).sort((a, b) => a - b);
      const kk = r.labs.length ? r.labs[0].W / r.labs[0].clientW : 1;
      console.log(`  字号（逻辑px → 屏效×${kk.toFixed(2)}）：` +
        keys.map((s) => `${s}(→${(s * kk).toFixed(1)})×${sizes[s]}`).join(' '));
      allFonts.push({ sid, sizes, k: kk });
    }
    const small = [];
    for (const a of allFonts) for (const s of Object.keys(a.sizes).map(Number)) if (s * a.k < 12) small.push(`${a.sid}:${s}px→${(s * a.k).toFixed(1)}`);
    console.log('\n== 汇总 ==');
    console.log(`  屏效字号 < 12px 的：${small.length ? '⚠️ ' + small.join(', ') : '✅ 无'}`);
    console.log('  运行时报错：' + (errs.length ? '❌ ' + errs.length + ' 条\n    ' + errs.join('\n    ') : '✅ 0 条'));
  } catch (e) {
    console.log('探针异常：' + e.message);
  } finally {
    srv.kill();
  }
})();

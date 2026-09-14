/**
 * 探针：canvas 逻辑尺寸 vs 屏幕显示尺寸 —— 判断画面是否被非等比拉伸
 *
 * 背景：各实验画布用 setupCanvas(cv, ratio) 设 cv.style.height = clientWidth*ratio，
 * 但 CSS 里 .lab canvas 有 max-height（本套样式为 360px）。当 clientWidth*ratio > max-height 时，
 * 高度被 CSS 截断而宽度仍是 100% → 画面纵向被压扁（圆变扁椭圆、正弦被压低）。
 *
 * 用法：node tools/probe_canvas_ratio.js [viewportWidth] [id1,id2,...]
 */
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8134;
const BASE = `http://localhost:${PORT}`;
const PY = '/Users/shuwei/.workbuddy/binaries/python/versions/3.13.12/bin/python3';
const VW = Number(process.argv[2] || 1280);
const IDS = (process.argv[3] || 'newton,bohr,turing,kepler,galileo').split(',');

const waitServer = () => new Promise((res, rej) => {
  const t0 = Date.now();
  const tick = () => http.get(`${BASE}/index.html`, (r) => { r.destroy(); res(); })
    .on('error', () => (Date.now() - t0 > 15000 ? rej(new Error('timeout')) : setTimeout(tick, 300)));
  tick();
});

(async () => {
  const srv = spawn(PY, ['-m', 'http.server', String(PORT), '--directory', ROOT], { stdio: 'ignore' });
  try {
    await waitServer();
    const browser = await chromium.launch();
    const pg = await browser.newPage({ viewport: { width: VW, height: 1000 } });
    for (const id of IDS) {
      await pg.goto(`${BASE}/scientists/${id}/labs.html`, { waitUntil: 'networkidle' });
      await pg.waitForTimeout(500);
      const rows = await pg.$$eval('.lab', (els) => els.map((el) => {
        const c = el.querySelector('canvas');
        if (!c) return { lab: el.getAttribute('data-lab'), none: true };
        const cs = getComputedStyle(c);
        return {
          lab: el.getAttribute('data-lab'),
          backing: `${c.width}×${c.height}`,
          styleH: c.style.height,
          maxH: cs.maxHeight,
          client: `${c.clientWidth}×${c.clientHeight}`,
          layoutRatio: +(c.clientHeight / c.clientWidth).toFixed(3),
          backingRatio: +(c.height / c.width).toFixed(3),
        };
      }));
      console.log(`\n── ${id}（视口 ${VW}px）`);
      for (const r of rows) {
        if (r.none) { console.log(`   ${r.lab}: 无 canvas`); continue; }
        const distort = Math.abs(r.layoutRatio - r.backingRatio) / r.backingRatio;
        console.log(`   ${String(r.lab).padEnd(11)} backing=${r.backing.padEnd(11)} style.height=${String(r.styleH).padEnd(7)} max=${String(r.maxH).padEnd(7)} 屏幕=${r.client.padEnd(11)}` +
          ` 逻辑比例=${r.backingRatio} 显示比例=${r.layoutRatio}  ${distort > 0.02 ? `⚠️ 纵向畸变 ${(distort * 100).toFixed(0)}%` : 'ok'}`);
      }
    }
    await browser.close();
  } catch (e) { console.error('❌', e.message); } finally { srv.kill(); }
})();

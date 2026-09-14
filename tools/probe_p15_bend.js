/**
 * P1-5 实测探针
 * ① 爱因斯坦「引力弯曲光线」：把质量滑块从 1 拖到 50，逐档量出橙色光线轨迹
 *    在画布内的真实像素包围盒，确认它**始终留在画布内**（不再冲出底边），
 *    并量出末端相对灰色虚线参照线的下垂量（= 偏折肉眼是否可见）。
 * ② 霍金「光线经过黑洞」：把瞄准距离从 0.6 拖到 7，确认白色虚线参照线存在。
 * 全程捕获 pageerror / console.error。
 *
 * 用法：node tools/probe_p15_bend.js
 */
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const OUT = '/Users/shuwei/WorkBuddy/读懂牛顿-验证产物/labs-anim/p15';
const PORT = 8141;
const BASE = `http://localhost:${PORT}`;
const PY = '/Users/shuwei/.workbuddy/binaries/python/versions/3.13.12/bin/python3';
const VW = 1600;

const waitServer = () => new Promise((res, rej) => {
  const t0 = Date.now();
  const tick = () => http.get(`${BASE}/index.html`, (r) => { r.destroy(); res(); })
    .on('error', () => (Date.now() - t0 > 15000 ? rej(new Error('server timeout')) : setTimeout(tick, 300)));
  tick();
});

/* 在页面里量：按颜色找像素包围盒。注意必须是真函数（字符串会被当表达式求值，args 传不进去）。 */
function measure(args) {
  const { labSel, ctrl, value, colors } = args;
  return new Promise((resolve) => {
    const lab = document.querySelector(labSel);
    if (!lab) return resolve({ err: 'no lab ' + labSel });
    const input = lab.querySelector('[data-ctrl="' + ctrl + '"]');
    if (input) {
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const cv = lab.querySelector('canvas');
      const ctx = cv.getContext('2d');
      let img;
      try { img = ctx.getImageData(0, 0, cv.width, cv.height); }
      catch (e) { return resolve({ err: 'getImageData: ' + e.message }); }
      const d = img.data, W = cv.width, H = cv.height;
      const stat = colors.map(() => ({ n: 0, minX: 1e9, maxX: -1, minY: 1e9, maxY: -1, rows: {} }));
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4;
          const a = d[i + 3];
          if (a < 200) continue;
          const r = d[i], g = d[i + 1], b = d[i + 2];
          for (let c = 0; c < colors.length; c++) {
            const t = colors[c];
            if (Math.abs(r - t[0]) <= t[3] && Math.abs(g - t[1]) <= t[3] && Math.abs(b - t[2]) <= t[3]) {
              const s = stat[c];
              s.n++;
              if (x < s.minX) s.minX = x; if (x > s.maxX) s.maxX = x;
              if (y < s.minY) s.minY = y; if (y > s.maxY) s.maxY = y;
              s.rows[y] = (s.rows[y] || 0) + 1;
            }
          }
        }
      }
      const out = {
        W: cv.width, H: cv.height, clientW: cv.clientWidth,
        readout: ((lab.querySelector('.lab-readout') || {}).textContent || '').trim(),
        vspan: ((lab.querySelector('.ctrl .v') || {}).textContent || '').trim(),
        bands: stat.map((s) => {
          if (!s.n) return { n: 0 };
          // 找像素最多的那一行 = 参照线所在行
          let bestY = -1, bestN = -1;
          for (const k in s.rows) { if (s.rows[k] > bestN) { bestN = s.rows[k]; bestY = +k; } }
          return { n: s.n, minX: s.minX, maxX: s.maxX, minY: s.minY, maxY: s.maxY, modeY: bestY, modeN: bestN };
        })
      };
      resolve(out);
    }));
  });
}

const BEND = { labSel: '.lab[data-lab="bend"]', ctrl: 'mass', colors: [
  [232, 89, 12, 30],   // #E8590C 光线
  [154, 167, 190, 20]  // #9AA7BE 灰色虚线参照
] };
const ORBIT = { labSel: '.lab[data-lab="orbit"]', ctrl: 'aim', colors: [
  [255, 255, 255, 10]  // 白色系
] };

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const srv = spawn(PY, ['-m', 'http.server', String(PORT), '--directory', ROOT], { stdio: 'ignore' });
  const errs = [];
  try {
    await waitServer();
    const browser = await chromium.launch();
    const pg = await browser.newPage({ viewport: { width: VW, height: 1200 }, deviceScaleFactor: 1 });
    pg.setDefaultTimeout(20000);
    pg.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
    pg.on('console', (m) => { if (m.type() === 'error') errs.push('console.error: ' + m.text()); });

    await pg.goto(`${BASE}/scientists/einstein/labs.html`, { waitUntil: 'load' });
    await pg.waitForTimeout(900);
    console.log('== ① 爱因斯坦 · 引力弯曲光线（画布 ' + VW + 'px 视口） ==');
    let head = true;
    for (const m of [1, 5, 10, 20, 25, 30, 40, 50]) {
      const r = await pg.evaluate(measure, { ...BEND, value: String(m) });
      if (!r || r.err) { console.log('  m=' + m + ' ❌ ' + (r && r.err)); continue; }
      if (head) { console.log('  量测用画布 ' + r.W + '×' + r.H + ' 逻辑px（dpr=1）'); head = false; }
      const ray = r.bands[0], ref = r.bands[1];
      const clear = r.H - ray.maxY;
      const droop = ray.maxY - ref.maxY;
      const flag = clear < 6 ? ' ❌贴边/出界' : (clear < 20 ? ' ⚠️很近' : ' ✅');
      console.log('  m=' + String(m).padStart(2) +
        ' 光线 x[' + String(ray.minX).padStart(3) + ',' + String(ray.maxX).padStart(3) + ']' +
        ' y[' + String(ray.minY).padStart(3) + ',' + String(ray.maxY).padStart(3) + ']' +
        ' 距底边 ' + String(clear).padStart(3) + 'px' + flag +
        ' | 虚线参照行 y=' + ref.modeY + '(该行' + ref.modeN + 'px)' +
        ' | 光线末端下垂 ' + String(droop).padStart(3) + 'px');
      console.log('       ' + r.vspan + '  →  ' + r.readout.slice(0, 84));
    }
    for (const m of [1, 25, 50]) {
      await pg.evaluate(measure, { ...BEND, value: String(m) });
      await pg.waitForTimeout(220);
      await pg.locator('.lab[data-lab="bend"]').screenshot({ path: path.join(OUT, `einstein_bend_m${m}.png`) });
    }

    await pg.goto(`${BASE}/scientists/hawking/labs.html`, { waitUntil: 'load' });
    await pg.waitForTimeout(900);
    console.log('\n== ② 霍金 · 光线经过黑洞（白色像素 = 参照虚线 + 图例文字） ==');
    for (const a of [0.6, 1.5, 2.6, 3.5, 5, 7]) {
      const r = await pg.evaluate(measure, { ...ORBIT, value: String(a) });
      if (!r || r.err) { console.log('  aim=' + a + ' ❌ ' + (r && r.err)); continue; }
      const w = r.bands[0];
      const expectY = Math.round(200 - a * 22);
      console.log('  aim=' + String(a).padStart(4) +
        ' 白像素 n=' + String(w.n).padStart(6) +
        ' 分布 y[' + w.minY + ',' + w.maxY + ']' +
        ' 最长白行 y=' + w.modeY + '(该行' + w.modeN + 'px) 参照线应在 y≈' + expectY);
      console.log('       ' + r.readout.slice(0, 84));
    }
    for (const a of [0.6, 2.6, 7]) {
      await pg.evaluate(measure, { ...ORBIT, value: String(a) });
      await pg.waitForTimeout(220);
      await pg.locator('.lab[data-lab="orbit"]').screenshot({ path: path.join(OUT, `hawking_orbit_a${a}.png`) });
    }

    await browser.close();
    console.log('\n== 运行时错误 ==');
    console.log(errs.length ? errs.join('\n') : '  ✅ 无 pageerror / console.error');
    console.log('✅ 截图已写入 ' + OUT);
  } catch (e) { console.error('❌', e.message); } finally { srv.kill(); }
})();

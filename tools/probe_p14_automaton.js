/**
 * P1-4 实测探针：图灵「一维元胞自动机」
 * ① 黑格图案是否水平居中（按实际占用范围居中后，图案中心应≈画布中心）
 * ② 退化规则（255 全填满 / 0 空白）是否出现"说人话"的说明牌
 * ③ 规则预设按钮是否生效
 * 用法：node tools/probe_p14_automaton.js
 */
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const OUT = '/Users/shuwei/WorkBuddy/读懂牛顿-验证产物/labs-anim/p14';
const PORT = 8143;
const BASE = `http://localhost:${PORT}`;
const PY = '/Users/shuwei/.workbuddy/binaries/python/versions/3.13.12/bin/python3';
const VW = 1600;

const waitServer = () => new Promise((res, rej) => {
  const t0 = Date.now();
  const tick = () => http.get(`${BASE}/index.html`, (r) => { r.destroy(); res(); })
    .on('error', () => (Date.now() - t0 > 15000 ? rej(new Error('server timeout')) : setTimeout(tick, 300)));
  tick();
});

function measure(args) {
  const { rule, clickPreset } = args;
  return new Promise((resolve) => {
    const lab = document.querySelector('.lab[data-lab="automaton"]');
    if (!lab) return resolve({ err: 'lab not found' });
    if (clickPreset) {
      const b = lab.querySelector('[data-rule="' + clickPreset + '"]');
      if (!b) return resolve({ err: 'preset ' + clickPreset + ' not found' });
      b.click();
    } else {
      const inp = lab.querySelector('[data-ctrl="rule"]');
      inp.value = String(rule);
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    }
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const cv = lab.querySelector('canvas');
      const ctx = cv.getContext('2d');
      const img = ctx.getImageData(0, 0, cv.width, cv.height);
      const d = img.data, W = cv.width, H = cv.height;
      const k = W / 820;
      const yTop = Math.round(56 * k), yBot = Math.min(H, Math.round(372 * k));
      let n = 0, minX = 1e9, maxX = -1, minY = 1e9, maxY = -1, plate = 0;
      for (let y = yTop; y < yBot; y++) {
        for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4;
          if (d[i + 3] < 200) continue;
          const r = d[i], g = d[i + 1], b = d[i + 2];
          if (Math.abs(r - 43) <= 12 && Math.abs(g - 52) <= 12 && Math.abs(b - 64) <= 12) {
            n++; if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
          } else if (
            // 说明牌底色 rgba(255,252,246,.95) 合成后：压深格 →(244,242,237)；压浅底 →(255,252,246)
            (Math.abs(r - 244) <= 3 && Math.abs(g - 242) <= 3 && Math.abs(b - 237) <= 3) ||
            (Math.abs(r - 255) <= 3 && Math.abs(g - 252) <= 3 && Math.abs(b - 246) <= 3)
          ) { plate++; }
        }
      }
      resolve({
        W: W, H: H, k: +k.toFixed(3),
        black: n ? { n, minX, maxX, minY, maxY, cx: Math.round((minX + maxX) / 2) } : { n: 0 },
        canvasCx: Math.round(W / 2),
        platePx: plate,
        vspan: ((lab.querySelector('.ctrl .v') || {}).textContent || '').trim(),
        readout: ((lab.querySelector('.lab-readout') || {}).textContent || '').trim(),
        onBtn: Array.from(lab.querySelectorAll('[data-rule]')).filter((b) => b.classList.contains('on')).map((b) => b.getAttribute('data-rule')).join(',')
      });
    }));
  });
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
    pg.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
    pg.on('console', (m) => { if (m.type() === 'error') errs.push('console.error: ' + m.text()); });
    await pg.goto(`${BASE}/scientists/turing/labs.html`, { waitUntil: 'load' });
    await pg.waitForTimeout(900);

    console.log('== 图灵 · 一维元胞自动机 ==');
    console.log('（黑格 = #2B3440；已排除 y<56 的规则表区域）\n');
    for (const rule of [110, 102, 30, 90, 150, 255, 0, 200]) {
      const r = await pg.evaluate(measure, { rule });
      if (r.err) { console.log('rule=' + rule + ' ❌ ' + r.err); continue; }
      const b = r.black;
      const dev = b.n ? b.cx - r.canvasCx : null;
      const verdict = !b.n ? (r.platePx > 2000 ? '✅空白+说明牌' : '❌空白且无说明牌')
        : (Math.abs(dev) <= Math.round(10 * r.k) ? '✅居中' : '⚠️偏移 ' + dev + 'px');
      console.log('rule ' + String(rule).padStart(3) +
        ' | 黑格 ' + String(b.n).padStart(6) + 'px' +
        (b.n ? ' x[' + b.minX + ',' + b.maxX + '] 图案中心 ' + b.cx + ' vs 画布中心 ' + r.canvasCx : '') +
        ' | 说明牌 ' + String(r.platePx).padStart(6) + 'px' +
        ' | 高亮按钮 ' + (r.onBtn || '无') + '  ' + verdict);
      console.log('      ' + r.readout.slice(0, 110));
    }

    console.log('\n== 预设按钮点击 ==');
    for (const p of [30, 255, 0]) {
      const r = await pg.evaluate(measure, { clickPreset: String(p) });
      if (r.err) { console.log('  ❌ ' + r.err); continue; }
      console.log('  点「' + p + '」 → vspan=' + r.vspan + ' 高亮按钮=' + r.onBtn +
        ' 说明牌=' + (r.platePx > 2000 ? '有' : '无') + ' 黑格=' + r.black.n + 'px');
      console.log('      ' + r.readout.slice(0, 110));
    }

    for (const rule of [110, 255, 0]) {
      await pg.evaluate(measure, { rule });
      await pg.waitForTimeout(250);
      await pg.locator('.lab[data-lab="automaton"]').screenshot({ path: path.join(OUT, `turing_auto_r${rule}.png`) });
    }
    await browser.close();
    console.log('\n== 运行时错误 ==');
    console.log(errs.length ? errs.join('\n') : '  ✅ 无 pageerror / console.error');
    console.log('✅ 截图已写入 ' + OUT);
  } catch (e) { console.error('❌', e.message); } finally { srv.kill(); }
  setTimeout(() => process.exit(0), 300);
})();

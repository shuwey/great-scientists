/**
 * 为审读报告拍 P1-1…P1-5 的"修复后"实站点截图。
 * 产物：<OUT>/*.png
 * 用法：node tools/shot_p1_fixes.js
 */
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const OUT = '/Users/shuwei/WorkBuddy/读懂牛顿-验证产物/labs-anim/p1';
const PORT = 8149;
const BASE = `http://localhost:${PORT}`;
const PY = '/Users/shuwei/.workbuddy/binaries/python/versions/3.13.12/bin/python3';

const waitServer = () => new Promise((res, rej) => {
  const t0 = Date.now();
  const tick = () => http.get(`${BASE}/index.html`, (r) => { r.destroy(); res(); })
    .on('error', () => (Date.now() - t0 > 15000 ? rej(new Error('server timeout')) : setTimeout(tick, 300)));
  tick();
});

function setCtrl(a) {
  const lab = document.querySelector('.lab[data-lab="' + a.lab + '"]');
  const inp = lab.querySelector('[data-ctrl="' + a.ctrl + '"]');
  inp.value = String(a.v);
  inp.dispatchEvent(new Event('input', { bubbles: true }));
}
function pause(a) {
  const lab = document.querySelector('.lab[data-lab="' + a.lab + '"]');
  const b = lab.querySelector('[data-anim="toggle"]');
  if (b) b.click();
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const srv = spawn(PY, ['-m', 'http.server', String(PORT), '--directory', ROOT], { stdio: 'ignore' });
  try {
    await waitServer();
    const browser = await chromium.launch();
    const pg = await browser.newPage({ viewport: { width: 1500, height: 1200 }, deviceScaleFactor: 1 });

    /* ① 暂停/单步 UI：图灵机（自走动画的代表） */
    await pg.goto(`${BASE}/scientists/turing/labs.html`, { waitUntil: 'load' });
    await pg.waitForTimeout(800);
    await pg.locator('.lab[data-lab="turing"]').screenshot({ path: path.join(OUT, 'p13_turing_running.png') });
    await pg.evaluate(pause, { lab: 'turing' });
    await pg.waitForTimeout(300);
    await pg.locator('.lab[data-lab="turing"]').screenshot({ path: path.join(OUT, 'p13_turing_paused.png') });
    console.log('✅ p13_turing_running / paused');

    /* ② 暂停/单步 UI：开普勒椭圆 */
    await pg.goto(`${BASE}/scientists/kepler/labs.html`, { waitUntil: 'load' });
    await pg.waitForTimeout(700);
    await pg.evaluate(pause, { lab: 'ellipse' });
    await pg.waitForTimeout(300);
    await pg.locator('.lab[data-lab="ellipse"]').screenshot({ path: path.join(OUT, 'p13_kepler_paused.png') });
    console.log('✅ p13_kepler_paused');

    /* ③ 元胞自动机：居中 + 退化说明牌 */
    await pg.goto(`${BASE}/scientists/turing/labs.html`, { waitUntil: 'load' });
    await pg.waitForTimeout(700);
    for (const r of [110, 30, 255, 0]) {
      await pg.evaluate(setCtrl, { lab: 'automaton', ctrl: 'rule', v: r });
      await pg.waitForTimeout(260);
      await pg.locator('.lab[data-lab="automaton"]').screenshot({ path: path.join(OUT, `p14_automaton_r${r}.png`) });
    }
    console.log('✅ p14_automaton_r110/30/255/0');

    /* ④ 爱因斯坦引力弯曲：全程不出画布 + 灰色虚线参照 */
    await pg.goto(`${BASE}/scientists/einstein/labs.html`, { waitUntil: 'load' });
    await pg.waitForTimeout(700);
    for (const m of [1, 10, 50]) {
      await pg.evaluate(setCtrl, { lab: 'bend', ctrl: 'mass', v: m });
      await pg.waitForTimeout(260);
      await pg.locator('.lab[data-lab="bend"]').screenshot({ path: path.join(OUT, `p15_bend_m${m}.png`) });
    }
    console.log('✅ p15_bend_m1/10/50');

    /* ⑤ 霍金光线经过黑洞：白虚线参照 */
    await pg.goto(`${BASE}/scientists/hawking/labs.html`, { waitUntil: 'load' });
    await pg.waitForTimeout(700);
    for (const a of [2.6, 7]) {
      await pg.evaluate(setCtrl, { lab: 'orbit', ctrl: 'aim', v: a });
      await pg.waitForTimeout(260);
      await pg.locator('.lab[data-lab="orbit"]').screenshot({ path: path.join(OUT, `p15_orbit_a${a}.png`) });
    }
    console.log('✅ p15_orbit_a2.6/a7');

    await browser.close();
    console.log('\n✅ 全部写入 ' + OUT);
  } catch (e) { console.error('❌', e.message); } finally { srv.kill(); }
})();

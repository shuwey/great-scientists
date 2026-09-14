/**
 * P2 修复后截图：猜一猜块 / 迷你图例 / 霍金统一底色 / 费曼画面配比
 *
 * 用法：node tools/shot_p2_fixes.js
 */
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const OUT = '/Users/shuwei/WorkBuddy/读懂牛顿-验证产物/labs-anim/p2';
const PORT = 8154;
const BASE = `http://localhost:${PORT}`;
const PY = '/Users/shuwei/.workbuddy/binaries/python/versions/3.13.12/bin/python3';

const waitServer = () => new Promise((res, rej) => {
  const t0 = Date.now();
  const tick = () => http.get(`${BASE}/index.html`, (r) => { r.destroy(); res(); })
    .on('error', () => (Date.now() - t0 > 15000 ? rej(new Error('server timeout')) : setTimeout(tick, 300)));
  tick();
});

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const srv = spawn(PY, ['-m', 'http.server', String(PORT), '--directory', ROOT], { stdio: 'ignore' });
  let browser = null;
  const errs = [];
  try {
    await waitServer();
    browser = await chromium.launch();
    const pg = await browser.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 1 });
    pg.setDefaultTimeout(20000);
    pg.on('pageerror', (e) => errs.push('pageerror: ' + e.message));

    /* ① 猜一猜 + 迷你图例（牛顿棱镜，两个新块在同一屏里） */
    await pg.goto(`${BASE}/scientists/newton/labs.html`, { waitUntil: 'load' });
    await pg.waitForTimeout(900);
    const prism = await pg.$('.lab[data-lab="prism"]');
    if (prism) await prism.screenshot({ path: `${OUT}/p21_newton_prism.png` });

    /* ② 图例里"实验专属标签"最密的一个：居里三射线（4 条） */
    await pg.goto(`${BASE}/scientists/curie/labs.html`, { waitUntil: 'load' });
    await pg.waitForTimeout(900);
    const rays = await pg.$('.lab[data-lab="rays"]');
    if (rays) await rays.screenshot({ path: `${OUT}/p22_curie_rays.png` });

    /* ③ 霍金：三实验底色统一成深底 */
    await pg.goto(`${BASE}/scientists/hawking/labs.html`, { waitUntil: 'load' });
    await pg.waitForTimeout(1400);
    await pg.screenshot({ path: `${OUT}/p22_hawking_bg.png`, fullPage: true });

    /* ④ 巴斯德菌落：图例 5 条（四个生长阶段 + 当前曲线） */
    await pg.goto(`${BASE}/scientists/pasteur/labs.html`, { waitUntil: 'load' });
    await pg.waitForTimeout(900);
    const colony = await pg.$('.lab[data-lab="colony"]');
    if (colony) await colony.screenshot({ path: `${OUT}/p22_pasteur_colony.png` });

    console.log('截图已写入 ' + OUT);
    console.log('运行时报错：' + (errs.length ? '❌ ' + errs.join(' | ') : '✅ 0 条'));
  } catch (e) {
    console.log('异常：' + e.message);
  } finally {
    try { if (browser) await browser.close(); } catch (e) { /* ignore */ }
    try { srv.kill('SIGKILL'); } catch (e) { /* ignore */ }
    setTimeout(() => process.exit(0), 100);
  }
})();

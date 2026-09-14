/**
 * P0 修复前后对照截图：把每个实验卡片（.lab）单独截下来。
 *
 * 为什么要截图：画布纵向压扁是"形状"问题，数字（畸变%）说明得了原因，
 * 但"圆变成了扁椭圆"最直观的证据是一张图。
 *
 * 用法：
 *   node tools/shot_p0_before_after.js before
 *   node tools/shot_p0_before_after.js after
 * 产物：<OUT>/p0_<stage>_<id>_<n>.png
 */
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const OUT = '/Users/shuwei/WorkBuddy/读懂牛顿-验证产物/labs-anim/p0';
const PORT = 8136;
const BASE = `http://localhost:${PORT}`;
const PY = '/Users/shuwei/.workbuddy/binaries/python/versions/3.13.12/bin/python3';

const STAGE = process.argv[2] === 'after' ? 'after' : 'before';
const VW = 1600;                        // 投影常用档位：压扁最严重处
const TARGETS = (process.argv[3] || 'bohr,kepler,galileo,copernicus,curie').split(',');

const waitServer = () => new Promise((res, rej) => {
  const t0 = Date.now();
  const tick = () => http.get(`${BASE}/index.html`, (r) => { r.destroy(); res(); })
    .on('error', () => (Date.now() - t0 > 15000 ? rej(new Error('server timeout')) : setTimeout(tick, 300)));
  tick();
});

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const srv = spawn(PY, ['-m', 'http.server', String(PORT), '--directory', ROOT], { stdio: 'ignore' });
  try {
    await waitServer();
    const browser = await chromium.launch();
    const pg = await browser.newPage({ viewport: { width: VW, height: 1200 }, deviceScaleFactor: 1 });
    for (const id of TARGETS) {
      await pg.goto(`${BASE}/scientists/${id}/labs.html`, { waitUntil: 'networkidle' });
      await pg.waitForTimeout(700);
      const labs = await pg.$$('.lab');
      let n = 0;
      for (const lab of labs) {
        n += 1;
        const key = `${id}-${n}`;
        const file = path.join(OUT, `p0_${STAGE}_${key}.png`);
        await lab.screenshot({ path: file });
        const box = await lab.boundingBox();
        const cv = await lab.$('canvas');
        const cbox = await cv.boundingBox();
        console.log(`${STAGE}  ${key.padEnd(18)} 卡片 ${Math.round(box.width)}×${Math.round(box.height)}  画布 ${Math.round(cbox.width)}×${Math.round(cbox.height)}  比例 ${(cbox.height / cbox.width).toFixed(3)}`);
      }
    }
    await browser.close();
    console.log(`\n✅ 已写入 ${OUT}/p0_${STAGE}_*.png`);
  } catch (e) { console.error('❌', e.message); } finally { srv.kill(); }
  setTimeout(() => process.exit(0), 300);
})();

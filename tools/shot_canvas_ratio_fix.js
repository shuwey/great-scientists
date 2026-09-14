/**
 * 取证：canvas 纵向压扁的「现状 vs 修正后」对照截图
 *
 * 现状：.lab canvas 被 CSS 的 max-height:360px 截断 → 画面纵向压缩 8%~31%
 * 修正：覆盖 .lab canvas{max-height:none} 后，画布按编码时的逻辑比例显示 → 形状还原
 *
 * 用法：node tools/shot_canvas_ratio_fix.js [viewportWidth]
 * 产出：<SHOTS_DIR>/labs-anim/ratio_<站>_<实验>_{before,after}.png
 */
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8136;
const BASE = `http://localhost:${PORT}`;
const PY = '/Users/shuwei/.workbuddy/binaries/python/versions/3.13.12/bin/python3';
const VW = Number(process.argv[2] || 1280);
const OUT = process.env.SHOTS_DIR
  ? path.join(process.env.SHOTS_DIR, 'labs-anim')
  : path.resolve(ROOT, '..', '读懂牛顿-验证产物', 'labs-anim');
fs.mkdirSync(OUT, { recursive: true });

// 挑形状最能说明问题的三个：圆形轨道、椭圆轨道、分布曲线
const TARGETS = [
  ['bohr', 'shells', '圆形电子壳层'],
  ['kepler', 'ellipse', '椭圆轨道'],
  ['maxwell', 'speed', '速率分布曲线'],
];

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
    const pg = await browser.newPage({ viewport: { width: VW, height: 1200 } });
    for (const [id, labKey, cn] of TARGETS) {
      await pg.goto(`${BASE}/scientists/${id}/labs.html`, { waitUntil: 'networkidle' });
      // 关掉自走动画的相位漂移，让两张图可比（把速度滑块拨到最小）
      await pg.addStyleTag({ content: '.nav,#progress{display:none!important}' });
      await pg.waitForTimeout(400);
      const lab = pg.locator(`.lab[data-lab="${labKey}"]`);
      const cv = lab.locator('canvas').first();
      await lab.scrollIntoViewIfNeeded();
      await pg.waitForTimeout(600);
      await cv.screenshot({ path: `${OUT}/ratio_${id}_${labKey}_before.png` });
      const before = await cv.evaluate((c) => ({ box: `${c.clientWidth}×${c.clientHeight}`, backing: `${c.width}×${c.height}` }));
      // 注入修正
      await pg.addStyleTag({ content: '.lab canvas{max-height:none !important}' });
      await pg.waitForTimeout(700);
      await cv.screenshot({ path: `${OUT}/ratio_${id}_${labKey}_after.png` });
      const after = await cv.evaluate((c) => ({ box: `${c.clientWidth}×${c.clientHeight}`, backing: `${c.width}×${c.height}` }));
      console.log(`${id}/${labKey}（${cn}）  现状 显示${before.box} backing${before.backing}  →  修正后 显示${after.box}`);
    }
    await browser.close();
  } catch (e) { console.error('❌', e.message); } finally { srv.kill(); }
  setTimeout(() => process.exit(0), 300);
})();

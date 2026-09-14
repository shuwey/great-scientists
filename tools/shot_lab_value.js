/* 按指定滑块值给单个实验截图，用于核对特定状态
   用法：node tools/shot_lab_value.js kepler third power 1.5 [--wait 3000]
*/
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8123;
const BASE = `http://localhost:${PORT}`;
const PY = '/Users/shuwei/.workbuddy/binaries/python/versions/3.13.12/bin/python3';
// 截图输出目录：默认放在项目**外**（不参与静态发布上传），可用 SHOTS_DIR 覆盖
const SHOTS = process.env.SHOTS_DIR || path.resolve(ROOT, '..', '读懂牛顿-验证产物', 'shots');
const OUT = path.join(SHOTS, 'new');
fs.mkdirSync(OUT, { recursive: true });

const [site, kind, ctrl, value] = process.argv.slice(2);
const wi = process.argv.indexOf('--wait');
const WAIT = wi >= 0 ? +process.argv[wi + 1] : 1200;

function waitServer() {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    const tick = () => {
      const req = http.get(BASE + '/index.html', (res) => { res.destroy(); resolve(); });
      req.on('error', () => {
        if (Date.now() - t0 > 15000) reject(new Error('server timeout'));
        else setTimeout(tick, 300);
      });
    };
    tick();
  });
}

(async () => {
  const srv = spawn(PY, ['-m', 'http.server', String(PORT), '--directory', ROOT], { stdio: 'ignore' });
  try {
    await waitServer();
    const browser = await chromium.launch();
    const pg = await (await browser.newContext({ viewport: { width: 1280, height: 1000 } })).newPage();
    const errs = [];
    pg.on('pageerror', (e) => errs.push(e.message));
    await pg.goto(`${BASE}/scientists/${site}/labs.html`, { waitUntil: 'networkidle' });
    await pg.waitForTimeout(400);
    const ok = await pg.evaluate(({ kind, ctrl, value }) => {
      const lab = Array.from(document.querySelectorAll('.lab')).find((l) => l.getAttribute('data-lab') === kind);
      if (!lab) return false;
      const s = lab.querySelector('[data-ctrl="' + ctrl + '"]');
      if (!s) return false;
      s.value = String(value);
      s.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    }, { kind, ctrl, value });
    if (!ok) throw new Error(`找不到 ${kind} / ${ctrl}`);
    await pg.waitForTimeout(WAIT);
    const cv = await pg.$(`.lab[data-lab="${kind}"] canvas`);
    await cv.screenshot({ path: `${OUT}/${site}_${kind}_${ctrl}${value}.png` });
    const read = await pg.evaluate((kind) => {
      const lab = Array.from(document.querySelectorAll('.lab')).find((l) => l.getAttribute('data-lab') === kind);
      return lab.querySelector('.lab-readout').textContent.trim();
    }, kind);
    console.log('读数: ' + read);
    console.log(`已存 ${site}_${kind}_${ctrl}${value}.png | 报错 ${errs.length}`);
    await browser.close();
  } catch (e) {
    console.log('!! ' + e.message);
  } finally {
    srv.kill();
  }
  setTimeout(() => process.exit(0), 300);
})();

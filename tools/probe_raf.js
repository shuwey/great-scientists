// 临时探针：确认 labs.html 里 requestAnimationFrame 是否真的在跑、canvas 是否真的在变
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.resolve(__dirname, '..');
const PORT = 8132;
const BASE = `http://localhost:${PORT}`;
const PY = '/Users/shuwei/.workbuddy/binaries/python/versions/3.13.12/bin/python3';
const ID = process.argv[2] || 'feynman';

const waitServer = () => new Promise((res, rej) => {
  const t0 = Date.now();
  const tick = () => http.get(`${BASE}/index.html`, (r) => { r.destroy(); res(); }).on('error', () => Date.now() - t0 > 15000 ? rej(new Error('timeout')) : setTimeout(tick, 300));
  tick();
});

(async () => {
  const srv = spawn(PY, ['-m', 'http.server', String(PORT), '--directory', ROOT], { stdio: 'ignore' });
  try {
    await waitServer();
    const browser = await chromium.launch();
    const pg = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
    await pg.goto(`${BASE}/scientists/${ID}/labs.html`, { waitUntil: 'networkidle' });
    // 注入 rAF 计数器（在页面脚本已启动循环之后也能数到：包一层）
    await pg.evaluate(() => {
      window.__raf = 0;
      const orig = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = (cb) => { window.__raf++; return orig(cb); };
    });
    await pg.waitForTimeout(300);
    const rafBefore = await pg.evaluate(() => window.__raf);
    const hashes = [];
    for (let i = 0; i < 6; i++) {
      const h = await pg.evaluate(() => {
        const out = [];
        document.querySelectorAll('.lab canvas').forEach((c) => {
          const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
          let s = 0;
          for (let k = 0; k < d.length; k += 97) s = (s * 31 + d[k]) >>> 0;
          out.push(s);
        });
        return out;
      });
      hashes.push(h);
      await pg.waitForTimeout(300);
    }
    const rafAfter = await pg.evaluate(() => window.__raf);
    console.log(`[${ID}] 注入后 1.8s 内 rAF 回调数 = ${rafAfter - rafBefore}`);
    console.log('  visibilityState =', await pg.evaluate(() => document.visibilityState),
                ' hasFocus =', await pg.evaluate(() => document.hasFocus()));
    const labs = await pg.$$eval('.lab', (els) => els.map((e) => e.getAttribute('data-lab')));
    labs.forEach((name, i) => {
      const seq = hashes.map((h) => h[i]);
      const uniq = new Set(seq).size;
      console.log(`  ${name.padEnd(12)} 6 帧哈希 = ${seq.join(',')}  不同值 ${uniq}/6 ${uniq > 1 ? '← 在动 ✅' : '← 静止 ❌'}`);
    });
    await browser.close();
  } catch (e) { console.error('❌', e.message); } finally { srv.kill(); }
})();

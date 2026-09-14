const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const { spawn } = require('child_process');
const http = require('http');
const ROOT = '/Users/shuwei/WorkBuddy/读懂牛顿';
const PORT = 8099;
const BASE = `http://localhost:${PORT}`;
const PY = '/Users/shuwei/.workbuddy/binaries/python/versions/3.13.12/bin/python3';
function waitServer() {
  return new Promise((res, rej) => {
    const t0 = Date.now();
    const tick = () => { const r = http.get(BASE + '/index.html', (x) => { x.destroy(); res(); }); r.on('error', () => Date.now() - t0 > 15000 ? rej(new Error('timeout')) : setTimeout(tick, 300)); };
    tick();
  });
}
(async () => {
  const srv = spawn(PY, ['-m', 'http.server', String(PORT), '--directory', ROOT], { stdio: 'ignore' });
  try {
    await waitServer();
    const browser = await chromium.launch();
    const pg = await browser.newPage({ viewport: { width: 1280, height: 900 } });

    // 首页底部 gap 测量
    await pg.goto(BASE + '/index.html', { waitUntil: 'networkidle' });
    await pg.waitForTimeout(300);
    const m = await pg.evaluate(() => {
      const secs = [...document.querySelectorAll('section')];
      const last = secs[secs.length - 1];
      const foot = document.querySelector('.foot');
      const lr = last.getBoundingClientRect();
      const fr = foot.getBoundingClientRect();
      return {
        lastSectionBottom: Math.round(lr.bottom),
        footTop: Math.round(fr.top),
        gap: Math.round(fr.top - lr.bottom),
        docHeight: document.documentElement.scrollHeight,
        footBottom: Math.round(fr.bottom),
        footMarginTop: getComputedStyle(foot).marginTop
      };
    });
    console.log('首页底部间距:', JSON.stringify(m, null, 0));

    // 棱镜 canvas 彩色像素统计
    await pg.goto(BASE + '/labs.html', { waitUntil: 'networkidle' });
    await pg.waitForTimeout(800);
    const c = await pg.evaluate(() => {
      const cv = document.querySelectorAll('.lab canvas')[0];
      const ctx = cv.getContext('2d');
      const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
      let colored = 0, byHue = {};
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
        const sat = mx - mn;
        if (sat > 60 && mx > 120) {
          colored++;
          let h = 0;
          if (mx === r) h = ((g - b) / sat) % 6;
          else if (mx === g) h = (b - r) / sat + 2;
          else h = (r - g) / sat + 4;
          h = Math.round(h * 60); if (h < 0) h += 360;
          const band = h < 15 || h >= 345 ? '红' : h < 45 ? '橙' : h < 70 ? '黄' : h < 165 ? '绿' : h < 255 ? '蓝' : h < 290 ? '紫' : '其他';
          byHue[band] = (byHue[band] || 0) + 1;
        }
      }
      return { colored, byHue, w: cv.width, h: cv.height };
    });
    console.log('棱镜彩色像素:', JSON.stringify(c, null, 0));

    await browser.close();
  } catch (e) { console.error('ERR', e.message); } finally { srv.kill(); }
  setTimeout(() => process.exit(0), 300);
})();

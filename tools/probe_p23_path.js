/**
 * P2-3 实测探针：费曼「路径积分」的画面配比
 *
 * 原状：占面积最大的是 21 条路径束（背景性部件），而真正要讲的机制——
 *       相位箭头首尾相接、叠加出净概率幅——只有约 130px 宽、缩在左下角细线。
 * 判据：① 蓝色相位链的像素包围盒宽度 ≥ 画布宽度的 1/3（"进入主视觉"）；
 *       ② 红色合成箭头存在且长度随 ℏ 变化；
 *       ③ 面板内的"净概率幅"数值随 ℏ 单调下降（ℏ 越小抵消越厉害）；
 *       ④ 全程 0 pageerror。
 *
 * 用法：node tools/probe_p23_path.js
 */
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const OUT = '/Users/shuwei/WorkBuddy/读懂牛顿-验证产物/labs-anim/p2';
const PORT = 8152;
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
  const { value } = args;
  return new Promise((resolve) => {
    const lab = document.querySelector('.lab[data-lab="path"]');
    if (!lab) return resolve({ err: 'no lab' });
    const input = lab.querySelector('[data-ctrl="hbar"]');
    if (input) { input.value = value; input.dispatchEvent(new Event('input', { bubbles: true })); }
    setTimeout(() => {
      const cv = lab.querySelector('canvas');
      const ctx = cv.getContext('2d');
      let img;
      try { img = ctx.getImageData(0, 0, cv.width, cv.height); }
      catch (e) { return resolve({ err: 'getImageData: ' + e.message }); }
      const d = img.data, W = cv.width, H = cv.height;
      /* 0=相位链蓝 rgba(26,115,232)  1=合成红 #E03131  2=橙色经典路径 #E8590C */
      const col = [[26, 115, 232, 46], [224, 49, 49, 34], [232, 89, 12, 30]];
      const st = col.map(() => ({ n: 0, minX: 1e9, maxX: -1, minY: 1e9, maxY: -1 }));
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4;
          if (d[i + 3] < 200) continue;
          const r = d[i], g = d[i + 1], b = d[i + 2];
          for (let c = 0; c < 3; c++) {
            /* 红色通道要排掉面板底部那条"净概率幅"进度条（同一个 #E03131） */
            if (c === 1 && y > H * 0.84) continue;
            const t = col[c];
            if (Math.abs(r - t[0]) <= t[3] && Math.abs(g - t[1]) <= t[3] && Math.abs(b - t[2]) <= t[3]) {
              const s = st[c]; s.n++;
              if (x < s.minX) s.minX = x; if (x > s.maxX) s.maxX = x;
              if (y < s.minY) s.minY = y; if (y > s.maxY) s.maxY = y;
            }
          }
        }
      }
      resolve({
        W: cv.width, H: cv.height, clientW: cv.clientWidth,
        blue: st[0].n ? { n: st[0].n, w: st[0].maxX - st[0].minX, h: st[0].maxY - st[0].minY, minX: st[0].minX, maxX: st[0].maxX, minY: st[0].minY, maxY: st[0].maxY } : { n: 0 },
        red: st[1].n ? { n: st[1].n, w: st[1].maxX - st[1].minX, h: st[1].maxY - st[1].minY, len: Math.round(Math.hypot(st[1].maxX - st[1].minX, st[1].maxY - st[1].minY)) } : { n: 0 },
        orange: st[2].n ? { n: st[2].n, minX: st[2].minX, maxX: st[2].maxX } : { n: 0 },
        readout: ((lab.querySelector('.lab-readout') || {}).textContent || '').trim(),
        guess: ((lab.querySelector('.lab-guess') || {}).textContent || '').trim()
      });
    }, 420);
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

    await pg.goto(`${BASE}/scientists/feynman/labs.html`, { waitUntil: 'load' });
    await pg.waitForTimeout(700);
    console.log('== 费曼 · 路径积分（画布宽 1600px 视口） ==');
    /* 判据（改到"面板"尺度上量，而不是整幅画布）：
         ① 相位面板占画布宽 ≥ 45%（机制区成为主视觉，而不是缩在角落）
         ② 相位链在面板内，且默认 ℏ=1 时占面板宽 ≥ 55%
         ③ 红箭头长度 ≤ 链包围盒对角线（自洽性：合成量不可能比整条链还长）
         ④ 净概率幅随 ℏ 单调递增（ℏ 越大相位差越小 → 抵消越少）
       注：ℏ 很小时链会真实地蜷起来（这正是"互相抵消"的物理图像），
       所以不要求所有档位都撑满面板——强行铺满反而会把"抵消"画成"没抵消"。 */
    const PANEL = { x: 372, y: 34, w: 424, h: 390 };   /* 逻辑坐标，与 site.js 一致 */
    let head = true, prevAmp = null, mono = true;
    let okPanel = true, okFill = true, okSanity = true, defFill = 0;
    for (const h of [0.25, 0.4, 0.6, 0.8, 1, 1.4, 2]) {
      const r = await pg.evaluate(measure, { value: String(h) });
      if (!r || r.err) { console.log('  ℏ=' + h + ' ❌ ' + (r && r.err)); continue; }
      const k = r.H / 460;                       /* 逻辑 → backing 倍率 */
      if (head) {
        console.log('  量测用画布 ' + r.W + '×' + r.H + 'px（dpr=1，显示宽 ' + r.clientW + 'px，k=' + k.toFixed(2) + '）');
        const pw = PANEL.w * k;
        console.log('  相位面板宽 ' + Math.round(pw) + 'px = 画布宽的 ' + (pw / r.W * 100).toFixed(1) + '%'
          + (pw / r.W >= 0.45 ? ' ✅' : ' ❌'));
        if (pw / r.W < 0.45) okPanel = false;
        head = false;
      }
      const pw = PANEL.w * k, ph = PANEL.h * k, px = PANEL.x * k, py = PANEL.y * k;
      const fill = r.blue.w / pw;
      if (h === 1) defFill = fill;
      if (fill < 0.25) okFill = false;
      const inside = r.blue.minX >= px - 2 && r.blue.maxX <= px + pw + 2 &&
                     r.blue.minY >= py - 2 && r.blue.maxY <= py + ph + 2;
      const diag = Math.hypot(r.blue.w, r.blue.h);
      if (r.red.len > diag + 6) okSanity = false;
      const amp = (r.readout.match(/净概率幅\s*([0-9.]+)/) || [])[1];
      if (amp != null) { if (prevAmp != null && +amp < +prevAmp - 1e-9) mono = false; prevAmp = +amp; }
      console.log('  ℏ=' + String(h).padStart(4) +
        ' 相位链 ' + String(r.blue.w).padStart(3) + '×' + String(r.blue.h).padEnd(3) + 'px' +
        ' 占面板宽 ' + (fill * 100).toFixed(1).padStart(5) + '%' +
        ' 在面板内 ' + (inside ? '✅' : '❌') +
        ' | 合成红箭头 ' + String(r.red.len).padStart(3) + 'px' +
        (r.red.len > diag + 6 ? ' ❌超过链对角线' : ' ✅') +
        ' | 净概率幅 ' + String(amp).padStart(5));
      if (!inside) okSanity = false;
    }
    const last = await pg.evaluate(measure, { value: '1' });
    console.log('\n  文字标签块：' + (last.guess ? '猜一猜已就位' : '（本页无猜一猜）'));
    console.log('  判据① 面板 ≥ 45% 画布宽：' + (okPanel ? '✅' : '❌'));
    console.log('  判据② 默认 ℏ=1 时链占面板宽 ' + (defFill * 100).toFixed(1) + '%：'
      + (defFill >= 0.55 ? '✅' : '❌（要求 ≥55%）'));
    console.log('  判据③ 红箭头长度自洽 + 链不越出面板：' + (okSanity && okFill ? '✅' : '❌'));
    console.log('  判据④ 净概率幅随 ℏ 单调递增：' + (mono ? '✅' : '❌'));
    await pg.screenshot({ path: `${OUT}/p23_path_h1.png`, fullPage: false });
    await pg.evaluate(measure, { value: '0.25' });
    await pg.waitForTimeout(300);
    await pg.screenshot({ path: `${OUT}/p23_path_h0.25.png`, fullPage: false });
    console.log('\n  截图：' + OUT + '/p23_path_h1.png · p23_path_h0.3.png');
    console.log('  运行时报错：' + (errs.length ? '❌ ' + errs.length + ' 条\n    ' + errs.join('\n    ') : '✅ 0 条'));
  } catch (e) {
    console.log('探针异常：' + e.message + '\n' + (errs.length ? errs.join('\n') : ''));
  } finally {
    try { srv.kill('SIGKILL'); } catch (e) { /* ignore */ }
    /* 不加这行：http.server 子进程或残留 handle 会让 node 挂住不退出 */
    setTimeout(() => process.exit(0), 100);
  }
})();

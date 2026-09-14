/**
 * 玩一玩 · 教学动画审计（教学动画编剧视角的「实测取数」工具）
 *
 * 目的：把 15 个站 × 3 个实验 = 45 个 canvas 动画**真的跑一遍**，为每一段采集可观测量：
 *   ① 自走性：不给任何输入，静置 3 帧（0 / 400 / 800ms）比像素签名 → 这段动画自己会不会动、动多大
 *   ② 交互响应：把每个滑块分别拨到量程两端，比签名 + 收 readout → 操作是否真的改变画面与结论
 *   ③ 结构事实：机制标题 / 引导语 / 一句话说明 / 控件标签 / 控件数量 / readout 文案 / 结论 callout
 *   ④ 报错：pageerror 与 console.error（过滤网络噪声）
 *   ⑤ 留证：每个实验 3 张 PNG（初始 / 静置后 / 滑块拨到最大后）
 *
 * 输出（默认放项目外，不参与静态发布上传）：
 *   <SHOTS_DIR>/labs-anim/<station>.json       每站审计数据
 *   <SHOTS_DIR>/labs-anim/<station>_<lab>_{t0,t1,hi}.png   逐实验三帧
 *
 * 用法：node tools/audit_labs_animation.js [id1,id2,...]   （缺省 = 全部有 labs.html 的站）
 */
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8131;
const BASE = `http://localhost:${PORT}`;
const PY = '/Users/shuwei/.workbuddy/binaries/python/versions/3.13.12/bin/python3';
const OUT = process.env.SHOTS_DIR
  ? path.join(process.env.SHOTS_DIR, 'labs-anim')
  : path.resolve(ROOT, '..', '读懂牛顿-验证产物', 'labs-anim');
fs.mkdirSync(OUT, { recursive: true });

// 站点清单：有 labs.html 的才算
const ALL = fs.readdirSync(path.join(ROOT, 'scientists'))
  .filter((d) => fs.existsSync(path.join(ROOT, 'scientists', d, 'labs.html')))
  .sort();
const IDS = process.argv[2] ? process.argv[2].split(',').map((s) => s.trim()) : ALL;

function waitServer() {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    const tick = () => {
      const req = http.get(`${BASE}/index.html`, (res) => { res.destroy(); resolve(); });
      req.on('error', () => (Date.now() - t0 > 15000 ? reject(new Error('server timeout')) : setTimeout(tick, 300)));
    };
    tick();
  });
}
const noise = (s) => /favicon|Failed to load resource|net::ERR/i.test(s);

// 浏览器内：直接读真实 canvas 像素，分块取均值 → 32×20 灰度签名（不动用离屏 canvas，
// 避免 drawImage 降采样的实现差异；并附一个全画布校验和用于交叉验证）
const SIG_FN = `
(c) => {
  const W = 32, H = 20;
  const ctx = c.getContext('2d');
  const d = ctx.getImageData(0, 0, c.width, c.height).data;
  const sum = new Array(W * H).fill(0), cnt = new Array(W * H).fill(0);
  let check = 0;
  for (let y = 0; y < c.height; y += 2) {
    const by = Math.min(H - 1, (y * H / c.height) | 0);
    for (let x = 0; x < c.width; x += 2) {
      const bx = Math.min(W - 1, (x * W / c.width) | 0);
      const i = (y * c.width + x) * 4;
      const lum = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
      sum[by * W + bx] += lum; cnt[by * W + bx]++;
      check = (check * 31 + d[i]) >>> 0;
    }
  }
  const arr = sum.map((v, i) => v / Math.max(1, cnt[i]));
  arr.push(check);            // 末位挂校验和：与签名分开用
  return arr;
}`;
// 拆出校验和（最后一维）
const sigOnly = (a) => (a ? a.slice(0, -1) : null);
const sumOnly = (a) => (a ? a[a.length - 1] : null);
const meanAbsDiff = (a, b) => {
  if (!a || !b || a.length !== b.length) return -1;
  let s = 0;
  for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]);
  return +(s / a.length).toFixed(3);
};

(async () => {
  const srv = spawn(PY, ['-m', 'http.server', String(PORT), '--directory', ROOT], { stdio: 'ignore' });
  const summary = {};
  try {
    await waitServer();
    const browser = await chromium.launch();

    for (const id of IDS) {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
      const pg = await ctx.newPage();
      const errs = [];
      pg.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
      pg.on('console', (m) => { if (m.type() === 'error' && !noise(m.text())) errs.push('console: ' + m.text()); });

      await pg.goto(`${BASE}/scientists/${id}/labs.html`, { waitUntil: 'networkidle', timeout: 25000 });
      await pg.waitForTimeout(400);

      const pageInfo = await pg.evaluate(() => ({
        title: document.querySelector('h1') ? document.querySelector('h1').textContent.trim() : '',
        claim: document.querySelector('.big-claim') ? document.querySelector('.big-claim').textContent.trim() : '',
        labCount: document.querySelectorAll('.lab').length,
      }));

      const labs = [];
      const n = pageInfo.labCount;
      for (let i = 0; i < n; i++) {
        const lab = pg.locator('.lab').nth(i);
        const key = await lab.evaluate((el) => el.getAttribute('data-lab') || 'lab');
        await lab.scrollIntoViewIfNeeded();
        await pg.waitForTimeout(250);

        // ---- 静态结构 ----
        const meta = await lab.evaluate((el) => {
          const prev = (tag) => { let x = el.previousElementSibling; while (x && x.tagName !== tag) x = x.previousElementSibling; return x ? x.textContent.trim() : ''; };
          const q = (s) => el.querySelector(s);
          return {
            dataLab: el.getAttribute('data-lab'),
            h2: prev('H2'),
            guidance: prev('P'),
            h4: q('.lab-head h4') ? q('.lab-head h4').textContent.trim() : '',
            badge: q('.lab-head .badge') ? q('.lab-head .badge').textContent.trim() : '',
            desc: q('.lab-desc') ? q('.lab-desc').textContent.trim() : '',
            readout0: q('.lab-readout') ? q('.lab-readout').textContent.trim() : '',
            buttons: [...el.querySelectorAll('button')].map((b) => b.textContent.trim()),
            selects: [...el.querySelectorAll('select')].map((s) => s.options.length),
            sliders: [...el.querySelectorAll('input[type=range]')].map((s) => ({
              ctrl: s.getAttribute('data-ctrl'),
              label: s.closest('.ctrl') && s.closest('.ctrl').querySelector('label')
                ? s.closest('.ctrl').querySelector('label').textContent.trim() : '',
              min: s.min, max: s.max, value: s.value, step: s.step,
            })),
            canvasCount: el.querySelectorAll('canvas').length,
          };
        });

        const canvas = lab.locator('canvas').first();
        const hasCanvas = await canvas.count() > 0;
        if (!hasCanvas) { labs.push({ ...meta, noCanvas: true }); continue; }

        // ---- ① 自走性：静置 3 帧（不给任何输入）----
        const rawSig = async () => canvas.evaluate(new Function('c', `return (${SIG_FN})(c)`)).catch(() => null);
        const r0 = await rawSig();
        await canvas.screenshot({ path: `${OUT}/${id}_${key}_t0.png` }).catch(() => {});
        await pg.waitForTimeout(430);
        const r1 = await rawSig();
        await pg.waitForTimeout(430);
        const r2 = await rawSig();
        await canvas.screenshot({ path: `${OUT}/${id}_${key}_t1.png` }).catch(() => {});
        const autoMotion = {
          d01: meanAbsDiff(sigOnly(r0), sigOnly(r1)),
          d12: meanAbsDiff(sigOnly(r1), sigOnly(r2)),
          d02: meanAbsDiff(sigOnly(r0), sigOnly(r2)),
          checksumChanged: sumOnly(r0) !== sumOnly(r2),
        };

        // ---- ② 交互响应：每个滑块拨到量程两端 ----
        const sliderResults = [];
        const sl = lab.locator('input[type=range]');
        const slN = await sl.count();
        for (let k = 0; k < slN; k++) {
          const one = sl.nth(k);
          const min = Number(await one.getAttribute('min'));
          const max = Number(await one.getAttribute('max'));
          const read = () => lab.locator('.lab-readout').first().evaluate((e) => e.textContent.trim()).catch(() => '');
          const setVal = async (v) => { await one.fill(String(v)); await one.dispatchEvent('input'); await pg.waitForTimeout(330); };
          await setVal(min);
          const sMin = sigOnly(await rawSig()); const rMin = await read();
          await setVal(max);
          const sMax = sigOnly(await rawSig()); const rMax = await read();
          sliderResults.push({
            ctrl: meta.sliders[k] ? meta.sliders[k].ctrl : 's' + k,
            min, max,
            readMin: rMin, readMax: rMax,
            readoutChanged: rMin !== rMax,
            canvasDiff: meanAbsDiff(sMin, sMax),
          });
          // 还原
          const dv = meta.sliders[k] ? meta.sliders[k].value : String(min);
          await setVal(dv);
        }
        // 第一根滑块拨到最大后的截图（留证）
        if (slN > 0) {
          await sl.first().fill(String(meta.sliders[0].max));
          await sl.first().dispatchEvent('input');
          await pg.waitForTimeout(430);
          await canvas.screenshot({ path: `${OUT}/${id}_${key}_hi.png` }).catch(() => {});
          await sl.first().fill(String(meta.sliders[0].value));
          await sl.first().dispatchEvent('input');
        }

        // ---- ②b 按钮触发的动画（如抛体的「发射」）：点一下，看它在 2 秒内有没有真的动 ----
        let buttonMotion = null;
        const btn = lab.locator('button').first();
        if (await btn.count() > 0) {
          const b0 = await rawSig();
          await btn.click().catch(() => {});
          await pg.waitForTimeout(320);
          const b1 = await rawSig();
          await pg.waitForTimeout(600);
          const b2 = await rawSig();
          await canvas.screenshot({ path: `${OUT}/${id}_${key}_btn.png` }).catch(() => {});
          await pg.waitForTimeout(600);
          const b3 = await rawSig();
          buttonMotion = {
            label: (meta.buttons || [])[0] || '',
            d01: meanAbsDiff(sigOnly(b0), sigOnly(b1)),
            d12: meanAbsDiff(sigOnly(b1), sigOnly(b2)),
            d23: meanAbsDiff(sigOnly(b2), sigOnly(b3)),
            d03: meanAbsDiff(sigOnly(b0), sigOnly(b3)),
            endsStatic: sumOnly(b2) === sumOnly(b3),
          };
        }

        // ---- ③ 结论区（callout）----
        const callout = await lab.evaluate((el) => {
          let x = el.nextElementSibling;
          while (x && !x.classList.contains('callout')) x = x.nextElementSibling;
          return x ? x.textContent.trim() : '';
        });

        labs.push({ ...meta, autoMotion, buttonMotion, slidersRun: sliderResults, callout });
        console.log(`  ${id}/${key}  自走Δ=${autoMotion.d02}${autoMotion.checksumChanged ? '' : '(校验和不变)'}` +
          (buttonMotion ? `  按钮「${buttonMotion.label}」Δ=${buttonMotion.d03}${buttonMotion.endsStatic ? ' 收尾静止' : ''}` : '') +
          `  滑块=${sliderResults.map((s) => `${s.ctrl}:${s.readoutChanged ? '文案变' : '文案不变'}/Δ${s.canvasDiff}`).join(' ')}`);
      }

      summary[id] = { ...pageInfo, errors: errs, labs };
      fs.writeFileSync(path.join(OUT, `${id}.json`), JSON.stringify(summary[id], null, 2));
      console.log(`===== ${id} 完成（实验 ${n} 个，报错 ${errs.length}）=====`);
      await ctx.close();
    }
    await browser.close();
  } catch (e) {
    console.error('❌ 异常:', e.message);
    summary.fatal = e.message;
  } finally {
    srv.kill();
  }
  fs.writeFileSync(path.join(OUT, '_summary.json'), JSON.stringify({ stations: Object.keys(summary), summary }, null, 2));
  console.log(`\n=== 数据已写 ${OUT} ===`);
  setTimeout(() => process.exit(0), 300);
})();

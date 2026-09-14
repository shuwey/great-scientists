/* 新版「玩一玩」实验验证：逐实验截图 + 滑块联动 + 运行时报错
   用法：node tools/verify_newlabs.js copernicus kepler …
        node tools/verify_newlabs.js --all   （跑 tools/newlabs/ 下全部站点）
   产出：<项目外的验证产物目录>/new/<site>_<kind>_{a,b,c}.png  +  new_labs_report.json
        （默认 ../读懂牛顿-验证产物/shots，可用 SHOTS_DIR 覆盖）
*/
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8117;
const BASE = `http://localhost:${PORT}`;
const PY = '/Users/shuwei/.workbuddy/binaries/python/versions/3.13.12/bin/python3';
// 截图输出目录：默认放在项目**外**（不参与静态发布上传），可用 SHOTS_DIR 覆盖
const SHOTS = process.env.SHOTS_DIR || path.resolve(ROOT, '..', '读懂牛顿-验证产物', 'shots');
const OUT = path.join(SHOTS, 'new');
fs.mkdirSync(OUT, { recursive: true });

let ids = process.argv.slice(2);
if (!ids.length || ids.includes('--all')) {
  ids = fs.readdirSync(path.join(ROOT, 'tools/newlabs'))
    .filter(f => f.endsWith('.py')).map(f => f.slice(0, -3)).sort();
}

const noise = (s) => /favicon|404|Failed to load resource|net::ERR/i.test(s);

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

const setSlider = (idx, which, val) => ({ idx, which, val });

(async () => {
  const srv = spawn(PY, ['-m', 'http.server', String(PORT), '--directory', ROOT], { stdio: 'ignore' });
  const report = {};
  try {
    await waitServer();
    const browser = await chromium.launch();
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('console', (m) => { if (m.type() === 'error' && !noise(m.text())) errs.push('console: ' + m.text()); });
    pg.on('pageerror', (e) => errs.push('pageerror: ' + e.message));

    for (const id of ids) {
      const url = `${BASE}/scientists/${id}/labs.html`;
      errs.length = 0;
      await pg.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
      await pg.waitForTimeout(500);

      const kinds = await pg.$$eval('.lab', (els) => els.map((e) => e.getAttribute('data-lab')));
      const rec = { kinds: kinds, labs: [], pageErrors: [] };

      for (let i = 0; i < kinds.length; i++) {
        const canvases = await pg.$$('.lab canvas');
        const info = await pg.evaluate((idx) => {
          const lab = document.querySelectorAll('.lab')[idx];
          const ins = Array.from(lab.querySelectorAll('input[type="range"]'));
          return {
            readout: (lab.querySelector('.lab-readout') || {}).textContent || '',
            sliders: ins.map((s) => ({ min: +s.min, max: +s.max, value: +s.value, step: +s.step })),
          };
        }, i);

        const shot = (tag) => canvases[i].screenshot({ path: `${OUT}/${id}_${kinds[i]}_${tag}.png` }).catch(() => {});
        const inkOf = () => pg.evaluate((idx) => {
          const cv = document.querySelectorAll('.lab canvas')[idx];
          const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
          let n = 0;
          for (let k = 0; k < d.length; k += 4) {
            if (d[k] < 248 || d[k + 1] < 248 || d[k + 2] < 248) n++;
          }
          return { total: d.length / 4, ink: n, w: cv.width, h: cv.height };
        }, idx0(i));

        await shot('a');
        const ink0 = await inkOf();
        const reads = [];
        for (const frac of [0.12, 0.5, 0.9]) {
          await pg.evaluate(({ idx, frac }) => {
            const lab = document.querySelectorAll('.lab')[idx];
            lab.querySelectorAll('input[type="range"]').forEach((s, j) => {
              const f = j === 0 ? frac : 1 - frac;
              s.value = String(+s.min + (+s.max - +s.min) * f);
              s.dispatchEvent(new Event('input', { bubbles: true }));
            });
          }, { idx: i, frac });
          await pg.waitForTimeout(260);
          reads.push((await pg.evaluate((idx) => {
            const lab = document.querySelectorAll('.lab')[idx];
            return (lab.querySelector('.lab-readout') || {}).textContent || '';
          }, i)).trim());
        }
        await shot('b');
        await pg.waitForTimeout(6500);
        await shot('c');
        const ink1 = await inkOf();

        rec.labs.push({
          kind: kinds[i],
          sliders: info.sliders.length,
          readoutChanges: new Set(reads).size > 1,
          readoutSample: reads[1] || reads[0],
          inkRatio: +(ink1.ink / ink1.total).toFixed(4),
          canvas: `${ink1.w}x${ink1.h}`,
        });
        console.log(`  ${id}/${kinds[i]}: 滑块${info.sliders.length}个 读数变化=${new Set(reads).size > 1 ? '是' : '否'} 墨迹比=${(ink1.ink / ink1.total * 100).toFixed(1)}%`);
      }

      rec.pageErrors = errs.slice();
      report[id] = rec;
      console.log(`${errs.length ? '❌' : '✅'} ${id} 运行时报错 ${errs.length}${errs.length ? ' -> ' + errs.join(' ; ') : ''}`);
    }
    await browser.close();
  } catch (e) {
    console.log('!! 脚本异常: ' + e.message);
  } finally {
    srv.kill();
    fs.writeFileSync(path.join(SHOTS, 'new_labs_report.json'), JSON.stringify(report, null, 1));
    console.log(`\n报告已写 ${path.relative(ROOT, SHOTS)}/new_labs_report.json`);
  }
})();

function idx0(i) { return i; }

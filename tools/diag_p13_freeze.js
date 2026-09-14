/**
 * P1-3 诊断：为什么 faraday 的 ac / induction、turing 的 turing 暂停后仍在变？
 * 对每个实验：点暂停 → 连续采 8 次画布指纹（每 200ms 一次），看是否真的还在变；
 * 同时报告按钮文字、以及"暂停—继续—再暂停"的指纹变化量。
 * 用法：node tools/diag_p13_freeze.js faraday,turing
 */
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8147;
const BASE = `http://localhost:${PORT}`;
const PY = '/Users/shuwei/.workbuddy/binaries/python/versions/3.13.12/bin/python3';
const TARGETS = (process.argv[2] || 'faraday,turing').split(',');

const waitServer = () => new Promise((res, rej) => {
  const t0 = Date.now();
  const tick = () => http.get(`${BASE}/index.html`, (r) => { r.destroy(); res(); })
    .on('error', () => (Date.now() - t0 > 15000 ? rej(new Error('server timeout')) : setTimeout(tick, 300)));
  tick();
});

function listLabs() {
  return Array.prototype.map.call(document.querySelectorAll('.lab'), function (lab, i) {
    return { i: i, kind: lab.getAttribute('data-lab'), hasTools: !!lab.querySelector('.lab-anim-tools') };
  });
}
function hashLab(i) {
  var lab = document.querySelectorAll('.lab')[i];
  var cv = lab.querySelector('canvas');
  var d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
  var h = 2166136261 >>> 0;
  for (var k = 0; k < d.length; k += 16) { h ^= d[k]; h = Math.imul(h, 16777619); h ^= d[k + 1]; h = Math.imul(h, 16777619); }
  return h >>> 0;
}
/* 差异像素占比：比指纹更能说明"变了多少" */
function diffPct(i) {
  var lab = document.querySelectorAll('.lab')[i];
  var cv = lab.querySelector('canvas');
  var ctx = cv.getContext('2d');
  if (!lab.__prev) { lab.__prev = ctx.getImageData(0, 0, cv.width, cv.height).data; return -1; }
  var cur = ctx.getImageData(0, 0, cv.width, cv.height).data;
  var p = lab.__prev, n = 0, tot = 0;
  for (var k = 0; k < cur.length; k += 16) { tot++; if (Math.abs(cur[k] - p[k]) > 6) n++; }
  lab.__prev = cur;
  return +(100 * n / tot).toFixed(2);
}
function clickAnim(a) {
  var lab = document.querySelectorAll('.lab')[a.i];
  var b = lab.querySelector('[data-anim="' + a.which + '"]');
  if (!b) return null;
  b.click();
  var t = lab.querySelector('[data-anim="toggle"]');
  return { btn: t ? t.textContent.trim() : '', cls: b.className };
}

(async () => {
  const srv = spawn(PY, ['-m', 'http.server', String(PORT), '--directory', ROOT], { stdio: 'ignore' });
  try {
    await waitServer();
    const browser = await chromium.launch();
    const pg = await browser.newPage({ viewport: { width: 1500, height: 1200 }, deviceScaleFactor: 1 });
    for (const id of TARGETS) {
      await pg.goto(`${BASE}/scientists/${id}/labs.html`, { waitUntil: 'load' });
      await pg.waitForTimeout(700);
      const labs = await pg.evaluate(listLabs);
      console.log(`\n===== ${id} =====`);
      for (const l of labs) {
        if (!l.hasTools) { console.log(`  · ${l.kind.padEnd(11)} 无按钮`); continue; }
        // 先在运行态量一次"每帧变化"
        await pg.evaluate(diffPct, l.i);
        await pg.waitForTimeout(200);
        const runDiff = await pg.evaluate(diffPct, l.i);
        // 暂停
        const st = await pg.evaluate(clickAnim, { i: l.i, which: 'toggle' });
        await pg.waitForTimeout(150);
        await pg.evaluate(diffPct, l.i);            // 重置基准
        const seq = [];
        for (let k = 0; k < 8; k++) {
          await pg.waitForTimeout(200);
          seq.push(await pg.evaluate(diffPct, l.i));
        }
        const changed = seq.filter((x) => x > 0.05).length;
        console.log(`  · ${l.kind.padEnd(11)} 运行态每200ms变化 ${runDiff}%  |  点「${st && st.btn}」后 8 次采样变化%: [${seq.join(', ')}]  → ${changed === 0 ? '✅冻结' : '❌仍在变 ' + changed + ' 次'}`);
      }
    }
    await browser.close();
  } catch (e) { console.error('❌', e.message); } finally { srv.kill(); }
  setTimeout(() => process.exit(0), 300);
})();

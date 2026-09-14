/**
 * P1-3 实测探针：自走动画的 ⏸暂停 / ⏭单步 / ▶继续
 * 对每个子站的 labs.html：
 *   ① 有哪些 .lab 拿到了按钮（应只有"会自己动"的那几段）
 *   ② 暂停后画面是否真的冻结（两次采样的画布指纹完全相同）
 *   ③ 单步是否正好向前走一帧（指纹变化一次，然后重新冻住）
 *   ④ 继续后是否重新动起来
 * 全程捕获 pageerror / console.error。
 * 用法：node tools/probe_p13_pause.js [站1,站2,...]
 */
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const OUT = '/Users/shuwei/WorkBuddy/读懂牛顿-验证产物/labs-anim/p13';
const PORT = 8145;
const BASE = `http://localhost:${PORT}`;
const PY = '/Users/shuwei/.workbuddy/binaries/python/versions/3.13.12/bin/python3';
const VW = 1500;

const ALL = ['bohr', 'copernicus', 'curie', 'darwin', 'einstein', 'faraday', 'feynman', 'galileo',
  'hawking', 'kepler', 'maxwell', 'mendeleev', 'newton', 'pasteur', 'turing'];
const TARGETS = (process.argv[2] || ALL.join(',')).split(',');

const waitServer = () => new Promise((res, rej) => {
  const t0 = Date.now();
  const tick = () => http.get(`${BASE}/index.html`, (r) => { r.destroy(); res(); })
    .on('error', () => (Date.now() - t0 > 15000 ? rej(new Error('server timeout')) : setTimeout(tick, 300)));
  tick();
});

/* ---------- 页面内工具 ---------- */
function listLabs() {
  return Array.prototype.map.call(document.querySelectorAll('.lab'), function (lab, i) {
    return {
      i: i, kind: lab.getAttribute('data-lab'),
      hasTools: !!lab.querySelector('.lab-anim-tools'),
      toolsRows: lab.querySelectorAll('.lab-anim-tools').length,
      btnCount: lab.querySelectorAll('.lab-anim-btn').length,
      toggleText: (function () { var b = lab.querySelector('[data-anim="toggle"]'); return b ? b.textContent.trim() : ''; })()
    };
  });
}
function hashLab(i) {
  var lab = document.querySelectorAll('.lab')[i];
  var cv = lab.querySelector('canvas');
  var d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
  var h = 2166136261 >>> 0;
  for (var k = 0; k < d.length; k += 16) {
    h ^= d[k]; h = Math.imul(h, 16777619);
    h ^= d[k + 1]; h = Math.imul(h, 16777619);
    h ^= d[k + 2]; h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function clickAnim(args) {
  var lab = document.querySelectorAll('.lab')[args.i];
  var b = lab.querySelector('[data-anim="' + args.which + '"]');
  if (!b) return false;
  b.click();
  return true;
}
function clickLaunch(i) {
  var lab = document.querySelectorAll('.lab')[i];
  var b = lab.querySelector('.lab-controls button, .lab-head button, button');
  if (!b) return false;
  b.click();
  return true;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const srv = spawn(PY, ['-m', 'http.server', String(PORT), '--directory', ROOT], { stdio: 'ignore' });
  const errs = [];
  let nBtn = 0, nFrozen = 0, nStep = 0, nResume = 0, nAnimated = 0, nDup = 0;
  try {
    await waitServer();
    const browser = await chromium.launch();
    const pg = await browser.newPage({ viewport: { width: VW, height: 1200 }, deviceScaleFactor: 1 });
    pg.setDefaultTimeout(20000);
    pg.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
    pg.on('console', (m) => { if (m.type() === 'error') errs.push('console.error: ' + m.text()); });

    for (const id of TARGETS) {
      const url = `${BASE}/scientists/${id}/labs.html`;
      try { await pg.goto(url, { waitUntil: 'load' }); } catch (e) { console.log(`== ${id}: ❌ 打不开 ${e.message}`); continue; }
      await pg.waitForTimeout(650);
      const labs = await pg.evaluate(listLabs);
      console.log(`== ${id}  （共 ${labs.length} 个实验，带按钮 ${labs.filter((l) => l.hasTools).length} 个）`);
      console.log('   ' + labs.map((l) => `${l.kind}${l.hasTools ? '⏸' : '—'}${l.toolsRows > 1 ? '(!!' + l.toolsRows + '行)' : ''}${l.hasTools && l.btnCount !== 2 ? '(!!' + l.btnCount + '钮)' : ''}`).join('  '));
      const dups = labs.filter((l) => l.toolsRows > 1 || (l.hasTools && l.btnCount !== 2));
      if (dups.length) console.log(`   ❌ 按钮行重复/数量异常：${dups.map((l) => l.kind + '×' + l.toolsRows + '行/' + l.btnCount + '钮').join('、')}`);

      for (const l of labs) {
        if (!l.hasTools) continue;
        nBtn++;
        if (l.toolsRows > 1 || l.btnCount !== 2) nDup++;
        const r = { id: id, kind: l.kind };
        // ② 是否在动
        const a1 = await pg.evaluate(hashLab, l.i);
        await pg.waitForTimeout(240);
        const a2 = await pg.evaluate(hashLab, l.i);
        r.moving = a1 !== a2;
        if (!r.moving) { console.log(`   · ${l.kind.padEnd(12)} ⚠️ 有按钮但画面没动`); continue; }
        nAnimated++;
        // ③ 暂停 → 冻结
        await pg.evaluate(clickAnim, { i: l.i, which: 'toggle' });
        await pg.waitForTimeout(120);
        const b1 = await pg.evaluate(hashLab, l.i);
        await pg.waitForTimeout(420);
        const b2 = await pg.evaluate(hashLab, l.i);
        r.frozen = b1 === b2;
        // ④ 单步 → 变一帧后重新冻住
        await pg.evaluate(clickAnim, { i: l.i, which: 'step' });
        await pg.waitForTimeout(140);
        const c1 = await pg.evaluate(hashLab, l.i);
        await pg.waitForTimeout(360);
        const c2 = await pg.evaluate(hashLab, l.i);
        r.stepMoved = c1 !== b2;
        r.stepFrozen = c1 === c2;
        // ⑤ 继续 → 重新动
        await pg.evaluate(clickAnim, { i: l.i, which: 'toggle' });
        await pg.waitForTimeout(260);
        const d1 = await pg.evaluate(hashLab, l.i);
        await pg.waitForTimeout(240);
        const d2 = await pg.evaluate(hashLab, l.i);
        r.resumed = d1 !== d2;
        const t = await pg.evaluate((i) => {
          var lab = document.querySelectorAll('.lab')[i];
          return (lab.querySelector('[data-anim="toggle"]') || {}).textContent || '';
        }, l.i);

        if (r.frozen) nFrozen++;
        if (r.stepMoved && r.stepFrozen) nStep++;
        if (r.resumed) nResume++;
        console.log(`   · ${l.kind.padEnd(12)} 在动 ✅  暂停后冻结 ${r.frozen ? '✅' : '❌'}  单步走一帧 ${(r.stepMoved && r.stepFrozen) ? '✅' : (r.stepMoved ? '⚠️走了但没停住' : '❌没动')}  继续后恢复 ${r.resumed ? '✅' : '❌'}  按钮文字「${t.trim()}」`);
      }
    }

    /* 牛顿抛体：点发射后是否出现按钮（懒注入的兜底探测要等闸门启动 + 两次采样） */
    console.log('\n== 懒注入检查：牛顿抛体（点「发射」后才开始动） ==');
    await pg.goto(`${BASE}/scientists/newton/labs.html`, { waitUntil: 'load' });
    await pg.waitForTimeout(3400);
    const before = await pg.evaluate(listLabs);
    const proj = before.find((l) => l.kind === 'projectile');
    console.log(`   启动兜底探测后：${proj.kind} 带按钮？${proj.hasTools ? '是（已自行开始动）' : '否（符合预期，还没发射）'}`);
    await pg.evaluate(clickLaunch, proj.i);
    await pg.waitForTimeout(2400);
    const after = await pg.evaluate(listLabs);
    const proj2 = after.find((l) => l.kind === 'projectile');
    console.log(`   发射后：${proj2.kind} 带按钮？${proj2.hasTools ? '✅ 是' : '❌ 否'}`);
    if (proj2.hasTools) {
      await pg.evaluate(clickAnim, { i: proj2.i, which: 'toggle' });
      await pg.waitForTimeout(120);
      const f1 = await pg.evaluate(hashLab, proj2.i);
      await pg.waitForTimeout(420);
      const f2 = await pg.evaluate(hashLab, proj2.i);
      console.log(`   暂停抛体动画后冻结：${f1 === f2 ? '✅' : '❌'}`);
    }
    await pg.locator('.lab[data-lab="projectile"]').screenshot({ path: path.join(OUT, 'newton_projectile.png') }).catch(() => {});

    await browser.close();
    console.log('\n== 汇总 ==');
    console.log(`   带按钮的动画实验 ${nBtn} 个（其中确认在动的 ${nAnimated} 个）`);
    console.log(`   暂停后冻结 ${nFrozen}/${nAnimated}　单步走一帧 ${nStep}/${nAnimated}　继续后恢复 ${nResume}/${nAnimated}`);
    console.log(`   按钮行重复 ${nDup} 个实验`);
    console.log('\n== 运行时错误 ==');
    console.log(errs.length ? errs.join('\n') : '  ✅ 无 pageerror / console.error');
  } catch (e) { console.error('❌', e.message); } finally { srv.kill(); }
})();

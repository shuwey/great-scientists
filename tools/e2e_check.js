const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');

const ROOT = '/Users/shuwei/WorkBuddy/读懂牛顿';
const PORT = 8099;
const BASE = `http://localhost:${PORT}`;
const PY = '/Users/shuwei/.workbuddy/binaries/python/versions/3.13.12/bin/python3';
const SHOTS = ROOT + '/tools/shots';
fs.mkdirSync(SHOTS, { recursive: true });

const PAGES = [
  'index.html', 'timeline.html',
  'detail/optics.html', 'detail/calculus.html', 'detail/gravity.html', 'detail/laws.html',
  'labs.html', 'glossary.html', 'about.html'
];

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

const noise = (s) => /favicon|404|Failed to load resource|net::ERR/i.test(s);

(async () => {
  const srv = spawn(PY, ['-m', 'http.server', String(PORT), '--directory', ROOT], { stdio: 'ignore' });
  const report = { pages: {}, interactions: {}, canvas: {} };
  try {
    await waitServer();
    const browser = await chromium.launch();

    // ---------- 1. 逐页双端截图 + 运行时报错 ----------
    for (const p of PAGES) {
      const key = p.replace(/\//g, '_');
      const errs = { desktop: [], mobile: [] };

      // desktop
      const ctxD = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      const pgD = await ctxD.newPage();
      pgD.on('console', (m) => { if (m.type() === 'error' && !noise(m.text())) errs.desktop.push('console: ' + m.text()); });
      pgD.on('pageerror', (e) => errs.desktop.push('pageerror: ' + e.message));
      await pgD.goto(BASE + '/' + p, { waitUntil: 'networkidle', timeout: 20000 });
      await pgD.waitForTimeout(350);
      await pgD.screenshot({ path: `${SHOTS}/${key}_desktop.png`, fullPage: true });
      await ctxD.close();

      // mobile
      const ctxM = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
      const pgM = await ctxM.newPage();
      pgM.on('console', (m) => { if (m.type() === 'error' && !noise(m.text())) errs.mobile.push('console: ' + m.text()); });
      pgM.on('pageerror', (e) => errs.mobile.push('pageerror: ' + e.message));
      await pgM.goto(BASE + '/' + p, { waitUntil: 'networkidle', timeout: 20000 });
      await pgM.waitForTimeout(350);
      await pgM.screenshot({ path: `${SHOTS}/${key}_mobile.png`, fullPage: true });
      await ctxM.close();

      report.pages[p] = errs;
      console.log(`✅ ${p} 截图完成 | 桌面报错 ${errs.desktop.length} · 移动报错 ${errs.mobile.length}`);
    }

    // ---------- 2. 交互验证 ----------
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const pg = await ctx.newPage();

    // 2a 术语弹窗
    await pg.goto(BASE + '/index.html', { waitUntil: 'networkidle' });
    await pg.waitForSelector('[data-term]');
    await pg.click('[data-term]');
    const popupOk = await pg.waitForSelector('.modal-mask.show', { timeout: 3000 }).then(() => true).catch(() => false);
    await pg.waitForTimeout(300);
    await pg.screenshot({ path: `${SHOTS}/interaction_term_popup.png` });
    report.interactions.termPopup = popupOk;
    console.log(`术语弹窗: ${popupOk ? '出现 ✅' : '未出现 ❌'}`);

    // 2b 时间轴展开（点第二项，避免与默认展开的第一项冲突）
    await pg.goto(BASE + '/timeline.html', { waitUntil: 'networkidle' });
    await pg.waitForSelector('.tl-head');
    const heads = await pg.$$('.tl-head');
    let tlOk = false;
    if (heads[1]) {
      await heads[1].click();
      await pg.waitForTimeout(400);
      tlOk = await pg.$$eval('.tl-item', (its) => !!(its[1] && its[1].classList.contains('open')));
    }
    await pg.screenshot({ path: `${SHOTS}/interaction_timeline_expanded.png` });
    report.interactions.timelineExpand = tlOk;
    console.log(`时间轴展开(第二项): ${tlOk ? 'OK ✅' : '未展开 ❌'}`);

    // 2c 词典搜索
    await pg.goto(BASE + '/glossary.html', { waitUntil: 'networkidle' });
    const searchBox = await pg.$('input[type="search"], input[placeholder*="搜索"], #term-search, .search input');
    let searchOk = null;
    if (searchBox) {
      await searchBox.fill('引力');
      await pg.waitForTimeout(400);
      const cnt = await pg.$$eval('.term-card, .glossary-item, li', (els) => els.filter(e => e.offsetParent !== null).length);
      await pg.screenshot({ path: `${SHOTS}/interaction_glossary_search.png` });
      searchOk = cnt;
      console.log(`词典搜索"引力": 可见条目 ${cnt} 条`);
    } else {
      console.log('词典搜索框未找到 ⚠️');
    }
    report.interactions.glossarySearch = searchOk;

    // 2d labs 三个 canvas + 发射
    await pg.goto(BASE + '/labs.html', { waitUntil: 'networkidle' });
    await pg.waitForTimeout(600);
    const canvases = await pg.$$('.lab canvas');
    report.canvas.count = canvases.length;
    const names = ['prism', 'gravity', 'projectile'];
    for (let i = 0; i < canvases.length; i++) {
      const n = names[i] || ('canvas' + i);
      const info = await canvases[i].evaluate((c) => {
        const ctx = c.getContext('2d');
        if (!ctx) return { ok: false };
        const d = ctx.getImageData(0, 0, c.width, c.height).data;
        let nb = 0;
        for (let j = 3; j < d.length; j += 4) if (d[j] > 0) nb++;
        return { ok: true, w: c.width, h: c.height, ratio: +(nb / (c.width * c.height)).toFixed(3) };
      });
      report.canvas[n] = info;
      console.log(`  ${n} canvas: ${info.ok ? `已绘制 像素比=${info.ratio}` : '未绘制/无 2d ctx'}`);
      await canvases[i].screenshot({ path: `${SHOTS}/lab_${n}.png` }).catch(() => {});
    }
    // 发射抛体
    const fireBtn = await pg.$('button.lab-fire');
    if (fireBtn) {
      await fireBtn.click();
      await pg.waitForTimeout(800);
      const proj = canvases[2];
      if (proj) await proj.screenshot({ path: `${SHOTS}/lab_projectile_fired.png` }).catch(() => {});
      report.interactions.projectileFire = true;
      console.log('抛体发射: 已点击发射按钮 ✅');
    }

    await ctx.close();
    await browser.close();
  } catch (e) {
    console.error('❌ 脚本异常:', e.message);
    report.fatal = e.message;
  } finally {
    srv.kill();
  }

  fs.writeFileSync(SHOTS + '/../e2e_report.json', JSON.stringify(report, null, 2));
  console.log('\n=== 报告已写 tools/e2e_report.json ===');
})();

// 线上环境 e2e 抽查：直接打线上站点（默认 great-scientists-05806），
// 逐站抽查 5 类页面，捕获 运行时报错 / 控制台 error / 资源 4xx-5xx，
// 并验证关键内容真的渲染了（时间轴「同期中国」卡片、labs 画布绘制）。
//
// 用法：
//   node tools/e2e_online.js                    # 全站 15 站，桌面
//   node tools/e2e_online.js all 1280,390       # 全站两种宽度
//   node tools/e2e_online.js copernicus,newton 1280
//   E2E_BASE=http://localhost:8099 node tools/e2e_online.js
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BASE = (process.env.E2E_BASE || 'https://great-scientists-05806.app.workbuddy.host').replace(/\/$/, '');
const SHOTS = process.env.SHOTS_DIR || path.resolve(ROOT, '..', '读懂牛顿-验证产物', 'shots');
const ALL = ['copernicus', 'galileo', 'kepler', 'newton', 'faraday', 'darwin', 'pasteur',
  'maxwell', 'mendeleev', 'curie', 'einstein', 'bohr', 'turing', 'feynman', 'hawking'];

// ---- 参数 ----
const argIds = (process.argv[2] || 'all').trim();
const IDS = (argIds === 'all' ? ALL : argIds.split(',').map(s => s.trim()).filter(Boolean));
const WIDTHS = (process.argv[3] || '1280').split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);

// ---- 每个子站抽查的页面 ----
function pagesOf(id) {
  const detail = [];
  const tp = path.join(ROOT, 'scientists', id, 'assets/js/terms.js');
  if (fs.existsSync(tp)) {
    const sandbox = { window: {} };
    try { new Function('window', fs.readFileSync(tp, 'utf8'))(sandbox.window); } catch (e) { }
    const sp = sandbox.window.SITE_PAGES || {};
    for (const k in sp) if (sp[k] && sp[k].url) detail.push(sp[k].url);
  }
  return ['index.html', 'timeline.html', detail[0] || 'index.html', 'labs.html', 'glossary.html'];
}

const ignoreUrl = (u) => /favicon|\/\.well-known|analytics|googleapis|gstatic/i.test(u);
const shotName = (...a) => a.filter(Boolean).join('_');

async function checkPage(browser, id, page, width) {
  const ctx = await browser.newContext({
    viewport: { width, height: width < 500 ? 844 : 900 },
    isMobile: width < 500,
  });
  const pg = await ctx.newPage();
  const errors = [], httpBad = [], failed = [], warnings = [];
  pg.on('pageerror', e => errors.push('pageerror: ' + e.message));
  pg.on('console', m => {
    const t = m.text();
    if (ignoreUrl(t)) return;
    if (m.type() === 'error') errors.push('console: ' + t);
    else if (m.type() === 'warning') warnings.push(t);
  });
  pg.on('response', r => {
    if (r.status() >= 400 && !ignoreUrl(r.url())) httpBad.push(`${r.status()} ${short(r.url())}`);
  });
  pg.on('requestfailed', r => {
    if (!ignoreUrl(r.url())) failed.push(`${(r.failure() || {}).errorText || 'failed'} ${short(r.url())}`);
  });

  let status = null, extra = {};
  const url = `${BASE}/scientists/${id}/${page}`;
  try {
    const resp = await pg.goto(url, { waitUntil: 'load', timeout: 45000 });
    status = resp ? resp.status() : null;
    await pg.waitForTimeout(600);
    if (page === 'timeline.html') {
      extra = await pg.evaluate(() => {
        const nodes = [...document.querySelectorAll('[data-year]')];
        const notes = [...document.querySelectorAll('.cn-note')];
        const sample = notes.length ? notes[0].querySelector('.cn-head') : null;
        return {
          nodes: nodes.length, notes: notes.length,
          sampleHead: sample ? sample.textContent.trim() : null,
          chinaJs: !!document.querySelector('script[src*="china.js"]'),
        };
      });
    } else if (page === 'labs.html') {
      extra = await pg.evaluate(() => {
        const cs = [...document.querySelectorAll('.lab canvas')];
        return cs.map(c => {
          const cx = c.getContext('2d');
          if (!cx) return -1;
          const d = cx.getImageData(0, 0, c.width, c.height).data;
          let nb = 0; for (let j = 3; j < d.length; j += 4) if (d[j] > 0) nb++;
          return +(nb / (c.width * c.height)).toFixed(3);
        });
      });
    }
  } catch (e) {
    errors.push('goto: ' + e.message.split('\n')[0]);
  }
  await ctx.close();
  return { status, errors, httpBad, failed, warnings, extra, url };
}

function short(u) { return u.replace(BASE, '').slice(0, 110); }

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const browser = await chromium.launch({ args: ['--ignore-certificate-errors'] });
  const report = { base: BASE, widths: WIDTHS, scientists: {}, startedAt: new Date().toISOString() };
  const problems = [];
  const t0 = Date.now();

  for (const id of IDS) {
    report.scientists[id] = {};
    for (const page of pagesOf(id)) {
      for (const w of WIDTHS) {
        const r = await checkPage(browser, id, page, w);
        report.scientists[id][`${page}@${w}`] = r;
        const tags = [];
        if (r.status !== 200) tags.push(`HTTP ${r.status}`);
        if (r.errors.length) tags.push(`报错 ${r.errors.length}`);
        if (r.httpBad.length) tags.push(`资源异常 ${r.httpBad.length}`);
        if (r.failed.length) tags.push(`请求失败 ${r.failed.length}`);

        let note = '';
        if (page === 'timeline.html') {
          const { nodes, notes, sampleHead, chinaJs } = r.extra;
          note = ` | 节点 ${nodes} · 同期中国卡片 ${notes} · china.js ${chinaJs ? '✓' : '✗'}`;
          if (notes !== nodes) tags.push(`卡片缺失 ${nodes - notes}`);
          if (!chinaJs) tags.push('未挂 china.js');
          if (sampleHead) note += ` | 首卡「${sampleHead}」`;
        }
        if (page === 'labs.html') {
          const ratios = r.extra || [];
          const blank = ratios.filter(x => x <= 0.005).length;
          note = ` | 画布 ${ratios.length} 个 [${ratios.join(', ')}]`;
          if (blank) tags.push(`画布空白 ${blank}`);
        }
        const bad = tags.length > 0;
        if (bad) problems.push(`${id}/${page}@${w} → ${tags.join(' / ')}`);
        console.log(`${bad ? '❌' : '✅'} ${id}/${page}@${w} HTTP ${r.status}${note}${bad ? '  ⚠ ' + tags.join(' / ') : ''}`);
        if (r.errors.length) r.errors.slice(0, 3).forEach(e => console.log('      · ' + e.slice(0, 160)));
        if (r.httpBad.length) r.httpBad.slice(0, 3).forEach(e => console.log('      · ' + e));
        if (r.failed.length) r.failed.slice(0, 3).forEach(e => console.log('      · ' + e));
      }
    }
  }

  // ---------- 交互抽查（代表站）----------
  console.log('\n=== 交互抽查 ===');
  const inter = {};
  const pick = IDS.filter(x => ['copernicus', 'newton', 'faraday', 'turing', 'hawking'].includes(x));
  const interact_ids = pick.length ? pick : IDS.slice(0, 3);
  for (const id of interact_ids) {
    const detail = pagesOf(id).find(p => p.startsWith('detail/')) || 'index.html';
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('pageerror', e => errs.push(e.message));

    // 术语弹窗
    await pg.goto(`${BASE}/scientists/${id}/${detail}`, { waitUntil: 'load', timeout: 45000 }).catch(() => { });
    await pg.waitForTimeout(400);
    let popup = false, termCount = 0;
    try {
      termCount = await pg.$$eval('[data-term]', els => els.length);
      if (termCount) {
        await pg.click('[data-term]');
        popup = await pg.waitForSelector('.modal-mask.show', { timeout: 3000 }).then(() => true).catch(() => false);
      }
    } catch (e) { }
    await pg.keyboard.press('Escape').catch(() => { });
    await pg.screenshot({ path: `${SHOTS}/${shotName('online', id, 'term')}.png` }).catch(() => { });

    // 「详解 ▾」下拉
    await pg.goto(`${BASE}/scientists/${id}/index.html`, { waitUntil: 'load', timeout: 45000 }).catch(() => { });
    await pg.waitForTimeout(400);
    const menu = await pg.evaluate(() => {
      const more = document.querySelector('.nav-more');
      const btn = document.querySelector('.nav-more-btn');
      const menuEl = document.querySelector('.nav-more-menu');
      if (!more || !btn || !menuEl) return { has: false };
      const b = btn.getBoundingClientRect();
      const items = [...menuEl.querySelectorAll('a')];
      return {
        has: true, items: items.length,
        btnW: Math.round(b.width), btnH: Math.round(b.height),
        menuW: Math.round(menuEl.getBoundingClientRect().width),
      };
    });
    if (menu.has) {
      await pg.hover('.nav-more').catch(() => { });
      await pg.waitForTimeout(350);
      menu.visibleOnHover = await pg.evaluate(() => {
        const m = document.querySelector('.nav-more-menu');
        return m ? getComputedStyle(m).visibility !== 'hidden' && m.getBoundingClientRect().height > 10 : false;
      });
      await pg.screenshot({ path: `${SHOTS}/${shotName('online', id, 'navmore')}.png` }).catch(() => { });
    }

    // 词典搜索
    await pg.goto(`${BASE}/scientists/${id}/glossary.html`, { waitUntil: 'load', timeout: 45000 }).catch(() => { });
    await pg.waitForTimeout(400);
    const gl = await pg.evaluate(() => {
      const box = document.querySelector('input[type="search"], input[placeholder*="搜索"], #term-search');
      const before = [...document.querySelectorAll('.term-card, .glossary-item')].filter(e => e.offsetParent !== null).length;
      return { hasBox: !!box, before };
    });
    let glAfter = null;
    if (gl.hasBox) {
      const box = await pg.$('input[type="search"], input[placeholder*="搜索"], #term-search');
      await box.fill('理论').catch(() => { });
      await pg.waitForTimeout(400);
      glAfter = await pg.evaluate(() => [...document.querySelectorAll('.term-card, .glossary-item')].filter(e => e.offsetParent !== null).length);
    }
    await ctx.close();

    inter[id] = { detail, termCount, popup, menu, glossaryBefore: gl.before, glossaryAfter: glAfter, pageerrors: errs.length };
    const ok = popup && (!menu.has || menu.visibleOnHover) && errs.length === 0;
    if (!ok) problems.push(`${id} 交互 → 弹窗${popup ? '✓' : '✗'} 下拉${menu.visibleOnHover ? '✓' : '✗'} 报错${errs.length}`);
    console.log(`${ok ? '✅' : '❌'} ${id} 交互 | 术语 ${termCount} 条·弹窗 ${popup ? '✓' : '✗'} | 下拉 ${menu.has ? `${menu.items} 项 ${menu.visibleOnHover ? '可展开✓' : '未展开✗'}` : '无'} | 词典 ${gl.before}→${glAfter} | 报错 ${errs.length}`);
  }
  report.interactions = inter;

  await browser.close();
  report.problems = problems;
  report.elapsedSec = Math.round((Date.now() - t0) / 1000);
  const out = path.join(SHOTS, 'e2e_online_report.json');
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  console.log(`\n===== 汇总 =====`);
  console.log(`站点 ${BASE}`);
  console.log(`抽查 ${IDS.length} 站 × ${WIDTHS.length} 宽度 × 5 页｜耗时 ${report.elapsedSec}s`);
  console.log(problems.length ? `❌ 问题 ${problems.length} 项：\n - ${problems.join('\n - ')}` : '✅ 全部通过，0 问题');
  console.log(`报告：${out}`);
  setTimeout(() => process.exit(problems.length ? 1 : 0), 200);
})();

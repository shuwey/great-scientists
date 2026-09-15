// A/B 对照：同一页面只切换「配图是否撑满」这一条 CSS，截同一元素
// 用法：node tools/shot_tl_figure_ab.js
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');

const ROOT = process.cwd();
const OUT = process.env.SHOTS_DIR || path.resolve(ROOT, '..', '读懂牛顿-验证产物', 'shots', 'einstein');
const PORT = 8093;
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json', '.ico': 'image/x-icon' };
const srv = http.createServer((req, res) => {
  let p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (p.endsWith('/')) p += 'index.html';
  fs.readFile(p, (e, d) => {
    if (e) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
    res.end(d);
  });
});

// 还原「改前」：把图片元素重新撑满容器（object-fit:contain 再把内容缩到中间）
const BEFORE_CSS = `
  .tl-panel figure img:not([src$=".svg"]), .tl-body figure img:not([src$=".svg"]) {
    width: 100% !important; max-width: none !important; margin: 0 !important;
  }`;

const CASES = [
  { id: 'einstein', year: '1921', sel: '.tl-panel' },
  { id: 'einstein', year: '1905', sel: '.tl-panel' },
  { id: 'bohr', year: '1943', sel: '.tl-body' },
  { id: 'curie', year: '1914', sel: '.tl-body' },
  { id: 'galileo', year: '1610', sel: '.tl-body' },
];

(async () => {
  await new Promise(r => srv.listen(PORT, r));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: 2 });
  fs.mkdirSync(OUT, { recursive: true });
  const made = [];

  for (const c of CASES) {
    await page.goto(`http://localhost:${PORT}/scientists/${c.id}/timeline.html`, { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      document.querySelectorAll('.tl-item').forEach(it => { if (it.querySelector('.tl-panel')) it.classList.add('open'); });
      document.querySelectorAll('img[loading="lazy"]').forEach(i => { i.loading = 'eager'; });
    });
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.8;
      for (let y = 0; y < document.body.scrollHeight; y += step) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
    });
    await page.waitForTimeout(700);

    const handle = await page.evaluateHandle(({ year, sel }) => {
      const it = [...document.querySelectorAll('.tl-item')].find(x => x.dataset.year === year);
      return it ? it.querySelector(sel) : null;
    }, { year: c.year, sel: c.sel });
    const el = handle.asElement();
    if (!el) { console.log(`跳过 ${c.id} ${c.year}（未找到）`); continue; }

    for (const [tag, inject] of [['before', true], ['after', false]]) {
      await page.evaluate(({ css, on }) => {
        const old = document.getElementById('__ab');
        if (old) old.remove();
        if (on) { const s = document.createElement('style'); s.id = '__ab'; s.textContent = css; document.head.appendChild(s); }
      }, { css: BEFORE_CSS, on: inject });
      await page.waitForTimeout(260);
      const f = path.join(OUT, `tlfig-${c.id}-${c.year}-${tag}.png`);
      await el.screenshot({ path: f });
      made.push(f);
    }
    console.log(`✓ ${c.id} ${c.year}`);
  }
  await browser.close(); srv.close();
  console.log('\n产出：');
  made.forEach(f => console.log('  ' + f));
})();

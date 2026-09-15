// 影调统一 A/B 实拍：同一页面注入还原 CSS（--hist-tone:none）作为「改前」，消环境抖动
// 产物：<SHOTS_DIR>/ab-<slug>-on.png / -off.png（同一 box，可直接并排）
// 用法：node tools/shot_hist_tone_ab.js
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');

const ROOT = process.cwd();
const PORT = 8097;
const OUT = process.env.SHOTS_DIR
  || path.resolve(ROOT, '..', '读懂牛顿-验证产物', 'shots', 'tone', 'render');
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.json': 'application/json', '.ico': 'image/x-icon' };
const srv = http.createServer((req, res) => {
  let p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (p.endsWith('/')) p += 'index.html';
  fs.readFile(p, (e, d) => {
    if (e) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
    res.end(d);
  });
});

const SHOTS = [
  { slug: 'portal-newton', url: 'index.html', sel: 'img[src*="newton-portrait"]' },
  { slug: 'galileo-index', url: 'scientists/galileo/index.html', sel: 'img[src*="-portrait"]' },
  { slug: 'copernicus-index', url: 'scientists/copernicus/index.html', sel: 'img[src*="-portrait"]' },
  { slug: 'maxwell-index', url: 'scientists/maxwell/index.html', sel: 'img[src*="-portrait"]' },
  { slug: 'einstein-timeline', url: 'scientists/einstein/timeline.html', sel: '.tl-item figure img[src*="-portrait"]' },
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  await new Promise(r => srv.listen(PORT, r));
  const browser = await chromium.launch();
  for (const s of SHOTS) {
    for (const mode of ['off', 'on']) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
      await page.goto(`http://localhost:${PORT}/${s.url}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => {
        document.querySelectorAll('.tl-item').forEach(it => { if (it.querySelector('.tl-panel')) it.classList.add('open'); });
        document.querySelectorAll('img[loading="lazy"]').forEach(i => { i.loading = 'eager'; });
      });
      if (mode === 'off') {
        await page.addStyleTag({ content: ':root{--hist-tone:none !important}' });
      }
      const el = await page.$(s.sel);
      if (!el) { console.log(`  !! 未找到 ${s.sel} @ ${s.url}`); await page.close(); continue; }
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      const box = await el.boundingBox();
      await page.screenshot({ path: path.join(OUT, `ab-${s.slug}-${mode}.png`), clip: box });
      console.log(`  ${s.slug.padEnd(18)} ${mode.padEnd(3)} ${Math.round(box.width)}×${Math.round(box.height)}`);
      await page.close();
    }
  }
  await browser.close(); srv.close();
  console.log('done →', OUT);
})();

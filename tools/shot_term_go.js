/* 前后对照：术语弹窗点「了解更多」时，弹窗有没有让开、目标小节有没有进视野 */
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const http = require('http'); const fs = require('fs'); const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SHOTS = process.env.SHOTS_DIR || path.resolve(ROOT, '..', '读懂牛顿-验证产物', 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const PORT = 8093;

function serve() {
  return new Promise((resolve) => {
    const s = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      let f = path.join(ROOT, p);
      if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
      if (!fs.existsSync(f)) { res.writeHead(404); return res.end('404'); }
      const ct = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
        '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon' }[path.extname(f)] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': ct }); fs.createReadStream(f).pipe(res);
    });
    s.listen(PORT, () => resolve(s));
  });
}

(async () => {
  const server = await serve();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1100, height: 800 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();

  const cases = [
    ['hawking', 'detail/blackhole.html', 'blackhole'],
    ['newton', 'detail/optics.html', 'white-light'],
  ];

  for (const [id, rel, term] of cases) {
    await page.goto(`http://localhost:${PORT}/scientists/${id}/${rel}`, { waitUntil: 'load' });
    await page.waitForTimeout(300);

    // 打开术语弹窗
    await page.evaluate((t) => document.querySelector(`.term[data-term="${t}"]`).click(), term);
    await page.waitForTimeout(400);
    const a = `${SHOTS}/termgo-${id}-1-modal.png`;
    await page.screenshot({ path: a });

    // 点「了解更多」之后的瞬间状态
    await page.evaluate(() => document.querySelector('#modalGo a.go').click());
    await page.waitForTimeout(900);
    const b = `${SHOTS}/termgo-${id}-2-after.png`;
    await page.screenshot({ path: b });

    const st = await page.evaluate(() => {
      const mask = document.querySelector('.modal-mask');
      const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      return {
        modalOpen: !!(mask && mask.classList.contains('show')),
        bodyLocked: document.body.style.overflow === 'hidden',
        hash: location.hash,
        anchorTop: el ? Math.round(el.getBoundingClientRect().top) : null,
      };
    });
    console.log(`${id}/${rel}\n   截图: ${path.basename(a)} / ${path.basename(b)}`);
    console.log(`   点击后 → 弹窗仍开:${st.modalOpen}  body锁定:${st.bodyLocked}  hash:${st.hash}  锚点距视口顶:${st.anchorTop}px`);
  }

  await browser.close(); server.close();
})();

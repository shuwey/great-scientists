// 图注对齐量化验收：图注「文字范围中心」必须与「图片元素中心」重合
// 判据：同一容器内两者中心 X 之差 ≤ 2px；且图注宽度不变（未引入收缩）
// 用法：node tools/check_tl_caption.js [标签]
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');

const ROOT = process.cwd();
const TAG = process.argv[2] || 'check';
const PORT = 8095;
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
const SITES = fs.readdirSync(path.join(ROOT, 'scientists'))
  .filter(d => fs.existsSync(path.join(ROOT, 'scientists', d, 'timeline.html'))).map(id => ({ id }));
// 除各站 timeline.html 外，还有页面复用同一套 .tl-panel 结构（含图注）
const PAGES = [
  ...SITES.map(s => ({ label: s.id, url: `scientists/${s.id}/timeline.html` })),
  { label: 'newton/index', url: 'scientists/newton/index.html' },
].filter(p => fs.existsSync(path.join(ROOT, p.url)));

(async () => {
  await new Promise(r => srv.listen(PORT, r));
  const browser = await chromium.launch();
  let fail = 0, total = 0;
  for (const vp of [{ width: 1280, height: 900, tag: 'desktop' }, { width: 390, height: 844, tag: 'mobile' }]) {
    console.log(`\n########## ${TAG} · ${vp.tag} (${vp.width}px) ##########`);
    for (const site of PAGES) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, reducedMotion: 'reduce' });
      const errs = [], bad = [];
      page.on('pageerror', e => errs.push(e.message));
      page.on('response', r => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url().split('/').slice(-1)[0]}`); });
      await page.goto(`http://localhost:${PORT}/${site.url}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => {
        document.querySelectorAll('.tl-item').forEach(it => { if (it.querySelector('.tl-panel')) it.classList.add('open'); });
        document.querySelectorAll('img[loading="lazy"]').forEach(i => { i.loading = 'eager'; });
      });
      await page.evaluate(async () => {
        const step = window.innerHeight * 0.8;
        for (let y = 0; y < document.body.scrollHeight; y += step) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 70)); }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(800);

      const r = await page.evaluate(() => {
        const out = [];
        for (const it of document.querySelectorAll('.tl-item')) {
          const img = it.querySelector('figure img'), cap = it.querySelector('figcaption');
          if (!img || !cap) continue;
          const ib = img.getBoundingClientRect(), cb = cap.getBoundingClientRect();
          const rng = document.createRange(); rng.selectNodeContents(cap);
          const tb = rng.getBoundingClientRect();
          const cs = getComputedStyle(cap);
          out.push({
            year: it.dataset.year || '?',
            src: img.getAttribute('src').split('/').pop(),
            align: cs.textAlign,
            capW: Math.round(cb.width),
            imgCenter: ib.left + ib.width / 2,
            textCenter: tb.left + tb.width / 2,
            textW: Math.round(tb.width),
          });
        }
        return out;
      });

      let worst = 0, worstYear = '';
      let badAlign = 0, collapsed = 0;
      for (const v of r) {
        total++;
        const d = Math.abs(v.imgCenter - v.textCenter);
        if (d > worst) { worst = d; worstYear = v.year; }
        if (v.align !== 'center') badAlign++;
        if (v.capW < 100 && v.textW > 40) collapsed++;   // 图注被收窄到很窄
      }
      const okAlign = badAlign === 0 ? '✅' : `❌${badAlign}条非center`;
      console.log(`  ${site.label.padEnd(14)} ${r.length} 条 ｜ 中心最大偏差 ${worst.toFixed(1)}px (${worstYear}) ｜ text-align ${okAlign} ｜ 图注宽 ${r.length ? r[0].capW : '-'} ｜ 收窄异常 ${collapsed}`);
      if (worst > 2) { console.log(`     ⚠️ 中心偏差超 2px`); fail++; }
      if (badAlign) fail++;
      if (collapsed) { console.log(`     ⚠️ 图注被明显收窄`); fail++; }
      if (errs.length) { console.log('     ❌ pageerror:', errs); fail++; }
      if (bad.length) { console.log('     ❌ 4xx/5xx:', bad); fail++; }
      await page.close();
    }
  }
  await browser.close(); srv.close();
  console.log(`\n共检查 ${total} 条图注 ｜ ` + (fail ? `${fail} 项失败` : '全部通过：图注与图片同中轴、宽度未收窄、无 pageerror / 无 4xx'));
  process.exit(fail ? 1 : 0);
})();

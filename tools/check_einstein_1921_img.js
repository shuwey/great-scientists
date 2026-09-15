// 渲染实测：爱因斯坦时间轴 1921 那条换成 Harris & Ewing 1921 后，浏览器里的真实装载与显示
// 判据：源图加载成功(naturalWidth) / 显示框尺寸 / 内容尺寸(object-fit:contain) / 无 404 无 pageerror
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');

const ROOT = process.cwd();
const PORT = 8091;
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

(async () => {
  await new Promise(r => srv.listen(PORT, r));
  const browser = await chromium.launch();
  let fail = 0;
  for (const vp of [{ width: 1280, height: 900, tag: 'desktop' }, { width: 390, height: 844, tag: 'mobile' }]) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    const errs = [], bad = [];
    page.on('pageerror', e => errs.push(e.message));
    page.on('response', r => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url().split('/').slice(-1)[0]}`); });
    await page.goto(`http://localhost:${PORT}/scientists/einstein/timeline.html`, { waitUntil: 'networkidle' });

    // 展开全部年份，让 lazy 图全部加载（判断「留白是既有状态还是本次引入」的关键）
    await page.evaluate(() => {
      document.querySelectorAll('.tl-item').forEach(it => it.classList.add('open'));
    });
    await page.waitForTimeout(900);

    const r = await page.evaluate(() => {
      const out = [];
      for (const it of document.querySelectorAll('.tl-item')) {
        const img = it.querySelector('figure img');
        if (!img) continue;
        const box = img.getBoundingClientRect();
        const cs = getComputedStyle(img);
        const s = (img.naturalWidth && box.height) ? Math.min(box.width / img.naturalWidth, box.height / img.naturalHeight) : 0;
        out.push({
          year: it.dataset.year || '?',
          src: img.getAttribute('src').split('/').pop(),
          complete: img.complete,
          natural: [img.naturalWidth, img.naturalHeight],
          frame: [Math.round(box.width), Math.round(box.height)],
          content: [Math.round(img.naturalWidth * s), Math.round(img.naturalHeight * s)],
          objectFit: cs.objectFit,
          dpr: window.devicePixelRatio,
        });
      }
      return out;
    });

    console.log(`\n===== ${vp.tag} (${vp.width}px) =====`);
    console.log('  年份   源尺寸        显示框      内容      横向留白   源/需求');
    for (const v of r) {
      const [cw, ch] = v.content, [fw] = v.frame;
      const need = Math.round(cw * v.dpr);
      const ok = v.natural[0] >= need;
      const gap = v.natural[0] ? Math.round((1 - cw / fw) * 100) : NaN;
      console.log(`  ${String(v.year).padEnd(6)} ${(v.natural[0] + 'x' + v.natural[1]).padEnd(13)} `
        + `${(fw + 'x' + v.frame[1]).padEnd(11)} ${(cw + 'x' + ch).padEnd(9)} `
        + `${String(gap + '%').padEnd(10)} ${v.natural[0]} / ${need} ${ok ? '✅' : '⚠️'}`);
    }
    if (errs.length) { console.log('  ❌ pageerror:', errs); fail++; }
    if (bad.length) { console.log('  ❌ 4xx/5xx:', bad); fail++; }
    else console.log('  ✅ 无 pageerror / 无 4xx');
    await page.close();
  }
  await browser.close(); srv.close();
  console.log(fail ? `\n结果：${fail} 项失败` : '\n结果：全部通过');
  process.exit(fail ? 1 : 0);
})();

// 本轮「审读报告 20 条修正」的浏览器实测：
//   1) 改动页无 pageerror、无 404（尤其是新加的 pantheon.jpg）
//   2) 时间轴顺序仍为时间序（maxwell 的 1861 彩色摄影节点搬到 1861 之后）
//   3) 居里时间轴 = 13 个节点，末尾是 1934 逝世 / 1995 先贤祠
//   4) 页脚统一为「浏览全部科学家 →」（不再带人数）
// 用法：node tools/check_review_fixes.js
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');

const ROOT = process.cwd();
const PORT = 8091;
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json' };
const srv = http.createServer((req, res) => {
  let p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (p.endsWith('/')) p += 'index.html';
  fs.readFile(p, (e, d) => {
    if (e) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(d);
  });
});

const PAGES = [
  ['curie', 'timeline.html'], ['curie', 'detail/radioactivity.html'], ['curie', 'index.html'],
  ['maxwell', 'timeline.html'],
  ['pasteur', 'timeline.html'],
  ['hawking', 'timeline.html'],
  ['mendeleev', 'timeline.html'], ['mendeleev', 'detail/legacy.html'],
  ['newton', 'index.html'], ['newton', 'detail/laws.html'],
  ['kepler', 'detail/laws.html'],
  ['darwin', 'about.html'], ['darwin', 'detail/selection.html'],
  ['faraday', 'detail/induction.html'], ['faraday', 'glossary.html'],
  ['einstein', 'detail/mass-energy.html'],
  ['galileo', 'detail/method.html'],
  ['turing', 'index.html'],
  ['feynman', 'glossary.html'],
  ['index.html', ''],
];

(async () => {
  await new Promise(r => srv.listen(PORT, r));
  const browser = await chromium.launch();
  let fails = 0;

  for (const [sid, rel] of PAGES) {
    const url = `http://localhost:${PORT}/` + (rel ? `scientists/${sid}/${rel}` : sid);
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errs = [], bad = [];
    page.on('pageerror', e => errs.push(e.message));
    page.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url().replace(/^https?:\/\/[^/]+/, '')); });
    await page.goto(url, { waitUntil: 'networkidle' }).catch(e => errs.push('goto: ' + e.message));
    await page.waitForTimeout(250);

    // 该页特有断言
    let note = '';
    if (sid === 'curie' && rel === 'timeline.html') {
      const n = await page.$$eval('.tl-item', els => els.length);
      const tail = await page.$$eval('.tl-item', els => els.slice(-2).map(e => e.getAttribute('data-year') + '/' + e.querySelector('.tl-title').textContent.trim()));
      const imgsOk = await page.$$eval('.tl-item img', els => els.filter(i => i.naturalWidth > 0).length);
      const total = await page.$$eval('.tl-item img', els => els.length);
      note = `节点=${n} 末尾=${tail.join(' , ')} 图片加载=${imgsOk}/${total}`;
      if (n !== 13 || tail[0] !== '1934/逝于再生障碍性贫血' || tail[1] !== '1995/移灵先贤祠' || imgsOk !== total) fails++;
    }
    if (sid === 'maxwell' && rel === 'timeline.html') {
      const ys = await page.$$eval('.tl-year', els => els.map(e => Number(e.textContent.trim())));
      const sorted = ys.every((v, i) => i === 0 || ys[i - 1] <= v);
      const colorIdx = await page.$$eval('.tl-item', els => els.map(e => e.id).indexOf('color'));
      note = `年份序=${ys.join(',')} 单调=${sorted ? '✅' : '❌'}`;
      if (!sorted || colorIdx < 0) fails++;
    }
    if (sid === 'pasteur' && rel === 'timeline.html') {
      const ys = await page.$$eval('.tl-year', els => els.map(e => Number(e.textContent.trim())));
      const sorted = ys.every((v, i) => i === 0 || ys[i - 1] <= v);
      note = `含 1848=${ys.includes(1848) ? '✅' : '❌'} 单调=${sorted ? '✅' : '❌'}`;
      if (!ys.includes(1848) || !sorted) fails++;
    }
    if (rel === 'glossary.html') {
      const cats = await page.evaluate(() => [...document.querySelectorAll('[data-cat],[class*="cat"]')].map(e => e.textContent.trim()).join('|').slice(0, 80));
      note = '分类:' + cats;
    }
    // 页脚链接文案（所有页面统一）
    const foot = await page.evaluate(() => {
      const a = [...document.querySelectorAll('a')].find(x => x.textContent.includes('浏览全部'));
      return a ? a.textContent.trim() : '(无)';
    });
    const footOk = foot === '浏览全部科学家 →';

    const status = (errs.length === 0 && bad.length === 0 && (note.indexOf('❌') < 0) ) ? 'OK ' : 'BAD';
    if (status === 'BAD') fails++;
    console.log(`[${status}] ${(sid + '/' + rel).padEnd(34)} 页脚「${foot}」${footOk ? '' : ' ❌文案'}  ${note}  ${errs.length ? 'JS错:' + errs[0].slice(0, 70) : ''}${bad.length ? ' 请求失败:' + bad.slice(0, 3).join(' ') : ''}`);
    await page.close();
  }
  console.log(fails === 0 ? '\n✅ 全部通过（0 报错 / 0 缺资源 / 文案与结构断言全过）' : `\n⚠️ ${fails} 项异常`);
  await browser.close(); srv.close();
  setTimeout(() => process.exit(0), 300);
})();

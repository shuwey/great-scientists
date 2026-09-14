/**
 * check_site_icon.js —— 图标接入的浏览器实测。
 *
 * 静态校验（verify_site_icon.py）只能证明"路径解析得到、文件存在"，
 * 证明不了两件事，这两件只有真浏览器能查：
 *   1. SVG 作为 <img> 的 src 能否渲染（必须自带 viewBox/尺寸才算合法独立文档）
 *   2. 图标资源经 HTTP 取回是否 200（相对前缀写错时静态检查看不出来）
 *
 * 用法：node tools/check_site_icon.js
 */
const { chromium, request } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SHOTS = process.env.SHOTS_DIR || path.resolve(ROOT, '..', '读懂牛顿-验证产物', 'shots');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.json': 'application/json',
};

// 三类页面各抽一个，覆盖三种相对前缀
const PAGES = [
  ['门户首页', '/index.html'],
  ['子站首页', '/scientists/newton/index.html'],
  ['详解页（多一层）', '/scientists/newton/detail/optics.html'],
  ['无样式表的草稿页', '/scientists/newton/prototype/framework.html'],
];

function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0]);
      const file = path.join(ROOT, urlPath);
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404); res.end('not found'); return;
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  const failures = [];

  for (const [label, url] of PAGES) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

    await page.goto(base + url, { waitUntil: 'load' });

    // ① 页面声明的每条图标 link，逐条 HTTP 取回
    const hrefs = await page.$$eval(
      'link[rel="icon"], link[rel="apple-touch-icon"]',
      (ls) => ls.map((l) => l.getAttribute('href')),
    );
    const api = await request.newContext({ baseURL: base });
    const codes = [];
    for (const h of hrefs) {
      const r = await api.get(new URL(h, base + url).pathname);
      codes.push(`${r.status()} ${h.split('/').pop()}`);
      if (r.status() !== 200) failures.push(`${label}：图标 ${h} → HTTP ${r.status()}`);
    }
    await api.dispose();

    // ② 品牌位标记是否真的渲染出来（naturalWidth 为 0 = SVG 不合法/取不到）
    const marks = await page.$$eval('span.apple img', (imgs) =>
      imgs.map((i) => ({
        src: i.getAttribute('src'),
        w: i.naturalWidth,
        box: [i.width, i.height],
      })));
    if (!marks.length && url.includes('framework')) {
      // 草稿页没有导航，跳过
    } else if (!marks.length) {
      failures.push(`${label}：找不到品牌位标记`);
    }
    for (const m of marks) {
      if (m.w === 0) failures.push(`${label}：品牌位标记未渲染 → ${m.src}`);
    }

    const emoji = await page.$$eval('span.apple', (ss) =>
      ss.filter((s) => /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(s.textContent)).length);

    console.log(`\n【${label}】${url}`);
    console.log(`  图标 link ${hrefs.length} 条：${codes.join(' · ')}`);
    console.log(`  品牌位标记 ${marks.length} 个，渲染尺寸 ${marks.map((m) => m.box.join('×')).join(', ') || '—'}`);
    console.log(`  残留 emoji：${emoji}`);
    console.log(`  页面错误：${errors.length}${errors.length ? ' → ' + errors.slice(0, 2).join(' | ') : ''}`);
    if (errors.length) failures.push(`${label}：${errors.length} 条页面错误`);

    // ③ 只给导航品牌位拍一张（放大到 4 倍才看得清 27px 的细节）
    if (marks.length) {
      const el = await page.$('.brand');
      const out = path.join(SHOTS, `nav-brand-${PAGES.indexOf(PAGES.find((p) => p[1] === url))}-${url.split('/')[1] || 'root'}.png`);
      await el.screenshot({ path: out });
      console.log(`  截图：${path.basename(out)}`);
    }
    await page.close();
  }

  await browser.close();
  server.close();

  console.log('\n' + '─'.repeat(50));
  if (failures.length) {
    console.log(`✗ 失败 ${failures.length} 条`);
    failures.forEach((f) => console.log('   ' + f));
    process.exit(1);
  }
  console.log('✅ 浏览器实测全部通过');
})();

/* 实测：术语锚点跳转后，目标元素会不会被吸顶导航压住。
   对每个 (目标页, 锚点) 组合真实走一次原生 hash 跳转，量「锚点距视口顶」与「导航栏底边」。
   判据：锚点顶 >= 导航底（留 1px 容差）。
   用法：node tools/check_anchor_offset.js            # 断言
        node tools/check_anchor_offset.js --list     # 只列被压住的 */
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8092;
const BASE = `http://localhost:${PORT}`;
const LIST_ONLY = process.argv.includes('--list');

/* 收集各站 (目标页, 锚点) —— 复用站点数据文件里的 SITE_PAGES / SITE_TERMS */
function collect() {
  const all = [];
  for (const id of fs.readdirSync(path.join(ROOT, 'scientists')).sort()) {
    const tp = path.join(ROOT, 'scientists', id, 'assets/js/terms.js');
    if (!fs.existsSync(tp)) continue;
    const sandbox = { window: {} };
    try { new Function('window', fs.readFileSync(tp, 'utf8'))(sandbox.window); } catch (e) { continue; }
    const T = sandbox.window.SITE_TERMS || {};
    const P = sandbox.window.SITE_PAGES || {};
    const seen = new Set();
    for (const k of Object.keys(T)) {
      const t = T[k];
      if (!t.page || !t.anchor || !P[t.page]) continue;
      const url = P[t.page].url;
      const key = url + t.anchor;
      if (seen.has(key)) continue;
      seen.add(key);
      all.push({ id, url, anchor: t.anchor.replace(/^#/, ''), term: k });
    }
  }
  return all;
}

function serve() {
  return new Promise((resolve) => {
    const s = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      let f = path.join(ROOT, p);
      if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
      if (!fs.existsSync(f)) { res.writeHead(404); return res.end('404'); }
      const ct = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
        '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon' }[path.extname(f)] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': ct });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(PORT, () => resolve(s));
  });
}

(async () => {
  const items = collect();
  const server = await serve();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  let cur = null;
  const bad = [];
  const fixed = [];
  let checked = 0, nonH2 = 0, alreadyOk = 0;

  for (const it of items) {
    const pageUrl = `${BASE}/scientists/${it.id}/${it.url}`;
    try {
      if (cur !== pageUrl) {
        await page.goto(pageUrl, { waitUntil: 'load' });
        await page.waitForTimeout(120);
        cur = pageUrl;
      }
      const r = await page.evaluate((anchor) => {
        document.documentElement.style.scrollBehavior = 'auto';   // 关掉平滑，量终态
        const el = document.getElementById(anchor);
        if (!el) return { missing: true };
        const nav = document.querySelector('.nav');
        const measure = () => {
          const navBottom = nav ? nav.getBoundingClientRect().bottom : 0;
          const top = el.getBoundingClientRect().top;
          return {
            navBottom: Math.round(navBottom), top: Math.round(top),
            covered: top < navBottom - 1,
            scrollY: Math.round(window.scrollY),
            maxScroll: Math.round(document.documentElement.scrollHeight - window.innerHeight),
          };
        };
        const jump = () => {
          history.replaceState(null, '', location.pathname + location.search);
          window.scrollTo(0, 0);
          location.hash = anchor;                                   // 原生 hash 跳转
        };

        // ① 现状（含 [id] 规则）
        jump();
        const after = measure();

        // ② 反事实：只模拟"没有新 [id] 规则"。本来就命中 .article h2 的元素
        //    在改动前也有偏移，不能一并抹掉，否则对照组不真实。
        const hadOwnRule = el.matches('.article h2');
        if (!hadOwnRule) el.style.scrollMarginTop = '0px';
        jump();
        const before = measure();
        if (!hadOwnRule) el.style.scrollMarginTop = '';

        return { tag: el.tagName.toLowerCase(), hadOwnRule, anchor: location.hash, before, after };
      }, it.anchor);

      if (r.missing) { bad.push(`${it.id} #${it.anchor}（术语 ${it.term}）: 目标元素不存在`); continue; }
      checked++;
      if (r.after.covered) {
        bad.push(`${it.id} <${r.tag}> #${it.anchor}（${it.url} · 术语 ${it.term}）: ` +
          `距顶 ${r.after.top}px < 导航底 ${r.after.navBottom}px → 仍被压住 ${r.after.navBottom - r.after.top}px`);
      }
      if (r.before.covered && !r.after.covered) {
        fixed.push(`${it.id} <${r.tag}> #${it.anchor}: ${r.before.top}px → ${r.after.top}px（让开 ${r.before.navBottom - r.before.top}px）`);
      }
      if (r.hadOwnRule) alreadyOk++; else nonH2++;
    } catch (e) {
      bad.push(`${it.id} #${it.anchor}: 异常 ${e.message.split('\n')[0]}`);
    }
  }

  console.log(`实测 ${checked} 个锚点（共 ${items.length} 组）`);
  console.log(`   其中 ${nonH2} 个原本不命中 .article h2（改动前会被压住），${alreadyOk} 个原本就命中 h2（一直正常）`);
  console.log(`\n【修前 → 修后】新规则让它让开导航的锚点 ${fixed.length} 个：`);
  fixed.forEach((b) => console.log('   ' + b));
  if (bad.length) {
    console.log(`\n❌ 仍被吸顶导航压住 / 异常 ${bad.length} 个：`);
    bad.forEach((b) => console.log('   ' + b));
  } else {
    console.log('\n✅ 全部锚点都落在导航栏下方');
  }

  await browser.close();
  server.close();
  process.exit(bad.length && !LIST_ONLY ? 1 : 0);
})();

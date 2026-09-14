/* 回归断言：术语弹窗「了解更多」必须让读者真的看到反应。
   判据（三条同时成立才算通过）：
     ① 点击后弹窗已关闭
     ② body 滚动锁已释放
     ③ 目标内容进入视野 —— 跨页跳转成功，或同页时锚点元素已滚到视口内
        （该页无锚点时，回到页首也算）
   覆盖 15 站 × 首页/时间轴/词典/关于/实验 + 全部详解页。 */
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8094;
const BASE = `http://localhost:${PORT}`;

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

function buildCases() {
  const out = [];
  for (const id of fs.readdirSync(path.join(ROOT, 'scientists')).sort()) {
    const base = path.join(ROOT, 'scientists', id);
    if (!fs.existsSync(base)) continue;
    for (const f of ['index.html', 'timeline.html', 'glossary.html', 'about.html', 'labs.html']) {
      if (fs.existsSync(path.join(base, f))) out.push([id, f, 'auto']);
    }
    const dd = path.join(base, 'detail');
    if (fs.existsSync(dd)) {
      for (const f of fs.readdirSync(dd).filter((x) => x.endsWith('.html')).sort()) {
        out.push([id, `detail/${f}`, 'auto']);
      }
    }
    if (fs.existsSync(path.join(base, 'glossary.html'))) out.push([id, 'glossary.html', 'card']);
  }
  return out;
}

(async () => {
  const server = await serve();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const cases = buildCases();

  let pass = 0, skip = 0;
  const fails = [];

  for (const [id, rel, mode] of cases) {
    try {
      await page.goto(`${BASE}/scientists/${id}/${rel}`, { waitUntil: 'load' });
      await page.waitForTimeout(130);

      const pre = await page.evaluate(async (mode) => {
        const T = window.SITE_TERMS || {};
        // 词典页没有正文标注，入口是术语卡
        if (mode === 'card') {
          const card = document.querySelector('.term-card[data-term]');
          if (!card) return { skip: true };
          card.click();
        } else {
          const withPage = Array.from(document.querySelectorAll('.term[data-term]'))
            .filter((t) => { const d = T[t.getAttribute('data-term')]; return d && d.page; });
          const pick = withPage.find((t) => T[t.getAttribute('data-term')].anchor) || withPage[0];
          if (!pick) return { skip: true };
          pick.click();
        }
        await new Promise((r) => setTimeout(r, 140));
        const a = document.querySelector('#modalGo a.go');
        if (!a) return { noLink: true };
        const r = {
          href: a.getAttribute('href'),
          isSelf: a.href.split('#')[0] === location.href.split('#')[0],
          path: location.pathname,
        };
        a.click();
        return r;
      }, mode);

      if (pre.skip) { skip++; continue; }
      if (pre.noLink) { fails.push(`${id}/${rel}: 弹窗里没有「了解更多」链接`); continue; }

      await page.waitForTimeout(900);
      const post = await page.evaluate(() => {
        const mask = document.querySelector('.modal-mask');
        const out = {
          modalOpen: !!(mask && mask.classList.contains('show')),
          bodyLocked: document.body.style.overflow === 'hidden',
          path: location.pathname,
        };
        const id = decodeURIComponent(location.hash.slice(1));
        const el = id ? document.getElementById(id) : null;
        if (el) {
          const r = el.getBoundingClientRect();
          out.anchorTop = Math.round(r.top);
          out.anchorVisible = r.top > -4 && r.top < window.innerHeight * 0.7;
        } else {
          out.anchorVisible = window.scrollY < 6;   // 无锚点：回到页首算达标
        }
        return out;
      });

      // 同页：目标小节要真的进入视野；跨页：必须真的换了页面
      const landed = pre.isSelf ? post.anchorVisible : post.path !== pre.path;
      const ok = !post.modalOpen && !post.bodyLocked && landed;
      if (ok) pass++;
      else fails.push(`${id}/${rel} [href=${pre.href} 同页=${pre.isSelf}]` +
        ` 弹窗仍开:${post.modalOpen} body锁定:${post.bodyLocked} 目标可见:${post.anchorVisible}` +
        (post.anchorTop !== undefined ? ` 锚点距顶:${post.anchorTop}px` : ''));
    } catch (e) {
      fails.push(`${id}/${rel}: 异常 ${e.message.split('\n')[0]}`);
    }
  }

  console.log(`用例 ${cases.length} 个（跳过 ${skip} 个无入口）`);
  console.log(`✅ 通过 ${pass} 个`);
  console.log(fails.length ? `❌ 失败 ${fails.length} 个：` : '❌ 失败 0 个');
  fails.forEach((f) => console.log('   ' + f));

  await browser.close();
  server.close();
  process.exit(fails.length ? 1 : 0);
})();

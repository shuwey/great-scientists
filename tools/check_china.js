// 浏览器端验证「同期中国」卡片（15 站 × 桌面/移动）
//
// 为什么不能只靠静态校验：卡片是运行时插进 DOM 的，静态校验看不到
//   ① 卡片有没有真的插进正文容器（插错位置会被三列 grid 压成 92px 竖排）
//   ② 点击名词有没有真的弹出解释（事件委托 + 运行期合并术语库，两侧都可能断）
//   ③ 同一站里两处出现同一条目（生成器去重后仍可能被别处破坏）
//
// 用法：node tools/check_china.js            # 全部 15 站
//       node tools/check_china.js copernicus # 单站，打印逐节点明细
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const root = process.cwd();
const OUT = '/Users/shuwei/WorkBuddy/读懂牛顿-验证产物/shots';
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };
const srv = http.createServer((q, s) => {
  let p = path.join(root, decodeURIComponent(q.url.split('?')[0]));
  if (p.endsWith('/')) p += 'index.html';
  fs.readFile(p, (e, d) => { if (e) { s.writeHead(404); s.end(); return; } s.writeHead(200, { 'Content-Type': mime[path.extname(p)] || 'application/octet-stream' }); s.end(d); });
});

const ALL = ['copernicus', 'galileo', 'kepler', 'newton', 'faraday', 'darwin', 'pasteur',
  'maxwell', 'mendeleev', 'curie', 'einstein', 'bohr', 'turing', 'feynman', 'hawking'];
const SIDS = process.argv[2] ? [process.argv[2]] : ALL;
const VERBOSE = !!process.argv[2];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  await new Promise(r => srv.listen(8086, r));
  const b = await chromium.launch();
  const bad = [];
  let totNodes = 0, totCards = 0, totTerms = 0, minW = 1e9;

  for (const sid of SIDS) {
    for (const vp of [{ width: 1280, height: 1000 }, { width: 390, height: 844 }]) {
      const page = await b.newPage({ viewport: vp });
      const errs = [];
      page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
      page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
      page.on('response', r => { if (r.status() >= 400) errs.push('HTTP ' + r.status() + ' ' + r.url()); });
      await page.goto('http://localhost:8086/scientists/' + sid + '/timeline.html', { waitUntil: 'networkidle' });
      await page.waitForTimeout(200);

      const r = await page.evaluate(() => {
        const nodes = [...document.querySelectorAll('[data-year]')];
        const ev = {}, fg = {};
        const dupEv = [], dupFg = [];
        let cards = 0, terms = 0, minW = 1e9, emptyHead = 0;
        const termIds = new Set();
        for (const n of nodes) {
          const note = n.querySelector('.cn-note');
          if (!note) continue;
          cards++;
          const w = note.getBoundingClientRect().width;
          if (w > 0 && w < minW) minW = w;
          if (!note.querySelector('.cn-head').textContent.replace('同期中国', '').trim()) emptyHead++;
          note.querySelectorAll('.cn-row ul li').forEach(li => {
            const t = li.textContent.replace(/^\s*\d{3,4}\s*/, '').trim();
            if (ev[t]) dupEv.push(t); else ev[t] = true;
          });
          note.querySelectorAll('.cn-fig li b').forEach(x => {
            const t = x.textContent.trim();
            if (fg[t]) dupFg.push(t); else fg[t] = true;
          });
          note.querySelectorAll('.term').forEach(x => { terms++; termIds.add(x.getAttribute('data-term')); });
        }
        return { nodes: nodes.length, cards, terms, minW, emptyHead, dupEv, dupFg, termIds: [...termIds] };
      });

      totNodes += r.nodes; totCards += r.cards; totTerms += r.terms;
      if (r.minW < minW) minW = r.minW;
      const tag = sid + '@' + vp.width;
      if (errs.length) bad.push(tag + ' 运行时报错: ' + errs.slice(0, 2).join(' | '));
      if (r.cards !== r.nodes) bad.push(tag + ' 卡片 ' + r.cards + ' 张 ≠ 节点 ' + r.nodes + ' 个');
      if (r.emptyHead) bad.push(tag + ' 有 ' + r.emptyHead + ' 张卡没有朝代年号');
      if (r.dupEv.length) bad.push(tag + ' 大事重复: ' + r.dupEv.slice(0, 3).join(' / '));
      if (r.dupFg.length) bad.push(tag + ' 人物重复: ' + r.dupFg.slice(0, 3).join(' / '));
      if (r.terms === 0) bad.push(tag + ' 卡片里一个名词标记都没有');
      // 卡片被压进 92px 年代列时宽度会掉到这个量级，这是曾经的回归点
      if (r.minW < 150) bad.push(tag + ' 卡片最窄只有 ' + Math.round(r.minW) + 'px（疑似被排成竖排）');

      // 点击名词 → 弹窗（真点，不走 page.evaluate）
      const vis = page.locator('.cn-note .term');
      let clickMsg = '';
      if (!(await vis.first().isVisible().catch(() => false))) {
        const head = page.locator('.tl-item:has(.cn-note) .tl-head').first();
        if (await head.count()) await head.click().catch(() => {});
        await page.waitForTimeout(400);
      }
      try {
        const first = vis.first();
        if (await first.isVisible()) {
          const id = await first.getAttribute('data-term');
          await first.click();
          await page.waitForSelector('.modal-mask.show', { timeout: 2500 });
          const got = await page.evaluate(() => ({
            title: (document.getElementById('modalTitle') || {}).textContent || '',
            body: (document.querySelector('.modal-mask .modal-body') || {}).textContent || '',
          }));
          // 术语库里的名字要等于弹窗标题（证明查表命中，而不是打开了别的术语）
          const want = await page.evaluate(k => (window.SITE_TERMS && window.SITE_TERMS[k]) ? window.SITE_TERMS[k].name : '', id);
          if (!got.title) bad.push(tag + ' 点名词后弹窗标题为空（id=' + id + '）');
          else if (want && got.title !== want) bad.push(tag + ' 弹窗标题「' + got.title + '」≠ 术语库「' + want + '」');
          if (got.body.trim().length < 10) bad.push(tag + ' 弹窗正文为空（id=' + id + '）');
          clickMsg = id + ' → 「' + got.title + '」';
          await page.keyboard.press('Escape');
          await page.waitForTimeout(150);
        } else {
          bad.push(tag + ' 找不到可点击的名词');
        }
      } catch (e) {
        bad.push(tag + ' 点名词没弹出解释: ' + String(e).split('\n')[0]);
      }

      // Node 的 console.log 不认 C 的 %2d 宽度标记（会原样打出来），用 padStart 控制列宽
      console.log('%s  节点%s 卡片%s 名词%s 最窄%spx  %s',
        tag.padEnd(20), String(r.nodes).padStart(2), String(r.cards).padStart(2),
        String(r.terms).padStart(2), String(Math.round(r.minW)).padStart(4), clickMsg);
      if (VERBOSE) {
        const detail = await page.evaluate(() => [...document.querySelectorAll('[data-year]')].map(n => {
          const c = n.querySelector('.cn-note');
          return { y: n.getAttribute('data-year'), head: c ? c.querySelector('.cn-head').textContent.trim() : '(无卡)',
                   n: c ? c.querySelectorAll('li').length : 0, t: c ? c.querySelectorAll('.term').length : 0 };
        }));
        detail.forEach(d => console.log('    ' + d.y + ' ' + d.head + ' | 条目' + d.n + ' 名词' + d.t));
      }
      if (!VERBOSE) await page.screenshot({ path: `${OUT}/china-${sid}-${vp.width}.png`, fullPage: vp.width < 500 ? false : true });
      await page.close();
    }
  }
  await b.close(); srv.close();
  console.log('\n合计 节点 %d / 卡片 %d / 名词标记 %d；最窄卡片 %dpx', totNodes, totCards, totTerms, Math.round(minW));
  if (bad.length) {
    console.log('\n✗ %d 个问题：', bad.length);
    bad.forEach(x => console.log('  - ' + x));
  } else {
    console.log('✓ 全部通过：卡片就位、无重复、名词可点开解释，0 运行时报错');
  }
  setTimeout(() => process.exit(bad.length ? 1 : 0), 300);
})();

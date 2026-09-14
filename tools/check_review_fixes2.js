// 第二轮「审读报告 23 条修正」的浏览器实测：
//   1) 改动页无 pageerror、无 404（尤其新加的 etudes-sur-le-vin.jpg）
//   2) 逐页断言：新文案在、旧文案不在（防"改了站点漏了某页"）
//   3) 结构断言：巴斯德时间轴 = 13 节点且年份单调、图片全加载
//   4) 「玩一玩」实验的 slider 拖动后 readout 仍会变化（改过 JS 的实验）
// 用法：node tools/check_review_fixes2.js
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');

const ROOT = process.cwd();
const PORT = 8092;
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json' };
const srv = http.createServer((req, res) => {
  let p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (p.endsWith('/')) p += 'index.html';
  fs.readFile(p, (e, d) => {
    if (e) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(d);
  });
});

// [站点, 页面, 必须出现[], 必须不出现[]]
const TEXT_RULES = [
  ['copernicus', 'detail/earthmotion.html', ['哥白尼的日心模型已经用这一点解释四季'], ['哥白尼之后的开普勒、牛顿进一步澄清']],
  ['copernicus', 'timeline.html',          ['开普勒给出周期定律', '1609 年公布行星沿椭圆'], ['开普勒修正为椭圆']],
  ['copernicus', 'labs.html',              ['约 60 角秒', '连 0.1 角秒都摸不到'], ['只能测到约 0.1 角秒']],
  ['copernicus', 'detail/revolutionibus.html', ['一圈套一圈的圆'], ['combinations']],
  ['kepler', 'detail/mars.html',           ['那时望远镜尚未发明'], ['望远镜还没普及']],
  ['newton', 'detail/optics.html',         ['回到老家伍尔索普庄园'], ['牛顿在剑桥']],
  ['newton', 'timeline.html',              ['旧历 1642 年的圣诞节（新历 1643 年 1 月 4 日）'], []],
  ['newton', 'index.html',                 ['查看完整时间轴', '旧历 1642 年的圣诞节（新历 1643 年 1 月 4 日）'], ['查看全部 15 个年份']],
  ['einstein', 'timeline.html',            ['扩展到了更强、更极端的情形'], ['推翻了牛顿']],
  ['einstein', 'detail/mass-energy.html',  ['是人类的抉择'], ['Humanity']],
  ['pasteur', 'detail/pasteurization.html',['巴氏杀菌是把液体'], []],
  ['pasteur', 'detail/vaccine.html',       ['疫苗技术的持续发展，最终让天花'], ['天花被消灭，更证明其路线的深远']],
  ['pasteur', 'timeline.html',             ['1864', '巴氏杀菌'], []],
  ['pasteur', 'index.html',                ['1864'], []],
  ['curie', 'index.html',                  ['她从数吨矿渣里提炼出零点几克镭', '数吨矿渣，换回一小管'], ['一吨矿渣']],
  ['curie', 'labs.html',                   ['几十毫克镭', '0.1 克氯化镭'], ['25 毫克镭']],
  ['maxwell', 'index.html',                ['无线电、Wi-Fi'], []],
  ['darwin', 'detail/tree.html',           ['同一根上彼此相连的枝丫'], ['彼此相连的网']],
  ['mendeleev', 'labs.html',               ['以默认的第一电离能为例'], ['每到稀有气体冲到最高']],
  ['mendeleev', 'detail/predict.html',     ['钪被发现', '三个空格全部应验', '钪与锗相继坐实'], []],
  ['turing', 'detail/enigma.html',         ['改进型', '波兰', 'Bomba'], []],
  ['turing', 'timeline.html',              ['改进型炸弹机'], []],
  ['hawking', 'detail/blackhole.html',     ['这是理解黑洞的入门近似', '事件视界'], ['按相对论，光也逃不出']],
  ['hawking', 'labs.html',                 ['连光都只能向内走'], ['连最快的逃逸速度也超过光速']],
];

// 术语库文案在 assets/js/terms.js（外链数据，页面初始 HTML 里没有），
// 需读 window.SITE_TERMS 才能断言： [站点, 页面, 词条 id, 字段, 必须含[], 必须不含[]]
const TERMS_RULES = [
  ['kepler', 'glossary.html', 'tycho', 'analogy', ['没有望远镜'], ['microscope']],
  ['turing', 'glossary.html', 'bombe', 'plain', ['Bomba', '改进'], []],
];

// 需要实测 slider → readout 联动的实验页
const LAB_RULES = [
  ['copernicus', 'labs.html', '[data-lab="parallax"]'],
  ['curie', 'labs.html', '[data-lab="purify"]'],
  ['mendeleev', 'labs.html', '[data-lab="trend"]'],
  ['hawking', 'labs.html', '[data-lab="bh"]'],
];

(async () => {
  await new Promise(r => srv.listen(PORT, r));
  const browser = await chromium.launch();
  let fails = 0;

  console.log('══ 一、逐页文案与结构断言 ══');
  for (const [sid, rel, must, mustNot] of TEXT_RULES) {
    const url = `http://localhost:${PORT}/scientists/${sid}/${rel}`;
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errs = [], bad = [];
    page.on('pageerror', e => errs.push(e.message));
    page.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url().replace(/^https?:\/\/[^/]+/, '')); });
    await page.goto(url, { waitUntil: 'networkidle' }).catch(e => errs.push('goto: ' + e.message));
    await page.waitForTimeout(200);
    // 用 textContent 而非 innerText / innerHTML：
    //   · innerText 取不到折叠面板（爱因斯坦时间轴 .tl-panel）里的文案；
    //   · innerHTML 里术语会被 site.js 包成 <span class="term">，把句子切断（如「那时<span>望远镜</span>尚未发明」）。
    // textContent 既无标签、又含未展开内容，是这里唯一可靠的文本源。
    const txt = await page.evaluate(() => document.body.textContent.replace(/\s+/g, ' '));

    const miss = must.filter(s => !txt.includes(s));
    const left = mustNot.filter(s => txt.includes(s));
    let extra = '';

    if (sid === 'pasteur' && rel === 'timeline.html') {
      const n = await page.$$eval('.tl-item', els => els.length);
      const ys = await page.$$eval('.tl-year', els => els.map(e => Number(e.textContent.trim())));
      const sorted = ys.every((v, i) => i === 0 || ys[i - 1] <= v);
      const imgsOk = await page.$$eval('.tl-item img', els => els.filter(i => i.naturalWidth > 0).length);
      const total = await page.$$eval('.tl-item img', els => els.length);
      extra = `节点=${n} 含1864=${ys.includes(1864) ? '✅' : '❌'} 单调=${sorted ? '✅' : '❌'} 图=${imgsOk}/${total}`;
      if (n !== 13 || !ys.includes(1864) || !sorted || imgsOk !== total) fails++;
    }
    if (sid === 'pasteur' && rel === 'detail/pasteurization.html') {
      const tags = await page.$$eval('.meta-row .tag', els => els.map(e => e.textContent.trim()).join('|'));
      extra = '标签=' + tags;
      if (!tags.includes('杀菌') || tags.includes('灭菌')) fails++;
    }

    const ok = errs.length === 0 && bad.length === 0 && miss.length === 0 && left.length === 0;
    if (!ok) fails++;
    console.log(`[${ok ? 'OK ' : 'BAD'}] ${(sid + '/' + rel).padEnd(32)} ${extra}`
      + (miss.length ? `  缺:${miss.join(' / ')}` : '')
      + (left.length ? `  残留旧文:${left.join(' / ')}` : '')
      + (errs.length ? `  JS错:${errs[0].slice(0, 70)}` : '')
      + (bad.length ? `  请求失败:${bad.slice(0, 3).join(' ')}` : ''));
    await page.close();
  }

  console.log('\n══ 二、术语库（window.SITE_TERMS 数据） ══');
  for (const [sid, rel, tid, field, must, mustNot] of TERMS_RULES) {
    const url = `http://localhost:${PORT}/scientists/${sid}/${rel}`;
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(200);
    const val = await page.evaluate(([tid, field]) => {
      const t = window.SITE_TERMS || {};
      return (t[tid] && t[tid][field]) ? t[tid][field] : '(取不到)';
    }, [tid, field]);
    const miss = must.filter(s => !val.includes(s));
    const left = mustNot.filter(s => val.includes(s));
    const ok = errs.length === 0 && miss.length === 0 && left.length === 0;
    if (!ok) fails++;
    console.log(`[${ok ? 'OK ' : 'BAD'}] ${(sid + ' terms.' + tid + '.' + field).padEnd(32)} 「${val.slice(0, 62)}」`
      + (miss.length ? `  缺:${miss.join('/')}` : '') + (left.length ? `  残留:${left.join('/')}` : ''));
    await page.close();
  }

  console.log('\n══ 三、改过 JS 的实验：slider → readout 联动 ══');
  for (const [sid, rel, sel] of LAB_RULES) {
    const url = `http://localhost:${PORT}/scientists/${sid}/${rel}`;
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    const before = await page.$eval(`${sel} .lab-readout`, e => e.textContent.trim()).catch(() => '(无 readout)');
    const okDrag = await page.evaluate((sel) => {
      const lab = document.querySelector(sel);
      const r = lab.querySelector('input[type=range]');
      if (!r) return false;
      r.value = String(Number(r.min) + (Number(r.max) - Number(r.min)) * 0.8);
      r.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    }, sel);
    await page.waitForTimeout(250);
    const after = await page.$eval(`${sel} .lab-readout`, e => e.textContent.trim()).catch(() => '(无 readout)');
    const changed = okDrag && before !== after && after.length > 0;
    const nan = /NaN|undefined/.test(after);
    if (!changed || nan || errs.length) fails++;
    console.log(`[${changed && !nan && !errs.length ? 'OK ' : 'BAD'}] ${(sid + ' ' + sel).padEnd(32)} 变化=${changed ? '✅' : '❌'}${nan ? ' ⚠️含NaN' : ''}  拖动前「${before.slice(0, 54)}」→ 后「${after.slice(0, 54)}」${errs.length ? ' JS错:' + errs[0].slice(0, 60) : ''}`);
    await page.close();
  }

  console.log(fails === 0 ? '\n✅ 第二轮改动全部通过（0 报错 / 0 缺资源 / 文案与结构断言全过）' : `\n⚠️ ${fails} 项异常`);
  await browser.close(); srv.close();
  setTimeout(() => process.exit(0), 300);
})();

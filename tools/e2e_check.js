const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');          // 项目根
const ID = process.argv[2] || 'newton';              // 科学家子站 id
const SUB = `scientists/${ID}`;
const PORT = 8099;
const BASE = `http://localhost:${PORT}`;
const PY = '/Users/shuwei/.workbuddy/binaries/python/versions/3.13.12/bin/python3';
// 截图/报告输出目录：默认放在项目**外**（不参与静态发布上传），可用 SHOTS_DIR 覆盖
const SHOTS = process.env.SHOTS_DIR || path.resolve(ROOT, '..', '读懂牛顿-验证产物', 'shots');
fs.mkdirSync(SHOTS, { recursive: true });

// 按子站的 SITE_PAGES 自动发现详情页，避免写死牛顿专属页（optics/calculus/laws）
function buildPages(id) {
  const tp = path.join(ROOT, 'scientists', id, 'assets/js/terms.js');
  const detailUrls = [];
  if (fs.existsSync(tp)) {
    const code = fs.readFileSync(tp, 'utf8');
    const sandbox = { window: {} };
    try { new Function('window', code)(sandbox.window); } catch (e) {}
    const sp = sandbox.window.SITE_PAGES || {};
    for (const k in sp) if (sp[k] && sp[k].url) detailUrls.push(sp[k].url);
  }
  return ['index.html', 'timeline.html', ...detailUrls, 'labs.html', 'glossary.html', 'about.html'];
}
const PAGES = buildPages(ID);

function waitServer() {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    const tick = () => {
      const req = http.get(BASE + `/${SUB}/index.html`, (res) => { res.destroy(); resolve(); });
      req.on('error', () => {
        if (Date.now() - t0 > 15000) reject(new Error('server timeout'));
        else setTimeout(tick, 300);
      });
    };
    tick();
  });
}

const noise = (s) => /favicon|404|Failed to load resource|net::ERR/i.test(s);
const shot = (name) => `${SHOTS}/${ID}_${name}.png`;

(async () => {
  const srv = spawn(PY, ['-m', 'http.server', String(PORT), '--directory', ROOT], { stdio: 'ignore' });
  const report = { scientist: ID, pages: {}, interactions: {}, canvas: {} };
  try {
    await waitServer();
    const browser = await chromium.launch();

    // ---------- 1. 逐页双端截图 + 运行时报错 ----------
    for (const p of PAGES) {
      const key = p.replace(/\//g, '_');
      const errs = { desktop: [], mobile: [] };
      const url = `${BASE}/${SUB}/${p}`;

      const ctxD = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      const pgD = await ctxD.newPage();
      pgD.on('console', (m) => { if (m.type() === 'error' && !noise(m.text())) errs.desktop.push('console: ' + m.text()); });
      pgD.on('pageerror', (e) => errs.desktop.push('pageerror: ' + e.message));
      await pgD.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
      await pgD.waitForTimeout(350);
      await pgD.screenshot({ path: shot(`${key}_desktop.png`), fullPage: true });
      await ctxD.close();

      const ctxM = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
      const pgM = await ctxM.newPage();
      pgM.on('console', (m) => { if (m.type() === 'error' && !noise(m.text())) errs.mobile.push('console: ' + m.text()); });
      pgM.on('pageerror', (e) => errs.mobile.push('pageerror: ' + e.message));
      await pgM.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
      await pgM.waitForTimeout(350);
      await pgM.screenshot({ path: shot(`${key}_mobile.png`), fullPage: true });
      await ctxM.close();

      report.pages[p] = errs;
      console.log(`✅ ${SUB}/${p} 截图完成 | 桌面报错 ${errs.desktop.length} · 移动报错 ${errs.mobile.length}`);
    }

    // ---------- 2. 交互验证 ----------
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const pg = await ctx.newPage();

    // 2a 术语弹窗（首页未必有 data-term，改去第一个详情页）
    const detailPage = PAGES.find(p => p.startsWith('detail/')) || 'index.html';
    await pg.goto(`${BASE}/${SUB}/${detailPage}`, { waitUntil: 'networkidle' });
    await pg.waitForSelector('[data-term]');
    await pg.click('[data-term]');
    const popupOk = await pg.waitForSelector('.modal-mask.show', { timeout: 3000 }).then(() => true).catch(() => false);
    await pg.waitForTimeout(300);
    await pg.screenshot({ path: shot('interaction_term_popup.png') });
    report.interactions.termPopup = popupOk;
    console.log(`术语弹窗: ${popupOk ? '出现 ✅' : '未出现 ❌'}`);

    // 2b 时间轴展开
    await pg.goto(`${BASE}/${SUB}/timeline.html`, { waitUntil: 'networkidle' });
    await pg.waitForSelector('.tl-head');
    const heads = await pg.$$('.tl-head');
    let tlOk = false;
    if (heads[1]) {
      await heads[1].click();
      await pg.waitForTimeout(400);
      tlOk = await pg.$$eval('.tl-item', (its) => !!(its[1] && its[1].classList.contains('open')));
    }
    await pg.screenshot({ path: shot('interaction_timeline_expanded.png') });
    report.interactions.timelineExpand = tlOk;
    console.log(`时间轴展开(第二项): ${tlOk ? 'OK ✅' : '未展开 ❌'}`);

    // 2c 词典搜索
    await pg.goto(`${BASE}/${SUB}/glossary.html`, { waitUntil: 'networkidle' });
    const searchBox = await pg.$('input[type="search"], input[placeholder*="搜索"], #term-search, .search input');
    let searchOk = null;
    if (searchBox) {
      await searchBox.fill('引力');
      await pg.waitForTimeout(400);
      const cnt = await pg.$$eval('.term-card, .glossary-item, li', (els) => els.filter(e => e.offsetParent !== null).length);
      await pg.screenshot({ path: shot('interaction_glossary_search.png') });
      searchOk = cnt;
      console.log(`词典搜索"引力": 可见条目 ${cnt} 条`);
    } else {
      console.log('词典搜索框未找到 ⚠️');
    }
    report.interactions.glossarySearch = searchOk;

    // 2d labs 三个 canvas + 发射
    await pg.goto(`${BASE}/${SUB}/labs.html`, { waitUntil: 'networkidle' });
    await pg.waitForTimeout(600);
    const canvases = await pg.$$('.lab canvas');
    report.canvas.count = canvases.length;
    const names = await pg.$$eval('.lab', els => els.map(e => e.getAttribute('data-lab') || 'lab'));
    for (let i = 0; i < canvases.length; i++) {
      const n = names[i] || ('canvas' + i);
      const info = await canvases[i].evaluate((c) => {
        const ctx = c.getContext('2d');
        if (!ctx) return { ok: false };
        const d = ctx.getImageData(0, 0, c.width, c.height).data;
        let nb = 0;
        for (let j = 3; j < d.length; j += 4) if (d[j] > 0) nb++;
        return { ok: true, w: c.width, h: c.height, ratio: +(nb / (c.width * c.height)).toFixed(3) };
      });
      report.canvas[n] = info;
      console.log(`  ${n} canvas: ${info.ok ? `已绘制 像素比=${info.ratio}` : '未绘制/无 2d ctx'}`);
      await canvases[i].screenshot({ path: shot(`lab_${n}.png`) }).catch(() => {});
    }
    const fireBtn = await pg.$('button.lab-fire');
    if (fireBtn) {
      await fireBtn.click();
      await pg.waitForTimeout(800);
      const proj = canvases[2];
      if (proj) await proj.screenshot({ path: shot('lab_projectile_fired.png') }).catch(() => {});
      report.interactions.projectileFire = true;
      console.log('抛体发射: 已点击发射按钮 ✅');
    } else {
      // 通用滑块测试：把第一个 range 分别拨到量程 25% / 75%，校验 lab-readout 是否变化
      // （早先只拨到"中点"：当量程对称、默认值恰好是中点时会误报"未变化"，故改为两端对比）
      const slider = await pg.$('.lab input[type="range"]');
      if (slider) {
        const before = await pg.$eval('.lab .lab-readout', el => el.textContent.trim()).catch(() => '');
        const min = Number(await slider.getAttribute('min'));
        const max = Number(await slider.getAttribute('max'));
        const step = Number(await slider.getAttribute('step')) || 1;
        const at = (f) => {
          let v = min + (max - min) * f;
          v = Math.round((v - min) / step) * step + min;      // 吸附到合法档位
          return String(Math.min(max, Math.max(min, Math.round(v * 1000) / 1000)));
        };
        const setAndRead = async (v) => {
          await slider.fill(v);
          await slider.dispatchEvent('input');
          await pg.waitForTimeout(500);
          return await pg.$eval('.lab .lab-readout', el => el.textContent.trim()).catch(() => '');
        };
        const rLow = await setAndRead(at(0.25));
        const rHigh = await setAndRead(at(0.75));
        const changed = rLow !== rHigh || rHigh !== before;
        await canvases[0].screenshot({ path: shot('lab_slider_mid.png') }).catch(() => {});
        report.interactions.sliderChangesReadout = changed;
        console.log(`滑块交互: readout ${changed ? '随滑块变化 ✅' : '未变化 ⚠️'}（${before || '空'} → ${rHigh || '空'}）`);
      } else {
        console.log('未找到发射按钮或滑块 ⚠️');
      }
    }

    await ctx.close();
    await browser.close();
  } catch (e) {
    console.error('❌ 脚本异常:', e.message);
    report.fatal = e.message;
  } finally {
    srv.kill();
  }

  fs.writeFileSync(path.join(SHOTS, `e2e_report_${ID}.json`), JSON.stringify(report, null, 2));
  console.log(`\n=== 报告已写 ${path.relative(ROOT, SHOTS)}/e2e_report_${ID}.json ===`);
})();

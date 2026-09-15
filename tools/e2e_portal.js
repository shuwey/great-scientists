/**
 * 系列门户（根 index.html · 图标桌面版）浏览器验证
 *   - 页面无 console / pageerror 报错
 *   - 15 张图标卡全部渲染、图片真实加载、链接指向正确子站
 *   - 首屏筛选框能过滤卡片（按 class=dim）并正确显示数量
 *   - 悬停读数（hp-readout）随 hover 更新
 *   - 导航深色首屏透明 → 滚动后转常规（.nav--over.scrolled）
 *   - 从卡片点进子站能正常加载
 * 用法：node tools/e2e_portal.js
 */
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8098;
const BASE = `http://localhost:${PORT}`;
const PY = '/Users/shuwei/.workbuddy/binaries/python/versions/3.13.12/bin/python3';

// 期望卡片数从首页 DOM 直接数（手工维护版，无生成器可读）
const EXPECTED = 15;
// 截图/报告输出目录：默认放在项目**外**（不参与静态发布上传），可用 SHOTS_DIR 覆盖
const SHOTS = process.env.SHOTS_DIR || path.resolve(ROOT, '..', '读懂牛顿-验证产物', 'shots');
fs.mkdirSync(SHOTS, { recursive: true });

let server;
function startServer() {
  server = spawn(PY, ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    const tick = () => {
      const req = http.get(BASE + '/index.html', (res) => { res.destroy(); resolve(); });
      req.on('error', () => {
        if (Date.now() - t0 > 15000) reject(new Error('server timeout'));
        else setTimeout(tick, 300);
      });
    };
    tick();
  });
}

(async () => {
  await startServer();
  const browser = await chromium.launch();
  let failed = 0;
  const errs = [];

  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });

  await page.goto(BASE + '/index.html', { waitUntil: 'load' });
  await page.waitForTimeout(400);

  const cards = await page.locator('.hp-item').count();
  console.log(`图标卡数量: ${cards} ${cards === EXPECTED ? '✅' : '❌ 应为 ' + EXPECTED}`);
  if (cards !== EXPECTED) failed++;

  // 导航初始透明压在深色首屏上
  const navOver = await page.locator('.nav.nav--over').count();
  console.log(`导航深色首屏透明态: ${navOver === 1 ? '✅' : '❌'}`);
  if (navOver !== 1) failed++;

  // 图标是否都真的加载出来了
  const imgOk = await page.$$eval('.hp-item .hp-tile img', (els) =>
    els.filter((i) => i.complete && i.naturalWidth > 0).length);
  console.log(`图标加载: ${imgOk}/${EXPECTED} ${imgOk === EXPECTED ? '✅' : '❌'}`);
  if (imgOk !== EXPECTED) failed++;

  // 每张卡都指向一个真实子站
  const hrefs = await page.$$eval('.hp-item', (els) => els.map((e) => e.getAttribute('href')));
  const badHref = hrefs.filter((h) => !/^scientists\/[a-z]+\/index\.html$/.test(h || ''));
  console.log(`卡片链接格式: ${badHref.length === 0 ? '✅ 全部合法' : '❌ ' + badHref.join(', ')}`);
  if (badHref.length) failed++;

  // 悬停读数
  const hint0 = (await page.locator('#hp-readout').textContent()).trim();
  await page.locator('.hp-item').nth(3).hover();  // 牛顿
  await page.waitForTimeout(150);
  const hint1 = (await page.locator('#hp-readout').textContent()).replace(/\s+/g, ' ').trim();
  const readoutOk = hint1.includes('牛顿') && hint1 !== hint0;
  console.log(`悬停读数: "${hint1.slice(0, 30)}…" ${readoutOk ? '✅' : '❌'}`);
  if (!readoutOk) failed++;
  await page.mouse.move(10, 880);
  await page.waitForTimeout(150);

  // 筛选：关键词过滤（按 dim 类计数）
  await page.fill('#hp-filter', '黑洞');
  await page.waitForTimeout(200);
  const vis1 = await page.locator('.hp-item:not(.dim)').count();
  const cnt1 = (await page.locator('#hp-count').textContent()).trim();
  console.log(`筛选"黑洞": 命中 ${vis1} 张 · 计数 "${cnt1}" ${vis1 >= 1 && vis1 < EXPECTED && cnt1 === vis1 + ' 位' ? '✅' : '❌'}`);
  if (!(vis1 >= 1 && vis1 < EXPECTED && cnt1 === vis1 + ' 位')) failed++;

  // 筛选：空状态
  await page.fill('#hp-filter', 'zzzznotexist');
  await page.waitForTimeout(200);
  const vis2 = await page.locator('.hp-item:not(.dim)').count();
  const cnt2 = (await page.locator('#hp-count').textContent()).trim();
  console.log(`筛选无结果: 命中 ${vis2} 张 · 计数 "${cnt2}" ${vis2 === 0 && cnt2 === '0 位' ? '✅' : '❌'}`);
  if (vis2 !== 0 || cnt2 !== '0 位') failed++;

  // 清空恢复
  await page.fill('#hp-filter', '');
  await page.waitForTimeout(200);
  const vis3 = await page.locator('.hp-item:not(.dim)').count();
  console.log(`清空筛选: 恢复 ${vis3} 张 ${vis3 === EXPECTED ? '✅' : '❌'}`);
  if (vis3 !== EXPECTED) failed++;

  // 滚动后导航转常规毛玻璃
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(350);
  const scrolled = await page.locator('.nav--over.scrolled').count();
  console.log(`滚动后导航转换: ${scrolled === 1 ? '✅' : '❌'}`);
  if (scrolled !== 1) failed++;
  await page.evaluate(() => window.scrollTo(0, 0));

  await page.screenshot({ path: SHOTS + '/homepage-final/portal-desktop.png', fullPage: true });

  // 点进一个子站（哥白尼，第一张卡）
  const before = errs.length;
  await page.locator('.hp-item').first().click();
  await page.waitForLoadState('load');
  const url = page.url();
  const okNav = url.includes('scientists/copernicus/index.html');
  console.log(`点卡片跳转: ${url.split('/').slice(-3).join('/')} ${okNav ? '✅' : '❌'}`);
  if (!okNav) failed++;
  if (errs.length > before) console.log('  跳转后新增报错 ❌', errs.slice(before));

  await ctx.close();

  // 移动端
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, reducedMotion: 'reduce' });
  const mp = await mctx.newPage();
  const merrs = [];
  mp.on('pageerror', (e) => merrs.push('pageerror: ' + e.message));
  mp.on('console', (m) => { if (m.type() === 'error') merrs.push('console: ' + m.text()); });
  await mp.goto(BASE + '/index.html', { waitUntil: 'load' });
  await mp.waitForTimeout(400);
  const mvis = await mp.locator('.hp-item').count();
  console.log(`移动端图标卡: ${mvis} 张 ${mvis === EXPECTED ? '✅' : '❌'}`);
  if (mvis !== EXPECTED) failed++;
  await mp.screenshot({ path: SHOTS + '/homepage-final/portal-mobile.png', fullPage: true });
  console.log(`移动端报错: ${merrs.length} ${merrs.length === 0 ? '✅' : '❌ ' + merrs.join(' | ')}`);
  if (merrs.length) failed++;
  await mctx.close();

  await browser.close();
  if (server) server.kill();

  console.log(`\n桌面端报错: ${errs.length} ${errs.length === 0 ? '✅' : '❌ ' + errs.join(' | ')}`);
  if (errs.length) failed++;
  console.log(failed === 0 ? '\n=== 门户验证全部通过 ===' : `\n=== 门户验证有 ${failed} 项未通过 ===`);
  process.exit(failed === 0 ? 0 : 1);
})().catch((e) => {
  console.error('运行失败:', e);
  if (server) server.kill();
  process.exit(1);
});

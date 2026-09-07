/**
 * 系列门户（根 index.html）浏览器验证
 *   - 页面无 console / pageerror 报错
 *   - 13 张科学家卡片 + 13 条路线图条目全部渲染且可点
 *   - 检索框能过滤卡片，并正确显示数量与空状态
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
const SHOTS = ROOT + '/tools/shots';
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

  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });

  await page.goto(BASE + '/index.html', { waitUntil: 'load' });
  await page.waitForTimeout(400);

  const cards = await page.locator('.ach-card').count();
  const roster = await page.locator('.roster-item.done').count();
  const plan = await page.locator('.pill-plan').count();
  console.log(`卡片数量: ${cards} ${cards === 13 ? '✅' : '❌ 应为 13'}`);
  console.log(`路线图已上线: ${roster} ${roster === 13 ? '✅' : '❌ 应为 13'}`);
  console.log(`筹备中残留: ${plan} ${plan === 0 ? '✅' : '❌ 应为 0'}`);
  if (cards !== 13 || roster !== 13 || plan !== 0) failed++;

  // 缩略图是否都真的加载出来了
  const imgOk = await page.$$eval('.ach-card .thumb img', (els) =>
    els.filter((i) => i.complete && i.naturalWidth > 0).length);
  console.log(`缩略图加载: ${imgOk}/13 ${imgOk === 13 ? '✅' : '❌'}`);
  if (imgOk !== 13) failed++;

  // 检索：关键词过滤
  await page.fill('#sci-filter', '黑洞');
  await page.waitForTimeout(200);
  const vis1 = await page.locator('.ach-card:visible').count();
  const cnt1 = (await page.locator('#sci-count').textContent()).trim();
  console.log(`搜索"黑洞": 可见 ${vis1} 张 · 计数 "${cnt1}" ${vis1 >= 1 && vis1 < 13 ? '✅' : '❌'}`);
  if (!(vis1 >= 1 && vis1 < 13)) failed++;

  // 检索：空状态
  await page.fill('#sci-filter', 'zzzznotexist');
  await page.waitForTimeout(200);
  const vis2 = await page.locator('.ach-card:visible').count();
  const emptyShown = await page.locator('#sci-empty').isVisible();
  console.log(`搜索无结果: 可见 ${vis2} 张 · 空提示 ${emptyShown ? '显示 ✅' : '未显示 ❌'}`);
  if (vis2 !== 0 || !emptyShown) failed++;

  // 清空恢复
  await page.fill('#sci-filter', '');
  await page.waitForTimeout(200);
  const vis3 = await page.locator('.ach-card:visible').count();
  console.log(`清空搜索: 恢复 ${vis3} 张 ${vis3 === 13 ? '✅' : '❌'}`);
  if (vis3 !== 13) failed++;

  await page.screenshot({ path: SHOTS + '/portal-desktop.png', fullPage: true });

  // 点进一个子站（哥白尼，第一张卡）
  const before = errs.length;
  await page.locator('.ach-card').first().click();
  await page.waitForLoadState('load');
  const url = page.url();
  const okNav = url.includes('scientists/copernicus/index.html');
  console.log(`点卡片跳转: ${url.split('/').slice(-3).join('/')} ${okNav ? '✅' : '❌'}`);
  if (!okNav) failed++;
  if (errs.length > before) console.log('  跳转后新增报错 ❌', errs.slice(before));

  await ctx.close();

  // 移动端
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const mp = await mctx.newPage();
  const merrs = [];
  mp.on('pageerror', (e) => merrs.push('pageerror: ' + e.message));
  mp.on('console', (m) => { if (m.type() === 'error') merrs.push('console: ' + m.text()); });
  await mp.goto(BASE + '/index.html', { waitUntil: 'load' });
  await mp.waitForTimeout(400);
  await mp.screenshot({ path: SHOTS + '/portal-mobile.png', fullPage: true });
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

/** 校验 labs-anim-review.html：内联图能否解码、grid2 网格是否成型、有无运行时报错 */
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const path = require('path');

(async () => {
  const file = 'file://' + path.resolve(__dirname, 'labs-anim-review.html');
  let browser = null;
  try {
    browser = await chromium.launch();
    const pg = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
    const errs = [];
    pg.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
    pg.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
    await pg.goto(file, { waitUntil: 'load' });
    await pg.waitForTimeout(1200);
    const r = await pg.evaluate(() => {
      const imgs = [].slice.call(document.querySelectorAll('img'));
      const bad = imgs.filter((i) => !i.complete || i.naturalWidth === 0).length;
      const g2 = [].slice.call(document.querySelectorAll('.grid2'));
      const h2 = [].slice.call(document.querySelectorAll('h2')).map((x) => x.textContent.trim());
      return {
        nImg: imgs.length, bad,
        nGrid: g2.length,
        gridCols: g2.map((g) => getComputedStyle(g).gridTemplateColumns.split(' ').length),
        h2
      };
    });
    console.log('  内联图 ' + r.nImg + ' 张，未解码 ' + r.bad + ' 张 ' + (r.bad ? '❌' : '✅'));
    console.log('  两列网格 ' + r.nGrid + ' 个，列数 = ' + r.gridCols.join('/') +
      ' ' + (r.gridCols.every((c) => c === 2) ? '✅' : '❌'));
    console.log('  章节：' + r.h2.join(' | '));
    console.log('  运行时报错：' + (errs.length ? '❌ ' + errs.join(' | ') : '✅ 0 条'));
  } catch (e) {
    console.log('异常：' + e.message);
  } finally {
    if (browser) await browser.close();
    setTimeout(() => process.exit(0), 100);
  }
})();

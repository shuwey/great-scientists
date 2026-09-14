/**
 * build_icon_set.js —— 站点图标的唯一构建入口。
 *
 * 输入：icon/src/ 下的四个 SVG 母版（均带 viewBox，这是关键）
 *   · app-standard.svg  品牌渐变圆角方块 + 完整倾斜轨道（≥32px 用）
 *   · app-mini.svg      品牌渐变圆角方块 + 内核与质点（16px 用）
 *   · mark-standard.svg 无底色标记，完整轨道（导航品牌位候选）
 *   · mark-mini.svg     无底色标记，内核与质点（导航品牌位候选）
 *
 * 输出：icon/dist/ 下的位图与 svg 副本。
 *
 * ⚠️ 为什么母版是手写的而不是直接用画布导出的 icon.svg：
 *   画布导出的 SVG **没有 viewBox**，坐标是 360 空间内的绝对值。改 width/height
 *   只改变画布大小、图形留在左上角不缩放。与其在每一步注入 viewBox（易漏），
 *   不如把几何固化在带 viewBox 的母版里。母版几何与画布定稿逐值一致。
 *
 * ⚠️ 16px 用的是微缩版而非标准版：标准版在 16px 下环粗仅 1.1px、内核 2.2px、
 *   两者净空不足 1px，必然糊。分档规则写死在 SIZES 表里。
 *
 * 用法：node tools/build_icon_set.js
 */
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'icon', 'src');
const DIST = path.join(ROOT, 'icon', 'dist');
// 评审用的候选图是验证产物、不是交付物 —— 按项目约定落到项目外，避免混进发布目录
const SHOTS = process.env.SHOTS_DIR
  || path.resolve(ROOT, '..', '读懂牛顿-验证产物', 'shots');

// [源母版, 输出名, 像素尺寸]
const RENDERS = [
  ['app-mini',     'favicon-16.png',            16],
  ['app-standard', 'favicon-32.png',            32],
  ['app-standard', 'favicon-48.png',            48],
  ['app-standard', 'apple-touch-icon-180.png', 180],
  ['app-standard', 'icon-512.png',             512],
  ['app-standard', 'icon-1024.png',           1024],
];

// 导航品牌位的两个候选：按 .apple 的真实样式（27px 方块 + 靛蓝渐变 + 8px 圆角）
// 合成截图，这样评审看到的就是最终效果，不是一张脱离底色的图。
const NAV_BOX = 27;
const NAV_CANDIDATES = ['mark-standard', 'mark-mini'];

function sized(svg, size) {
  return svg.replace(/(<svg[^>]*?)\s+width="[^"]*"\s+height="[^"]*"/, `$1 width="${size}" height="${size}"`);
}

(async () => {
  fs.mkdirSync(DIST, { recursive: true });
  const browser = await chromium.launch();

  for (const [name, out, size] of RENDERS) {
    const body = sized(fs.readFileSync(path.join(SRC, `${name}.svg`), 'utf8'), size);
    const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    await page.setContent(`<!doctype html><html><body style="margin:0;padding:0">${body}</body></html>`);
    await page.screenshot({ path: path.join(DIST, out), omitBackground: true });
    await page.close();
    console.log('✓', out, `${size}px`, '←', `${name}.svg`);
  }

  // 导航品牌位候选：把标记放进带内边距的渐变方块里截图（多留 8px 给投影，最后裁掉）
  const PAD = 8;
  fs.mkdirSync(SHOTS, { recursive: true });
  for (const name of NAV_CANDIDATES) {
    const body = sized(fs.readFileSync(path.join(SRC, `${name}.svg`), 'utf8'), NAV_BOX);
    const side = NAV_BOX + PAD * 2;
    const page = await browser.newPage({ viewport: { width: side, height: side }, deviceScaleFactor: 1 });
    await page.setContent(`<!doctype html><html><body style="margin:0;padding:${PAD}px;box-sizing:border-box;width:${side}px;height:${side}px">
      <div style="width:${NAV_BOX}px;height:${NAV_BOX}px;background:linear-gradient(140deg,#3B5BDB,#6E8BFF);border-radius:8px;display:grid;place-items:center;box-shadow:0 3px 8px rgba(59,91,219,.32)">${body}</div>
    </body></html>`);
    await page.screenshot({ path: path.join(SHOTS, `nav-candidate-${name}.png`), omitBackground: true });
    await page.close();
    console.log('✓', `nav-candidate-${name}.png`, `${NAV_BOX}px 实尺寸（含 8px 留白，写入验证产物目录）`);
  }

  for (const f of ['mark-standard.svg', 'mark-mini.svg', 'app-standard.svg', 'app-mini.svg']) {
    fs.copyFileSync(path.join(SRC, f), path.join(DIST, f));
    console.log('✓', f, '(矢量副本)');
  }

  await browser.close();
})();

/* 图片解析器
 *
 * 详情/时间轴内容里的图片只存「子站相对路径」（如 assets/img/draw/bohr-model.svg），
 * 真正的资源位置由 data/images.js 决定：
 *   · 示意图（SVG）→ 包内路径 /assets/pages/<sid>-<name>.svg
 *   · 历史照片      → 云存储文件 ID（tools/upload_miniapp_images.py 上传后写入）
 * 尚未上云的照片在这里返回 ''，页面据此不渲染图片占位 —— 绝不显示裂图。
 */

const map = require('../data/images');

function resolve(sci, rel) {
  if (!sci || !rel) return '';
  return map[sci + '/' + rel] || '';
}

/** 该内容里是否有任何图片已就绪（用于决定是否显示「图片待补」提示） */
function anyReady(sci, rels) {
  for (let i = 0; i < (rels || []).length; i++) {
    if (resolve(sci, rels[i])) return true;
  }
  return false;
}

module.exports = { resolve: resolve, anyReady: anyReady };

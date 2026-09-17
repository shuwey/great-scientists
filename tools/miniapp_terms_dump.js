/*
 * 读懂科学家 · 小程序内容抽取 · 术语求值器
 * ---------------------------------------------------------------
 * 作用：把各子站的 assets/js/terms.js 在沙箱里**真实求值**，导出 JSON。
 *
 * 为什么不用正则解析：terms.js 是 JS（不是 JSON），里面含中文引号、嵌套数组、
 * 注释。正则只能取个大概，无法保证 398 条术语逐条正确。用 vm 求值可以
 * 复用静态站自己的引擎契约，源站改了什么，这里就跟着变。
 *
 * 兼容两代全局名：SITE_TERMS/SITE_PAGES/SITE_CATS（新）与 NEWTON_* （旧）。
 *
 * 用法：node tools/miniapp_terms_dump.js scientists/newton/assets/js/terms.js ...
 * 输出：{"data": {"<id>": {"terms": {...}, "pages": {...}, "cats": [...]}}, "errors": [...]}
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const files = process.argv.slice(2);
const data = {};
const errors = [];

for (const f of files) {
  // scientists/<id>/assets/js/terms.js -> <id>
  const id = path.basename(path.dirname(path.dirname(path.dirname(f))));

  let src;
  try {
    src = fs.readFileSync(f, 'utf8');
  } catch (e) {
    errors.push({ file: f, stage: 'read', error: e.message });
    continue;
  }

  const win = {};
  win.window = win;
  const sandbox = { window: win, console: console };

  try {
    vm.createContext(sandbox);
    vm.runInContext(src, sandbox, { filename: f, timeout: 10000 });
  } catch (e) {
    errors.push({ file: f, stage: 'eval', error: e.message });
    continue;
  }

  // 先看挂在 window 上的（引擎契约），再退回 vm 上下文自身的全局
  // （个别文件可能用 `var SITE_TERMS = ...` 而非 `window.SITE_TERMS = ...`）
  const pick = (name) => win[name] || sandbox[name] || null;
  const terms = pick('SITE_TERMS') || pick('NEWTON_TERMS');
  const pages = pick('SITE_PAGES') || pick('NEWTON_PAGES');
  const cats = pick('SITE_CATS') || pick('NEWTON_CATS');

  if (!terms || typeof terms !== 'object') {
    errors.push({ file: f, stage: 'contract', error: '未找到 SITE_TERMS / NEWTON_TERMS' });
    continue;
  }

  data[id] = {
    terms: terms,
    pages: pages || {},
    cats: Array.isArray(cats) ? cats : [],
  };
}

process.stdout.write(JSON.stringify({ data: data, errors: errors }));

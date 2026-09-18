// 小程序页面逻辑的无头自测：不开微信开发者工具，直接把 Page() 定义抓出来、
// 喂一个假的 wx/getApp，然后真跑 onLoad，检查 setData 出来的视图模型。
//
// 为什么要这一层：静态校验只能证明"数据和文件对得上"，证明不了"页面跑得通"。
// 网页端我们有 Playwright；小程序端没有现成运行时，就自己搭一个最小的。
// 检查重点放在**静默失败**上：图片解析成空、术语点开是空、上一篇点空、
// rich-text 里混进 class=/var(--)（小程序不认，会渲染成黑字）。
//
// 用法：
//   node tools/e2e_miniapp_pages.js            # 15 站全量
//   node tools/e2e_miniapp_pages.js copernicus,newton
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MP = path.join(ROOT, 'miniapp');
const ALL = ['copernicus', 'galileo', 'kepler', 'newton', 'faraday', 'darwin', 'pasteur',
  'maxwell', 'mendeleev', 'curie', 'einstein', 'bohr', 'turing', 'feynman', 'hawking'];

const argIds = (process.argv[2] || 'all').trim();
const IDS = argIds === 'all' ? ALL : argIds.split(',').map((s) => s.trim()).filter(Boolean);

// ---------------- 最小运行时 ----------------
const toasts = [];
const navs = [];
global.wx = {
  setNavigationBarTitle() {},
  setNavigationBarColor() {},
  showToast(o) { toasts.push(o && o.title); },
  navigateBack() {}, navigateTo(o) { navs.push(o.url); }, redirectTo(o) { navs.push(o.url); },
  switchTab(o) { navs.push(o.url); },
  pageScrollTo() {},
  getStorageSync() { return ''; }, setStorageSync() {}, removeStorageSync() {},
  cloud: { callFunction() {}, init() {} },
};
global.getApp = () => ({ globalData: { cloudReady: false } });
global.App = () => {};
global.Component = () => {};

function loadPage(rel) {
  let def = null;
  global.Page = (o) => { def = o; };
  const p = path.join(MP, rel);
  delete require.cache[require.resolve(p)];
  require(p);
  if (!def) throw new Error('页面没有调用 Page(): ' + rel);
  return def;
}

function instantiate(def) {
  const inst = Object.create(null);
  Object.keys(def).forEach((k) => { inst[k] = def[k]; });
  inst.data = JSON.parse(JSON.stringify(def.data || {}));
  inst.setData = function (patch) { Object.assign(inst.data, patch); };
  return inst;
}

// ---------------- 断言 ----------------
const problems = [];
const stats = { timelines: 0, nodes: 0, cnCards: 0, details: 0, blocks: 0, figs: 0, chips: 0 };
let htmlChecks = 0;   // 富文本清洗检查（每个正文块一次）
let cnChecks = 0;     // 「同期中国」去重 / 名词可解析

function bad(msg) { problems.push(msg); }
/** 记一次断言：条件不成立就记问题。计数是为了让汇总里的数字真的对应跑过的检查。 */
function chk(cond, msg) { cnChecks++; if (!cond) bad(msg); }
function htmlIssues(label, s) {
  if (typeof s !== 'string' || !s) return;
  htmlChecks++;
  if (/\bclass\s*=/.test(s)) bad(`${label}：rich-text 里残留 class=（小程序不认）`);
  if (/var\(--/.test(s)) bad(`${label}：rich-text 里残留 var(--*)（渲染成黑字）`);
  if (/data-page-node-id/.test(s)) bad(`${label}：残留 Ardot 标记 data-page-node-id`);
}

const roster = require(path.join(MP, 'data/roster'));
const pagesData = require(path.join(MP, 'data/pages'));
const termsData = require(path.join(MP, 'data/terms'));

const scientistDef = loadPage('pages/scientist/index.js');
const timelineDef = loadPage('pages/timeline/index.js');
const detailDef = loadPage('pages/detail/index.js');

console.log('=== 小程序页面逻辑自测 ===');

for (const id of IDS) {
  // ---------- 科学家页 ----------
  const sp = instantiate(scientistDef);
  sp.onLoad({ id });
  if (!sp.data.s) { bad(`${id}/scientist：没加载出科学家`); continue; }
  if (sp.data.details.length !== 4) bad(`${id}/scientist：详解入口 ${sp.data.details.length} 个（期望 4）`);
  if (!sp.data.tlStat) bad(`${id}/scientist：时间轴入口无统计`);
  stats.details += sp.data.details.length;

  // ---------- 时间轴页 ----------
  const tp = instantiate(timelineDef);
  tp.onLoad({ id });
  const raw = pagesData.timeline[id];
  if (tp.data.nodes.length !== raw.length) {
    bad(`${id}/timeline：渲染 ${tp.data.nodes.length} 节点，数据 ${raw.length} 个`);
  }
  if (tp.data.years.length !== raw.length) bad(`${id}/timeline：年份索引与节点数不一致`);
  stats.timelines++; stats.nodes += tp.data.nodes.length;

  let cnOk = 0;
  tp.data.nodes.forEach((n, i) => {
    if (!n.cn || !n.cn.era) bad(`${id}/timeline[${i}] ${n.y}：缺同期中国卡`);
    else cnOk++;
    if (!n.t) bad(`${id}/timeline[${i}] ${n.y}：缺标题`);
    if (!n.blocks.length) bad(`${id}/timeline[${i}] ${n.y}：正文为空`);
    n.blocks.forEach((b) => {
      if (b.k === 'fig') {
        const src = pagesData.timeline[id][i].blocks.filter(x => x.k === 'fig')[0] || {};
        // 已打进包的图必须解析出 src；没进包的（照片待上云）允许为空
        if (b.src) { stats.figs++; if (!b.src.startsWith('/assets/pages/')) bad(`${id}/timeline：包内图路径异常 ${b.src}`); }
        htmlIssues(`${id}/timeline/${n.y}/cap`, b.cap);
      } else {
        htmlIssues(`${id}/timeline/${n.y}/p`, b.h);
      }
    });
  });
  stats.cnCards += cnOk;
  if (cnOk !== tp.data.nodes.length) bad(`${id}/timeline：同期中国卡 ${cnOk}/${tp.data.nodes.length}`);

  // ---- 同期中国：同站不重复（照数据独立数一遍，不复用生成器的分配逻辑）----
  const seenEv = new Map(), seenFg = new Map();
  tp.data.nodes.forEach((n, i) => {
    if (!n.cn) return;
    chk(n.cn.ev.length <= 3 && n.cn.fig.length <= 3,
      `${id}/timeline[${i}] ${n.y}：同期中国条目超限（大事 ${n.cn.ev.length} / 人物 ${n.cn.fig.length}）`);
    n.cn.ev.forEach((e) => {
      chk(!seenEv.has(e.t),
        `${id}/timeline：大事重复「${e.t.slice(0, 14)}」（节点 ${seenEv.get(e.t)} 与 ${n.y}）`);
      seenEv.set(e.t, n.y);
    });
    n.cn.fig.forEach((f) => {
      chk(!seenFg.has(f.name),
        `${id}/timeline：人物重复「${f.name}」（节点 ${seenFg.get(f.name)} 与 ${n.y}）`);
      seenFg.set(f.name, n.y);
    });
  });

  // ---- 同期中国的名词：id 必须能查到解释，否则胶囊点了毫无反应（静默失败）----
  const cnTerms = termsData.cn || {};
  let chipTotal = 0, eraOk = 0;
  raw.forEach((rn, i) => {
    const rcn = rn.cn || {};
    const vn = tp.data.nodes[i];
    (rcn.terms || []).forEach((k) => {
      chk(!!cnTerms[k], `${id}/timeline[${i}] ${rn.y}：名词 ${k} 在术语库里查不到（胶囊点了没反应）`);
    });
    if (!vn || !vn.cn) return;
    // 页面把能解析的做成胶囊，数量应等于原始 terms 去掉年号那一条
    const wantChips = (rcn.terms || []).filter((k) => k !== 'cn-nianhao' && cnTerms[k]).length;
    chk(vn.cn.chips.length === wantChips,
      `${id}/timeline[${i}] ${rn.y}：名词胶囊 ${vn.cn.chips.length} 个，应为 ${wantChips} 个`);
    chipTotal += vn.cn.chips.length;
    if (vn.cn.chips.length) {
      tp.openTerm({ currentTarget: { dataset: { k: vn.cn.chips[0].k } } });
      chk(!!(tp.data.show && tp.data.term && tp.data.term.plain),
        `${id}/timeline[${i}] ${rn.y}：点名词没弹出解释（${vn.cn.chips[0].k}）`);
      tp.closeTerm();
    }
    // 标题那行的年号也是入口，单独点一次
    tp.openTerm({ currentTarget: { dataset: { k: 'cn-nianhao' } } });
    chk(!!(tp.data.show && tp.data.term && tp.data.term.name === '年号纪年'),
      `${id}/timeline[${i}] ${rn.y}：点年号没弹出解释`);
    if (tp.data.term && tp.data.term.name === '年号纪年') eraOk++;
    tp.closeTerm();
  });
  stats.chips += chipTotal;
  chk(eraOk === raw.length, `${id}/timeline：年号名词只弹出了 ${eraOk}/${raw.length} 个节点`);

  // ---------- 详解页（4 篇串起来）----------
  const chain = [];
  sp.data.details.forEach((d) => {
    const dp = instantiate(detailDef);
    dp.onLoad({ id, slug: d.slug });
    if (!dp.data.p || !dp.data.p.title) { bad(`${id}/detail/${d.slug}：没加载出内容`); return; }
    if (!dp.data.blocks.length) bad(`${id}/detail/${d.slug}：正文块为空`);
    if (!dp.data.toc.length) bad(`${id}/detail/${d.slug}：没有小节目录`);
    stats.details = stats.details;
    stats.blocks += dp.data.blocks.length;
    chain.push(d.slug);

    dp.data.blocks.forEach((b, bi) => {
      const label = `${id}/detail/${d.slug}#${bi}`;
      if (b.k === 'p' || b.k === 'fact') htmlIssues(label, b.h);
      if (b.k === 'h' && !b.anchor) bad(`${label}：小节缺锚点（目录点不动）`);
      if (b.k === 'fig') { if (b.src) { stats.figs++; } htmlIssues(label, b.cap); }
      if (b.k === 'note') { htmlIssues(label, b.t); htmlIssues(label, b.h); }
      if (b.k === 'ul') b.items.forEach((x) => htmlIssues(label, x));
      if (b.k === 'form') { htmlIssues(label, b.expr); b.notes.forEach((x) => htmlIssues(label, x)); }
    });

    // 术语胶囊必须能开出弹层
    dp.data.termChips.forEach((c) => {
      stats.chips++;
      dp.openTerm({ currentTarget: { dataset: { k: c.k } } });
      if (!dp.data.show || !dp.data.term || !dp.data.term.name) bad(`${label}：术语「${c.name}」点开是空弹层`);
      dp.closeTerm();
    });
    if (dp.data.p && dp.data.termChips.length === 0) bad(`${id}/detail/${d.slug}：没有可点的术语胶囊`);

    // 上一篇/下一篇必须覆盖完整链条
    const at = chain.indexOf(d.slug);
    if (at === 0 && dp.data.prev) bad(`${id}/detail/${d.slug}：第一篇不该有"上一篇"`);
    if (at > 0 && (!dp.data.prev || dp.data.prev.slug !== chain[at - 1])) {
      bad(`${id}/detail/${d.slug}："上一篇"链断了（期望 ${chain[at - 1]}，得到 ${dp.data.prev && dp.data.prev.slug}）`);
    }
    if (at === sp.data.details.length - 1 && dp.data.next) bad(`${id}/detail/${d.slug}：最后一篇不该有"下一篇"`);
  });
  if (chain.length !== 4) bad(`${id}：详解链只有 ${chain.length} 篇`);

  console.log(`✅ ${id.padEnd(11)} 时间轴 ${String(tp.data.nodes.length).padStart(2)} 节点 · `
    + `同期中国 ${cnOk} · 详解 ${chain.length} 篇 · 术语胶囊 ${sp.data.details.length ? '' : ''}ok`);
}

// ---------------- 汇总 ----------------
const expectNodes = Object.values(pagesData.timeline).reduce((a, b) => a + b.length, 0);
const expectDetails = Object.values(pagesData.detail).reduce((a, b) => a + Object.keys(b).length, 0);
console.log('\n===== 汇总 =====');
console.log(`科学家 ${IDS.length} 位 · 时间轴节点 ${stats.nodes}/${expectNodes} · 同期中国卡 ${stats.cnCards}`);
console.log(`详解页入口 ${stats.details} · 正文块 ${stats.blocks} · 已解析配图 ${stats.figs} · 术语胶囊 ${stats.chips}`);
console.log(`检查 富文本清洗 ${htmlChecks} 处 · 同期中国断言 ${cnChecks} 项 · 页内报错 ${toasts.length}${toasts.length ? '（' + toasts.slice(0, 3).join(' / ') + '）' : ''}`);
if (toasts.length) problems.push(`有页面 onLoad 报错弹提示：${toasts.slice(0, 5).join(' / ')}`);
console.log(problems.length ? `❌ 问题 ${problems.length} 项：\n - ${problems.slice(0, 25).join('\n - ')}` : '✅ 全部通过，0 问题');
process.exit(problems.length ? 1 : 0);

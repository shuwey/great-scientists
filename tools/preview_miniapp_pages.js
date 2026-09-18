// 小程序页面预览器
//
// 不打开微信开发者工具，也能在浏览器里看时间轴页与详解页长什么样。
// 做法是"用真东西"：真数据（data/*.js）+ 真样式（两份 .wxss，rpx 按 375px 视口折半换算）
// + 按 .wxml 的结构用 HTML 重述一遍。所以样式错配、字重不对、图片错位都能看出来。
//
// 它不是模拟器：不跑 wx API、不测交互逻辑（那是 e2e_miniapp_pages.js 的活）。
// 它的唯一职责是**让人用眼睛验收版式**。
//
// 用法：node tools/preview_miniapp_pages.js
// 产物：../读懂牛顿-验证产物/miniapp-preview/index.html
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MP = path.join(ROOT, 'miniapp');
const OUT = path.resolve(ROOT, '..', '读懂牛顿-验证产物', 'miniapp-preview');

const read = (p) => fs.readFileSync(p, 'utf8');
const jsData = (rel) => read(path.join(MP, rel)).replace(/^\/\*[\s\S]*?\*\/\s*/, '').replace(/^module\.exports = /, '').replace(/;\s*$/, '');

// rpx → px：预览视口固定 375px，1rpx = 0.5px
const rpx = (css) => css.replace(/([\d.]+)rpx/g, (_, v) => (parseFloat(v) * 0.5) + 'px');

// ★ 微信的 `page { … }` 在浏览器里不存在这个元素 —— 令牌定义全落在里面，
//   不映射的话 var(--xxx) 统统失效，预览看起来"完全没上样式"（正是这个坑）。
const wxsel = (css) => css.replace(/(^|\n)\s*page\s*\{/g, '$1:root, .screen {');

const css = [
  wxsel(rpx(read(path.join(MP, 'app.wxss')))),
  wxsel(rpx(read(path.join(MP, 'pages/timeline/index.wxss')))),
  wxsel(rpx(read(path.join(MP, 'pages/detail/index.wxss')))),
  wxsel(rpx(read(path.join(MP, 'pages/scientist/index.wxss')))),
];

// 图片：把包内资源拷到预览目录旁边，并改写路径
fs.mkdirSync(OUT, { recursive: true });
for (const dir of ['pages', 'icons']) {
  const src = path.join(MP, 'assets', dir);
  if (!fs.existsSync(src)) continue;
  fs.mkdirSync(path.join(OUT, 'assets', dir), { recursive: true });
  for (const f of fs.readdirSync(src)) fs.copyFileSync(path.join(src, f), path.join(OUT, 'assets', dir, f));
}

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>小程序页面预览 · 读懂科学家</title>
<style>
  body { margin: 0; background: #EEF1F6; font: 14px/1.6 -apple-system, "PingFang SC", sans-serif; color: #1B2530; }
  .wrap { display: flex; gap: 24px; padding: 24px; align-items: flex-start; }
  .side { width: 260px; flex: none; background: #fff; border-radius: 14px; padding: 14px; box-shadow: 0 2px 12px rgba(0,0,0,.06); }
  .side h2 { font-size: 13px; color: #8B96AA; margin: 0 0 10px; font-weight: 600; letter-spacing: .5px; }
  .side button { display: block; width: 100%; text-align: left; border: 0; background: #F4F6FA; border-radius: 9px; padding: 9px 11px; margin-bottom: 6px; cursor: pointer; font-size: 13px; color: #2B3644; }
  .side button:hover { background: #E8EEFB; }
  .side button.on { background: #3B5BDB; color: #fff; }
  .side .sub { margin: 4px 0 10px 6px; }
  .side .sub button { background: transparent; padding: 6px 9px; font-size: 12.5px; color: #56617A; }
  .side .sub button:hover { background: #F4F6FA; }
  .phone { width: 375px; flex: none; background: #F7F9FC; border-radius: 22px; box-shadow: 0 6px 28px rgba(0,0,0,.13); overflow: hidden; }
  .navbar { height: 44px; background: #fff; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 15px; border-bottom: 1px solid #E3E8EF; }
  .screen { height: 760px; overflow-y: auto; }
  .hint { flex: 1; background: #fff; border-radius: 14px; padding: 18px 20px; box-shadow: 0 2px 12px rgba(0,0,0,.06); font-size: 13px; color: #56617A; line-height: 1.9; }
  .hint b { color: #1B2530; }
  .hint code { background: #F4F6FA; padding: 1px 6px; border-radius: 5px; font-size: 12px; }
</style>
<style>
/* ===== 以下为小程序真实样式（app.wxss + 两个页面 wxss，rpx 已折算）===== */
${css.join('\n\n')}
/* ===== 预览器自身的容器微调 ===== */
.screen { background: #F7F9FC; color: #2B3644; font-family: -apple-system, "PingFang SC", "Hiragino Sans GB", sans-serif; font-size: 15px; line-height: 1.6; }
.screen .page { min-height: 0; padding-bottom: 20px; }
.screen rich-text { display: block; }
</style>
</head>
<body>
<div class="wrap">
  <div class="side">
    <h2>时间轴（15 位）</h2>
    <div id="tl-list"></div>
  </div>
  <div class="phone">
    <div class="navbar" id="navtitle">预览</div>
    <div class="screen" id="screen"></div>
  </div>
  <div class="hint">
    <b>这是什么</b><br>
    用<b>真实数据</b>（<code>miniapp/data/*.js</code>）与<b>真实样式</b>（页面 <code>.wxss</code>，rpx 按 375px 视口折半）渲染的版式预览。<br><br>
    <b>为什么可信</b><br>
    结构与 <code>.wxml</code> 一一对应，样式是原文件，所以类名错配、字重不对、图片错位都能看出来。<br><br>
    <b>它不负责什么</b><br>
    不跑 <code>wx</code> API、不测交互逻辑——那部分是 <code>tools/e2e_miniapp_pages.js</code>（887 条断言）。<br><br>
    <b>现在能看到</b><br>
    · 时间轴：年份跳转条、竖轴节点、正文、<b>同期中国</b>卡（朝代年号+大事+人物）<br>
    · 详解页：标题/主张/标签、小节导航、正文各块（配图、提示框、公式符号表、列表、金句）、关键概念胶囊、上/下篇<br><br>
    <b>看不到图片是正常的</b><br>
    历史照片还没上云（<code>data/images.js</code> 解析为空 → 页面不渲染，绝不裂图）；
    示意图 SVG 已随包，应该正常显示。
  </div>
</div>
<script>
const ROSTER = ${jsData('data/roster.js')};
const PAGES = ${jsData('data/pages.js')};
const TERMS = ${jsData('data/terms.js')};
const IMAGES = ${jsData('data/images.js')};

function slugOf(u){ return String(u||'').split('/').pop().replace(/\\.html$/, ''); }
function detailOrder(bundle, map){
  const out = [], seen = {};
  Object.keys((bundle && bundle.pages) || {}).forEach(k => {
    const url = bundle.pages[k].url || '';
    if (url.indexOf('detail/') !== 0) return;
    const s = slugOf(url);
    if (!map[s] || seen[s]) return;
    seen[s] = 1; out.push({ slug: s, title: bundle.pages[k].title });
  });
  Object.keys(map).forEach(s => { if (!seen[s]) { seen[s] = 1; out.push({ slug: s, title: map[s].title }); } });
  return out;
}
const imgsrc = (sid, rel) => (IMAGES[sid + '/' + rel] || '').replace(/^\\//, '');
const esc = (s) => String(s == null ? '' : s);
const life = (f) => f[1] + (f[2] ? '–' + f[2] : '—');

const screen = document.getElementById('screen');
const navtitle = document.getElementById('navtitle');
let mode = { kind: 'timeline', id: 'copernicus', slug: null };

function renderTimeline(s) {
  const raw = PAGES.timeline[s.id] || [];
  const bundle = TERMS.bySci[s.id] || { pages: {} };
  const details = detailOrder(bundle, PAGES.detail[s.id] || {});
  let h = '<div class="page"><div class="who">'
    + '<img class="who-icon" src="' + String(s.iconMini || '').replace(/^\\//, '') + '">'
    + '<div class="who-txt"><span class="who-name">' + esc(s.shortName) + '</span>'
    + '<span class="who-years">' + esc(s.years) + ' · ' + esc(s.disc) + '</span></div></div>'
    + '<div class="years">' + raw.map(n => '<span class="year-chip">' + n.y + '</span>').join('') + '</div>'
    + '<div class="tl">';
  raw.forEach(n => {
    h += '<div class="node"><div class="rail"><div class="rail-line"></div><div class="dot"></div></div><div class="card">'
      + '<div class="nh"><span class="ny">' + n.y + '</span><span class="nt">' + esc(n.t) + '</span></div>'
      + (n.s ? '<span class="ns">' + esc(n.s) + '</span>' : '');
    n.blocks.forEach(b => {
      if (b.k === 'fig') {
        const src = imgsrc(s.id, b.img);
        if (src) h += '<img class="fig" src="' + src + '">';
        if (b.cap) h += '<div class="cap">' + b.cap + '</div>';
      } else { h += '<div class="para">' + b.h + '</div>'; }
    });
    if (n.tags && n.tags.length) h += '<div class="tags">' + n.tags.map(t => '<span class="tag">' + esc(t) + '</span>').join('') + '</div>';
    if (n.cn) {
      h += '<div class="cn"><div class="cn-h">同期中国 · <span class="cn-era">' + esc(n.cn.era) + '</span></div>';
      if (n.cn.ev.length) h += '<div class="cn-row"><span class="cn-k">大事</span><div class="cn-list">'
        + n.cn.ev.map(e => '<div class="cn-i"><span class="cn-y">' + e[0] + '</span><span class="cn-t">' + esc(e[1]) + '</span></div>').join('') + '</div></div>';
      if (n.cn.fig.length) h += '<div class="cn-row"><span class="cn-k">人物</span><div class="cn-list">'
        + n.cn.fig.map(f => '<div class="cn-i"><span class="cn-n">' + esc(f[0]) + '</span><span class="cn-life">' + life(f) + '</span><span class="cn-d">' + esc(f[3]) + ' · ' + esc(f[4]) + '</span></div>').join('') + '</div></div>';
      // 历史名词胶囊：与页面同一条规则（去掉年号那一条，它由标题那行承担）
      const cchips = (n.cn.terms || []).filter(k => k !== 'cn-nianhao' && TERMS.cn && TERMS.cn[k]);
      if (cchips.length) h += '<div class="cn-chips">'
        + cchips.map(k => '<span class="cn-chip">' + esc(TERMS.cn[k].name) + '</span>').join('') + '</div>';
      h += '</div>';
    }
    h += '</div></div>';
  });
  h += '</div>';
  if (details.length) {
    h += '<div class="more"><span class="more-t">这位科学家的成就详解</span>'
      + details.map(d => '<div class="more-i" data-slug="' + d.slug + '"><span class="more-n">' + esc(d.title) + '</span><span class="more-a">›</span></div>').join('')
      + '</div>';
  }
  return h + '</div>';
}

function renderDetail(s, slug) {
  const all = PAGES.detail[s.id] || {};
  const d = all[slug];
  if (!d) return '<div class="page"><div class="body"><div class="para">没找到这篇内容</div></div></div>';
  const bundle = TERMS.bySci[s.id] || { terms: {}, pages: {} };
  const order = detailOrder(bundle, all).map(x => x.slug);
  const at = order.indexOf(slug);
  let hasFact = false;
  let h = '<div class="page"><div class="head"><span class="title">' + esc(d.title) + '</span>'
    + (d.claim ? '<span class="claim">' + esc(d.claim) + '</span>' : '')
    + (d.tags.length ? '<div class="tags">' + d.tags.map(t => '<span class="tag">' + esc(t) + '</span>').join('') + '</div>' : '')
    + '</div>';
  if (d.toc.length) h += '<div class="toc">' + d.toc.map(t => '<span class="toc-i">' + esc(t.t) + '</span>').join('') + '</div>';
  h += '<div class="body">';
  d.blocks.forEach(b => {
    if (b.k === 'h') h += '<div class="h2" id="sec-' + b.id + '">' + esc(b.t) + '</div>';
    else if (b.k === 'fig') {
      const src = imgsrc(s.id, b.img);
      h += '<div class="figbox">' + (src ? '<img class="fig" src="' + src + '">' : '')
        + (b.cap ? '<div class="cap">' + b.cap + '</div>' : '') + '</div>';
    } else if (b.k === 'note') h += '<div class="note note-' + b.tone + '">'
      + (b.t ? '<span class="note-t">' + b.t + '</span>' : '') + '<div class="note-b">' + b.h + '</div></div>';
    else if (b.k === 'form') h += '<div class="form"><div class="form-eq">' + b.expr + '</div>'
      + (b.note ? '<div class="form-note">' + esc(b.note) + '</div>' : '')
      + b.notes.map(x => '<div class="sym">' + x + '</div>').join('') + '</div>';
    else if (b.k === 'ul') h += '<div class="ul">' + b.items.map(x => '<div class="li"><div class="li-dot"></div><div class="li-t">' + x + '</div></div>').join('') + '</div>';
    else if (b.k === 'fact') { hasFact = true; h += '<div class="fact">' + b.h + '</div>'; }
    else h += '<div class="para">' + b.h + '</div>';
  });
  if (!hasFact && d.fact) h += '<div class="fact">一句话记住：' + esc(d.fact) + '</div>';
  h += '</div>';
  const chips = (d.terms || []).filter(k => bundle.terms[k]);
  if (chips.length) h += '<div class="terms"><span class="terms-t">这篇里的关键概念</span><div class="terms-l">'
    + chips.map(k => '<span class="term-chip">' + esc(bundle.terms[k].name) + '</span>').join('') + '</div></div>';
  h += '<div class="pager">';
  if (at > 0) h += '<div class="pg" data-slug="' + order[at-1] + '"><span class="pg-l">← 上一篇</span><span class="pg-t">' + esc(all[order[at-1]].title) + '</span></div>';
  if (at < order.length - 1) h += '<div class="pg pg-r" data-slug="' + order[at+1] + '"><span class="pg-l">下一篇 →</span><span class="pg-t">' + esc(all[order[at+1]].title) + '</span></div>';
  return h + '</div></div>';
}

function paint() {
  const s = ROSTER.scientists.filter(x => x.id === mode.id)[0];
  if (mode.kind === 'timeline') {
    navtitle.textContent = s.shortName + ' · 时间轴';
    screen.innerHTML = renderTimeline(s);
  } else {
    navtitle.textContent = '成就详解';
    screen.innerHTML = renderDetail(s, mode.slug);
  }
  screen.scrollTop = 0;
}

function buildSide() {
  const tlList = document.getElementById('tl-list');
  tlList.innerHTML = '';
  ROSTER.scientists.forEach(s => {
    const b = document.createElement('button');
    b.textContent = s.no + ' ' + s.shortName;
    b.className = s.id === mode.id && mode.kind === 'timeline' ? 'on' : '';
    b.onclick = () => { mode = { kind: 'timeline', id: s.id, slug: null }; buildSide(); paint(); };
    tlList.appendChild(b);
    if (s.id === mode.id) {
      const box = document.createElement('div');
      box.className = 'sub';
      const bundle = TERMS.bySci[s.id] || { pages: {} };
      detailOrder(bundle, PAGES.detail[s.id] || {}).forEach(d => {
        const sb = document.createElement('button');
        sb.textContent = '· ' + d.title;
        sb.onclick = (e) => { e.stopPropagation(); mode = { kind: 'detail', id: s.id, slug: d.slug }; buildSide(); paint(); };
        box.appendChild(sb);
      });
      tlList.appendChild(box);
    }
  });
}

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-slug]');
  if (el) { mode = { kind: 'detail', id: mode.id, slug: el.dataset.slug }; buildSide(); paint(); }
});

// 侧栏每次整体重建（展开项跟着当前科学家走）
buildSide();
paint();
</script>
</body>
</html>`;

fs.writeFileSync(path.join(OUT, 'index.html'), html);
console.log('预览已生成：' + path.join(OUT, 'index.html'));
console.log('体积：' + (fs.statSync(path.join(OUT, 'index.html')).size / 1024).toFixed(1) + ' KB');

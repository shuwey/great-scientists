/* 成就详解页
 *
 * 正文来自 data/pages.js 的 detail 段。抽取器已把网页里的五种块形态
 * （段落 / 配图 / 提示框 / 公式-符号表 / 列表）统一成同一 schema，
 * 这里只负责把它们画出来。
 *
 * 一处诚实的降级：网页正文里那些可点开的术语（<span class="term">）在
 * rich-text 里点不了（rich-text 不支持事件），所以行内的术语只保留"看得见"的
 * 下划线样式，真正可点的入口由页尾的术语胶囊承担 —— 不做假交互。
 */

const roster = require('../../data/roster');
const pagesData = require('../../data/pages');
const termsData = require('../../data/terms');
const store = require('../../utils/store');
const cloud = require('../../utils/cloud');
const img = require('../../utils/img');
const pageOrder = require('../../utils/pages');

Page({
  data: {
    s: null,
    p: null,
    blocks: [],
    toc: [],
    termChips: [],
    prev: null,
    next: null,
    show: false,
    term: null,
    related: [],
  },

  onLoad(options) {
    const id = (options && options.id) || '';
    const slug = (options && options.slug) || '';
    const s = roster.scientists.filter((x) => x.id === id)[0];
    const all = pagesData.detail[id];
    if (!s || !all || !all[slug]) {
      wx.showToast({ title: '没找到这篇内容', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 900);
      return;
    }
    this.id = id;
    this.sci = s;
    this.slug = slug;
    this.bundle = termsData.bySci[id] || { terms: {}, pages: {} };

    const d = all[slug];
    const order = pageOrder.detailOrder(this.bundle, all).map((x) => x.slug);
    const at = order.indexOf(slug);
    const pick = (k) => (k >= 0 && k < order.length
      ? { slug: order[k], title: all[order[k]].title } : null);

    wx.setNavigationBarTitle({ title: d.title });
    store.markScientist(id);
    cloud.reportProgress({ scientistId: id, detailViewed: slug });

    const v = this.toView(d);
    this.setData({
      s: s,
      p: { title: d.title, claim: d.claim || '', tags: d.tags || [] },
      blocks: v.blocks,
      toc: d.toc || [],
      termChips: v.termChips,
      prev: at > 0 ? pick(at - 1) : null,
      next: at < order.length - 1 ? pick(at + 1) : null,
    });
  },

  toView(d) {
    let hasFactBlock = false;
    const blocks = [];
    (d.blocks || []).forEach((b) => {
      if (b.k === 'h') {
        blocks.push({ k: 'h', anchor: 'sec-' + (b.id || ''), t: b.t });
      } else if (b.k === 'fig') {
        blocks.push({ k: 'fig', src: img.resolve(this.id, b.img), cap: b.cap || '' });
      } else if (b.k === 'note') {
        blocks.push({ k: 'note', tone: b.tone || 'amber', t: b.t || '', h: b.h || '' });
      } else if (b.k === 'form') {
        blocks.push({ k: 'form', expr: b.expr || '', note: b.note || '', notes: b.notes || [] });
      } else if (b.k === 'ul') {
        blocks.push({ k: 'ul', items: b.items || [] });
      } else if (b.k === 'fact') {
        hasFactBlock = true;
        blocks.push({ k: 'fact', h: b.h || '' });
      } else {
        blocks.push({ k: 'p', h: b.h || '' });
      }
    });
    // 正文里没有「一句话记住」时，补上侧栏那条
    if (!hasFactBlock && d.fact) {
      blocks.push({ k: 'fact', h: '一句话记住：' + d.fact });
    }

    const termChips = [];
    (d.terms || []).forEach((k) => {
      const t = this.bundle.terms[k];
      if (t) termChips.push({ k: k, name: t.name });
    });
    return { blocks: blocks, termChips: termChips };
  },

  /** 点目录：滚到对应小节。rich-text 里点不了术语，但目录跳转要能用 */
  jump(e) {
    wx.pageScrollTo({ selector: '#' + e.currentTarget.dataset.anchor, duration: 260, offsetTop: -20 });
  },

  openTerm(e) {
    const k = e.currentTarget.dataset.k;
    const t = this.bundle.terms[k];
    if (!t) return;
    const related = (t.related || [])
      .filter((rk) => this.bundle.terms[rk])
      .map((rk) => ({ k: rk, name: this.bundle.terms[rk].name }));
    store.markTerm(this.id, k);
    cloud.reportProgress({ scientistId: this.id, termsMastered: [k] });
    this.setData({ show: true, term: t, related: related });
  },

  onRelated(e) {
    this.openTerm({ currentTarget: { dataset: { k: e.detail.key } } });
  },

  closeTerm() {
    this.setData({ show: false });
  },

  go(e) {
    const slug = e.currentTarget.dataset.slug;
    if (!slug) return;
    wx.redirectTo({ url: '/pages/detail/index?id=' + this.id + '&slug=' + slug });
  },

  onShareAppMessage() {
    const s = this.data.s || {};
    const p = this.data.p || {};
    return {
      title: s.shortName + ' · ' + p.title,
      path: '/pages/detail/index?id=' + this.id + '&slug=' + this.slug,
    };
  },
});

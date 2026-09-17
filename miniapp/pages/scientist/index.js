/* 科学家档案
 *
 * 数据全部来自 data/roster.js + data/terms.js，页面本身不认识任何一位科学家
 * ——以后加到 30 位也不用改这个文件。这是"不搬 HTML 搬数据"的收益。
 */

const roster = require('../../data/roster');
const termsData = require('../../data/terms');
const store = require('../../utils/store');
const cloud = require('../../utils/cloud');

Page({
  data: {
    s: null,
    groups: [],
    q: '',
    show: false,
    term: null,
    termKey: '',
    related: [],
  },

  onLoad(options) {
    const id = (options && options.id) || '';
    const s = roster.scientists.filter((x) => x.id === id)[0];
    if (!s) {
      wx.showToast({ title: '没找到这位科学家', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 900);
      return;
    }

    this.sci = s;
    this.bundle = termsData.bySci[id] || { terms: {}, cats: [] };

    wx.setNavigationBarTitle({ title: s.shortName });
    store.markScientist(id);
    cloud.reportProgress({ scientistId: id });

    this.setData({ s: s, groups: this.buildGroups('') });
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: '#FFFFFF',
    });
  },

  onSearch(e) {
    this.setData({ q: e.detail.value });
    this.setData({ groups: this.buildGroups(e.detail.value) });
  },

  /** 按 cat 分组；cat 顺序取自术语库的 SITE_CATS，漏网的归入「其他」 */
  buildGroups(q) {
    const terms = this.bundle.terms;
    const keys = Object.keys(terms);
    const ql = String(q || '').trim().toLowerCase();
    const hit = (t) => {
      if (!ql) return true;
      return [t.name, t.cat, t.short].join(' ').toLowerCase().indexOf(ql) >= 0;
    };

    const order = (this.bundle.cats || []).slice();
    const extra = [];
    keys.forEach((k) => {
      const c = terms[k].cat || '其他';
      if (order.indexOf(c) === -1 && extra.indexOf(c) === -1) extra.push(c);
    });

    const groups = [];
    order.concat(extra).forEach((cat) => {
      const items = keys
        .filter((k) => (terms[k].cat || '其他') === cat)
        .filter((k) => hit(terms[k]))
        .map((k) => ({ k: k, name: terms[k].name, short: terms[k].short }));
      if (items.length) groups.push({ cat: cat, items: items });
    });
    return groups;
  },

  openTerm(e) {
    const k = e.currentTarget.dataset.k;
    this.showTerm(k);
  },

  showTerm(k) {
    const t = this.bundle.terms[k];
    if (!t) return;
    const related = (t.related || [])
      .filter((rk) => this.bundle.terms[rk])
      .map((rk) => ({ k: rk, name: this.bundle.terms[rk].name }));

    store.markTerm(this.sci.id, k);
    cloud.reportProgress({ scientistId: this.sci.id, termsMastered: [k] });

    this.setData({
      show: true,
      term: t,
      termKey: k,
      related: related,
    });
  },

  onRelated(e) {
    this.showTerm(e.detail.key);
  },

  closeTerm() {
    this.setData({ show: false });
  },

  onShareAppMessage() {
    const s = this.data.s || {};
    return {
      title: s.shortName + ' · ' + (s.disc || ''),
      path: '/pages/scientist/index?id=' + s.id,
    };
  },

  onShareTimeline() {
    const s = this.data.s || {};
    return { title: s.shortName + ' · ' + (s.disc || ''), query: 'id=' + s.id };
  },
});

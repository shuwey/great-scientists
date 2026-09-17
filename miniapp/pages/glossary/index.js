/* 词典 · 398 条术语
 *
 * 检索排序与门户页共用 utils/search.js —— 同一个词在两处给出不同结果，
 * 用户会以为数据不一致。
 *
 * 性能纪律：398 条一次性 setData 会推 60KB+ 过桥，首屏必卡。
 * 所以只渲染前 40 条，触底再追加——这是小程序最容易被忽略的一条。
 * 同理，索引里的内部检索字段（_n/_c/_s/_p）绝不能进 setData。
 */

const termsData = require('../../data/terms');
const roster = require('../../data/roster');
const store = require('../../utils/store');
const search = require('../../utils/search');

const ALL = '__all__';
const PAGE_SIZE = 40;

/** 只把视图要用的字段推过桥 */
function viewTerm(x) {
  return {
    sci: x.sci,
    k: x.k,
    name: x.name,
    cat: x.cat,
    short: x.short,
    sciName: x.sciName,
  };
}

Page({
  data: {
    q: '',
    sci: ALL,
    cat: ALL,
    scis: [],
    cats: [],
    list: [],
    shown: 0,
    total: 0,
    show: false,
    term: null,
    related: [],
    srcName: '',
  },

  onLoad() {
    this.sciName = {};
    this.bySci = termsData.bySci;
    roster.scientists.forEach((s) => {
      this.sciName[s.id] = s.shortName;
    });

    const scis = roster.scientists.map((s) => ({ key: s.id, name: s.shortName }));

    const cats = [];
    const seen = {};
    roster.scientists.forEach((s) => {
      const d = this.bySci[s.id];
      if (!d) return;
      (d.cats || []).forEach((c) => {
        if (!seen[c]) {
          seen[c] = true;
          cats.push(c);
        }
      });
    });

    this.all = search.buildTerms(termsData, this.sciName);

    this.setData({ scis: scis, cats: cats });
    this.apply();
  },

  onShow() {
    // ★ 门户页用 switchTab 跳过来（switchTab 不能带参数），关键词走一次性信箱
    const pending = store.takePendingQuery();
    if (!pending) return;

    // 一并清掉旧筛选：否则词带过来了却被上一次的筛选挡住，看着像「查不到」
    this.setData({ q: pending, sci: ALL, cat: ALL });
    this.apply();
    wx.pageScrollTo({ scrollTop: 0, duration: 0 });
  },

  onSearch(e) {
    this.setData({ q: e.detail.value });
    this.apply();
  },

  onConfirm(e) {
    store.pushQuery(e.detail.value);
  },

  onSci(e) {
    this.setData({ sci: e.currentTarget.dataset.key });
    this.apply();
  },

  onCat(e) {
    this.setData({ cat: e.currentTarget.dataset.key });
    this.apply();
  },

  onClear() {
    this.setData({ q: '', sci: ALL, cat: ALL });
    this.apply();
  },

  apply() {
    const sci = this.data.sci;
    const cat = this.data.cat;

    let rows = this.all;
    if (sci !== ALL) {
      rows = rows.filter((x) => x.sci === sci);
    }
    if (cat !== ALL) {
      rows = rows.filter((x) => x.cat === cat);
    }
    rows = search.rankTerms(rows, this.data.q);

    this.filtered = rows;
    this.setData({
      total: rows.length,
      list: rows.slice(0, PAGE_SIZE).map(viewTerm),
      shown: Math.min(PAGE_SIZE, rows.length),
    });
  },

  onReachBottom() {
    if (this.data.shown >= this.filtered.length) return;
    const next = this.filtered
      .slice(this.data.shown, this.data.shown + PAGE_SIZE)
      .map(viewTerm);
    this.setData({
      list: this.data.list.concat(next),
      shown: this.data.shown + next.length,
    });
  },

  openTerm(e) {
    const { sci, k } = e.currentTarget.dataset;
    const bundle = this.bySci[sci];
    if (!bundle) return;
    const t = bundle.terms[k];
    if (!t) return;

    const related = (t.related || [])
      .filter((rk) => bundle.terms[rk])
      .map((rk) => ({ k: rk, name: bundle.terms[rk].name }));

    store.markTerm(sci, k);

    this.setData({
      show: true,
      term: t,
      related: related,
      srcName: this.sciName[sci] || '',
      curSci: sci,
    });
  },

  onRelated(e) {
    const k = e.detail.key;
    const sci = this.data.curSci;
    const bundle = this.bySci[sci];
    if (!bundle || !bundle.terms[k]) return;
    const t = bundle.terms[k];
    const related = (t.related || [])
      .filter((rk) => bundle.terms[rk])
      .map((rk) => ({ k: rk, name: bundle.terms[rk].name }));
    store.markTerm(sci, k);
    this.setData({ term: t, related: related });
  },

  closeTerm() {
    this.setData({ show: false });
  },

  onShareAppMessage() {
    return { title: '读懂科学家 · 398 条科学术语，一句话讲明白', path: '/pages/glossary/index' };
  },

  onShareTimeline() {
    return { title: '读懂科学家 · 398 条科学术语' };
  },
});

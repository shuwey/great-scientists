/* 门户 · 查询优先
 *
 * ★ 这是过审的结构性约束，不是版式偏好：
 *   类目报的是「工具 > 信息查询」，审核员打开首页第一眼必须看到
 *   「一个能查东西的工具」，而不是「一个看文章的地方」——
 *   否则按「功能与类目不符」驳回，改措辞糊不过去。
 *   所以首屏顺序固定为：搜索框（视觉重心）→ 查询入口 → 浏览（图标桌面退到下方）。
 *
 * 检索逻辑与词典页共用 utils/search.js —— 同一个词在两处给出不同结果
 * 会让人以为数据不一致。
 */

const roster = require('../../data/roster');
const termsData = require('../../data/terms');
const store = require('../../utils/store');
const search = require('../../utils/search');

const ALL = '__all__';
const TERM_LIMIT = 30; // 一次最多 setData 30 条：398 条全推过桥，首屏必卡

// 都经过实跑验证有命中，不是凭感觉写的示例词
const HOT = ['物理', '惯性', '黑洞', '日心说', '相对论', '万有引力', '疫苗'];

Page({
  data: {
    q: '',
    disc: ALL,
    discs: [],
    list: [],
    hot: HOT,
    recent: [],
    termHits: [],
    termTotal: 0,
    sciHits: [],
    totalScientists: 0,
    totalTerms: 0,
    totalCats: 0,
    show: false,
    term: null,
    related: [],
    srcName: '',
    curSci: '',
  },

  onLoad(options) {
    store.captureInvite(options && options.inviteFrom);

    const scientists = roster.scientists;
    const sciNameOf = {};
    scientists.forEach(function (s) {
      sciNameOf[s.id] = s.shortName;
    });

    this.sciNameOf = sciNameOf;
    this.bySci = termsData.bySci;
    this.sciIndex = search.buildScientists(scientists);
    this.termIndex = search.buildTerms(termsData, sciNameOf);
    this.all = scientists;

    const seen = {};
    const discs = [];
    scientists.forEach(function (s) {
      if (!seen[s.discKey]) {
        seen[s.discKey] = true;
        discs.push({ key: s.discKey, name: s.disc, color: s.discColor });
      }
    });

    const cats = {};
    this.termIndex.forEach(function (x) {
      cats[x.cat] = true;
    });

    this.setData({
      discs: discs,
      list: scientists,
      totalScientists: scientists.length,
      totalTerms: this.termIndex.length,
      totalCats: Object.keys(cats).length,
    });
  },

  onShow() {
    // 从词典页回来时「最近查过」可能是新的
    this.setData({ recent: store.getQueries() });
  },

  /* ---------- 查询 ---------- */

  onSearch(e) {
    const q = e.detail.value;
    this.setData({ q: q });
    this.apply(q);
  },

  onConfirm(e) {
    // 只记「已确认」的查询：实时输入每敲一个字都记会污染历史
    store.pushQuery(e.detail.value);
    this.setData({ recent: store.getQueries() });
  },

  onHot(e) {
    const w = e.currentTarget.dataset.w;
    store.pushQuery(w);
    this.setData({ q: w, recent: store.getQueries() });
    this.apply(w);
  },

  onClear() {
    this.setData({ q: '', termHits: [], sciHits: [], termTotal: 0 });
  },

  onClearRecent() {
    store.clearQueries();
    this.setData({ recent: [] });
  },

  apply(q) {
    const key = String(q || '').trim();
    if (!key) {
      this.setData({ termHits: [], sciHits: [], termTotal: 0 });
      return;
    }

    const matched = search.rankTerms(this.termIndex, key);
    const termHits = matched.slice(0, TERM_LIMIT).map(function (x) {
      return {
        sci: x.sci,
        k: x.k,
        name: x.name,
        cat: x.cat,
        short: x.short,
        sciName: x.sciName,
      };
    });

    const sciHits = search.matchScientists(this.sciIndex, key).map(function (s) {
      return {
        id: s.id,
        shortName: s.shortName,
        disc: s.disc,
        discColor: s.discColor,
        years: s.years,
        iconMini: s.iconMini,
      };
    });

    this.setData({ termHits: termHits, termTotal: matched.length, sciHits: sciHits });
  },

  /* ---------- 术语弹层 ---------- */

  openTerm(e) {
    const ds = e.currentTarget.dataset;
    const bundle = this.bySci[ds.sci];
    if (!bundle) return;
    const t = bundle.terms[ds.k];
    if (!t) return;

    const related = (t.related || [])
      .filter(function (rk) {
        return bundle.terms[rk];
      })
      .map(function (rk) {
        return { k: rk, name: bundle.terms[rk].name };
      });

    store.markTerm(ds.sci, ds.k);

    this.setData({
      show: true,
      term: t,
      related: related,
      srcName: this.sciNameOf[ds.sci] || '',
      curSci: ds.sci,
    });
  },

  onRelated(e) {
    const k = e.detail.key;
    const bundle = this.bySci[this.data.curSci];
    if (!bundle || !bundle.terms[k]) return;
    const t = bundle.terms[k];
    const related = (t.related || [])
      .filter(function (rk) {
        return bundle.terms[rk];
      })
      .map(function (rk) {
        return { k: rk, name: bundle.terms[rk].name };
      });

    store.markTerm(this.data.curSci, k);
    this.setData({ term: t, related: related });
  },

  closeTerm() {
    this.setData({ show: false });
  },

  /* ---------- 跳转 ---------- */

  goGlossary() {
    const q = String(this.data.q || '').trim();
    // ★ switchTab 不能带参数，只能把词投进一次性信箱，词典页 onShow 取
    if (q) {
      store.pushQuery(q);
      store.setPendingQuery(q);
    }
    wx.switchTab({ url: '/pages/glossary/index' });
  },

  onDisc(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({
      disc: key,
      list: key === ALL ? this.all : this.all.filter(function (s) { return s.discKey === key; }),
    });
  },

  openScientist(e) {
    const id = e.currentTarget.dataset.id;
    store.markScientist(id);
    wx.navigateTo({ url: '/pages/scientist/index?id=' + id });
  },

  onShareAppMessage() {
    return {
      title: '读懂科学家 · 15 位科学家的生平、398 条术语，一搜就到',
      path: '/pages/portal/index',
    };
  },

  onShareTimeline() {
    return { title: '读懂科学家 · 15 位科学家的生平、398 条术语，一搜就到' };
  },
});

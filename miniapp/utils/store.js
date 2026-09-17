/* 本地优先的学习档案
 *
 * 为什么先做本地：个人主体拿不到手机号，账号就是 openid；而"我的进度"
 * 这种数据哪怕完全离线也该能用。云同步是增强，不是前提。
 * 所有集合的云端权限一律「仅创建者可读写」，这里不做任何跨用户读写。
 */

const K_CHECKIN = 'checkin';
const K_SCI = 'readScientists';
const K_TERM = 'viewedTerms';
const K_INVITE = 'inviteFrom';

function pad(n) {
  return n < 10 ? '0' + n : '' + n;
}

function dayKey(d) {
  const t = d || new Date();
  return t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate());
}

/** 连续打卡：同一天重复调用不重复计数。返回 { streak, total, last } */
function touchCheckin() {
  const today = dayKey();
  const rec = wx.getStorageSync(K_CHECKIN) || {};
  if (rec.last === today) return rec;

  const yesterday = dayKey(new Date(Date.now() - 24 * 3600 * 1000));
  rec.streak = rec.last === yesterday ? (rec.streak || 0) + 1 : 1;
  rec.last = today;
  rec.total = (rec.total || 0) + 1;
  wx.setStorageSync(K_CHECKIN, rec);
  return rec;
}

function getCheckin() {
  return wx.getStorageSync(K_CHECKIN) || { streak: 0, total: 0, last: '' };
}

/** 记住通过分享进入的邀请人（仅用于自己的增长分析，前端不展示他人） */
function captureInvite(inviteFrom) {
  if (inviteFrom && !wx.getStorageSync(K_INVITE)) {
    wx.setStorageSync(K_INVITE, inviteFrom);
  }
}

function markScientist(sid) {
  if (!sid) return;
  const list = wx.getStorageSync(K_SCI) || [];
  if (list.indexOf(sid) === -1) {
    list.push(sid);
    wx.setStorageSync(K_SCI, list);
  }
}

function markTerm(sci, key) {
  if (!sci || !key) return;
  const id = sci + ':' + key;
  const list = wx.getStorageSync(K_TERM) || [];
  if (list.indexOf(id) === -1) {
    list.push(id);
    wx.setStorageSync(K_TERM, list);
  }
}

/* ---------- 查询记录（纯本地，无隐私面，不需要任何授权） ---------- */

const K_QUERY = 'recentQueries';
const K_PENDING = 'pendingQuery';
const QUERY_MAX = 8;

/** 只记「已确认」的查询：实时输入不记，否则每敲一个字都会进历史 */
function pushQuery(q) {
  const v = String(q || '').trim();
  if (!v) return;
  const list = (wx.getStorageSync(K_QUERY) || []).filter(function (x) {
    return x !== v;
  });
  list.unshift(v);
  wx.setStorageSync(K_QUERY, list.slice(0, QUERY_MAX));
}

function getQueries() {
  return wx.getStorageSync(K_QUERY) || [];
}

function clearQueries() {
  wx.removeStorageSync(K_QUERY);
}

/** ★ switchTab 不能带参数 —— 跨 tab 传查询词只能走这个一次性信箱 */
function setPendingQuery(q) {
  const v = String(q || '').trim();
  if (v) wx.setStorageSync(K_PENDING, v);
}

function takePendingQuery() {
  const v = wx.getStorageSync(K_PENDING) || '';
  if (v) wx.removeStorageSync(K_PENDING);
  return v;
}

function stats() {
  const checkin = getCheckin();
  return {
    streak: checkin.streak || 0,
    checkinDays: checkin.total || 0,
    scientists: (wx.getStorageSync(K_SCI) || []).length,
    terms: (wx.getStorageSync(K_TERM) || []).length,
  };
}

module.exports = {
  touchCheckin: touchCheckin,
  getCheckin: getCheckin,
  captureInvite: captureInvite,
  markScientist: markScientist,
  markTerm: markTerm,
  pushQuery: pushQuery,
  getQueries: getQueries,
  clearQueries: clearQueries,
  setPendingQuery: setPendingQuery,
  takePendingQuery: takePendingQuery,
  stats: stats,
};

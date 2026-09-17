/* 云函数 report —— 学习进度与自测成绩上报
 *
 * 写入规则：所有集合都靠 _openid 归属，配合「仅创建者可读写」权限，
 * 前端即使有漏洞也读不到别人的数据。
 *
 * 幂等：progress 按 (openid, scientistId) upsert，重复上报不会产生脏数据。
 */

const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

function str(v, max) {
  return String(v == null ? '' : v).slice(0, max || 64);
}

function arr(v, max) {
  if (!Array.isArray(v)) return [];
  return v.slice(0, max || 500).map((x) => str(x, 64));
}

exports.main = async (event) => {
  const openid = cloud.getWXContext().OPENID;
  if (!openid) return { ok: false, error: 'no openid in context' };

  const action = str(event && event.action, 32);
  const p = (event && event.payload) || {};
  const now = new Date();

  if (action === 'progress') {
    const scientistId = str(p.scientistId, 32);
    if (!scientistId) return { ok: false, error: 'scientistId required' };

    const progress = db.collection('progress');
    const found = await progress.where({ _openid: openid, scientistId: scientistId }).limit(1).get();

    const doc = {
      _openid: openid,
      scientistId: scientistId,
      pagesRead: arr(p.pagesRead, 20),
      termsMastered: arr(p.termsMastered, 500),
      lastReadAt: now,
    };

    if (found.data.length) {
      const prev = found.data[0];
      doc.pagesRead = Array.from(new Set([].concat(prev.pagesRead || [], doc.pagesRead)));
      doc.termsMastered = Array.from(new Set([].concat(prev.termsMastered || [], doc.termsMastered)));
      await progress.doc(prev._id).update({ data: doc });
    } else {
      await progress.add({ data: doc });
    }
    return { ok: true, scientistId: scientistId };
  }

  if (action === 'quiz') {
    const quizId = str(p.quizId, 32);
    if (!quizId) return { ok: false, error: 'quizId required' };

    await db.collection('quizRecords').add({
      data: {
        _openid: openid,
        quizId: quizId,
        scientistId: str(p.scientistId, 32),
        score: Math.max(0, Math.min(100, Number(p.score) || 0)),
        createdAt: now,
      },
    });
    return { ok: true };
  }

  return { ok: false, error: 'unknown action: ' + action };
};

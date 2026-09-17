/* 云函数 login —— 静默登录
 *
 * 个人主体不能用 getPhoneNumber，也不需要：云函数里 getWXContext() 拿到的
 * OPENID 就是可信且稳定的用户标识。
 *
 * ⚠️ 云函数端用 wx-server-sdk 写库**不会自动补 _openid**，必须显式写入；
 *    否则"仅创建者可读写"的权限规则会认不出归属，等于把数据敞开。
 */

const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const ctx = cloud.getWXContext();
  const openid = ctx.OPENID;

  if (!openid) {
    return { ok: false, error: 'no openid in context' };
  }

  const users = db.collection('users');
  const now = new Date();

  const found = await users.where({ _openid: openid }).limit(1).get();

  if (!found.data.length) {
    await users.add({
      data: {
        _openid: openid,
        nickName: '',
        avatarUrl: '',
        inviteFrom: String((event && event.inviteFrom) || '').slice(0, 64),
        createdAt: now,
        lastActiveAt: now,
      },
    });
    return { ok: true, openid, isNew: true };
  }

  await users.doc(found.data[0]._id).update({ data: { lastActiveAt: now } });
  return { ok: true, openid, isNew: false };
};

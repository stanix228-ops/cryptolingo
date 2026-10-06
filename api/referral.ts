import type { VercelRequest, VercelResponse } from '@vercel/node';

const BOT_TOKEN = '8917579959:AAHq_cgV3jjtMMkD8Jc8e7otsxupE8sZDEY';

// In-memory cache for the current lambda lifecycle
const persistentReferrals: Record<string, Set<string>> = {
  // Pre-seed known confirmed referrals from Telegram history
  '6511326390': new Set(['8672952991']),
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action, userId, inviterId, friendId } = req.query as Record<string, string>;
  const targetUser = String(userId || inviterId || '').trim();

  // 1. Manual registration via POST or query
  if (action === 'register' || req.method === 'POST') {
    const inv = String(inviterId || (req.body && req.body.inviterId) || '').trim();
    const friend = String(friendId || (req.body && req.body.friendId) || '').trim();

    if (inv && friend && inv !== friend) {
      if (!persistentReferrals[inv]) {
        persistentReferrals[inv] = new Set();
      }
      persistentReferrals[inv].add(friend);
    }
  }

  // 2. Fetch fresh updates from Telegram Bot API directly to catch any newly registered friends
  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=-100`, {
      method: 'GET',
    });
    const tgData = await tgRes.json();

    if (tgData && tgData.ok && Array.isArray(tgData.result)) {
      for (const item of tgData.result) {
        const msg = item.message;
        if (!msg) continue;
        const text = String(msg.text || '');
        const senderId = String(msg.from?.id || '');

        if (text.startsWith('/start ref_')) {
          const inviterFromCmd = text.replace('/start ref_', '').trim();
          if (inviterFromCmd && senderId && inviterFromCmd !== senderId) {
            if (!persistentReferrals[inviterFromCmd]) {
              persistentReferrals[inviterFromCmd] = new Set();
            }
            persistentReferrals[inviterFromCmd].add(senderId);
          }
        }
      }
    }
  } catch (err) {
    console.error('Failed to sync Telegram getUpdates in serverless API', err);
  }

  // 3. If targetUser is requested, return their real referral status
  if (targetUser) {
    const friendsSet = persistentReferrals[targetUser] || new Set();
    const friendsList = Array.from(friendsSet);
    const count = friendsList.length;

    return res.status(200).json({
      ok: true,
      userId: targetUser,
      referralCount: count,
      unlocked: count >= 1,
      friends: friendsList,
      timestamp: Date.now(),
    });
  }

  // General dump for debugging
  const allData: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(persistentReferrals)) {
    allData[k] = Array.from(v);
  }

  return res.status(200).json({
    ok: true,
    allReferrals: allData,
  });
}

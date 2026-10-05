import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory / Cloud KV store for referrals
// Map: inviterId -> Set of friendIds
const referralsDB: Record<string, string[]> = {};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
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

  // POST or GET action: register referral
  if (action === 'register' || req.method === 'POST') {
    const inv = inviterId || (req.body && req.body.inviterId);
    const friend = friendId || (req.body && req.body.friendId);

    if (!inv || !friend) {
      return res.status(400).json({ ok: false, error: 'Missing inviterId or friendId' });
    }

    if (inv === friend) {
      return res.status(200).json({ ok: true, message: 'Self referral ignored' });
    }

    if (!referralsDB[inv]) {
      referralsDB[inv] = [];
    }

    if (!referralsDB[inv].includes(friend)) {
      referralsDB[inv].push(friend);
    }

    return res.status(200).json({
      ok: true,
      inviterId: inv,
      referralCount: referralsDB[inv].length,
      unlocked: referralsDB[inv].length >= 1,
    });
  }

  // GET check status for userId
  const targetUser = userId || inviterId;
  if (!targetUser) {
    return res.status(400).json({ ok: false, error: 'Missing userId' });
  }

  const list = referralsDB[targetUser] || [];
  return res.status(200).json({
    ok: true,
    userId: targetUser,
    referralCount: list.length,
    unlocked: list.length >= 1,
    friends: list,
  });
}

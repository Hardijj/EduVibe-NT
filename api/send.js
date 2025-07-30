import { Redis } from '@upstash/redis';
import webpush from 'web-push';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

webpush.setVapidDetails(
  'mailto:you@example.com',
  process.env.VAPID_PUBLIC,
  process.env.VAPID_PRIVATE
);

const PASS = process.env.ADMIN_PASS;

// Async iterator to scan all keys matching a pattern
async function scanKeys(redis, pattern) {
  const keys = [];
  let cursor = 0;

  while (true) {
    const [nextCursor, foundKeys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);

    if (Array.isArray(foundKeys)) {
      keys.push(...foundKeys);
    }

    cursor = Number(nextCursor);
    if (cursor === 0) break;
  }

  return keys;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { pass, title, body, url, test } = req.body || {};

  if (pass !== PASS) return res.status(401).json({ error: 'bad password' });
  if (test) return res.json({ ok: 'ping' });
  if (!title || !body) return res.status(400).json({ error: 'need title & body' });

  // ✅ Use SCAN instead of KEYS
  const keys = await scanKeys('sub:*');
  const subs = await Promise.all(keys.map(k => redis.get(k)));

  const payload = JSON.stringify({ title, body, url });

  const results = await Promise.allSettled(
    subs.map(sub => webpush.sendNotification(sub, payload))
  );

  results.forEach((r, i) => {
    if (r.status === 'rejected' && r.reason?.statusCode === 410) {
      redis.del(keys[i]);
    }
  });

  res.json({
    to: subs.length,
    ok: results.filter(r => r.status === 'fulfilled').length,
    fail: results.filter(r => r.status === 'rejected').length
  });
                       }

import { Redis } from '@upstash/redis';
import webpush from 'web-push';

const redis = new Redis({
  url:   process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

webpush.setVapidDetails(
  'mailto:you@example.com',
  process.env.VAPID_PUBLIC,
  process.env.VAPID_PRIVATE
);

/* simple password; store in Vercel as ADMIN_PASS */
const PASS = process.env.ADMIN_PASS;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (req.headers.authorization !== `Bearer ${PASS}`) {
    return res.status(401).json({ error: 'bad password' });
  }

  const { title, body, url } = req.body;
  if (!title || !body) return res.status(400).end('need title & body');

  const keys = await redis.keys('sub:*');
  const subs = await Promise.all(keys.map(k => redis.get(k)));

  const payload = JSON.stringify({ title, body, url });

  const results = await Promise.allSettled(
    subs.map(s => webpush.sendNotification(s, payload))
  );

  results.forEach((r, i) =>
    r.status === 'rejected' && r.reason?.statusCode === 410 && redis.del(keys[i])
  );

  res.json({
    to:   subs.length,
    ok:   results.filter(r => r.status === 'fulfilled').length,
    fail: results.filter(r => r.status === 'rejected').length
  });
}

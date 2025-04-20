import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const resp = await fetch('https://api.daily.co/v1/rooms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DAILY_API_KEY!}`,
    },
    body: JSON.stringify({
      properties: {
        exp: Math.floor(Date.now() / 1000) + 5 * 60, // 5‑minute expiry
        enable_chat: false,
        eject_after_call: true,
      },
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    return res.status(resp.status).send(text);
  }

  const data = await resp.json();
  res.status(200).json({ url: data.url });
}

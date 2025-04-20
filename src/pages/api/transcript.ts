import type { NextApiRequest, NextApiResponse } from 'next';
import { SpeechClient } from '@google-cloud/speech';

const client = new SpeechClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { audioContent } = req.body; // expect base64‑encoded LINEAR16

  try {
    const [response] = await client.recognize({
      audio: { content: audioContent },
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz: 48000,
        languageCode: 'en-US',
      },
    });

    const transcription = response.results
      .map(r => r.alternatives?.[0]?.transcript || '')
      .join('\n');

    return res.status(200).json({ transcription });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}

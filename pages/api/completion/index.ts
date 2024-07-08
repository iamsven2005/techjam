// pages/api/completion/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { prompt }: { prompt: string } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const { text } = await generateText({
        model: openai('gpt-4'),
        system: 'You are a helpful assistant.',
        prompt,
      });

      res.status(200).json({ text });
    } catch (error) {
      console.error('Error generating text:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

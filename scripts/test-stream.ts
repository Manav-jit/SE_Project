import fs from 'fs';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText, streamText } from 'ai';

const key = fs.readFileSync('.env.local', 'utf8').split('=')[1].trim();
const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: key,
});

async function run() {
  try {
    const result = streamText({
      model: groq('openai/gpt-oss-20b'),
      system: 'You are an AI.',
      messages: [
        { role: 'user', content: 'i am a farmer' },
        { role: 'assistant', content: 'state?' },
        { role: 'user', content: 'punjab' }
      ],
      temperature: 0.3,
    });
    
    // consume the stream to trigger any errors
    try {
        for await (const textPart of result.textStream) {
            process.stdout.write(textPart);
        }
    } catch (streamErr) {
        console.error("STREAM ERROR:", streamErr);
    }
  } catch (err) {
    console.error("SETUP ERROR:", err);
  }
}
run();

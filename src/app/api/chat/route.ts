import { NextRequest } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, generateText, convertToModelMessages, UIMessage } from 'ai';
import { findRelevantSchemes } from "@/lib/rag/retriever";
import { SYSTEM_PROMPT, EXTRACTION_PROMPT } from "@/lib/chat/prompts";
import { UserProfile, formatProfileForPrompt } from "@/lib/chat/profile";

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

function getMessageText(message: UIMessage | { content?: unknown; parts?: Array<{ type: string; text?: string }> }): string {
  if (typeof (message as { content?: unknown }).content === 'string') {
    return (message as { content: string }).content;
  }

  const parts = (message as UIMessage).parts;
  if (!Array.isArray(parts)) return '';

  return parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text' && 'text' in part)
    .map((part) => part.text)
    .join('');
}

export async function POST(req: NextRequest) {
  try {
    const { messages, profile, language } = await req.json();
    const currentProfile: UserProfile = profile || {};
    const uiMessages = (messages || []) as UIMessage[];

    const latestMessage = getMessageText(uiMessages[uiMessages.length - 1] || { parts: [] });
    const history = uiMessages
      .slice(Math.max(0, uiMessages.length - 4), -1)
      .map((m) => `${m.role}: ${getMessageText(m)}`)
      .join('\n');

    // 1. Extract info
    let extractedData = {};
    try {
      const extractionPrompt = EXTRACTION_PROMPT
        .replace('{history}', history)
        .replace('{message}', latestMessage);

      const { text } = await generateText({
        model: groq.chat('openai/gpt-oss-20b'),
        prompt: extractionPrompt,
        temperature: 0,
        maxOutputTokens: 200
      });

      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      extractedData = JSON.parse(cleaned);
    } catch (e) {
      console.warn("Extraction failed or returned invalid JSON", e);
    }

    const mergedProfile = { ...currentProfile, ...extractedData };

    // 2. Retrieve schemes
    const profileSummary = Object.values(mergedProfile).join(" ");
    const searchString = profileSummary.length > 0 ? profileSummary : "welfare schemes";
    const relevantSchemes = await findRelevantSchemes(searchString, 2);

    // Reduce token size by only sending scheme name and benefits to the prompt
    const simplifiedSchemes = relevantSchemes.map((s: any) => ({ name: s.name, benefits: s.benefits }));

    // 3. Generate response
    let formattedSysPrompt = SYSTEM_PROMPT
      .replace('{profile}', formatProfileForPrompt(mergedProfile))
      .replace('{schemes}', JSON.stringify(simplifiedSchemes, null, 2));

    if (language === 'hi') {
      formattedSysPrompt += '\n\nCRITICAL INSTRUCTION: You MUST respond in Hindi (हिंदी) language ONLY. Translate your response appropriately.';
    } else {
      formattedSysPrompt += '\n\nCRITICAL INSTRUCTION: You MUST respond in English language ONLY.';
    }

    const modelMessages = await convertToModelMessages(uiMessages);

    const result = streamText({
      model: groq.chat('openai/gpt-oss-20b'),
      system: formattedSysPrompt,
      messages: modelMessages,
      temperature: 0.3,
      maxOutputTokens: 500,
    });

    const response = result.toUIMessageStreamResponse();
    response.headers.set('x-updated-profile', JSON.stringify(mergedProfile));
    try {
      response.headers.set('x-matched-schemes', encodeURIComponent(JSON.stringify(relevantSchemes)));
    } catch(e) { console.error("Failed to set schemes header"); }

    return response;
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

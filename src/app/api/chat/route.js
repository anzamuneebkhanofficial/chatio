/**
 * POST /api/chat
 *
 * Next.js App Router API route — AI chat endpoint.
 */

import { NextResponse } from 'next/server';
import { generateResponse } from '@/components/ChatBot/lib/smartSwitch';
import { getRelevantContext } from '@/components/ChatBot/lib/knowledgeLoader';
import { buildSystemInstruction } from '@/components/ChatBot/lib/config';
import { checkRateLimit } from '@/components/ChatBot/lib/rateLimit';

export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed. Please use POST.' }, { status: 405 });
}

export async function POST(req) {
  try {
    // ── MongoDB Rate Limiting ──
    const ip = req.headers.get('x-forwarded-for') || 'unknown_ip';
    const rateLimit = await checkRateLimit(ip);
    
    if (rateLimit.limited) {
      return NextResponse.json(
        { error: 'You are sending messages too quickly. Please wait a minute before sending more.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const messages = body.messages ?? [];

    // Basic validation
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid payload: messages array is required.' },
        { status: 400 }
      );
    }

    // Validate last message is from user
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg?.content?.trim()) {
      return NextResponse.json(
        { error: 'Message content cannot be empty.' },
        { status: 400 }
      );
    }

    // Load knowledge context using Zero-Dependency RAG Engine (now async)
    const knowledgeContext = await getRelevantContext(lastMsg.content, Number(process.env.MAX_KNOWLEDGE_CHARS ?? 20000));

    // Build full system instruction with knowledge injected
    const systemInstruction = buildSystemInstruction(knowledgeContext);

    // Fire the Smart Switch Fallback Engine
    const { text, provider } = await generateResponse(messages, systemInstruction);

    return NextResponse.json({ text, provider });
  } catch (error) {
    console.error('[API /api/chat] Error:', error.message);

    return NextResponse.json(
      {
        error:
          error.message?.includes('unavailable')
            ? error.message
            : 'An internal server error occurred. Please try again.',
      },
      { status: 500 }
    );
  }
}

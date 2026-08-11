/**
 * POST /api/chat
 *
 * Next.js App Router API route — AI chat endpoint.
 * Includes rate limiting, guardrail scope verification, RAG context retrieval,
 * and Smart Switch LLM response generation.
 */

import { NextResponse } from 'next/server';
import { generateResponse } from '@/components/ChatBot/lib/smartSwitch';
import { getRelevantContext } from '@/components/ChatBot/lib/knowledgeLoader';
import { buildSystemInstruction } from '@/components/ChatBot/lib/config';
import { checkRateLimit } from '@/components/ChatBot/lib/rateLimit';
import { checkGuardrails } from '@/components/ChatBot/lib/guardrails';

export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed. Please use POST.' }, { status: 405 });
}

export async function POST(req) {
  try {
    // ── MongoDB Rate Limiting ──
    const ip = req.headers.get('x-forwarded-for') || 'unknown_ip';
    let rateLimit = { limited: false };
    
    try {
      rateLimit = await checkRateLimit(ip);
    } catch (rlError) {
      console.warn('[API /api/chat] Rate limiter warning:', rlError.message);
    }
    
    if (rateLimit.limited) {
      return NextResponse.json(
        { error: 'You are sending messages too quickly. Please wait 60 seconds before sending more.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const messages = body.messages ?? [];

    // Validation
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid payload: messages array is required.' },
        { status: 400 }
      );
    }

    const lastMsg = messages[messages.length - 1];
    const userText = lastMsg?.content?.trim() || '';

    if (!userText) {
      return NextResponse.json(
        { error: 'Message content cannot be empty.' },
        { status: 400 }
      );
    }

    // High-Level Guardrail Check (Backend)
    const guardrailResult = checkGuardrails(userText);
    if (guardrailResult.isOffTopic) {
      return NextResponse.json({
        text: guardrailResult.warningResponse,
        provider: 'Guardrail',
      });
    }

    // Load knowledge context using Zero-Dependency RAG Engine
    let knowledgeContext = '';
    try {
      knowledgeContext = await getRelevantContext(userText, Number(process.env.MAX_KNOWLEDGE_CHARS ?? 20000));
    } catch (ragError) {
      console.warn('[API /api/chat] RAG retrieval warning:', ragError.message);
    }

    // Build system instruction with injected knowledge
    const systemInstruction = buildSystemInstruction(knowledgeContext);

    // Smart Switch Fallback Engine
    const { text, provider } = await generateResponse(messages, systemInstruction);

    return NextResponse.json({ text, provider });
  } catch (error) {
    console.error('[API /api/chat] Error:', error.message);

    const errorMessage = error.message?.includes('No AI API keys')
      ? 'AI service is temporarily unconfigured. Please configure API keys.'
      : 'An internal server error occurred while processing your request. Please try again.';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

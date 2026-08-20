import { NextResponse } from 'next/server';
import { generateResponse } from '@/components/ChatBot/lib/smartSwitch';
import { getKnowledgeByAppId, getBotConfigByAppId } from '@/lib/multiUserDb';
import { getBotConfig } from '@/components/ChatBot/lib/dbConfig';
import { buildSystemInstruction } from '@/components/ChatBot/lib/config';
import { checkRateLimit } from '@/components/ChatBot/lib/rateLimit';
import { checkGuardrails } from '@/components/ChatBot/lib/guardrails';
import { getDemoKnowledgeContext } from '@/components/ChatBot/lib/knowledgeLoader';
import { DEMO_PRESETS, CHATIO_DEFAULT_PRESET } from '@/components/ChatBot/lib/demoPresets';
import { getResponseFromCache, saveResponseToCache } from '@/components/ChatBot/lib/responseCache';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key, X-Requested-With',
  'Access-Control-Allow-Private-Network': 'true',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed. Please use POST.' }, { status: 405, headers: CORS_HEADERS });
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const messages = body.messages ?? [];
    const conversationId = body.conversationId || `conv_${Date.now()}`;
    const appId = body.appId || req.nextUrl.searchParams.get('appId') || '';
    const demoId = body.demoId || '';

    // Rate Limiting via rate-limiter-flexible
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    let rateLimit = { limited: false, retryAfter: 0 };
    try {
      rateLimit = await checkRateLimit(ip);
    } catch (rlError) {
      console.warn('[API /api/chat] Rate limiter warning:', rlError.message);
    }
    
    if (rateLimit.limited) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateLimit.retryAfter || 60} seconds before sending more.` },
        { status: 429, headers: CORS_HEADERS }
      );
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid payload: messages array is required.' }, { status: 400, headers: CORS_HEADERS });
    }

    const lastMsg = messages[messages.length - 1];
    const userText = lastMsg?.content?.trim() || '';

    if (!userText) {
      return NextResponse.json({ error: 'Message content cannot be empty.' }, { status: 400, headers: CORS_HEADERS });
    }

    // Guardrail check (applies to platform bot, skipped for custom tenant bots & demos)
    const guardrailResult = checkGuardrails(userText, demoId, appId);
    if (guardrailResult.isOffTopic) {
      return NextResponse.json({
        text: guardrailResult.warningResponse,
        provider: 'Guardrail',
      }, { headers: CORS_HEADERS });
    }

    const scope = appId || demoId || 'global';

    // ── High-Speed TTL Response Cache (Instant 0ms, 0 tokens on repeated query) ──
    const cached = getResponseFromCache(scope, userText, messages.length);
    if (cached) {
      return NextResponse.json({
        text: cached.text,
        provider: `${cached.provider} (Cache)`,
        conversationId,
        appId,
        demoId,
      }, { headers: CORS_HEADERS });
    }

    let knowledgeContext = '';
    let systemInstruction = '';
    let botConfig = null;

    // ── DEMO SESSION MODE (Restaurant, E-Commerce, Medical, Design) ──────────
    if (demoId && DEMO_PRESETS[demoId]) {
      const demoPreset = DEMO_PRESETS[demoId];
      knowledgeContext = await getDemoKnowledgeContext(demoId) || '';

      systemInstruction = `System Persona & Directives:
${demoPreset.systemPrompt}

Your name is "${demoPreset.name}".

KNOWLEDGE BASE — You answer visitor questions based on this verified data:
--- START OF KNOWLEDGE BASE ---
${knowledgeContext}
--- END OF KNOWLEDGE BASE ---

═══════════════════════════════════════════
STRICT OPERATIONAL RULES:
═══════════════════════════════════════════
1. Actively and politely assist the visitor representing ${demoPreset.label}.
2. Answer based strictly on the provided knowledge base facts, menus, pricing, policies, and hours.
3. If asked something completely outside your business domain, politely explain your business scope.
4. Format responses cleanly with Markdown bolding and bullet points.`.trim();
    }
    // ── PERMANENT / USER ACCOUNT MODE (Chatio Platform or User AppId) ────────
    else {
      if (appId) {
        botConfig = await getBotConfigByAppId(appId);
        knowledgeContext = await getKnowledgeByAppId(appId) || '';
      } else {
        botConfig = await getBotConfig();
        const { getRelevantContext } = await import('@/components/ChatBot/lib/knowledgeLoader');
        knowledgeContext = await getRelevantContext(userText) || '';
      }

      systemInstruction = buildSystemInstruction(knowledgeContext, botConfig);
    }

    // Smart Switch Engine — Generate AI Response (stateless session execution)
    const { text, provider } = await generateResponse(messages, systemInstruction, botConfig);

    // Save into Fast TTL Response Cache
    saveResponseToCache(scope, userText, messages.length, { text, provider });

    return NextResponse.json({ text, provider, conversationId, appId, demoId }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error('[API /api/chat] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500, headers: CORS_HEADERS });
  }
}

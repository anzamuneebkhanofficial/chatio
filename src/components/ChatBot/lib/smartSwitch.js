/**
 * Smart Switch Engine — Groq-First with Timeout Escalation
 *
 * Strategy (saves tokens + API hits):
 *   1. Fire Groq ONLY first
 *   2. Wait up to GROQ_TIMEOUT_MS (default 5s)
 *   3. If Groq responds within timeout → return it. Done. Zero Gemini hit.
 *   4. If Groq is still pending after timeout → fire Gemini too (parallel race)
 *   5. First of Groq/Gemini to respond WINS, the other is aborted immediately
 *   6. If both fail → structured error with per-provider reason
 *
 * This means:
 *   - When Groq is fast (95% of cases) → only 1 API call, 1 provider hit
 *   - When Groq is slow → Gemini kicks in, still only 1 response counted
 *   - Never double-bills both providers simultaneously on every request
 */

import { ChatGroq } from '@langchain/groq';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { SystemMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { getBotConfig } from './dbConfig.js';

const GROQ_PRODUCTION_MODEL   = 'openai/gpt-oss-120b';
const GEMINI_PRODUCTION_MODEL = 'gemini-2.0-flash';

// How long to wait for primary before escalating to secondary (ms)
// Override via SMART_SWITCH_TIMEOUT_MS env var
const DEFAULT_TIMEOUT_MS = 5000;

// Circuit breaker: timestamp until which a provider is in cooldown
let _groqCooldownUntil   = 0;
let _geminiCooldownUntil = 0;

// ── Helpers ────────────────────────────────────────────────────────────────

function scrubMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/#/g, '')
    .replace(/_/g, '')
    .trim();
}

function toLangChainMessages(messages, systemInstruction) {
  const MAX_HIST = Number(process.env.AI_MAX_HISTORY_MSGS ?? 8);
  const trimmed  = messages.length <= MAX_HIST ? messages : messages.slice(messages.length - MAX_HIST);
  const out = [];

  if (systemInstruction) out.push(new SystemMessage(systemInstruction));

  for (const m of trimmed) {
    const role    = m.role === 'assistant' ? 'assistant' : 'user';
    const content = String(m?.content || '');
    out.push(role === 'assistant' ? new AIMessage(content) : new HumanMessage(content));
  }

  return out;
}

function isRateLimitError(msg) {
  const s = (msg || '').toLowerCase();
  return s.includes('429') || s.includes('rate limit') || s.includes('quota') || s.includes('too many requests');
}

function classifyError(errMsg) {
  const s = (errMsg || '').toLowerCase();
  if (isRateLimitError(s))                                  return 'Rate limit / quota exhausted';
  if (s.includes('401') || s.includes('unauthorized'))      return 'Invalid or expired API key';
  if (s.includes('503') || s.includes('service unavailable')) return 'Service temporarily unavailable';
  if (s.includes('network') || s.includes('fetch'))         return 'Network connectivity issue';
  if (s.includes('timeout'))                                return 'Request timed out';
  return (errMsg || 'Unknown error').slice(0, 120);
}

// ── Invoke a model with AbortSignal ───────────────────────────────────────

async function invokeModel(model, name, msgs, signal) {
  const outputParser = new StringOutputParser();
  const chain        = model.pipe(outputParser);

  let rejectAbort;
  const abortPromise = new Promise((_, reject) => {
    rejectAbort = reject;
    signal.addEventListener('abort', () =>
      reject(Object.assign(new Error(`${name} aborted`), { aborted: true }))
    );
  });

  const rawText = await Promise.race([chain.invoke(msgs), abortPromise]);

  if (!rawText || !rawText.trim()) {
    throw new Error(`Empty response from ${name}`);
  }

  return { text: scrubMarkdown(rawText), provider: name };
}

// ── Main Export ────────────────────────────────────────────────────────────

export async function generateResponse(messages, systemInstruction, customConfig = null) {
  const config = customConfig || await getBotConfig();

  const geminiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;
  const groqKey   = config.groqApiKey   || process.env.GROQ_API_KEY;

  const temp      = typeof config.temperature === 'number'
    ? config.temperature
    : Number(process.env.AI_TEMPERATURE ?? 0.3);
  const maxTokens = Number(process.env.AI_MAX_TOKENS ?? 2048);
  const timeoutMs = Number(process.env.SMART_SWITCH_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);

  const hasGroq   = Boolean(groqKey   && groqKey   !== 'your_groq_api_key_here'   && groqKey   !== '********');
  const hasGemini = Boolean(geminiKey && geminiKey !== 'your_gemini_api_key_here' && geminiKey !== '********');

  if (!hasGroq && !hasGemini) {
    throw new Error(
      'No AI API keys configured. Please add your Groq or Gemini API key in the dashboard settings.'
    );
  }

  const now          = Date.now();
  const groqCooling  = now < _groqCooldownUntil;
  const geminiCooling= now < _geminiCooldownUntil;

  if (groqCooling)   console.warn(`[SmartSwitch] Groq in cooldown ${Math.ceil((_groqCooldownUntil - now) / 1000)}s remaining`);
  if (geminiCooling) console.warn(`[SmartSwitch] Gemini in cooldown ${Math.ceil((_geminiCooldownUntil - now) / 1000)}s remaining`);

  // Determine which providers are usable right now
  const groqAvail   = hasGroq   && !groqCooling;
  const geminiAvail = hasGemini && !geminiCooling;

  // If both are cooling down, try them anyway as a last resort
  const useGroq   = hasGroq   && (groqAvail   || (!groqAvail   && !geminiAvail));
  const useGemini = hasGemini && (geminiAvail || (!groqAvail   && !geminiAvail));

  const langChainMsgs = toLangChainMessages(messages, systemInstruction);

  const makeGroq = () => new ChatGroq({
    apiKey: groqKey,
    model: process.env.GROQ_MODEL || GROQ_PRODUCTION_MODEL,
    temperature: temp,
    maxTokens,
  });

  const makeGemini = () => new ChatGoogleGenerativeAI({
    apiKey: geminiKey,
    model: process.env.GEN_MODEL || GEMINI_PRODUCTION_MODEL,
    temperature: temp,
    maxOutputTokens: maxTokens,
  });

  // ── Only Gemini available (Groq not configured or cooling) ───────────────
  if (!useGroq && useGemini) {
    console.log('[SmartSwitch] Using Gemini only (Groq unavailable)');
    const ctrl = new AbortController();
    try {
      return await invokeModel(makeGemini(), 'gemini', langChainMsgs, ctrl.signal);
    } catch (err) {
      const reason = classifyError(err.message);
      if (isRateLimitError(err.message)) _geminiCooldownUntil = Date.now() + 30_000;
      throw new Error(`Gemini failed: ${reason}`);
    }
  }

  // ── Only Groq available (Gemini not configured or cooling) ───────────────
  if (useGroq && !useGemini) {
    console.log('[SmartSwitch] Using Groq only (Gemini unavailable)');
    const ctrl = new AbortController();
    try {
      return await invokeModel(makeGroq(), 'groq', langChainMsgs, ctrl.signal);
    } catch (err) {
      const reason = classifyError(err.message);
      if (isRateLimitError(err.message)) _groqCooldownUntil = Date.now() + 30_000;
      throw new Error(`Groq failed: ${reason}`);
    }
  }

  // ── Both available: Groq-first with timeout escalation ───────────────────
  console.log(`[SmartSwitch] 🚀 Primary: Groq (timeout: ${timeoutMs}ms before escalating to Gemini)`);

  const groqCtrl   = new AbortController();
  const geminiCtrl = new AbortController();

  let groqError = null;

  // Kick off Groq immediately
  const groqPromise = invokeModel(makeGroq(), 'groq', langChainMsgs, groqCtrl.signal)
    .then((result) => ({ result, source: 'groq' }))
    .catch((err) => {
      if (!err.aborted) {
        groqError = classifyError(err.message);
        console.warn(`[SmartSwitch] ❌ Groq failed: ${groqError}`);
        if (isRateLimitError(err.message)) _groqCooldownUntil = Date.now() + 30_000;
      }
      return { result: null, source: 'groq' };
    });

  // Timeout gate — after timeoutMs, allow Gemini to race
  const timeoutGate = new Promise((resolve) => setTimeout(resolve, timeoutMs));

  // Race Groq against the timeout
  const firstOutcome = await Promise.race([groqPromise, timeoutGate]);

  if (firstOutcome?.source === 'groq' && firstOutcome.result) {
    // Groq responded before timeout — winner, abort nothing needed
    console.log('[SmartSwitch] ✅ Groq responded within timeout window');
    return firstOutcome.result;
  }

  if (firstOutcome?.source === 'groq' && !firstOutcome.result) {
    // Groq errored before timeout — go straight to Gemini, no race needed
    console.log('[SmartSwitch] Groq errored early, switching to Gemini immediately');
    try {
      const result = await invokeModel(makeGemini(), 'gemini', langChainMsgs, geminiCtrl.signal);
      return result;
    } catch (err) {
      const geminiReason = classifyError(err.message);
      if (isRateLimitError(err.message)) _geminiCooldownUntil = Date.now() + 30_000;
      throw new Error(
        `Both providers failed — GROQ: ${groqError || 'unknown error'} | GEMINI: ${geminiReason}. Please check your API keys or try again shortly.`
      );
    }
  }

  // Timeout reached — Groq is still pending, fire Gemini now (both racing)
  console.log(`[SmartSwitch] ⏱ Groq exceeded ${timeoutMs}ms timeout — escalating to Gemini (both racing)`);

  const geminiPromise = invokeModel(makeGemini(), 'gemini', langChainMsgs, geminiCtrl.signal)
    .then((result) => ({ result, source: 'gemini' }))
    .catch((err) => {
      if (!err.aborted) {
        const reason = classifyError(err.message);
        console.warn(`[SmartSwitch] ❌ Gemini also failed: ${reason}`);
        if (isRateLimitError(err.message)) _geminiCooldownUntil = Date.now() + 30_000;
      }
      return { result: null, source: 'gemini' };
    });

  // Now race: whoever of Groq/Gemini finishes first wins
  const winner = await new Promise((resolve, reject) => {
    let settled = 0;
    let geminiReason = null;

    const handle = (outcome) => {
      settled++;
      if (outcome.result) {
        // This one won — abort the other
        if (outcome.source === 'gemini') groqCtrl.abort();
        if (outcome.source === 'groq')   geminiCtrl.abort();
        console.log(`[SmartSwitch] ✅ Winner (escalated race): ${outcome.source}`);
        resolve(outcome.result);
      } else if (settled === 2) {
        // Both failed
        reject(new Error(
          `Both AI providers are currently unavailable — GROQ: ${groqError || 'timed out / failed'} | GEMINI: ${geminiReason || 'failed'}. Please check your API keys or try again shortly.`
        ));
      }
    };

    groqPromise.then(handle);
    geminiPromise.then((o) => {
      if (!o.result) geminiReason = classifyError('Gemini failed');
      handle(o);
    });
  });

  return winner;
}

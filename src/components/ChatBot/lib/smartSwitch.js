/**
 * Smart Switch Mode — Race Mode Engine v3
 *
 * Priority: Fastest response wins. Calls Groq and Gemini simultaneously.
 * The first one to return a successful response aborts the other.
 * 
 * v3 Fixes:
 *  - Reverted to Race Mode (Promise.any) for zero latency on failover.
 *  - Added manual Regex Scrubber to forcefully strip markdown (** etc.) since
 *    Gemini ignores the prompt constraints.
 */

// ── Tuning constants ──────────────────────────────────────────────────────────
const TEMP         = Number(process.env.AI_TEMPERATURE      ?? 0.3);   
const MAX_TOKENS   = Number(process.env.AI_MAX_TOKENS        ?? 2048); 
const MAX_HISTORY  = Number(process.env.AI_MAX_HISTORY_MSGS  ?? 8);    

// ── History trimmer ───────────────────────────────────────────────────────────
function trimHistory(messages) {
  if (messages.length <= MAX_HISTORY) return messages;
  return messages.slice(messages.length - MAX_HISTORY);
}

// ── Markdown Scrubber ─────────────────────────────────────────────────────────
// Forcibly removes asterisks, hashes, and other markdown Gemini insists on using
function scrubMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*/g, '') // Remove bold
    .replace(/\*/g, '')   // Remove italics/bullets
    .replace(/#/g, '')    // Remove headings
    .replace(/_/g, '')    // Remove italics
    .trim();
}

// ── Error classifier ──────────────────────────────────────────────────────────
function classifyError(status, body) {
  const text = typeof body === 'string' ? body.toLowerCase() : JSON.stringify(body).toLowerCase();
  if (status === 429 || text.includes('rate_limit') || text.includes('rate limit') || status === 425) return 'rate_limit';
  if (status === 400 && (text.includes('context_length') || text.includes('reduce the length'))) return 'context_too_long';
  if (status === 503 || status === 502 || text.includes('overloaded') || text.includes('unavailable')) return 'overloaded';
  if (status === 401 || text.includes('invalid_api_key') || text.includes('unauthorized')) return 'auth';
  return 'unknown';
}

// ── Robust Fetch with Retry ───────────────────────────────────────────────────
// Automatically retries on 'fetch failed' (network drop) or 429/503 errors.
async function fetchWithRetry(url, options, providerName, maxRetries = 2) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;

      const rawText = await res.text();
      const errType = classifyError(res.status, rawText);

      // Only retry on transient errors
      if (['rate_limit', 'overloaded'].includes(errType) && attempt < maxRetries) {
        console.warn(`[SmartSwitch] ⚠️ ${providerName} ${errType} (Attempt ${attempt}) - retrying...`);
        await new Promise(r => setTimeout(r, 1200 * attempt));
        continue;
      }

      console.error(`[SmartSwitch] ❌ ${providerName} Failed: HTTP ${res.status} ${errType}`);
      throw Object.assign(new Error(`${providerName} Error: ${errType}`), { errorType: errType });

    } catch (err) {
      if (err.name === 'AbortError' || err.message === 'Aborted') throw err; // Don't retry aborts

      if (attempt < maxRetries) {
        console.warn(`[SmartSwitch] ⚠️ ${providerName} Network Drop: ${err.message} (Attempt ${attempt}) - retrying...`);
        await new Promise(r => setTimeout(r, 1000 * attempt));
        continue;
      }
      console.error(`[SmartSwitch] ❌ ${providerName} Network Error: ${err.message}`);
      throw err;
    }
  }
}

// ── Format helpers ─────────────────────────────────────────────────────────────
function toOpenAIMessages(messages, systemInstruction) {
  return [
    { role: 'system', content: systemInstruction },
    ...trimHistory(messages).map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content || ''),
    })),
  ];
}

function toGeminiContents(messages) {
  return trimHistory(messages).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(m.content || '') }],
  }));
}

// ── Provider: Groq ─────────────────────────────────────────────────────────────
async function callGroq(messages, systemInstruction, signal) {
  const key   = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL    ?? 'llama-3.3-70b-versatile';
  const base  = process.env.GROQ_BASE_URL ?? 'https://api.groq.com/openai/v1';

  if (!key || key === 'your_groq_api_key_here') throw new Error('GROQ_API_KEY missing');

  const start = Date.now();
  const url = `${base}/chat/completions`;
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: toOpenAIMessages(messages, systemInstruction),
      temperature: TEMP,
      max_tokens: MAX_TOKENS,
    }),
    signal,
  };

  const res = await fetchWithRetry(url, options, 'Groq');
  const data = await res.json();
  if (signal?.aborted) throw new Error('Aborted');

  const text = scrubMarkdown(data?.choices?.[0]?.message?.content ?? '');
  console.log(`[SmartSwitch] ✅ GROQ won the race! (${Date.now() - start}ms)`);
  return { text, provider: 'groq' };
}

// ── Provider: Gemini ──────────────────────────────────────────────────────────
async function callGemini(messages, systemInstruction, signal) {
  const key   = process.env.GEMINI_API_KEY;
  const model = process.env.GEN_MODEL ?? 'gemini-2.5-flash';

  if (!key || key === 'your_gemini_api_key_here') throw new Error('GEMINI_API_KEY missing');

  const start = Date.now();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: toGeminiContents(messages),
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: { temperature: TEMP, maxOutputTokens: MAX_TOKENS },
    }),
    signal,
  };

  const res = await fetchWithRetry(url, options, 'Gemini');
  const data = await res.json();
  if (signal?.aborted) throw new Error('Aborted');

  const text = scrubMarkdown(data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '');
  console.log(`[SmartSwitch] ✅ GEMINI won the race! (${Date.now() - start}ms)`);
  return { text, provider: 'gemini' };
}

// ── Main: Fallback Mode Engine ─────────────────────────────────────────────────
/**
 * Executes the primary provider. If it fails, falls back to the secondary provider.
 */
export async function generateResponse(messages, systemInstruction) {
  const hasGroq   = process.env.GROQ_API_KEY   && process.env.GROQ_API_KEY   !== 'your_groq_api_key_here';
  const hasGemini = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';

  if (!hasGroq && !hasGemini) {
    throw new Error('No AI API keys configured. Please set GROQ_API_KEY or GEMINI_API_KEY in .env.local');
  }

  const primary = process.env.AI_PRIMARY_PROVIDER?.toLowerCase() === 'gemini' ? 'gemini' : 'groq';

  // ── Fallback Mode ──
  const ac1 = new AbortController();
  const ac2 = new AbortController();
  
  if (primary === 'groq' && hasGroq) {
    try {
      return await callGroq(messages, systemInstruction, ac1.signal);
    } catch (err) {
      console.warn(`[SmartSwitch] ⚠️ Primary (Groq) failed, falling back to Gemini...`);
      if (hasGemini) {
        return await callGemini(messages, systemInstruction, ac2.signal);
      }
      throw err;
    }
  } else if (hasGemini) {
    try {
      return await callGemini(messages, systemInstruction, ac1.signal);
    } catch (err) {
      console.warn(`[SmartSwitch] ⚠️ Primary (Gemini) failed, falling back to Groq...`);
      if (hasGroq) {
        return await callGroq(messages, systemInstruction, ac2.signal);
      }
      throw err;
    }
  }

  throw new Error('Both AI providers are currently busy or out of limits. Please try again in a moment.');
}

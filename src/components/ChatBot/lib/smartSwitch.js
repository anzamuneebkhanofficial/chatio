/**
 * Smart Switch Engine — LangChain.js Edition
 *
 * Uses LangChain's ChatGroq (@langchain/groq) and ChatGoogle (@langchain/google)
 * with native LCEL .withFallbacks() for resilient LLM response generation.
 */

import { ChatGroq } from '@langchain/groq';
import { ChatGoogle } from '@langchain/google';
import { SystemMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';

// ── Tuning constants ──────────────────────────────────────────────────────────
const TEMP       = Number(process.env.AI_TEMPERATURE     ?? 0.3);   
const MAX_TOKENS = Number(process.env.AI_MAX_TOKENS       ?? 2048); 
const MAX_HIST   = Number(process.env.AI_MAX_HISTORY_MSGS ?? 8);    

/**
 * Strips markdown symbols (bold **, italics *, hashes #) if present.
 */
function scrubMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/#/g, '')
    .replace(/_/g, '')
    .trim();
}

/**
 * Converts standard message objects to LangChain BaseMessage instances.
 */
function toLangChainMessages(messages, systemInstruction) {
  const trimmed = messages.length <= MAX_HIST ? messages : messages.slice(messages.length - MAX_HIST);
  const langChainMsgs = [];

  if (systemInstruction) {
    langChainMsgs.push(new SystemMessage(systemInstruction));
  }

  for (const m of trimmed) {
    const role = m.role === 'assistant' ? 'assistant' : 'user';
    const content = String(m.content || '');

    if (role === 'assistant') {
      langChainMsgs.push(new AIMessage(content));
    } else {
      langChainMsgs.push(new HumanMessage(content));
    }
  }

  return langChainMsgs;
}

/**
 * Initializes LangChain chat models with native LCEL .withFallbacks()
 */
export function getModelWithFallback() {
  const hasGroq   = Boolean(process.env.GROQ_API_KEY   && process.env.GROQ_API_KEY   !== 'your_groq_api_key_here');
  const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here');

  if (!hasGroq && !hasGemini) {
    throw new Error('No AI API keys configured. Please set GROQ_API_KEY or GEMINI_API_KEY in .env.local');
  }

  let groqModel = null;
  if (hasGroq) {
    groqModel = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      temperature: TEMP,
      maxTokens: MAX_TOKENS,
    });
  }

  let geminiModel = null;
  if (hasGemini) {
    geminiModel = new ChatGoogle({
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEN_MODEL || 'gemini-2.5-flash',
      temperature: TEMP,
      maxOutputTokens: MAX_TOKENS,
    });
  }

  const primaryChoice = (process.env.AI_PRIMARY_PROVIDER || 'groq').toLowerCase();

  let primary = null;
  let fallback = null;

  if (primaryChoice === 'gemini') {
    primary = geminiModel || groqModel;
    fallback = geminiModel && groqModel ? groqModel : null;
  } else {
    primary = groqModel || geminiModel;
    fallback = groqModel && geminiModel ? geminiModel : null;
  }

  if (fallback) {
    return {
      model: primary.withFallbacks([fallback]),
      primaryName: primaryChoice === 'gemini' ? 'gemini' : 'groq',
      fallbackName: primaryChoice === 'gemini' ? 'groq' : 'gemini',
    };
  }

  return {
    model: primary,
    primaryName: hasGroq ? 'groq' : 'gemini',
    fallbackName: null,
  };
}

/**
 * Generates an AI response using LangChain Chat models and StringOutputParser.
 */
export async function generateResponse(messages, systemInstruction) {
  const { model, primaryName, fallbackName } = getModelWithFallback();
  const langChainMsgs = toLangChainMessages(messages, systemInstruction);

  const outputParser = new StringOutputParser();
  const chain = model.pipe(outputParser);

  let providerUsed = primaryName;
  let rawText = '';

  try {
    rawText = await chain.invoke(langChainMsgs);
  } catch (err) {
    if (fallbackName) {
      console.warn(`[SmartSwitch LangChain] Primary model failed (${err.message}). Falling back to ${fallbackName}...`);
      providerUsed = fallbackName;
    }
    throw err;
  }

  const text = scrubMarkdown(rawText);
  return { text, provider: providerUsed };
}


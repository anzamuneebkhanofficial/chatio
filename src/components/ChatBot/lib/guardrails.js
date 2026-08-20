/**
 * Guardrails Module — Smart Scope & Safety Verification
 *
 * Supports both permanent Chatio platform scope and dynamic interactive demo personas.
 */

import { DEMO_PRESETS } from './demoPresets.js';

const CHATIO_KEYWORDS = [
  'chatio', 'anza', 'muneeb', 'langchain', 'rag', 'pdf', 'smart', 'switch', 'ai', 'chatbot', 'widget', 'embed', 'wordpress', 'shopify',
  'webflow', 'react', 'next', 'nextjs', 'reactjs', 'gemini', 'groq', 'key', 'api',
  'crawler', 'crawl', 'train', 'training', 'knowledge', 'dashboard', 'setup',
  'free', 'open', 'source', 'script', 'tag', 'shadow', 'dom', 'appid', 'mongo',
  'mongodb', 'pricing', 'cost', 'how', 'help', 'hi', 'hello', 'hey', 'greetings',
  'what', 'can', 'you', 'do', 'demo'
];

const CHATIO_OFF_TOPIC = [
  /\b(recipe|recipes|cook|baking|cake|pizza|burger|pasta|dish|food)\b/i,
  /\b(weather|forecast|temperature|rain|climate)\b/i,
  /\b(sports|football|cricket|basketball|soccer|nba|messi|ronaldo|ipl)\b/i,
  /\b(crypto|bitcoin|ethereum|stock market|shares|trading|forex)\b/i,
  /\b(movie|movies|cinema|actor|actress|hollywood|bollywood|netflix)\b/i,
  /\b(medical advice|doctor|medicine|disease|symptoms)\b/i,
  /\b(legal advice|lawyer|lawsuit|court)\b/i,
];

export function checkGuardrails(text, demoId = null, appId = null) {
  if (!text || typeof text !== 'string') {
    return { isOffTopic: false };
  }

  const cleanText = text.toLowerCase().trim();

  if (cleanText.length <= 3 || cleanText === 'hi' || cleanText === 'hello' || cleanText === 'hey') {
    return { isOffTopic: false };
  }

  // If this is a custom user bot (appId) or interactive demo mode, scope is handled by their custom persona & knowledge
  if (appId || (demoId && DEMO_PRESETS[demoId])) {
    return { isOffTopic: false };
  }

  // Chatio Platform Guardrails check
  const matchesOffTopic = CHATIO_OFF_TOPIC.some((pattern) => pattern.test(cleanText));
  const matchesDomain = CHATIO_KEYWORDS.some((kw) => cleanText.includes(kw));

  if (matchesOffTopic && !matchesDomain) {
    return {
      isOffTopic: true,
      warningResponse: buildWarningMessage(),
    };
  }

  return { isOffTopic: false };
}

function buildWarningMessage() {
  return [
    `⚠️ **Scope Notice**`,
    ``,
    `I am the **Chatio by Anza Official Assistant**, built by Muhammad Anza Muneeb Khan. I am specialized to assist with questions about configuring, customizing, and embedding your free AI chatbot!`,
    ``,
    `**Topics I can help you with:**`,
    `1. 🚀 **Embedding** — WordPress, Shopify, Webflow, React, Next.js, and raw HTML`,
    `2. 🧠 **RAG Engine** — LangChain, Gemini × Groq dynamic model racing`,
    `3. ⚙️ **Dashboard Setup** — Setting API keys, system prompts, & appearance`,
    `4. 📚 **Knowledge Base Training** — MD, PDF, TXT, JSON files & Deep URL crawler`,
    `5. ⚡ **Platform Features** — 100% Free Custom AI Chatbot Platform by Muhammad Anza Muneeb Khan`,
    ``,
    `💡 *Tip: Try our Interactive Knowledge Switcher on the landing page to test industry demos like Restaurants, E-Commerce, and Medical Clinics!*`,
  ].join('\n');
}

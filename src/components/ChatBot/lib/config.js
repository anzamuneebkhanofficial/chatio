/**
 * Chatbot Configuration & System Instruction Builder
 *
 * Dynamically builds system instructions combining owner system prompt
 * with retrieved RAG knowledge context.
 */

import { getBotConfig, DEFAULT_CONFIG } from './dbConfig.js';

export async function getPublicBotConfig() {
  const config = await getBotConfig();
  return {
    botName: config.botName || DEFAULT_CONFIG.botName,
    welcomeMessage: config.welcomeMessage || DEFAULT_CONFIG.welcomeMessage,
    primaryColor: config.primaryColor || DEFAULT_CONFIG.primaryColor,
    widgetTitle: config.widgetTitle || DEFAULT_CONFIG.widgetTitle,
    widgetDescription: config.widgetDescription || DEFAULT_CONFIG.widgetDescription,
    footerText: config.footerText || DEFAULT_CONFIG.footerText,
    avatarUrl: config.avatarUrl || '',
    position: config.position || 'bottom-right',
  };
}

/**
 * Build the complete system instruction for AI request.
 *
 * @param {string} knowledgeContext - Relevant text retrieved from knowledge base
 * @param {object} [customConfig] - Optional config override
 * @returns {string} Full system instruction string
 */
export function buildSystemInstruction(knowledgeContext, customConfig = null) {
  const botName = customConfig?.botName || DEFAULT_CONFIG.botName;
  const baseSystemPrompt = customConfig?.systemPrompt || DEFAULT_CONFIG.systemPrompt;
  const hasKnowledge = knowledgeContext && knowledgeContext.trim().length > 10;

  return `System Persona & Directives:
${baseSystemPrompt}

Your name is "${botName}".

${hasKnowledge
    ? `KNOWLEDGE BASE — You answer visitor questions strictly based on this data:
--- START OF KNOWLEDGE BASE ---
${knowledgeContext}
--- END OF KNOWLEDGE BASE ---`
    : `No knowledge base has been loaded yet. Inform the user politely that specific knowledge data is currently unavailable.`
  }

═══════════════════════════════════════════
STRICT OPERATIONAL RULES:
═══════════════════════════════════════════

RULE 1 — SHORT & VAGUE QUERIES:
Understand single keywords or phrases (e.g. "pricing", "contact", "services", "hours") and pull relevant details from knowledge base.

RULE 2 — ACCURATE FACT REPHRASING (NO HALLUCINATIONS):
Never invent credentials, false facts, or prices not in the knowledge base.

RULE 3 — DOMAIN & IDENTITY:
Speak professionally, warmly, and confidently. Speak as the official representative assistant for this organization.

RULE 4 — RESPONSE FORMATTING:
- Write in clean, beautiful, structured Markdown.
- When presenting fees, pricing, schedules, services, or multi-column data, ALWAYS use standard Markdown Tables (| Header 1 | Header 2 |\n|---|---|).
- For sequential steps, use clear numbered lists (1. Step One).
- For bulleted points, use clean bullet points (- Item).
- Ensure headers and bold text are cleanly separated without raw, unparsed markdown symbols.

RULE 5 — SOURCE CITATION:
If your answer relies on a specific page URL from the knowledge base (e.g. "URL: https://..."), cite it at the very end of your response on its own line:
Source: https://exact-url-from-knowledge-base.com/page`.trim();
}

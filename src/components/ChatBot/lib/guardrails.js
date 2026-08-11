/**
 * Guardrails Module — Portfolio Scope & Safety Verification
 *
 * Enforces domain boundaries for Muhammad Anza Muneeb Khan AI Assistant.
 * Validates whether user queries align with portfolio, services, skills, software engineering,
 * AI RAG solutions, video courses, projects, or booking consultations.
 */

// Domain keywords and topic triggers related to Anza's portfolio & services
const DOMAIN_KEYWORDS = [
  'anza', 'muneeb', 'khan', 'portfolio', 'skill', 'skills', 'project', 'projects',
  'service', 'services', 'ai', 'rag', 'llm', 'solution', 'solutions', 'next', 'nextjs',
  'react', 'reactjs', 'node', 'nodejs', 'python', 'mongodb', 'groq', 'gemini',
  'consultation', 'book', 'booking', 'contact', 'email', 'hire', 'rates', 'pricing',
  'course', 'courses', 'tutorial', 'tutorials', 'video', 'experience', 'background',
  'software', 'developer', 'engineer', 'engineering', 'fullstack', 'frontend', 'backend',
  'web', 'app', 'application', 'chatbot', 'widget', 'code', 'coding', 'github',
  'about', 'who', 'help', 'hi', 'hello', 'hey', 'greetings', 'what can you do',
  'featured', 'tech stack', 'demo', 'c', 'c++', 'java', 'javascript', 'typescript',
  'data analytics', 'data science'
];

// Off-topic indicators (topics clearly outside portfolio scope)
const OFF_TOPIC_PATTERNS = [
  /\b(recipe|recipes|cook|baking|cake|pizza|burger|pasta|dish|food)\b/i,
  /\b(weather|forecast|temperature|rain|climate)\b/i,
  /\b(sports|football|cricket|basketball|soccer|nba|messi|ronaldo|ipl)\b/i,
  /\b(crypto|bitcoin|ethereum|stock market|shares|trading|forex)\b/i,
  /\b(movie|movies|cinema|actor|actress|hollywood|bollywood|netflix)\b/i,
  /\b(capital of|president of|prime minister|geography|history of war)\b/i,
  /\b(medical advice|doctor|medicine|disease|symptoms)\b/i,
  /\b(legal advice|lawyer|lawsuit|court)\b/i,
  /\b(solve my homework|math equation|calculate integral|derivative of)\b/i,
];

/**
 * Validates a user message against high-level guardrails.
 *
 * @param {string} text - User message content
 * @returns {{ isOffTopic: boolean, warningResponse?: string }}
 */
export function checkGuardrails(text) {
  if (!text || typeof text !== 'string') {
    return { isOffTopic: false };
  }

  const cleanText = text.toLowerCase().trim();

  // Very short generic conversational greetings or single-word queries pass through to RAG
  if (cleanText.length <= 3 || cleanText === 'hi' || cleanText === 'hello' || cleanText === 'hey') {
    return { isOffTopic: false };
  }

  // Check explicit off-topic patterns
  const matchesOffTopicPattern = OFF_TOPIC_PATTERNS.some((pattern) => pattern.test(cleanText));

  // Check domain keyword presence
  const matchesDomain = DOMAIN_KEYWORDS.some((kw) => cleanText.includes(kw));

  // If it explicitly matches an off-topic pattern and has no domain keywords, trigger guardrail
  if (matchesOffTopicPattern && !matchesDomain) {
    return {
      isOffTopic: true,
      warningResponse: buildWarningMessage(),
    };
  }

  return { isOffTopic: false };
}

/**
 * Formats a clean, structured Markdown warning response for off-topic queries.
 */
function buildWarningMessage() {
  return [
    `⚠️ **Scope Notice**`,
    ``,
    `I am **Muhammad Anza Muneeb Khan's AI Assistant**. I am specialized to assist only with topics related to Anza's portfolio, software engineering projects, AI/RAG solutions, skills, and consultation bookings.`,
    ``,
    `**Topics I can help you with:**`,
    `1. 🚀 **Featured Projects** — Software engineering & AI applications`,
    `2. 💻 **AI & Web Services** — RAG systems, Full-Stack Next.js/React development`,
    `3. 🧠 **Tech Stack & Skills** — Python, Next.js, Node.js, LangChain, MongoDB`,
    `4. 📅 **Consultation & Rates** — Booking a 1-on-1 discussion or hiring Anza`,
    `5. 📚 **Courses & Tutorials** — Web development, C programming, Data Analytics`,
    ``,
    `Please ask a question related to Anza's work or services!`,
  ].join('\n');
}

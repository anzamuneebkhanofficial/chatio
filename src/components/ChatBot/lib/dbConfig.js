import dbConnect from '@/lib/dbConnect';
import { AdminConfig } from '@/models';
import { encryptText, decryptText } from '@/lib/crypto';

let _configCache = null;
let _cacheTime = 0;
const CACHE_TTL = 10000; // 10s cache

export const DEFAULT_CONFIG = {
  isSetupComplete: false,
  botName: 'Chatio AI Assistant',
  primaryColor: '#6366f1',
  welcomeMessage: 'Hello! I am Chatio AI assistant.\n\nHow can I assist you today?',
  widgetTitle: 'Chatio by Anza',
  widgetDescription: 'Online · Powered by RAG',
  footerText: 'POWERED BY CHATIO BY ANZA',
  avatarUrl: '',
  avatarBg: 'transparent',
  position: 'bottom-right',
  suggestions: [
    { label: 'WordPress & Shopify Embed', prompt: 'How do I embed my chatbot on WordPress or Shopify?' },
    { label: 'Gemini × Groq Racing', prompt: 'Explain how your Gemini and Groq dual engine speed racing works.' },
    { label: 'Step-by-Step Setup Guide', prompt: 'Give me the step-by-step guide to set up my custom chatbot.' },
    { label: '100% Free Custom Chatbot?', prompt: 'Is Chatio by Anza 100% free and open-source?' },
  ],
  systemPrompt: `You are Chatio AI assistant, built by Muhammad Anza Muneeb Khan. You answer visitor questions based on the provided knowledge base. Speak warmly, clearly, and professionally.`,
  temperature: 0.3,
  provider: 'groq',
  geminiApiKey: '',
  groqApiKey: '',
};

/**
 * Retrieves the singleton BotConfig from MongoDB via Mongoose, falling back to process.env / default config.
 */
export async function getBotConfig() {
  const now = Date.now();
  if (_configCache && (now - _cacheTime) < CACHE_TTL) {
    return _configCache;
  }

  try {
    await dbConnect();
    let doc = await AdminConfig.findById('singleton').lean();

    if (!doc) {
      const created = await AdminConfig.create({ _id: 'singleton' });
      doc = created.toObject();
    }

    if (doc) {
      const decryptedConfig = {
        ...DEFAULT_CONFIG,
        ...doc,
        suggestions: Array.isArray(doc.suggestions) && doc.suggestions.length > 0 ? doc.suggestions : DEFAULT_CONFIG.suggestions,
        geminiApiKey: doc.geminiApiKey ? decryptText(doc.geminiApiKey) : (process.env.GEMINI_API_KEY || ''),
        groqApiKey: doc.groqApiKey ? decryptText(doc.groqApiKey) : (process.env.GROQ_API_KEY || ''),
      };
      _configCache = decryptedConfig;
      _cacheTime = now;
      return decryptedConfig;
    }
  } catch (err) {
    console.warn('[dbConfig] Mongoose warning reading AdminConfig, using defaults:', err.message);
  }

  // Fallback to process.env keys if DB config is not found yet
  const fallback = {
    ...DEFAULT_CONFIG,
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    groqApiKey: process.env.GROQ_API_KEY || '',
  };
  _configCache = fallback;
  _cacheTime = now;
  return fallback;
}

/**
 * Updates the singleton BotConfig in MongoDB via Mongoose with encrypted API keys.
 */
export async function updateBotConfig(updates) {
  const payload = { ...updates };

  // Encrypt sensitive API keys
  if (payload.geminiApiKey && payload.geminiApiKey !== '********') {
    payload.geminiApiKey = encryptText(payload.geminiApiKey);
  } else {
    delete payload.geminiApiKey;
  }

  if (payload.groqApiKey && payload.groqApiKey !== '********') {
    payload.groqApiKey = encryptText(payload.groqApiKey);
  } else {
    delete payload.groqApiKey;
  }

  try {
    await dbConnect();
    await AdminConfig.findByIdAndUpdate(
      'singleton',
      { $set: payload },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (err) {
    console.error('[dbConfig] Error updating Mongoose AdminConfig:', err.message);
  }

  clearConfigCache();
  return getBotConfig();
}

/** Invalidate cache */
export function clearConfigCache() {
  _configCache = null;
  _cacheTime = 0;
}

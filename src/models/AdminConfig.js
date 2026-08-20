import mongoose from 'mongoose';

const AdminConfigSchema = new mongoose.Schema(
  {
    _id: { type: String, default: 'singleton' },
    botName: { type: String, default: 'Chatio AI Assistant' },
    widgetTitle: { type: String, default: 'Chatio by Anza' },
    widgetDescription: { type: String, default: 'Online · Powered by RAG' },
    welcomeMessage: {
      type: String,
      default: 'Hello! I am Chatio AI assistant.\n\nHow can I assist you today?',
    },
    footerText: { type: String, default: 'POWERED BY CHATIO BY ANZA' },
    avatarUrl: { type: String, default: '' },
    avatarBg: { type: String, default: 'transparent' },
    primaryColor: { type: String, default: '#6366f1' },
    position: { type: String, default: 'bottom-right' },
    suggestions: {
      type: [
        {
          label: { type: String, default: '' },
          prompt: { type: String, default: '' },
        },
      ],
      default: [
        { label: 'WordPress & Shopify Embed', prompt: 'How do I embed my chatbot on WordPress or Shopify?' },
        { label: 'Gemini × Groq Racing', prompt: 'Explain how your Gemini and Groq dual engine speed racing works.' },
        { label: 'Step-by-Step Setup Guide', prompt: 'Give me the step-by-step guide to set up my custom chatbot.' },
        { label: '100% Free Custom Chatbot?', prompt: 'Is Chatio by Anza 100% free and open-source?' },
      ],
    },
    systemPrompt: {
      type: String,
      default:
        'You are Chatio AI assistant, built by Muhammad Anza Muneeb Khan. You answer visitor questions based on the provided knowledge base. Speak warmly, clearly, and professionally.',
    },
    temperature: { type: Number, default: 0.3 },
    provider: { type: String, default: 'groq' },
    geminiApiKey: { type: String, default: '' },
    groqApiKey: { type: String, default: '' },
    widgetWidth: { type: String, default: '480px' },
    widgetHeight: { type: String, default: '680px' },
    blockOffTopic: { type: Boolean, default: true },
    enableSrfProtection: { type: Boolean, default: true },
    enableRateLimit: { type: Boolean, default: true },
    stripMarkdown: { type: Boolean, default: false },
    maxMessagesPerMin: { type: Number, default: 30 },
    maxHistory: { type: Number, default: 20 },
  },
  {
    collection: 'admin_config',
    timestamps: true,
  }
);

export const AdminConfig =
  mongoose.models.AdminConfig || mongoose.model('AdminConfig', AdminConfigSchema);
export default AdminConfig;

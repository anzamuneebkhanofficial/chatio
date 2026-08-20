import mongoose from 'mongoose';

const UserConfigSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    appId: { type: String, required: true, unique: true, index: true },
    botName: { type: String, default: 'My AI Assistant' },
    widgetTitle: { type: String, default: 'Customer Support' },
    widgetDescription: { type: String, default: 'Online · Powered by AI' },
    welcomeMessage: {
      type: String,
      default: 'Hi there! How can I help you today?',
    },
    footerText: { type: String, default: 'Powered by Chatio' },
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
        { label: 'Pricing & Plans', prompt: 'What are your pricing plans and features?' },
        { label: 'How to Get Started', prompt: 'How do I get started with your product?' },
        { label: 'Contact Support', prompt: 'How do I contact customer support?' },
        { label: 'Features & Capabilities', prompt: 'Tell me about what you can do.' },
      ],
    },
    systemPrompt: {
      type: String,
      default:
        'You are a helpful AI customer support assistant. Answer accurately based on the provided knowledge base.',
    },
    temperature: { type: Number, default: 0.3 },
    provider: { type: String, default: 'gemini' },
    geminiApiKey: { type: String, default: '' },
    groqApiKey: { type: String, default: '' },
    widgetWidth: { type: String, default: '480px' },
    widgetHeight: { type: String, default: '680px' },
    storageType: { type: String, enum: ['managed', 'custom'], default: 'managed' },
    customMongoUri: { type: String, default: '' },
    isSetupComplete: { type: Boolean, default: false },
  },
  {
    collection: 'user_configs',
    timestamps: true,
  }
);

export const UserConfig =
  mongoose.models.UserConfig || mongoose.model('UserConfig', UserConfigSchema);
export default UserConfig;

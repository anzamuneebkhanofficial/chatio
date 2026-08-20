import { NextResponse } from 'next/server';
import { getBotConfigByAppId } from '@/lib/multiUserDb';
import { getBotConfig } from '@/components/ChatBot/lib/dbConfig';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key, X-Requested-With',
  'Access-Control-Allow-Private-Network': 'true',
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const appId = searchParams.get('appId');

    let config = null;
    if (appId) {
      config = await getBotConfigByAppId(appId);
    } else {
      config = await getBotConfig();
    }

    return NextResponse.json({
      botName: config.botName || 'Chatio AI Assistant',
      primaryColor: config.primaryColor || '#6366f1',
      welcomeMessage: config.welcomeMessage || 'Hello! I am Chatio AI assistant.\n\nHow can I assist you today?',
      widgetTitle: config.widgetTitle || 'Chatio by Anza',
      widgetDescription: config.widgetDescription || 'Online · Powered by RAG',
      footerText: config.footerText || 'POWERED BY CHATIO BY ANZA',
      avatarUrl: config.avatarUrl || '',
      avatarBg: config.avatarBg || 'transparent',
      position: config.position || 'bottom-right',
      suggestions: Array.isArray(config.suggestions) && config.suggestions.length > 0 ? config.suggestions : [
        { label: 'WordPress & Shopify Embed', prompt: 'How do I embed my chatbot on WordPress or Shopify?' },
        { label: 'Gemini × Groq Racing', prompt: 'Explain how your Gemini and Groq dual engine speed racing works.' },
        { label: 'Step-by-Step Setup Guide', prompt: 'Give me the step-by-step guide to set up my custom chatbot.' },
        { label: '100% Free Custom Chatbot?', prompt: 'Is Chatio by Anza 100% free and open-source?' },
      ],
      widgetWidth: config.widgetWidth || '480px',
      widgetHeight: config.widgetHeight || '680px',
      appId: config.appId || appId || 'default',
    }, { headers: CORS_HEADERS });
  } catch (err) {
    return NextResponse.json({
      botName: 'Chatio AI Assistant',
      primaryColor: '#6366f1',
      welcomeMessage: 'Hello! I am Chatio AI assistant.\n\nHow can I assist you today?',
      widgetTitle: 'Chatio by Anza',
      widgetDescription: 'Online · Powered by RAG',
      footerText: 'POWERED BY CHATIO BY ANZA',
      avatarUrl: '',
      position: 'bottom-right',
      suggestions: [
        { label: 'WordPress & Shopify Embed', prompt: 'How do I embed my chatbot on WordPress or Shopify?' },
        { label: 'Gemini × Groq Racing', prompt: 'Explain how your Gemini and Groq dual engine speed racing works.' },
        { label: 'Step-by-Step Setup Guide', prompt: 'Give me the step-by-step guide to set up my custom chatbot.' },
        { label: '100% Free Custom Chatbot?', prompt: 'Is Chatio by Anza 100% free and open-source?' },
      ],
      widgetWidth: '480px',
      widgetHeight: '680px',
      appId: 'default',
    }, { headers: CORS_HEADERS });
  }
}

export default function manifest() {
  return {
    name: 'Chatio by Anza',
    short_name: 'Chatio',
    description: 'Universal Custom RAG AI Chatbot Platform powered by LangChain, Gemini & Groq.',
    start_url: '/',
    display: 'standalone',
    background_color: '#080a16',
    theme_color: '#6366f1',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}

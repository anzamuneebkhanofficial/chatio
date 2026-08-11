# 🤖 Smart Switch AI Chatbot — Customizable RAG Assistant for Next.js

> **A professional, fully responsive AI Chatbot widget with built-in RAG knowledge retrieval, Smart Switch AI engine (Gemini × Groq), domain guardrails, and an Admin Training Dashboard.**

Default Persona: **Muhammad Anza Muneeb Khan AI Assistant**  
Built with **Next.js 16 (App Router)**, **React 19**, and **LangChain**.

---

## 🌟 Overview

**Smart Switch AI Chatbot** is a production-grade, highly customizable AI Chatbot widget designed to be embedded into any Next.js website or portfolio in minutes.

It automatically answers visitor questions using your own custom knowledge base with **Retrieval-Augmented Generation (RAG)**. It comes equipped with high-level guardrails to block off-topic queries, multi-layer error handling, zero-lag input responsiveness, and an easy-to-use **Admin Training Panel** (`/admin`) for instant custom data training.

---

## 🛠️ Key Features

- **⚡ Smart Switch Engine**: Integrates **Google Gemini** and **Groq (Llama 3.3)** with automatic fallbacks so your chatbot never goes offline.
- **🎨 Custom Gold/Yellow Aesthetic**: Sleek dark UI with vibrant gold accents (`#eab308`), custom scrollbars, sparkle avatars (`✨`), feedback controls (👍/👎), and quick suggestion chips.
- **🛡️ Built-in Guardrails**: Intercepts off-topic queries (recipes, sports, weather, crypto) and returns helpful, structured domain scope guidance.
- **📱 Ultra-Responsive & Spacious**: Dynamic desktop window (`490px` width) and inset mobile layout with safe-area inset support.
- **🚀 Zero-Lag Input**: Smooth auto-growing textarea state with unblocked typing performance.
- **🔒 Admin Training Dashboard (`/admin`)**: Crawl websites, upload `.md`, `.txt`, `.json` files, or paste custom text to train your bot live.
- **🛡️ Rate Limiting & Safety**: MongoDB-backed rate limiting (20 requests/minute/IP) to prevent API spamming.

---

## ⚙️ How to Customize for Your Own Name & Website

You can personalize this chatbot for **your own portfolio, business, or website** in 3 simple steps:

### Step 1: Set Your Custom Bot Name & Subtitle
Open `.env.local` (or set environment variables) to configure your name:
```env
NEXT_PUBLIC_BOT_NAME="Your Name AI Assistant"
NEXT_PUBLIC_BOT_SUBTITLE="Online · Powered by Smart Switch AI"
```
Or pass the `botName` prop directly when embedding the component:
```jsx
<ChatWidget botName="Jane Doe AI Assistant" />
```

### Step 2: Open the Admin Route (`/admin`) to Train Your Bot
1. Start your application (`npm run dev`) and visit **`http://localhost:3000/admin`**.
2. Log in using your admin secret key (default: `anza123`).
3. Train your chatbot using any of these methods:
   - **🌐 Website URL Crawl**: Paste your website URL to deep-crawl all pages and extract knowledge automatically.
   - **📄 Upload Knowledge Files**: Drag & drop `.md`, `.txt`, or `.json` files containing your portfolio, services, or documentation.
   - **✍️ Raw Text Paste**: Paste custom Q&As or information directly into the training area and click **Update Knowledge Base**.

Once saved, the AI chatbot will instantly answer visitor queries using **your updated data**!

---

## 🚀 Quick Setup & Reuse Guide

To drop this chatbot widget into any Next.js project:

### 1. Copy Component & API Files
- Copy `src/components/ChatBot/` → your project's `components/ChatBot/`
- Copy `src/app/api/chat/route.js` → your project's `app/api/chat/route.js`
- Copy `src/app/api/train/route.js` → your project's `app/api/train/route.js`

### 2. Configure Environment Variables (`.env.local`)
Create a `.env.local` file in your root directory:
```env
# AI API Keys
GROQ_API_KEY="your_groq_api_key"
GEMINI_API_KEY="your_gemini_api_key"

# Database & Storage
MONGODB_URI="mongodb+srv://your_connection_string"
KNOWLEDGE_MD_PATH="knowledge/website-data.md"
ADMIN_SECRET="anza123"
```

### 3. Embed `<ChatWidget />` in Your Layout or Page
```jsx
import ChatWidget from '@/components/ChatBot/Widget';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* Drop-in AI Chatbot Widget */}
        <ChatWidget botName="Muhammad Anza Muneeb Khan AI Assistant" />
      </body>
    </html>
  );
}
```

---

## 📂 Project Structure

```
26bot/
├── src/
│   ├── app/
│   │   ├── page.js                 ← Main landing page with live chatbot demo
│   │   ├── admin/
│   │   │   └── page.js             ← Secure Admin Training Dashboard (/admin)
│   │   └── api/
│   │       ├── chat/route.js        ← POST /api/chat endpoint with guardrails
│   │       └── train/route.js       ← POST /api/train knowledge base update endpoint
│   └── components/
│       └── ChatBot/
│           ├── Widget/
│           │   ├── index.jsx       ← ChatWidget frontend component
│           │   └── ChatWidget.module.css ← Responsive gold accent styles
│           └── lib/
│               ├── smartSwitch.js   ← LangChain Gemini × Groq fallback engine
│               ├── guardrails.js    ← Domain boundary & off-topic validator
│               ├── knowledgeLoader.js← RAG retrieval engine
│               ├── config.js        ← System instructions & bot config
│               └── rateLimit.js     ← MongoDB rate limiter
└── knowledge/
    └── website-data.md             ← Local knowledge base storage
```

---

## 🧪 Running Locally

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```

Visit `http://localhost:3000` to interact with the chatbot, or `http://localhost:3000/admin` to train it with new data.

---

## 📜 License & Credit

Built with ❤️ by **Muhammad Anza Muneeb Khan**. Open for custom deployment and reuse.

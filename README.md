# 🤖 MyBot (26bot) — Plug-and-Play RAG Chatbot for Next.js

> **One component. Your data. Instant AI chatbot for any website.**

A fully self-contained, production-ready AI chatbot system built entirely with **Next.js 16 and React 19** — no separate backend required. It uses a custom **Retrieval-Augmented Generation (RAG)** engine to train on your knowledge base and answer visitor questions with 100% accuracy from your own data.

Designed to be dropped into any existing Next.js project in under 5 minutes.

---

## 🧠 What Is This?

**MyBot** is a complete AI chatbot product that lives entirely within a Next.js application. There is no separate server or API service — everything runs inside **Next.js API Routes** (App Router).

You give it your data. It answers your visitors. Precisely.

- No hallucinations
- No generic AI responses
- No external AI dependencies beyond API keys
- No third-party RAG libraries

---

## 🏗️ Architecture

Everything is a single Next.js app:

```
26bot/
├── src/
│   ├── app/
│   │   ├── page.js              ← Product landing page with live demo
│   │   ├── layout.js            ← Global layout & metadata
│   │   ├── globals.css          ← Global styles
│   │   ├── admin/
│   │   │   └── page.js          ← Secure admin training dashboard
│   │   └── api/
│   │       ├── chat/
│   │       │   └── route.js     ← POST /api/chat — AI chat endpoint
│   │       └── train/
│   │           └── route.js     ← POST /api/train — training endpoint
│   │
│   └── components/
│       └── ChatBot/             ← The portable chatbot component
│           ├── Widget/          ← Floating chat bubble UI
│           ├── Demo/            ← Live demo panel
│           └── lib/
│               ├── smartSwitch.js    ← Dual AI provider engine
│               ├── knowledgeLoader.js ← BM25 RAG retrieval engine
│               ├── config.js         ← Bot identity & system prompt
│               ├── rateLimit.js      ← MongoDB rate limiter
│               ├── crawler.js        ← Deep web crawler
│               └── mongodb.js        ← Database connection
│
└── knowledge/
    └── website-data.md          ← Your knowledge base goes here
```

---

## ✨ Core Features

### 🔍 Custom RAG Engine (Zero Dependencies)
- Pure JavaScript BM25 scoring algorithm — no LangChain, no Pinecone, no vector DB
- **Intent expansion** — understands short queries like `"price"`, `"contact"`, `"hours"`
- **Multi-strategy chunking**: Page markers → Markdown headings → Sliding window
- **Context-aware caching** with a 60-second TTL for fast repeated queries
- **Currency & contact number boost**: Automatically surfaces pricing and contact chunks

### ⚡ Smart Switch — Dual AI Provider Race Engine
- Fires **Groq** (Llama 3.3 70B) and **Google Gemini** (2.5 Flash) in a primary/fallback mode
- If primary provider fails, the fallback activates instantly — zero downtime
- **Automatic retry** on rate limits and network drops (exponential backoff)
- Fully configurable: temperature, max tokens, conversation history depth
- Your brand stays consistent — AI provider identity is never exposed to users

### 📂 Multi-Format Training
| Method | Details |
|--------|---------|
| `.md` file | Recommended — best structure for RAG chunking |
| `.txt` file | Plain text, any length |
| `.json` file | `[{question, answer}]` or `{qa: [...]}` format |
| Website URL | Recursive deep crawl with SSE progress streaming |
| Raw text paste | Admin panel text area — instant update |

### 🕷️ Deep Web Crawler with Live Progress
- Recursively discovers and crawls all internal pages of a website
- Converts HTML → clean Markdown automatically (via Turndown + Cheerio)
- Streams real-time progress to the admin dashboard via **Server-Sent Events**
- Configurable max pages: 5, 15, 30, 50, 100, or unlimited
- Deduplicates URLs, skips assets and external domains

### 🔒 Security
- **Admin dashboard** protected by Bearer token authentication
- **MongoDB-backed rate limiter**: 20 messages per minute per IP address
- Knowledge base stored in MongoDB — persists across deployments
- Unauthorized training requests return 401 immediately

### 🎯 Strict Answer Grounding (9-Rule System Prompt)
Every chatbot response is controlled by strict rules:

1. Single-word queries understood ("contact" → all contact info)
2. No hallucinations — answers only from your knowledge base
3. Off-topic questions refused with a standard polite message
4. Source page URL cited when applicable
5. AI identity hidden — bot is always "your" assistant
6. Tone adapts automatically to your industry
7. Full conversation memory across the session
8. Plain text output — no markdown formatting bleed
9. Every answer ends with a follow-up invitation

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Groq API key — free at https://console.groq.com
- Google Gemini API key — free at https://aistudio.google.com/apikey

---

### 1. Install Dependencies

```bash
npm install
```

---

### 2. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# AI Provider Keys
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_BASE_URL=https://api.groq.com/openai/v1

GEMINI_API_KEY=your_gemini_api_key_here
GEN_MODEL=gemini-2.5-flash

# AI Tuning
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=1024

# Knowledge Base
KNOWLEDGE_MD_PATH=./knowledge/website-data.md

# Admin Panel
ADMIN_SECRET=choose-a-strong-password-here

# MongoDB (for knowledge storage + rate limiting)
MONGODB_URI=your-mongodb-connection-string-here

# Bot Branding
NEXT_PUBLIC_BOT_NAME=AI Assistant
NEXT_PUBLIC_BOT_SUBTITLE=Online · Powered by Smart Switch AI
```

---

### 3. Add Your Knowledge Base

Place your website information in `knowledge/website-data.md`.

This file is the brain of your chatbot. The more structured and detailed your content, the better the answers.

Example formats:

```markdown
# About Us
We are an e-commerce store specializing in handmade leather goods...

## Contact
Email: support@yourstore.com
Phone: +1-800-555-0100

## Pricing
- Small bag: $49
- Medium bag: $79
- Large bag: $99
```

Or use the Admin Panel to train from a live URL instead.

---

### 4. Start the Development Server

```bash
npm run dev
```

Open `http://localhost:3000` — your chatbot is live in the bottom-right corner.

---

### 5. Train the Bot (Optional — via Admin Panel)

Go to `http://localhost:3000/admin` and enter your `ADMIN_SECRET`.

Training options:
- **Deep Web Crawler** — enter any website URL, watch it crawl in real time
- **Upload File** — upload `.md`, `.txt`, or `.json`
- **Raw Text** — paste content directly

---

## 🔌 Reusing in Any Next.js Project

This chatbot is designed to be **fully portable**. To add it to an existing project:

### Step 1 — Copy the ChatBot component
```
src/components/ChatBot/   →   your-project/src/components/ChatBot/
```

### Step 2 — Copy the API Routes
```
src/app/api/chat/route.js   →   your-project/src/app/api/chat/route.js
src/app/api/train/route.js  →   your-project/src/app/api/train/route.js
```

### Step 3 — Add your knowledge file
```
knowledge/website-data.md   →   your-project/knowledge/website-data.md
```

### Step 4 — Set environment variables
Add to your project's `.env.local`:
```env
GROQ_API_KEY=...
GEMINI_API_KEY=...
ADMIN_SECRET=...
MONGODB_URI=...
KNOWLEDGE_MD_PATH=./knowledge/website-data.md
```

### Step 5 — Import the widget
```jsx
import ChatWidget from '@/components/ChatBot/Widget';

export default function Layout({ children }) {
  return (
    <>
      {children}
      <ChatWidget botName="Your Bot Name" />
    </>
  );
}
```

Done. Your AI chatbot is live.

---

## 📡 API Reference

### POST /api/chat

Accepts a conversation history and returns an AI-generated response grounded in your knowledge base.

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "What are your services?" }
  ]
}
```

**Response:**
```json
{
  "text": "We offer the following services...",
  "provider": "groq"
}
```

**Errors:**
- `400` — Invalid payload or empty message
- `429` — Rate limit exceeded (20 msg/min per IP)
- `500` — Internal server error

---

### POST /api/train

Trains the chatbot with new knowledge. Requires `Authorization: Bearer <ADMIN_SECRET>` header.

**File Upload:**
```
Content-Type: multipart/form-data
file: <your-file.md>
```

**Website Crawl (SSE stream):**
```json
{ "url": "https://your-website.com", "maxPages": 30 }
```

**Raw Text:**
```json
{ "text": "Your knowledge content here..." }
```

**JSON Q&A:**
```json
{ "json": "[{\"question\": \"What is X?\", \"answer\": \"X is...\"}]" }
```

---

## 🔧 Configuration Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `GROQ_API_KEY` | *(required)* | Groq API key |
| `GEMINI_API_KEY` | *(required)* | Google Gemini API key |
| `ADMIN_SECRET` | *(required)* | Admin panel password |
| `MONGODB_URI` | *(required)* | MongoDB connection string |
| `KNOWLEDGE_MD_PATH` | `./knowledge/website-data.md` | Path to knowledge file |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Groq model to use |
| `GEN_MODEL` | `gemini-2.5-flash` | Gemini model to use |
| `AI_TEMPERATURE` | `0.7` | Response creativity (0–1) |
| `AI_MAX_TOKENS` | `1024` | Max response length in tokens |
| `NEXT_PUBLIC_BOT_NAME` | `AI Assistant` | Bot name in chat header |
| `NEXT_PUBLIC_BOT_SUBTITLE` | `Online · ...` | Subtitle under bot name |

---

## 🏭 Industry Use Cases

| Industry | Use Case |
|----------|----------|
| E-commerce | Product catalog questions, shipping, returns |
| Real Estate | Property listings, pricing, agent contact |
| Restaurant | Menu, hours, reservations, specials |
| Education | Courses, fees, schedules, admissions |
| Healthcare | Services, doctors, clinic hours, contact |
| SaaS / Tech | Feature docs, pricing tiers, onboarding help |
| Portfolio | Visitor questions about skills, projects, contact |
| Corporate | Company info, team, services, HR |

> Give it your data in any format. The bot adapts to your industry automatically.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16, React 19 |
| **API** | Next.js App Router API Routes |
| **Database** | MongoDB (via MongoDB Atlas) |
| **AI Providers** | Groq (Llama 3.3 70B), Google Gemini 2.5 Flash |
| **RAG Engine** | Custom BM25 — zero external dependencies |
| **Web Crawling** | Cheerio, Turndown |
| **Rate Limiting** | MongoDB TTL collections |
| **Styling** | Vanilla CSS Modules |

---

## 📁 Supported Training Formats

| Format | Notes |
|--------|-------|
| `.md` (Markdown) | Best results — use for structured content |
| `.txt` (Plain Text) | Any plain text document |
| `.json` (Q&A) | `[{question, answer}]` or `{qa: [...]}` |
| Website URL | Recursively crawled, HTML → Markdown |
| Raw Text Paste | Via admin panel textarea |

---

## 🔐 Production Deployment Checklist

- [ ] Set a strong `ADMIN_SECRET`
- [ ] Configure MongoDB Atlas with IP access list
- [ ] Add TTL index on `rate_limits` collection:
  ```js
  db.rate_limits.createIndex({ "resetAt": 1 }, { expireAfterSeconds: 0 })
  ```
- [ ] Deploy to Vercel (recommended for Next.js)
- [ ] Set all environment variables in your hosting dashboard
- [ ] Test the admin panel and train with production data
- [ ] Verify chat widget appears correctly on all pages

---

## 🧑‍💻 Author

**Muhammad Anza Muneeb Khan**  
Full-Stack Developer · MERN Stack · Next.js · AI/RAG Systems  
Smart Switch AI — Gemini x Groq

---

## 📄 License

This project is open for personal and commercial reuse. Attribution appreciated.

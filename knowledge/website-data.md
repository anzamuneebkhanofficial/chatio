# Chatio by Anza — Comprehensive Official Product Manual & Knowledge Base

## 1. Product Overview & Identity
- **Product Name**: Chatio by Anza (`chatiobyanza`)
- **Creator & Lead Architect**: Muhammad Anza Muneeb Khan
- **GitHub Repository**: https://github.com/anzamuneebkhanofficial
- **License**: 100% Free & Open-Source Software (FOSS).
- **Core Purpose**: To provide website owners, non-technical creators, store managers, agencies, and developers with a 100% free, high-speed custom AI chatbot platform. It runs on your own data and API keys with zero monthly subscription fees and no artificial message limits.

---

## 2. Key Advantages Over Expensive SaaS Chatbots
- **100% Free & Self-Hosted**: Traditional SaaS chatbot services (like Chatbase, Intercom, or Zendesk) charge $50 to $300/month with strict message limits. Chatio by Anza is completely free. You connect your free API keys directly from Google AI Studio and Groq Console.
- **24/7 Automated Customer Support**: Answers customer FAQs, handles inquiries, guides shoppers, and provides technical assistance instantly day and night.
- **Zero CSS / Styling Clashes**: Powered by **Shadow DOM technology** (`attachShadow({ mode: 'open' })`), guaranteeing that the chatbot widget styles are 100% isolated and will never conflict with your WordPress, Shopify, Webflow, or custom website CSS.
- **Complete Data Ownership & Privacy**: Your custom knowledge base, API keys, and conversation history are stored securely in your private MongoDB database cluster.
- **Sub-Second AI Response Speeds**: Powered by our dual AI engine combining **Groq (`openai/gpt-oss-120b`)** with 131k context tokens and **Google Gemini (`gemini-3.6-flash`)** with automatic fallback racing.

---

## 3. Core Technical Architecture & RAG Engine
- **LangChain.js RAG Engine**:
  - Uses vector similarity search, semantic document chunking via `RecursiveCharacterTextSplitter`, and dynamic context retrieval.
  - Generates dense vector embeddings using Google Generative AI (`gemini-embedding-001`).
- **Multi-Format Training Support**:
  - **Markdown Documents (`.md`)**: Technical documentation, FAQs, product manuals, README files.
  - **PDF Documents (`.pdf`)**: Business brochures, catalog sheets, legal policies, whitepapers.
  - **Plain Text Files (`.txt`)**: Simple FAQ pairs, company guidelines, notes.
  - **Structured JSON (`.json`)**: Structured key-value business data and Q&A pairs.
  - **Deep Website Crawler**: Built-in recursive URL scraper that crawls and extracts clean text from entire websites.
- **Security & Guardrails**:
  - **SSRF Protection**: Web crawler automatically blocks private/internal IP ranges (`127.0.0.1`, `localhost`, `10.0.0.0/8`, `192.168.0.0/16`, AWS metadata endpoints).
  - **API Key Encryption**: User Gemini and Groq API keys are stored encrypted using `AES-256-GCM` encryption in MongoDB.
  - **Domain Guardrails**: Smart keyword and topic evaluation filters off-topic queries before making AI requests.

---

## 4. Dual AI Engine & Provider Priority
- **Primary AI Provider**: **Groq (`openai/gpt-oss-120b`)**
  - Ultra-low inference latency, 131,072-token context window, ideal for fast reasoning, product comparisons, and customer support.
- **Fallback AI Provider**: **Google Gemini (`gemini-3.6-flash`)**
  - High-speed multimodal intelligence.
- **Automatic Fallback Racing**: If one provider encounters a network issue or rate limit, Chatio immediately falls back to the secondary provider without any downtime.

---

## 5. User Accounts & Multi-Tenant App ID Isolation
- **User Dashboard (`/dashboard`)**:
  - Every registered user receives a unique private `appId` (e.g., `bot_x8f9a2b`).
  - Allows full customization of bot display name, primary brand color, welcome message, suggestion chips, system prompt directives, API keys, and knowledge base files.
- **Master Owner Monitoring Portal (`/owner`)**:
  - Administrative dashboard for platform owner Muhammad Anza Muneeb Khan.
  - Provides platform-wide analytics: total registered users, active chatbots, conversation counts, and user management.

---

## 6. Step-by-Step Account Creation & Setup Guide
- **Step 1 — Create Your Account**: Navigate to `/signup`, enter your Name, Email, and Password.
- **Step 2 — Log In**: Go to `/login` to access your private **User Dashboard**.
- **Step 3 — Customize Appearance**: In the **Appearance** tab, set your Bot Name, Primary Brand Color, Welcome Message, and Widget Title.
- **Step 4 — Add Free AI Keys**: In the **AI & Keys** tab, paste your free Google Gemini API key (from Google AI Studio: `https://aistudio.google.com/apikey`) or Groq API key (from Groq Console: `https://console.groq.com`).
- **Step 5 — Train Your Knowledge Base**: In the **Knowledge Base** tab, enter your website URL to run the web crawler, or upload `.md`, `.pdf`, `.txt`, or `.json` files.
- **Step 6 — Copy Embed Code**: In the **Embed Snippets** tab, copy your one-line embed code and paste it on your website!

---

## 7. How to Embed Your Chatbot on Any Website

### A. Universal HTML / Plain Website Script Tag
Paste this single line of code right before the closing `</body>` tag on any HTML page:
```html
<script src="https://your-domain.com/widget.js" data-app-id="YOUR_APP_ID"></script>
```

### B. WordPress Integration
1. Log in to your **WordPress Admin Dashboard**.
2. Go to **Plugins → Add New** and search for **"Header and Footer Scripts"** (or **"WPCode"**). Install and activate it.
3. Go to **Settings → Header and Footer Scripts** (or the plugin settings).
4. In the **Footer Scripts** (or Before `</body>`) box, paste:
   ```html
   <script src="https://your-domain.com/widget.js" data-app-id="YOUR_APP_ID"></script>
   ```
5. Click **Save Changes**. Your chatbot will immediately appear on all WordPress pages!

### C. Shopify Integration
1. Log in to your **Shopify Admin Dashboard**.
2. Navigate to **Online Store → Themes**.
3. Click the **Actions (...)** button next to your active theme and select **Edit Code**.
4. In the file list, open `layout/theme.liquid`.
5. Scroll to the very bottom of the file, find the closing `</body>` tag, and paste the script tag right above it:
   ```html
   <script src="https://your-domain.com/widget.js" data-app-id="YOUR_APP_ID"></script>
   ```
6. Click **Save**. Your Shopify storefront now has a live AI shopping assistant!

### D. Webflow Integration
1. Open your **Webflow Project Settings**.
2. Go to the **Custom Code** tab.
3. In the **Footer Code** section (before `</body>`), paste the script tag:
   ```html
   <script src="https://your-domain.com/widget.js" data-app-id="YOUR_APP_ID"></script>
   ```
4. Click **Save Changes** and **Publish** your site.

### E. Next.js (App Router or Pages Router)
In your `layout.js` or `_app.js`, import Next.js `Script`:
```jsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="https://your-domain.com/widget.js"
          data-app-id="YOUR_APP_ID"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
```

### F. React (Single Page Applications)
In your `public/index.html` before `</body>`, or in `useEffect`:
```jsx
useEffect(() => {
  const script = document.createElement('script');
  script.src = 'https://your-domain.com/widget.js';
  script.setAttribute('data-app-id', 'YOUR_APP_ID');
  script.async = true;
  document.body.appendChild(script);
  return () => {
    document.body.removeChild(script);
  };
}, []);
```

---

## 8. Interactive Knowledge Demo Switcher vs Permanent Base Data
- **4 Pre-Built Industry Presets**:
  1. 🍕 **Restaurant (Bella Vista Italian Restaurant)**: Handmade pasta, wood-fired pizzas, wine pairings, table reservations, opening hours.
  2. 🛒 **E-Commerce (TechCart Electronics Store)**: Laptops, headphones, return & refund policies, shipping times, warranty.
  3. 🏥 **Medical Clinic (Wellness First Clinic by Dr. Sarah Ahmed)**: General checkups, consultation fees, clinic hours, appointment scheduling.
  4. 🎨 **Design Agency (Pixel & Ink Studio)**: Brand identity, logo packages, UI/UX design, turnaround times, pricing.
- **Session-Only Isolation**:
  - Clicking any demo card stores the demo persona strictly in **`sessionStorage`** and temporary memory.
  - It **NEVER** modifies or overwrites your permanent MongoDB database.
- **Automatic Reset on Refresh**:
  - As soon as a user refreshes the page, the session demo expires and the chatbot automatically restores the permanent **Chatio by Anza Platform Assistant** with the full product knowledge base.
  - A **"Reset to Chatio"** button is also available in the chat header and demo panel for instant 1-click reset.

---

## 9. Frequently Asked Questions (FAQs)

### Q: Is Chatio by Anza completely free?
**A**: Yes! Chatio by Anza is 100% free software built by Muhammad Anza Muneeb Khan. There are no monthly fees, no credit card requirements, and no message limits.

### Q: What AI models power Chatio?
**A**: Chatio uses **Groq (`openai/gpt-oss-120b`)** as the primary engine for sub-second responses and **Google Gemini (`gemini-3.6-flash`)** as the intelligent fallback.

### Q: Where do I get free API keys?
**A**:
- Google Gemini API key: Get free from **Google AI Studio** (`https://aistudio.google.com/apikey`).
- Groq API key: Get free from **Groq Console** (`https://console.groq.com`).

### Q: Will the chatbot widget slow down my website?
**A**: No. The widget script is lightweight (`< 15KB`), loads asynchronously, and runs inside a Shadow DOM so it has zero impact on page load speed or Core Web Vitals.

### Q: Can I customize the colors, bot name, and welcome greeting?
**A**: Yes! In the User Dashboard (`/dashboard`), you can customize the Bot Name, Welcome Greeting, Primary Brand Color, Widget Title, and System Prompt.

### Q: What file formats can I upload for training?
**A**: You can upload Markdown (`.md`), PDF (`.pdf`), Plain Text (`.txt`), Structured JSON (`.json`), or crawl any live website URL.

### Q: Who owns the conversation logs and customer data?
**A**: You have 100% ownership of your data. All knowledge embeddings, configurations, and chat logs remain securely in your private MongoDB database.

### Q: Who built Chatio by Anza?
**A**: Chatio by Anza was designed, built, and architected by **Muhammad Anza Muneeb Khan**. Check out the official repository at https://github.com/anzamuneebkhanofficial.
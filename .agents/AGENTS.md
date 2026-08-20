# AGENTS.md — Development Guidelines & Standard Operating Procedures

> **Project Name**: Chatio by Anza (`chatiobyanza`)  
> **Author & Lead Engineer**: Muhammad Anza Muneeb Khan  
> **Tech Stack**: Next.js 16 (App Router), React 19, LangChain, Google Gemini, Groq, MongoDB Vector Search, Shadow DOM Embed

---

## 🎨 UI/UX & Design Architecture Guidelines (2026 Standards)

1. **Color Cohesion & Theme Consistency**:
   - Primary Accent: Royal Indigo `#6366f1` / `#4f46e5`
   - Secondary Accent: Vibrant Violet `#8b5cf6` / `#a855f7`
   - Tertiary Accent: Cyan `#06b6d4` / `#38bdf8`
   - Backgrounds: Dark Mode Glassmorphism (`#080a16`, `#0d1020`, `#111428`)
   - Text colors: High-contrast white (`#ffffff`) and slate secondary (`#94a3b8`). NEVER use outdated gold/yellow accents across the platform.

2. **Navigation Bar Standards**:
   - Navigation links must NEVER wrap text awkwardly across multiple lines.
   - Use grouped dropdown menus for categorized links ("Platform", "Resources") to keep top-level navigation clean and spacious.
   - Enforce `white-space: nowrap` on CTA buttons and badges (`RAG LangChain`).
   - Include mobile responsive hamburger menu drawer for screen widths `< 960px`.

3. **Typography & Aesthetics**:
   - Fonts: `'Outfit'`, `'Inter'`, system-ui.
   - Smooth gradients (`linear-gradient(135deg, var(--accent), var(--accent-2))`).
   - Glassmorphic card backdrops (`backdrop-filter: blur(20px)`), subtle glowing borders, micro-animations (`fadeUp`, `slideDown`).

---

## ⚡ Performance & Build Optimization

1. **Dev Server Stability (Windows OS)**:
   - Next.js 16 dev command must use `--webpack` (`"dev": "next dev --webpack"`) to prevent Rust Tokio Turbopack panics on Windows OS paths.

2. **Standalone Widget Bundling**:
   - Widget entry file is `src/widget/embed.js`.
   - Bundles to `public/widget.js` via `node scripts/build-widget.js`.
   - Must run inside Shadow DOM (`attachShadow({ mode: 'open' })`) for 100% CSS isolation on third-party sites (WordPress, Shopify, Webflow).

---

## 🛡️ Security & Guardrails

1. **SSRF Protection**:
   - Web crawling inputs must block internal IP ranges (`127.0.0.1`, `localhost`, `10.0.0.0/8`, `192.168.0.0/16`, AWS metadata endpoints).

2. **Domain Guardrails**:
   - Pre-evaluates incoming queries (`checkGuardrails()`) to filter out off-topic requests (recipes, sports, weather, crypto) before making LLM API calls.

3. **API Key Encryption**:
   - User Gemini and Groq API keys are stored encrypted (`AES-256-GCM`) in MongoDB.

---

## 🛠️ Code Conventions & State Management

1. **Form State & Inputs**:
   - ALWAYS use `react-hook-form` for complex state and form handling. Manual form state (`useState` per input) is explicitly forbidden as it causes typing lag in large components.
   - Use `{...register('fieldName')}` for all form inputs.

2. **Notifications & Toasts**:
   - ALWAYS use `sonner` for toast notifications (`toast.success`, `toast.error`, `toast.loading`) rather than custom alert divs or manual `saveStatus` states.

3. **Routing & Navigation**:
   - ALWAYS use Next.js `next/link` (`<Link>`) for internal navigation. Do NOT use standard HTML `<a>` tags to prevent full page reloads.

4. **Image Uploads**:
   - Small images (like user avatars and bot logos) should be read as `Base64` data URLs (`FileReader.readAsDataURL`) using an `<input type="file" />` and saved directly in the MongoDB config document.
   - Always validate file size (Max 2MB) and format (SVG, PNG, JPG/JPEG, WEBP) before uploading.

5. **API Requests**:
   - ALWAYS use `axios` for client-side API requests instead of the native `fetch` API. This simplifies code and improves error handling.

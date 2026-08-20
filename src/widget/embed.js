/**
 * Chatio by Anza — Standalone Shadow DOM Embed Widget (2026 Luxury Edition)
 *
 * Can be embedded on ANY external website (WordPress, Shopify, React, Webflow, Plain HTML) via:
 * <script src="https://your-domain.com/widget.js" data-app-id="YOUR_BOT_ID" async></script>
 *
 * Encapsulated inside Shadow DOM for 100% CSS & styling isolation.
 */

(function () {
  if (window.__ChatioWidgetLoaded) return;
  window.__ChatioWidgetLoaded = true;

  let scriptOrigin = window.location.origin;
  let appId = '';

  const currentScript =
    document.currentScript ||
    Array.from(document.querySelectorAll('script')).find(
      (s) => s.src && s.src.includes('widget.js')
    );

  if (currentScript) {
    appId =
      currentScript.getAttribute('data-app-id') ||
      currentScript.getAttribute('data-bot-id') ||
      '';
    const customHost = currentScript.getAttribute('data-host');
    if (customHost) {
      scriptOrigin = customHost.replace(/\/$/, '');
    } else if (currentScript.src) {
      try {
        const u = new URL(currentScript.src);
        scriptOrigin = u.origin;
      } catch (e) {}
    }
  }

  if (window.__CHATIO_HOST__) {
    scriptOrigin = window.__CHATIO_HOST__.replace(/\/$/, '');
  }

  const CONFIG_API = `${scriptOrigin}/api/widget/config${
    appId ? '?appId=' + encodeURIComponent(appId) : ''
  }${appId ? '&' : '?'}_t=${Date.now()}`;
  const CHAT_API = `${scriptOrigin}/api/chat`;

  let botConfig = {
    botName: 'Chatio AI Assistant',
    primaryColor: '#6366f1',
    welcomeMessage:
      'Hello! I am Chatio AI assistant.\n\nHow can I assist you today?',
    widgetTitle: 'Chatio by Anza',
    widgetDescription: 'Online · Powered by RAG',
    footerText: 'POWERED BY CHATIO BY ANZA',
    avatarUrl: '',
    avatarBg: 'transparent',
    position: 'bottom-right',
    widgetWidth: '440px',
    widgetHeight: '640px',
    suggestions: [
      { label: 'WordPress & Shopify Embed', prompt: 'How do I embed my chatbot on WordPress or Shopify?' },
      { label: 'Gemini × Groq Racing', prompt: 'Explain how your Gemini and Groq dual engine speed racing works.' },
      { label: 'Step-by-Step Setup Guide', prompt: 'Give me the step-by-step guide to set up my custom chatbot.' },
      { label: '100% Free Custom Chatbot?', prompt: 'Is Chatio by Anza 100% free and open-source?' },
    ],
  };

  let isOpen = false;
  let messages = [];
  let isLoading = false;
  let copiedMsgId = null;

  // ── Color Utilities ─────────────────────────────────────────────────────
  function hexToRgba(hex, alpha) {
    if (!hex || !hex.startsWith('#')) return `rgba(99, 102, 241, ${alpha})`;
    const h = hex.replace('#', '');
    let r = 99, g = 102, b = 241;
    if (h.length === 3) {
      r = parseInt(h[0] + h[0], 16);
      g = parseInt(h[1] + h[1], 16);
      b = parseInt(h[2] + h[2], 16);
    } else if (h.length === 6) {
      r = parseInt(h.substring(0, 2), 16);
      g = parseInt(h.substring(2, 4), 16);
      b = parseInt(h.substring(4, 6), 16);
    }
    if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(99, 102, 241, ${alpha})`;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function adjustBrightness(hex, percent) {
    if (!hex || !hex.startsWith('#')) return hex || '#4f46e5';
    let h = hex.replace('#', '');
    if (h.length === 3) {
      h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    }
    if (h.length !== 6) return hex;
    let r = parseInt(h.substring(0, 2), 16);
    let g = parseInt(h.substring(2, 4), 16);
    let b = parseInt(h.substring(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return hex;
    r = Math.min(255, Math.max(0, r + percent));
    g = Math.min(255, Math.max(0, g + percent));
    b = Math.min(255, Math.max(0, b + percent));
    const toHex = (n) => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  // ── Format Time Helper ──────────────────────────────────────────────────
  function formatTime(date) {
    try {
      return new Date(date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return '';
    }
  }

  // ── High-Performance Vanilla Markdown Parser (GFM Table & List Support) ──
  function parseMarkdown(md) {
    if (!md) return '';
    let text = String(md);

    // 1. Temporarily store Code Blocks so they don't get modified by inline formatting
    const codeBlocks = [];
    text = text.replace(/```([\s\S]*?)```/g, function (match, code) {
      const escapedCode = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      codeBlocks.push('<pre class="ssai-code-block"><code>' + escapedCode.trim() + '</code></pre>');
      return `___CODE_BLOCK_${codeBlocks.length - 1}___`;
    });

    // 2. Escape raw HTML tags for security
    text = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Restore Code Blocks
    text = text.replace(/___CODE_BLOCK_(\d+)___/g, (m, idx) => codeBlocks[Number(idx)] || '');

    // 3. Inline Code: `code`
    text = text.replace(/`([^`]+)`/g, '<code class="ssai-inline-code">$1</code>');

    // 4. Horizontal Rules: --- or ***
    text = text.replace(/^---$/gim, '<hr class="ssai-hr"/>');
    text = text.replace(/^\*\*\*$/gim, '<hr class="ssai-hr"/>');

    // 5. GFM Markdown Tables Parser (| Header 1 | Header 2 |\n|---|---|\n| Val 1 | Val 2 |)
    const tableRegex = /((?:^\|[^\n]+\|\r?\n)+)/gm;
    text = text.replace(tableRegex, function (match) {
      const lines = match.trim().split(/\r?\n/).filter((l) => l.includes('|'));
      if (lines.length < 2) return match;

      let html = '<div class="ssai-table-wrapper"><table class="ssai-table">';
      let inBody = false;

      lines.forEach((line, index) => {
        // Skip table separator line (|---|---| or |:---|:---|)
        if (/^\|?[\s:-]+(?:\|[\s:-]+)+\|?$/.test(line.trim())) {
          return;
        }

        const cells = line
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());

        if (cells.length === 0) return;

        if (index === 0) {
          html += '<thead><tr>';
          cells.forEach((cell) => {
            html += `<th class="ssai-th">${cell}</th>`;
          });
          html += '</tr></thead>';
        } else {
          if (!inBody) {
            html += '<tbody>';
            inBody = true;
          }
          html += '<tr class="ssai-tr">';
          cells.forEach((cell) => {
            html += `<td class="ssai-td">${cell}</td>`;
          });
          html += '</tr>';
        }
      });

      if (inBody) html += '</tbody>';
      html += '</table></div>';
      return html;
    });

    // 6. Headers: ###, ##, #
    text = text.replace(/^### (.*$)/gim, '<h4 class="ssai-h4">$1</h4>');
    text = text.replace(/^## (.*$)/gim, '<h3 class="ssai-h3">$1</h3>');
    text = text.replace(/^# (.*$)/gim, '<h2 class="ssai-h2">$1</h2>');

    // 7. Bold & Italic
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    text = text.replace(/_([^_]+)_/g, '<em>$1</em>');

    // 8. Blockquotes: > quote
    text = text.replace(/^\> (.*$)/gim, '<blockquote class="ssai-quote">$1</blockquote>');

    // 9. Links: [text](url)
    text = text.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="ssai-link">$1</a>'
    );

    // 10. Unordered Lists (- item, * item, • item)
    text = text.replace(/^\s*[-*•]\s+(.*)$/gim, '<li class="ssai-li">$1</li>');
    text = text.replace(/(<li class="ssai-li">[\s\S]*?<\/li>\n?)+/gi, (m) => `<ul class="ssai-ul">${m}</ul>`);

    // 11. Ordered Lists (1. item)
    text = text.replace(/^\s*\d+\.\s+(.*)$/gim, '<li class="ssai-oli">$1</li>');
    text = text.replace(/(<li class="ssai-oli">[\s\S]*?<\/li>\n?)+/gi, (m) => `<ol class="ssai-ol">${m}</ol>`);

    // 12. Smart Paragraph & Line Break Handling (avoiding adding <br/> inside tables/lists)
    const blocks = text.split(/(<div class="ssai-table-wrapper">[\s\S]*?<\/div>|<pre[\s\S]*?<\/pre>|<ul[\s\S]*?<\/ul>|<ol[\s\S]*?<\/ol>|<h[2-4][\s\S]*?<\/h[2-4]>|<hr[\s\S]*?\/>)/gi);

    text = blocks.map(block => {
      if (!block) return '';
      if (
        block.startsWith('<div class="ssai-table-wrapper"') ||
        block.startsWith('<pre') ||
        block.startsWith('<ul') ||
        block.startsWith('<ol') ||
        block.startsWith('<h') ||
        block.startsWith('<hr')
      ) {
        return block;
      }
      return block
        .replace(/\n\n+/g, '<div class="ssai-spacer"></div>')
        .replace(/\n/g, '<br/>');
    }).join('');

    return text;
  }

  // ── Create Shadow DOM Host ──────────────────────────────────────────────
  const hostDiv = document.createElement('div');
  hostDiv.id = 'chatio-ai-widget-host';
  document.body.appendChild(hostDiv);

  const shadow = hostDiv.attachShadow({ mode: 'open' });

  // ── Stylesheet ──────────────────────────────────────────────────────────
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

    :host {
      all: initial;
      font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    /* ── Custom Scrollbar (Zero Ugly Browser Scrollbars) ── */
    .ssai-scroll::-webkit-scrollbar {
      width: 5px;
      height: 5px;
    }
    .ssai-scroll::-webkit-scrollbar-track {
      background: transparent;
    }
    .ssai-scroll::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.18);
      border-radius: 9999px;
    }
    .ssai-scroll::-webkit-scrollbar-thumb:hover {
      background: var(--primary-color, #6366f1);
    }

    /* ── Floating Action Button (FAB) ── */
    .fab {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      color: #ffffff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999999;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, opacity 0.2s ease;
      outline: none;
      overflow: visible; /* Never clip glowing green dot */
    }

    .fab.left {
      right: auto;
      left: 24px;
    }

    /* FAB with Theme Color Gradient */
    .fab.avatar-style-theme {
      background: linear-gradient(135deg, var(--primary-color, #6366f1), var(--primary-dark, #4f46e5));
      border: 1.5px solid rgba(255, 255, 255, 0.28);
      box-shadow: 0 10px 32px var(--primary-glow, rgba(99, 102, 241, 0.45)), 0 4px 16px rgba(0, 0, 0, 0.6);
    }

    /* FAB with Transparent / Clean Style (NO Solid Black Box) */
    .fab.avatar-style-transparent {
      background: rgba(255, 255, 255, 0.06);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1.5px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--primary-glow-light, rgba(99, 102, 241, 0.25));
    }

    .fab:hover {
      transform: scale(1.08);
      box-shadow: 0 14px 40px var(--primary-glow, rgba(99, 102, 241, 0.6)), 0 6px 20px rgba(0, 0, 0, 0.7);
    }

    .fab:active {
      transform: scale(0.94);
    }

    .fab svg {
      width: 28px;
      height: 28px;
      fill: currentColor;
    }

    .fab-avatar-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: contain;
      padding: 6px;
    }

    /* Blinking Green Online Dot (100% visible, crisp & unclipped) */
    .fab-dot {
      position: absolute;
      top: 1px;
      right: 1px;
      width: 14px;
      height: 14px;
      background: #22c55e;
      border-radius: 50%;
      border: 2.5px solid #0a0d1a;
      box-shadow: 0 0 10px #22c55e, 0 0 4px #22c55e;
      z-index: 10;
      animation: pulse 1.6s infinite ease-in-out;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.18); opacity: 0.85; }
    }

    /* ── Main Chat Panel Window ── */
    .panel {
      position: fixed;
      bottom: 96px;
      right: 24px;
      width: var(--widget-w, 440px);
      max-width: calc(100vw - 32px);
      height: var(--widget-h, 640px);
      max-height: calc(100dvh - 120px);
      min-height: 480px;
      background: rgba(10, 13, 26, 0.98);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      color: #f8fafc;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 20px;
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.85), 0 0 0 1px var(--primary-glow-light, rgba(99, 102, 241, 0.25));
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 99999999;
      opacity: 0;
      transform: translateY(16px) scale(0.95);
      pointer-events: none;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
    }

    .panel.left {
      right: auto;
      left: 24px;
    }

    .panel.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    /* ── Header ── */
    .header {
      background: linear-gradient(135deg, rgba(16, 20, 38, 0.98), rgba(10, 13, 26, 0.98));
      padding: 14px 18px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
      user-select: none;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .avatar-box {
      position: relative;
      width: 42px;
      height: 42px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 18px;
      flex-shrink: 0;
      overflow: visible; /* Never clip status badge */
    }

    .avatar-box.avatar-style-theme {
      background: linear-gradient(135deg, var(--primary-color, #6366f1), var(--primary-dark, #4f46e5));
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 4px 14px var(--primary-glow-light, rgba(99, 102, 241, 0.35));
    }

    .avatar-box.avatar-style-transparent {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: none;
    }

    .avatar-box-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 3px;
      border-radius: 12px;
    }

    .status-badge {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 12px;
      height: 12px;
      background: #22c55e;
      border-radius: 50%;
      border: 2px solid #0d1020;
      box-shadow: 0 0 8px #22c55e;
      z-index: 10;
    }

    .title {
      font-size: 0.95rem;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.01em;
      line-height: 1.2;
    }

    .subtitle {
      font-size: 0.74rem;
      color: #94a3b8;
      display: flex;
      align-items: center;
      gap: 5px;
      margin-top: 2px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .hdr-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #94a3b8;
      cursor: pointer;
      width: 32px;
      height: 32px;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      outline: none;
    }

    .hdr-btn:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .hdr-btn.close:hover {
      color: #ffffff;
      background: rgba(239, 68, 68, 0.25);
      border-color: rgba(239, 68, 68, 0.5);
    }

    .hdr-btn svg {
      width: 15px;
      height: 15px;
    }

    /* ── Messages Container ── */
    .messages {
      flex: 1;
      padding: 16px 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
      scroll-behavior: smooth;
    }

    .msg-row {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .msg-row.user {
      justify-content: flex-end;
    }

    .msg-bot-avatar {
      width: 30px;
      height: 30px;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 2px;
      overflow: visible;
    }

    .msg-bot-avatar.avatar-style-theme {
      background: linear-gradient(135deg, var(--primary-color, #6366f1), var(--primary-dark, #4f46e5));
      border: 1px solid rgba(255, 255, 255, 0.15);
    }

    .msg-bot-avatar.avatar-style-transparent {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .msg-bot-avatar-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 2px;
      border-radius: 9px;
    }

    .msg-bot-avatar svg {
      width: 15px;
      height: 15px;
      fill: currentColor;
    }

    .bubble {
      max-width: 86%;
      padding: 12px 16px;
      border-radius: 16px;
      font-size: 0.88rem;
      line-height: 1.55;
      word-break: break-word;
      position: relative;
    }

    .bubble.bot {
      background: #121629;
      color: #f8fafc;
      border-bottom-left-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.09);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
    }

    .bubble.user {
      background: linear-gradient(135deg, var(--primary-color, #6366f1), var(--primary-dark, #4f46e5));
      color: #ffffff !important;
      font-weight: 500;
      border-bottom-right-radius: 4px;
      box-shadow: 0 6px 20px var(--primary-glow-light, rgba(99, 102, 241, 0.35));
    }

    .bubble.user p, .bubble.user {
      color: #ffffff !important;
    }

    .bubble.error {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #fca5a5;
    }

    /* ── Rich Markdown Typography ── */
    .bubble strong {
      color: #ffffff;
      font-weight: 600;
    }

    .bubble em {
      font-style: italic;
      color: #cbd5e1;
    }

    .ssai-h2, .ssai-h3, .ssai-h4 {
      color: #ffffff;
      margin: 8px 0 4px 0;
      font-weight: 700;
    }
    .ssai-h2 { font-size: 1.05rem; }
    .ssai-h3 { font-size: 0.95rem; }
    .ssai-h4 { font-size: 0.88rem; }

    .ssai-ul, .ssai-ol {
      margin: 6px 0 6px 18px;
    }
    .ssai-li, .ssai-oli {
      margin-bottom: 4px;
    }

    .ssai-inline-code {
      background: var(--primary-glow-light, rgba(99, 102, 241, 0.2));
      border: 1px solid var(--primary-glow, rgba(99, 102, 241, 0.3));
      padding: 2px 6px;
      border-radius: 5px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.82em;
      color: #ffffff;
    }

    .ssai-code-block {
      background: #090c18;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 8px;
      padding: 10px 12px;
      margin: 8px 0;
      overflow-x: auto;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.82em;
      color: #a5b4fc;
    }

    .ssai-quote {
      border-left: 3px solid var(--primary-color, #6366f1);
      padding-left: 10px;
      margin: 6px 0;
      color: #94a3b8;
      font-style: italic;
    }

    .ssai-link {
      color: #38bdf8;
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    .ssai-link:hover {
      color: #7dd3fc;
    }

    .ssai-spacer {
      height: 8px;
    }

    /* ── Table Styling (Luxury Glassmorphic Data Tables) ── */
    .ssai-table-wrapper {
      width: 100%;
      margin: 10px 0;
      overflow-x: auto;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.14);
      background: rgba(8, 11, 24, 0.95);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    }

    .ssai-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.82rem;
      text-align: left;
      color: #e2e8f0;
    }

    .ssai-th {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(79, 70, 229, 0.25));
      color: #ffffff;
      font-weight: 600;
      padding: 8px 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      white-space: nowrap;
    }

    .ssai-td {
      padding: 8px 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      line-height: 1.45;
    }

    .ssai-tr:last-child .ssai-td {
      border-bottom: none;
    }

    .ssai-tr:nth-child(even) {
      background: rgba(255, 255, 255, 0.03);
    }

    .ssai-tr:hover {
      background: rgba(99, 102, 241, 0.12);
    }

    .ssai-hr {
      border: none;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      margin: 12px 0;
    }

    /* ── Meta & Message Actions ── */
    .msg-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-top: 6px;
      padding-top: 6px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .msg-time {
      font-size: 0.7rem;
      color: #94a3b8;
      font-variant-numeric: tabular-nums;
      letter-spacing: 0.02em;
    }

    /* High-contrast crisp timestamp inside user bubble */
    .bubble.user .msg-meta {
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      margin-top: 6px;
      padding-top: 4px;
    }

    .bubble.user .msg-time {
      color: rgba(255, 255, 255, 0.92) !important;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.03em;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
    }

    .msg-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .msg-btn {
      background: transparent;
      border: none;
      color: #64748b;
      cursor: pointer;
      padding: 2px 4px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.15s, background 0.15s;
    }

    .msg-btn:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.1);
    }

    .msg-btn svg {
      width: 12px;
      height: 12px;
    }

    /* ── Quick Suggestions Bar ── */
    .suggestions-container {
      padding: 0 16px 8px 16px;
      display: flex;
      gap: 8px;
      overflow-x: auto;
      flex-shrink: 0;
    }

    .suggestion-chip {
      background: rgba(16, 20, 38, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.76rem;
      white-space: nowrap;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      transition: all 0.2s ease;
      outline: none;
    }

    .suggestion-chip:hover {
      background: var(--primary-glow-light, rgba(99, 102, 241, 0.2));
      border-color: var(--primary-color, #6366f1);
      color: #ffffff;
      transform: translateY(-1px);
    }

    /* ── Typing Indicator ── */
    .typing-box {
      display: flex;
      gap: 5px;
      padding: 8px 12px;
      align-items: center;
    }

    .typing-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--primary-color, #6366f1);
      animation: bounceDot 1.4s infinite ease-in-out both;
    }

    .typing-dot:nth-child(1) { animation-delay: -0.32s; }
    .typing-dot:nth-child(2) { animation-delay: -0.16s; }

    @keyframes bounceDot {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
      40% { transform: scale(1.1); opacity: 1; }
    }

    /* ── Input Area ── */
    .input-wrapper {
      padding: 12px 16px;
      background: #0d1020;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      gap: 8px;
      align-items: center;
      flex-shrink: 0;
    }

    .input-box {
      flex: 1;
      background: #161b33;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 14px;
      padding: 10px 14px;
      color: #ffffff;
      font-size: 0.88rem;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      font-family: inherit;
    }

    .input-box::placeholder {
      color: #64748b;
    }

    .input-box:focus {
      border-color: var(--primary-color, #6366f1);
      box-shadow: 0 0 0 3px var(--primary-glow-focus, rgba(99, 102, 241, 0.35));
    }

    .send-btn {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      background: linear-gradient(135deg, var(--primary-color, #6366f1), var(--primary-dark, #4f46e5));
      color: #ffffff;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px var(--primary-glow-light, rgba(99, 102, 241, 0.35));
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.15s;
      outline: none;
      flex-shrink: 0;
    }

    .send-btn:hover:not(:disabled) {
      transform: scale(1.08);
    }

    .send-btn:active:not(:disabled) {
      transform: scale(0.92);
    }

    .send-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .send-btn svg {
      width: 17px;
      height: 17px;
      fill: currentColor;
    }

    /* ── Footer ── */
    .footer {
      font-size: 0.66rem;
      color: #64748b;
      text-align: center;
      padding: 6px 0 8px;
      background: #0a0d1a;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      border-top: 1px solid rgba(255, 255, 255, 0.04);
      user-select: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }

    /* ── Mobile Responsive ── */
    @media (max-width: 480px) {
      .panel {
        bottom: 0 !important;
        right: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        max-width: 100vw !important;
        height: 100dvh !important;
        max-height: 100dvh !important;
        border-radius: 0 !important;
        border: none !important;
      }
      .fab {
        bottom: 16px;
        right: 16px;
      }
    }
  `;

  shadow.appendChild(styleEl);

  const container = document.createElement('div');
  container.className = 'chatio-widget-root';
  shadow.appendChild(container);

  // Close on outside click
  document.addEventListener('mousedown', (e) => {
    if (isOpen && !hostDiv.contains(e.target)) {
      isOpen = false;
      render();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      isOpen = false;
      render();
    }
  });

  // Fetch Bot Config
  fetch(CONFIG_API)
    .then((r) => r.json())
    .then((cfg) => {
      botConfig = { ...botConfig, ...cfg };
      render();
    })
    .catch(() => {
      render();
    });

  // ── Render Function ─────────────────────────────────────────────────────
  function render() {
    const isLeft = botConfig.position === 'bottom-left';
    const avatarStyle = botConfig.avatarBg === 'theme' ? 'avatar-style-theme' : 'avatar-style-transparent';
    const hasAvatar = Boolean(botConfig.avatarUrl && botConfig.avatarUrl.trim());

    const pColor = botConfig.primaryColor || '#6366f1';
    const pDark = adjustBrightness(pColor, -25);
    const pGlow = hexToRgba(pColor, 0.45);
    const pGlowLight = hexToRgba(pColor, 0.28);
    const pGlowFocus = hexToRgba(pColor, 0.35);

    container.style.setProperty('--primary-color', pColor);
    container.style.setProperty('--primary-dark', pDark);
    container.style.setProperty('--primary-glow', pGlow);
    container.style.setProperty('--primary-glow-light', pGlowLight);
    container.style.setProperty('--primary-glow-focus', pGlowFocus);
    container.style.setProperty('--widget-w', botConfig.widgetWidth || '440px');
    container.style.setProperty('--widget-h', botConfig.widgetHeight || '640px');

    const hasSuggestions =
      Array.isArray(botConfig.suggestions) &&
      botConfig.suggestions.length > 0 &&
      messages.length === 0;

    // Build FAB Content
    const fabContent = hasAvatar
      ? `<img src="${botConfig.avatarUrl}" class="fab-avatar-img" alt="Chat" />`
      : `<svg viewBox="0 0 24 24"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/></svg>`;

    // Build Header Avatar Content
    const headerAvatarContent = hasAvatar
      ? `<img src="${botConfig.avatarUrl}" class="avatar-box-img" alt="Logo" />`
      : `<span>✨</span>`;

    // Build Bot Message Avatar Content
    const botMsgAvatarContent = hasAvatar
      ? `<img src="${botConfig.avatarUrl}" class="msg-bot-avatar-img" alt="Bot" />`
      : `<svg viewBox="0 0 24 24"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/></svg>`;

    // FAB Style: If no avatar, always theme gradient. If avatar, use user's chosen style.
    const fabStyleClass = hasAvatar ? avatarStyle : 'avatar-style-theme';
    const avatarBoxStyleClass = hasAvatar ? avatarStyle : 'avatar-style-theme';
    const msgAvatarStyleClass = hasAvatar ? avatarStyle : 'avatar-style-theme';

    container.innerHTML = `
      <!-- FAB Toggle Button -->
      <button class="fab ${isLeft ? 'left' : ''} ${fabStyleClass}" id="ssai-fab" aria-label="Open AI Chat">
        ${fabContent}
        <span class="fab-dot"></span>
      </button>

      <!-- Main Panel -->
      <div class="panel ${isLeft ? 'left' : ''} ${isOpen ? 'open' : ''}" id="ssai-panel">
        
        <!-- Header -->
        <div class="header">
          <div class="header-left">
            <div class="avatar-box ${avatarBoxStyleClass}">
              ${headerAvatarContent}
              <span class="status-badge"></span>
            </div>
            <div>
              <div class="title">${escapeHtml(botConfig.botName || 'Chatio Assistant')}</div>
              <div class="subtitle">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="#22c55e"><circle cx="4" cy="4" r="4"/></svg>
                ${escapeHtml(botConfig.widgetDescription || 'Online · Powered by AI')}
              </div>
            </div>
          </div>

          <div class="header-actions">
            <!-- Clear Chat Button -->
            <button class="hdr-btn" id="ssai-clear" title="Clear Conversation" aria-label="Clear Chat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"/>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              </svg>
            </button>

            <!-- Close Button -->
            <button class="hdr-btn close" id="ssai-close" title="Close Chat" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Messages Area -->
        <div class="messages ssai-scroll" id="ssai-messages">
          
          <!-- Initial Welcome Message -->
          <div class="msg-row">
            <div class="msg-bot-avatar ${msgAvatarStyleClass}">
              ${botMsgAvatarContent}
            </div>
            <div class="bubble bot">
              ${parseMarkdown(botConfig.welcomeMessage)}
              <div class="msg-meta">
                <span class="msg-time">Just now</span>
                <div class="msg-actions">
                  <button class="msg-btn ssai-copy-btn" data-text="${escapeHtml(botConfig.welcomeMessage)}" title="Copy">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Dynamic Chat History -->
          ${messages
            .map(
              (m, idx) => `
            <div class="msg-row ${m.role === 'user' ? 'user' : ''}">
              ${
                m.role === 'assistant'
                  ? `
                <div class="msg-bot-avatar ${msgAvatarStyleClass}">
                  ${botMsgAvatarContent}
                </div>
              `
                  : ''
              }
              <div class="bubble ${m.role === 'user' ? 'user' : 'bot'} ${m.isError ? 'error' : ''}">
                ${m.role === 'assistant' ? parseMarkdown(m.content) : escapeHtml(m.content).replace(/\n/g, '<br/>')}
                <div class="msg-meta">
                  <span class="msg-time">${formatTime(m.timestamp)}</span>
                  ${
                    m.role === 'assistant' && !m.isError
                      ? `
                    <div class="msg-actions">
                      <button class="msg-btn ssai-copy-btn" data-text="${escapeHtml(m.content)}" title="Copy response">
                        ${
                          copiedMsgId === idx
                            ? `<svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`
                            : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`
                        }
                      </button>
                    </div>
                  `
                      : ''
                  }
                </div>
              </div>
            </div>
          `
            )
            .join('')}

          <!-- Typing Indicator -->
          ${
            isLoading
              ? `
            <div class="msg-row">
              <div class="msg-bot-avatar ${msgAvatarStyleClass}">
                ${botMsgAvatarContent}
              </div>
              <div class="bubble bot typing-box">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
              </div>
            </div>
          `
              : ''
          }
        </div>

        <!-- Suggestion Chips (Interactive Quick Prompts) -->
        ${
          hasSuggestions
            ? `
          <div class="suggestions-container ssai-scroll" id="ssai-suggestions">
            ${botConfig.suggestions
              .map(
                (s) => `
              <button class="suggestion-chip" data-prompt="${escapeHtml(s.prompt || s.label)}">
                <span>✦</span> ${escapeHtml(s.label)}
              </button>
            `
              )
              .join('')}
          </div>
        `
            : ''
        }

        <!-- Input Area -->
        <div class="input-wrapper">
          <input
            type="text"
            class="input-box"
            id="ssai-input"
            placeholder="Type a message..."
            autocomplete="off"
            spellcheck="false"
          />
          <button class="send-btn" id="ssai-send" ${isLoading ? 'disabled' : ''} aria-label="Send Message">
            <svg viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>

        <!-- Footer -->
        <div class="footer">
          <span>⚡</span> ${escapeHtml(botConfig.footerText || 'POWERED BY CHATIO BY ANZA')}
        </div>
      </div>
    `;

    // ── Event Handlers ────────────────────────────────────────────────────
    const fab = shadow.getElementById('ssai-fab');
    const closeBtn = shadow.getElementById('ssai-close');
    const clearBtn = shadow.getElementById('ssai-clear');
    const input = shadow.getElementById('ssai-input');
    const sendBtn = shadow.getElementById('ssai-send');

    fab.onclick = (e) => {
      e.stopPropagation();
      isOpen = !isOpen;
      render();
      if (isOpen) {
        setTimeout(() => {
          const inp = shadow.getElementById('ssai-input');
          if (inp) inp.focus();
        }, 150);
      }
    };

    closeBtn.onclick = (e) => {
      e.stopPropagation();
      isOpen = false;
      render();
    };

    if (clearBtn) {
      clearBtn.onclick = (e) => {
        e.stopPropagation();
        messages = [];
        render();
      };
    }

    // Suggestion chip clicks
    const chips = shadow.querySelectorAll('.suggestion-chip');
    chips.forEach((chip) => {
      chip.onclick = () => {
        const prompt = chip.getAttribute('data-prompt');
        if (prompt) sendMessage(prompt);
      };
    });

    // Copy buttons
    const copyBtns = shadow.querySelectorAll('.ssai-copy-btn');
    copyBtns.forEach((btn, idx) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const text = btn.getAttribute('data-text');
        if (navigator.clipboard && text) {
          navigator.clipboard.writeText(text).then(() => {
            copiedMsgId = idx;
            render();
            setTimeout(() => {
              copiedMsgId = null;
              render();
            }, 2000);
          });
        }
      };
    });

    const handleSend = () => {
      const text = input.value.trim();
      if (!text || isLoading) return;
      sendMessage(text);
    };

    sendBtn.onclick = handleSend;
    input.onkeydown = (e) => {
      if (e.key === 'Enter') handleSend();
    };

    const msgContainer = shadow.getElementById('ssai-messages');
    if (msgContainer) {
      msgContainer.scrollTop = msgContainer.scrollHeight;
    }
  }

  // ── Send Message Function ───────────────────────────────────────────────
  function sendMessage(text) {
    if (!text || isLoading) return;

    messages.push({
      role: 'user',
      content: text,
      timestamp: new Date(),
    });
    isLoading = true;
    render();

    fetch(CHAT_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        appId: appId,
      }),
    })
      .then((r) => {
        if (!r.ok) {
          return r.json().then((err) => {
            throw new Error(err.error || 'Server error');
          });
        }
        return r.json();
      })
      .then((data) => {
        isLoading = false;
        if (data.text) {
          messages.push({
            role: 'assistant',
            content: data.text,
            timestamp: new Date(),
          });
        } else {
          messages.push({
            role: 'assistant',
            content: data.error || 'An unexpected error occurred.',
            timestamp: new Date(),
            isError: true,
          });
        }
        render();
      })
      .catch((err) => {
        isLoading = false;
        messages.push({
          role: 'assistant',
          content: err.message || 'Connection error. Please try again.',
          timestamp: new Date(),
          isError: true,
        });
        render();
      });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  render();
})();

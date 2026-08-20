(()=>{(function(){if(window.__ChatioWidgetLoaded)return;window.__ChatioWidgetLoaded=!0;let k=window.location.origin,$="",y=document.currentScript||Array.from(document.querySelectorAll("script")).find(e=>e.src&&e.src.includes("widget.js"));if(y){$=y.getAttribute("data-app-id")||y.getAttribute("data-bot-id")||"";let e=y.getAttribute("data-host");if(e)k=e.replace(/\/$/,"");else if(y.src)try{k=new URL(y.src).origin}catch{}}window.__CHATIO_HOST__&&(k=window.__CHATIO_HOST__.replace(/\/$/,""));let P=`${k}/api/widget/config${$?"?appId="+encodeURIComponent($):""}${$?"&":"?"}_t=${Date.now()}`,N=`${k}/api/chat`,o={botName:"Chatio AI Assistant",primaryColor:"#6366f1",welcomeMessage:`Hello! I am Chatio AI assistant.

How can I assist you today?`,widgetTitle:"Chatio by Anza",widgetDescription:"Online \xB7 Powered by RAG",footerText:"POWERED BY CHATIO BY ANZA",avatarUrl:"",avatarBg:"transparent",position:"bottom-right",widgetWidth:"440px",widgetHeight:"640px",suggestions:[{label:"WordPress & Shopify Embed",prompt:"How do I embed my chatbot on WordPress or Shopify?"},{label:"Gemini \xD7 Groq Racing",prompt:"Explain how your Gemini and Groq dual engine speed racing works."},{label:"Step-by-Step Setup Guide",prompt:"Give me the step-by-step guide to set up my custom chatbot."},{label:"100% Free Custom Chatbot?",prompt:"Is Chatio by Anza 100% free and open-source?"}]},b=!1,h=[],m=!1,S=null;function I(e,t){if(!e||!e.startsWith("#"))return`rgba(99, 102, 241, ${t})`;let a=e.replace("#",""),i=99,p=102,s=241;return a.length===3?(i=parseInt(a[0]+a[0],16),p=parseInt(a[1]+a[1],16),s=parseInt(a[2]+a[2],16)):a.length===6&&(i=parseInt(a.substring(0,2),16),p=parseInt(a.substring(2,4),16),s=parseInt(a.substring(4,6),16)),isNaN(i)||isNaN(p)||isNaN(s)?`rgba(99, 102, 241, ${t})`:`rgba(${i}, ${p}, ${s}, ${t})`}function D(e,t){if(!e||!e.startsWith("#"))return e||"#4f46e5";let a=e.replace("#","");if(a.length===3&&(a=a[0]+a[0]+a[1]+a[1]+a[2]+a[2]),a.length!==6)return e;let i=parseInt(a.substring(0,2),16),p=parseInt(a.substring(2,4),16),s=parseInt(a.substring(4,6),16);if(isNaN(i)||isNaN(p)||isNaN(s))return e;i=Math.min(255,Math.max(0,i+t)),p=Math.min(255,Math.max(0,p+t)),s=Math.min(255,Math.max(0,s+t));let d=n=>n.toString(16).padStart(2,"0");return`#${d(i)}${d(p)}${d(s)}`}function W(e){try{return new Date(e).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:!0})}catch{return""}}function E(e){if(!e)return"";let t=String(e),a=[];t=t.replace(/```([\s\S]*?)```/g,function(s,d){let n=d.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");return a.push('<pre class="ssai-code-block"><code>'+n.trim()+"</code></pre>"),`___CODE_BLOCK_${a.length-1}___`}),t=t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),t=t.replace(/___CODE_BLOCK_(\d+)___/g,(s,d)=>a[Number(d)]||""),t=t.replace(/`([^`]+)`/g,'<code class="ssai-inline-code">$1</code>'),t=t.replace(/^---$/gim,'<hr class="ssai-hr"/>'),t=t.replace(/^\*\*\*$/gim,'<hr class="ssai-hr"/>');let i=/((?:^\|[^\n]+\|\r?\n)+)/gm;return t=t.replace(i,function(s){let d=s.trim().split(/\r?\n/).filter(w=>w.includes("|"));if(d.length<2)return s;let n='<div class="ssai-table-wrapper"><table class="ssai-table">',C=!1;return d.forEach((w,A)=>{if(/^\|?[\s:-]+(?:\|[\s:-]+)+\|?$/.test(w.trim()))return;let x=w.split("|").slice(1,-1).map(v=>v.trim());x.length!==0&&(A===0?(n+="<thead><tr>",x.forEach(v=>{n+=`<th class="ssai-th">${v}</th>`}),n+="</tr></thead>"):(C||(n+="<tbody>",C=!0),n+='<tr class="ssai-tr">',x.forEach(v=>{n+=`<td class="ssai-td">${v}</td>`}),n+="</tr>"))}),C&&(n+="</tbody>"),n+="</table></div>",n}),t=t.replace(/^### (.*$)/gim,'<h4 class="ssai-h4">$1</h4>'),t=t.replace(/^## (.*$)/gim,'<h3 class="ssai-h3">$1</h3>'),t=t.replace(/^# (.*$)/gim,'<h2 class="ssai-h2">$1</h2>'),t=t.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>"),t=t.replace(/__([^_]+)__/g,"<strong>$1</strong>"),t=t.replace(/\*([^*]+)\*/g,"<em>$1</em>"),t=t.replace(/_([^_]+)_/g,"<em>$1</em>"),t=t.replace(/^\> (.*$)/gim,'<blockquote class="ssai-quote">$1</blockquote>'),t=t.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer" class="ssai-link">$1</a>'),t=t.replace(/^\s*[-*•]\s+(.*)$/gim,'<li class="ssai-li">$1</li>'),t=t.replace(/(<li class="ssai-li">[\s\S]*?<\/li>\n?)+/gi,s=>`<ul class="ssai-ul">${s}</ul>`),t=t.replace(/^\s*\d+\.\s+(.*)$/gim,'<li class="ssai-oli">$1</li>'),t=t.replace(/(<li class="ssai-oli">[\s\S]*?<\/li>\n?)+/gi,s=>`<ol class="ssai-ol">${s}</ol>`),t=t.split(/(<div class="ssai-table-wrapper">[\s\S]*?<\/div>|<pre[\s\S]*?<\/pre>|<ul[\s\S]*?<\/ul>|<ol[\s\S]*?<\/ol>|<h[2-4][\s\S]*?<\/h[2-4]>|<hr[\s\S]*?\/>)/gi).map(s=>s?s.startsWith('<div class="ssai-table-wrapper"')||s.startsWith("<pre")||s.startsWith("<ul")||s.startsWith("<ol")||s.startsWith("<h")||s.startsWith("<hr")?s:s.replace(/\n\n+/g,'<div class="ssai-spacer"></div>').replace(/\n/g,"<br/>"):"").join(""),t}let B=document.createElement("div");B.id="chatio-ai-widget-host",document.body.appendChild(B);let c=B.attachShadow({mode:"open"}),L=document.createElement("style");L.textContent=`
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

    /* \u2500\u2500 Custom Scrollbar (Zero Ugly Browser Scrollbars) \u2500\u2500 */
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

    /* \u2500\u2500 Floating Action Button (FAB) \u2500\u2500 */
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

    /* \u2500\u2500 Main Chat Panel Window \u2500\u2500 */
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

    /* \u2500\u2500 Header \u2500\u2500 */
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

    /* \u2500\u2500 Messages Container \u2500\u2500 */
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

    /* \u2500\u2500 Rich Markdown Typography \u2500\u2500 */
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

    /* \u2500\u2500 Table Styling (Luxury Glassmorphic Data Tables) \u2500\u2500 */
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

    /* \u2500\u2500 Meta & Message Actions \u2500\u2500 */
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

    /* \u2500\u2500 Quick Suggestions Bar \u2500\u2500 */
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

    /* \u2500\u2500 Typing Indicator \u2500\u2500 */
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

    /* \u2500\u2500 Input Area \u2500\u2500 */
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

    /* \u2500\u2500 Footer \u2500\u2500 */
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

    /* \u2500\u2500 Mobile Responsive \u2500\u2500 */
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
  `,c.appendChild(L);let g=document.createElement("div");g.className="chatio-widget-root",c.appendChild(g),document.addEventListener("mousedown",e=>{b&&!B.contains(e.target)&&(b=!1,l())}),document.addEventListener("keydown",e=>{e.key==="Escape"&&b&&(b=!1,l())}),fetch(P).then(e=>e.json()).then(e=>{o={...o,...e},l()}).catch(()=>{l()});function l(){let e=o.position==="bottom-left",t=o.avatarBg==="theme"?"avatar-style-theme":"avatar-style-transparent",a=!!(o.avatarUrl&&o.avatarUrl.trim()),i=o.primaryColor||"#6366f1",p=D(i,-25),s=I(i,.45),d=I(i,.28),n=I(i,.35);g.style.setProperty("--primary-color",i),g.style.setProperty("--primary-dark",p),g.style.setProperty("--primary-glow",s),g.style.setProperty("--primary-glow-light",d),g.style.setProperty("--primary-glow-focus",n),g.style.setProperty("--widget-w",o.widgetWidth||"440px"),g.style.setProperty("--widget-h",o.widgetHeight||"640px");let C=Array.isArray(o.suggestions)&&o.suggestions.length>0&&h.length===0,w=a?`<img src="${o.avatarUrl}" class="fab-avatar-img" alt="Chat" />`:'<svg viewBox="0 0 24 24"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/></svg>',A=a?`<img src="${o.avatarUrl}" class="avatar-box-img" alt="Logo" />`:"<span>\u2728</span>",x=a?`<img src="${o.avatarUrl}" class="msg-bot-avatar-img" alt="Bot" />`:'<svg viewBox="0 0 24 24"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/></svg>',v=a?t:"avatar-style-theme",G=a?t:"avatar-style-theme",_=a?t:"avatar-style-theme";g.innerHTML=`
      <!-- FAB Toggle Button -->
      <button class="fab ${e?"left":""} ${v}" id="ssai-fab" aria-label="Open AI Chat">
        ${w}
        <span class="fab-dot"></span>
      </button>

      <!-- Main Panel -->
      <div class="panel ${e?"left":""} ${b?"open":""}" id="ssai-panel">
        
        <!-- Header -->
        <div class="header">
          <div class="header-left">
            <div class="avatar-box ${G}">
              ${A}
              <span class="status-badge"></span>
            </div>
            <div>
              <div class="title">${u(o.botName||"Chatio Assistant")}</div>
              <div class="subtitle">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="#22c55e"><circle cx="4" cy="4" r="4"/></svg>
                ${u(o.widgetDescription||"Online \xB7 Powered by AI")}
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
            <div class="msg-bot-avatar ${_}">
              ${x}
            </div>
            <div class="bubble bot">
              ${E(o.welcomeMessage)}
              <div class="msg-meta">
                <span class="msg-time">Just now</span>
                <div class="msg-actions">
                  <button class="msg-btn ssai-copy-btn" data-text="${u(o.welcomeMessage)}" title="Copy">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Dynamic Chat History -->
          ${h.map((r,f)=>`
            <div class="msg-row ${r.role==="user"?"user":""}">
              ${r.role==="assistant"?`
                <div class="msg-bot-avatar ${_}">
                  ${x}
                </div>
              `:""}
              <div class="bubble ${r.role==="user"?"user":"bot"} ${r.isError?"error":""}">
                ${r.role==="assistant"?E(r.content):u(r.content).replace(/\n/g,"<br/>")}
                <div class="msg-meta">
                  <span class="msg-time">${W(r.timestamp)}</span>
                  ${r.role==="assistant"&&!r.isError?`
                    <div class="msg-actions">
                      <button class="msg-btn ssai-copy-btn" data-text="${u(r.content)}" title="Copy response">
                        ${S===f?'<svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'}
                      </button>
                    </div>
                  `:""}
                </div>
              </div>
            </div>
          `).join("")}

          <!-- Typing Indicator -->
          ${m?`
            <div class="msg-row">
              <div class="msg-bot-avatar ${_}">
                ${x}
              </div>
              <div class="bubble bot typing-box">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
              </div>
            </div>
          `:""}
        </div>

        <!-- Suggestion Chips (Interactive Quick Prompts) -->
        ${C?`
          <div class="suggestions-container ssai-scroll" id="ssai-suggestions">
            ${o.suggestions.map(r=>`
              <button class="suggestion-chip" data-prompt="${u(r.prompt||r.label)}">
                <span>\u2726</span> ${u(r.label)}
              </button>
            `).join("")}
          </div>
        `:""}

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
          <button class="send-btn" id="ssai-send" ${m?"disabled":""} aria-label="Send Message">
            <svg viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>

        <!-- Footer -->
        <div class="footer">
          <span>\u26A1</span> ${u(o.footerText||"POWERED BY CHATIO BY ANZA")}
        </div>
      </div>
    `;let F=c.getElementById("ssai-fab"),R=c.getElementById("ssai-close"),z=c.getElementById("ssai-clear"),j=c.getElementById("ssai-input"),U=c.getElementById("ssai-send");F.onclick=r=>{r.stopPropagation(),b=!b,l(),b&&setTimeout(()=>{let f=c.getElementById("ssai-input");f&&f.focus()},150)},R.onclick=r=>{r.stopPropagation(),b=!1,l()},z&&(z.onclick=r=>{r.stopPropagation(),h=[],l()}),c.querySelectorAll(".suggestion-chip").forEach(r=>{r.onclick=()=>{let f=r.getAttribute("data-prompt");f&&T(f)}}),c.querySelectorAll(".ssai-copy-btn").forEach((r,f)=>{r.onclick=q=>{q.stopPropagation();let O=r.getAttribute("data-text");navigator.clipboard&&O&&navigator.clipboard.writeText(O).then(()=>{S=f,l(),setTimeout(()=>{S=null,l()},2e3)})}});let H=()=>{let r=j.value.trim();!r||m||T(r)};U.onclick=H,j.onkeydown=r=>{r.key==="Enter"&&H()};let M=c.getElementById("ssai-messages");M&&(M.scrollTop=M.scrollHeight)}function T(e){!e||m||(h.push({role:"user",content:e,timestamp:new Date}),m=!0,l(),fetch(N,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:h.map(t=>({role:t.role,content:t.content})),appId:$})}).then(t=>t.ok?t.json():t.json().then(a=>{throw new Error(a.error||"Server error")})).then(t=>{m=!1,t.text?h.push({role:"assistant",content:t.text,timestamp:new Date}):h.push({role:"assistant",content:t.error||"An unexpected error occurred.",timestamp:new Date,isError:!0}),l()}).catch(t=>{m=!1,h.push({role:"assistant",content:t.message||"Connection error. Please try again.",timestamp:new Date,isError:!0}),l()}))}function u(e){return e?String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}l()})();})();

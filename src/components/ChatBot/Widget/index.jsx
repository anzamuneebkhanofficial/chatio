'use client';

/**
 * ChatWidget — Reusable AI Chatbot Component
 *
 * Drop-in chatbot widget for any Next.js website.
 * Self-contained: zero external dependencies beyond Next.js/React.
 *
 * FEATURES:
 *   Smart Switch Mode  — Gemini vs Groq race, first wins
 *   Knowledge base     — reads website-specific data from .md / .json / URL
 *   Session memory     — full chat history sent with each message
 *   Voice input        — Web Speech API (browser native)
 *   Text-to-speech     — speechSynthesis API (browser native)
 *   Provider badge     — shows which AI answered
 *   File import panel  — train with any file or URL (built-in)
 *   Responsive         — works on all screen sizes
 *
 * HOW TO REUSE IN ANY PROJECT:
 *   1. Copy the entire ChatBot/ folder to your components/
 *   2. Copy src/app/api/chat/route.js → your app/api/chat/
 *   3. Copy src/app/api/train/route.js → your app/api/train/
 *   4. Set GROQ_API_KEY + GEMINI_API_KEY in .env.local
 *   5. Set KNOWLEDGE_MD_PATH pointing to your .md file
 *   7. <ChatWidget botName="Your Bot" /> — done!
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './ChatWidget.module.css';

// ─── Inline SVG Icons (zero icon library dependency) ─────────────────────────

const Ico = {
  Chat: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Close: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Send: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  Mic: ({ on }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={on ? '#ef4444' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  ),
  Volume: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  ),
  Stop: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Bot: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      <circle cx="9" cy="16" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="16" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  Upload: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  Link: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

// ─── Text Renderer (converts plain AI text to clean HTML) ─────────────────────
// Handles numbered lists, line breaks, and Source: URL → clickable link.

function renderText(text) {
  if (!text) return '';

  const lines = text.split('\n');
  let html = '';
  let inNumberedList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      if (inNumberedList) { html += '</ol>'; inNumberedList = false; }
      html += '<br>';
      continue;
    }

    // Source: URL line — render as clickable link that opens in new tab
    const sourceMatch = trimmed.match(/^Source:\s*(https?:\/\/\S+)$/i);
    if (sourceMatch) {
      if (inNumberedList) { html += '</ol>'; inNumberedList = false; }
      const url = sourceMatch[1];
      html += `<p class="source-line">📄 <strong>Source:</strong> <a href="${url}" target="_blank" rel="noopener noreferrer" class="source-link">${url}</a></p>`;
      continue;
    }

    // Numbered list: "1. Item" or "1) Item"
    const numberedMatch = trimmed.match(/^(\d+)[.)]\s+(.+)/);
    if (numberedMatch) {
      if (!inNumberedList) { html += '<ol>'; inNumberedList = true; }
      html += `<li>${escapeHtml(numberedMatch[2])}</li>`;
      continue;
    }

    if (inNumberedList) { html += '</ol>'; inNumberedList = false; }

    // "First:" / "Second:" / "Third:" labels
    const labelMatch = trimmed.match(/^(First|Second|Third|Fourth|Fifth|Finally|Note|Important):\s*(.+)/i);
    if (labelMatch) {
      html += `<p><strong>${labelMatch[1]}:</strong> ${escapeHtml(labelMatch[2])}</p>`;
      continue;
    }

    html += `<p>${escapeHtml(trimmed)}</p>`;
  }

  if (inNumberedList) html += '</ol>';
  return html;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Format timestamp safely (client-only) ────────────────────────────────────

function formatTime(date) {
  if (!date) return '';
  try {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return '';
  }
}

// ─── Initial state factories ──────────────────────────────────────────────────

function makeWelcome(botName) {
  return {
    id: 'init',
    role: 'assistant',
    content: `Hello! I am ${botName}.\n\nI am trained to answer questions about this website. How can I help you today?`,
    timestamp: null,
    provider: null,
  };
}

function makeMsg(role, content, provider = null) {
  return { id: `${role}-${Date.now()}-${Math.random()}`, role, content, timestamp: new Date(), provider };
}

// ─── ChatWidget Component ─────────────────────────────────────────────────────

export default function ChatWidget({
  botName = 'AI Assistant',
  apiEndpoint = '/api/chat',
  trainEndpoint = '/api/train',
}) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => [makeWelcome(botName)]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [newMsgAlert, setNewMsgAlert] = useState(false);
  const [isQueued, setIsQueued] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  // ── Effects ─────────────────────────────────────────────────────────────────

  // Fix hydration — run only on client
  useEffect(() => {
    setHasMounted(true);
    setMessages((prev) =>
      prev.map((m) => (m.id === 'init' && !m.timestamp ? { ...m, timestamp: new Date() } : m))
    );
  }, []);

  // Auto-scroll messages
  useEffect(() => {
    if (isOpen) {
      // Use requestAnimationFrame for smoother scrolling without layout thrashing
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setNewMsgAlert(false);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  // Auto-grow textarea
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto'; // Reset height to calculate new height
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`; // Max height 120px
  }, [input]);

  // ── Send Message ────────────────────────────────────────────────────────────

  const sendMessage = useCallback(async (textOverride) => {
    const text = (textOverride ?? input).trim();
    if (!text) return;
    
    // Prevent overlapping sends; just queue the UI interaction
    if (isLoading) {
      setIsQueued(true);
      setTimeout(() => setIsQueued(false), 500);
      return;
    }

    const userMsg = makeMsg('user', text);
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setIsLoading(true);

    const payload = history.map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payload }),
      });

      const data = await res.json();

      if (!res.ok || data.error) throw new Error(data.error ?? `Server error ${res.status}`);

      const botMsg = makeMsg('assistant', data.text || 'No response received.', data.provider);
      setMessages((prev) => [...prev, botMsg]);
      if (!isOpen) setNewMsgAlert(true);
    } catch (err) {
      const errMsg = makeMsg('assistant', `⚠️ ${err.message}`, null);
      errMsg.isError = true;
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, isOpen, apiEndpoint]);

  // ── Voice Input ─────────────────────────────────────────────────────────────

  const toggleVoice = useCallback(() => {
    const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) { alert('Voice input is not supported in this browser.'); return; }

    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }

    const rec = new SR();
    recognitionRef.current = rec;
    rec.lang = 'en-US';
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    rec.onresult = (e) => setInput((prev) => (prev ? `${prev} ${e.results[0][0].transcript}` : e.results[0][0].transcript));
    rec.start();
  }, [isListening]);

  // ── Text-to-Speech ──────────────────────────────────────────────────────────

  const speak = useCallback((text) => {
    if (!('speechSynthesis' in window)) return;
    if (window.speechSynthesis.speaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); return; }
    const utter = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const best = voices.find((v) => v.name.includes('Google') || v.name.includes('Samantha'));
    if (best) utter.voice = best;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
  }, []);

  // ── Clear Chat ──────────────────────────────────────────────────────────────

  const clearChat = useCallback(() => {
    setMessages([{ ...makeWelcome(botName), timestamp: new Date() }]);
  }, [botName]);

  // ── Keyboard ────────────────────────────────────────────────────────────────

  const onKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }, [sendMessage]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className={styles.root}>

      {/* ── FAB Toggle Button ── */}
      <button
        id="chatwidget-open-btn"
        className={`${styles.fab} ${isOpen ? styles.fabHidden : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Chat"
        title="Chat with AI"
      >
        <Ico.Chat />
        {newMsgAlert && <span className={styles.alertDot} />}
      </button>

      {/* ── Chat Panel ── */}
      <div
        className={`${styles.panel} ${isOpen ? styles.panelVisible : styles.panelHidden}`}
        role="dialog"
        aria-modal="true"
        aria-label="AI Chat"
      >

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <div className={styles.avatarWrap}>
              <span className={styles.avatar}><Ico.Bot /></span>
              <span className={styles.onlineDot} />
            </div>
            <div>
              <p className={styles.botName}>{botName}</p>
              <p className={styles.botMeta}>
                <span className={styles.pulseDot} />
                Online · Smart Switch AI
              </p>
            </div>
          </div>
          <div className={styles.headerBtns}>
            <button className={styles.hBtn} onClick={clearChat} title="Clear chat">
              <Ico.Trash />
            </button>
            <button className={styles.hBtn} onClick={() => setIsOpen(false)} title="Close">
              <Ico.Close />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className={styles.messages} id="chatwidget-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`${styles.row} ${msg.role === 'user' ? styles.rowUser : styles.rowBot}`}>

              {msg.role === 'assistant' && (
                <div className={styles.msgAvatar}><Ico.Bot /></div>
              )}

              <div className={`${styles.bubble} ${msg.role === 'user' ? styles.bubbleUser : styles.bubbleBot} ${msg.isError ? styles.bubbleError : ''}`}>
                {msg.role === 'assistant' ? (
                  <div
                    className={styles.bubbleHtml}
                    dangerouslySetInnerHTML={{ __html: renderText(msg.content) }}
                  />
                ) : (
                  <p className={styles.bubblePlain}>{msg.content}</p>
                )}

                <div className={styles.msgMeta}>
                  <span className={styles.metaTime} suppressHydrationWarning>
                    {hasMounted ? formatTime(msg.timestamp) : ''}
                  </span>
                  {msg.provider && (
                    <span className={styles.providerTag}>
                      {msg.provider === 'groq' ? '⚡ Groq' : '✨ Gemini'}
                    </span>
                  )}
                  {msg.role === 'assistant' && !msg.isError && (
                    <button className={styles.ttsBtn} onClick={() => speak(msg.content)} title="Read aloud">
                      {isSpeaking ? <Ico.Stop /> : <Ico.Volume />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className={`${styles.row} ${styles.rowBot}`}>
              <div className={styles.msgAvatar}><Ico.Bot /></div>
              <div className={`${styles.bubble} ${styles.bubbleBot} ${styles.typing}`}>
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className={styles.inputArea}>
          <div className={`${styles.inputBox} ${isLoading ? styles.inputDisabled : ''}`}>
            <textarea
              ref={inputRef}
              id="chatwidget-input"
              className={styles.textarea}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={isListening ? 'Listening...' : 'Type your message...'}
              disabled={isLoading}
              aria-label="Message input"
              style={{ overflowY: input.split('\n').length > 5 || (inputRef.current && inputRef.current.scrollHeight > 120) ? 'auto' : 'hidden' }}
            />
            <div className={styles.inputActions}>
              <button
                className={`${styles.iBtn} ${isListening ? styles.iBtnMic : ''}`}
                onClick={toggleVoice}
                title={isListening ? 'Stop listening' : 'Voice input'}
              >
                <Ico.Mic on={isListening} />
              </button>
              <button
                id="chatwidget-send-btn"
                className={`${styles.sendBtn} ${isQueued ? styles.sendBtnQueued : ''}`}
                onClick={() => sendMessage()}
                disabled={!input.trim()}
                aria-label="Send"
              >
                <Ico.Send />
              </button>
            </div>
          </div>
          <p className={styles.inputHint}>Powered by Smart Switch AI · Enter to send</p>
        </div>
      </div>
    </div>
  );
}

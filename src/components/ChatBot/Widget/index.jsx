'use client';

/**
 * ChatWidget — High-Performance, Ultra-Responsive AI Chatbot Component
 *
 * Designed for Muhammad Anza Muneeb Khan AI Assistant.
 * Features:
 *   - Gold/Yellow Aesthetics matching UI design
 *   - Guardrail verification (Portfolio scope protection)
 *   - Resilient multi-layer error handling (429, 500, network loss)
 *   - Zero-lag input state updates
 *   - Smart auto-scroll without scroll lock
 *   - Quick-action suggestion chips
 *   - Feedback buttons (Thumbs Up / Down / TTS)
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './ChatWidget.module.css';
import { checkGuardrails } from '../lib/guardrails';

// ─── Inline SVG Icons ────────────────────────────────────────────────────────

const Ico = {
  Chat: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Sparkle: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  ),
  Close: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Send: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  ),
  Mic: ({ on }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={on ? '#ef4444' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  ),
  Volume: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  ),
  Stop: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  ),
  Trash: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  ThumbUp: ({ active }) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  ),
  ThumbDown: ({ active }) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
    </svg>
  ),
};

// ─── Text Renderer ────────────────────────────────────────────────────────────

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

    // Source citation line
    const sourceMatch = trimmed.match(/^Source:\s*(https?:\/\/\S+)$/i);
    if (sourceMatch) {
      if (inNumberedList) { html += '</ol>'; inNumberedList = false; }
      const url = sourceMatch[1];
      html += `<p class="source-line">📄 <strong>Source:</strong> <a href="${url}" target="_blank" rel="noopener noreferrer" class="source-link">${url}</a></p>`;
      continue;
    }

    // Numbered list items
    const numberedMatch = trimmed.match(/^(\d+)[.)]\s+(.+)/);
    if (numberedMatch) {
      if (!inNumberedList) { html += '<ol>'; inNumberedList = true; }
      html += `<li>${formatInline(numberedMatch[2])}</li>`;
      continue;
    }

    if (inNumberedList) { html += '</ol>'; inNumberedList = false; }

    // Bullet points
    const bulletMatch = trimmed.match(/^[-•*]\s+(.+)/);
    if (bulletMatch) {
      html += `<p style="margin-left: 12px;">• ${formatInline(bulletMatch[1])}</p>`;
      continue;
    }

    // Labels / Headings
    const labelMatch = trimmed.match(/^(First|Second|Third|Fourth|Fifth|Finally|Note|Important|Scope Notice|Topics I can help you with):\s*(.*)/i);
    if (labelMatch) {
      html += `<p><strong>${labelMatch[1]}:</strong> ${formatInline(labelMatch[2])}</p>`;
      continue;
    }

    html += `<p>${formatInline(trimmed)}</p>`;
  }

  if (inNumberedList) html += '</ol>';
  return html;
}

function formatInline(str) {
  let escaped = escapeHtml(str);
  // Bold formatting **text** -> <strong>text</strong>
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  return escaped;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

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
    content: `Hello! I am ${botName}.\n\nI can help answer questions about Muhammad Anza Muneeb Khan's skills, software engineering projects, AI RAG solutions, video courses, services, and booking consultations. How can I assist you today?`,
    timestamp: null,
    provider: null,
  };
}

function makeMsg(role, content, provider = null) {
  return {
    id: `${role}-${Date.now()}-${Math.random()}`,
    role,
    content,
    timestamp: new Date(),
    provider,
    liked: false,
    disliked: false,
  };
}

const SUGGESTIONS = [
  { label: '🚀 Featured Projects', prompt: "What are Muhammad Anza Muneeb Khan's featured software engineering projects?" },
  { label: '💻 AI & Web Services', prompt: 'What AI & Web services do you provide?' },
  { label: '🧠 Tech Stack & Skills', prompt: 'What is your tech stack & core skills?' },
  { label: '📅 Book a Consultation', prompt: 'How can I book a consultation with Anza?' },
];

// ─── ChatWidget Component ─────────────────────────────────────────────────────

export default function ChatWidget({
  botName = 'Muhammad Anza Muneeb Khan AI Assistant',
  apiEndpoint = '/api/chat',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => [makeWelcome(botName)]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [newMsgAlert, setNewMsgAlert] = useState(false);
  const [isQueued, setIsQueued] = useState(false);

  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Client hydration check
  useEffect(() => {
    setHasMounted(true);
    setMessages((prev) =>
      prev.map((m) => (m.id === 'init' && !m.timestamp ? { ...m, timestamp: new Date() } : m))
    );
  }, []);

  // Smart Auto-Scroll: scroll down only if user is near bottom or sending message
  const scrollToBottom = useCallback((force = false) => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 140;

    if (force || isNearBottom) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen, scrollToBottom]);

  // Focus input when widget opens
  useEffect(() => {
    if (isOpen) {
      setNewMsgAlert(false);
      setTimeout(() => inputRef.current?.focus(), 180);
    }
  }, [isOpen]);

  // Auto-grow textarea without layout thrashing
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input]);

  // ── Send Message Logic ──────────────────────────────────────────────────────

  const sendMessage = useCallback(async (textOverride) => {
    const text = (textOverride ?? input).trim();
    if (!text) return;

    if (isLoading) {
      setIsQueued(true);
      setTimeout(() => setIsQueued(false), 400);
      return;
    }

    const userMsg = makeMsg('user', text);
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setIsLoading(true);
    scrollToBottom(true);

    // High-Level Guardrails Validation
    const guardrail = checkGuardrails(text);
    if (guardrail.isOffTopic) {
      setTimeout(() => {
        const warningMsg = makeMsg('assistant', guardrail.warningResponse, 'Guardrail');
        setMessages((prev) => [...prev, warningMsg]);
        setIsLoading(false);
        if (!isOpen) setNewMsgAlert(true);
      }, 300);
      return;
    }

    const payload = history.map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payload }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        let userFacingError = 'An error occurred while getting the response.';
        if (res.status === 429) {
          userFacingError = '⚠️ Rate Limit Reached: You are sending messages too quickly. Please wait 60 seconds before sending more.';
        } else if (res.status === 500) {
          userFacingError = data?.error || '⚠️ Server Error: The AI service encountered an issue. Please try again shortly.';
        } else if (data?.error) {
          userFacingError = `⚠️ ${data.error}`;
        }

        const errorMsg = makeMsg('assistant', userFacingError, null);
        errorMsg.isError = true;
        setMessages((prev) => [...prev, errorMsg]);
        return;
      }

      if (!data || (!data.text && !data.error)) {
        throw new Error('Invalid response payload received from server.');
      }

      if (data.error) {
        const errorMsg = makeMsg('assistant', `⚠️ ${data.error}`, null);
        errorMsg.isError = true;
        setMessages((prev) => [...prev, errorMsg]);
        return;
      }

      const botMsg = makeMsg('assistant', data.text, data.provider);
      setMessages((prev) => [...prev, botMsg]);
      if (!isOpen) setNewMsgAlert(true);
    } catch (err) {
      console.error('[ChatWidget] Error sending message:', err);
      let networkError = '⚠️ Network Error: Unable to connect to the AI server. Please check your internet connection and try again.';
      if (err.message && !err.message.includes('object')) {
        networkError = `⚠️ ${err.message}`;
      }
      const errMsg = makeMsg('assistant', networkError, null);
      errMsg.isError = true;
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, isOpen, apiEndpoint, scrollToBottom]);

  // ── Voice Input ─────────────────────────────────────────────────────────────

  const toggleVoice = useCallback(() => {
    const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) {
      alert('Voice input is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const rec = new SR();
    recognitionRef.current = rec;
    rec.lang = 'en-US';
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    rec.start();
  }, [isListening]);

  // ── Text-to-Speech ──────────────────────────────────────────────────────────

  const speak = useCallback((text) => {
    if (!('speechSynthesis' in window)) return;
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const cleanText = text.replace(/<[^>]*>/g, '').replace(/[*#]/g, '');
    const utter = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices();
    const best = voices.find((v) => v.name.includes('Google') || v.name.includes('Samantha') || v.lang.startsWith('en'));
    if (best) utter.voice = best;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
  }, []);

  // ── Feedback Handlers ───────────────────────────────────────────────────────

  const toggleLike = useCallback((msgId, type) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId) return m;
        if (type === 'like') {
          return { ...m, liked: !m.liked, disliked: false };
        } else {
          return { ...m, disliked: !m.disliked, liked: false };
        }
      })
    );
  }, []);

  // ── Clear Chat ──────────────────────────────────────────────────────────────

  const clearChat = useCallback(() => {
    setMessages([{ ...makeWelcome(botName), timestamp: new Date() }]);
  }, [botName]);

  // ── Keyboard handling ───────────────────────────────────────────────────────

  const onKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className={styles.root}>
      {/* ── FAB Toggle Button ── */}
      <button
        id="chatwidget-open-btn"
        className={`${styles.fab} ${isOpen ? styles.fabHidden : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Chat"
        title="Chat with Muhammad Anza Muneeb Khan AI Assistant"
      >
        <Ico.Sparkle />
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
              <span className={styles.avatar}><Ico.Sparkle /></span>
              <span className={styles.onlineDot} />
            </div>
            <div>
              <p className={styles.botName}>{botName}</p>
              <p className={styles.botMeta}>
                <span className={styles.pulseDot} />
                Online · Muhammad Anza Muneeb Khan AI Assistant
              </p>
            </div>
          </div>
          <div className={styles.headerBtns}>
            <button className={styles.hBtn} onClick={clearChat} title="Clear chat history">
              <Ico.Trash />
            </button>
            <button className={styles.hBtn} onClick={() => setIsOpen(false)} title="Close chat window">
              <Ico.Close />
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className={styles.messages} id="chatwidget-messages" ref={messagesContainerRef}>
          {messages.map((msg) => (
            <div key={msg.id} className={`${styles.row} ${msg.role === 'user' ? styles.rowUser : styles.rowBot}`}>
              {msg.role === 'assistant' && (
                <div className={styles.msgAvatar}><Ico.Sparkle /></div>
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

                  {msg.role === 'assistant' && !msg.isError && (
                    <div className={styles.actionGroup}>
                      <button
                        className={`${styles.actionBtn} ${msg.liked ? styles.actionBtnActive : ''}`}
                        onClick={() => toggleLike(msg.id, 'like')}
                        title="Helpful response"
                      >
                        <Ico.ThumbUp active={msg.liked} />
                      </button>
                      <button
                        className={`${styles.actionBtn} ${msg.disliked ? styles.actionBtnActive : ''}`}
                        onClick={() => toggleLike(msg.id, 'dislike')}
                        title="Not helpful"
                      >
                        <Ico.ThumbDown active={msg.disliked} />
                      </button>
                      <button
                        className={styles.actionBtn}
                        onClick={() => speak(msg.content)}
                        title="Read aloud"
                      >
                        {isSpeaking ? <Ico.Stop /> : <Ico.Volume />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className={`${styles.row} ${styles.rowBot}`}>
              <div className={styles.msgAvatar}><Ico.Sparkle /></div>
              <div className={`${styles.bubble} ${styles.bubbleBot} ${styles.typing}`}>
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className={styles.chipsContainer}>
          {SUGGESTIONS.map((chip, idx) => (
            <button
              key={idx}
              className={styles.chipBtn}
              onClick={() => sendMessage(chip.prompt)}
              disabled={isLoading}
            >
              {chip.label}
            </button>
          ))}
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
              placeholder={isListening ? 'Listening...' : "Ask anything about Muhammad Anza Muneeb Khan's..."}
              disabled={isLoading}
              aria-label="Message input"
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
                aria-label="Send Message"
              >
                <Ico.Send />
              </button>
            </div>
          </div>
          <p className={styles.inputHint}>POWERED BY MUHAMMAD ANZA MUNEEB KHAN · ENTER TO SEND</p>
        </div>
      </div>
    </div>
  );
}

'use client';

/**
 * ChatWidget — High-Performance, Ultra-Responsive AI Chatbot Component
 *
 * Fully optimized with React.memo, isolated message rendering (zero Markdown
 * re-parsing on keystrokes), anti-extension interference tags (Grammarly/Spellcheck),
 * and synchronous DOM auto-grow to deliver 60fps instant, lag-free typing.
 */

import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import axios from 'axios';
import styles from './ChatWidget.module.css';
import { checkGuardrails } from '../lib/guardrails';
import { DEMO_PRESETS, CHATIO_DEFAULT_PRESET } from '../lib/demoPresets';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Volume2,
  Square,
  ThumbsUp,
  ThumbsDown,
  X,
  Copy,
  Check,
  Rocket,
  Brain,
  Settings,
  Zap,
  RotateCcw,
  UtensilsCrossed,
  ShoppingBag,
  Stethoscope,
  Palette,
} from 'lucide-react';

function formatTime(date) {
  if (!date) return '';
  try {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return '';
  }
}

// ─── Initial state factories ──────────────────────────────────────────────────

function makeWelcome(botName, customWelcome = null) {
  return {
    id: 'init',
    role: 'assistant',
    content: customWelcome || `Hello! I am ${botName || 'Chatio AI assistant'}.\n\nHow can I assist you today?`,
    timestamp: new Date(),
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

// ─── Memoized Single Message Item (Zero Markdown Re-rendering on Typing) ────────

const MessageItem = memo(function MessageItem({
  msg,
  hasMounted,
  isSpeaking,
  copiedId,
  onToggleLike,
  onCopy,
  onSpeak,
}) {
  return (
    <div className={`${styles.row} ${msg.role === 'user' ? styles.rowUser : styles.rowBot}`}>
      {msg.role === 'assistant' && (
        <div className={styles.msgAvatar}>
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      )}

      <div className={`${styles.bubble} ${msg.role === 'user' ? styles.bubbleUser : styles.bubbleBot} ${msg.isError ? styles.bubbleError : ''}`}>
        {msg.role === 'assistant' ? (
          <div className={styles.bubbleHtml}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {msg.content}
            </ReactMarkdown>
          </div>
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
                onClick={() => onToggleLike(msg.id, 'like')}
                title="Helpful response"
                aria-label="Helpful response"
              >
                <ThumbsUp className={`w-3 h-3 ${msg.liked ? 'fill-current text-indigo-400' : ''}`} />
              </button>
              <button
                className={`${styles.actionBtn} ${msg.disliked ? styles.actionBtnActive : ''}`}
                onClick={() => onToggleLike(msg.id, 'dislike')}
                title="Not helpful"
                aria-label="Not helpful"
              >
                <ThumbsDown className={`w-3 h-3 ${msg.disliked ? 'fill-current text-red-400' : ''}`} />
              </button>
              <button
                className={styles.actionBtn}
                onClick={() => onCopy(msg.id, msg.content)}
                title="Copy message"
                aria-label="Copy message"
              >
                {copiedId === msg.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
              </button>
              <button
                className={styles.actionBtn}
                onClick={() => onSpeak(msg.content)}
                title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
                aria-label={isSpeaking ? 'Stop speaking' : 'Read aloud'}
              >
                {isSpeaking ? <Square className="w-3 h-3 text-red-400" /> : <Volume2 className="w-3 h-3" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// ─── Memoized Messages Thread ─────────────────────────────────────────────────

const MessageList = memo(function MessageList({
  messages,
  isLoading,
  hasMounted,
  isSpeaking,
  copiedId,
  onToggleLike,
  onCopy,
  onSpeak,
  messagesEndRef,
}) {
  return (
    <>
      {messages.map((msg) => (
        <MessageItem
          key={msg.id}
          msg={msg}
          hasMounted={hasMounted}
          isSpeaking={isSpeaking}
          copiedId={copiedId}
          onToggleLike={onToggleLike}
          onCopy={onCopy}
          onSpeak={onSpeak}
        />
      ))}

      {isLoading && (
        <div className={`${styles.row} ${styles.rowBot}`}>
          <div className={styles.msgAvatar}><Sparkles className="w-3.5 h-3.5" /></div>
          <div className={`${styles.bubble} ${styles.bubbleBot} ${styles.typing}`}>
            <span /><span /><span />
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </>
  );
});

// ─── Memoized Fast Chat Input Box (React Hook Form Uncontrolled) ─────────────

const ChatInputArea = memo(function ChatInputArea({
  onSendMessage,
  isLoading,
  isListening,
  onToggleVoice,
  activeDemo,
  currentFooter,
}) {
  const { register, handleSubmit, reset } = useForm();
  const textareaRef = useRef(null);
  const { ref: formRef, ...restRegister } = register('message', { required: true });

  const onSubmit = (data) => {
    const text = data.message?.trim();
    if (!text || isLoading) return;
    onSendMessage(text);
    reset({ message: '' });
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  const handleInput = (e) => {
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 90)}px`;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.inputArea}>
      <div className={`${styles.inputBox} ${isLoading ? styles.inputDisabled : ''}`}>
        <textarea
          ref={(e) => {
            formRef(e);
            textareaRef.current = e;
          }}
          id="chatwidget-input"
          className={styles.textarea}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={isListening ? 'Listening...' : (activeDemo ? `Ask about ${activeDemo.label}...` : "Ask anything about Chatio...")}
          disabled={isLoading}
          aria-label="Message input"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          data-gramm="false"
          data-gramm_editor="false"
          data-enable-grammarly="false"
          {...restRegister}
        />
        <div className={styles.inputActions}>
          <button
            className={`${styles.iBtn} ${isListening ? styles.iBtnMic : ''}`}
            onClick={onToggleVoice}
            title={isListening ? 'Stop listening' : 'Voice input'}
            aria-label={isListening ? 'Stop listening' : 'Voice input'}
            type="button"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <button
            id="chatwidget-send-btn"
            className={styles.sendBtn}
            type="submit"
            disabled={isLoading}
            aria-label="Send Message"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className={styles.inputHint}>
        {activeDemo ? `DEMO MODE · ${currentFooter}` : `${currentFooter} · ENTER TO SEND`}
      </p>
    </form>
  );
});

// ─── ChatWidget Main Component ────────────────────────────────────────────────

export default function ChatWidget({
  botName: propBotName,
  apiEndpoint = '/api/chat',
}) {
  const [remoteConfig, setRemoteConfig] = useState(null);
  const [activeDemo, setActiveDemo] = useState(null);

  // Active identity derived from remoteConfig (DB) or active demo session
  const currentBotName = activeDemo?.name || propBotName || remoteConfig?.botName || CHATIO_DEFAULT_PRESET.name;
  const currentSubtitle = activeDemo?.tagline || remoteConfig?.widgetDescription || 'Online · Powered by RAG';
  const currentWelcome = activeDemo?.welcomeMessage || remoteConfig?.welcomeMessage || CHATIO_DEFAULT_PRESET.welcomeMessage;
  const currentSuggestions = activeDemo?.suggestions || (Array.isArray(remoteConfig?.suggestions) && remoteConfig.suggestions.length > 0 ? remoteConfig.suggestions.filter(s => s && s.label) : CHATIO_DEFAULT_PRESET.suggestions);
  const currentAvatar = activeDemo?.avatar || remoteConfig?.avatarUrl || '';
  const currentFooter = activeDemo ? 'DEMO MODE · TEMPORARY SESSION' : (remoteConfig?.footerText || 'POWERED BY CHATIO BY ANZA');

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => [makeWelcome(currentBotName, currentWelcome)]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [newMsgAlert, setNewMsgAlert] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [chipsVisible, setChipsVisible] = useState(true);

  const widgetRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Client hydration check & config fetch
  useEffect(() => {
    setHasMounted(true);

    if (typeof window !== 'undefined') {
      const savedDemo = sessionStorage.getItem('chatio_demo_mode');
      if (savedDemo && DEMO_PRESETS[savedDemo]) {
        const preset = DEMO_PRESETS[savedDemo];
        setActiveDemo(preset);
        setMessages([makeWelcome(preset.name, preset.welcomeMessage)]);
      }
    }

    axios.get('/api/widget/config')
      .then((res) => {
        const data = res.data;
        if (data && data.botName) {
          setRemoteConfig(data);
          if (!activeDemo) {
            setMessages((prev) => {
              if (prev.length <= 1) {
                return [makeWelcome(data.botName, data.welcomeMessage)];
              }
              return prev;
            });
          }
        }
      })
      .catch((err) => console.warn('[ChatWidget] Could not fetch remote config:', err));
  }, []);

  // ── Listen for clicks outside the widget to close it ────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      // If widget is open and the click target is NOT inside the widget root element
      if (isOpen && widgetRef.current && !widgetRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    
    // Use capture phase or regular depending on preference. 
    // Mouse down feels more responsive than click.
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // ── Listen for interactive demo mode switches ──────────────────────────────
  useEffect(() => {
    const handleDemoChange = (e) => {
      const demoId = e.detail?.demoId;
      if (demoId && DEMO_PRESETS[demoId]) {
        const preset = DEMO_PRESETS[demoId];
        setActiveDemo(preset);
        setMessages([makeWelcome(preset.name, preset.welcomeMessage)]);
        setIsOpen(true);
      } else {
        setActiveDemo(null);
        setMessages([makeWelcome(propBotName || remoteConfig?.botName || CHATIO_DEFAULT_PRESET.name, remoteConfig?.welcomeMessage || CHATIO_DEFAULT_PRESET.welcomeMessage)]);
      }
    };

    window.addEventListener('chatio:demo_change', handleDemoChange);
    return () => window.removeEventListener('chatio:demo_change', handleDemoChange);
  }, [propBotName, remoteConfig]);

  // ── Dismiss on click outside, right click, or Escape ────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('contextmenu', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('contextmenu', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Smart Auto-Scroll
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 50);
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

  // ── Send Message Logic ──────────────────────────────────────────────────────

  const sendMessage = useCallback(async (text) => {
    if (!text || !text.trim()) return;

    setChipsVisible(false);

    const userMsg = makeMsg('user', text.trim());
    const history = [...messages, userMsg];
    setMessages(history);
    setIsLoading(true);
    scrollToBottom();

    // High-Level Guardrails Validation
    const guardrail = checkGuardrails(text.trim(), activeDemo?.id || null);
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
      const res = await axios.post(apiEndpoint, {
        messages: payload,
        demoId: activeDemo?.id || '',
      });

      const data = res.data;
      const replyContent = data.reply || data.text || 'No response generated.';
      const providerUsed = data.provider || null;

      const aiMsg = makeMsg('assistant', replyContent, providerUsed);
      setMessages((prev) => [...prev, aiMsg]);
      if (!isOpen) setNewMsgAlert(true);
    } catch (err) {
      console.error('[ChatWidget] Error sending message:', err);
      let userFacingError = 'An error occurred while getting the response.';
      const status = err.response?.status;
      const data = err.response?.data;
      
      if (status === 429) {
        userFacingError = '⚠️ Rate Limit Reached: You are sending messages too quickly. Please wait 60 seconds before sending more.';
      } else if (status === 500) {
        userFacingError = data?.error || '⚠️ Server Error: The AI service encountered an issue. Please try again shortly.';
      } else if (data?.error) {
        userFacingError = `⚠️ ${data.error}`;
      } else if (err.message && !err.message.includes('object')) {
        userFacingError = `⚠️ Network Error: ${err.message}`;
      }

      const errorMsg = makeMsg('assistant', userFacingError, null);
      errorMsg.isError = true;
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [messages, isOpen, apiEndpoint, scrollToBottom, activeDemo]);

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
      if (inputRef.current) {
        inputRef.current.value = (inputRef.current.value ? `${inputRef.current.value} ${transcript}` : transcript);
      }
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

  // ── Copy to Clipboard ───────────────────────────────────────────────────────

  const copyToClipboard = useCallback((msgId, text) => {
    const cleanText = text.replace(/<[^>]*>/g, '').replace(/[*#]/g, '');
    navigator.clipboard.writeText(cleanText).then(() => {
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(null), 2000);
    });
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
    setMessages([{ ...makeWelcome(currentBotName, currentWelcome), timestamp: new Date() }]);
  }, [currentBotName, currentWelcome]);

  // ── Reset to default Chatio ─────────────────────────────────────────────────

  const resetToDefaultChatio = useCallback(() => {
    setActiveDemo(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('chatio_demo_mode');
      window.dispatchEvent(new CustomEvent('chatio:demo_change', { detail: { demoId: 'default' } }));
    }
  }, []);

  // Helper icon for chips
  const getChipIcon = (idx) => {
    if (activeDemo?.id === 'restaurant') return UtensilsCrossed;
    if (activeDemo?.id === 'ecommerce') return ShoppingBag;
    if (activeDemo?.id === 'doctor') return Stethoscope;
    if (activeDemo?.id === 'designer') return Palette;

    const icons = [Rocket, Brain, Settings, Zap];
    return icons[idx % icons.length];
  };

  // panelSizeStyle removed to prevent DB config from overriding CSS and causing layout flashing

  return (
    <div ref={widgetRef} className={styles.root}>
      {/* ── FAB Toggle Button ── */}
      <button
        id="chatwidget-open-btn"
        className={`${styles.fab} ${isOpen ? styles.fabHidden : ''}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }}
        aria-label="Open AI Chat"
        title="Chat with Chatio AI Assistant"
      >
        <Sparkles className="w-6 h-6 text-white animate-pulse" />
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
              <span className={styles.avatar}>
                {currentAvatar ? (
                  <img src={currentAvatar} alt="Avatar" className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <>
                    {activeDemo?.id === 'restaurant' && <UtensilsCrossed className="w-4 h-4" />}
                    {activeDemo?.id === 'ecommerce' && <ShoppingBag className="w-4 h-4" />}
                    {activeDemo?.id === 'doctor' && <Stethoscope className="w-4 h-4" />}
                    {activeDemo?.id === 'designer' && <Palette className="w-4 h-4" />}
                    {!activeDemo && <Sparkles className="w-4 h-4" />}
                  </>
                )}
              </span>
              <span className={styles.onlineDot} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className={styles.botName}>{currentBotName}</p>
                {activeDemo && (
                  <span className={styles.demoBadge}>DEMO</span>
                )}
              </div>
              <p className={styles.botMeta}>
                <span className={styles.pulseDot} />
                {currentSubtitle}
              </p>
            </div>
          </div>
          <div className={styles.headerBtns}>
            {activeDemo && (
              <button
                className={styles.hBtn}
                onClick={resetToDefaultChatio}
                title="Reset to Chatio Platform Assistant"
                aria-label="Reset to Chatio"
              >
                <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
              </button>
            )}
            <button
              className={styles.hBtn}
              onClick={clearChat}
              title="Clear chat history"
              aria-label="Clear chat history"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              className={`${styles.hBtn} ${styles.hBtnClose}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOpen(false);
              }}
              title="Close chat window"
              aria-label="Close chat window"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Demo Mode Banner */}
        {activeDemo && (
          <div className={styles.demoBanner}>
            <span>⚡ Interactive demo session &mdash; resets on refresh</span>
            <button onClick={resetToDefaultChatio} className={styles.demoBannerReset}>Reset</button>
          </div>
        )}

        {/* Messages Container */}
        <div className={styles.messages} id="chatwidget-messages" ref={messagesContainerRef}>
          <MessageList
            messages={messages}
            isLoading={isLoading}
            hasMounted={hasMounted}
            isSpeaking={isSpeaking}
            copiedId={copiedId}
            onToggleLike={toggleLike}
            onCopy={copyToClipboard}
            onSpeak={speak}
            messagesEndRef={messagesEndRef}
          />
        </div>

        {/* Suggestion Chips */}
        {chipsVisible && currentSuggestions.length > 0 && (
          <div className={styles.chipsContainer}>
            {currentSuggestions.map((chip, idx) => {
              const ChipIcon = getChipIcon(idx);
              return (
                <button
                  key={idx}
                  className={styles.chipBtn}
                  onClick={() => {
                    setChipsVisible(false);
                    sendMessage(chip.prompt);
                  }}
                  disabled={isLoading}
                >
                  <ChipIcon className={`w-3.5 h-3.5 ${styles.chipIcon}`} />
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Input Area (Isolated 60fps fast component) */}
        <ChatInputArea
          onSendMessage={sendMessage}
          isLoading={isLoading}
          isListening={isListening}
          onToggleVoice={toggleVoice}
          activeDemo={activeDemo}
          currentFooter={currentFooter}
          inputRef={inputRef}
        />
      </div>
    </div>
  );
}

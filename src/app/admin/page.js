'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './admin.module.css';

// ─── Inline Icons ─────────────────────────────────────────────────────────────
const Ico = {
  Spider: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 8V4" /><path d="M12 20v-4" />
      <path d="M8 12H4" /><path d="M20 12h-4" />
      <path d="M9.17 9.17l-2.83-2.83" /><path d="M17.66 17.66l-2.83-2.83" />
      <path d="M9.17 14.83l-2.83 2.83" /><path d="M17.66 6.34l-2.83 2.83" />
    </svg>
  ),
  Upload: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  FileText: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  Lock: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  LogOut: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
};

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

export default function AdminDashboard() {
  // Auth state
  const [token, setToken] = useState('');
  const [isLogged, setIsLogged] = useState(false);
  
  // Crawler state
  const [urlInput, setUrlInput] = useState('');
  const [maxPages, setMaxPages] = useState(30);
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlLogs, setCrawlLogs] = useState([]);
  
  // File state
  const fileInputRef = useRef(null);
  const [fileStatus, setFileStatus] = useState(null);
  
  // Raw text state
  const [textInput, setTextInput] = useState('');
  const [textStatus, setTextStatus] = useState(null);

  const consoleEndRef = useRef(null);

  // Initialize auth from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('admin_token');
    if (saved) {
      setToken(saved);
      setIsLogged(true);
    }
  }, []);

  // Auto-scroll console
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [crawlLogs]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleLogin = (e) => {
    e.preventDefault();
    if (!token.trim()) return;
    localStorage.setItem('admin_token', token.trim());
    setIsLogged(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken('');
    setIsLogged(false);
  };

  // Wrapper for fetch to inject auth and handle 401
  const fetchWithAuth = async (url, options = {}) => {
    const headers = { ...options.headers, Authorization: `Bearer ${token}` };
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      handleLogout();
      throw new Error('Unauthorized. Invalid admin password.');
    }
    return res;
  };

  const handleCrawl = async () => {
    if (!urlInput.trim()) return;
    setIsCrawling(true);
    setCrawlLogs([{ type: 'progress', message: `Starting deep crawl on ${urlInput}...` }]);

    try {
      const res = await fetchWithAuth('/api/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim(), maxPages }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Server error ${res.status}`);
      }

      // Read SSE stream
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || ''; // keep the last incomplete chunk in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              setCrawlLogs(prev => [...prev, data]);
              if (data.type === 'done') setIsCrawling(false);
            } catch (err) {
              console.error('Failed to parse stream event', err);
            }
          }
        }
      }
    } catch (err) {
      setCrawlLogs(prev => [...prev, { type: 'error', message: err.message }]);
      setIsCrawling(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setFileStatus('loading');
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetchWithAuth('/api/train', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFileStatus({ ok: true, msg: `Successfully trained with "${file.name}" (${data.chars.toLocaleString()} chars).` });
    } catch (err) {
      setFileStatus({ ok: false, msg: err.message });
    }
  };

  const handleTextUpload = async () => {
    if (!textInput.trim()) return;
    setTextStatus('loading');
    try {
      const res = await fetchWithAuth('/api/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTextStatus({ ok: true, msg: `Successfully updated knowledge base (${data.chars.toLocaleString()} chars).` });
      setTextInput('');
    } catch (err) {
      setTextStatus({ ok: false, msg: err.message });
    }
  };

  // ── Render Auth Screen ──────────────────────────────────────────────────────
  if (!isLogged) {
    return (
      <main className={styles.container} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <section className={styles.card} style={{ maxWidth: '400px', width: '100%' }}>
          <div className={styles.cardHeader} style={{ justifyContent: 'center', marginBottom: '24px' }}>
            <div className={styles.cardIcon}><Ico.Lock /></div>
            <div>
              <h2 className={styles.cardTitle}>Admin Access</h2>
            </div>
          </div>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input 
              type="password" 
              className={styles.input} 
              placeholder="Enter Admin Password" 
              value={token}
              onChange={(e) => setToken(e.target.value)}
              autoFocus
            />
            <button type="submit" className={styles.btn} disabled={!token.trim()}>
              Login
            </button>
          </form>
        </section>
      </main>
    );
  }

  // ── Render Dashboard ────────────────────────────────────────────────────────
  return (
    <main className={styles.container}>
      <header className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className={styles.title}>Secure Admin <span className={styles.gradient}>Dashboard</span></h1>
          <p className={styles.subtitle}>Train your chatbot&apos;s knowledge base using deep crawling, files, or direct text.</p>
        </div>
        <button className={styles.btn} onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'transparent', border: '1px solid #333', color: '#fff' }}>
          <Ico.LogOut /> Log Out
        </button>
      </header>

      {/* ── Deep Web Crawler Card ── */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardIcon}><Ico.Spider /></div>
          <div>
            <h2 className={styles.cardTitle}>Deep Web Crawler</h2>
          </div>
        </div>
        <p className={styles.cardDesc}>
          Enter a website URL. Our crawler will recursively visit internal pages, extract text, and compile everything into structured Markdown for highly accurate answers.
        </p>

        <div className={styles.formGroup}>
          <label className={styles.label}>Website URL</label>
          <div className={styles.flexRow}>
            <input 
              type="url" 
              className={styles.input} 
              placeholder="https://example.com" 
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={isCrawling}
            />
            <select 
              className={styles.select} 
              value={maxPages} 
              onChange={(e) => setMaxPages(Number(e.target.value))}
              disabled={isCrawling}
            >
              <option value="5">Max 5 Pages</option>
              <option value="15">Max 15 Pages</option>
              <option value="30">Max 30 Pages</option>
              <option value="50">Max 50 Pages</option>
              <option value="100">Max 100 Pages</option>
              <option value="0">Unlimited (All pages)</option>
            </select>
            <button className={styles.btn} onClick={handleCrawl} disabled={!urlInput.trim() || isCrawling}>
              {isCrawling ? 'Crawling...' : 'Start Crawl'}
            </button>
          </div>
        </div>

        {/* Console Log */}
        {crawlLogs.length > 0 && (
          <div className={styles.console}>
            {crawlLogs.map((log, i) => {
              let colorClass = '';
              if (log.type === 'progress') colorClass = styles.consoleProgress;
              else if (log.type === 'success') colorClass = styles.consoleSuccess;
              else if (log.type === 'warning') colorClass = styles.consoleWarning;
              else if (log.type === 'error') colorClass = styles.consoleError;
              else if (log.type === 'done') colorClass = styles.consoleDone;

              const prefix = log.type === 'done' ? '✨ ' : log.type === 'error' ? '❌ ' : '> ';
              
              let msg = log.message;
              if (log.type === 'done' && !msg) {
                msg = `Done! Discovered: ${log.discovered} | Crawled: ${log.pages} | Failed: ${log.failed} | Skipped: ${log.skipped ?? 0} | Chars: ${log.chars?.toLocaleString()}`;
              }

              return (
                <div key={i} className={`${styles.consoleLine} ${colorClass}`}>
                  {prefix}{msg}
                </div>
              );
            })}
            <div ref={consoleEndRef} />
          </div>
        )}
      </section>

      {/* ── File Upload Card ── */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardIcon}><Ico.Upload /></div>
          <div>
            <h2 className={styles.cardTitle}>Upload File</h2>
          </div>
        </div>
        <p className={styles.cardDesc}>
          Upload a Markdown (.md), Text (.txt), or JSON file containing your knowledge base.
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.txt,.json"
          style={{ display: 'none' }}
          onChange={(e) => { handleFileUpload(e.target.files?.[0]); e.target.value = ''; }}
        />
        <button className={styles.btn} onClick={() => fileInputRef.current?.click()} disabled={fileStatus === 'loading'}>
          {fileStatus === 'loading' ? 'Uploading...' : 'Choose File'}
        </button>

        {fileStatus && fileStatus !== 'loading' && (
          <div className={`${styles.statusBadge} ${fileStatus.ok ? styles.statusOk : styles.statusErr}`}>
            {fileStatus.msg}
          </div>
        )}
      </section>

      {/* ── Raw Text Card ── */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardIcon}><Ico.FileText /></div>
          <div>
            <h2 className={styles.cardTitle}>Raw Text / Markdown</h2>
          </div>
        </div>
        <p className={styles.cardDesc}>
          Paste raw markdown, Q&A, or text directly into the system.
        </p>

        <textarea 
          className={styles.input} 
          rows={6} 
          placeholder="Enter website details, FAQs, or markdown..."
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          disabled={textStatus === 'loading'}
        />
        <div style={{ marginTop: '16px' }}>
          <button className={styles.btn} onClick={handleTextUpload} disabled={!textInput.trim() || textStatus === 'loading'}>
            {textStatus === 'loading' ? 'Saving...' : 'Update Knowledge'}
          </button>
        </div>

        {textStatus && textStatus !== 'loading' && (
          <div className={`${styles.statusBadge} ${textStatus.ok ? styles.statusOk : styles.statusErr}`}>
            {textStatus.msg}
          </div>
        )}
      </section>
    </main>
  );
}

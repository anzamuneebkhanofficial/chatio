'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser, useClerk, useAuth } from '@clerk/nextjs';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  LayoutDashboard, Palette, BrainCircuit, Database, LogOut,
  Menu, X, CheckCircle2, Circle, ChevronRight, DownloadCloud,
  Rocket, Copy, Check, Code2, ShoppingBag, Globe, FileCode2, Key,
  Eye, EyeOff, Loader2
} from 'lucide-react';
import { BrandMark } from '@/components/ui/BrandMark';


// ─────────────────────────────────────────────────────────────────────────────
// User Dashboard — Per-User Bot Management & Integration Hub
// Purpose: Each user controls ONLY their own bot. Completely isolated from Admin.
// Scope: Bot appearance, API keys (encrypted), training data, embed & deploy guides.
// NOT included: Platform-wide settings, other users' data, system guardrails.
// ─────────────────────────────────────────────────────────────────────────────

// ── Copy-to-clipboard button ──────────────────────────────────────────────
function CopyButton({ text, id, className = '', label = 'Copy', onCopySuccess }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e) => {
    e?.stopPropagation?.();
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      onCopySuccess?.();
      if (typeof window !== 'undefined') {
        localStorage.setItem('chatio_embed_copied', 'true');
        window.dispatchEvent(new Event('chatio_embed_done'));
      }
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      id={id}
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/35 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold shadow-sm transition-all shrink-0 cursor-pointer ${className}`}
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
      <span>{copied ? 'Copied!' : label}</span>
    </button>
  );
}

// ── Code block with copy ──────────────────────────────────────────────────
function CodeBlock({ code, id }) {
  return (
    <div className="relative group">
      <pre className="bg-[#0d1117] text-[#e6edf3] p-4 pr-24 rounded-xl border border-white/10 overflow-x-auto text-xs font-mono leading-relaxed whitespace-pre-wrap">
        {code}
      </pre>
      <CopyButton text={code} id={id} className="absolute top-3 right-3 !bg-white/10 hover:!bg-white/20 !border-white/15 !text-slate-300 hover:!text-white" />
    </div>
  );
}

// ── Step badge ────────────────────────────────────────────────────────────
function StepBadge({ num }) {
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold shrink-0">
      {num}
    </span>
  );
}

// ── Isolated Fast Forms (React Hook Form Uncontrolled) ────────────────────

function UserCrawlForm({ appId, onTrainingSuccess }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const [crawlLogs, setCrawlLogs] = useState([]);

  const onStartCrawl = async (data) => {
    if (!data.url) return;
    setCrawlLogs([{ type: 'info', message: `🔍 Connecting to ${data.url}...` }]);

    try {
      const response = await fetch('/api/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: data.url, maxPages: data.maxPages || 30, appId }),
      });

      if (!response.ok) {
        const err = await response.json();
        setCrawlLogs((prev) => [...prev, { type: 'error', message: `❌ ${err.error || 'Crawling failed.'}` }]);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6));
              if (event.type === 'page') {
                setCrawlLogs((prev) => [...prev, { type: 'page', message: `📄 [${event.status}] ${event.url} (${event.chars} chars)` }]);
              } else if (event.type === 'done') {
                setCrawlLogs((prev) => [...prev, { type: 'done', message: `✅ Complete! ${event.pages} pages indexed (${event.chars} chars saved).` }]);
                onTrainingSuccess?.();
              } else if (event.type === 'error') {
                setCrawlLogs((prev) => [...prev, { type: 'error', message: `❌ Error: ${event.message}` }]);
              }
            } catch {
              // ignore parse errors on partial streams
            }
          }
        }
      }
    } catch (err) {
      setCrawlLogs((prev) => [...prev, { type: 'error', message: `❌ Network error: ${err.message}` }]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onStartCrawl)} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          id="user-crawl-url"
          type="url"
          placeholder="https://yourwebsite.com"
          disabled={isSubmitting}
          className="flex-1"
          {...register('url', { required: true })}
        />
        <div className="flex items-center gap-2">
          <Input id="user-max-pages" type="number" className="w-20" placeholder="30" {...register('maxPages')} />
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? '...' : 'Crawl'}</Button>
        </div>
      </div>
      {crawlLogs.length > 0 && (
        <div className="bg-background-primary border border-white/10 rounded-button p-4 h-32 overflow-y-auto font-mono text-xs text-text-secondary">
          {crawlLogs.map((log, i) => (
            <div key={i} className={log.type === 'error' ? 'text-status-error' : log.type === 'done' ? 'text-status-success' : 'text-text-secondary'}>
              {log.message}
            </div>
          ))}
        </div>
      )}
    </form>
  );
}

function UserRawTextForm({ appId, onTrainingSuccess }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const onSaveText = async (data) => {
    if (!data.text?.trim()) return;
    const toastId = toast.loading('Saving knowledge chunk to your bot...');
    try {
      await axios.post('/api/train', { text: data.text, appId });
      toast.success('Knowledge saved to your bot.', { id: toastId });
      reset();
      onTrainingSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.error || err.message, { id: toastId });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSaveText)}>
      <textarea
        id="user-text-input"
        spellCheck={false}
        autoComplete="off"
        data-gramm="false"
        data-gramm_editor="false"
        data-enable-grammarly="false"
        className="flex w-full rounded-xl border border-white/10 bg-[#0d1020] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 min-h-[130px] mb-4 transition-[border-color,box-shadow]"
        placeholder="Paste FAQs, product descriptions, policies, Markdown..."
        {...register('text', { required: true })}
      />
      <Button id="user-save-text" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save to Knowledge Base'}
      </Button>
    </form>
  );
}

export default function UserDashboardPage() {
  const router = useRouter();
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const { getToken } = useAuth();

  const [user, setUser] = useState(null);
  const [appId, setAppId] = useState('');
  const [config, setConfig] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [embedPlatform, setEmbedPlatform] = useState('html');
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, watch, setValue, formState: { isSubmitting } } = useForm();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [showMongoUri, setShowMongoUri] = useState(false);
  const [testingDb, setTestingDb] = useState(false);

  const [hasCopiedEmbed, setHasCopiedEmbed] = useState(false);
  const fileInputRef = useRef(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('chatio_embed_copied') === 'true') {
        setHasCopiedEmbed(true);
      }
      const listener = () => setHasCopiedEmbed(true);
      window.addEventListener('chatio_embed_done', listener);
      return () => window.removeEventListener('chatio_embed_done', listener);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push('/login');
      return;
    }

    if (clerkUser) {
      const name = clerkUser.fullName || clerkUser.firstName || clerkUser.primaryEmailAddress?.emailAddress?.split('@')[0] || 'User';
      const email = clerkUser.primaryEmailAddress?.emailAddress || '';
      setUser({ name, email, id: clerkUser.id });

      if (!fetchedRef.current) {
        fetchedRef.current = true;
        fetchUserConfig();
      }
    }
  }, [isLoaded, isSignedIn, clerkUser, router]);

  const fetchUserConfig = async (retries = 3) => {
    try {
      const token = await getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get('/api/user/config', { headers });
      if (res.data?.config) {
        const resolvedAppId = res.data.config.appId || 'bot_default';
        setConfig(res.data.config);
        setAppId(resolvedAppId);
        reset({
          ...res.data.config,
          appId: resolvedAppId,
        });
      }
      setLoading(false);
    } catch (err) {
      if (retries > 0) {
        setTimeout(() => fetchUserConfig(retries - 1), 1000);
        return;
      }
      console.error('[Dashboard] Failed to load config:', err);
      fetchedRef.current = false;
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut({ redirectUrl: '/login' });
    } catch (err) {
      console.error('Logout failed:', err);
      router.push('/login');
    }
  };


  const handleSaveConfig = async (data) => {
    const loadingToastId = toast.loading('Saving your settings...');
    try {
      const token = await getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post('/api/user/config', data, { headers });
      if (res.data?.config) {
        setConfig(res.data.config);
        if (res.data.config.appId) {
          setAppId(res.data.config.appId);
        }
        reset(res.data.config);
      }
      toast.success('Saved! Your chatbot will reflect these changes instantly.', { id: loadingToastId });
    } catch (err) {
      toast.error(err.response?.data?.error || err.message, { id: loadingToastId });
    }
  };

  const handleTestDbConnection = async () => {
    const uri = watch('customMongoUri');
    if (!uri || !uri.trim()) {
      toast.error('Please enter a MongoDB connection string first.');
      return;
    }
    setTestingDb(true);
    const toastId = toast.loading('Testing connection to MongoDB...');
    try {
      const res = await axios.post('/api/test-db', { uri: uri.trim() });
      if (res.data?.success) {
        toast.success(`✅ Success! ${res.data.message}`, { id: toastId });
      } else {
        toast.error(res.data?.error || 'Connection failed.', { id: toastId });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.message, { id: toastId });
    } finally {
      setTestingDb(false);
    }
  };

  const handleImageUploadChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (Max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      e.target.value = '';
      return;
    }

    // Validate format (SVG, PNG, JPG/JPEG, WEBP)
    const validTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only SVG, PNG, JPG, and WEBP formats are supported');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setValue('avatarUrl', reader.result, { shouldDirty: true });
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    const toastId = toast.loading(`Uploading "${file.name}" to your knowledge base...`);
    const form = new FormData();
    form.append('file', file);
    form.append('appId', appId);
    try {
      await axios.post('/api/train', form);
      toast.success(`Uploaded "${file.name}" to your bot's knowledge base.`, { id: toastId });
      fetchUserConfig();
    } catch (err) {
      toast.error(err.response?.data?.error || err.message, { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
          <p className="text-text-secondary text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const originUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://yourapp.com');
  const isStorageDone = Boolean(config?.storageType === 'custom' ? config?.customMongoUri : (config?.storageType === 'managed' || config?._id));
  const isKeysDone = Boolean(
    (config?.geminiApiKey && config.geminiApiKey !== '********') ||
    (config?.groqApiKey && config.groqApiKey !== '********') ||
    (config?.geminiApiKeyMasked && config.geminiApiKeyMasked !== '••••••••' && config.geminiApiKeyMasked !== '') ||
    (config?.groqApiKeyMasked && config.groqApiKeyMasked !== '••••••••' && config.groqApiKeyMasked !== '')
  );
  const isKnowledgeDone = Boolean(config?.hasKnowledge || (config?.knowledgeChars && config.knowledgeChars > 10));
  const isAppearanceDone = Boolean(
    (config?.botName && config.botName !== 'Chatio Assistant') ||
    config?.avatarUrl ||
    (config?.primaryColor && config.primaryColor !== '#6366f1')
  );
  const isEmbedDone = Boolean(hasCopiedEmbed || config?.isSetupComplete);

  // ── Embed code templates ───────────────────────────────────────────────
  const embedSnippets = {
    html: `<!-- Paste before </body> on any HTML page -->
<script
  src="${originUrl}/widget.js"
  data-app-id="${appId}"
  async>
</script>`,

    shopify: `<!-- Shopify: Online Store → Themes → Edit Code → theme.liquid -->
<!-- Paste just before the </body> closing tag -->

<script
  src="${originUrl}/widget.js"
  data-app-id="${appId}"
  async>
</script>`,

    wordpress: `<!-- WordPress: Add to your theme's footer.php before </body>  -->
<!-- Or use "Header and Footer Scripts" plugin (Footer section) -->

<script
  src="${originUrl}/widget.js"
  data-app-id="${appId}"
  async>
</script>`,

    react: `// React / Vite — add to your root App.jsx or index.jsx
import { useEffect } from 'react';

function ChatioWidget() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '${originUrl}/widget.js';
    script.setAttribute('data-app-id', '${appId}');
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);
  return null;
}

// Then use <ChatioWidget /> in your App component:
export default function App() {
  return (
    <>
      <YourExistingApp />
      <ChatioWidget />
    </>
  );
}`,

    nextjs: `// Next.js — add to app/layout.js (App Router) or pages/_app.js
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}

        {/* Chatio Widget — loads after page is interactive */}
        <Script
          src="${originUrl}/widget.js"
          data-app-id="${appId}"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}`,
  };

  const embedPlatforms = [
    { id: 'html',      label: 'HTML / Webflow', icon: Globe       },
    { id: 'shopify',   label: 'Shopify',        icon: ShoppingBag },
    { id: 'wordpress', label: 'WordPress',      icon: FileCode2   },
    { id: 'react',     label: 'React / Vite',   icon: Code2       },
    { id: 'nextjs',    label: 'Next.js',         icon: Code2       },
  ];

  const NavItem = ({ id, label, icon: Icon }) => (
    <button
      id={`user-nav-${id}`}
      onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-button text-sm font-medium transition-all duration-200 ${
        activeTab === id
          ? 'bg-primary text-white shadow-lg shadow-primary/20'
          : 'text-text-secondary hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-background-primary flex overflow-hidden">

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-background-card border-r border-white/5 flex flex-col transition-transform transform lg:translate-x-0 lg:static lg:h-screen ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/90 border border-indigo-400/30 flex items-center justify-center text-white shadow-sm">
              <BrandMark size={16} className="text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-white text-sm">Chatio</span>
              <p className="text-[10px] text-text-secondary tracking-wide">My Dashboard</p>
            </div>
          </Link>
          <button className="lg:hidden text-text-secondary" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <NavItem id="overview"   label="Overview"                 icon={LayoutDashboard} />
          <NavItem id="storage"    label="Database & Privacy"       icon={Database}        />
          <NavItem id="ai"         label="API Keys"                 icon={Key}             />
          <NavItem id="appearance" label="Customize Bot"            icon={Palette}         />
          <NavItem id="knowledge"  label="Train Knowledge"          icon={BrainCircuit}    />
          <NavItem id="embed"      label="Embed & Deploy"           icon={Rocket}          />
        </div>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/40 to-secondary/40 flex items-center justify-center text-white font-semibold text-sm">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-text-secondary truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            id="user-logout-btn"
            variant="ghost"
            className="w-full justify-start text-status-error hover:text-status-error hover:bg-status-error/10"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" /> Log Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 lg:px-10 border-b border-white/5 bg-background-primary shrink-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-text-secondary" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-base font-semibold text-white">
              {activeTab === 'embed' ? 'Embed & Deploy' :
               activeTab === 'storage' ? 'Database Storage & Privacy' :
               activeTab === 'ai' ? 'API Credentials' :
               activeTab === 'knowledge' ? 'Knowledge Base Training' :
               activeTab === 'appearance' ? 'Bot Customization' : 'Overview'}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-status-success/10 text-status-success border border-status-success/20">
            <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
            Bot Live
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10">



          <div className="max-w-4xl mx-auto space-y-6">

            {/* ── TAB: OVERVIEW ─────────────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-display font-bold text-white mb-1">Welcome to your Bot Dashboard</h2>
                  <p className="text-text-secondary text-sm">
                    Your bot is completely isolated from other users. Everything you configure here only affects your widget.
                  </p>
                </div>

                {/* App ID card */}
                <Card className="bg-gradient-to-br from-indigo-950/40 via-[#0d1224] to-[#080a16] border border-indigo-500/30 shadow-lg shadow-indigo-950/40 p-5 sm:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-white text-base mb-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Your App ID
                      </h3>
                      <p className="text-xs sm:text-sm text-text-secondary">
                        Use this in your embed script. It uniquely identifies your bot.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 bg-black/50 p-2 sm:p-2.5 rounded-xl border border-indigo-500/25 shrink-0 self-start md:self-auto">
                      <code className="font-mono text-xs sm:text-sm font-bold text-indigo-300 px-2 py-0.5 select-all tracking-wider">
                        {appId || config?.appId || (loading ? 'loading...' : 'bot_default')}
                      </code>
                      <CopyButton text={appId || config?.appId || ''} id="overview-copy-appid" label="Copy ID" />
                    </div>
                  </div>
                </Card>

                {/* Setup checklist */}
                <div>
                  <h3 className="text-base font-semibold text-white mb-3">Step-by-Step Setup Guide</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                    {[
                      { step: 1, id: 'storage',    label: '1. Choose Database Storage', desc: 'Managed AES-256 Cloud or Bring Your Own DB.', done: isStorageDone },
                      { step: 2, id: 'ai',         label: '2. Add Your API Keys',        desc: 'Connect Groq & Gemini for AI responses.',      done: isKeysDone },
                      { step: 3, id: 'knowledge',  label: '3. Train Your Bot',           desc: 'Upload website, FAQs, or documents.',          done: isKnowledgeDone },
                      { step: 4, id: 'appearance', label: '4. Customize Appearance',     desc: 'Set brand colors, name, and greeting.',        done: isAppearanceDone },
                      { step: 5, id: 'embed',      label: '5. Embed on Your Website',    desc: 'Copy script tag and go live instantly.',       done: isEmbedDone },
                    ].map(({ step, id, label, desc, done }) => (
                      <Card
                        key={id}
                        className="cursor-pointer hover:border-primary/40 transition-all"
                        onClick={() => setActiveTab(id)}
                      >
                        <div className="flex items-start gap-4">
                          {done
                            ? <CheckCircle2 className="w-6 h-6 text-status-success shrink-0 mt-0.5" />
                            : <div className="w-6 h-6 rounded-full border-2 border-white/20 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-xs font-bold text-text-secondary">{step}</span>
                              </div>
                          }
                          <div>
                            <h4 className="font-semibold text-white mb-0.5">{label}</h4>
                            <p className="text-sm text-text-secondary">{desc}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-text-secondary ml-auto shrink-0 mt-1" />
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: DEDICATED DATABASE & PRIVACY CHOICE ──────────────────── */}
            {activeTab === 'storage' && config && (
              <div className="space-y-6">
                <Card className="border-indigo-500/30 bg-gradient-to-br from-indigo-950/30 via-[#0d1020] to-[#080a16]">
                  <div className="mb-6 pb-4 border-b border-white/10 flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Database className="w-5 h-5 text-indigo-400" /> Step 1: Database Storage & Privacy Setup
                      </h3>
                      <p className="text-sm text-text-secondary mt-1">
                        Select how your AI chatbot data and API keys are stored before adding keys or training data.
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
                      🔒 Step 1 Required
                    </span>
                  </div>

                  {/* Warning banner regarding switching modes */}
                  <div className="mb-6 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                    <span className="text-amber-400 font-bold text-base shrink-0">⚠️</span>
                    <div className="text-xs text-amber-200/90 leading-relaxed">
                      <strong className="text-amber-300">Important Setup Rule:</strong> Please select your database storage option first before training your bot. Avoid switching back and forth between Option 1 and Option 2 repeatedly, as training data is saved exclusively in your chosen database.
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    {/* Option 1: Managed Cloud Storage */}
                    <label className={`block p-4 rounded-xl border cursor-pointer transition-all ${watch('storageType') !== 'custom' ? 'bg-indigo-900/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10' : 'bg-black/30 border-white/10 hover:border-white/20'}`}>
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          value="managed"
                          className="mt-1 accent-indigo-500"
                          {...register('storageType')}
                        />
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-white text-sm">Option 1: Managed Cloud Storage (Default)</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">Recommended for Store Owners & Non-Technical Users</span>
                            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold">AES-256 Encrypted</span>
                          </div>
                          <p className="text-xs text-text-secondary leading-relaxed">
                            <strong>Zero Setup & Maximum Speed</strong>. Everything is handled for you automatically. Your API keys are encrypted at rest with <strong>military-grade AES-256-GCM encryption</strong>. <em>Not even the platform owner or database admin can see your raw keys.</em> Ideal if you don't want to set up your own database.
                          </p>
                        </div>
                      </div>
                    </label>

                    {/* Option 2: BYODB (Bring Your Own Database) */}
                    <label className={`block p-4 rounded-xl border cursor-pointer transition-all ${watch('storageType') === 'custom' ? 'bg-indigo-900/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10' : 'bg-black/30 border-white/10 hover:border-white/20'}`}>
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          value="custom"
                          className="mt-1 accent-indigo-500"
                          {...register('storageType')}
                        />
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-white text-sm">Option 2: Bring Your Own Database (BYODB)</span>
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold">For Technical Users & Privacy Teams</span>
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-bold">100% External DB Storage</span>
                          </div>
                          <p className="text-xs text-text-secondary leading-relaxed">
                            For technical developers and privacy-conscious businesses. Provide your own <strong>MongoDB Atlas Cluster URL</strong> or <strong>Local MongoDB URL</strong>. All your knowledge base training documents and vector search data reside <strong>exclusively in your own database</strong>. Zero training vectors remain on Chatio servers.
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Custom Mongo URI Input when Option 2 is selected */}
                  {watch('storageType') === 'custom' && (
                    <div className="p-4 rounded-xl bg-black/50 border border-amber-500/30 space-y-3 mb-6 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                          <Database className="w-4 h-4 text-amber-400" /> Your Private MongoDB Connection URL
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowMongoUri(!showMongoUri)}
                          className="text-xs text-text-secondary hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          {showMongoUri ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{showMongoUri ? 'Hide URL' : 'Show URL'}</span>
                        </button>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Input
                          id="user-custom-mongo-uri"
                          type={showMongoUri ? "text" : "password"}
                          placeholder="mongodb+srv://user:pass@cluster.mongodb.net/my_bot_db  OR  mongodb://localhost:27017/my_bot_db"
                          className="bg-[#090c18] border-amber-500/40 focus:border-amber-400 text-xs font-mono flex-1"
                          {...register('customMongoUri')}
                        />
                        <button
                          type="button"
                          onClick={handleTestDbConnection}
                          disabled={testingDb}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold shrink-0 cursor-pointer transition-all disabled:opacity-50"
                        >
                          {testingDb ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>⚡ Test Connection</span>}
                        </button>
                      </div>
                      <p className="text-[11px] text-text-secondary leading-relaxed">
                        📌 <strong>Technical Note:</strong> Supports online <code>mongodb+srv://...</code> Atlas strings and local <code>mongodb://127.0.0.1:27017/...</code> strings. Click <strong>Test Connection</strong> to verify your URL before saving!
                      </p>
                    </div>
                  )}

                  <Button id="user-save-storage" variant="secondary" onClick={handleSubmit(handleSaveConfig)} disabled={isSubmitting}>
                    {isSubmitting ? 'Saving Storage Preferences...' : 'Save Storage Preferences'}
                  </Button>
                </Card>
              </div>
            )}

            {/* ── TAB: CUSTOMIZE BOT ─────────────────────────────────────────── */}
            {activeTab === 'appearance' && config && (
              <Card>
                <div className="mb-6 pb-6 border-b border-white/5">
                  <h3 className="text-lg font-semibold text-white mb-1">Chatbot Appearance</h3>
                  <p className="text-sm text-text-secondary">
                    Customize how <strong className="text-white">your</strong> chatbot looks. Changes save to your account and reflect on your widget instantly.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Bot Name</label>
                    <Input id="user-bot-name" type="text" {...register('botName')} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Widget Title</label>
                    <Input id="user-widget-title" type="text" {...register('widgetTitle')} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Tagline / Status</label>
                    <Input id="user-tagline" type="text" placeholder="Online · Always Ready" {...register('widgetDescription')} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Logo / Avatar</label>
                    <div className="flex items-center gap-4">
                      {watch('avatarUrl') ? (
                        <div className="flex flex-col items-center gap-1">
                          <div className={`w-12 h-12 rounded-full overflow-hidden shrink-0 border border-white/10 ${watch('avatarBg') === 'theme' ? 'bg-primary' : 'bg-white/5'}`}>
                            <img src={watch('avatarUrl')} alt="Avatar" className="w-full h-full object-contain p-1" />
                          </div>
                          <button
                            type="button"
                            onClick={() => setValue('avatarUrl', '', { shouldDirty: true, shouldTouch: true })}
                            className="text-[11px] text-status-error hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 shrink-0 flex items-center justify-center text-xs text-text-secondary">No img</div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUploadChange}
                          className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-button file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                        <p className="text-xs text-text-secondary mt-1">Recommended: Square PNG/SVG (128×128px to 256×256px) for crisp HD display.</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Logo Background Style</label>
                    <select
                      id="user-avatar-bg"
                      className="flex h-10 w-full rounded-button border border-white/10 bg-background-primary px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-primary"
                      {...register('avatarBg')}
                    >
                      <option value="transparent">Transparent / Clean (No Background — Recommended for PNG)</option>
                      <option value="theme">Theme Color Gradient Behind Logo</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Primary Theme Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        id="user-color-picker"
                        type="color"
                        value={
                          watch('primaryColor') && /^#[0-9A-Fa-f]{6}$/.test(watch('primaryColor'))
                            ? watch('primaryColor')
                            : '#6366f1'
                        }
                        onChange={(e) => {
                          setValue('primaryColor', e.target.value, { shouldDirty: true, shouldTouch: true });
                        }}
                        className="w-10 h-10 rounded-button border border-white/10 cursor-pointer bg-transparent"
                      />
                      <Input
                        id="user-color-text"
                        type="text"
                        {...register('primaryColor')}
                        placeholder="#6366f1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Launcher Position</label>
                    <select
                      id="user-launcher-position"
                      className="flex h-10 w-full rounded-button border border-white/10 bg-background-primary px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-primary"
                      {...register('position')}
                    >
                      <option value="bottom-right">Bottom Right</option>
                      <option value="bottom-left">Bottom Left</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <label className="text-sm font-medium text-text-secondary">Welcome Message</label>
                  <textarea
                    id="user-welcome-message"
                    spellCheck={false}
                    autoComplete="off"
                    data-gramm="false"
                    data-gramm_editor="false"
                    data-enable-grammarly="false"
                    className="flex w-full rounded-button border border-white/10 bg-background-primary px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                    {...register('welcomeMessage')}
                  />
                </div>

                <div className="space-y-2 mb-8">
                  <label className="text-sm font-medium text-text-secondary">Footer Text</label>
                  <Input id="user-footer-text" type="text" {...register('footerText')} />
                </div>

                {/* FAQ Chips */}
                <div className="pt-6 mb-8 border-t border-white/5">
                  <h4 className="text-base font-semibold text-white mb-1">Quick Suggestion Chips</h4>
                  <p className="text-xs text-text-secondary mb-4">4 buttons shown above the chat input to guide visitors.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[0, 1, 2, 3].map((idx) => {
                      return (
                        <div key={idx} className="p-4 rounded-xl border border-white/10 bg-background-primary/50 space-y-3">
                          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Chip #{idx + 1}</p>
                          <div className="space-y-1">
                            <label className="text-xs text-slate-400">Button Label</label>
                            <Input id={`user-chip-label-${idx}`} type="text" placeholder={`Label ${idx + 1}`} {...register(`suggestions.${idx}.label`)} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-slate-400">Full Prompt</label>
                            <Input id={`user-chip-prompt-${idx}`} type="text" placeholder="Full question sent to AI" {...register(`suggestions.${idx}.prompt`)} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── Widget Size Control ── */}
                <div className="pt-6 mb-8 border-t border-white/5">
                  <div className="mb-5">
                    <h4 className="text-base font-semibold text-white mb-1">📐 Widget Size</h4>
                    <p className="text-xs text-text-secondary">
                      Customize the chat panel dimensions. Enter pixels (<code className="text-white bg-white/10 px-1 rounded">480</code> or <code className="text-white bg-white/10 px-1 rounded">480px</code>) or percentage (<code className="text-white bg-white/10 px-1 rounded">90%</code>). Leave blank to use the default.
                    </p>
                  </div>

                  {/* Live current size readout */}
                  <div className="flex flex-wrap gap-3 mb-5">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">Current Width</span>
                      <code className="text-sm font-mono text-white">{config.widgetWidth || '480px (default)'}</code>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">Current Height</span>
                      <code className="text-sm font-mono text-white">{config.widgetHeight || '680px (default)'}</code>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-secondary">Widget Width</label>
                      <div className="flex gap-2">
                        <Input
                          id="user-widget-width"
                          type="text"
                          placeholder="e.g. 480 or 480px or 90%"
                          {...register('widgetWidth')}
                        />
                        <button
                          onClick={(e) => { e.preventDefault(); setValue('widgetWidth', ''); }}
                          className="px-3 py-1 text-xs rounded-button border border-white/10 text-text-secondary hover:text-white hover:border-white/20 transition-all shrink-0"
                          title="Reset to default"
                        >
                          Reset
                        </button>
                      </div>
                      <p className="text-xs text-text-secondary">Recommended: <code className="text-white">420px – 520px</code></p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-secondary">Widget Height</label>
                      <div className="flex gap-2">
                        <Input
                          id="user-widget-height"
                          type="text"
                          placeholder="e.g. 680 or 680px or 85%"
                          {...register('widgetHeight')}
                        />
                        <button
                          onClick={(e) => { e.preventDefault(); setValue('widgetHeight', ''); }}
                          className="px-3 py-1 text-xs rounded-button border border-white/10 text-text-secondary hover:text-white hover:border-white/20 transition-all shrink-0"
                          title="Reset to default"
                        >
                          Reset
                        </button>
                      </div>
                      <p className="text-xs text-text-secondary">Recommended: <code className="text-white">600px – 720px</code></p>
                    </div>
                  </div>
                </div>

                <Button id="user-save-appearance" variant="primary" onClick={handleSubmit(handleSaveConfig)} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Appearance'}
                </Button>
              </Card>
            )}


            {/* ── TAB: API KEYS ──────────────────────────────────────────────── */}
            {activeTab === 'ai' && config && (
              <div className="space-y-6">
                <Card>
                  <div className="mb-6 pb-6 border-b border-white/5">
                    <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                      <Key className="w-5 h-5 text-primary" /> Your AI API Keys
                    </h3>
                    <p className="text-sm text-text-secondary">
                      Your keys are encrypted with AES-256-GCM before storage. They are only used for <strong className="text-white">your bot</strong> — never shared with other users.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-text-secondary flex items-center gap-1.5">
                          Gemini API Key
                          <Link href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs text-primary underline">Get free key →</Link>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowGeminiKey(!showGeminiKey)}
                          className="text-xs text-text-secondary hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          {showGeminiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{showGeminiKey ? 'Hide' : 'Show'}</span>
                        </button>
                      </div>
                      <Input
                        id="user-gemini-key"
                        type={showGeminiKey ? "text" : "password"}
                        placeholder="AIzaSy..."
                        {...register('geminiApiKey')}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-text-secondary flex items-center gap-1.5">
                          Groq API Key
                          <Link href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-xs text-primary underline">Get free key →</Link>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowGroqKey(!showGroqKey)}
                          className="text-xs text-text-secondary hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          {showGroqKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{showGroqKey ? 'Hide' : 'Show'}</span>
                        </button>
                      </div>
                      <Input
                        id="user-groq-key"
                        type={showGroqKey ? "text" : "password"}
                        placeholder="gsk_..."
                        {...register('groqApiKey')}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-secondary">Response Temperature ({config.temperature ?? 0.3})</label>
                      <input
                        id="user-temperature"
                        type="range" min="0" max="1" step="0.05"
                        className="w-full accent-primary"
                        {...register('temperature', { valueAsNumber: true })}
                      />
                      <div className="flex justify-between text-xs text-text-secondary">
                        <span>Precise</span><span>Creative</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-8">
                    <label className="text-sm font-medium text-text-secondary">Custom System Prompt</label>
                    <textarea
                      id="user-system-prompt"
                      spellCheck={false}
                      autoComplete="off"
                      data-gramm="false"
                      data-gramm_editor="false"
                      data-enable-grammarly="false"
                      className="flex w-full rounded-button border border-white/10 bg-background-primary px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-primary min-h-[120px]"
                      placeholder="You are a friendly assistant for [Your Company Name]..."
                      {...register('systemPrompt')}
                    />
                  </div>

                  <Button id="user-save-ai" variant="primary" onClick={handleSubmit(handleSaveConfig)} disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save API Settings'}
                  </Button>
                </Card>

                <Card className="border-cyan-500/20 bg-cyan-500/5">
                  <div className="flex items-start gap-3">
                    <BrainCircuit className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white text-sm mb-1">Race Engine Active for Your Bot</h4>
                      <p className="text-sm text-text-secondary">
                        When you have both keys configured, Groq and Gemini are called simultaneously on every message.
                        The first to respond wins — you get the fastest possible answer, every time.
                        If one is rate-limited, the other automatically takes over with no delay.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* ── TAB: TRAIN KNOWLEDGE ──────────────────────────────────────── */}
            {activeTab === 'knowledge' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">Train Your Bot</h2>
                  <p className="text-text-secondary text-sm">
                    All training data is isolated to your account (App ID: <code className="text-white bg-white/10 px-1 rounded">{appId}</code>).
                    Other users cannot access or see your data.
                  </p>
                </div>

                {/* Web Crawler */}
                <Card>
                  <div className="mb-6 pb-6 border-b border-white/5">
                    <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                      <DownloadCloud className="w-5 h-5 text-primary" /> Web Crawler
                    </h3>
                    <p className="text-sm text-text-secondary">Enter your website URL. We'll crawl and extract content automatically.</p>
                  </div>
                  <UserCrawlForm appId={appId} onTrainingSuccess={fetchUserConfig} />
                </Card>

                {/* File Upload */}
                <Card>
                  <div className="mb-4 pb-4 border-b border-white/5">
                    <h3 className="text-base font-semibold text-white mb-1">Upload Files</h3>
                    <p className="text-sm text-text-secondary">PDF, TXT, DOCX, Markdown — added to your bot's knowledge base.</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="user-file-upload"
                    accept=".pdf,.txt,.docx,.md"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files?.[0])}
                  />
                  <Button id="user-upload-file-btn" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                    Choose File to Upload
                  </Button>
                </Card>

                {/* Raw Text */}
                <Card>
                  <div className="mb-4 pb-4 border-b border-white/5">
                    <h3 className="text-base font-semibold text-white mb-1">Paste Text / FAQs</h3>
                    <p className="text-sm text-text-secondary">Directly input knowledge as raw text or Markdown.</p>
                  </div>
                  <UserRawTextForm appId={appId} onTrainingSuccess={fetchUserConfig} />
                </Card>
              </div>
            )}

            {/* ── TAB: EMBED & DEPLOY ────────────────────────────────────────── */}
            {activeTab === 'embed' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">🚀 Embed & Deploy Your Bot</h2>
                  <p className="text-text-secondary text-sm">
                    Add your AI chatbot to any website in minutes. Your App ID is already embedded in every code snippet below.
                  </p>
                </div>

                {/* App ID summary */}
                <Card className="bg-gradient-to-br from-indigo-950/40 via-[#0d1224] to-[#080a16] border border-indigo-500/30 p-5 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-center">
                    <div className="lg:col-span-5 bg-black/40 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold mb-0.5">Your App ID</p>
                        <code className="font-mono text-indigo-300 font-bold text-xs sm:text-sm">{appId || '(loading...)'}</code>
                      </div>
                      <CopyButton text={appId} id="embed-copy-appid" label="Copy" />
                    </div>
                    <div className="lg:col-span-7 bg-black/40 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <p className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold mb-0.5">Widget URL</p>
                        <code className="font-mono text-slate-300 text-xs truncate block">{originUrl}/widget.js</code>
                      </div>
                      <CopyButton text={`${originUrl}/widget.js`} id="embed-copy-url" label="Copy" />
                    </div>
                  </div>
                </Card>

                {/* Platform selector */}
                <div className="flex flex-wrap gap-2">
                  {embedPlatforms.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      id={`embed-tab-${id}`}
                      onClick={() => setEmbedPlatform(id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                        embedPlatform === id
                          ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                          : 'text-text-secondary border-white/10 hover:text-white hover:border-white/20 bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>

                {/* HTML / Webflow */}
                {embedPlatform === 'html' && (
                  <Card>
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Globe className="w-5 h-5 text-primary" /> HTML / Webflow / Any Website</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 text-sm text-text-secondary">
                        <StepBadge num="1" />
                        <span>Open your website&apos;s HTML file or template editor.</span>
                      </div>
                      <div className="flex items-start gap-3 text-sm text-text-secondary">
                        <StepBadge num="2" />
                        <span>Paste the script below just before the closing <code className="text-white bg-white/10 px-1 rounded">&lt;/body&gt;</code> tag.</span>
                      </div>
                      <CodeBlock code={embedSnippets.html} id="copy-html-snippet" />
                      <div className="flex items-start gap-3 text-sm text-text-secondary">
                        <StepBadge num="3" />
                        <span>Save and refresh your page. The chat widget will appear in the bottom corner.</span>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Shopify */}
                {embedPlatform === 'shopify' && (
                  <Card>
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-green-400" /> Shopify Integration</h3>
                    <div className="space-y-4">
                      <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-green-300">
                        ✅ No plugins required. Paste one script tag — takes under 2 minutes.
                      </div>
                      <div className="flex items-start gap-3 text-sm text-text-secondary">
                        <StepBadge num="1" />
                        <span>In Shopify Admin, go to <strong className="text-white">Online Store → Themes</strong>.</span>
                      </div>
                      <div className="flex items-start gap-3 text-sm text-text-secondary">
                        <StepBadge num="2" />
                        <span>Click <strong className="text-white">⋯ → Edit Code</strong> next to your active theme.</span>
                      </div>
                      <div className="flex items-start gap-3 text-sm text-text-secondary">
                        <StepBadge num="3" />
                        <span>Open <code className="text-white bg-white/10 px-1 rounded">Layout/theme.liquid</code> from the file tree on the left.</span>
                      </div>
                      <div className="flex items-start gap-3 text-sm text-text-secondary">
                        <StepBadge num="4" />
                        <span>Paste this code just before <code className="text-white bg-white/10 px-1 rounded">&lt;/body&gt;</code>:</span>
                      </div>
                      <CodeBlock code={embedSnippets.shopify} id="copy-shopify-snippet" />
                      <div className="flex items-start gap-3 text-sm text-text-secondary">
                        <StepBadge num="5" />
                        <span>Click <strong className="text-white">Save</strong> and preview your store. Your AI chat widget is live! 🎉</span>
                      </div>
                    </div>
                  </Card>
                )}

                {/* WordPress */}
                {embedPlatform === 'wordpress' && (
                  <Card>
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><FileCode2 className="w-5 h-5 text-blue-400" /> WordPress Integration</h3>
                    <div className="space-y-6">
                      {/* Option A */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2 py-0.5 rounded-full bg-primary text-white text-xs font-bold">Option A</span>
                          <span className="text-sm font-medium text-white">Plugin Method (Recommended)</span>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 text-sm text-text-secondary">
                            <StepBadge num="1" />
                            <span>In WP Admin, go to <strong className="text-white">Plugins → Add New</strong> and search for <strong className="text-white">"WPCode"</strong> (free).</span>
                          </div>
                          <div className="flex items-start gap-3 text-sm text-text-secondary">
                            <StepBadge num="2" />
                            <span>Install & Activate. Go to <strong className="text-white">Code Snippets → Header &amp; Footer</strong>.</span>
                          </div>
                          <div className="flex items-start gap-3 text-sm text-text-secondary">
                            <StepBadge num="3" />
                            <span>Paste the code in the <strong className="text-white">Footer</strong> section:</span>
                          </div>
                          <CodeBlock code={embedSnippets.wordpress} id="copy-wp-snippet" />
                          <div className="flex items-start gap-3 text-sm text-text-secondary">
                            <StepBadge num="4" />
                            <span>Click <strong className="text-white">Save Changes</strong>. Visit your site — the widget is live!</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-white/5 pt-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2 py-0.5 rounded-full bg-white/10 text-text-secondary text-xs font-bold">Option B</span>
                          <span className="text-sm font-medium text-text-secondary">Manual (theme file)</span>
                        </div>
                        <p className="text-sm text-text-secondary">
                          In your theme&apos;s <code className="text-white bg-white/10 px-1 rounded">footer.php</code>, paste the same script before the closing <code className="text-white bg-white/10 px-1 rounded">&lt;/body&gt;</code> tag. Use this only if you have theme editing access and are comfortable editing PHP files.
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* React / Vite */}
                {embedPlatform === 'react' && (
                  <Card>
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Code2 className="w-5 h-5 text-cyan-400" /> React / Vite Integration</h3>
                    <div className="space-y-4">
                      <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-sm text-cyan-300">
                        No npm package needed — just mount a script tag via <code>useEffect</code>.
                      </div>
                      <div className="flex items-start gap-3 text-sm text-text-secondary">
                        <StepBadge num="1" />
                        <span>Create a <code className="text-white bg-white/10 px-1 rounded">ChatioWidget</code> component using the code below:</span>
                      </div>
                      <CodeBlock code={embedSnippets.react} id="copy-react-snippet" />
                      <div className="flex items-start gap-3 text-sm text-text-secondary">
                        <StepBadge num="2" />
                        <span>Add <code className="text-white bg-white/10 px-1 rounded">&lt;ChatioWidget /&gt;</code> once in your root <code className="text-white bg-white/10 px-1 rounded">App.jsx</code>.</span>
                      </div>
                      <div className="flex items-start gap-3 text-sm text-text-secondary">
                        <StepBadge num="3" />
                        <span>Run <code className="text-white bg-white/10 px-1 rounded">npm run dev</code> and open your app — the widget appears automatically.</span>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Next.js */}
                {embedPlatform === 'nextjs' && (
                  <Card>
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Code2 className="w-5 h-5 text-violet-400" /> Next.js Integration</h3>
                    <div className="space-y-4">
                      <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20 text-sm text-violet-300">
                        Uses Next.js&apos;s built-in <code>&lt;Script&gt;</code> component with <code>strategy="lazyOnload"</code> for optimal performance.
                      </div>
                      <div className="flex items-start gap-3 text-sm text-text-secondary">
                        <StepBadge num="1" />
                        <span>Open <code className="text-white bg-white/10 px-1 rounded">app/layout.js</code> (App Router) or <code className="text-white bg-white/10 px-1 rounded">pages/_app.js</code> (Pages Router).</span>
                      </div>
                      <div className="flex items-start gap-3 text-sm text-text-secondary">
                        <StepBadge num="2" />
                        <span>Add the <code className="text-white bg-white/10 px-1 rounded">&lt;Script&gt;</code> tag as shown:</span>
                      </div>
                      <CodeBlock code={embedSnippets.nextjs} id="copy-nextjs-snippet" />
                      <div className="flex items-start gap-3 text-sm text-text-secondary">
                        <StepBadge num="3" />
                        <span>Deploy or run <code className="text-white bg-white/10 px-1 rounded">npm run dev</code>. The widget loads after the page is interactive.</span>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Test your widget */}
                <Card className="border-status-success/20 bg-status-success/5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-status-success shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white text-sm mb-1">How to Test Your Widget</h4>
                      <ol className="text-sm text-text-secondary space-y-1 list-decimal pl-4">
                        <li>After embedding the script, open your website in a browser.</li>
                        <li>A chat bubble should appear in the corner of the page.</li>
                        <li>Click it and ask a question — the bot uses your trained knowledge.</li>
                        <li>If the widget doesn&apos;t appear, check your browser console for errors.</li>
                      </ol>
                    </div>
                  </div>
                </Card>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}

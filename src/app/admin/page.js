'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import axios from 'axios';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Palette, BrainCircuit, Database, DownloadCloud, Menu, X, CheckCircle2,
  ChevronRight, BarChart3, Shield, Users, MessageSquare, Zap, AlertTriangle, Settings2, Globe, Bot
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Admin Dashboard — Platform Owner Control Center
// Purpose: Global Chatio platform settings ONLY.
// Scope: Appearance defaults, global AI config, platform-wide knowledge base,
//        system settings (guardrails, rate limits), platform stats.
// NOT included: Embed guides, per-user integration docs (those live in /dashboard).
// ─────────────────────────────────────────────────────────────────────────────

function AdminCrawlerForm() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({ defaultValues: { maxPages: 30 } });
  const [crawlLogs, setCrawlLogs] = useState([]);

  const onCrawl = async (data) => {
    if (!data.url?.trim()) return;
    setCrawlLogs([{ type: 'progress', message: `🕷️ Starting deep crawl of ${data.url}...` }]);
    try {
      await axios.post('/api/train', { url: data.url.trim(), maxPages: Number(data.maxPages) || 30 });
      setCrawlLogs([
        { type: 'progress', message: `🕷️ Crawling ${data.url}...` },
        { type: 'done', message: '✅ Platform knowledge base updated successfully.' },
      ]);
    } catch (err) {
      setCrawlLogs((prev) => [...prev, { type: 'error', message: `❌ ${err.response?.data?.error || err.message}` }]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onCrawl)}>
      <div className="flex gap-3 mb-4">
        <Input
          id="admin-crawl-url"
          type="url"
          placeholder="https://yourwebsite.com"
          disabled={isSubmitting}
          className="flex-1"
          {...register('url', { required: true })}
        />
        <div className="space-y-1 shrink-0">
          <label className="text-xs text-text-secondary block">Max pages</label>
          <Input
            id="admin-max-pages"
            type="number"
            className="w-20"
            disabled={isSubmitting}
            {...register('maxPages')}
          />
        </div>
        <Button id="admin-start-crawl" type="submit" disabled={isSubmitting} className="self-end">
          {isSubmitting ? 'Crawling...' : 'Start Crawl'}
        </Button>
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

function AdminRawTextForm() {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  const [textStatus, setTextStatus] = useState(null);

  const onSaveText = async (data) => {
    if (!data.text?.trim()) return;
    setTextStatus('loading');
    try {
      await axios.post('/api/train', { text: data.text });
      setTextStatus({ ok: true, msg: '✅ Knowledge saved to platform base.' });
      reset();
    } catch (err) {
      setTextStatus({ ok: false, msg: `❌ ${err.response?.data?.error || err.message}` });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSaveText)}>
      <textarea
        id="admin-text-input"
        spellCheck={false}
        autoComplete="off"
        data-gramm="false"
        data-gramm_editor="false"
        data-enable-grammarly="false"
        className="flex w-full rounded-button border border-white/10 bg-background-primary px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-primary min-h-[150px] mb-4"
        placeholder="Paste FAQs, Markdown, product descriptions..."
        {...register('text', { required: true })}
      />
      <Button id="admin-save-text" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save to Knowledge Base'}
      </Button>
      {textStatus && textStatus !== 'loading' && (
        <p className={`mt-3 text-sm ${textStatus.ok ? 'text-status-success' : 'text-status-error'}`}>{textStatus.msg}</p>
      )}
    </form>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [config, setConfig] = useState(null);
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { register, handleSubmit, reset, watch, setValue, formState: { isSubmitting } } = useForm();

  // Platform stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const [fileStatus, setFileStatus] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    checkOwnerAuth();

    // 1. Exact-millisecond auto-logout timeout
    let timeoutId;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('chatio_owner_session');
      if (stored) {
        try {
          const session = JSON.parse(stored);
          const remaining = (session.expiresAt || 0) - Date.now();
          if (remaining > 0) {
            timeoutId = setTimeout(() => {
              toast.error('Master Owner session expired.');
              handleLogout();
            }, remaining);
          } else {
            handleLogout();
          }
        } catch {
          handleLogout();
        }
      }
    }

    // 2. Real-time detection if token is deleted in DevTools or other tab
    const handleStorageChange = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('chatio_owner_session');
        if (!stored) {
          handleLogout();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    document.addEventListener('visibilitychange', handleStorageChange);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
      document.removeEventListener('visibilitychange', handleStorageChange);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout request failed:', err);
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chatio_owner_session');
    }
    router.push('/admin/login');
  };

  const checkOwnerAuth = async () => {
    // 1. Strict Local Storage Token Requirement
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('chatio_owner_session');
      if (!stored) {
        // Missing token -> must log in again
        handleLogout();
        return;
      }

      try {
        const session = JSON.parse(stored);
        if (!session.authorized || !session.expiresAt || Date.now() >= session.expiresAt) {
          handleLogout();
          return;
        }
      } catch {
        handleLogout();
        return;
      }
    }

    // 2. Server-side session verification
    try {
      const res = await axios.get('/api/owner/stats');
      setStats(res.data);
      fetchConfig();
    } catch (err) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('chatio_owner_session');
      }
      router.push('/admin/login');
    }
  };




  const fetchConfig = async () => {
    try {
      const res = await axios.get('/api/admin/config');
      setConfig(res.data.config);
      reset(res.data.config);
    } catch (err) {
      console.error('[Admin] Failed to load config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (data) => {
    const loadingToastId = toast.loading('Saving platform settings...');
    try {
      const res = await axios.post('/api/admin/config', data);
      setConfig(res.data.config);
      reset(res.data.config);
      toast.success('Platform settings saved and live.', { id: loadingToastId });
    } catch (err) {
      toast.error(err.response?.data?.error || err.message, { id: loadingToastId });
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
    setFileStatus('loading');
    const form = new FormData();
    form.append('file', file);
    try {
      await axios.post('/api/train', form);
      setFileStatus({ ok: true, msg: `✅ Uploaded "${file.name}" to platform knowledge base.` });
    } catch (err) {
      setFileStatus({ ok: false, msg: `❌ ${err.response?.data?.error || err.message}` });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-text-secondary text-sm">Loading Admin Control Center...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'appearance', label: 'Appearance & UI',    icon: Palette     },
    { id: 'ai',         label: 'Global AI Engine',   icon: BrainCircuit },
    { id: 'knowledge',  label: 'Platform Knowledge', icon: Database    },
    { id: 'stats',      label: 'Platform Stats',     icon: BarChart3   },
    { id: 'system',     label: 'System & Security',  icon: Shield      },
  ];

  const NavItem = ({ id, label, icon: Icon }) => (
    <button
      id={`admin-nav-${id}`}
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

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-background-card border-r border-white/5 flex flex-col transition-transform transform lg:translate-x-0 lg:static lg:h-screen ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">C</div>
            <div>
              <span className="font-display font-bold text-white text-sm">Chatio</span>
              <p className="text-[10px] text-amber-400 font-semibold tracking-wide">ADMIN CONTROL</p>
            </div>
          </Link>
          <button className="lg:hidden text-text-secondary" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin badge */}
        <div className="mx-4 mt-4 mb-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Platform Owner Access
          </p>
          <p className="text-[11px] text-amber-400/70 mt-0.5">Changes affect entire platform</p>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
          {navItems.map((item) => <NavItem key={item.id} {...item} />)}
        </div>

        <div className="p-4 border-t border-white/5 space-y-2 mb-4">
          <Link href="/" className="block w-full">
            <Button variant="ghost" className="w-full justify-start text-text-secondary hover:text-white text-sm">
              <Globe className="w-4 h-4 mr-2 text-slate-400" /> Back to Site
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm"
          >
            <X className="w-4 h-4 mr-2" /> Log Out Owner
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 flex items-center px-6 lg:px-10 border-b border-white/5 bg-background-primary shrink-0 justify-between">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-text-secondary" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-base font-semibold text-white capitalize">
                {navItems.find(n => n.id === activeTab)?.label || activeTab}
              </h1>
              <p className="text-xs text-text-secondary hidden md:block">Platform-wide settings · Admin only</p>
            </div>
          </div>
          <Link href="/owner">
            <Button variant="secondary" size="sm" className="border-white/10 text-xs gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" /> Owner Stats
            </Button>
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 pb-20">

          <div className="max-w-4xl mx-auto space-y-6">

            {/* ── TAB: PLATFORM STATS ─────────────────────────────────────── */}
            {activeTab === 'stats' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-display font-bold text-white mb-1">Platform Overview</h2>
                  <p className="text-text-secondary text-sm">Real-time metrics across the entire Chatio platform.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { label: 'Total Registered Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                    { label: 'Active User Chatbots', value: stats?.totalBots ?? 0, icon: Bot, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                    { label: 'Trained Knowledge Bases', value: stats?.totalKnowledgeBases ?? 0, icon: Database, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                  ].map(({ label, value, icon: Icon, color, bg }) => (
                    <Card key={label} className="flex items-center gap-4 py-6 bg-background-card/80 border-white/10">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                        <Icon className={`w-6 h-6 ${color}`} />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-white">{String(value)}</p>
                        <p className="text-xs text-text-secondary font-medium mt-0.5">{label}</p>
                      </div>
                    </Card>
                  ))}
                </div>

                <Card>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white text-sm mb-1">Admin Scope Reminder</h4>
                      <p className="text-sm text-text-secondary">
                        Changes made here affect the <strong className="text-white">entire platform</strong> and all users.
                        Per-user bot customization, API keys, and embed integration docs are in each user&apos;s own
                        <strong className="text-white"> /dashboard</strong> — fully isolated from this control center.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* ── TAB: DEFAULT BRANDING ────────────────────────────────────── */}
            {activeTab === 'appearance' && config && (
              <Card>
                <div className="mb-6 pb-6 border-b border-white/5">
                  <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-primary" /> Platform Default Branding
                  </h3>
                  <p className="text-sm text-text-secondary">
                    These settings define how the main Chatio platform chatbot appears on the landing page.
                    Individual users customize their own bots in their dashboard.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Bot Name</label>
                    <Input type="text" id="admin-bot-name" {...register('botName')} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Widget Title</label>
                    <Input type="text" id="admin-widget-title" {...register('widgetTitle')} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Tagline / Status Text</label>
                    <Input type="text" id="admin-tagline" placeholder="Online · Powered by RAG" {...register('widgetDescription')} />
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
                      id="admin-avatar-bg"
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
                        type="color"
                        id="admin-primary-color-picker"
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
                        type="text"
                        id="admin-primary-color-text"
                        {...register('primaryColor')}
                        placeholder="#6366f1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Launcher Position</label>
                    <select
                      id="admin-launcher-position"
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
                    id="admin-welcome-message"
                    className="flex w-full rounded-button border border-white/10 bg-background-primary px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                    {...register('welcomeMessage')}
                  />
                </div>

                <div className="space-y-2 mb-8">
                  <label className="text-sm font-medium text-text-secondary">Footer Text</label>
                  <Input id="admin-footer-text" type="text" {...register('footerText')} />
                </div>

                {/* FAQ Chips */}
                <div className="pt-6 mb-8 border-t border-white/5">
                  <div className="mb-4">
                    <h4 className="text-base font-semibold text-white">Quick Suggestion Questions (FAQ Chips)</h4>
                    <p className="text-xs text-text-secondary">These 4 buttons appear above the input area to guide visitors on the platform landing page.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[0, 1, 2, 3].map((idx) => {
                      return (
                        <div key={idx} className="p-4 rounded-xl border border-white/10 bg-background-primary/50 space-y-3">
                          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Chip #{idx + 1}</p>
                          <div className="space-y-1">
                            <label className="text-xs text-slate-400">Button Label</label>
                            <Input
                              id={`admin-chip-label-${idx}`}
                              type="text"
                              placeholder={`Label ${idx + 1}`}
                              {...register(`suggestions.${idx}.label`)}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-slate-400">Full Prompt</label>
                            <Input
                              id={`admin-chip-prompt-${idx}`}
                              type="text"
                              placeholder="Full question sent to AI"
                              {...register(`suggestions.${idx}.prompt`)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── Widget Size Control ── */}
                <div className="pt-6 mb-8 border-t border-white/5">
                  <div className="mb-5">
                    <h4 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
                      📐 Widget Size Control
                    </h4>
                    <p className="text-xs text-text-secondary">
                      Set the width and height of the chat panel. Accepts pixels (e.g. <code className="text-white bg-white/10 px-1 rounded">480</code> or <code className="text-white bg-white/10 px-1 rounded">480px</code>) or percentage (e.g. <code className="text-white bg-white/10 px-1 rounded">90%</code>). Leave blank to use the default.
                    </p>
                  </div>

                  {/* Current size readout */}
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
                          id="admin-widget-width"
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
                          id="admin-widget-height"
                          type="text"
                          placeholder="e.g. 680 or 680px or 85%"
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

                <Button id="admin-save-branding" variant="primary" onClick={handleSubmit(handleSaveConfig)} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Platform Branding'}
                </Button>
              </Card>
            )}

            {/* ── TAB: GLOBAL AI CONFIG ────────────────────────────────────── */}
            {activeTab === 'ai' && config && (
              <div className="space-y-6">
                <Card>
                  <div className="mb-6 pb-6 border-b border-white/5">
                    <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                      <BrainCircuit className="w-5 h-5 text-primary" /> Global AI Configuration
                    </h3>
                    <p className="text-sm text-text-secondary">
                      Platform-level API keys and model settings. These are the defaults used when a user has not configured their own keys.
                      Individual users override these with their own keys in their dashboard.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-secondary">Default Primary Provider</label>
                      <select
                        id="admin-provider-select"
                        className="flex h-10 w-full rounded-button border border-white/10 bg-background-primary px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-primary"
                        {...register('provider')}
                      >
                        <option value="groq">Groq (primary — fastest)</option>
                        <option value="gemini">Gemini (primary — Google AI)</option>
                      </select>
                      <p className="text-xs text-text-secondary">With the Race Engine, both fire in parallel — this sets preferred priority.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-secondary">Temperature ({config.temperature ?? 0.3})</label>
                      <input
                        id="admin-temperature"
                        type="range" min="0" max="1" step="0.05"
                        className="w-full accent-primary"
                        {...register('temperature', { valueAsNumber: true })}
                      />
                      <div className="flex justify-between text-xs text-text-secondary">
                        <span>Precise (0)</span>
                        <span>Creative (1)</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-secondary">Platform Gemini API Key</label>
                      <Input id="admin-gemini-key" type="password" placeholder="AIzaSy..." {...register('geminiApiKey')} />
                      <p className="text-xs text-text-secondary">Used as fallback when users haven&apos;t added their own Gemini key.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-secondary">Platform Groq API Key</label>
                      <Input id="admin-groq-key" type="password" placeholder="gsk_..." {...register('groqApiKey')} />
                      <p className="text-xs text-text-secondary">Used as fallback when users haven&apos;t added their own Groq key.</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-8">
                    <label className="text-sm font-medium text-text-secondary">Global System Prompt</label>
                    <textarea
                      id="admin-system-prompt"
                      spellCheck={false}
                      autoComplete="off"
                      data-gramm="false"
                      data-gramm_editor="false"
                      data-enable-grammarly="false"
                      className="flex w-full rounded-button border border-white/10 bg-background-primary px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-primary min-h-[120px]"
                      placeholder="You are a helpful AI assistant..."
                      {...register('systemPrompt')}
                    />
                    <p className="text-xs text-text-secondary">Applied to the platform default chatbot. Users set their own in their dashboard.</p>
                  </div>

                  <Button id="admin-save-ai" variant="primary" onClick={handleSubmit(handleSaveConfig)} disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Global AI Config'}
                  </Button>
                </Card>

                {/* Race Engine Status */}
                <Card className="border-cyan-500/20 bg-cyan-500/5">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white text-sm mb-1">⚡ Race Engine Active</h4>
                      <p className="text-sm text-text-secondary">
                        Both Groq and Gemini are fired simultaneously on every request. The first valid response wins
                        and the slower provider is immediately aborted. Cooldowns (30s) are applied automatically on rate-limit (429) errors.
                        This is handled server-side — no client configuration needed.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* ── TAB: PLATFORM KNOWLEDGE BASE ─────────────────────────────── */}
            {activeTab === 'knowledge' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">Platform Knowledge Base</h2>
                  <p className="text-text-secondary text-sm">
                    This is the platform-wide knowledge store for the main Chatio landing page chatbot.
                    Individual users train their own isolated knowledge bases in their dashboard.
                  </p>
                </div>

                {/* Web Crawler */}
                <Card>
                  <div className="mb-6 pb-6 border-b border-white/5">
                    <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                      <DownloadCloud className="w-5 h-5 text-primary" /> Web Crawler
                    </h3>
                    <p className="text-sm text-text-secondary">Crawl a website and extract content into the platform knowledge base.</p>
                  </div>
                  <AdminCrawlerForm />
                </Card>

                {/* File Upload */}
                <Card>
                  <div className="mb-4 pb-4 border-b border-white/5">
                    <h3 className="text-base font-semibold text-white mb-1">Upload Documents</h3>
                    <p className="text-sm text-text-secondary">PDF, TXT, DOCX — added to platform knowledge base.</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept=".pdf,.txt,.docx,.md" className="hidden" id="admin-file-upload" onChange={(e) => handleFileUpload(e.target.files?.[0])} />
                  <Button id="admin-upload-file-btn" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                    Choose File
                  </Button>
                  {fileStatus && fileStatus !== 'loading' && (
                    <p className={`mt-3 text-sm ${fileStatus.ok ? 'text-status-success' : 'text-status-error'}`}>{fileStatus.msg}</p>
                  )}
                </Card>

                {/* Text Input */}
                <Card>
                  <div className="mb-4 pb-4 border-b border-white/5">
                    <h3 className="text-base font-semibold text-white mb-1">Paste Text / FAQs</h3>
                    <p className="text-sm text-text-secondary">Directly input knowledge content as raw text or Markdown.</p>
                  </div>
                  <AdminRawTextForm />
                </Card>
              </div>
            )}

            {/* ── TAB: SYSTEM & SECURITY ───────────────────────────────────── */}
            {activeTab === 'system' && config && (
              <div className="space-y-6">
                <Card>
                  <div className="mb-6 pb-6 border-b border-white/5">
                    <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" /> Guardrails & Security
                    </h3>
                    <p className="text-sm text-text-secondary">
                      Control what topics the AI responds to and protect against abuse. Applied platform-wide.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Guardrail toggles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: 'guardrailOffTopic', label: 'Block Off-Topic Requests', desc: 'Redirect recipes, sports, crypto questions back to business context.' },
                        { key: 'ssrfProtection',    label: 'SSRF Protection',          desc: 'Block internal IPs (127.0.0.1, 10.x, AWS metadata) in web crawl inputs.' },
                        { key: 'rateLimitEnabled',  label: 'Rate Limiting',            desc: 'Limit to 30 messages per minute per IP to prevent abuse.' },
                        { key: 'markdownScrub',     label: 'Strip Markdown from Responses', desc: 'Remove **, ##, __ from AI output for cleaner chat display.' },
                      ].map(({ key, label, desc }) => (
                        <div key={key} className="flex items-start justify-between gap-4 p-4 rounded-xl border border-white/10 bg-background-primary/50">
                          <div>
                            <p className="text-sm font-medium text-white">{label}</p>
                            <p className="text-xs text-text-secondary mt-0.5">{desc}</p>
                          </div>
                          <button
                            id={`admin-toggle-${key}`}
                            {...register(key)}
                            className={`w-11 h-6 rounded-full transition-colors shrink-0 relative ${watch(key) !== false ? 'bg-primary' : 'bg-white/10'}`}
                          >
                            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${watch(key) !== false ? 'left-6' : 'left-1'}`} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Rate limit config */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">Max Messages / Minute (per IP)</label>
                        <Input
                          id="admin-rate-limit-max"
                          type="number"
                          {...register('rateLimitMax', { valueAsNumber: true })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">Max Conversation History (messages)</label>
                        <Input
                          id="admin-max-history"
                          type="number"
                          {...register('maxHistoryMsgs', { valueAsNumber: true })}
                        />
                      </div>
                    </div>

                    <Button id="admin-save-system" variant="primary" onClick={handleSubmit(handleSaveConfig)}>
                      Save System Settings
                    </Button>
                  </div>
                </Card>

                {/* SSRF Blocked ranges info */}
                <Card className="border-red-500/20 bg-red-500/5">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white text-sm mb-2">SSRF Protected Ranges (Always Blocked)</h4>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                        {['127.0.0.1 / localhost', '10.0.0.0/8', '192.168.0.0/16', '172.16.0.0/12', '169.254.169.254 (AWS metadata)', 'fd00::/8 (IPv6 private)'].map(r => (
                          <code key={r} className="text-xs text-red-300 font-mono">{r}</code>
                        ))}
                      </div>
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

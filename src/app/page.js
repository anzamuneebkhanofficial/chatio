'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser, UserButton } from '@clerk/nextjs';
import ChatWidget from '@/components/ChatBot/Widget';
import DemoPanel from '@/components/ChatBot/Demo';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BrandMark } from '@/components/ui/BrandMark';
import {
  CheckCircle2,
  Code2,
  Database,
  Palette,
  LayoutTemplate,
  GitBranch,
  Menu,
  X,
  ArrowRight,
  Zap,
  ShieldCheck,
  Cpu,
  Layers,
  Globe,
  Sliders,
  Terminal,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Shield,
  ShoppingBag,
  Copy,
  Check,
  ChevronDown,
} from 'lucide-react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const { isSignedIn, isLoaded } = useUser();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem('chatio_owner_session');
      if (stored) {
        const session = JSON.parse(stored);
        setIsAdminLoggedIn(Boolean(session.expiresAt && session.expiresAt > Date.now()));
      }
    } catch {}
  }, []);

  const userIsLoggedIn = mounted && isLoaded && isSignedIn;

  const copyScriptSnippet = () => {
    const code = `<script src="https://chatio-ivory.vercel.app/widget.js" data-app-id="demo_bot" async></script>`;
    navigator.clipboard.writeText(code).then(() => {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-[#080a16] flex flex-col text-slate-100 selection:bg-indigo-600 selection:text-white">
      {/* ── Navigation Bar ── */}
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#080a16]/90 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/90 border border-indigo-400/30 flex items-center justify-center text-white shadow-sm transition-transform duration-150 group-hover:scale-[1.02]">
                <BrandMark size={18} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-display font-bold leading-tight tracking-tight text-white">Chatio</span>
                <span className="text-[10px] text-indigo-400 font-semibold leading-tight tracking-wider uppercase">by Anza</span>
              </div>
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 ml-2 px-2.5 py-0.5 rounded-full border border-indigo-500/25 bg-indigo-500/10 text-[10px] uppercase font-semibold text-indigo-300 whitespace-nowrap">
              <Cpu className="w-3 h-3 text-indigo-400" /> RAG LangChain
            </span>
          </div>

          {/* Categorized Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <div className="relative group">
              <button 
                type="button"
                className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors py-2 whitespace-nowrap cursor-pointer"
              >
                <span>Platform</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
              </button>
              <div className="absolute top-full left-0 w-64 p-2 bg-[#0d1020] border border-white/10 rounded-xl shadow-2xl opacity-0 translate-y-1 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-150 z-50">
                <Link href="#architecture" className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-white/[0.05] transition-colors">
                  <Cpu className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-white">RAG Vector Engine</div>
                    <div className="text-[11px] text-slate-400">LangChain & MongoDB Search</div>
                  </div>
                </Link>
                <Link href="#sandbox" className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-white/[0.05] transition-colors">
                  <Sliders className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-white">Live Model Sandbox</div>
                    <div className="text-[11px] text-slate-400">Test multi-tenant presets</div>
                  </div>
                </Link>
                <Link href="#features" className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-white/[0.05] transition-colors">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-white">Enterprise BYODB</div>
                    <div className="text-[11px] text-slate-400">Air-gapped database isolation</div>
                  </div>
                </Link>
              </div>
            </div>

            <div className="relative group">
              <button 
                type="button"
                className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors py-2 whitespace-nowrap cursor-pointer"
              >
                <span>Integrations</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
              </button>
              <div className="absolute top-full left-0 w-64 p-2 bg-[#0d1020] border border-white/10 rounded-xl shadow-2xl opacity-0 translate-y-1 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-150 z-50">
                <Link href="#platforms" className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-white/[0.05] transition-colors">
                  <Globe className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-white">WordPress & Shopify</div>
                    <div className="text-[11px] text-slate-400">One-line script embed</div>
                  </div>
                </Link>
                <Link href="#workflow" className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-white/[0.05] transition-colors">
                  <Layers className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-white">Shadow DOM Isolation</div>
                    <div className="text-[11px] text-slate-400">Zero CSS bleed guaranteed</div>
                  </div>
                </Link>
              </div>
            </div>

            {!mounted ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 animate-pulse">
                <Shield className="w-4 h-4 text-emerald-400/60" />
                <div className="w-16 h-3.5 rounded bg-white/10" />
              </div>
            ) : (
              <Link href="/admin" className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap">
                <Shield className="w-4 h-4 text-emerald-400" /> {isAdminLoggedIn ? 'Owner Console' : 'Admin'}
              </Link>
            )}

            <Link
              href="https://github.com/anzamuneebkhanofficial/chatio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <GitBranch className="w-4 h-4 text-cyan-400" />
              <span>GitHub</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                MIT Free
              </span>
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {!mounted || !isLoaded ? (
              <div className="flex items-center gap-3 animate-pulse">
                <div className="w-20 h-8 rounded-lg bg-white/5" />
                <div className="w-32 h-8 rounded-lg bg-indigo-600/30" />
              </div>
            ) : userIsLoggedIn ? (
              <div className="flex items-center gap-3">
                <Button href="/dashboard" variant="primary" size="sm" className="whitespace-nowrap">
                  <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                </Button>
                <div className="pl-2 border-l border-white/10 flex items-center min-w-[32px] min-h-[32px]">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button href="/login" variant="ghost" size="sm">
                  <LogIn className="w-3.5 h-3.5" /> Sign In
                </Button>
                <Button href="/signup" variant="primary" size="sm">
                  <UserPlus className="w-3.5 h-3.5" /> Get Started Free
                </Button>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <button 
            className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden w-full bg-[#0d1020] border-b border-white/10 p-5 flex flex-col gap-4 shadow-2xl">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">Navigation</p>
              <Link href="#architecture" className="text-sm font-medium text-white flex items-center gap-2 p-2 rounded-lg hover:bg-white/5" onClick={() => setMobileMenuOpen(false)}>
                <Cpu className="w-4 h-4 text-indigo-400" /> RAG Architecture
              </Link>
              <Link href="#sandbox" className="text-sm font-medium text-white flex items-center gap-2 p-2 rounded-lg hover:bg-white/5" onClick={() => setMobileMenuOpen(false)}>
                <Sliders className="w-4 h-4 text-violet-400" /> Live Sandbox
              </Link>
              <Link href="#platforms" className="text-sm font-medium text-white flex items-center gap-2 p-2 rounded-lg hover:bg-white/5" onClick={() => setMobileMenuOpen(false)}>
                <Globe className="w-4 h-4 text-emerald-400" /> Platform Embeds
              </Link>
              <Link href="/admin" className="text-sm font-medium text-white flex items-center gap-2 p-2 rounded-lg hover:bg-white/5" onClick={() => setMobileMenuOpen(false)}>
                <Shield className="w-4 h-4 text-emerald-400" /> {isAdminLoggedIn ? 'Owner Console' : 'Admin'}
              </Link>
              <Link
                href="https://github.com/anzamuneebkhanofficial/chatio"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-white flex items-center justify-between p-2 rounded-lg hover:bg-white/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-cyan-400" /> Open Source Code
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  MIT
                </span>
              </Link>
            </div>

            <div className="h-px bg-white/10 w-full my-1"></div>

            {!mounted || !isLoaded ? (
              <div className="h-10 w-full bg-white/5 rounded-xl animate-pulse" />
            ) : userIsLoggedIn ? (
              <div className="flex flex-col gap-3">
                <Button href="/dashboard" variant="primary" className="w-full justify-center" onClick={() => setMobileMenuOpen(false)}>
                  <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
                </Button>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-xs text-slate-300 font-semibold">User Profile</span>
                  <UserButton afterSignOutUrl="/" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button href="/login" variant="ghost" className="w-full justify-center" onClick={() => setMobileMenuOpen(false)}>
                  <LogIn className="w-4 h-4" /> Sign In
                </Button>
                <Button href="/signup" variant="primary" className="w-full justify-center" onClick={() => setMobileMenuOpen(false)}>
                  <UserPlus className="w-4 h-4" /> Get Started Free
                </Button>
              </div>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center">
        {/* ── Hero Section (Editorial High-Contrast Craft) ── */}
        <section id="architecture" className="w-full pt-16 pb-20 px-6 border-b border-white/[0.06]">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
              
              {/* Text & Positioning Column */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 text-xs font-semibold mb-6">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  RAG LangChain &bull; Groq Speed &bull; MongoDB Vector Search
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-display font-extrabold text-white leading-[1.12] tracking-tight mb-6">
                  Universal Custom AI Chatbots.<br />
                  <span className="text-indigo-400">Zero subscription fees.</span>
                </h1>
                
                <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                  Train intelligent customer support assistants on your private documentation and database. Deploy onto WordPress, Shopify, Next.js, or plain HTML in 60 seconds with 100% Shadow DOM CSS isolation.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-3.5 justify-center lg:justify-start">
                  <Button
                    href={userIsLoggedIn ? "/dashboard" : "/signup"}
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto font-semibold px-7"
                  >
                    {userIsLoggedIn ? 'Open Your Dashboard' : 'Start Building Free'} <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                  <Button
                    href="https://github.com/anzamuneebkhanofficial/chatio"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto px-6"
                  >
                    <GitBranch className="w-4 h-4" /> View Source Code
                  </Button>
                </div>

                <div className="mt-8 pt-6 border-t border-white/[0.08] grid grid-cols-3 gap-4 text-xs text-slate-400 max-w-lg mx-auto lg:mx-0">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-slate-200">Shadow DOM</span>
                    <span className="text-[11px] text-slate-400">Zero CSS bleed</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-slate-200">BYODB Sovereignty</span>
                    <span className="text-[11px] text-slate-400">Private MongoDB</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-slate-200">Sub-Second Latency</span>
                    <span className="text-[11px] text-slate-400">Groq & Gemini concurrent</span>
                  </div>
                </div>
              </div>

              {/* Interactive Demo Console */}
              <div id="sandbox" className="flex-1 w-full max-w-lg">
                <div className="bg-[#0d1020] rounded-2xl border border-white/10 p-6 shadow-xl">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                        <BrandMark size={14} className="text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-sm">Interactive Sandbox</h3>
                        <p className="text-[11px] text-slate-400">Switch knowledge presets to test live RAG inference</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Live
                    </span>
                  </div>

                  <DemoPanel />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── Single Script Snippet Bar ── */}
        <section className="w-full py-8 px-6 bg-[#0b0e1d] border-b border-white/[0.06]">
          <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left">
              <Code2 className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Universal Embed Script</p>
                <p className="text-sm text-slate-200 font-medium">Add to your website footer &mdash; compatible with all site builders.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto bg-[#080a16] border border-white/10 rounded-xl px-3 py-1.5">
              <code className="text-xs font-mono text-indigo-300 truncate max-w-[280px] sm:max-w-md">
                &lt;script src=&quot;https://chatio-ivory.vercel.app/widget.js&quot; data-app-id=&quot;YOUR_BOT_ID&quot; async&gt;&lt;/script&gt;
              </code>
              <button
                type="button"
                onClick={copyScriptSnippet}
                className="shrink-0 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Copy embed snippet"
                aria-label="Copy embed snippet"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </section>

        {/* ── Platform Compatibility Grid ── */}
        <section id="platforms" className="w-full py-16 px-6 border-b border-white/[0.06]">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-10">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Supported Environments</h2>
              <p className="text-lg font-display font-bold text-white">Embed seamlessly with complete CSS encapsulation</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-sm">
              <div className="flex flex-col items-center p-4 rounded-xl bg-[#0d1020] border border-white/[0.08] text-center">
                <Code2 className="w-6 h-6 text-indigo-400 mb-2" />
                <span className="font-semibold text-white">Vanilla HTML / JS</span>
                <span className="text-[11px] text-slate-400 mt-1">Single script tag</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-xl bg-[#0d1020] border border-white/[0.08] text-center">
                <LayoutTemplate className="w-6 h-6 text-violet-400 mb-2" />
                <span className="font-semibold text-white">WordPress</span>
                <span className="text-[11px] text-slate-400 mt-1">Header/Footer script</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-xl bg-[#0d1020] border border-white/[0.08] text-center">
                <ShoppingBag className="w-6 h-6 text-cyan-400 mb-2" />
                <span className="font-semibold text-white">Shopify</span>
                <span className="text-[11px] text-slate-400 mt-1">theme.liquid snippet</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-xl bg-[#0d1020] border border-white/[0.08] text-center">
                <Globe className="w-6 h-6 text-emerald-400 mb-2" />
                <span className="font-semibold text-white">Webflow</span>
                <span className="text-[11px] text-slate-400 mt-1">Custom code embed</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-xl bg-[#0d1020] border border-white/[0.08] text-center col-span-2 sm:col-span-1">
                <Terminal className="w-6 h-6 text-amber-400 mb-2" />
                <span className="font-semibold text-white">React & Next.js</span>
                <span className="text-[11px] text-slate-400 mt-1">useEffect or next/script</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Asymmetric Workflow (Breaking the 3-Column AI Cliché) ── */}
        <section id="workflow" className="w-full py-20 px-6 border-b border-white/[0.06]">
          <div className="container mx-auto max-w-5xl">
            <div className="mb-14">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Implementation Process</span>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mt-1">Three deliberate steps to deployment</h2>
              <p className="text-slate-400 text-sm max-w-xl mt-2">Zero complex microservices or server configurations required.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Step 1: Connect Data (7 Cols) */}
              <div className="md:col-span-7 rounded-2xl bg-[#0d1020] border border-white/[0.08] p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-xs">01</span>
                    <span className="text-xs font-mono text-slate-400">Ingestion Layer</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Connect documentation or database</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Provide web crawling URLs, paste raw product catalogs, or configure your private MongoDB Vector Search instance. Ingested data is chunked and embedded via LangChain.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center gap-4 text-xs text-slate-400 font-mono">
                  <span>URL Crawl</span> &bull; <span>Markdown/Text</span> &bull; <span>Vector Search</span>
                </div>
              </div>

              {/* Step 2: Tailor Brand & Identity (5 Cols) */}
              <div className="md:col-span-5 rounded-2xl bg-[#0d1020] border border-white/[0.08] p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/30 text-violet-400 flex items-center justify-center font-bold text-xs">02</span>
                    <span className="text-xs font-mono text-slate-400">Brand Config</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Customize visual appearance</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Set your brand accent color, bot name, welcome greeting, suggestion chips, and logo avatar. Changes sync immediately to deployed widgets.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center gap-4 text-xs text-slate-400 font-mono">
                  <span>Theme Colors</span> &bull; <span>Custom Avatar</span> &bull; <span>Welcome Copy</span>
                </div>
              </div>

              {/* Step 3: Embed Snippet (12 Cols Span) */}
              <div className="md:col-span-12 rounded-2xl bg-[#0d1020] border border-white/[0.08] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold text-xs">03</span>
                    <h3 className="text-lg font-bold text-white">Embed one script tag</h3>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Insert the snippet before the closing body tag of your website. The widget mounts inside an open Shadow DOM root, guaranteeing zero style bleed on WordPress, Shopify, or React.
                  </p>
                </div>
                <div className="shrink-0 w-full md:w-auto">
                  <Button href={userIsLoggedIn ? "/dashboard" : "/signup"} variant="primary" size="md" className="w-full md:w-auto font-semibold">
                    {userIsLoggedIn ? 'Configure in Dashboard' : 'Get Your Embed Code'} <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Architectural Bento Matrix (Breaking the 6-Card Icon Grid) ── */}
        <section id="features" className="w-full py-20 px-6 border-b border-white/[0.06]">
          <div className="container mx-auto max-w-5xl">
            <div className="mb-14">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Core Architecture</span>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mt-1">Engineered for production resilience</h2>
              <p className="text-slate-400 text-sm max-w-xl mt-2">Bespoke technical features designed without artificial SaaS constraints.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Feature A: Dual Model Engine Racing (7 Cols) */}
              <div className="md:col-span-7 rounded-2xl bg-[#0d1020] border border-white/[0.08] p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 mb-4">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Groq &times; Gemini Dual-Engine Racing</h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-6">
                    Our dual-model racing architecture calls Groq LPUs for rapid sub-second generation while concurrently verifying answers through Google Gemini 3.6 for high-accuracy reasoning.
                  </p>
                </div>

                <div className="bg-[#080a16] p-4 rounded-xl border border-white/[0.06] space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">Chatio Dual Engine</span>
                    <span className="text-emerald-400 font-mono font-bold">~480 ms</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[25%]" />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500 font-mono">Conventional RAG API</span>
                    <span className="text-slate-400 font-mono font-bold">~2,800 ms</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-slate-600 rounded-full w-[85%]" />
                  </div>
                </div>
              </div>

              {/* Feature B: Shadow DOM Encapsulation (5 Cols) */}
              <div className="md:col-span-5 rounded-2xl bg-[#0d1020] border border-white/[0.08] p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 mb-4">
                    <LayoutTemplate className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">100% Shadow DOM Isolation</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Third-party sites frequently ship aggressive global CSS (e.g., universal reset margins, base font overrides). Chatio embeds strictly within an open Shadow DOM root, isolating all widget styles.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center gap-2 text-xs text-emerald-400 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Zero style collisions with host site
                </div>
              </div>

              {/* Feature C: Private BYODB (4 Cols) */}
              <div className="md:col-span-4 rounded-2xl bg-[#0d1020] border border-white/[0.08] p-6 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 mb-3">
                    <Database className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5">BYODB Sovereignty</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Connect your own MongoDB Atlas vector search cluster. Your training chunks and chat history never touch our shared databases.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-indigo-300 mt-4">Air-Gapped Privacy</span>
              </div>

              {/* Feature D: Guardrails & SSRF (4 Cols) */}
              <div className="md:col-span-4 rounded-2xl bg-[#0d1020] border border-white/[0.08] p-6 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-3">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5">Pre-Inference Guardrails</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Incoming user messages are pre-evaluated to reject off-topic questions, prompt injections, and SSRF attacks before executing LLM queries.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-emerald-300 mt-4">SSRF & Injection Filters</span>
              </div>

              {/* Feature E: 100% Open Source MIT (4 Cols) */}
              <div className="md:col-span-4 rounded-2xl bg-[#0d1020] border border-white/[0.08] p-6 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/25 flex items-center justify-center text-violet-400 mb-3">
                    <GitBranch className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5">Open Source Autonomy</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Licensed under the MIT License. Deploy for personal projects, commercial agencies, or client stores with zero recurring subscription fees.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-violet-300 mt-4">MIT &bull; Zero SaaS Lock-in</span>
              </div>

            </div>
          </div>
        </section>

        {/* ── Statement Colophon Close (Hallmark Ft5 Style) ── */}
        <section className="w-full py-20 px-6 bg-[#080a16]">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white mb-4">
              Deploy your custom RAG chatbot today.
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
              Open source, isolated, and completely free. Start now in your browser with zero server setup.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button href={userIsLoggedIn ? "/dashboard" : "/signup"} variant="primary" size="lg" className="w-full sm:w-auto font-semibold px-8">
                {userIsLoggedIn ? 'Go to Dashboard' : 'Create Free Account'} <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <Button
                href="https://github.com/anzamuneebkhanofficial/chatio"
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-6"
              >
                <GitBranch className="w-4 h-4" /> View GitHub Repository
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* ── Architectural Statement Footer ── */}
      <footer className="w-full border-t border-white/[0.08] py-12 px-6 bg-[#060812]">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 pb-10 border-b border-white/[0.06]">
            
            <div className="max-w-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/90 border border-indigo-400/30 flex items-center justify-center text-white">
                  <BrandMark size={16} className="text-white" />
                </div>
                <span className="font-display font-bold text-white text-base tracking-tight">Chatio</span>
                <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">by Anza</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Universal Custom RAG AI Chatbot platform with 100% Shadow DOM style encapsulation. Engineered with Next.js 16, LangChain, Groq, and MongoDB.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
              <div>
                <p className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">Platform</p>
                <ul className="space-y-2 text-slate-400">
                  <li><Link href="#architecture" className="hover:text-white transition-colors">RAG Engine</Link></li>
                  <li><Link href="#sandbox" className="hover:text-white transition-colors">Live Sandbox</Link></li>
                  <li><Link href="#platforms" className="hover:text-white transition-colors">Platforms</Link></li>
                  <li><Link href="/dashboard" className="hover:text-white transition-colors">User Dashboard</Link></li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">Security</p>
                <ul className="space-y-2 text-slate-400">
                  <li><span className="text-slate-400">Shadow DOM Isolation</span></li>
                  <li><span className="text-slate-400">AES-256-GCM Encryption</span></li>
                  <li><span className="text-slate-400">Private BYODB Option</span></li>
                  <li><Link href="/admin" className="hover:text-white transition-colors">Owner Console</Link></li>
                </ul>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <p className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">Developer</p>
                <ul className="space-y-2 text-slate-400">
                  <li>
                    <Link
                      href="https://github.com/anzamuneebkhanofficial/chatio"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors flex items-center gap-1"
                    >
                      <GitBranch className="w-3 h-3 text-cyan-400" /> GitHub Source
                    </Link>
                  </li>
                  <li><span className="text-slate-400">MIT Open Source</span></li>
                  <li><span className="text-slate-400">v1.0 Production</span></li>
                </ul>
              </div>
            </div>

          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>
              &copy; {new Date().getFullYear()} Chatio by Anza. Crafted by <strong className="text-slate-300 font-medium">Muhammad Anza Muneeb Khan</strong>.
            </p>
            <div className="flex items-center gap-4 text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> All systems operational
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Global Floating Chat Widget ── */}
      <ChatWidget />
    </div>
  );
}

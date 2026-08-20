'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser, UserButton } from '@clerk/nextjs';
import ChatWidget from '@/components/ChatBot/Widget';
import DemoPanel from '@/components/ChatBot/Demo';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  CheckCircle2,
  Code2,
  Database,
  Palette,
  Settings,
  LayoutTemplate,
  GitBranch,
  Menu,
  X,
  ArrowRight,
  Sparkles,
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
} from 'lucide-react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  return (
    <div className="min-h-screen bg-background-primary flex flex-col text-slate-100">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-background-primary/85 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/25 transition-transform group-hover:scale-105">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-display font-bold leading-tight tracking-tight">Chatio</span>
                <span className="text-[10px] text-indigo-400 font-semibold leading-tight uppercase tracking-wider">by Anza</span>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-1 ml-2 px-2.5 py-0.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-[10px] uppercase font-semibold text-indigo-300">
              <Cpu className="w-3 h-3 text-indigo-400" /> RAG LangChain
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-7">
            <Link href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" /> Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-violet-400" /> How it works
            </Link>
            {!mounted ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 animate-pulse">
                <Shield className="w-4 h-4 text-emerald-400/60" />
                <div className="w-16 h-3.5 rounded bg-white/10" />
              </div>
            ) : (
              <Link href="/admin" className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" /> {isAdminLoggedIn ? 'Admin Dashboard' : 'Admin'}
              </Link>
            )}
            <Link
              href="https://github.com/anzamuneebkhanofficial/chatio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-slate-300 hover:text-white transition-all flex items-center gap-1.5 group px-2 py-1 rounded-lg hover:bg-white/5"
              title="Get 100% Free Open-Source Code on GitHub"
            >
              <GitBranch className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span>GitHub</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Free Code
              </span>
            </Link>
          </nav>
          
          <div className="hidden md:flex items-center gap-3">
            {!mounted || !isLoaded ? (
              <div className="flex items-center gap-3 animate-pulse">
                <div className="w-20 h-8 rounded-lg bg-white/5" />
                <div className="w-32 h-8 rounded-lg bg-indigo-500/20" />
              </div>
            ) : userIsLoggedIn ? (
              <div className="flex items-center gap-3">
                <Button href="/dashboard" variant="primary" size="sm" className="gap-2 shadow-md shadow-indigo-500/25">
                  <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
                </Button>
                <div className="pl-2 border-l border-white/10 flex items-center min-w-[32px] min-h-[32px]">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button href="/login" variant="ghost" size="sm" className="gap-1.5 text-slate-300 hover:text-white">
                  <LogIn className="w-4 h-4" /> Sign In
                </Button>
                <Button href="/signup" variant="primary" size="sm" className="gap-1.5 shadow-md shadow-indigo-500/20">
                  <UserPlus className="w-4 h-4" /> Get Started Free
                </Button>
              </div>
            )}
          </div>

          <button 
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-background-card/95 backdrop-blur-2xl border-b border-white/10 p-5 flex flex-col gap-4 shadow-2xl">
            <Link href="#features" className="text-sm font-medium text-white flex items-center gap-2 py-1" onClick={() => setMobileMenuOpen(false)}>
              <Layers className="w-4 h-4 text-indigo-400" /> Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-white flex items-center gap-2 py-1" onClick={() => setMobileMenuOpen(false)}>
              <Sliders className="w-4 h-4 text-violet-400" /> How it works
            </Link>
            {!mounted ? (
              <div className="flex items-center gap-2 py-1 animate-pulse">
                <Shield className="w-4 h-4 text-emerald-400/60" />
                <div className="w-24 h-4 rounded bg-white/10" />
              </div>
            ) : (
              <Link href="/admin" className="text-sm font-medium text-white flex items-center gap-2 py-1" onClick={() => setMobileMenuOpen(false)}>
                <Shield className="w-4 h-4 text-emerald-400" /> {isAdminLoggedIn ? 'Admin Dashboard' : 'Admin'}
              </Link>
            )}

            <Link
              href="https://github.com/anzamuneebkhanofficial/chatio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-white flex items-center justify-between py-1.5 px-1 rounded-lg hover:bg-white/5"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-cyan-400" /> GitHub Source Code
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                100% Free
              </span>
            </Link>
            <div className="h-px bg-white/10 w-full my-1"></div>
            {!mounted || !isLoaded ? (
              <div className="h-10 w-full bg-white/5 rounded-xl animate-pulse" />
            ) : userIsLoggedIn ? (
              <div className="flex flex-col gap-3">
                <Button href="/dashboard" variant="primary" className="w-full justify-center gap-2 shadow-lg shadow-indigo-500/25" onClick={() => setMobileMenuOpen(false)}>
                  <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
                </Button>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-xs text-slate-300 font-semibold">Account Profile</span>
                  <UserButton afterSignOutUrl="/" />
                </div>
              </div>
            ) : (
              <>
                <Button href="/login" variant="ghost" className="w-full justify-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <LogIn className="w-4 h-4" /> Sign In
                </Button>
                <Button href="/signup" variant="primary" className="w-full justify-center gap-2 shadow-lg shadow-indigo-500/25" onClick={() => setMobileMenuOpen(false)}>
                  <UserPlus className="w-4 h-4" /> Get Started Free
                </Button>
              </>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center">
        {/* ── Hero Section ── */}
        <section className="w-full pt-20 pb-20 px-6 overflow-hidden relative">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-violet-600/15 to-cyan-500/10 blur-[120px] pointer-events-none rounded-full" />

          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-14">
              
              <div className="flex-1 text-center lg:text-left z-10">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold mb-6">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                  <Zap className="w-3.5 h-3.5 text-indigo-400" />
                  v1.0 Production Ready
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white leading-[1.12] tracking-tight mb-6">
                  Add an AI chat widget to any website in <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400">5 minutes</span>
                </h1>
                
                <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Powered by your own data with RAG LangChain. Connect your database, customize the design, and embed a smart assistant on WordPress, Shopify, Next.js, or plain HTML.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                  <Button href={userIsLoggedIn ? "/dashboard" : "/signup"} variant="primary" size="lg" className="w-full sm:w-auto font-semibold gap-2 shadow-xl shadow-indigo-500/25 px-8 py-5">
                    {userIsLoggedIn ? 'Open Your Dashboard' : 'Create Your Bot'} <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="mt-8 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-green-400" /> Zero Code Setup
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-green-400" /> Shadow DOM Isolated
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-green-400" /> Free Gemini & Groq
                  </div>
                </div>
              </div>

              {/* Interactive Demo Switcher */}
              <div className="flex-1 w-full max-w-lg relative z-10">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 rounded-[26px] blur-xl opacity-30 animate-pulse"></div>
                <div className="relative bg-background-secondary/95 backdrop-blur-2xl rounded-[22px] border border-white/15 p-6 shadow-2xl">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-sm">Interactive Knowledge Switcher</h3>
                        <p className="text-xs text-slate-400">Click a knowledge source to instantly train the live chatbot</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Live
                    </span>
                  </div>

                  <DemoPanel />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── Platform Compatibility ── */}
        <section className="w-full py-12 border-y border-white/5 bg-background-card/40 backdrop-blur-sm">
          <div className="container mx-auto px-6 text-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-8">Works seamlessly everywhere with one script tag</p>
            <div className="flex flex-wrap items-center justify-center gap-10 opacity-75 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-2 font-bold text-lg text-slate-200">
                <Code2 className="w-5 h-5 text-indigo-400"/> HTML / JavaScript
              </div>
              <div className="flex items-center gap-2 font-bold text-lg text-slate-200">
                <LayoutTemplate className="w-5 h-5 text-violet-400"/> WordPress
              </div>
              <div className="flex items-center gap-2 font-bold text-lg text-slate-200">
                <Settings className="w-5 h-5 text-cyan-400"/> Shopify
              </div>
              <div className="flex items-center gap-2 font-bold text-lg text-slate-200">
                <Globe className="w-5 h-5 text-emerald-400"/> Webflow
              </div>
              <div className="flex items-center gap-2 font-bold text-lg text-slate-200">
                <Terminal className="w-5 h-5 text-amber-400"/> React & Next.js
              </div>
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="how-it-works" className="w-full py-24 px-6 relative">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4 text-white">From zero to live in 3 steps</h2>
              <p className="text-slate-400 max-w-xl mx-auto">No complex configuration. Just connect your content, customize the design, and deploy.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-background-card/60 border border-white/10 shadow-lg hover:border-indigo-500/40 transition-colors">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-6 shadow-lg relative">
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">1</div>
                  <Database className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">Connect your data</h3>
                <p className="text-sm text-slate-400">Upload documents or sync your database to give your bot comprehensive business knowledge.</p>
              </div>

              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-background-card/60 border border-white/10 shadow-lg hover:border-violet-500/40 transition-colors">
                <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center mb-6 shadow-lg relative">
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center">2</div>
                  <Palette className="w-8 h-8 text-violet-400" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">Customize your bot</h3>
                <p className="text-sm text-slate-400">Match your brand colors, custom avatar, and write a personalized welcome message.</p>
              </div>

              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-background-card/60 border border-white/10 shadow-lg hover:border-cyan-500/40 transition-colors">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-6 shadow-lg relative">
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-cyan-600 text-white text-xs font-bold flex items-center justify-center">3</div>
                  <Code2 className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">Embed one script tag</h3>
                <p className="text-sm text-slate-400">Copy and paste the snippet into your website's footer. Works anywhere with 100% style isolation.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Key Features ── */}
        <section id="features" className="w-full py-24 px-6 bg-background-card/30 border-y border-white/5">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4 text-white">Enterprise features, simplified</h2>
              <p className="text-slate-400 max-w-xl mx-auto">Everything you need to run a production-ready AI agent with security guardrails.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card hover className="flex gap-4 p-6 bg-background-card/80 border-white/10">
                <div className="shrink-0 pt-1">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <Database className="w-5 h-5 text-indigo-400"/>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold mb-1.5 text-white">Dual Storage & BYODB</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">Choose Managed AES-256 Cloud or Bring Your Own Database (BYODB) for 100% private MongoDB isolation.</p>
                </div>
              </Card>

              <Card hover className="flex gap-4 p-6 bg-background-card/80 border-white/10">
                <div className="shrink-0 pt-1">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-amber-400"/>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold mb-1.5 text-white">Gemini × Groq Racing</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">Dual-model auto-racing engine calls Gemini 3.6 & Groq concurrently for sub-second responses.</p>
                </div>
              </Card>

              <Card hover className="flex gap-4 p-6 bg-background-card/80 border-white/10">
                <div className="shrink-0 pt-1">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <LayoutTemplate className="w-5 h-5 text-cyan-400"/>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold mb-1.5 text-white">Shadow DOM Isolation</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">100% CSS encapsulated. Our widget styles will never bleed into or conflict with your host website.</p>
                </div>
              </Card>

              <Card hover className="flex gap-4 p-6 bg-background-card/80 border-white/10">
                <div className="shrink-0 pt-1">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <Palette className="w-5 h-5 text-violet-400"/>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold mb-1.5 text-white">Total Visual Control</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">Brand colors, positions, custom avatar, suggestions, and copy tailored precisely to your brand.</p>
                </div>
              </Card>

              <Card hover className="flex gap-4 p-6 bg-background-card/80 border-white/10">
                <div className="shrink-0 pt-1">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-emerald-400"/>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold mb-1.5 text-white">Smart Guardrails & SSRF</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">Pre-evaluates incoming queries to block prompt injections, off-topic chats, and internal IP crawling.</p>
                </div>
              </Card>

              <Card hover className="flex gap-4 p-6 bg-background-card/80 border-white/10">
                <div className="shrink-0 pt-1">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <GitBranch className="w-5 h-5 text-indigo-400"/>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold mb-1.5 text-white">100% Free & Open Source</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">Zero SaaS fees. Full data sovereignty. Free for commercial and personal websites under MIT License.</p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="w-full py-24 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-violet-500/10 pointer-events-none"></div>
          <div className="container mx-auto max-w-4xl text-center relative z-10">
            <h2 className="text-3xl sm:text-5xl font-display font-bold mb-6 text-white">Ready to upgrade your website?</h2>
            <p className="text-base sm:text-lg text-slate-300 mb-10 max-w-2xl mx-auto">
              Join store owners and developers adding custom AI chatbots to their websites in minutes with zero subscription fees.
            </p>
            <Button href={userIsLoggedIn ? "/dashboard" : "/signup"} variant="primary" size="lg" className="font-bold text-base sm:text-lg px-8 py-5 shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 gap-2">
              <Sparkles className="w-5 h-5" /> {userIsLoggedIn ? 'Go to Your Dashboard' : 'Get Started Free'} <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="w-full border-t border-white/5 py-8 bg-background-primary">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              <Sparkles className="w-3 h-3" />
            </div>
            <span className="text-sm text-slate-400 font-medium">
              Chatio by Anza &copy; {new Date().getFullYear()} · Created by <strong className="text-white">Muhammad Anza Muneeb Khan</strong>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="https://github.com/anzamuneebkhanofficial/chatio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 group"
            >
              <GitBranch className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span>GitHub</span>
            </Link>
            <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>

      {/* ── Global Floating Chat Widget ── */}
      <ChatWidget />
    </div>
  );
}

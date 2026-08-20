import { SignIn, ClerkLoading, ClerkLoaded } from '@clerk/nextjs';
import Link from 'next/link';
import { Sparkles, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary p-4 sm:p-6 lg:p-8 relative overflow-hidden text-slate-100">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[550px] h-[550px] bg-violet-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Horizontal Widescreen Card */}
      <div className="w-full max-w-4xl relative z-10 grid grid-cols-1 md:grid-cols-12 rounded-2xl border border-indigo-500/25 bg-[#0d1224]/98 backdrop-blur-2xl shadow-2xl shadow-indigo-950/70 overflow-hidden">
        {/* Left Side Showcase Banner (5 cols) */}
        <div className="md:col-span-5 bg-gradient-to-br from-indigo-950/70 via-background-secondary/90 to-[#0d1224] p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10 relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-6">
              <Link href="/" className="inline-flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/30 transition-transform group-hover:scale-105">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-display font-bold leading-tight">Chatio</span>
                  <span className="text-[10px] text-indigo-400 font-semibold leading-tight uppercase tracking-wider">by Anza</span>
                </div>
              </Link>
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20"
              >
                <ShieldCheck className="w-3 h-3" /> Owner
              </Link>
            </div>

            <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-2 leading-snug">
              Welcome Back to Chatio AI
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
              Sign in to manage your custom AI chatbots, knowledge base training, and embed codes.
            </p>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Instant Multi-Tenant Chatbot Dashboard</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Real-Time RAG Knowledge Ingestion</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>High-Speed Groq & Gemini Acceleration</span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              v1.0 Ready
            </span>
          </div>
        </div>

        {/* Right Side Clerk Form (7 cols) */}
        <div className="md:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center items-center min-h-[440px]">
          <ClerkLoading>
            <div className="w-full max-w-sm flex flex-col items-center justify-center p-6 space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-white">Loading secure sign in...</p>
                <p className="text-xs text-slate-400">Connecting to Chatio AI</p>
              </div>
              <div className="w-full space-y-3 pt-3">
                <div className="h-11 bg-white/5 border border-white/10 rounded-xl animate-pulse" />
                <div className="h-11 bg-indigo-600/30 rounded-xl animate-pulse" />
              </div>
            </div>
          </ClerkLoading>

          <ClerkLoaded>
            <SignIn
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'w-full shadow-none bg-transparent border-0 p-0 overflow-hidden',
                  header: 'mb-6 text-center',
                  headerTitle: 'text-white font-display text-2xl sm:text-3xl font-bold tracking-tight text-center mb-2',
                  headerSubtitle: 'text-slate-300 text-sm sm:text-base mt-1 text-center',
                  socialButtonsBlockButton: 'hidden',
                  socialButtonsProviderIcon: 'hidden',
                  dividerRow: 'hidden',
                  formField: 'mb-4',
                  formFieldLabel: 'text-sm text-slate-200 font-semibold mb-2 block',
                  formFieldInput: 'bg-[#f1f5f9] border-2 border-slate-300 text-slate-900 placeholder:text-slate-500 rounded-xl px-4 py-3.5 text-sm font-semibold focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/20 transition-all w-full',
                  otpCodeFieldInputs: 'flex flex-row gap-3 justify-center my-6',
                  otpCodeFieldInput: 'bg-[#f1f5f9] text-slate-950 font-bold text-xl text-center border-2 border-slate-300 rounded-xl focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/25 shadow-md w-12 h-14',
                  formButtonPrimary: 'w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm sm:text-base py-3.5 sm:py-4 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 uppercase tracking-wider mt-3',
                  footer: 'bg-white/[0.03] border-t border-white/10 p-4 sm:p-5 mt-6 rounded-2xl flex flex-col items-center justify-center gap-3',
                  footerAction: 'flex flex-row items-center justify-center gap-1.5 whitespace-nowrap w-full',
                  footerActionText: 'text-slate-200 text-sm font-medium',
                  footerActionLink: 'text-indigo-400 hover:text-white font-bold text-sm underline underline-offset-4 transition-colors ml-1',
                  identityPreview: 'bg-indigo-500/15 border border-indigo-500/30 rounded-xl p-3.5 my-4 text-white flex items-center justify-between',
                  identityPreviewText: 'text-white font-semibold text-sm sm:text-base',
                  identityPreviewEditButton: 'text-indigo-400 hover:text-indigo-300 font-bold text-sm p-1',
                  formResendCodeLink: 'text-indigo-400 hover:text-indigo-300 font-bold text-sm underline underline-offset-4 mt-2 inline-block',
                  footerPages: 'text-slate-400 text-xs flex flex-row items-center justify-center gap-1.5',
                  footerPagesLink: 'text-slate-400 hover:text-slate-200 text-xs',
                },
              }}
              fallbackRedirectUrl="/dashboard"
              signUpUrl="/signup"
            />
          </ClerkLoaded>
        </div>

      </div>
    </div>
  );
}



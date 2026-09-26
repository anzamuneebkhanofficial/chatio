import { SignUp, ClerkLoading, ClerkLoaded } from '@clerk/nextjs';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { BrandMark } from '@/components/ui/BrandMark';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080a16] p-4 sm:p-6 lg:p-8 relative text-slate-100 selection:bg-indigo-600 selection:text-white">
      {/* Horizontal Widescreen Card */}
      <div className="w-full max-w-4xl relative z-10 grid grid-cols-1 md:grid-cols-12 rounded-2xl border border-white/10 bg-[#0d1224] shadow-2xl overflow-hidden">
        {/* Left Side Banner (5 cols) */}
        <div className="md:col-span-5 bg-[#0a0d1c] p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10 relative">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 group mb-6">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/90 border border-indigo-400/30 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-[1.02]">
                <BrandMark size={16} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-display font-bold leading-tight text-white">Chatio</span>
                <span className="text-[10px] text-indigo-400 font-semibold leading-tight uppercase tracking-wider">by Anza</span>
              </div>
            </Link>

            <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-2 leading-snug">
              Build Your Custom AI Chatbot
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
              Connect your content, customize the design, and embed on any website in 5 minutes.
            </p>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                <span>WordPress, Shopify & Webflow embed</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                <span>RAG LangChain & Vector Search</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                <span>Gemini & Groq dynamic speed</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                <span>100% Free with zero lock-in</span>
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
        <div className="md:col-span-7 p-4 sm:p-8 lg:p-10 flex flex-col justify-center items-center min-h-[460px] w-full">
          <div className="w-full max-w-[440px] mx-auto flex flex-col items-center justify-center">
            <ClerkLoading>
              <div className="w-full max-w-sm flex flex-col items-center justify-center p-6 space-y-4">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <div className="text-center space-y-1">
                  <p className="text-sm font-semibold text-white">Loading registration...</p>
                  <p className="text-xs text-slate-400">Setting up your Chatio workspace</p>
                </div>
                <div className="w-full space-y-3 pt-3">
                  <div className="h-11 bg-white/5 border border-white/10 rounded-xl animate-pulse" />
                  <div className="h-11 bg-indigo-600/30 rounded-xl animate-pulse" />
                </div>
              </div>
            </ClerkLoading>

            <ClerkLoaded>
              <SignUp
                appearance={{
                  elements: {
                    rootBox: 'w-full max-w-[390px] mx-auto',
                    card: 'w-full shadow-none bg-transparent border-0 p-0 overflow-visible',
                    header: 'mb-6 text-center',
                    headerTitle: 'text-white font-display text-2xl sm:text-3xl font-bold tracking-tight text-center mb-2',
                    headerSubtitle: 'text-slate-300 text-sm sm:text-base mt-1 text-center',
                    socialButtonsBlockButton: 'hidden',
                    socialButtonsProviderIcon: 'hidden',
                    dividerRow: 'hidden',
                    formField: 'mb-4',
                    formFieldLabel: 'text-sm text-slate-200 font-semibold mb-2 block',
                    formFieldInput: 'bg-[#12162a] border border-white/12 text-white placeholder:text-slate-500 rounded-xl px-4 py-3.5 text-sm font-medium focus:bg-[#161b33] focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all w-full',
                    otpCodeFieldInputs: 'flex flex-row gap-3 justify-center my-6',
                    otpCodeFieldInput: 'bg-[#12162a] text-white font-bold text-xl text-center border border-white/15 rounded-xl focus:bg-[#161b33] focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/25 shadow-md w-12 h-14',
                    formButtonPrimary: 'w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm sm:text-base py-3.5 sm:py-4 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 uppercase tracking-wider mt-3',
                    footer: 'bg-white/[0.04] border border-white/10 p-4 sm:p-5 mt-6 rounded-2xl flex flex-col items-center justify-center gap-3',
                    footerAction: 'flex flex-row items-center justify-center gap-1.5 whitespace-nowrap w-full',
                    footerActionText: 'text-slate-200 text-sm font-medium',
                    footerActionLink: 'text-indigo-400 hover:text-white font-bold text-sm underline underline-offset-4 transition-colors ml-1',
                    identityPreview: 'bg-indigo-500/15 border border-indigo-500/30 rounded-xl p-3.5 my-4 text-white flex items-center justify-between',
                    identityPreviewText: 'text-white font-semibold text-sm sm:text-base',
                    identityPreviewEditButton: 'text-indigo-400 hover:text-indigo-300 font-bold text-sm p-1',
                    formResendCodeLink: 'text-indigo-400 hover:text-indigo-300 font-bold text-sm underline underline-offset-4 mt-2 inline-block',
                    footerPages: 'text-white text-xs flex flex-row items-center justify-center gap-1.5 font-semibold',
                    footerPagesLink: 'text-white hover:text-indigo-200 text-xs font-semibold',
                  },
                }}
                fallbackRedirectUrl="/dashboard"
                signInUrl="/login"
              />
            </ClerkLoaded>
          </div>
        </div>



      </div>
    </div>
  );
}


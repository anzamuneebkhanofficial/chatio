import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import { Toaster } from 'sonner';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://chatiobyanza.com';

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Chatio by Anza - 100% Free Universal Custom RAG AI Chatbot Platform',
    template: '%s | Chatio by Anza',
  },
  description:
    'Free, open-source embeddable AI chat widget platform powered by RAG LangChain, Google Gemini, Groq, and MongoDB Vector Search. Embed on WordPress, Shopify, Next.js, or any website in 60 seconds.',
  keywords: [
    'Chatio',
    'Chatio by Anza',
    'AI Chat Widget',
    'Embeddable Chatbot',
    'RAG LangChain',
    'Customer Support AI',
    'WordPress AI Chatbot',
    'Shopify AI Chatbot',
    'Next.js 16 AI',
    'Google Gemini Chatbot',
    'Groq AI Speed',
    'BYODB MongoDB',
    'Shadow DOM Embed',
    'Free AI Chatbot SaaS',
  ],
  authors: [{ name: 'Muhammad Anza Muneeb Khan', url: 'https://github.com/anzamuneebkhanofficial' }],
  creator: 'Muhammad Anza Muneeb Khan',
  publisher: 'Chatio by Anza',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Chatio by Anza — Universal Custom RAG AI Chatbot Platform',
    description:
      'Train custom AI chatbots on your private data and embed anywhere in 60 seconds with 100% Shadow DOM CSS isolation. 100% Free & Open Source.',
    url: baseUrl,
    siteName: 'Chatio by Anza',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chatio by Anza — Universal Custom RAG AI Chatbot Platform',
    description:
      'Train custom AI chatbots on your private data and embed anywhere in 60 seconds. Powered by LangChain, Gemini, and Groq.',
    creator: '@anzamuneebkhan',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#6366f1',
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#6366f1',
          colorBackground: '#0d1224',
          colorInputBackground: '#f1f5f9',
          colorInputText: '#0f172a',
          colorText: '#ffffff',
          colorTextSecondary: '#cbd5e1',
          colorTextOnPrimaryBackground: '#ffffff',
          borderRadius: '0.85rem',
          fontFamily: 'inherit',
        },
        elements: {
          card: 'bg-[#0d1224]/98 backdrop-blur-2xl border border-indigo-500/30 shadow-2xl shadow-indigo-950/60 rounded-3xl p-6 sm:p-10 overflow-hidden',
          header: 'mb-6 text-center',
          headerTitle: 'text-white font-bold text-2xl sm:text-3xl font-display tracking-tight text-center mb-2',
          headerSubtitle: 'text-slate-300 text-sm sm:text-base text-center mt-1',
          socialButtonsBlockButton: 'hidden',
          socialButtonsProviderIcon: 'hidden',
          dividerRow: 'hidden',
          formField: 'mb-4',
          formFieldLabel: 'text-sm font-semibold text-slate-200 mb-2 block',
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
          userButtonPopoverCard: 'bg-[#0d1224]/98 backdrop-blur-2xl border border-indigo-500/30 shadow-2xl shadow-indigo-950/80 rounded-2xl overflow-hidden text-white',
          userPreviewMainIdentifier: 'text-white font-bold text-sm opacity-100',
          userPreviewSecondaryIdentifier: 'text-slate-300 text-xs opacity-100',
          userButtonPopoverActionButton: 'text-slate-100 hover:text-white hover:bg-indigo-500/20 rounded-xl transition-all',
          userButtonPopoverActionButtonText: 'text-slate-100 hover:text-white font-semibold text-sm',
          userButtonPopoverActionButtonIcon: 'text-indigo-400 opacity-100',
          userButtonPopoverFooter: 'bg-white/[0.04] border-t border-white/10 text-slate-300',
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'SoftwareApplication',
                name: 'Chatio by Anza',
                operatingSystem: 'All',
                applicationCategory: 'BusinessApplication',
                offers: {
                  '@type': 'Offer',
                  price: '0.00',
                  priceCurrency: 'USD',
                },
                author: {
                  '@type': 'Person',
                  name: 'Muhammad Anza Muneeb Khan',
                  url: 'https://github.com/anzamuneebkhanofficial',
                },
                description:
                  'Free, open-source embeddable AI chat widget platform powered by RAG LangChain, Google Gemini, Groq, and MongoDB Vector Search.',
              }),
            }}
          />
        </head>
        <body className="antialiased" suppressHydrationWarning>
          {children}
          <Toaster theme="dark" position="top-center" duration={3000} />
        </body>
      </html>
    </ClerkProvider>
  );
}





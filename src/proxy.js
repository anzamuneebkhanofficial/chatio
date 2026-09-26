import { clerkMiddleware } from '@clerk/nextjs/server';

// Only enable frontendApiProxy in production with live keys (e.g. vercel.app custom domain proxy)
// In local development or with pk_test_* keys, frontendApiProxy causes "Invalid host" (host_invalid) on localhost:3000
const isProduction = process.env.NODE_ENV === 'production';
const isLiveKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_live_');
const enableProxy = Boolean(isProduction && isLiveKey);

export default clerkMiddleware({
  clockSkewInMs: 60000,
  ...(enableProxy
    ? {
        frontendApiProxy: {
          enabled: true,
        },
      }
    : {}),
});

export const config = {
  matcher: [
    // 1. Required by Clerk for vercel.app: match the proxy path
    '/__clerk/:path*',
    // 2. Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // 3. Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

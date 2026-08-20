import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware({
  clockSkewInMs: 60000,
  frontendApiProxy: {
    enabled: true,
  },
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

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

let ajPromise: Promise<any> | null = null;

const getArcjet = async () => {
  if (!ajPromise) {
    ajPromise = (async () => {
      const [{ detectBot }, arcjetModule] = await Promise.all([
        import('@arcjet/next'),
        import('@/libs/Arcjet'),
      ]);

      return arcjetModule.default.withRule(
        detectBot({
          mode: 'LIVE',
          // Block all bots except the following
          allow: [
            // See https://docs.arcjet.com/bot-protection/identifying-bots
            'CATEGORY:SEARCH_ENGINE', // Allow search engines
            'CATEGORY:PREVIEW', // Allow preview links to show OG images
            'CATEGORY:MONITOR', // Allow uptime monitoring services
          ],
        }),
      );
    })();
  }

  return ajPromise;
};

const isProtectedRoute = createRouteMatcher([
  '/account(.*)',
  '/dashboard(.*)',
  '/:locale/account(.*)',
  '/:locale/dashboard(.*)',
]);

const proxy = clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname;
  const isApiRoute = /^\/(?:[^/]+\/)?api(?:\/|$)/.test(pathname);
  const isWebhookRoute = /^\/(?:[^/]+\/)?api\/webhooks?(?:\/|$)/.test(pathname);

  if (isWebhookRoute) {
    return NextResponse.next();
  }

  // Verify the request with Arcjet, but only initialize it when a key is configured.
  // Avoid adding Arcjet latency to API routes (they already do auth + DB work).
  if (process.env.ARCJET_KEY && !isApiRoute) {
    const aj = await getArcjet();
    const decision = await aj.protect(req);

    if (decision.isDenied()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  // Protect authenticated routes
  if (isProtectedRoute(req)) {
    const signInUrl = new URL('/sign-in', req.url);
    await auth.protect({
      unauthenticatedUrl: signInUrl.toString(),
    });
  }

  return NextResponse.next();
});

export default proxy;

export const config = {
  // Keep middleware off public pages (prefetch can generate a lot of requests).
  // We only run it for authenticated pages and API routes.
  matcher: [
    '/account(.*)',
    '/dashboard(.*)',
    '/api/:path*',
    '/:locale/account(.*)',
    '/:locale/dashboard(.*)',
    '/:locale/api/:path*',
  ],
};

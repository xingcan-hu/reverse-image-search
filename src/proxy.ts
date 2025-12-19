import { detectBot } from '@arcjet/next';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import arcjet from '@/libs/Arcjet';
import { routing } from './libs/I18nRouting';

const handleI18nRouting = createMiddleware(routing);

const isProtectedRoute = createRouteMatcher([
  '/search(.*)',
  '/account(.*)',
  '/dashboard(.*)',
  '/:locale/search(.*)',
  '/:locale/account(.*)',
  '/:locale/dashboard(.*)',
]);

// Improve security with Arcjet
const aj = arcjet.withRule(
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

const proxy = clerkMiddleware(async (auth, req) => {
  // Verify the request with Arcjet
  // Use `process.env` instead of Env to reduce bundle size in middleware
  if (process.env.ARCJET_KEY) {
    const decision = await aj.protect(req);

    if (decision.isDenied()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  // Protect authenticated routes
  if (isProtectedRoute(req)) {
    const locale = req.nextUrl.pathname.match(/^\/(\w{2})/)?.at(1);
    const localePrefix = locale ? `/${locale}` : '';
    const signInUrl = new URL(`${localePrefix}/sign-in`, req.url);

    await auth.protect({
      unauthenticatedUrl: signInUrl.toString(),
    });
  }

  // Apply next-intl routing last so auth and security checks see the original pathname.
  return handleI18nRouting(req);
});

export default proxy;

export const config = {
  // Match all pathnames except for
  // - … if they start with `/_next`, `/_vercel` or `monitoring`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api/webhooks?|_next|_vercel|monitoring|.*\\..*).*)',
};

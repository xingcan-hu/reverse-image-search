import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import { routing } from './libs/I18nRouting';

const handleI18nRouting = createMiddleware(routing);

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
  // Verify the request with Arcjet, but only initialize it when a key is configured.
  if (process.env.ARCJET_KEY) {
    const aj = await getArcjet();
    const decision = await aj.protect(req);

    if (decision.isDenied()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  // Protect authenticated routes
  if (isProtectedRoute(req)) {
    // Check if pathname starts with a valid locale
    const pathname = req.nextUrl.pathname;
    const pathLocale = routing.locales.find(locale =>
      pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
    );
    const locale = pathLocale || routing.defaultLocale;
    const localePrefix = locale === routing.defaultLocale ? '' : `/${locale}`;
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

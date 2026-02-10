import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';
import createNextIntlPlugin from 'next-intl/plugin';
import './src/libs/Env';

const DEFAULT_LOCALE = 'en';

// Define the base Next.js configuration
const baseConfig: NextConfig = {
  devIndicators: {
    position: 'bottom-right',
  },
  poweredByHeader: false,
  reactStrictMode: true,
  reactCompiler: true,
  outputFileTracingIncludes: {
    '/': ['./migrations/**/*'],
  },
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
};

// Initialize the Next-Intl plugin
let configWithPlugins = createNextIntlPlugin('./src/libs/I18n.ts')(baseConfig);

// Conditionally enable bundle analysis
if (process.env.ANALYZE === 'true') {
  configWithPlugins = withBundleAnalyzer()(configWithPlugins);
}

// Conditionally enable Sentry configuration
if (!process.env.NEXT_PUBLIC_SENTRY_DISABLED) {
  configWithPlugins = withSentryConfig(configWithPlugins, {
    // For all available options, see:
    // https://www.npmjs.com/package/@sentry/webpack-plugin#options
    org: process.env.SENTRY_ORGANIZATION,
    project: process.env.SENTRY_PROJECT,

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    reactComponentAnnotation: {
      enabled: true,
    },

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    tunnelRoute: '/monitoring',

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Disable Sentry telemetry
    telemetry: false,
  });
}

const normalizeRewrites = (rewrites: Awaited<ReturnType<NonNullable<NextConfig['rewrites']>>> | undefined) => {
  if (!rewrites) {
    return { beforeFiles: [], afterFiles: [], fallback: [] };
  }

  if (Array.isArray(rewrites)) {
    return { beforeFiles: [], afterFiles: rewrites, fallback: [] };
  }

  return {
    beforeFiles: rewrites.beforeFiles ?? [],
    afterFiles: rewrites.afterFiles ?? [],
    fallback: rewrites.fallback ?? [],
  };
};

// Make default-locale routes work without the `/${DEFAULT_LOCALE}` prefix so we can keep
// the `[locale]` segment without running a middleware on every public route.
const existingRewrites = configWithPlugins.rewrites;
configWithPlugins.rewrites = async () => {
  const prior = typeof existingRewrites === 'function'
    ? await existingRewrites()
    : existingRewrites;

  const normalized = normalizeRewrites(prior as any);

  return {
    beforeFiles: [
      { source: '/', destination: `/${DEFAULT_LOCALE}` },
      {
        source: `/:path((?!${DEFAULT_LOCALE}(?:/|$)|_next|_vercel|monitoring|api/webhooks?(?:/|$)|robots\\.txt|sitemap\\.xml|.*\\..*).*)`,
        destination: `/${DEFAULT_LOCALE}/:path`,
      },
      ...normalized.beforeFiles,
    ],
    afterFiles: normalized.afterFiles,
    fallback: normalized.fallback,
  };
};

const existingRedirects = configWithPlugins.redirects;
configWithPlugins.redirects = async () => {
  const prior = typeof existingRedirects === 'function'
    ? await existingRedirects()
    : existingRedirects;

  return [
    {
      source: `/${DEFAULT_LOCALE}/robots.txt`,
      destination: '/robots.txt',
      permanent: true,
    },
    {
      source: `/${DEFAULT_LOCALE}/sitemap.xml`,
      destination: '/sitemap.xml',
      permanent: true,
    },
    ...(prior ?? []),
  ];
};

const nextConfig = configWithPlugins;
export default nextConfig;

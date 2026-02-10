import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { Toaster } from 'sonner';
import { PostHogProvider } from '@/components/analytics/PostHogProvider';
import { routing } from '@/libs/I18nRouting';
import { ClerkLocalizations } from '@/utils/AppConfig';
import { getBaseUrl } from '@/utils/Helpers';
import '@/styles/global.css';

const siteUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: 'ReverseImage.io',
  title: {
    default: 'ReverseImage.io',
    template: '%s',
  },
  description: 'ReverseImage.io lets you search by image to find similar photos, source pages, and higher-resolution versions across web and stock sites in seconds.',
  openGraph: {
    type: 'website',
    siteName: 'ReverseImage.io',
    title: 'ReverseImage.io',
    description: 'ReverseImage.io lets you search by image to find similar photos, source pages, and higher-resolution versions across web and stock sites in seconds.',
    images: [
      {
        url: '/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: 'ReverseImage.io',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ReverseImage.io',
    description: 'ReverseImage.io lets you search by image to find similar photos, source pages, and higher-resolution versions across web and stock sites in seconds.',
    images: ['/android-chrome-512x512.png'],
  },
  icons: [
    {
      rel: 'apple-touch-icon',
      url: '/apple-touch-icon.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: '/favicon-16x16.png',
    },
    {
      rel: 'icon',
      url: '/favicon.ico',
    },
  ],
};

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const clerkLocale = ClerkLocalizations.supportedLocales[locale] ?? ClerkLocalizations.defaultLocale;
  const localePrefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  const signInUrl = `${localePrefix}/sign-in`;
  const signUpUrl = `${localePrefix}/sign-up`;
  const accountUrl = `${localePrefix}/account`;
  const afterSignOutUrl = `${localePrefix || ''}/`;

  return (
    <html lang={locale} className={inter.className}>
      <body className="ui-theme min-h-screen overflow-x-hidden bg-[var(--ui-bg)] text-[var(--ui-ink)] antialiased">
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-6MMH20X8FF"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-6MMH20X8FF');
          `}
        </Script>
        <ClerkProvider
          appearance={{
            cssLayerName: 'clerk',
          }}
          localization={clerkLocale}
          signInUrl={signInUrl}
          signUpUrl={signUpUrl}
          signInFallbackRedirectUrl={accountUrl}
          signUpFallbackRedirectUrl={accountUrl}
          afterSignOutUrl={afterSignOutUrl}
        >
          <NextIntlClientProvider>
            <PostHogProvider>
              <Toaster richColors position="top-right" />
              {props.children}
            </PostHogProvider>
          </NextIntlClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

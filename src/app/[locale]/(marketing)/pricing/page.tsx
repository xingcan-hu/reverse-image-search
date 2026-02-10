import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { CREDIT_PACKAGES } from '@/libs/Billing';
import { getI18nPath } from '@/utils/Helpers';
import { PricingClient } from './PricingClient';

type PricingPageProps = {
  params: Promise<{ locale: string }>;
};

export const dynamic = 'force-static';

export async function generateMetadata(props: PricingPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const canonicalPath = getI18nPath('/pricing', locale);
  const title = 'Reverse Image Search Pricing | ReverseImage.io';
  const description = 'Buy one-time reverse image search credits: $5 for 500 or $10 for 1200. No subscriptions, no expiry, and automatic refunds when searches fail.';

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      url: canonicalPath,
      type: 'website',
      images: ['/android-chrome-512x512.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/android-chrome-512x512.png'],
    },
  };
}

export default async function PricingPage(props: PricingPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <PricingClient packages={CREDIT_PACKAGES} locale={locale} />;
}

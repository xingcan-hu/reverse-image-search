import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { CREDIT_PACKAGES } from '@/libs/Billing';
import { PricingClient } from './PricingClient';

type PricingPageProps = {
  params: Promise<{ locale: string }>;
};

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Pricing | Vibe Search',
  description: 'Buy lifetime credits for reverse image search. $5 for 500 credits or $10 for 1200 credits. No subscriptions.',
};

export default async function PricingPage(props: PricingPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <PricingClient packages={CREDIT_PACKAGES} />;
}

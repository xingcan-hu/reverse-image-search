import type { Metadata } from 'next';
import { ArrowRight, RefreshCw, Shield } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import Link from '@/components/AppLink';
import { RefundPolicy } from '@/components/legal/RefundPolicy';
import { routing } from '@/libs/I18nRouting';
import { getI18nPath } from '@/utils/Helpers';

type RefundsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: RefundsPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const canonicalPath = getI18nPath('/refunds', locale);
  const title = 'Refund Policy for Reverse Image Credits | ReverseImage.io';
  const description = 'Review refund terms for ReverseImage.io credit packs, including 14-day unused-pack refunds, automatic credit returns on failed searches, and support timelines.';

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

export default async function RefundsPage(props: RefundsPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;

  return (
    <div className="ui-page">
      {/* Hero Section */}
      <div className="ui-panel-hero relative overflow-hidden bg-gradient-to-br from-white via-sky-50 to-[var(--ui-soft)] p-6 sm:p-8">
        <div className="absolute right-0 bottom-0 h-64 w-64 translate-x-32 translate-y-32 rounded-full bg-gradient-to-br from-sky-200 to-blue-200 opacity-30 blur-3xl" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <div className="ui-icon-box ui-icon-box-lg shrink-0 bg-[var(--ui-accent)] text-white shadow-lg">
            <RefreshCw className="h-6 w-6 sm:h-8 sm:w-8" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold tracking-wider text-[var(--ui-accent)] uppercase">Fair Policy</p>
            <h1 className="mt-1 text-3xl font-bold text-[var(--ui-ink)] sm:text-4xl">
              Refund &
              {' '}
              <span className="ui-title-accent">Cancellation Policy</span>
            </h1>
            <p className="mt-2 text-base text-[var(--ui-muted)] sm:mt-3 sm:text-lg">
              Our priority is your satisfaction. Please review our policy regarding digital credits and one-time payments.
            </p>
            <Link
              href={`${prefix}/terms`}
              className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[var(--ui-accent)] transition-all hover:gap-3 hover:underline active:gap-2 sm:mt-4 sm:text-sm"
            >
              View Terms of Service
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Summary */}
      <div className="ui-panel-soft grid gap-4 p-6 sm:gap-6 sm:p-8 md:grid-cols-3">
        <div className="flex flex-col items-center gap-2 text-center sm:gap-3">
          <div className="ui-icon-box ui-icon-box-lg">
            <RefreshCw className="h-6 w-6 text-[var(--ui-accent)] sm:h-7 sm:w-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--ui-ink)] sm:text-base">Auto-Refund</p>
            <p className="mt-0.5 text-xs text-[var(--ui-muted)] sm:mt-1 sm:text-sm">Failed searches refunded automatically</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 text-center sm:gap-3">
          <div className="ui-icon-box ui-icon-box-lg">
            <Shield className="h-6 w-6 text-[var(--ui-accent)] sm:h-7 sm:w-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--ui-ink)] sm:text-base">14-Day Window</p>
            <p className="mt-0.5 text-xs text-[var(--ui-muted)] sm:mt-1 sm:text-sm">Full refund for unused packs</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 text-center sm:gap-3">
          <div className="ui-icon-box ui-icon-box-lg">
            <Shield className="h-6 w-6 text-[var(--ui-accent)] sm:h-7 sm:w-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--ui-ink)] sm:text-base">Fair Process</p>
            <p className="mt-0.5 text-xs text-[var(--ui-muted)] sm:mt-1 sm:text-sm">3-5 business days review</p>
          </div>
        </div>
      </div>

      <RefundPolicy />
    </div>
  );
}

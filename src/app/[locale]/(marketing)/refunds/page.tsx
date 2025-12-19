import type { Metadata } from 'next';
import { ArrowRight, RefreshCw, Shield } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { RefundPolicy } from '@/components/legal/RefundPolicy';
import { routing } from '@/libs/I18nRouting';

type RefundsPageProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: 'Refund Policy - ReverseImage.io',
  description: 'Refund and cancellation policy for digital credits and one-time payments on ReverseImage.io.',
};

export default async function RefundsPage(props: RefundsPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-emerald-50 to-teal-50 p-6 shadow-lg sm:rounded-3xl sm:p-8">
        <div className="absolute right-0 bottom-0 h-64 w-64 translate-x-32 translate-y-32 rounded-full bg-gradient-to-br from-emerald-200 to-teal-200 opacity-30 blur-3xl" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg sm:h-16 sm:w-16 sm:rounded-2xl">
            <RefreshCw className="h-6 w-6 text-white sm:h-8 sm:w-8" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold tracking-wider text-emerald-600 uppercase">Fair Policy</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900 sm:text-4xl">Refund & Cancellation Policy</h1>
            <p className="mt-2 text-base text-slate-600 sm:mt-3 sm:text-lg">
              Our priority is your satisfaction. Please review our policy regarding digital credits and one-time payments.
            </p>
            <Link
              href={`${prefix}/terms`}
              className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 transition-all hover:gap-3 hover:underline active:gap-2 sm:mt-4 sm:text-sm"
            >
              View Terms of Service
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Summary */}
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm sm:gap-6 sm:rounded-3xl sm:p-8 md:grid-cols-3">
        <div className="flex flex-col items-center gap-2 text-center sm:gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 sm:h-14 sm:w-14 sm:rounded-2xl">
            <RefreshCw className="h-6 w-6 text-emerald-600 sm:h-7 sm:w-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 sm:text-base">Auto-Refund</p>
            <p className="mt-0.5 text-xs text-slate-600 sm:mt-1 sm:text-sm">Failed searches refunded automatically</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 text-center sm:gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 sm:h-14 sm:w-14 sm:rounded-2xl">
            <Shield className="h-6 w-6 text-indigo-600 sm:h-7 sm:w-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 sm:text-base">14-Day Window</p>
            <p className="mt-0.5 text-xs text-slate-600 sm:mt-1 sm:text-sm">Full refund for unused packs</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 text-center sm:gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 sm:h-14 sm:w-14 sm:rounded-2xl">
            <Shield className="h-6 w-6 text-amber-600 sm:h-7 sm:w-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 sm:text-base">Fair Process</p>
            <p className="mt-0.5 text-xs text-slate-600 sm:mt-1 sm:text-sm">3-5 business days review</p>
          </div>
        </div>
      </div>

      <RefundPolicy />
    </div>
  );
}

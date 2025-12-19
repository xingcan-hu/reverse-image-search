import type { Metadata } from 'next';
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
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase">Refunds</p>
        <h1 className="text-3xl font-semibold text-slate-900">Refund & Cancellation Policy</h1>
        <p className="mt-2 text-sm text-slate-600">
          Our priority is your satisfaction. Please review our policy regarding digital credits and one-time payments. See also
          {' '}
          <Link className="font-semibold text-indigo-600 hover:underline" href={`${prefix}/terms`}>
            Terms of Service
          </Link>
          .
        </p>
      </div>

      <RefundPolicy />
    </div>
  );
}

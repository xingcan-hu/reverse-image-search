import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { RefundPolicy } from '@/components/legal/RefundPolicy';
import { routing } from '@/libs/I18nRouting';

type RefundsPageProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: 'Refund Policy | Vibe Search',
  description: 'Refund policy for credit purchases, eligibility exceptions, and how to request a refund.',
};

export default async function RefundsPage(props: RefundsPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase">Refunds</p>
        <h1 className="text-3xl font-semibold text-slate-900">Refund Policy</h1>
        <p className="mt-2 text-sm text-slate-600">
          This page explains when credit purchases are refundable and how to request help. See also
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

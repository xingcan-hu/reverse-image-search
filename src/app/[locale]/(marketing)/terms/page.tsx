import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { RefundPolicy } from '@/components/legal/RefundPolicy';
import { routing } from '@/libs/I18nRouting';

type TermsPageProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: 'Terms of Service | Vibe Search',
  description: 'Terms of Service and Refund Policy for Vibe Search including credits, payments, and refund eligibility.',
};

const terms = [
  {
    title: 'Service',
    body: 'Vibe Search provides reverse image search with a credit-based billing model. One credit is consumed per successful search.',
  },
  {
    title: 'Credits',
    body: 'Credits are virtual goods that unlock searches. Credits never expire and are tied to your account.',
  },
  {
    title: 'Billing',
    body: 'All payments are processed via Stripe as one-time charges. Pricing is displayed before checkout.',
  },
  {
    title: 'Automatic refunds on failures',
    body: 'If a search fails due to a system error after a credit is deducted, we automatically refund the credit whenever possible.',
  },
  {
    title: 'Acceptable use',
    body: 'You may not upload illegal, abusive, or infringing content. We reserve the right to suspend accounts that violate these terms.',
  },
];

export default async function TermsPage(props: TermsPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  const refundsHref = `${prefix}/refunds`;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase">Terms</p>
        <h1 className="text-3xl font-semibold text-slate-900">Terms of Service</h1>
        <p className="mt-2 text-sm text-slate-600">
          Please review these terms carefully. By using Vibe Search you agree to the rules below.
        </p>
      </div>
      <div className="space-y-3">
        {terms.map(term => (
          <div key={term.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{term.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{term.body}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase">Refunds</p>
        <h2 className="text-2xl font-semibold text-slate-900">Refund Policy</h2>
        <p className="mt-2 text-sm text-slate-600">
          This policy applies to credit purchases and usage. You can also view it on the dedicated page:
          {' '}
          <Link className="font-semibold text-indigo-600 hover:underline" href={refundsHref}>
            {refundsHref}
          </Link>
          .
        </p>
      </div>
      <RefundPolicy />
    </div>
  );
}

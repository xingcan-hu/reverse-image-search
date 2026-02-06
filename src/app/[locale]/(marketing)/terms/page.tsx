import type { Metadata } from 'next';
import { CheckCircle, CreditCard, FileText, RefreshCw, Shield, UserCheck } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import Link from '@/components/AppLink';
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
    icon: FileText,
    body: 'Vibe Search provides reverse image search with a credit-based billing model. One credit is consumed per successful search.',
    color: 'indigo',
  },
  {
    title: 'Credits',
    icon: CreditCard,
    body: 'Credits are virtual goods that unlock searches. Credits never expire and are tied to your account.',
    color: 'purple',
  },
  {
    title: 'Billing',
    icon: CheckCircle,
    body: 'All payments are processed via Stripe as one-time charges. Pricing is displayed before checkout.',
    color: 'emerald',
  },
  {
    title: 'Automatic refunds on failures',
    icon: RefreshCw,
    body: 'If a search fails due to a system error after a credit is deducted, we automatically refund the credit whenever possible.',
    color: 'amber',
  },
  {
    title: 'Acceptable use',
    icon: UserCheck,
    body: 'You may not upload illegal, abusive, or infringing content. We reserve the right to suspend accounts that violate these terms.',
    color: 'slate',
  },
];

export default async function TermsPage(props: TermsPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  const refundsHref = `${prefix}/refunds`;

  const getColorClasses = (color: string) => {
    const colors = {
      indigo: 'bg-sky-100 text-[var(--ui-accent)]',
      purple: 'bg-sky-100 text-[var(--ui-accent)]',
      emerald: 'bg-sky-100 text-[var(--ui-accent)]',
      amber: 'bg-sky-100 text-[var(--ui-accent)]',
      slate: 'bg-sky-100 text-[var(--ui-accent)]',
    };
    return colors[color as keyof typeof colors] || colors.indigo;
  };

  return (
    <div className="ui-page">
      {/* Hero Section */}
      <div className="ui-panel-hero relative overflow-hidden bg-gradient-to-br from-white via-[var(--ui-soft)] to-sky-50 p-6 sm:p-8">
        <div className="absolute top-0 right-0 h-64 w-64 translate-x-32 -translate-y-32 rounded-full bg-gradient-to-br from-sky-200 to-blue-200 opacity-30 blur-3xl" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <div className="ui-icon-box ui-icon-box-lg shrink-0 bg-[var(--ui-accent)] text-white shadow-lg">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold tracking-wider text-[var(--ui-accent)] uppercase">Legal Terms</p>
            <h1 className="mt-1 text-3xl font-bold text-[var(--ui-ink)] sm:text-4xl">
              Terms of
              {' '}
              <span className="ui-title-accent">Service</span>
            </h1>
            <p className="mt-2 text-base text-[var(--ui-muted)] sm:mt-3 sm:text-lg">
              Please review these terms carefully. By using ReverseImage.io you agree to the rules below.
            </p>
          </div>
        </div>
      </div>

      {/* Terms Grid */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {terms.map((term) => {
          const Icon = term.icon;
          return (
            <div
              key={term.title}
              className="ui-panel group p-5 transition hover:-translate-y-1 hover:shadow-md active:translate-y-0 sm:p-6"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={`ui-icon-box ui-icon-box-sm shrink-0 ${getColorClasses(term.color)}`}>
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-[var(--ui-ink)] sm:text-xl">{term.title}</h2>
                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--ui-muted)] sm:mt-2 sm:text-sm">{term.body}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Refund Policy Section */}
      <div className="ui-panel-soft p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <div className="ui-icon-box ui-icon-box-sm shrink-0">
            <RefreshCw className="h-5 w-5 text-[var(--ui-accent)] sm:h-6 sm:w-6" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold tracking-wider text-[var(--ui-accent)] uppercase">Fair Policy</p>
            <h2 className="mt-1 text-xl font-bold text-[var(--ui-ink)] sm:text-2xl">Refund Policy</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--ui-muted)] sm:mt-2 sm:text-sm">
              This policy applies to credit purchases and usage. View the complete policy on the dedicated page:
              {' '}
              <Link className="font-semibold text-[var(--ui-accent)] hover:underline active:underline" href={refundsHref}>
                Refund Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
      <RefundPolicy />
    </div>
  );
}

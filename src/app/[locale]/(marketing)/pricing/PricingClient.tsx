import type { CreditPackage } from '@/libs/Billing';
import { ArrowRight, Check, Crown, Gift, Shield, Sparkles, Zap } from 'lucide-react';
import Link from '@/components/AppLink';
import { routing } from '@/libs/I18nRouting';
import { cn } from '@/utils/Cn';
import { PricingCheckoutButton } from './PricingCheckoutButton';

type PricingClientProps = {
  packages: CreditPackage[];
  locale: string;
};

export const PricingClient = ({ packages, locale }: PricingClientProps) => {
  const apiPrefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  const localePrefix = apiPrefix || '';
  const refundsHref = `${localePrefix}/refunds`;
  const signInHref = `${localePrefix}/sign-in`;

  return (
    <div className="ui-page">
      <div className="ui-panel-hero relative overflow-hidden bg-gradient-to-br from-[#1d1d1f] via-[#262629] to-[#1f2937] p-6 shadow-[0_30px_55px_-45px_rgba(29,29,31,0.95)] sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,113,227,0.18),transparent_52%)]" />
        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm sm:mb-4 sm:px-4 sm:py-2 sm:text-sm">
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Simple Pricing
          </div>
          <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Pay Once,
            {' '}
            <span className="ui-title-accent-inverse">Use Forever</span>
          </h1>
          <p className="mt-2 text-base text-slate-300 sm:mt-3 sm:text-lg">
            No subscriptions. No hidden fees. Buy credits when you need them.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--ui-accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-lg sm:mt-6 sm:px-5 sm:py-3 sm:text-base">
            <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
            3 free credits after signup
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {packages.map(pkg => (
          <div
            key={pkg.id}
            className={cn(
              'relative flex flex-col justify-between overflow-hidden border p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl sm:p-8',
              pkg.highlight
                ? 'border-sky-300 bg-gradient-to-br from-sky-50 to-white'
                : 'border-[var(--ui-line)] bg-white',
            )}
          >
            {pkg.highlight && (
              <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 opacity-20 blur-2xl" />
            )}
            <div className="relative">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold tracking-wider text-[var(--ui-accent)] uppercase">One-Time Payment</p>
                  <h3 className="mt-1 text-2xl font-bold text-[var(--ui-ink)] sm:mt-2 sm:text-3xl">{pkg.label}</h3>
                </div>
                {pkg.highlight && (
                  <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[var(--ui-accent)] px-3 py-1.5 text-xs font-bold text-white shadow-lg sm:gap-2 sm:px-4 sm:py-2">
                    <Crown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Best Value
                  </div>
                )}
              </div>
              <div className="mt-4 flex flex-wrap items-baseline gap-2 sm:mt-6">
                <p className="text-4xl font-extrabold text-[var(--ui-ink)] sm:text-5xl">
                  $
                  {(pkg.price / 100).toFixed(0)}
                </p>
                <div className="rounded-full bg-[var(--ui-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--ui-muted)] sm:px-3 sm:text-sm">
                  {pkg.credits.toLocaleString()}
                  {' '}
                  credits
                </div>
              </div>
              <p className="mt-2 text-xs text-[var(--ui-muted)] sm:text-sm">
                Only $
                {(pkg.price / pkg.credits / 100).toFixed(3)}
                {' '}
                per credit · Never expires
              </p>
            </div>

            <div className="relative mt-6 space-y-3">
              <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-100">
                  <Check className="h-4 w-4 text-[var(--ui-accent)]" />
                </div>
                <span className="text-sm font-medium text-[var(--ui-muted)]">Credits never expire</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-100">
                  <Shield className="h-4 w-4 text-[var(--ui-accent)]" />
                </div>
                <span className="text-sm font-medium text-[var(--ui-muted)]">Secure Stripe checkout</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-100">
                  <Sparkles className="h-4 w-4 text-[var(--ui-accent)]" />
                </div>
                <span className="text-sm font-medium text-[var(--ui-muted)]">Auto-refund on failures</span>
              </div>
            </div>

            <PricingCheckoutButton
              packageId={pkg.id}
              apiPrefix={apiPrefix}
              signInHref={signInHref}
              highlight={Boolean(pkg.highlight)}
            />
          </div>
        ))}
      </div>

      <div className="ui-panel-soft grid gap-4 p-6 sm:gap-6 sm:p-8 md:grid-cols-3">
        <div className="flex flex-col items-center gap-2 text-center sm:gap-3">
          <div className="ui-icon-box ui-icon-box-lg">
            <Zap className="h-6 w-6 text-[var(--ui-accent)] sm:h-7 sm:w-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--ui-ink)] sm:text-base">Auto-Refund</p>
            <p className="mt-0.5 text-xs text-[var(--ui-muted)] sm:mt-1 sm:text-sm">Failed searches automatically refund your credits</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 text-center sm:gap-3">
          <div className="ui-icon-box ui-icon-box-lg">
            <Shield className="h-6 w-6 text-[var(--ui-accent)] sm:h-7 sm:w-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--ui-ink)] sm:text-base">No Subscriptions</p>
            <p className="mt-0.5 text-xs text-[var(--ui-muted)] sm:mt-1 sm:text-sm">Pay once and use your credits anytime</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 text-center sm:gap-3">
          <div className="ui-icon-box ui-icon-box-lg">
            <Sparkles className="h-6 w-6 text-[var(--ui-accent)] sm:h-7 sm:w-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--ui-ink)] sm:text-base">Instant Results</p>
            <p className="mt-0.5 text-xs text-[var(--ui-muted)] sm:mt-1 sm:text-sm">Search 50+ sources with high accuracy</p>
          </div>
        </div>
      </div>

      <div className="ui-panel p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <div className="ui-icon-box ui-icon-box-sm shrink-0">
            <Shield className="h-5 w-5 text-[var(--ui-accent)] sm:h-6 sm:w-6" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold tracking-wider text-[var(--ui-accent)] uppercase">Fair Refund Policy</p>
            <h2 className="mt-1 text-xl font-bold text-[var(--ui-ink)] sm:text-2xl">Your Purchase is Protected</h2>
            <div className="mt-3 space-y-2 text-xs text-[var(--ui-muted)] sm:mt-4 sm:space-y-3 sm:text-sm">
              <div className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--ui-accent)] sm:h-4 sm:w-4" />
                <span>Unused credit packs eligible for full refund within 14 days</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--ui-accent)] sm:h-4 sm:w-4" />
                <span>Technical failures automatically refunded to your account</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--ui-accent)] sm:h-4 sm:w-4" />
                <span>Duplicate charges corrected or refunded immediately</span>
              </div>
            </div>
            <Link
              href={refundsHref}
              className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[var(--ui-accent)] transition-all hover:gap-3 hover:underline active:gap-2 sm:mt-4 sm:text-sm"
            >
              Read full refund policy
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="ui-panel-soft relative overflow-hidden p-6 sm:p-8">
        <div className="absolute top-0 right-0 h-64 w-64 translate-x-32 -translate-y-32 rounded-full bg-gradient-to-br from-sky-300 to-blue-400 opacity-20 blur-3xl" />
        <div className="relative flex flex-col items-center gap-4 text-center sm:gap-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--ui-accent)] px-3 py-1.5 text-xs font-bold text-white shadow-lg sm:gap-2 sm:px-4 sm:py-2 sm:text-sm">
            <Gift className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Free Trial
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[var(--ui-ink)] sm:text-3xl">Try Before You Buy</h3>
            <p className="mt-2 text-base text-[var(--ui-muted)] sm:text-lg">
              Sign up now and get
              {' '}
              <span className="font-bold text-[var(--ui-accent)]">3 free search credits</span>
              {' '}
              to test the quality
            </p>
            <p className="mt-2 text-xs text-[var(--ui-muted)] sm:text-sm">No credit card required · Credits never expire</p>
          </div>
          <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
            <Link
              href={`${localePrefix}/sign-up`}
              className="ui-btn-primary ui-btn-lg w-full sm:w-auto"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
            <Link
              href={signInHref}
              className="ui-btn-secondary ui-btn-lg w-full sm:w-auto"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

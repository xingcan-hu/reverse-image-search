'use client';

import type { CreditPackage } from '@/libs/Billing';
import { SignedIn, SignedOut, useAuth } from '@clerk/nextjs';
import { ArrowRight, Check, Crown, Gift, Loader2, Shield, Sparkles, Zap } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import Link from '@/components/AppLink';
import { useCredits } from '@/components/credits/CreditsProvider';
import { routing } from '@/libs/I18nRouting';
import { cn } from '@/utils/Cn';

type PricingClientProps = {
  packages: CreditPackage[];
};

export const PricingClient = ({ packages }: PricingClientProps) => {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const locale = useLocale();
  const apiPrefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  const localePrefix = apiPrefix || '';
  const refundsHref = `${localePrefix}/refunds`;
  const { credits } = useCredits();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleCheckout = async (packageId: string) => {
    if (!isSignedIn) {
      router.push(`${localePrefix}/sign-in`);
      return;
    }

    setLoadingId(packageId);

    try {
      const response = await fetch(`${apiPrefix}/api/billing/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packageId }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        toast.error('Unable to start checkout', { description: error.error ?? 'Try again.' });
        setLoadingId(null);
        return;
      }

      const payload = await response.json();

      if (payload.url) {
        window.location.href = payload.url;
        return;
      }

      toast.error('Checkout link missing. Please retry.');
    } catch {
      toast.error('Unable to start checkout', { description: 'Please retry in a moment.' });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-6 shadow-lg sm:rounded-3xl sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.15),transparent_50%)]" />
        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm sm:mb-4 sm:px-4 sm:py-2 sm:text-sm">
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Simple Pricing
          </div>
          <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Pay Once, Use Forever
          </h1>
          <p className="mt-2 text-base text-slate-300 sm:mt-3 sm:text-lg">
            No subscriptions. No hidden fees. Buy credits when you need them.
          </p>
          <SignedIn>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg sm:mt-6 sm:px-5 sm:py-3 sm:text-base">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
              Your Balance:
              {' '}
              {credits ?? 0}
              {' '}
              Credits
            </div>
          </SignedIn>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {packages.map(pkg => (
          <div
            key={pkg.id}
            className={cn(
              'relative flex flex-col justify-between overflow-hidden rounded-2xl border p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl sm:rounded-3xl sm:p-8',
              pkg.highlight
                ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50'
                : 'border-slate-200 bg-white',
            )}
          >
            {pkg.highlight && (
              <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 opacity-20 blur-2xl" />
            )}
            <div className="relative">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">One-Time Payment</p>
                  <h3 className="mt-1 text-2xl font-bold text-slate-900 sm:mt-2 sm:text-3xl">{pkg.label}</h3>
                </div>
                {pkg.highlight && (
                  <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg sm:gap-2 sm:px-4 sm:py-2">
                    <Crown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Best Value
                  </div>
                )}
              </div>
              <div className="mt-4 flex flex-wrap items-baseline gap-2 sm:mt-6">
                <p className="text-4xl font-extrabold text-slate-900 sm:text-5xl">
                  $
                  {(pkg.price / 100).toFixed(0)}
                </p>
                <div className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 sm:px-3 sm:text-sm">
                  {pkg.credits.toLocaleString()}
                  {' '}
                  credits
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-600 sm:text-sm">
                Only $
                {(pkg.price / pkg.credits / 100).toFixed(3)}
                {' '}
                per credit · Never expires
              </p>
            </div>

            <div className="relative mt-6 space-y-3">
              <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                  <Check className="h-4 w-4 text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">Credits never expire</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
                  <Shield className="h-4 w-4 text-indigo-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">Secure Stripe checkout</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">Auto-refund on failures</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCheckout(pkg.id)}
              disabled={loadingId === pkg.id}
              className={cn(
                'relative mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-bold shadow-lg transition sm:mt-6 sm:px-6 sm:py-4 sm:text-base',
                pkg.highlight
                  ? 'bg-gradient-to-r from-slate-900 to-slate-700 text-white hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0'
                  : 'border-2 border-slate-300 bg-white text-slate-800 hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-xl active:translate-y-0',
                loadingId === pkg.id && 'cursor-not-allowed opacity-60',
              )}
            >
              {loadingId === pkg.id
                ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin sm:h-5 sm:w-5" />
                      Processing...
                    </>
                  )
                : (
                    <>
                      Buy Now
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </>
                  )}
            </button>
          </div>
        ))}
      </div>

      {/* Features Grid */}
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm sm:gap-6 sm:rounded-3xl sm:p-8 md:grid-cols-3">
        <div className="flex flex-col items-center gap-2 text-center sm:gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 sm:h-14 sm:w-14 sm:rounded-2xl">
            <Zap className="h-6 w-6 text-amber-600 sm:h-7 sm:w-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 sm:text-base">Auto-Refund</p>
            <p className="mt-0.5 text-xs text-slate-600 sm:mt-1 sm:text-sm">Failed searches automatically refund your credits</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 text-center sm:gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 sm:h-14 sm:w-14 sm:rounded-2xl">
            <Shield className="h-6 w-6 text-emerald-600 sm:h-7 sm:w-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 sm:text-base">No Subscriptions</p>
            <p className="mt-0.5 text-xs text-slate-600 sm:mt-1 sm:text-sm">Pay once and use your credits anytime</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 text-center sm:gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 sm:h-14 sm:w-14 sm:rounded-2xl">
            <Sparkles className="h-6 w-6 text-indigo-600 sm:h-7 sm:w-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 sm:text-base">Instant Results</p>
            <p className="mt-0.5 text-xs text-slate-600 sm:mt-1 sm:text-sm">Search 50+ sources with high accuracy</p>
          </div>
        </div>
      </div>

      {/* Refund Policy Summary */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:rounded-3xl sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 sm:h-12 sm:w-12 sm:rounded-xl">
            <Shield className="h-5 w-5 text-indigo-600 sm:h-6 sm:w-6" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">Fair Refund Policy</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">Your Purchase is Protected</h2>
            <div className="mt-3 space-y-2 text-xs text-slate-700 sm:mt-4 sm:space-y-3 sm:text-sm">
              <div className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500 sm:h-4 sm:w-4" />
                <span>Unused credit packs eligible for full refund within 14 days</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500 sm:h-4 sm:w-4" />
                <span>Technical failures automatically refunded to your account</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500 sm:h-4 sm:w-4" />
                <span>Duplicate charges corrected or refunded immediately</span>
              </div>
            </div>
            <Link
              href={refundsHref}
              className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 transition-all hover:gap-3 hover:underline active:gap-2 sm:mt-4 sm:text-sm"
            >
              Read full refund policy
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* CTA for non-signed-in users */}
      <SignedOut>
        <div className="relative overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 shadow-lg sm:rounded-3xl sm:p-8">
          <div className="absolute top-0 right-0 h-64 w-64 translate-x-32 -translate-y-32 rounded-full bg-gradient-to-br from-indigo-300 to-purple-400 opacity-20 blur-3xl" />
          <div className="relative flex flex-col items-center gap-4 text-center sm:gap-6">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg sm:gap-2 sm:px-4 sm:py-2 sm:text-sm">
              <Gift className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Free Trial
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 sm:text-3xl">Try Before You Buy</h3>
              <p className="mt-2 text-base text-slate-700 sm:text-lg">
                Sign up now and get
                {' '}
                <span className="font-bold text-indigo-600">3 free search credits</span>
                {' '}
                to test the quality
              </p>
              <p className="mt-2 text-xs text-slate-600 sm:text-sm">No credit card required · Credits never expire</p>
            </div>
            <Link
              href={`${localePrefix}/sign-up`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-slate-900 to-slate-700 px-6 py-3.5 text-sm font-bold text-white shadow-xl transition hover:-translate-y-1 hover:shadow-2xl active:translate-y-0 sm:w-auto sm:px-8 sm:py-4 sm:text-base"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </div>
        </div>
      </SignedOut>
    </div>
  );
};

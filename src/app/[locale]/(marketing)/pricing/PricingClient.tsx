'use client';

import type { CreditPackage } from '@/libs/Billing';
import { SignedIn, SignedOut, useAuth } from '@clerk/nextjs';
import { Check, Crown, Zap } from 'lucide-react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
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
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Pricing</p>
            <h1 className="text-3xl font-semibold text-slate-900">One-time credits, lifetime access</h1>
            <p className="text-sm text-slate-600">No subscriptions. Buy credits when you need them. Failed searches are auto-refunded.</p>
          </div>
          <div className="rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
            <SignedIn>
              Current balance:
              {' '}
              {credits ?? 0}
              {' '}
              credits
            </SignedIn>
            <SignedOut>
              Sign in to see your balance
            </SignedOut>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {packages.map(pkg => (
          <div
            key={pkg.id}
            className={cn(
              'flex flex-col justify-between rounded-3xl border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md',
              pkg.highlight
                ? 'border-amber-300 bg-amber-50'
                : 'border-slate-200 bg-white',
            )}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase">One-time</p>
                <h3 className="mt-1 text-2xl font-semibold text-slate-900">{pkg.label}</h3>
                <p className="text-sm text-slate-600">
                  {pkg.credits.toLocaleString()}
                  {' '}
                  credits · never expire
                </p>
              </div>
              {pkg.highlight && (
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                  <Crown className="h-4 w-4" />
                  Best value
                </div>
              )}
            </div>
            <p className="mt-4 text-4xl font-bold text-slate-900">
              $
              {(pkg.price / 100).toFixed(0)}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                <Check className="h-4 w-4 text-emerald-500" />
                Credits never expire
              </li>
              <li className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                <Check className="h-4 w-4 text-emerald-500" />
                Instant Stripe checkout
              </li>
              <li className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                <Check className="h-4 w-4 text-emerald-500" />
                1 credit per search
              </li>
            </ul>
            <button
              type="button"
              onClick={() => handleCheckout(pkg.id)}
              disabled={loadingId === pkg.id}
              className={cn(
                'mt-6 inline-flex items-center justify-center rounded-full px-4 py-3 text-sm font-semibold shadow-sm transition',
                pkg.highlight
                  ? 'bg-slate-900 text-white hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md'
                  : 'border border-slate-200 bg-white text-slate-800 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md',
                loadingId === pkg.id && 'cursor-not-allowed opacity-60',
              )}
            >
              {loadingId === pkg.id ? 'Redirecting to Stripe...' : 'Buy now'}
            </button>
          </div>
        ))}
      </div>

      <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-3">
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
          <Zap className="h-5 w-5 text-amber-500" />
          <span>Automatic refunds if a search fails. Your credits stay safe.</span>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
          <Check className="h-5 w-5 text-emerald-500" />
          <span>No subscriptions. Pay once and use anytime.</span>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
          <Crown className="h-5 w-5 text-amber-500" />
          <span>High-speed visual matches with clear confidence scores.</span>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase">Refunds</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-900">Refund policy summary</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          <li>Credits are digital goods and are generally non-refundable once used.</li>
          <li>Unused credit packs may be eligible for a full refund within 14 days.</li>
          <li>Technical failures or duplicate charges are eligible for correction or refund.</li>
        </ul>
        <Link href={refundsHref} className="mt-4 inline-flex text-sm font-semibold text-indigo-600 hover:underline">
          Read the full refund policy
        </Link>
      </div>

      <SignedOut>
        <div className="rounded-3xl border border-slate-200 bg-slate-900 px-6 py-8 text-white shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-300 uppercase">Start free</p>
              <h3 className="text-2xl font-semibold">Sign up and get 3 credits on us</h3>
              <p className="text-sm text-slate-200">Test the search quality before you pay. Credits never expire.</p>
            </div>
            <Link
              href={`${localePrefix}/sign-up`}
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Create account
            </Link>
          </div>
        </div>
      </SignedOut>
    </div>
  );
};

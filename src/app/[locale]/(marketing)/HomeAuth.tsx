'use client';

import { SignedIn, SignedOut } from '@clerk/nextjs';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export const HomeSignedOutBanner = () => {
  return (
    <SignedOut>
      <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 px-5 py-4">
        <p className="text-base font-semibold text-slate-900">
          <Sparkles className="mb-1 inline h-5 w-5 text-indigo-600" />
          {' '}
          Get 3 Free Searches - No Credit Card Required
        </p>
        <p className="mt-2 text-sm text-slate-700">
          Try our reverse image search for free. Find similar images, track sources, and discover higher resolution versions across the web.
        </p>
      </div>
    </SignedOut>
  );
};

export const HomeHeroCtas = ({ prefix }: { prefix: string }) => {
  return (
    <>
      <SignedOut>
        <Link
          href={`${prefix}/sign-up`}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
        >
          Try free (3 credits)
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href={`${prefix}/pricing`}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        >
          View pricing
        </Link>
      </SignedOut>
      <SignedIn>
        <Link
          href={`${prefix}/account`}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        >
          View balance
        </Link>
      </SignedIn>
    </>
  );
};

export const HomeUseCasesSignedOutCta = ({ prefix }: { prefix: string }) => {
  return (
    <SignedOut>
      <Link
        href={`${prefix}/sign-up`}
        className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
      >
        Get started
        <ArrowRight className="h-4 w-4" />
      </Link>
    </SignedOut>
  );
};

export const HomeBottomCta = ({ prefix }: { prefix: string }) => {
  const signedInHref = prefix || '/';

  return (
    <>
      <SignedOut>
        <Link
          href={`${prefix}/sign-up`}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-slate-900 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
        >
          Get Started with 3 Free Credits
          <ArrowRight className="h-5 w-5" />
        </Link>
        <p className="mt-4 text-sm text-slate-400">
          No credit card required · Start searching in seconds
        </p>
      </SignedOut>
      <SignedIn>
        <Link
          href={signedInHref}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-slate-900 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
        >
          Start Searching Now
          <ArrowRight className="h-5 w-5" />
        </Link>
      </SignedIn>
    </>
  );
};

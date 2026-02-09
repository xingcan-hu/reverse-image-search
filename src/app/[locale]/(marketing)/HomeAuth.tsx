'use client';

import type { ReactNode } from 'react';
import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut } from '@clerk/nextjs';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from '@/components/AppLink';

export const HomeSignedInOnly = ({ children }: { children: ReactNode }) => {
  return (
    <ClerkLoaded>
      <SignedIn>
        {children}
      </SignedIn>
    </ClerkLoaded>
  );
};

export const HomeSignedOutOnly = ({ children }: { children: ReactNode }) => {
  return (
    <ClerkLoaded>
      <SignedOut>
        {children}
      </SignedOut>
    </ClerkLoaded>
  );
};

export const HomeAuthLoadingOnly = ({ children }: { children: ReactNode }) => {
  return (
    <ClerkLoading>
      {children}
    </ClerkLoading>
  );
};

export const HomeSignedOutBanner = () => {
  return (
    <SignedOut>
      <div className="ui-panel border-sky-200/80 bg-white/80 p-4 backdrop-blur sm:p-5">
        <p className="text-base font-semibold text-slate-900">
          <Sparkles className="mb-1 inline h-5 w-5 text-sky-600" />
          {' '}
          Get 3 Free Searches - No Credit Card Required
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
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
          className="ui-btn-primary"
        >
          Try free (3 credits)
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href={`${prefix}/pricing`}
          className="ui-btn-secondary"
        >
          View pricing
        </Link>
      </SignedOut>
      <SignedIn>
        <Link
          href={`${prefix}/account`}
          className="ui-btn-secondary"
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
        className="ui-btn-primary"
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
          className="ui-btn-primary ui-btn-lg mt-8"
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
          className="ui-btn-secondary ui-btn-lg mt-8"
        >
          Start Searching Now
          <ArrowRight className="h-5 w-5" />
        </Link>
      </SignedIn>
    </>
  );
};

import type { SignIn } from '@clerk/nextjs';
import type { Metadata } from 'next';
import type { ComponentProps } from 'react';
import { AuthClerkCard } from '../../AuthClerkCard';

export const dynamic = 'force-static';

const signInAppearance: ComponentProps<typeof SignIn>['appearance'] = {
  elements: {
    rootBox: 'w-full',
    card: 'w-full rounded-3xl border border-slate-200 bg-white shadow-none',
    headerTitle: 'text-2xl font-semibold text-[#1d1d1f]',
    headerSubtitle: 'text-sm text-[#6e6e73]',
    socialButtonsBlockButton: 'rounded-xl border border-slate-200 bg-white hover:bg-slate-50',
    socialButtonsBlockButtonText: 'text-sm font-medium text-[#1d1d1f]',
    dividerLine: 'bg-slate-200',
    dividerText: 'text-xs font-semibold tracking-[0.14em] text-[#6e6e73] uppercase',
    formFieldLabel: 'text-xs font-semibold tracking-wide text-[#6e6e73] uppercase',
    formFieldInput: 'rounded-xl border border-slate-200 bg-white text-[#1d1d1f] focus:border-[#0071e3] focus:ring-[#0071e3]',
    formButtonPrimary: 'rounded-xl bg-[#0071e3] text-sm font-semibold hover:bg-[#0066cc]',
    footerActionText: 'text-sm text-[#6e6e73]',
    footerActionLink: 'text-sm font-semibold text-[#0071e3] hover:text-[#0066cc]',
  },
};

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Access your ReverseImage.io account and credits.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignInPage() {
  return (
    <div className="grid w-full min-w-0 gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
      <section className="ui-panel-hero auth-hero-reveal hidden bg-[var(--ui-soft)]/65 p-10 lg:block">
        <p className="ui-kicker">Welcome Back</p>
        <h1 className="ui-heading-lg mt-4">
          Sign in and continue
          {' '}
          <span className="ui-title-accent">searching by image</span>
        </h1>
        <p className="ui-body mt-4 text-base">
          Access your credits, run new reverse image searches, and view your account history.
        </p>
      </section>

      <section className="ui-panel ui-panel-lg auth-panel-reveal min-w-0 bg-white/90 p-3 sm:p-6">
        <AuthClerkCard mode="sign-in" appearance={signInAppearance} />
      </section>
    </div>
  );
}

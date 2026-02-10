'use client';

import type { ComponentProps } from 'react';
import { ClerkLoaded, ClerkLoading, SignIn, SignUp } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

type SignInAppearance = ComponentProps<typeof SignIn>['appearance'];
type SignUpAppearance = ComponentProps<typeof SignUp>['appearance'];

type AuthClerkCardProps = {
  mode: 'sign-in' | 'sign-up';
  appearance: SignInAppearance | SignUpAppearance;
};

export const AuthClerkCard = ({ mode, appearance }: AuthClerkCardProps) => {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    const slowTimer = window.setTimeout(() => {
      setIsSlow(true);
    }, 7000);

    return () => {
      clearTimeout(slowTimer);
    };
  }, []);

  return (
    <div className="relative min-h-[26rem]">
      <ClerkLoading>
        <div className="auth-loading-overlay">
          <div className="auth-loading-shell" aria-hidden="true">
            <div className="auth-loading-bar auth-loading-bar-lg" />
            <div className="auth-loading-bar auth-loading-bar-sm" />
            <div className="auth-loading-grid">
              <div className="auth-loading-bar" />
              <div className="auth-loading-bar" />
              <div className="auth-loading-bar" />
            </div>
            <div className="auth-loading-bar auth-loading-bar-sm" />
            <div className="auth-loading-bar auth-loading-bar-md" />
            <div className="auth-loading-bar auth-loading-bar-md" />
            <div className="auth-loading-bar auth-loading-bar-md" />
            {isSlow && (
              <p className="auth-loading-note">
                Loading is slow. If this persists, disable blockers and refresh.
              </p>
            )}
          </div>
        </div>
      </ClerkLoading>

      <ClerkLoaded>
        {mode === 'sign-in'
          ? <SignIn appearance={appearance as SignInAppearance} />
          : <SignUp appearance={appearance as SignUpAppearance} />}
      </ClerkLoaded>
    </div>
  );
};

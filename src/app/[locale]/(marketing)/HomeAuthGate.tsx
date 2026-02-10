'use client';

import { useAuth } from '@clerk/nextjs';
import { SearchClient } from './search/SearchClient';

type HomeAuthGateProps = {
  children: React.ReactNode;
};

export const HomeAuthGate = ({ children }: HomeAuthGateProps) => {
  const { isLoaded, isSignedIn } = useAuth();

  // Keep signed-out SSR content as the default render path for SEO and low server cost.
  if (!isLoaded || !isSignedIn) {
    return <>{children}</>;
  }

  return (
    <div className="home-shell space-y-14 pb-10 font-[var(--home-font)] sm:space-y-20 sm:pb-12">
      <section className="home-fade-up home-search-tool overflow-hidden rounded-[2.2rem] bg-white/82 p-4 shadow-[0_24px_52px_-42px_rgba(15,23,42,0.6)] sm:p-8">
        <div className="mb-4 flex min-w-0 flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-[var(--home-accent)] uppercase">Search Tool</p>
            <h1 className="mt-2 text-2xl font-semibold text-[var(--home-ink)] sm:text-4xl">
              Search by image
              {' '}
              <span className="home-title-accent">in seconds</span>
            </h1>
          </div>
          <p className="max-w-full px-1 text-xs font-medium text-slate-500 sm:w-fit sm:text-sm">
            Upload file, drag-and-drop, or image URL
          </p>
        </div>
        <SearchClient />
      </section>
    </div>
  );
};

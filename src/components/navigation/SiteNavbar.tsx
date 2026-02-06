'use client';

import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Menu, X } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useState } from 'react';
import Link from '@/components/AppLink';
import { routing } from '@/libs/I18nRouting';
import { cn } from '@/utils/Cn';
import { CreditsBadge } from '../credits/CreditsBadge';

export const SiteNavbar = () => {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const localePrefix = locale === routing.defaultLocale ? '' : `/${locale}`;

  const navLinks = [
    { href: `${localePrefix || '/'}`, label: 'Home' },
    { href: `${localePrefix}/pricing`, label: 'Pricing' },
    { href: `${localePrefix}/account`, label: 'Account', protected: true },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href={`${localePrefix || '/'}`} className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
            <span className="text-lg">V</span>
          </div>
          <div>
            <div className="text-lg">Reverse Image Search</div>
            <div className="text-xs text-slate-500">Reverse image search</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <SignedIn>
            <CreditsBadge className="hidden md:flex" />
            <Link
              href={`${localePrefix || '/'}`}
              className="hidden rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md md:inline-flex"
            >
              New search
            </Link>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'h-9 w-9 border border-slate-200 shadow-sm',
                },
              }}
            />
          </SignedIn>

          <SignedOut>
            <Link
              href={`${localePrefix}/pricing`}
              className="hidden text-sm font-semibold text-slate-700 transition hover:text-slate-900 md:inline-flex"
            >
              Pricing
            </Link>
            <Link
              href={`${localePrefix}/sign-in`}
              className="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900 hover:shadow-sm md:inline-flex"
            >
              Sign in
            </Link>
            <Link
              href={`${localePrefix}/sign-up`}
              className="hidden rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md md:inline-flex"
            >
              Get started
            </Link>
          </SignedOut>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100 md:hidden"
          >
            <span className="sr-only">Toggle navigation</span>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          'md:hidden',
          open ? 'block border-t border-slate-200 bg-white/90 backdrop-blur' : 'hidden',
        )}
      >
        <div className="space-y-2 px-4 pt-2 pb-4 text-sm font-semibold text-slate-700">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-lg px-3 py-2 transition hover:bg-slate-100"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <SignedIn>
            <CreditsBadge className="w-full justify-between" />
            <Link
              href={`${localePrefix || '/'}`}
              className="flex items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-white shadow-sm"
              onClick={() => setOpen(false)}
            >
              New search
            </Link>
          </SignedIn>
          <SignedOut>
            <Link
              href={`${localePrefix}/sign-up`}
              className="flex items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-white shadow-sm"
              onClick={() => setOpen(false)}
            >
              Get started
            </Link>
            <Link
              href={`${localePrefix}/sign-in`}
              className="flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-slate-800 shadow-sm"
              onClick={() => setOpen(false)}
            >
              Sign in
            </Link>
          </SignedOut>
        </div>
      </div>
    </header>
  );
};

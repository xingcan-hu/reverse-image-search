'use client';

import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Menu, X } from 'lucide-react';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';
import Link from '@/components/AppLink';
import { routing } from '@/libs/I18nRouting';
import { cn } from '@/utils/Cn';
import favicon32 from '../../../public/favicon-32x32.png';
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
    <header className="sticky top-0 z-40 border-b border-[var(--ui-line)] bg-white/78 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href={`${localePrefix || '/'}`} className="flex items-center gap-2.5 text-base font-semibold text-[var(--ui-ink)]">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-[var(--ui-ink)] text-white shadow-sm">
            <Image src={favicon32} alt="Logo" className="h-full w-full object-cover" priority />
          </div>
          <div>
            <div className="text-lg leading-tight">Reverse Image Search</div>
            <div className="text-xs text-[var(--ui-muted)]">Reverse image search</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-[var(--ui-muted)] md:flex">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-[var(--ui-ink)]"
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
              className="ui-btn-primary hidden md:inline-flex"
            >
              New search
            </Link>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'h-9 w-9 border border-[var(--ui-line)] shadow-sm',
                },
              }}
            />
          </SignedIn>

          <SignedOut>
            <Link
              href={`${localePrefix}/pricing`}
              className="hidden text-sm font-semibold text-[var(--ui-muted)] transition hover:text-[var(--ui-ink)] md:inline-flex"
            >
              Pricing
            </Link>
            <Link
              href={`${localePrefix}/sign-in`}
              className="ui-btn-secondary hidden md:inline-flex"
            >
              Sign in
            </Link>
            <Link
              href={`${localePrefix}/sign-up`}
              className="ui-btn-primary hidden md:inline-flex"
            >
              Get started
            </Link>
          </SignedOut>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="inline-flex items-center justify-center rounded-lg border border-[var(--ui-line)] p-2 text-[var(--ui-ink)] transition hover:bg-[var(--ui-soft)] md:hidden"
          >
            <span className="sr-only">Toggle navigation</span>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          'md:hidden',
          open ? 'block border-t border-[var(--ui-line)] bg-white/92 backdrop-blur-xl' : 'hidden',
        )}
      >
        <div className="space-y-2 px-4 pt-2 pb-4 text-sm font-semibold text-[var(--ui-ink)]">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-lg px-3 py-2 transition hover:bg-[var(--ui-soft)]"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <SignedIn>
            <CreditsBadge className="w-full justify-between" />
            <Link
              href={`${localePrefix || '/'}`}
              className="ui-btn-primary ui-btn-block"
              onClick={() => setOpen(false)}
            >
              New search
            </Link>
          </SignedIn>
          <SignedOut>
            <Link
              href={`${localePrefix}/sign-up`}
              className="ui-btn-primary ui-btn-block"
              onClick={() => setOpen(false)}
            >
              Get started
            </Link>
            <Link
              href={`${localePrefix}/sign-in`}
              className="ui-btn-secondary ui-btn-block"
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

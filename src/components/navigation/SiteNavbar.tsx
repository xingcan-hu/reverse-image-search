'use client';

import { ClerkLoading, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Menu, X } from 'lucide-react';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Link from '@/components/AppLink';
import { routing } from '@/libs/I18nRouting';
import { cn } from '@/utils/Cn';
import favicon32 from '../../../public/favicon-32x32.png';
import { CreditsBadge } from '../credits/CreditsBadge';

export const SiteNavbar = () => {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const pathname = usePathname();
  const localePrefix = locale === routing.defaultLocale ? '' : `/${locale}`;

  const signedOutLinks = [
    { href: `${localePrefix || '/'}`, label: 'Home' },
    { href: `${localePrefix}/pricing`, label: 'Pricing' },
  ];
  const signedInLinks = [
    ...signedOutLinks,
    { href: `${localePrefix}/account`, label: 'Account' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const renderLinks = (links: Array<{ href: string; label: string }>, mobile = false) => {
    return links.map(link => (
      <Link
        key={link.href}
        href={link.href}
        className={cn(
          mobile
            ? 'block rounded-xl px-3 py-2.5 text-sm font-semibold transition'
            : 'rounded-full px-4 py-2 text-sm font-semibold transition',
          isActive(link.href)
            ? mobile
              ? 'bg-[var(--ui-soft)] text-[var(--ui-ink)]'
              : 'bg-white text-[var(--ui-ink)] shadow-sm'
            : mobile
              ? 'text-[var(--ui-muted)] hover:bg-[var(--ui-soft)] hover:text-[var(--ui-ink)]'
              : 'text-[var(--ui-muted)] hover:bg-white/70 hover:text-[var(--ui-ink)]',
        )}
        onClick={() => setOpen(false)}
      >
        {link.label}
      </Link>
    ));
  };

  const desktopSignedOutNav = (
    <nav className="inline-flex items-center gap-1 rounded-full border border-[var(--ui-line)] bg-white/85 p-1 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.85)]">
      {renderLinks(signedOutLinks)}
    </nav>
  );

  const desktopSignedInNav = (
    <nav className="inline-flex items-center gap-1 rounded-full border border-[var(--ui-line)] bg-white/85 p-1 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.85)]">
      {renderLinks(signedInLinks)}
    </nav>
  );

  const desktopSignedOutActions = (
    <>
      <Link
        href={`${localePrefix}/sign-in`}
        className="ui-btn-secondary whitespace-nowrap"
      >
        Sign in
      </Link>
      <Link
        href={`${localePrefix}/sign-up`}
        className="ui-btn-primary whitespace-nowrap"
      >
        Get started
      </Link>
    </>
  );

  const mobileSignedOutActions = (
    <>
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
    </>
  );

  return (
    <header className="sticky top-0 z-40 overflow-x-clip border-b border-[var(--ui-line)] bg-[color:rgb(245_245_247/0.92)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl min-w-0 items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        <Link href={`${localePrefix || '/'}`} className="group flex min-w-0 shrink-0 items-center gap-3">
          <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/60 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white shadow-[0_12px_24px_-18px_rgba(15,23,42,0.9)]">
            <Image src={favicon32} alt="Logo" className="h-full w-full object-cover opacity-95" priority />
          </span>
          <span className="hidden min-w-0 flex-col sm:flex">
            <span className="truncate text-[15px] leading-tight font-semibold text-[var(--ui-ink)]">ReverseImage.io</span>
            <span className="truncate text-xs text-[var(--ui-muted)]">Search by image</span>
          </span>
        </Link>

        <div className="hidden lg:flex lg:flex-1 lg:justify-center">
          <ClerkLoading>{desktopSignedOutNav}</ClerkLoading>
          <SignedOut>{desktopSignedOutNav}</SignedOut>
          <SignedIn>
            {desktopSignedInNav}
          </SignedIn>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <SignedIn>
            <div className="hidden lg:flex">
              <CreditsBadge className="whitespace-nowrap" />
            </div>
            <div className="hidden lg:flex">
              <Link
                href={`${localePrefix || '/'}`}
                className="ui-btn-primary whitespace-nowrap"
              >
                New search
              </Link>
            </div>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'h-9 w-9 border border-[var(--ui-line)] bg-white shadow-sm',
                },
              }}
            />
          </SignedIn>

          <div className="hidden lg:flex lg:items-center lg:gap-2">
            <ClerkLoading>{desktopSignedOutActions}</ClerkLoading>
            <SignedOut>{desktopSignedOutActions}</SignedOut>
          </div>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--ui-line)] bg-white/90 text-[var(--ui-ink)] transition hover:bg-[var(--ui-soft)] lg:hidden"
          >
            <span className="sr-only">Toggle navigation</span>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          'px-4 pb-4 lg:hidden',
          open ? 'block' : 'hidden',
        )}
      >
        <div className="ui-panel ui-panel-lg space-y-2 bg-white/95 p-3 shadow-xl">
          <ClerkLoading>{renderLinks(signedOutLinks, true)}</ClerkLoading>
          <SignedOut>{renderLinks(signedOutLinks, true)}</SignedOut>
          <SignedIn>{renderLinks(signedInLinks, true)}</SignedIn>
          <div className="my-1 h-px bg-[var(--ui-line)]" />
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
          <ClerkLoading>{mobileSignedOutActions}</ClerkLoading>
          <SignedOut>{mobileSignedOutActions}</SignedOut>
          <p className="px-1 pt-1 text-xs text-[var(--ui-muted)]">Reverse image search with transparent credits</p>
        </div>
      </div>
    </header>
  );
};

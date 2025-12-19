'use client';

import { Zap } from 'lucide-react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { routing } from '@/libs/I18nRouting';
import { cn } from '@/utils/Cn';
import { useCredits } from './CreditsProvider';

export const CreditsBadge = ({ className }: { className?: string }) => {
  const { credits, loading } = useCredits();
  const locale = useLocale();
  const href = locale === routing.defaultLocale ? '/pricing' : `/${locale}/pricing`;

  return (
    <Link
      href={href}
      className={cn(
        'group inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-3 py-1 text-sm font-semibold text-amber-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md',
        className,
      )}
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-600 shadow-sm">
        <Zap className="h-3.5 w-3.5" />
      </span>
      <span className="font-semibold">
        {loading ? 'Loading...' : `${credits ?? 0} credits`}
      </span>
      <span className="text-xs font-medium text-amber-600 group-hover:underline">
        Top up
      </span>
    </Link>
  );
};

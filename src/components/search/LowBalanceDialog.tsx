'use client';

import { X } from 'lucide-react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { routing } from '@/libs/I18nRouting';
import { cn } from '@/utils/Cn';

type LowBalanceDialogProps = {
  open: boolean;
  onClose: () => void;
};

export const LowBalanceDialog = ({ open, onClose }: LowBalanceDialogProps) => {
  const locale = useLocale();
  const pricingHref = locale === routing.defaultLocale ? '/pricing' : `/${locale}/pricing`;

  return (
    <div className={cn('fixed inset-0 z-50 items-center justify-center bg-black/30 p-4 backdrop-blur-sm transition', open ? 'flex' : 'hidden')}>
      <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-600 uppercase">Balance needed</p>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">You are out of credits</h3>
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-3 text-sm text-slate-600">
          Each reverse image search costs 1 credit. Recharge to continue searching — credits never expire and failed searches are auto-refunded.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            href={pricingHref}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-600 hover:shadow-md"
            onClick={onClose}
          >
            Go to pricing
          </Link>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
            onClick={onClose}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};

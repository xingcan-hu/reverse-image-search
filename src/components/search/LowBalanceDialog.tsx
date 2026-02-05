'use client';

import { X } from 'lucide-react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useCredits } from '@/components/credits/CreditsProvider';
import { routing } from '@/libs/I18nRouting';
import { cn } from '@/utils/Cn';

type LowBalanceDialogProps = {
  open: boolean;
  onCloseAction: () => void;
};

export const LowBalanceDialog = ({ open, onCloseAction }: LowBalanceDialogProps) => {
  const locale = useLocale();
  const { refreshCredits } = useCredits();
  const apiPrefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  const pricingHref = locale === routing.defaultLocale ? '/pricing' : `/${locale}/pricing`;
  const [checkinStatusLoading, setCheckinStatusLoading] = useState(false);
  const [checkinSubmitting, setCheckinSubmitting] = useState(false);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [checkinSuccess, setCheckinSuccess] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');
  const checkinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) {
      setCheckinSuccess(false);
      return;
    }

    let active = true;

    const loadCheckinStatus = async () => {
      setCheckinStatusLoading(true);
      try {
        const response = await fetch(`${apiPrefix}/api/rewards/checkin/status`);
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        if (active) {
          setCheckedInToday(Boolean(data.checkedInToday));
        }
      } finally {
        if (active) {
          setCheckinStatusLoading(false);
        }
      }
    };

    const loadInvite = async () => {
      setInviteLoading(true);
      try {
        const response = await fetch(`${apiPrefix}/api/rewards/invite`);
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        if (active) {
          setInviteUrl(data.inviteUrl ?? '');
        }
      } finally {
        if (active) {
          setInviteLoading(false);
        }
      }
    };

    void loadCheckinStatus();
    void loadInvite();

    return () => {
      active = false;
    };
  }, [apiPrefix, open]);

  useEffect(() => {
    return () => {
      if (checkinTimerRef.current) {
        clearTimeout(checkinTimerRef.current);
      }
    };
  }, []);

  const handleCheckIn = async () => {
    if (checkinStatusLoading || checkinSubmitting || checkedInToday) {
      return;
    }

    setCheckinSubmitting(true);
    try {
      const response = await fetch(`${apiPrefix}/api/rewards/checkin`, {
        method: 'POST',
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.error(data.error ?? 'Unable to check in');
        return;
      }

      if (data.alreadyCheckedIn) {
        setCheckedInToday(true);
        toast.info('Checked in already');
        return;
      }

      setCheckedInToday(true);
      if (checkinTimerRef.current) {
        clearTimeout(checkinTimerRef.current);
      }
      setCheckinSuccess(true);
      checkinTimerRef.current = setTimeout(() => setCheckinSuccess(false), 1600);
      toast.success('Checked in! +1 credit');
      await refreshCredits();
    } catch {
      toast.error('Unable to check in');
    } finally {
      setCheckinSubmitting(false);
    }
  };

  const ensureInviteUrl = async () => {
    if (inviteUrl) {
      return inviteUrl;
    }

    setInviteLoading(true);
    try {
      const response = await fetch(`${apiPrefix}/api/rewards/invite`);
      if (!response.ok) {
        return '';
      }
      const data = await response.json();
      const url = data.inviteUrl ?? '';
      setInviteUrl(url);
      return url;
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCopyInvite = async () => {
    try {
      const url = await ensureInviteUrl();
      if (!url) {
        toast.error('Invite link unavailable');
        return;
      }

      await navigator.clipboard.writeText(url);
      toast.success('Invite link copied');
    } catch {
      toast.error('Unable to copy invite link');
    }
  };

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
            onClick={onCloseAction}
            className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-3 text-sm text-slate-600">
          Each reverse image search costs 1 credit. Get free credits by checking in daily or inviting friends. Paid credits are available anytime.
        </p>
        <div className="mt-5 space-y-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Free options</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleCheckIn}
                disabled={checkinStatusLoading || checkinSubmitting || checkedInToday}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {checkinSubmitting || checkinStatusLoading
                  ? 'Checking...'
                  : checkedInToday
                    ? 'Checked in today'
                    : 'Check in +1 credit'}
              </button>
              <button
                type="button"
                onClick={handleCopyInvite}
                disabled={inviteLoading}
                className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {inviteLoading ? 'Loading link...' : 'Copy invite link'}
              </button>
            </div>
            {checkinSuccess && (
              <div className="mt-3 inline-flex animate-bounce items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                +1 credit added
              </div>
            )}
          </div>
          <div className="flex items-center justify-between text-sm">
            <Link
              href={pricingHref}
              className="font-semibold text-slate-700 hover:underline"
              onClick={onCloseAction}
            >
              Go to pricing
            </Link>
            <button
              type="button"
              className="font-semibold text-slate-500 transition hover:text-slate-700"
              onClick={onCloseAction}
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

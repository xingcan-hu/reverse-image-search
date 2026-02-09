'use client';

import { UserButton } from '@clerk/nextjs';
import { Copy, Gift, LogOut, Receipt, Share2, Wallet } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import Link from '@/components/AppLink';
import { useCredits } from '@/components/credits/CreditsProvider';
import { routing } from '@/libs/I18nRouting';

type Transaction = {
  id: string;
  amount: number;
  currency: string;
  creditsAdded: number;
  stripeSessionId: string;
  status: string;
  createdAt: string | null;
};

type InviteStats = {
  invitedUsers: number;
  creditsEarned: number;
};

type InviteRecent = {
  inviteeUserId: string;
  inviteeEmailMasked: string | null;
  createdAt: string | null;
};

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(amount / 100);
};

export const AccountClient = () => {
  const { credits, refreshCredits } = useCredits();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkinLoading, setCheckinLoading] = useState(true);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [checkinSuccess, setCheckinSuccess] = useState(false);
  const [nextResetAt, setNextResetAt] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(true);
  const [inviteUrl, setInviteUrl] = useState('');
  const [inviteStats, setInviteStats] = useState<InviteStats>({
    invitedUsers: 0,
    creditsEarned: 0,
  });
  const [inviteRecent, setInviteRecent] = useState<InviteRecent[]>([]);
  const locale = useLocale();
  const apiPrefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  const localePrefix = apiPrefix || '';
  const checkinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiPrefix}/api/users/transactions`);

        if (!response.ok) {
          toast.error('Unable to load transactions');
          setLoading(false);
          return;
        }

        const data = await response.json();
        setTransactions(data.transactions ?? []);
      } catch {
        toast.error('Unable to load transactions');
      } finally {
        setLoading(false);
        await refreshCredits();
      }
    };

    void loadTransactions();
  }, [apiPrefix, refreshCredits]);

  useEffect(() => {
    return () => {
      if (checkinTimerRef.current) {
        clearTimeout(checkinTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const loadRewards = async () => {
      setCheckinLoading(true);
      setInviteLoading(true);

      try {
        const [checkinResponse, inviteResponse] = await Promise.all([
          fetch(`${apiPrefix}/api/rewards/checkin/status`),
          fetch(`${apiPrefix}/api/rewards/invite`),
        ]);

        if (checkinResponse.ok) {
          const data = await checkinResponse.json();
          setCheckedInToday(Boolean(data.checkedInToday));
          setNextResetAt(typeof data.nextResetAt === 'string' ? data.nextResetAt : null);
        } else {
          toast.error('Unable to load check-in status');
        }

        if (inviteResponse.ok) {
          const data = await inviteResponse.json();
          setInviteUrl(data.inviteUrl ?? '');
          setInviteStats({
            invitedUsers: data.stats?.invitedUsers ?? 0,
            creditsEarned: data.stats?.creditsEarned ?? 0,
          });
          setInviteRecent(data.recent ?? []);
        } else {
          toast.error('Unable to load invite details');
        }
      } catch {
        toast.error('Unable to load rewards');
      } finally {
        setCheckinLoading(false);
        setInviteLoading(false);
      }
    };

    void loadRewards();
  }, [apiPrefix]);

  useEffect(() => {
    const claimReferral = async () => {
      try {
        const response = await fetch(`${apiPrefix}/api/rewards/referrals/claim`, {
          method: 'POST',
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (data?.claimed) {
          toast.success('Invite applied. Your friend has been rewarded.');
        }
      } catch {
        // Ignore referral claim failures.
      } finally {
        await refreshCredits();
      }
    };

    void claimReferral();
  }, [apiPrefix, refreshCredits]);

  const createdAtFormatter = useMemo(() => new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }), []);

  const resetAtFormatter = useMemo(() => new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }), []);

  const handleCheckIn = async () => {
    if (checkinLoading || checkedInToday) {
      return;
    }

    setCheckinLoading(true);
    try {
      const response = await fetch(`${apiPrefix}/api/rewards/checkin`, {
        method: 'POST',
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.error(data.error ?? 'Unable to check in');
        return;
      }

      setCheckedInToday(Boolean(data.checkedIn));
      if (data.checkedIn) {
        if (checkinTimerRef.current) {
          clearTimeout(checkinTimerRef.current);
        }
        setCheckinSuccess(true);
        checkinTimerRef.current = setTimeout(() => setCheckinSuccess(false), 1600);
      }
      setNextResetAt(typeof data.nextResetAt === 'string' ? data.nextResetAt : nextResetAt);
      toast.success('Checked in! +1 credit');
    } catch {
      toast.error('Unable to check in');
    } finally {
      setCheckinLoading(false);
      await refreshCredits();
    }
  };

  const handleCopyInvite = async () => {
    if (!inviteUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success('Invite link copied');
    } catch {
      toast.error('Unable to copy invite link');
    }
  };

  return (
    <div className="ui-page">
      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <div className="ui-panel min-w-0 p-6">
          <p className="text-xs font-semibold text-[var(--ui-accent)] uppercase">Credits</p>
          <div className="mt-2 flex items-end gap-3">
            <p className="text-5xl font-bold text-[var(--ui-ink)]">{credits ?? 0}</p>
            <span className="text-sm font-semibold text-[var(--ui-muted)]">available</span>
          </div>
          <p className="mt-2 text-sm text-[var(--ui-muted)]">Use 1 credit per search. Credits never expire.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`${localePrefix}/pricing`}
              className="ui-btn-primary"
            >
              Buy more credits
            </Link>
            <Link
              href={`${localePrefix || '/'}`}
              className="ui-btn-secondary"
            >
              New search
            </Link>
          </div>
        </div>
        <div className="ui-panel min-w-0 p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--ui-accent)] uppercase">Account</p>
              <p className="text-lg font-semibold text-[var(--ui-ink)]">Manage your session</p>
              <p className="text-sm text-[var(--ui-muted)]">Signed in with Clerk. Secure payments via Stripe.</p>
            </div>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'h-12 w-12 border border-[var(--ui-line)] shadow-sm',
                },
              }}
            />
          </div>
          <div className="mt-4 space-y-2 text-sm text-[var(--ui-muted)]">
            <div className="flex items-center gap-2 rounded-xl bg-[var(--ui-soft)] p-3">
              <Wallet className="h-4 w-4 text-[var(--ui-accent)]" />
              <span>Credits are tied to your account. Logging out keeps your balance safe.</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-[var(--ui-soft)] p-3">
              <Receipt className="h-4 w-4 text-[var(--ui-accent)]" />
              <span>Every payment creates a transaction log with amount, currency, and credits added.</span>
            </div>
          </div>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--ui-accent)] px-4 py-2 text-xs font-semibold text-white shadow-sm">
            <LogOut className="h-4 w-4" />
            Use the avatar menu to sign out
          </div>
        </div>
      </div>

      <div className="ui-panel min-w-0 p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[var(--ui-accent)] uppercase">History</p>
            <h2 className="text-xl font-semibold text-[var(--ui-ink)]">Recent recharges</h2>
          </div>
          <Link href={`${localePrefix}/pricing`} className="text-sm font-semibold text-[var(--ui-accent)] hover:underline">
            Recharge credits
          </Link>
        </div>
        {loading && (
          <div className="mt-4 grid gap-3">
            {['history-skeleton-a', 'history-skeleton-b', 'history-skeleton-c'].map(key => (
              <div key={key} className="animate-pulse rounded-xl bg-[var(--ui-soft)] p-4" />
            ))}
          </div>
        )}
        {!loading && transactions.length === 0 && (
          <div className="mt-4 rounded-xl border border-[var(--ui-line)] bg-[var(--ui-soft)] px-4 py-6 text-sm text-[var(--ui-muted)]">
            No transactions yet. Start with your free credits or purchase a pack to see them here.
          </div>
        )}
        {!loading && transactions.length > 0 && (
          <div className="mt-4 divide-y divide-slate-100">
            {transactions.map(tx => (
              <div key={tx.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--ui-ink)]">
                    {formatCurrency(tx.amount, tx.currency)}
                    {' '}
                    · +
                    {tx.creditsAdded}
                    {' '}
                    credits
                  </p>
                  <p className="text-xs text-[var(--ui-muted)]">{tx.status}</p>
                </div>
                <div className="text-xs text-[var(--ui-muted)]">
                  {tx.createdAt ? createdAtFormatter.format(new Date(tx.createdAt)) : '—'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <div className="ui-panel min-w-0 p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--ui-accent)] uppercase">Daily check-in</p>
              <h2 className="text-lg font-semibold text-[var(--ui-ink)]">Earn +1 credit every day</h2>
              <p className="mt-1 text-sm text-[var(--ui-muted)]">Check in once per day. Credits never expire.</p>
            </div>
            <div className="ui-icon-box ui-icon-box-sm rounded-full text-[var(--ui-accent)]">
              <Gift className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCheckIn}
              disabled={checkinLoading || checkedInToday}
              className="ui-btn-primary ui-btn-xs"
            >
              {checkinLoading ? 'Checking...' : checkedInToday ? 'Checked in today' : 'Check in +1 credit'}
            </button>
            {checkinSuccess && (
              <span className="inline-flex animate-bounce items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                +1 credit added
              </span>
            )}
            {nextResetAt && (
              <span className="text-xs text-[var(--ui-muted)]">
                Resets at
                {' '}
                {resetAtFormatter.format(new Date(nextResetAt))}
              </span>
            )}
          </div>
          {checkedInToday && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Checked in for today
            </div>
          )}
        </div>

        <div className="ui-panel min-w-0 p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--ui-accent)] uppercase">Invite friends</p>
              <h2 className="text-lg font-semibold text-[var(--ui-ink)]">Get 20 credits per signup</h2>
              <p className="mt-1 text-sm text-[var(--ui-muted)]">Share your link. Your friend signs up, you earn.</p>
            </div>
            <div className="ui-icon-box ui-icon-box-sm rounded-full text-[var(--ui-accent)]">
              <Share2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <input
                value={inviteLoading ? 'Loading invite link...' : inviteUrl}
                readOnly
                className="w-full rounded-full border border-[var(--ui-line)] bg-[var(--ui-soft)] px-4 py-2 text-xs font-medium text-[var(--ui-muted)]"
              />
            </div>
            <button
              type="button"
              onClick={handleCopyInvite}
              disabled={!inviteUrl || inviteLoading}
              className="ui-btn-secondary ui-btn-xs"
            >
              <Copy className="h-4 w-4" />
              Copy link
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-[var(--ui-soft)] px-3 py-1 text-xs font-semibold text-[var(--ui-muted)]">
              Invited
              {' '}
              {inviteStats.invitedUsers}
            </span>
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-[var(--ui-accent)]">
              Earned
              {' '}
              {inviteStats.creditsEarned}
              {' '}
              credits
            </span>
          </div>
          {!inviteLoading && inviteRecent.length > 0 && (
            <div className="mt-4 space-y-2 text-xs text-[var(--ui-muted)]">
              {inviteRecent.map(item => (
                <div key={item.inviteeUserId} className="flex min-w-0 items-center justify-between gap-3">
                  <span className="truncate">{item.inviteeEmailMasked ?? 'New member'}</span>
                  <span className="shrink-0">{item.createdAt ? createdAtFormatter.format(new Date(item.createdAt)) : '—'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

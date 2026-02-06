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
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Credits</p>
          <div className="mt-2 flex items-end gap-3">
            <p className="text-5xl font-bold text-slate-900">{credits ?? 0}</p>
            <span className="text-sm font-semibold text-slate-600">available</span>
          </div>
          <p className="mt-2 text-sm text-slate-600">Use 1 credit per search. Credits never expire.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`${localePrefix}/pricing`}
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
            >
              Buy more credits
            </Link>
            <Link
              href={`${localePrefix || '/'}`}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
            >
              New search
            </Link>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Account</p>
              <p className="text-lg font-semibold text-slate-900">Manage your session</p>
              <p className="text-sm text-slate-600">Signed in with Clerk. Secure payments via Stripe.</p>
            </div>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'h-12 w-12 border border-slate-200 shadow-sm',
                },
              }}
            />
          </div>
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3">
              <Wallet className="h-4 w-4 text-indigo-600" />
              <span>Credits are tied to your account. Logging out keeps your balance safe.</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3">
              <Receipt className="h-4 w-4 text-indigo-600" />
              <span>Every payment creates a transaction log with amount, currency, and credits added.</span>
            </div>
          </div>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm">
            <LogOut className="h-4 w-4" />
            Use the avatar menu to sign out
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">History</p>
            <h2 className="text-xl font-semibold text-slate-900">Recent recharges</h2>
          </div>
          <Link href={`${localePrefix}/pricing`} className="text-sm font-semibold text-indigo-600 hover:underline">
            Recharge credits
          </Link>
        </div>
        {loading && (
          <div className="mt-4 grid gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse rounded-xl bg-slate-100 p-4" />
            ))}
          </div>
        )}
        {!loading && transactions.length === 0 && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-700">
            No transactions yet. Start with your free credits or purchase a pack to see them here.
          </div>
        )}
        {!loading && transactions.length > 0 && (
          <div className="mt-4 divide-y divide-slate-100">
            {transactions.map(tx => (
              <div key={tx.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatCurrency(tx.amount, tx.currency)}
                    {' '}
                    · +
                    {tx.creditsAdded}
                    {' '}
                    credits
                  </p>
                  <p className="text-xs text-slate-500">{tx.status}</p>
                </div>
                <div className="text-xs text-slate-500">
                  {tx.createdAt ? createdAtFormatter.format(new Date(tx.createdAt)) : '—'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Daily check-in</p>
              <h2 className="text-lg font-semibold text-slate-900">Earn +1 credit every day</h2>
              <p className="mt-1 text-sm text-slate-600">Check in once per day. Credits never expire.</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <Gift className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCheckIn}
              disabled={checkinLoading || checkedInToday}
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
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
              <span className="text-xs text-slate-500">
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

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Invite friends</p>
              <h2 className="text-lg font-semibold text-slate-900">Get 20 credits per signup</h2>
              <p className="mt-1 text-sm text-slate-600">Share your link. Your friend signs up, you earn.</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <Share2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <input
                value={inviteLoading ? 'Loading invite link...' : inviteUrl}
                readOnly
                className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-700"
              />
            </div>
            <button
              type="button"
              onClick={handleCopyInvite}
              disabled={!inviteUrl || inviteLoading}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Copy className="h-4 w-4" />
              Copy link
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              Invited
              {' '}
              {inviteStats.invitedUsers}
            </span>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              Earned
              {' '}
              {inviteStats.creditsEarned}
              {' '}
              credits
            </span>
          </div>
          {!inviteLoading && inviteRecent.length > 0 && (
            <div className="mt-4 space-y-2 text-xs text-slate-600">
              {inviteRecent.map(item => (
                <div key={item.inviteeUserId} className="flex items-center justify-between">
                  <span>{item.inviteeEmailMasked ?? 'New member'}</span>
                  <span>{item.createdAt ? createdAtFormatter.format(new Date(item.createdAt)) : '—'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

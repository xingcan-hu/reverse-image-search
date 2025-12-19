'use client';

import { UserButton } from '@clerk/nextjs';
import { LogOut, Receipt, Wallet } from 'lucide-react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
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
  const locale = useLocale();
  const apiPrefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  const localePrefix = apiPrefix || '';

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

  const createdAtFormatter = useMemo(() => new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }), []);

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
    </div>
  );
};

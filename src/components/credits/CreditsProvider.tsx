'use client';

import { useUser } from '@clerk/nextjs';
import { useLocale } from 'next-intl';
import { createContext, use, useCallback, useEffect, useState } from 'react';
import { routing } from '@/libs/I18nRouting';

type CreditsContextValue = {
  credits: number | null;
  loading: boolean;
  refreshCredits: () => Promise<void>;
  setCredits: (value: number | null) => void;
};

const CreditsContext = createContext<CreditsContextValue | undefined>(undefined);

export const CreditsProvider = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn } = useUser();
  const locale = useLocale();
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const apiPrefix = locale === routing.defaultLocale ? '' : `/${locale}`;

  const refreshCredits = useCallback(async () => {
    if (!isSignedIn) {
      setCredits(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiPrefix}/api/users/me`, {
        method: 'GET',
      });

      if (response.status === 401) {
        setCredits(null);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits);
      }
    } finally {
      setLoading(false);
    }
  }, [apiPrefix, isSignedIn]);

  useEffect(() => {
    void refreshCredits();
  }, [refreshCredits]);

  return (
    <CreditsContext
      value={{
        credits,
        loading,
        refreshCredits,
        setCredits,
      }}
    >
      {children}
    </CreditsContext>
  );
};

export const useCredits = () => {
  const context = use(CreditsContext);

  if (!context) {
    throw new Error('useCredits must be used within CreditsProvider');
  }

  return context;
};

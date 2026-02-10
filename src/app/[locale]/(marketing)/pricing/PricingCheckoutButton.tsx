'use client';

import { ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/utils/Cn';

type PricingCheckoutButtonProps = {
  packageId: string;
  apiPrefix: string;
  signInHref: string;
  highlight: boolean;
};

export const PricingCheckoutButton = ({
  packageId,
  apiPrefix,
  signInHref,
  highlight,
}: PricingCheckoutButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${apiPrefix}/api/billing/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packageId }),
      });

      if (response.status === 401) {
        window.location.href = signInHref;
        return;
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        toast.error('Unable to start checkout', { description: error.error ?? 'Try again.' });
        return;
      }

      const payload = await response.json();

      if (payload.url) {
        window.location.href = payload.url;
        return;
      }

      toast.error('Checkout link missing. Please retry.');
    } catch {
      toast.error('Unable to start checkout', { description: 'Please retry in a moment.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleCheckout()}
      disabled={isLoading}
      className={cn(
        'ui-btn-lg relative mt-4 w-full sm:mt-6',
        highlight
          ? 'ui-btn-primary'
          : 'ui-btn-secondary border-2',
        isLoading && 'cursor-not-allowed opacity-60',
      )}
    >
      {isLoading
        ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin sm:h-5 sm:w-5" />
              Processing...
            </>
          )
        : (
            <>
              Buy Now
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </>
          )}
    </button>
  );
};

import Stripe from 'stripe';
import { Env } from './Env';

let stripeClient: Stripe | null = null;

export const getStripeClient = () => {
  if (!Env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }

  if (!stripeClient) {
    stripeClient = new Stripe(Env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20' as const,
    });
  }

  return stripeClient;
};

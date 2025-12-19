import { Env } from './Env';

export type CreditPackage = {
  id: string;
  credits: number;
  price: number; // in cents
  label: string;
  highlight?: boolean;
};

const starterPriceId = Env.STRIPE_PRICE_CREDIT_500 ?? 'price_credit_500';
const proPriceId = Env.STRIPE_PRICE_CREDIT_1200 ?? 'price_credit_1200';

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: starterPriceId,
    credits: 500,
    price: 500,
    label: 'Starter',
  },
  {
    id: proPriceId,
    credits: 1200,
    price: 1000,
    label: 'Pro',
    highlight: true,
  },
];

export const findPackageById = (id: string) => CREDIT_PACKAGES.find(pkg => pkg.id === id);

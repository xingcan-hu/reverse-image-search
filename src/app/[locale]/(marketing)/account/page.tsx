import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { AccountClient } from './AccountClient';

type AccountPageProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: 'Account | Vibe Search',
  description: 'Check your remaining credits, see recharge history, and jump back into reverse image search.',
};

export default async function AccountPage(props: AccountPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <AccountClient />;
}

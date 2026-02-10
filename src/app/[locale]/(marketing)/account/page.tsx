import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getI18nPath } from '@/utils/Helpers';
import { AccountClient } from './AccountClient';

type AccountPageProps = {
  params: Promise<{ locale: string }>;
};

export const dynamic = 'force-static';

export async function generateMetadata(props: AccountPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const canonicalPath = getI18nPath('/account', locale);
  const title = 'Account and Credits Dashboard | ReverseImage.io';
  const description = 'Check your remaining credits, review recharge history, manage daily rewards, and return to reverse image search with secure account controls.';

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title,
      description,
      url: canonicalPath,
      type: 'website',
      images: ['/android-chrome-512x512.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/android-chrome-512x512.png'],
    },
  };
}

export default async function AccountPage(props: AccountPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <AccountClient />;
}

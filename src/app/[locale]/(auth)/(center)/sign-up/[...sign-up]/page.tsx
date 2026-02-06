import type { Metadata } from 'next';
import { SignUp } from '@clerk/nextjs';
import { setRequestLocale } from 'next-intl/server';
import { getI18nPath } from '@/utils/Helpers';

type ISignUpPageProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: 'Sign up',
  description: 'Create an account and get free credits to try reverse image search.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SignUpPage(props: ISignUpPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <SignUp path={getI18nPath('/sign-up', locale)} />
  );
};

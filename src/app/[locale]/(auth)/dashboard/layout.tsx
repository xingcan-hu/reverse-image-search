import type React from 'react';
import { setRequestLocale } from 'next-intl/server';

export default async function DashboardLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return props.children;
}

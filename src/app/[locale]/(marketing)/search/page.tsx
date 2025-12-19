import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { SearchClient } from './SearchClient';

type SearchPageProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: 'Reverse image search | Vibe Search',
  description: 'Upload an image, spend 1 credit, and get a grid of visual matches. Automatic refunds on failures.',
};

export default async function SearchPage(props: SearchPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <SearchClient />;
}

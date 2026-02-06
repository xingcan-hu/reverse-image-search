import { setRequestLocale } from 'next-intl/server';
import { CreditsProvider } from '@/components/credits/CreditsProvider';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteNavbar } from '@/components/navigation/SiteNavbar';

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <CreditsProvider>
      <div className="min-h-screen bg-[var(--ui-bg)] text-[var(--ui-ink)]">
        <SiteNavbar />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {props.children}
        </main>
        <SiteFooter locale={locale} />
      </div>
    </CreditsProvider>
  );
}

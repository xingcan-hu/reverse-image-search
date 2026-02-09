import Link from '@/components/AppLink';
import { routing } from '@/libs/I18nRouting';

export const SiteFooter = ({ locale }: { locale: string }) => {
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;

  return (
    <footer className="border-t border-[var(--ui-line)] bg-white/78 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-4 px-4 py-6 text-sm text-[var(--ui-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="min-w-0">
          <p className="font-semibold text-[var(--ui-ink)]">ReverseImage.io</p>
          <p className="text-[var(--ui-muted)]">Reverse image search with transparent credits.</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link href={`${prefix}/terms`} className="transition hover:text-[var(--ui-ink)]">Terms</Link>
          <Link href={`${prefix}/refunds`} className="transition hover:text-[var(--ui-ink)]">Refunds</Link>
          <Link href={`${prefix}/privacy`} className="transition hover:text-[var(--ui-ink)]">Privacy</Link>
          <Link href={`${prefix}/pricing`} className="transition hover:text-[var(--ui-ink)]">Pricing</Link>
        </div>
      </div>
    </footer>
  );
};

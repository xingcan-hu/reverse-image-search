import Link from '@/components/AppLink';
import { routing } from '@/libs/I18nRouting';

export const SiteFooter = ({ locale }: { locale: string }) => {
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;

  return (
    <footer className="border-t border-slate-200 bg-white/70">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <p className="font-semibold text-slate-900">Vibe Search</p>
          <p className="text-slate-500">Reverse image search with transparent credits.</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href={`${prefix}/terms`} className="hover:text-slate-900">Terms</Link>
          <Link href={`${prefix}/refunds`} className="hover:text-slate-900">Refunds</Link>
          <Link href={`${prefix}/privacy`} className="hover:text-slate-900">Privacy</Link>
          <Link href={`${prefix}/pricing`} className="hover:text-slate-900">Pricing</Link>
        </div>
      </div>
    </footer>
  );
};

import type { Metadata } from 'next';
import { UserProfile } from '@clerk/nextjs';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getI18nPath } from '@/utils/Helpers';

type IUserProfilePageProps = {
  params: Promise<{ locale: string }>;
};

const userProfileAppearance = {
  elements: {
    rootBox: 'w-full',
    card: 'w-full rounded-3xl border border-slate-200 bg-white shadow-none',
    navbar: 'border-b border-slate-200',
    pageScrollBox: 'px-0',
    page: 'px-0',
    headerTitle: 'text-2xl font-semibold text-[#1d1d1f]',
    headerSubtitle: 'text-sm text-[#6e6e73]',
    profileSectionPrimaryButton: 'rounded-xl bg-[#0071e3] hover:bg-[#0066cc]',
    profileSectionSecondaryButton: 'rounded-xl border border-slate-200 hover:bg-slate-50',
    formFieldInput: 'rounded-xl border border-slate-200 focus:border-[#0071e3] focus:ring-[#0071e3]',
    formButtonPrimary: 'rounded-xl bg-[#0071e3] hover:bg-[#0066cc]',
  },
};

export async function generateMetadata(props: IUserProfilePageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'UserProfile',
  });

  return {
    title: t('meta_title'),
  };
}

export default async function UserProfilePage(props: IUserProfilePageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <div className="ui-panel ui-panel-lg mx-auto my-8 w-full max-w-5xl bg-white/90 p-4 sm:p-6">
      <UserProfile
        path={getI18nPath('/dashboard/user-profile', locale)}
        appearance={userProfileAppearance}
      />
    </div>
  );
};

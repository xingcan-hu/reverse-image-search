import type { Metadata } from 'next';
import { Clock, CreditCard, Database, Eye, ImageIcon, Lock, Shield } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';

type PrivacyPageProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: 'Privacy Policy | Vibe Search',
  description: 'How Vibe Search handles uploaded images, personal data, and payment information.',
};

const sections = [
  {
    title: 'Data we collect',
    icon: Database,
    body: 'We store your Clerk user ID, email, credit balance, and transaction history. We also log search usage to prevent abuse.',
    color: 'indigo',
  },
  {
    title: 'Images & storage',
    icon: ImageIcon,
    body: 'Uploaded images are stored on Cloudflare R2 to generate public URLs for searching. You should avoid uploading sensitive content.',
    color: 'purple',
  },
  {
    title: 'Payments',
    icon: CreditCard,
    body: 'Payments are processed by Stripe. We do not store your payment details. Stripe shares transaction metadata so we can issue credits.',
    color: 'emerald',
  },
  {
    title: 'Retention',
    icon: Clock,
    body: 'Credits and transaction records are retained for accounting purposes. You may request deletion of your account data at any time.',
    color: 'amber',
  },
];

export default async function PrivacyPage(props: PrivacyPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const getColorClasses = (color: string) => {
    const colors = {
      indigo: 'from-indigo-100 to-indigo-50 text-indigo-600',
      purple: 'from-purple-100 to-purple-50 text-purple-600',
      emerald: 'from-emerald-100 to-emerald-50 text-emerald-600',
      amber: 'from-amber-100 to-amber-50 text-amber-600',
    };
    return colors[color as keyof typeof colors] || colors.indigo;
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-purple-50 to-indigo-50 p-6 shadow-lg sm:rounded-3xl sm:p-8">
        <div className="absolute top-0 left-0 h-64 w-64 -translate-x-32 -translate-y-32 rounded-full bg-gradient-to-br from-purple-200 to-indigo-200 opacity-30 blur-3xl" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg sm:h-16 sm:w-16 sm:rounded-2xl">
            <Eye className="h-6 w-6 text-white sm:h-8 sm:w-8" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold tracking-wider text-purple-600 uppercase">Your Data</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900 sm:text-4xl">Privacy Policy</h1>
            <p className="mt-2 text-base text-slate-600 sm:mt-3 sm:text-lg">
              We focus on transparency. Below is how we handle your data and uploaded files.
            </p>
          </div>
        </div>
      </div>

      {/* Key Promises */}
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm sm:gap-6 sm:rounded-3xl sm:p-8 md:grid-cols-3">
        <div className="flex flex-col items-center gap-2 text-center sm:gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 sm:h-14 sm:w-14 sm:rounded-2xl">
            <Lock className="h-6 w-6 text-emerald-600 sm:h-7 sm:w-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 sm:text-base">Secure Storage</p>
            <p className="mt-0.5 text-xs text-slate-600 sm:mt-1 sm:text-sm">All data encrypted and protected</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 text-center sm:gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 sm:h-14 sm:w-14 sm:rounded-2xl">
            <Shield className="h-6 w-6 text-indigo-600 sm:h-7 sm:w-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 sm:text-base">No Training</p>
            <p className="mt-0.5 text-xs text-slate-600 sm:mt-1 sm:text-sm">We never train AI on your images</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 text-center sm:gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 sm:h-14 sm:w-14 sm:rounded-2xl">
            <Eye className="h-6 w-6 text-purple-600 sm:h-7 sm:w-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 sm:text-base">Full Transparency</p>
            <p className="mt-0.5 text-xs text-slate-600 sm:mt-1 sm:text-sm">Clear data usage policies</p>
          </div>
        </div>
      </div>

      {/* Privacy Sections Grid */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.title}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md active:translate-y-0 sm:rounded-3xl sm:p-6"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br sm:h-12 sm:w-12 sm:rounded-xl ${getColorClasses(section.color)}`}>
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-slate-900 sm:text-xl">{section.title}</h2>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600 sm:mt-2 sm:text-sm">{section.body}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contact Section */}
      <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 shadow-sm sm:rounded-3xl sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 sm:h-12 sm:w-12 sm:rounded-xl">
            <Shield className="h-5 w-5 text-white sm:h-6 sm:w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 sm:text-xl">Questions about your data?</h3>
            <p className="mt-1.5 text-xs text-slate-600 sm:mt-2 sm:text-sm">
              If you have questions or want to request deletion of your account data, contact us at
              {' '}
              <a href="mailto:help@support.reverseimage.io" className="font-semibold text-indigo-600 hover:underline active:underline">
                help@support.reverseimage.io
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

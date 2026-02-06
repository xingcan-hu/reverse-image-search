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
      indigo: 'bg-sky-100 text-[var(--ui-accent)]',
      purple: 'bg-sky-100 text-[var(--ui-accent)]',
      emerald: 'bg-sky-100 text-[var(--ui-accent)]',
      amber: 'bg-sky-100 text-[var(--ui-accent)]',
    };
    return colors[color as keyof typeof colors] || colors.indigo;
  };

  return (
    <div className="ui-page">
      {/* Hero Section */}
      <div className="ui-panel-hero relative overflow-hidden bg-gradient-to-br from-white via-sky-50 to-[var(--ui-soft)] p-6 sm:p-8">
        <div className="absolute top-0 left-0 h-64 w-64 -translate-x-32 -translate-y-32 rounded-full bg-gradient-to-br from-sky-200 to-blue-200 opacity-30 blur-3xl" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <div className="ui-icon-box ui-icon-box-lg shrink-0 bg-[var(--ui-accent)] text-white shadow-lg">
            <Eye className="h-6 w-6 sm:h-8 sm:w-8" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold tracking-wider text-[var(--ui-accent)] uppercase">Your Data</p>
            <h1 className="mt-1 text-3xl font-bold text-[var(--ui-ink)] sm:text-4xl">
              Privacy
              {' '}
              <span className="ui-title-accent">Policy</span>
            </h1>
            <p className="mt-2 text-base text-[var(--ui-muted)] sm:mt-3 sm:text-lg">
              We focus on transparency. Below is how we handle your data and uploaded files.
            </p>
          </div>
        </div>
      </div>

      {/* Key Promises */}
      <div className="ui-panel-soft grid gap-4 p-6 sm:gap-6 sm:p-8 md:grid-cols-3">
        <div className="flex flex-col items-center gap-2 text-center sm:gap-3">
          <div className="ui-icon-box ui-icon-box-lg">
            <Lock className="h-6 w-6 text-[var(--ui-accent)] sm:h-7 sm:w-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--ui-ink)] sm:text-base">Secure Storage</p>
            <p className="mt-0.5 text-xs text-[var(--ui-muted)] sm:mt-1 sm:text-sm">All data encrypted and protected</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 text-center sm:gap-3">
          <div className="ui-icon-box ui-icon-box-lg">
            <Shield className="h-6 w-6 text-[var(--ui-accent)] sm:h-7 sm:w-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--ui-ink)] sm:text-base">No Training</p>
            <p className="mt-0.5 text-xs text-[var(--ui-muted)] sm:mt-1 sm:text-sm">We never train AI on your images</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 text-center sm:gap-3">
          <div className="ui-icon-box ui-icon-box-lg">
            <Eye className="h-6 w-6 text-[var(--ui-accent)] sm:h-7 sm:w-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--ui-ink)] sm:text-base">Full Transparency</p>
            <p className="mt-0.5 text-xs text-[var(--ui-muted)] sm:mt-1 sm:text-sm">Clear data usage policies</p>
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
              className="ui-panel group p-5 transition hover:-translate-y-1 hover:shadow-md active:translate-y-0 sm:p-6"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={`ui-icon-box ui-icon-box-sm shrink-0 ${getColorClasses(section.color)}`}>
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-[var(--ui-ink)] sm:text-xl">{section.title}</h2>
                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--ui-muted)] sm:mt-2 sm:text-sm">{section.body}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contact Section */}
      <div className="ui-panel-soft p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <div className="ui-icon-box ui-icon-box-sm shrink-0 bg-[var(--ui-accent)] text-white">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[var(--ui-ink)] sm:text-xl">Questions about your data?</h3>
            <p className="mt-1.5 text-xs text-[var(--ui-muted)] sm:mt-2 sm:text-sm">
              If you have questions or want to request deletion of your account data, contact us at
              {' '}
              <a href="mailto:help@support.reverseimage.io" className="font-semibold text-[var(--ui-accent)] hover:underline active:underline">
                help@support.reverseimage.io
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

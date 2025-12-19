import type { Metadata } from 'next';
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
    body: 'We store your Clerk user ID, email, credit balance, and transaction history. We also log search usage to prevent abuse.',
  },
  {
    title: 'Images & storage',
    body: 'Uploaded images are stored on Cloudflare R2 to generate public URLs for searching. You should avoid uploading sensitive content.',
  },
  {
    title: 'Payments',
    body: 'Payments are processed by Stripe. We do not store your payment details. Stripe shares transaction metadata so we can issue credits.',
  },
  {
    title: 'Retention',
    body: 'Credits and transaction records are retained for accounting purposes. You may request deletion of your account data at any time.',
  },
];

export default async function PrivacyPage(props: PrivacyPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase">Privacy</p>
        <h1 className="text-3xl font-semibold text-slate-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-600">
          We focus on transparency. Below is how we handle your data and uploaded files.
        </p>
      </div>
      <div className="space-y-3">
        {sections.map(section => (
          <div key={section.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

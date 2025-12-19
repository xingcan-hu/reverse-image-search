import type { Metadata } from 'next';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { ArrowRight, Check, Shield, Sparkles, UploadCloud } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { routing } from '@/libs/I18nRouting';

type IIndexProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Reverse image search with pay-per-use credits | Vibe Search',
    description:
      'Upload an image, find visually similar results, and only pay when you search. Free credits on sign-up, transparent one-time pricing, and instant answers.',
  };
}

const features = [
  {
    title: 'Upload anything',
    description: 'Drag & drop JPG, PNG, or WEBP (5MB). We host on secure R2 storage.',
    icon: <UploadCloud className="h-5 w-5 text-indigo-600" />,
  },
  {
    title: 'Credits-first',
    description: 'We check your balance and deduct 1 credit per search. Failures are auto-refunded.',
    icon: <Shield className="h-5 w-5 text-indigo-600" />,
  },
  {
    title: 'One-time payments',
    description: '$5 for 500 credits or $10 for 1200 credits. Lifetime access, no subscriptions.',
    icon: <Sparkles className="h-5 w-5 text-indigo-600" />,
  },
];

const faqs = [
  {
    q: 'How many free credits do I get?',
    a: 'New accounts start with 3 free credits so you can test the quality before paying.',
  },
  {
    q: 'Do credits expire?',
    a: 'No. Credits never expire, making budgeting simple for teams and solo builders.',
  },
  {
    q: 'What happens if a search fails?',
    a: 'We automatically refund the credit and surface an error message so you can retry.',
  },
  {
    q: 'Is this a subscription?',
    a: 'No. Pricing is one-time. Buy credits when you need them and keep full control.',
  },
];

export default async function Index(props: IIndexProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;

  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white px-6 py-12 shadow-sm sm:px-10 md:px-14">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-amber-50" />
        <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <p className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase">
              Reverse Image Search
            </p>
            <h1 className="text-4xl leading-tight font-semibold text-slate-900 md:text-5xl">
              Upload an image. Find where it lives.
            </h1>
            <p className="text-lg text-slate-600">
              Vibe Search runs a credit-first workflow: we verify your balance, launch the search, and only charge when the request succeeds. Every failed attempt is automatically refunded.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <SignedOut>
                <Link
                  href={`${prefix}/sign-up`}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
                >
                  Claim 3 free credits
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={`${prefix}/pricing`}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >
                  View pricing
                </Link>
              </SignedOut>
              <SignedIn>
                <Link
                  href={`${prefix}/search`}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
                >
                  Start searching
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={`${prefix}/account`}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >
                  View balance
                </Link>
              </SignedIn>
            </div>
            <div className="flex flex-wrap gap-4 text-sm font-semibold text-slate-600">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                <Check className="h-4 w-4 text-emerald-500" />
                1 credit per search
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                <Check className="h-4 w-4 text-emerald-500" />
                Instant refunds on failure
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                <Check className="h-4 w-4 text-emerald-500" />
                R2 secure storage
              </span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-6 -left-10 h-28 w-28 rounded-full bg-indigo-100 blur-3xl" />
            <div className="absolute -right-10 -bottom-8 h-28 w-28 rounded-full bg-amber-100 blur-3xl" />
            <div className="relative rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-lg backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Preview</p>
                  <p className="text-lg font-semibold text-slate-900">Visual matches</p>
                </div>
                <div className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">
                  1 credit
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map(item => (
                  <div
                    key={item}
                    className="aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-sm"
                  >
                    <div className="flex h-full items-center justify-center text-slate-400">
                      Result
                      {' '}
                      {item}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-inner">
                Drag & drop an image to begin · Charges after success only
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {features.map(feature => (
          <div
            key={feature.title}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50">
              {feature.icon}
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
            <p className="text-sm text-slate-600">{feature.description}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">How it works</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Three steps to find every match</h2>
          <ol className="mt-4 space-y-3 text-slate-700">
            <li className="flex gap-3 rounded-xl bg-slate-50 p-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">1</span>
              <div>
                <p className="font-semibold">Upload your image</p>
                <p className="text-sm text-slate-600">Drop JPG/PNG/WEBP up to 5MB. We host on Cloudflare R2 for instant availability.</p>
              </div>
            </li>
            <li className="flex gap-3 rounded-xl bg-slate-50 p-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">2</span>
              <div>
                <p className="font-semibold">We check your credits</p>
                <p className="text-sm text-slate-600">Balance ≥ 1 is required. Otherwise we guide you to pricing without charging anything.</p>
              </div>
            </li>
            <li className="flex gap-3 rounded-xl bg-slate-50 p-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">3</span>
              <div>
                <p className="font-semibold">Results in seconds</p>
                <p className="text-sm text-slate-600">We call the search engine, return visual matches, and deduct exactly 1 credit. Failures trigger an automatic refund.</p>
              </div>
            </li>
          </ol>
        </div>
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Pricing</p>
              <h3 className="text-xl font-semibold text-slate-900">Lifetime credits</h3>
            </div>
            <Link
              href={`${prefix}/pricing`}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              See details
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Starter</p>
              <p className="text-3xl font-bold text-slate-900">$5</p>
              <p className="text-sm text-slate-600">500 credits · Never expires</p>
            </div>
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Pro · Best value</p>
              <p className="text-3xl font-bold text-slate-900">$10</p>
              <p className="text-sm text-slate-700">1200 credits · One-time</p>
            </div>
          </div>
          <div className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white">
            SEO FAQ · Credits · Refunds · No subscription · Points never expire
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          {faqs.map(item => (
            <div key={item.q} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <p className="text-base font-semibold text-slate-900">{item.q}</p>
              <p className="mt-2 text-sm text-slate-600">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

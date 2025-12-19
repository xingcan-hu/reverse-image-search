import type { Metadata } from 'next';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { ArrowRight, Check, Globe, Search, Shield, Sparkles } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { routing } from '@/libs/I18nRouting';
import { SearchClient } from './search/SearchClient';

type IIndexProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Reverse Image Search - Search by Image to Find Similar Photos',
    description:
      'Use our fast reverse image search tool to find similar images, identify sources, and explore high-resolution versions. Support upload, URL, and drag-and-drop. Try ReverseImage.io for free.',
    keywords: [
      'reverse image search',
      'search by image',
      'find similar images',
      'photo lookup',
      'image source finder',
      'reverse photo search',
    ],
  };
}

const features = [
  {
    title: 'Search Across 50+ Sources',
    description: 'Search Getty Images, Shutterstock, Unsplash, Pexels, and dozens more stock sites simultaneously.',
    icon: <Globe className="h-5 w-5 text-indigo-600" />,
  },
  {
    title: 'Find Higher Resolution',
    description: 'Discover larger, higher quality versions of images and alternative crops of the same subject.',
    icon: <Search className="h-5 w-5 text-indigo-600" />,
  },
  {
    title: 'Instant Source Identification',
    description: 'Get thumbnails, titles, and direct links to verify where an image appears online.',
    icon: <Sparkles className="h-5 w-5 text-indigo-600" />,
  },
  {
    title: 'Simple Pay-Per-Use',
    description: 'No subscriptions. Credits never expire. Failed searches are automatically refunded.',
    icon: <Shield className="h-5 w-5 text-indigo-600" />,
  },
];

const faqs = [
  {
    q: 'How do I do a reverse image search on my phone?',
    a: 'Open ReverseImage.io on your mobile browser, tap upload, choose a photo from your gallery, and start the search. It works on both iOS and Android.',
  },
  {
    q: 'Is this image search tool free?',
    a: 'Yes. New users get 3 free search credits upon registration. You can buy additional credit packs for higher-volume searching.',
  },
  {
    q: 'Can I find the original source of an image?',
    a: 'You can discover pages where the image appears and follow links to the sources to help identify where it was published.',
  },
];

export default async function Index(props: IIndexProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(item => ({
      '@type': 'Question',
      'name': item.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': item.a,
      },
    })),
  };

  return (
    <div className="space-y-16">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Search Tool - Main Entry Point */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <SearchClient />
      </section>

      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white px-6 py-12 shadow-sm sm:px-10 md:px-14">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-amber-50" />
        <div className="relative max-w-3xl">
          <div className="space-y-6">
            <p className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase">
              ReverseImage.io
            </p>
            <h1 className="text-4xl leading-tight font-semibold text-slate-900 md:text-5xl">
              Reverse Image Search
            </h1>
            <p className="text-lg text-slate-600">
              Search across 50+ stock sites. Find higher resolution versions. Identify sources instantly.
            </p>
            <SignedOut>
              <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 px-5 py-4">
                <p className="text-base font-semibold text-slate-900">
                  <Sparkles className="mb-1 inline h-5 w-5 text-indigo-600" />
                  {' '}
                  Get 3 Free Searches - No Credit Card Required
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  Try our reverse image search for free. Find similar images, track sources, and discover higher resolution versions across the web.
                </p>
              </div>
            </SignedOut>
            <p className="text-sm leading-relaxed text-slate-600">
              Upload a photo, drag-and-drop a file, or paste a public image URL. We search the web for visually similar matches, surface thumbnails and source links, and help you track where images appear online.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <SignedOut>
                <Link
                  href={`${prefix}/sign-up`}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
                >
                  Try free (3 credits)
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
                  href={`${prefix}/account`}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >
                  View balance
                </Link>
              </SignedIn>
            </div>
            <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-600">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                <Check className="h-4 w-4 text-emerald-500" />
                50+ Stock Sites
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                <Check className="h-4 w-4 text-emerald-500" />
                Higher Resolution
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                <Check className="h-4 w-4 text-emerald-500" />
                Instant Results
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                <Check className="h-4 w-4 text-emerald-500" />
                Mobile & Desktop
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Why</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Why use reverse image search?</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Reverse image search helps you quickly discover where a photo appears online, find visually similar images, and validate sources. It is useful for verifying authenticity, tracking reuse, and locating higher-resolution versions.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">How</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">How to search by image on desktop and mobile</h2>
          <div className="mt-4 grid gap-3 text-sm text-slate-700">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Desktop</p>
              <p className="mt-1 text-slate-600">
                Drag and drop an image, upload a file, or paste a direct image URL, then run the search to see matches.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Mobile</p>
              <p className="mt-1 text-slate-600">
                Open ReverseImage.io in your browser, tap upload, pick a photo from your gallery, and search. Works on iOS and Android.
              </p>
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
          <p className="text-xs font-semibold text-slate-500 uppercase">Key features</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Key features of ReverseImage.io</h2>
          <ol className="mt-4 space-y-3 text-slate-700">
            <li className="flex gap-3 rounded-xl bg-slate-50 p-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">1</span>
              <div>
                <p className="font-semibold">Upload with ease</p>
                <p className="text-sm text-slate-600">Drag and drop, upload a file, or use a public image URL to start searching.</p>
              </div>
            </li>
            <li className="flex gap-3 rounded-xl bg-slate-50 p-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">2</span>
              <div>
                <p className="font-semibold">Fast results with clear links</p>
                <p className="text-sm text-slate-600">We return thumbnails, titles, and source links so you can quickly verify matches.</p>
              </div>
            </li>
            <li className="flex gap-3 rounded-xl bg-slate-50 p-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">3</span>
              <div>
                <p className="font-semibold">Simple credits, no subscriptions</p>
                <p className="text-sm text-slate-600">Each successful search costs 1 credit. Failed searches are auto-refunded. Credits never expire.</p>
              </div>
            </li>
          </ol>
        </div>
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Use cases</p>
              <h3 className="text-xl font-semibold text-slate-900">Common use cases for photo lookup</h3>
            </div>
          </div>
          <div className="grid gap-3 text-sm text-slate-700">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Find the original source</p>
              <p className="mt-1 text-slate-600">Locate pages where an image appears and follow source links.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Check copyright and reuse</p>
              <p className="mt-1 text-slate-600">Spot reposts, duplicates, and potential infringement quickly.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Identify products or people</p>
              <p className="mt-1 text-slate-600">Find similar images, listings, and context around a visual match.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Find a higher-resolution version</p>
              <p className="mt-1 text-slate-600">Discover larger images and alternative crops for the same subject.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`${prefix}/pricing`}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              View pricing
              <ArrowRight className="h-4 w-4" />
            </Link>
            <SignedOut>
              <Link
                href={`${prefix}/sign-up`}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </SignedOut>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50">
              <Shield className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Secure and private image lookup</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                We process uploads via secure Cloudflare R2 storage to generate a public URL for searching. We do not train models on your uploads or index your private photos.
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50">
              <Globe className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Google-powered visual search</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Our reverse photo search uses Google reverse image results (via SerpApi) to provide broad coverage across the web—helping you identify sources, find similar images, and track reuse.
              </p>
            </div>
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

      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-16 text-center shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.1),transparent_50%)]" />
        <div className="relative mx-auto max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            Trusted by thousands of users
          </div>
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Ready to Find Your Images?
          </h2>
          <p className="mt-4 text-lg text-slate-300">
            Join thousands of photographers, designers, and content creators using ReverseImage.io to track image usage and find higher quality versions.
          </p>
          <SignedOut>
            <Link
              href={`${prefix}/sign-up`}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-slate-900 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
            >
              Get Started with 3 Free Credits
              <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="mt-4 text-sm text-slate-400">
              No credit card required · Start searching in seconds
            </p>
          </SignedOut>
          <SignedIn>
            <Link
              href={`${prefix}/search`}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-slate-900 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
            >
              Start Searching Now
              <ArrowRight className="h-5 w-5" />
            </Link>
          </SignedIn>
        </div>
      </section>
    </div>
  );
}

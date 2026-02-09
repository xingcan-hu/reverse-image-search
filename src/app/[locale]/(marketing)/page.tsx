import type { Metadata } from 'next';
import { ArrowRight, Check, Globe, ImageUp, Search, Shield, Sparkles } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import Link from '@/components/AppLink';
import { routing } from '@/libs/I18nRouting';
import { HomeAuthLoadingOnly, HomeBottomCta, HomeHeroCtas, HomeSignedInOnly, HomeSignedOutBanner, HomeSignedOutOnly, HomeUseCasesSignedOutCta } from './HomeAuth';
import { SearchClient } from './search/SearchClient';

type IIndexProps = {
  params: Promise<{ locale: string }>;
};

export const dynamic = 'force-static';

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
    icon: Globe,
  },
  {
    title: 'Find Higher Resolution',
    description: 'Discover larger, higher quality versions of images and alternative crops of the same subject.',
    icon: Search,
  },
  {
    title: 'Instant Source Identification',
    description: 'Get thumbnails, titles, and direct links to verify where an image appears online.',
    icon: Sparkles,
  },
  {
    title: 'Simple Pay-Per-Use',
    description: 'No subscriptions. Credits never expire. Failed searches are automatically refunded.',
    icon: Shield,
  },
];

const heroHighlights = [
  '50+ Stock Sites',
  'Higher Resolution',
  'Direct Source Links',
  'Desktop & Mobile',
];

const heroFlow = [
  {
    title: 'Upload or paste',
    description: 'Drop a photo, select a file, or use a public URL.',
    icon: ImageUp,
  },
  {
    title: 'Search visually',
    description: 'We compare it against broad web and stock coverage.',
    icon: Search,
  },
  {
    title: 'Open source links',
    description: 'Review matches, pages, and higher-quality variants.',
    icon: ArrowRight,
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

  const searchToolSection = (
    <section className="home-fade-up home-search-tool w-full min-w-0 overflow-hidden rounded-[2.2rem] bg-white/82 p-4 shadow-[0_24px_52px_-42px_rgba(15,23,42,0.6)] backdrop-blur-sm sm:p-8">
      <div className="mb-4 flex min-w-0 flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-[var(--home-accent)] uppercase">Search Tool</p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--home-ink)] sm:text-4xl">
            Search by image
            {' '}
            <span className="home-title-accent">in seconds</span>
          </h2>
        </div>
        <p className="max-w-full px-1 text-xs font-medium text-slate-500 sm:w-fit sm:text-sm">
          Upload file, drag-and-drop, or image URL
        </p>
      </div>
      <SearchClient />
    </section>
  );

  const authLoadingFallback = (
    <div className="home-auth-loading space-y-6 pb-8 font-[var(--home-font)] sm:space-y-8 sm:pb-12">
      <section className="home-search-tool overflow-hidden rounded-[2.2rem] bg-white/82 p-4 shadow-[0_24px_52px_-42px_rgba(15,23,42,0.6)] sm:p-8">
        <div className="animate-pulse space-y-6">
          <div className="space-y-3">
            <div className="h-3 w-24 rounded-full bg-slate-200" />
            <div className="h-8 w-3/5 rounded-lg bg-slate-200 sm:h-10" />
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-4 rounded-3xl bg-white p-5">
              <div className="h-4 w-28 rounded-full bg-slate-200" />
              <div className="h-60 rounded-2xl bg-slate-100 sm:h-72" />
              <div className="h-10 w-full rounded-xl bg-slate-100" />
            </div>
            <div className="space-y-4 rounded-3xl bg-white p-5">
              <div className="h-4 w-32 rounded-full bg-slate-200" />
              <div className="h-20 rounded-xl bg-slate-100" />
              <div className="h-20 rounded-xl bg-slate-100" />
              <div className="h-20 rounded-xl bg-slate-100" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <HomeAuthLoadingOnly>
        {authLoadingFallback}
      </HomeAuthLoadingOnly>

      <HomeSignedInOnly>
        <div className="home-auth-signed-in space-y-6 pb-8 font-[var(--home-font)] sm:space-y-8 sm:pb-12">
          {searchToolSection}
        </div>
      </HomeSignedInOnly>

      <HomeSignedOutOnly>
        <div className="home-shell space-y-14 pb-10 font-[var(--home-font)] sm:space-y-20 sm:pb-12">
          <section className="home-fade-up relative overflow-hidden rounded-[2.5rem] border border-[var(--home-line)] bg-[var(--home-paper)] px-5 py-9 shadow-[0_35px_90px_-55px_rgba(29,29,31,0.55)] sm:px-10 sm:py-12 lg:px-14 lg:py-16">
            <div className="home-orb pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(0,113,227,0.22)_0%,rgba(0,113,227,0)_72%)]" />
            <div className="pointer-events-none absolute -bottom-20 -left-12 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(42,169,255,0.14)_0%,rgba(42,169,255,0)_68%)]" />
            <div className="relative grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end lg:gap-10">
              <div className="space-y-5 sm:space-y-6">
                <p className="inline-flex rounded-full border border-[var(--home-line)] bg-white/75 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-[var(--home-accent)] uppercase backdrop-blur">
                  ReverseImage.io
                </p>
                <h1 className="max-w-3xl text-3xl leading-tight font-semibold text-[var(--home-ink)] sm:text-5xl lg:text-6xl">
                  Reverse
                  {' '}
                  <span className="home-title-accent">Image Search</span>
                </h1>
                <p className="max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                  Search across 50+ stock sites. Find higher resolution versions. Identify sources instantly.
                </p>
                <HomeSignedOutBanner />
                <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                  Upload a photo, drag-and-drop a file, or paste a public image URL. We search the web for visually similar matches, surface thumbnails and source links, and help you track where images appear online.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <HomeHeroCtas prefix={prefix} />
                </div>
                <div className="grid max-w-2xl gap-3 text-sm sm:grid-cols-2">
                  {heroHighlights.map(highlight => (
                    <p
                      key={highlight}
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--home-line)] bg-white px-4 py-2 font-semibold text-slate-700 shadow-[0_12px_25px_-20px_rgba(15,23,42,0.7)]"
                    >
                      <Check className="h-4 w-4 text-[var(--home-accent)]" />
                      {highlight}
                    </p>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-[var(--home-line)] bg-white/85 p-5 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.65)] backdrop-blur sm:p-6">
                <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">How It Works</p>
                <h2 className="mt-3 text-xl font-semibold text-slate-900 sm:text-2xl">Search flow in under a minute</h2>
                <ol className="mt-4 space-y-3 sm:mt-5 sm:space-y-4">
                  {heroFlow.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.title} className="flex gap-3 rounded-2xl border border-slate-200/85 bg-slate-50/80 p-3.5 sm:gap-4 sm:p-4">
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-[var(--home-accent)] shadow-sm">
                          {index + 1}
                        </span>
                        <div className="space-y-1">
                          <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                            <Icon className="h-4 w-4 text-[var(--home-accent)]" />
                            {item.title}
                          </p>
                          <p className="text-sm text-slate-600">{item.description}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
                <Link
                  href={`${prefix}/pricing`}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-800 transition hover:text-slate-950"
                >
                  View pricing
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>

          {searchToolSection}

          <section className="grid gap-4 md:grid-cols-2 md:gap-5">
            <div className="home-fade-up rounded-3xl border border-[var(--home-line)] bg-white p-5 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.7)] sm:p-7">
              <p className="text-xs font-semibold tracking-[0.16em] text-[var(--home-accent)] uppercase">Why</p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--home-ink)] sm:mt-3 sm:text-2xl">
                Why use
                {' '}
                <span className="home-title-accent">reverse image search</span>
                ?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:mt-4">
                Reverse image search helps you quickly discover where a photo appears online, find visually similar images, and validate sources. It is useful for verifying authenticity, tracking reuse, and locating higher-resolution versions.
              </p>
            </div>
            <div className="home-fade-up rounded-3xl border border-[var(--home-line)] bg-white p-5 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.7)] sm:p-7">
              <p className="text-xs font-semibold tracking-[0.16em] text-[var(--home-accent)] uppercase">How</p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--home-ink)] sm:mt-3 sm:text-2xl">
                How to
                {' '}
                <span className="home-title-accent">search by image</span>
                {' '}
                on desktop and mobile
              </h2>
              <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:mt-5">
                <div className="rounded-2xl border border-slate-200/80 bg-[var(--home-paper)] p-4">
                  <p className="font-semibold text-slate-900">Desktop</p>
                  <p className="mt-1 text-slate-600">
                    Drag and drop an image, upload a file, or paste a direct image URL, then run the search to see matches.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-[var(--home-paper)] p-4">
                  <p className="font-semibold text-slate-900">Mobile</p>
                  <p className="mt-1 text-slate-600">
                    Open ReverseImage.io in your browser, tap upload, pick a photo from your gallery, and search. Works on iOS and Android.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="home-fade-up flex flex-col gap-4 rounded-2xl border border-[var(--home-line)] bg-white p-5 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.75)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_35px_-22px_rgba(15,23,42,0.7)] sm:p-6"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--home-paper)]">
                    <Icon className="h-5 w-5 text-[var(--home-accent)]" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </div>
              );
            })}
          </section>

          <section className="grid gap-5 md:grid-cols-[1.1fr_1fr]">
            <div className="home-fade-up rounded-3xl border border-[var(--home-line)] bg-white p-5 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.72)] sm:p-7">
              <p className="text-xs font-semibold tracking-[0.16em] text-[var(--home-accent)] uppercase">Key Features</p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--home-ink)] sm:mt-3 sm:text-2xl">
                Key features of
                {' '}
                <span className="home-title-accent">ReverseImage.io</span>
              </h2>
              <ol className="mt-4 space-y-3 text-slate-700 sm:mt-5">
                <li className="flex gap-3 rounded-2xl border border-slate-200/85 bg-[var(--home-paper)] p-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-[var(--home-accent)] shadow-sm">1</span>
                  <div>
                    <p className="font-semibold text-slate-900">Upload with ease</p>
                    <p className="text-sm text-slate-600">Drag and drop, upload a file, or use a public image URL to start searching.</p>
                  </div>
                </li>
                <li className="flex gap-3 rounded-2xl border border-slate-200/85 bg-[var(--home-paper)] p-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-[var(--home-accent)] shadow-sm">2</span>
                  <div>
                    <p className="font-semibold text-slate-900">Fast results with clear links</p>
                    <p className="text-sm text-slate-600">We return thumbnails, titles, and source links so you can quickly verify matches.</p>
                  </div>
                </li>
                <li className="flex gap-3 rounded-2xl border border-slate-200/85 bg-[var(--home-paper)] p-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-[var(--home-accent)] shadow-sm">3</span>
                  <div>
                    <p className="font-semibold text-slate-900">Simple credits, no subscriptions</p>
                    <p className="text-sm text-slate-600">Each successful search costs 1 credit. Failed searches are auto-refunded. Credits never expire.</p>
                  </div>
                </li>
              </ol>
            </div>

            <div className="home-fade-up space-y-4 rounded-3xl border border-[var(--home-line)] bg-white p-5 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.72)] sm:p-7">
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-[var(--home-accent)] uppercase">Use Cases</p>
                <h3 className="mt-2 text-xl font-semibold text-[var(--home-ink)] sm:text-2xl">
                  Common use cases for
                  {' '}
                  <span className="home-title-accent">photo lookup</span>
                </h3>
              </div>
              <div className="grid gap-3 text-sm text-slate-700">
                <div className="rounded-2xl border border-slate-200/85 bg-[var(--home-paper)] p-4">
                  <p className="font-semibold text-slate-900">Find the original source</p>
                  <p className="mt-1 text-slate-600">Locate pages where an image appears and follow source links.</p>
                </div>
                <div className="rounded-2xl border border-slate-200/85 bg-[var(--home-paper)] p-4">
                  <p className="font-semibold text-slate-900">Check copyright and reuse</p>
                  <p className="mt-1 text-slate-600">Spot reposts, duplicates, and potential infringement quickly.</p>
                </div>
                <div className="rounded-2xl border border-slate-200/85 bg-[var(--home-paper)] p-4">
                  <p className="font-semibold text-slate-900">Identify products or people</p>
                  <p className="mt-1 text-slate-600">Find similar images, listings, and context around a visual match.</p>
                </div>
                <div className="rounded-2xl border border-slate-200/85 bg-[var(--home-paper)] p-4">
                  <p className="font-semibold text-slate-900">Find a higher-resolution version</p>
                  <p className="mt-1 text-slate-600">Discover larger images and alternative crops for the same subject.</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href={`${prefix}/pricing`}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >
                  View pricing
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <HomeUseCasesSignedOutCta prefix={prefix} />
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 md:gap-5">
            <div className="home-fade-up rounded-3xl border border-[var(--home-line)] bg-white p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.7)] sm:p-7">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--home-paper)]">
                  <Shield className="h-5 w-5 text-[var(--home-accent)]" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[var(--home-ink)] sm:text-2xl">
                    Secure and private
                    {' '}
                    <span className="home-title-accent">image lookup</span>
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    We process uploads via secure Cloudflare R2 storage to generate a public URL for searching. We do not train models on your uploads or index your private photos.
                  </p>
                </div>
              </div>
            </div>

            <div className="home-fade-up rounded-3xl border border-[var(--home-line)] bg-white p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.7)] sm:p-7">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--home-paper)]">
                  <Globe className="h-5 w-5 text-[var(--home-accent)]" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[var(--home-ink)] sm:text-2xl">
                    Google-powered
                    {' '}
                    <span className="home-title-accent">visual search</span>
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Our reverse photo search uses Google reverse image results (via SerpApi) to provide broad coverage across the web, helping you identify sources, find similar images, and track reuse.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="home-fade-up rounded-3xl border border-[var(--home-line)] bg-white p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.7)] sm:p-7">
            <div className="mb-4 flex items-end justify-between gap-4 sm:mb-6">
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-[var(--home-accent)] uppercase">FAQ</p>
                <h2 className="mt-2 text-xl font-semibold text-[var(--home-ink)] sm:text-2xl">
                  Questions people ask before
                  {' '}
                  <span className="home-title-accent">searching</span>
                </h2>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {faqs.map(item => (
                <div key={item.q} className="rounded-2xl border border-slate-200/85 bg-[var(--home-paper)] p-5">
                  <p className="text-base font-semibold text-slate-900">{item.q}</p>
                  <p className="mt-2 text-sm text-slate-600">{item.a}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="home-fade-up relative overflow-hidden rounded-[2.4rem] border border-slate-700/30 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-5 py-12 text-center shadow-[0_35px_70px_-40px_rgba(15,23,42,0.9)] sm:px-6 sm:py-16">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_45%,rgba(56,189,248,0.12),transparent_45%)]" />
            <div className="relative mx-auto max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
                Trusted by thousands of users
              </div>
              <h2 className="text-2xl font-semibold text-white sm:text-3xl md:text-4xl">
                Ready to
                {' '}
                <span className="home-title-accent-inverse">Find Your Images</span>
                ?
              </h2>
              <p className="mt-3 text-base text-slate-300 sm:mt-4 sm:text-lg">
                Join thousands of photographers, designers, and content creators using ReverseImage.io to track image usage and find higher quality versions.
              </p>
              <HomeBottomCta prefix={prefix} />
            </div>
          </section>
        </div>
      </HomeSignedOutOnly>
    </>
  );
}

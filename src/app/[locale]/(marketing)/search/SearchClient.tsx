'use client';

import type { FileRejection } from 'react-dropzone';
import type { ImageSearchResult } from '@/libs/SearchProvider';
import { useAuth } from '@clerk/nextjs';
import { ArrowRight, Globe, ImageIcon, Loader2, Search, ShieldCheck, Sparkles, UploadCloud, Zap } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { useCredits } from '@/components/credits/CreditsProvider';
import { LowBalanceDialog } from '@/components/search/LowBalanceDialog';
import { routing } from '@/libs/I18nRouting';
import { cn } from '@/utils/Cn';

type SearchState = 'idle' | 'searching' | 'success' | 'error';

// Demo examples for non-authenticated users
const DEMO_EXAMPLES = [
  {
    id: 'demo-1',
    title: 'Mountain Landscape',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    description: 'Search across 50+ sources',
  },
  {
    id: 'demo-2',
    title: 'City Architecture',
    thumbnail: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400',
    description: 'Find higher resolution',
  },
  {
    id: 'demo-3',
    title: 'Nature Photography',
    thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
    description: 'Identify sources instantly',
  },
];

const DEMO_RESULTS: ImageSearchResult[] = [
  {
    id: 'result-1',
    title: 'Similar Image on Getty Images - High Resolution Available',
    link: 'https://www.gettyimages.com',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
    source: 'Getty Images',
  },
  {
    id: 'result-2',
    title: 'Mountain Photography Collection - Stock Photo',
    link: 'https://www.shutterstock.com',
    thumbnail: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=300',
    source: 'Shutterstock',
  },
  {
    id: 'result-3',
    title: 'Landscape Photography Portfolio',
    link: 'https://unsplash.com',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
    source: 'Unsplash',
  },
  {
    id: 'result-4',
    title: 'Nature Wallpaper 4K - Free Download',
    link: 'https://www.pexels.com',
    thumbnail: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300',
    source: 'Pexels',
  },
];

export const SearchClient = () => {
  const [status, setStatus] = useState<SearchState>('idle');
  const [results, setResults] = useState<ImageSearchResult[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lowBalanceOpen, setLowBalanceOpen] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const apiPrefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  const { credits, setCredits, refreshCredits } = useCredits();

  const checkAuthAndRedirect = useCallback(() => {
    if (!isSignedIn) {
      const signInUrl = `${apiPrefix}/sign-in`;
      toast.info('Please sign in', { description: 'Sign in to start searching by image.' });
      router.push(signInUrl);
      return false;
    }
    return true;
  }, [isSignedIn, apiPrefix, router]);

  const handleSearch = useCallback(async (file: File) => {
    if (!checkAuthAndRedirect()) {
      return;
    }

    setStatus('searching');
    setErrorMessage(null);
    setResults([]);
    setImageUrlInput('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${apiPrefix}/api/search`, {
        method: 'POST',
        body: formData,
      });

      if (response.status === 401) {
        toast.info('Please sign in', { description: 'Sign in to start searching by image.' });
        const signInUrl = `${apiPrefix}/sign-in`;
        router.push(signInUrl);
        setStatus('idle');
        return;
      }

      if (response.status === 402) {
        setLowBalanceOpen(true);
        setStatus('idle');
        return;
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const message = error.error ?? 'Search failed. Please retry.';
        setStatus('error');
        setErrorMessage(message);
        toast.error('Search failed', { description: message });
        await refreshCredits();
        return;
      }

      const payload = await response.json();
      setResults(payload.data ?? []);
      setStatus('success');
      setErrorMessage(null);

      if (typeof payload.meta?.remainingCredits === 'number') {
        setCredits(payload.meta.remainingCredits);
      } else {
        await refreshCredits();
      }

      toast.success('Search complete', { description: 'Showing similar images below.' });
    } catch {
      setStatus('error');
      setErrorMessage('Search failed. Please retry.');
      toast.error('Search failed', { description: 'Please upload again.' });
      await refreshCredits();
    }
  }, [apiPrefix, refreshCredits, setCredits, checkAuthAndRedirect, router]);

  const handleSearchUrl = useCallback(async () => {
    if (!checkAuthAndRedirect()) {
      return;
    }

    const raw = imageUrlInput.trim();

    if (!raw) {
      toast.error('Missing image URL', { description: 'Paste a public image URL and try again.' });
      return;
    }

    try {
      const parsed = new URL(raw);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        toast.error('Invalid URL', { description: 'Please use an http(s) image URL.' });
        return;
      }
    } catch {
      toast.error('Invalid URL', { description: 'Please enter a valid image URL.' });
      return;
    }

    setStatus('searching');
    setErrorMessage(null);
    setResults([]);
    setPreviewUrl(raw);

    try {
      const response = await fetch(`${apiPrefix}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: raw }),
      });

      if (response.status === 401) {
        toast.info('Please sign in', { description: 'Sign in to start searching by image.' });
        const signInUrl = `${apiPrefix}/sign-in`;
        router.push(signInUrl);
        setStatus('idle');
        return;
      }

      if (response.status === 402) {
        setLowBalanceOpen(true);
        setStatus('idle');
        return;
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const message = error.error ?? 'Search failed. Please retry.';
        setStatus('error');
        setErrorMessage(message);
        toast.error('Search failed', { description: message });
        await refreshCredits();
        return;
      }

      const payload = await response.json();
      setResults(payload.data ?? []);
      setStatus('success');
      setErrorMessage(null);

      if (typeof payload.meta?.remainingCredits === 'number') {
        setCredits(payload.meta.remainingCredits);
      } else {
        await refreshCredits();
      }

      toast.success('Search complete', { description: 'Showing similar images below.' });
    } catch {
      setStatus('error');
      setErrorMessage('Search failed. Please retry.');
      toast.error('Search failed', { description: 'Please try again.' });
      await refreshCredits();
    }
  }, [apiPrefix, imageUrlInput, refreshCredits, setCredits, checkAuthAndRedirect, router]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!isSignedIn) {
        toast.info('Please sign in', { description: 'Sign in to start searching by image and get 3 free credits.' });
        const signInUrl = `${apiPrefix}/sign-in`;
        router.push(signInUrl);
        return;
      }

      const file = acceptedFiles.at(0);
      if (!file) {
        return;
      }
      setPreviewUrl(URL.createObjectURL(file));
      void handleSearch(file);
    },
    [isSignedIn, apiPrefix, router, handleSearch],
  );

  const onDropRejected = useCallback((rejections: FileRejection[]) => {
    if (!Array.isArray(rejections) || rejections.length === 0) {
      return;
    }
    setStatus('idle');
    toast.error('Upload rejected', {
      description: 'Use JPG, PNG, or WEBP up to 5MB.',
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    multiple: false,
    maxSize: 5 * 1024 * 1024,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    noClick: !isSignedIn,
  });

  const isSearching = status === 'searching';

  const statusLabel = useMemo(() => {
    if (isSearching) {
      return 'Searching for visual matches...';
    }
    if (status === 'success') {
      return 'Results ready';
    }
    if (status === 'error') {
      return 'There was an error';
    }
    return 'Drop an image to begin';
  }, [isSearching, status]);

  const handleDemoClick = useCallback((example: typeof DEMO_EXAMPLES[0]) => {
    setPreviewUrl(example.thumbnail);
    setStatus('searching');
    setResults([]);

    // Simulate search delay
    setTimeout(() => {
      setResults(DEMO_RESULTS);
      setStatus('success');
      toast.success('Demo search complete', {
        description: 'Sign up to search your own images and get 3 free credits!',
      });
    }, 1500);
  }, []);

  // For non-authenticated users, show centered hero layout
  if (!isSignedIn) {
    return (
      <>
        <LowBalanceDialog open={lowBalanceOpen} onClose={() => setLowBalanceOpen(false)} />
        <div className="space-y-8">
          {/* Hero CTA */}
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-lg">
              <Sparkles className="h-4 w-4" />
              Get 3 Free Searches · No Credit Card Required
            </div>
            <h2 className="mt-6 text-4xl font-bold text-slate-900 md:text-5xl">
              Find Similar Images Instantly
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Search across 50+ stock sites. Find higher resolution versions. Identify sources in seconds.
            </p>
            <button
              type="button"
              onClick={() => {
                const signUpUrl = `${apiPrefix}/sign-up`;
                router.push(signUpUrl);
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:-translate-y-1 hover:bg-slate-800 hover:shadow-xl"
            >
              <Zap className="h-5 w-5" />
              Start Searching - Free
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          {/* Demo Examples */}
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-500 uppercase">Try a Demo</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-900">
                Click an example to see how it works
              </h3>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {DEMO_EXAMPLES.map(example => (
                <button
                  key={example.id}
                  type="button"
                  onClick={() => handleDemoClick(example)}
                  disabled={isSearching}
                  className="group relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg disabled:opacity-60"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src={example.thumbnail}
                      alt={example.title}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 text-left">
                    <p className="font-semibold text-slate-900">{example.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{example.description}</p>
                    <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-indigo-600">
                      Try this example
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Results Section */}
          {(isSearching || status === 'success') && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Demo Results</p>
                  <h2 className="text-2xl font-semibold text-slate-900">Visual Matches</h2>
                </div>
                <div className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                  {status === 'success' ? `${results.length} matches found` : 'Searching...'}
                </div>
              </div>

              {isSearching && (
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="animate-pulse rounded-xl bg-slate-100 py-24" />
                  ))}
                </div>
              )}

              {status === 'success' && results.length > 0 && (
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {results.map(result => (
                    <div key={result.id} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                      <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                        {result.thumbnail && (
                          <img
                            src={result.thumbnail}
                            alt={result.title || 'Search match'}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="space-y-2 p-3">
                        <div className="line-clamp-2 text-sm font-semibold text-slate-800">
                          {result.title || 'Match'}
                        </div>
                        {result.source && (
                          <span className="inline-block rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                            {result.source}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {status === 'success' && (
                <div className="mt-6 rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 text-center">
                  <p className="text-lg font-semibold text-slate-900">
                    Ready to search your own images?
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Sign up now and get 3 free search credits. No credit card required.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const signUpUrl = `${apiPrefix}/sign-up`;
                      router.push(signUpUrl);
                    }}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-1 hover:bg-slate-800 hover:shadow-xl"
                  >
                    <Zap className="h-4 w-4" />
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </>
    );
  }

  // For authenticated users, show the full two-column layout
  return (
    <>
      <LowBalanceDialog open={lowBalanceOpen} onClose={() => setLowBalanceOpen(false)} />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          {/* Upload Section */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-indigo-600 uppercase">Powered Search</p>
                <h1 className="text-2xl font-semibold text-slate-900">Find Similar Images</h1>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                <Sparkles className="h-4 w-4" />
                {credits ?? 0}
                {' '}
                credits
              </div>
            </div>

            <div
              {...getRootProps()}
              className={cn(
                'relative mt-6 flex h-72 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition',
                isDragActive
                  ? 'border-indigo-400 bg-gradient-to-br from-indigo-50 to-purple-50'
                  : 'border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100 hover:border-indigo-300 hover:from-indigo-50/30 hover:to-purple-50/30',
              )}
            >
              <input {...getInputProps()} />
              <div className={cn(
                'flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition',
                isDragActive
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-500'
                  : 'bg-gradient-to-br from-slate-900 to-slate-700',
              )}
              >
                {isSearching
                  ? <Loader2 className="h-8 w-8 animate-spin text-white" />
                  : <UploadCloud className="h-8 w-8 text-white" />}
              </div>
              <p className="mt-4 text-xl font-bold text-slate-900">
                {isDragActive ? 'Drop your image here' : statusLabel}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Drag & drop or click to upload
              </p>
              <p className="mt-1 text-xs text-slate-500">
                JPG, PNG, or WEBP up to 5MB
              </p>
              <div className="mt-4 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-md">
                <Zap className="h-3 w-3 text-amber-500" />
                1 credit per search
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase">Or search by URL</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <input
                  value={imageUrlInput}
                  onChange={event => setImageUrlInput(event.target.value)}
                  placeholder="https://example.com/image.jpg"
                  inputMode="url"
                  autoComplete="off"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                  disabled={isSearching}
                />
                <button
                  type="button"
                  onClick={() => void handleSearchUrl()}
                  disabled={isSearching || !imageUrlInput.trim()}
                  className={cn(
                    'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl',
                    (isSearching || !imageUrlInput.trim()) && 'cursor-not-allowed opacity-60 hover:translate-y-0 hover:shadow-lg',
                  )}
                >
                  <Search className="h-4 w-4" />
                  Search
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                💡 Paste a direct image URL for instant reverse search
              </p>
            </div>

            {previewUrl && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-500 uppercase">Preview</p>
                <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <img
                    src={previewUrl}
                    alt="Uploaded preview"
                    className="h-64 w-full object-cover"
                  />
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}
          </div>

          {/* Features Info */}
          <div className="grid gap-3 rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm md:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                <Globe className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">50+ Sources</p>
                <p className="text-xs text-slate-600">Getty, Shutterstock, Unsplash & more</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Higher Resolution</p>
                <p className="text-xs text-slate-600">Find larger & better quality versions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Instant Results</p>
                <p className="text-xs text-slate-600">Secure search with auto-refund</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-indigo-600 uppercase">Search Results</p>
                <h2 className="text-2xl font-semibold text-slate-900">Visual Matches</h2>
              </div>
              {status === 'success' && results.length > 0 && (
                <div className="rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 px-4 py-2 text-sm font-semibold text-indigo-700">
                  {results.length}
                  {' '}
                  found
                </div>
              )}
              {isSearching && (
                <div className="flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </div>
              )}
            </div>

            {isSearching && (
              <div className="mt-6 grid grid-cols-1 gap-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="h-20 w-20 shrink-0 animate-pulse rounded-lg bg-slate-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {status === 'success' && results.length === 0 && (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-6">
                <p className="font-semibold text-amber-900">No matches found</p>
                <p className="mt-1 text-sm text-amber-700">
                  Try another image, a different angle, or a higher resolution photo for better results.
                </p>
              </div>
            )}

            {status !== 'searching' && results.length > 0 && (
              <div className="mt-6 space-y-3">
                {results.map(result => (
                  <a
                    key={result.id}
                    href={result.link || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex gap-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                  >
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {result.thumbnail
                        ? (
                            <img
                              src={result.thumbnail}
                              alt={result.title || 'Search match'}
                              className="h-full w-full object-cover transition group-hover:scale-105"
                              loading="lazy"
                            />
                          )
                        : (
                            <div className="flex h-full items-center justify-center text-slate-400">
                              <ImageIcon className="h-6 w-6" />
                            </div>
                          )}
                    </div>
                    <div className="flex-1 space-y-1 overflow-hidden">
                      <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-indigo-600">
                          {result.title || 'Match'}
                        </p>
                        {result.source && (
                          <span className="shrink-0 rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                            {result.source}
                          </span>
                        )}
                      </div>
                      {result.link && (
                        <p className="truncate text-xs text-indigo-600 group-hover:underline">
                          {result.link}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center">
                      <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-indigo-600" />
                    </div>
                  </a>
                ))}
              </div>
            )}

            {status === 'idle' && results.length === 0 && (
              <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
                  <Search className="h-8 w-8 text-indigo-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Ready to Search</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Upload an image or paste a URL to find similar images across 50+ sources
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Higher resolution
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    Multiple sources
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Instant results
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Tips */}
          {status === 'idle' && results.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">💡 Pro Tips</p>
              <ul className="mt-3 space-y-2 text-xs text-slate-600">
                <li className="flex gap-2">
                  <span className="text-slate-400">•</span>
                  <span>Use clear, high-quality images for best results</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-slate-400">•</span>
                  <span>Different angles can reveal different matches</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-slate-400">•</span>
                  <span>Search multiple variations to find all sources</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

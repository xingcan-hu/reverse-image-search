'use client';

import type { FileRejection } from 'react-dropzone';
import type { ImageSearchResult } from '@/libs/SearchProvider';
import { useAuth } from '@clerk/nextjs';
import { ArrowRight, ImageIcon, Loader2, ShieldCheck, Sparkles, UploadCloud, Zap } from 'lucide-react';
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

  const handleDropzoneClick = useCallback(() => {
    if (!isSignedIn) {
      toast.info('Please sign in', { description: 'Sign in to start searching by image and get 3 free credits.' });
      const signInUrl = `${apiPrefix}/sign-in`;
      router.push(signInUrl);
    }
  }, [isSignedIn, apiPrefix, router]);

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
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Image search</p>
              <h1 className="text-2xl font-semibold text-slate-900">Upload & Search</h1>
            </div>
            <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              Balance:
              {' '}
              {credits ?? 0}
              {' '}
              credits
            </div>
          </div>

          <div
            {...(isSignedIn ? getRootProps() : {})}
            onClick={!isSignedIn ? handleDropzoneClick : undefined}
            onKeyDown={!isSignedIn
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleDropzoneClick();
                  }
                }
              : undefined}
            role={!isSignedIn ? 'button' : undefined}
            tabIndex={!isSignedIn ? 0 : undefined}
            className={cn(
              'mt-6 flex h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition',
              !isSignedIn && 'cursor-pointer opacity-60',
              isDragActive
                ? 'border-indigo-400 bg-indigo-50'
                : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100',
            )}
          >
            {isSignedIn && <input {...getInputProps()} />}
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
              {isSearching ? <Loader2 className="h-6 w-6 animate-spin text-indigo-600" /> : <UploadCloud className="h-6 w-6 text-indigo-600" />}
            </div>
            <p className="mt-3 text-lg font-semibold text-slate-900">
              {statusLabel}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Drag & drop or click to upload JPG, PNG, or WEBP (max 5MB)
            </p>
            <p className="mt-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
              1 credit per search · Auto-refunded if failed
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase">Or paste an image URL</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                value={imageUrlInput}
                onChange={event => setImageUrlInput(event.target.value)}
                placeholder="https://example.com/image.jpg"
                inputMode="url"
                autoComplete="off"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                disabled={isSearching || !isSignedIn}
              />
              <button
                type="button"
                onClick={() => {
                  if (!isSignedIn) {
                    toast.info('Please sign in', { description: 'Sign in to start searching by image and get 3 free credits.' });
                    const signInUrl = `${apiPrefix}/sign-in`;
                    router.push(signInUrl);
                    return;
                  }
                  void handleSearchUrl();
                }}
                disabled={isSearching || !imageUrlInput.trim()}
                className={cn(
                  'inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md',
                  (isSearching || !imageUrlInput.trim() || !isSignedIn) && 'cursor-not-allowed opacity-60 hover:translate-y-0 hover:shadow-sm',
                )}
              >
                Search URL
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Tip: Use a direct, publicly accessible image URL. Redirects may not work.
            </p>
          </div>

          {previewUrl && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold text-slate-500 uppercase">Preview</p>
              <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
                <img
                  src={previewUrl}
                  alt="Uploaded preview"
                  className="h-64 w-full object-cover"
                />
              </div>
            </div>
          )}

          <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Secure & Fast Search
            </div>
            <div className="text-xs text-slate-600">
              Search across 50+ stock sites including Getty, Shutterstock, Unsplash, and more. Find higher resolution versions and track image usage across the web.
            </div>
          </div>

          {errorMessage && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Results</p>
              <h2 className="text-xl font-semibold text-slate-900">Visual matches</h2>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {status === 'success' ? `${results.length} matches` : statusLabel}
            </div>
          </div>

          {isSearching && (
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="animate-pulse rounded-xl bg-slate-100 py-16" />
              ))}
            </div>
          )}

          {status === 'success' && results.length === 0 && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-700">
              No matches found. Try another angle or a higher resolution image.
            </div>
          )}

          {status !== 'searching' && results.length > 0 && (
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {results.map(result => (
                <div key={result.id} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                    {result.thumbnail
                      ? (
                          <img
                            src={result.thumbnail}
                            alt={result.title || 'Search match'}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        )
                      : (
                          <div className="flex h-full items-center justify-center text-slate-400">
                            <ImageIcon className="h-6 w-6" />
                          </div>
                        )}
                  </div>
                  <div className="space-y-2 p-4">
                    <div className="flex items-start justify-between gap-3 text-sm font-semibold text-slate-800">
                      {result.link
                        ? (
                            <a
                              href={result.link}
                              target="_blank"
                              rel="noreferrer"
                              className="line-clamp-2 hover:underline"
                            >
                              {result.title || 'Match'}
                            </a>
                          )
                        : (
                            <span className="line-clamp-2">{result.title || 'Match'}</span>
                          )}
                      {result.source && (
                        <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs text-slate-600 shadow-sm">
                          {result.source}
                        </span>
                      )}
                    </div>
                    {result.link
                      ? (
                          <a
                            href={result.link}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-xs font-semibold break-all text-indigo-600 hover:underline"
                          >
                            {result.link}
                          </a>
                        )
                      : (
                          <p className="text-xs text-slate-500">Link unavailable</p>
                        )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {status === 'idle' && results.length === 0 && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-700">
              Upload an image or paste a URL to see results. Need more credits? Visit the pricing page to recharge instantly.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

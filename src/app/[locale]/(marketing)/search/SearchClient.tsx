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
import Link from '@/components/AppLink';
import { useCredits } from '@/components/credits/CreditsProvider';
import { LowBalanceDialog } from '@/components/search/LowBalanceDialog';
import { routing } from '@/libs/I18nRouting';
import { cn } from '@/utils/Cn';

type SearchState = 'idle' | 'searching' | 'success' | 'error';

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
  const outOfCredits = typeof credits === 'number' && credits <= 0;

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

    if (outOfCredits) {
      setLowBalanceOpen(true);
      setStatus('idle');
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
  }, [apiPrefix, refreshCredits, setCredits, checkAuthAndRedirect, router, outOfCredits]);

  const handleSearchUrl = useCallback(async () => {
    if (!checkAuthAndRedirect()) {
      return;
    }

    if (outOfCredits) {
      setLowBalanceOpen(true);
      setStatus('idle');
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
  }, [apiPrefix, imageUrlInput, refreshCredits, setCredits, checkAuthAndRedirect, router, outOfCredits]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!isSignedIn) {
        toast.info('Please sign in', { description: 'Sign in to start searching by image and get 3 free credits.' });
        const signInUrl = `${apiPrefix}/sign-in`;
        router.push(signInUrl);
        return;
      }

      if (outOfCredits) {
        setLowBalanceOpen(true);
        setStatus('idle');
        return;
      }

      const file = acceptedFiles.at(0);
      if (!file) {
        return;
      }
      setPreviewUrl(URL.createObjectURL(file));
      void handleSearch(file);
    },
    [isSignedIn, apiPrefix, router, handleSearch, outOfCredits],
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

  // For non-authenticated users, show compact onboarding panel
  if (!isSignedIn) {
    return (
      <>
        <LowBalanceDialog open={lowBalanceOpen} onCloseAction={() => setLowBalanceOpen(false)} />
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-5">
            <p className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700">
              <Sparkles className="h-4 w-4" />
              3 free searches for new accounts
            </p>
            <h3 className="max-w-xl text-3xl leading-tight font-semibold text-slate-900 sm:text-4xl">
              Create an account and run your first reverse image search in seconds
            </h3>
            <p className="max-w-xl text-base leading-relaxed text-slate-600">
              We support upload, drag-and-drop, and public image URLs. After sign-up, you can start searching immediately with free credits.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const signUpUrl = `${apiPrefix}/sign-up`;
                  router.push(signUpUrl);
                }}
                className="ui-btn-primary ui-btn-lg"
              >
                <Zap className="h-4 w-4" />
                Create free account
                <ArrowRight className="h-4 w-4" />
              </button>
              <Link
                href={`${apiPrefix}/pricing`}
                className="ui-btn-secondary ui-btn-lg"
              >
                View pricing
              </Link>
            </div>
            <p className="text-xs font-medium text-slate-500">
              No credit card required. Credits never expire.
            </p>
          </div>

          <div className="ui-panel-soft p-5">
            <div className="ui-panel p-5 shadow-sm">
              <p className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold tracking-wide text-slate-600 uppercase">
                <Search className="h-3.5 w-3.5" />
                Search preview
              </p>
              <div className="mt-4 flex h-44 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50">
                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white">
                    <Search className="h-6 w-6" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-900">Upload an image after sign in</p>
                  <p className="mt-1 text-xs text-slate-500">JPG, PNG, WEBP · up to 5MB</p>
                </div>
              </div>
              <div className="mt-4 grid gap-2 text-xs text-slate-600">
                <p>• Search across 50+ image sources</p>
                <p>• Find matching pages and thumbnails</p>
                <p>• Discover higher-resolution versions</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // For authenticated users, show the full two-column layout
  return (
    <>
      <LowBalanceDialog open={lowBalanceOpen} onCloseAction={() => setLowBalanceOpen(false)} />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          {/* Upload Section */}
          <div className="ui-panel p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[var(--ui-accent)] uppercase">Powered Search</p>
                <h2 className="text-2xl font-semibold text-slate-900">Find Similar Images</h2>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-[var(--ui-accent)]">
                <Sparkles className="h-4 w-4" />
                {credits ?? 0}
                {' '}
                credits
              </div>
            </div>

            {outOfCredits && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <p className="font-semibold">You are out of credits.</p>
                <p className="mt-1 text-amber-800">
                  Get free credits by checking in daily or inviting friends, or buy credits anytime.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setLowBalanceOpen(true)}
                    className="ui-btn-primary ui-btn-xs"
                  >
                    Get free credits
                  </button>
                  <Link
                    href={locale === routing.defaultLocale ? '/pricing' : `/${locale}/pricing`}
                    className="ui-btn-secondary ui-btn-xs"
                  >
                    Buy credits
                  </Link>
                </div>
              </div>
            )}

            <div
              {...getRootProps()}
              className={cn(
                'relative mt-6 flex h-72 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition',
                isDragActive
                  ? 'border-sky-400 bg-gradient-to-br from-sky-50 to-white'
                  : 'border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100 hover:border-sky-300 hover:from-sky-50/50 hover:to-white',
              )}
            >
              <input {...getInputProps()} />
              <div className={cn(
                'flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition',
                isDragActive
                  ? 'bg-[var(--ui-accent)]'
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                  disabled={isSearching}
                />
                <button
                  type="button"
                  onClick={() => void handleSearchUrl()}
                  disabled={isSearching || !imageUrlInput.trim()}
                  className={cn(
                    'ui-btn-primary ui-btn-lg shrink-0',
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
          <div className="ui-panel-soft grid gap-3 p-6 md:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="ui-icon-box ui-icon-box-sm shrink-0">
                <Globe className="h-5 w-5 text-[var(--ui-accent)]" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">50+ Sources</p>
                <p className="text-xs text-slate-600">Getty, Shutterstock, Unsplash & more</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="ui-icon-box ui-icon-box-sm shrink-0">
                <Sparkles className="h-5 w-5 text-[var(--ui-accent)]" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Higher Resolution</p>
                <p className="text-xs text-slate-600">Find larger & better quality versions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="ui-icon-box ui-icon-box-sm shrink-0 bg-sky-100 text-[var(--ui-accent)]">
                <ShieldCheck className="h-5 w-5 text-[var(--ui-accent)]" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Instant Results</p>
                <p className="text-xs text-slate-600">Secure search with auto-refund</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="ui-panel p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[var(--ui-accent)] uppercase">Search Results</p>
                <h2 className="text-2xl font-semibold text-slate-900">Visual Matches</h2>
              </div>
              {status === 'success' && results.length > 0 && (
                <div className="rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-[var(--ui-accent)]">
                  {results.length}
                  {' '}
                  found
                </div>
              )}
              {isSearching && (
                <div className="flex items-center gap-2 rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-[var(--ui-accent)]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </div>
              )}
            </div>

            {isSearching && (
              <div className="mt-6 grid grid-cols-1 gap-4">
                {['skeleton-a', 'skeleton-b', 'skeleton-c'].map(key => (
                  <div key={key} className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
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
                    className="group flex gap-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"
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
                        <p className="line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-[var(--ui-accent)]">
                          {result.title || 'Match'}
                        </p>
                        {result.source && (
                          <span className="shrink-0 rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                            {result.source}
                          </span>
                        )}
                      </div>
                      {result.link && (
                        <p className="truncate text-xs text-[var(--ui-accent)] group-hover:underline">
                          {result.link}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center">
                      <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[var(--ui-accent)]" />
                    </div>
                  </a>
                ))}
              </div>
            )}

            {status === 'idle' && results.length === 0 && (
              <div className="ui-panel-soft mt-6 space-y-4 p-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-100">
                  <Search className="h-8 w-8 text-[var(--ui-accent)]" />
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
            <div className="ui-panel p-5">
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

'use client';

import type { FileRejection } from 'react-dropzone';
import type { ImageSearchResult } from '@/libs/SearchProvider';
import { ImageIcon, Loader2, ShieldCheck, UploadCloud } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
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
  const apiPrefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  const { credits, setCredits, refreshCredits } = useCredits();

  const handleSearch = useCallback(async (file: File) => {
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
  }, [apiPrefix, refreshCredits, setCredits]);

  const handleSearchUrl = useCallback(async () => {
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
  }, [apiPrefix, imageUrlInput, refreshCredits, setCredits]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles.at(0);
      if (!file) {
        return;
      }
      setPreviewUrl(URL.createObjectURL(file));
      void handleSearch(file);
    },
    [handleSearch],
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

  return (
    <>
      <LowBalanceDialog open={lowBalanceOpen} onClose={() => setLowBalanceOpen(false)} />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Image search</p>
              <h1 className="text-2xl font-semibold text-slate-900">Upload · 1 credit per search</h1>
            </div>
            <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              Balance:
              {' '}
              {credits ?? 0}
              {' '}
              credits
            </div>
          </div>

          <div
            {...getRootProps()}
            className={cn(
              'mt-6 flex h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition',
              isDragActive
                ? 'border-indigo-400 bg-indigo-50'
                : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100',
            )}
          >
            <input {...getInputProps()} />
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
              Cost: 1 credit · Refunds on failure
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
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                disabled={isSearching}
              />
              <button
                type="button"
                onClick={() => void handleSearchUrl()}
                disabled={isSearching || !imageUrlInput.trim()}
                className={cn(
                  'inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md',
                  (isSearching || !imageUrlInput.trim()) && 'cursor-not-allowed opacity-60 hover:translate-y-0 hover:shadow-sm',
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

          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Credits-first billing · Powered by Stripe
            </div>
            <div className="text-xs text-slate-500">
              We check your balance before calling the search engine. Failed searches are auto-refunded.
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
                            className="block break-all text-xs font-semibold text-indigo-600 hover:underline"
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

import { Env } from './Env';
import { logger } from './Logger';

export type ImageSearchResult = {
  id: string;
  title: string;
  link: string;
  thumbnail: string;
  source?: string;
};

export const runImageSearch = async (imageUrl: string): Promise<ImageSearchResult[]> => {
  if (!Env.SEARCH_API_URL || !Env.SEARCH_API_KEY) {
    logger.warn('Search provider is not configured', () => ({
      hasSearchApiUrl: Boolean(Env.SEARCH_API_URL),
      hasSearchApiKey: Boolean(Env.SEARCH_API_KEY),
    }));
    throw new TypeError('Search provider is not configured');
  }

  const url = new URL(Env.SEARCH_API_URL);
  url.searchParams.set('engine', 'google_reverse_image');
  url.searchParams.set('api_key', Env.SEARCH_API_KEY);
  url.searchParams.set('image_url', imageUrl);

  const response = await fetch(url, {
    method: 'GET',
    cache: 'no-store',
  });

  // Read response body as text first for logging and error handling
  const responseText = await response.text();

  if (!response.ok) {
    logger.error('Search provider request failed', () => ({
      status: response.status,
      statusText: response.statusText,
      body: responseText.length > 2000 ? `${responseText.slice(0, 2000)}…` : responseText,
    }));
    throw new Error('Search provider request failed');
  }

  // Parse JSON from the text we already read
  let payload: unknown;
  try {
    payload = JSON.parse(responseText);
    logger.info('Search provider response content', () => ({ payload }));
  } catch (error) {
    logger.error('Search provider returned invalid JSON', () => ({ error, body: responseText }));
    throw new TypeError('Search provider returned invalid JSON');
  }

  if (!payload || typeof payload !== 'object') {
    throw new TypeError('Search provider returned an invalid response');
  }

  const status = (payload as { search_metadata?: { status?: unknown } }).search_metadata?.status;
  if (typeof status === 'string' && status.toLowerCase() !== 'success') {
    logger.warn('Search provider returned non-success status', () => ({ status }));
    throw new Error('Search provider returned non-success status');
  }

  const rawResults = (payload as { image_results?: unknown }).image_results;

  if (!Array.isArray(rawResults)) {
    throw new TypeError('Search provider returned an invalid response');
  }

  const filteredResults = rawResults
    .filter((raw): raw is Record<string, unknown> => typeof raw === 'object' && raw !== null)
    .filter((item) => {
      const thumbnail = item.thumbnail;
      return typeof thumbnail === 'string' && thumbnail.length > 0;
    })
    .slice(0, 100);

  return filteredResults.map((item, index): ImageSearchResult => {
    const thumbnail = String(item.thumbnail);
    const link = typeof item.link === 'string'
      ? item.link
      : typeof item.redirect_link === 'string'
        ? item.redirect_link
        : '';

    const source = typeof item.source === 'string'
      ? item.source
      : typeof item.displayed_link === 'string'
        ? item.displayed_link
        : (() => {
            try {
              return link ? new URL(link).hostname : undefined;
            } catch {
              return undefined;
            }
          })();

    const title = typeof item.title === 'string'
      ? item.title
      : source ?? 'Match';

    const position = typeof item.position === 'number' ? item.position : index + 1;
    const id = `serpapi-${position}`;

    return {
      id,
      title,
      link,
      thumbnail,
      source,
    };
  });
};

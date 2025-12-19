import { POST as stripeWebhookHandler } from '../../webhook/stripe/route';

export const runtime = 'nodejs';

// Alias route for common webhook URL: `/api/webhooks/stripe`
export const POST = stripeWebhookHandler;

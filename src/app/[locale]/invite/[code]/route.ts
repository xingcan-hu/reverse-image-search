import type { NextRequest } from 'next/server';
import { buildInviteRedirectResponse } from '@/libs/InviteRedirect';

export const runtime = 'nodejs';

type InviteRouteContext = {
  params: Promise<{
    locale: string;
    code: string;
  }>;
};

export const GET = async (request: NextRequest, context: InviteRouteContext) => {
  const params = await context.params;
  return buildInviteRedirectResponse(request, params.code);
};

import { buildInviteRedirectResponse } from '@/libs/InviteRedirect';

export const runtime = 'nodejs';

type InviteRouteContext = {
  params: {
    locale: string;
    code?: string;
  };
};

export const GET = async (request: Request, context: InviteRouteContext) => {
  const params = await context.params;
  return buildInviteRedirectResponse(request, params.code);
};

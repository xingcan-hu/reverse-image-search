import { buildInviteRedirectResponse } from '@/libs/InviteRedirect';

export const runtime = 'nodejs';

type InviteRouteContext = {
  params: {
    code?: string;
  };
};

export const GET = async (request: Request, context: InviteRouteContext) => {
  const params = await context.params;
  return buildInviteRedirectResponse(request, params.code);
};

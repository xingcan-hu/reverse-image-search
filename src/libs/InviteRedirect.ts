import { NextResponse } from 'next/server';

export const buildInviteRedirectResponse = (request: Request, rawCode: string | undefined) => {
  const code = (rawCode ?? '').trim().toUpperCase();
  const redirectUrl = new URL('/sign-up', request.url);

  const response = NextResponse.redirect(redirectUrl);

  if (code) {
    response.cookies.set('referral_code', code, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
};

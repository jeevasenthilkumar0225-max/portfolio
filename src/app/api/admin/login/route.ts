import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, secretCode } = body || {};

    const expectedSecret = process.env.ADMIN_SECRET_CODE || 'jeeva0225';
    const expectedUsername = process.env.ADMIN_USERNAME || 'admin';
    const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // 1. Secret passcode match
    const isSecretValid = secretCode && typeof secretCode === 'string' && secretCode.trim() === expectedSecret.trim();

    // 2. Username + Password match
    const isCredsValid =
      username &&
      password &&
      typeof username === 'string' &&
      typeof password === 'string' &&
      username.trim() === expectedUsername.trim() &&
      password === expectedPassword;

    if (isSecretValid || isCredsValid) {
      const response = NextResponse.json({
        success: true,
        message: 'Authenticated successfully',
      });

      response.cookies.set('admin_token', 'js-portfolio-authenticated-admin-session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ success: false, error: 'Invalid security access code or credentials' }, { status: 401 });
  } catch (error) {
    console.error('[POST /api/admin/login] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

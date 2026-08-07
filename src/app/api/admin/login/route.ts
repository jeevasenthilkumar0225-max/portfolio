import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, secretCode } = body;

    const expectedSecret = process.env.ADMIN_SECRET_CODE || 'jeeva0225';
    const expectedUsername = process.env.ADMIN_USERNAME || 'admin';
    const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // Secret passcode match (from portihelp AI or secret gate)
    if (secretCode === expectedSecret) {
      const response = NextResponse.json({ success: true, message: 'Secret Code Authenticated' });
      response.cookies.set('admin_token', 'js-portfolio-authenticated-admin-session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });
      return response;
    }

    if (username === expectedUsername && password === expectedPassword) {
      const response = NextResponse.json({ success: true, message: 'Authenticated successfully' });
      response.cookies.set('admin_token', 'js-portfolio-authenticated-admin-session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
      return response;
    }

    return NextResponse.json({ success: false, error: 'Invalid secret passcode' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}


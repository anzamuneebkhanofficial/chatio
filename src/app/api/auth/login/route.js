import { NextResponse } from 'next/server';
import { parseDurationToSeconds } from '@/lib/ownerAuth';

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Master Owner strict credential authentication
    const masterEmail = (process.env.OWNER_EMAIL || 'anzamuneebkhan13@gmail.com').toLowerCase().trim();
    const masterPassword = process.env.OWNER_PASSWORD || 'pakistan';

    if (cleanEmail === masterEmail && password === masterPassword) {
      // Dynamic expiration from ENV (Supports: '7d', '1d', '12h', '4h', '15m', '2m', or seconds)
      const expirySeconds = parseDurationToSeconds(process.env.OWNER_SESSION_EXPIRY || '7d');

      const response = NextResponse.json({
        success: true,
        isOwner: true,
        user: { id: 'master_owner', email: cleanEmail, name: 'Muhammad Anza Muneeb Khan (Owner)' },
        redirect: '/admin',
        expiresInSeconds: expirySeconds,
      });

      // Strict Configurable HttpOnly Secure Session Cookie
      response.cookies.set('owner_session', 'master_authorized', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: expirySeconds,
        path: '/',
      });

      return response;
    }


    // Zero loophole unauthorized rejection
    return NextResponse.json(
      { error: 'Invalid Master Owner credentials. You are not authorized to access this portal.' },
      { status: 401 }
    );
  } catch (err) {
    console.error('[Login API] Error:', err.message);
    return NextResponse.json({ error: 'Authentication service error.' }, { status: 500 });
  }
}



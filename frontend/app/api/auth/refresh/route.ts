import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export async function POST(req: Request) {
  try {
    const jar = cookies();
    const refreshToken = jar.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
    }

    // Call backend refresh endpoint
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      // Refresh token invalid or expired
      return NextResponse.json({ error: 'Refresh failed' }, { status: 401 });
    }

    const data = await response.json();
    const { accessToken, refreshToken: newRefreshToken } = data;

    // Set new tokens in cookies
    const maxAge = 60 * 60 * 24 * 7; // 7 days
    const secure = process.env.NODE_ENV === 'production';

    const res = NextResponse.json({ ok: true });
    res.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      path: '/',
      maxAge,
      sameSite: 'lax',
      secure,
    });

    if (newRefreshToken) {
      res.cookies.set('refreshToken', newRefreshToken, {
        httpOnly: true,
        path: '/',
        maxAge,
        sameSite: 'lax',
        secure,
      });
    }

    return res;
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export const runtime = 'nodejs';

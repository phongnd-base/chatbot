import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { accessToken, refreshToken } = body || {};
  if (!accessToken) return NextResponse.json({ error: 'accessToken required' }, { status: 400 });

  // 7 days expiry for demo; adjust as needed
  const maxAge = 60 * 60 * 24 * 7;
  const secure = process.env.NODE_ENV === 'production';

  const res = NextResponse.json({ ok: true });
  res.cookies.set('accessToken', accessToken, { httpOnly: true, path: '/', maxAge, sameSite: 'lax', secure });
  if (refreshToken) res.cookies.set('refreshToken', refreshToken, { httpOnly: true, path: '/', maxAge, sameSite: 'lax', secure });
  return res;
}

export const runtime = 'nodejs';

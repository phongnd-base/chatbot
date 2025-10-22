import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const jar = cookies();
  jar.delete('accessToken');
  jar.delete('refreshToken');
  return NextResponse.json({ ok: true });
}

export const runtime = 'nodejs';

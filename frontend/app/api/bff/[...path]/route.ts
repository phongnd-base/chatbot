import { cookies, headers as nextHeaders } from 'next/headers';
import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

async function forward(req: Request, pathParts: string[]) {
  const url = new URL(req.url);
  const pathname = pathParts.join('/');
  const targetUrl = `${API_BASE}/${pathname}${url.search}`;

  // Clone headers, drop hop-by-hop and host-specific
  const incoming = nextHeaders();
  const outHeaders = new Headers();
  for (const [k, v] of incoming.entries()) {
    const key = k.toLowerCase();
    if (['host', 'content-length', 'connection'].includes(key)) continue;
    // Do not forward cookies to upstream
    if (key === 'cookie') continue;
    outHeaders.set(k, v);
  }

  // Add Authorization from cookies if available
  const jar = cookies();
  const accessToken = jar.get('accessToken')?.value;
  if (accessToken) {
    outHeaders.set('authorization', `Bearer ${accessToken}`);
  }

  const method = req.method;
  const body = method === 'GET' || method === 'HEAD' ? undefined : req.body;

  const upstream = await fetch(targetUrl, {
    method,
    headers: outHeaders,
    body,
    // @ts-expect-error Node fetch duplex hint for streaming requests
    duplex: 'half',
  });

  // Stream back response preserving status and headers
  const respHeaders = new Headers();
  upstream.headers.forEach((v, k) => {
    // Avoid setting hop-by-hop headers
    if (['transfer-encoding'].includes(k.toLowerCase())) return;
    respHeaders.set(k, v);
  });

  return new NextResponse(upstream.body, { status: upstream.status, headers: respHeaders });
}

export async function GET(req: Request, { params }: { params: { path: string[] } }) {
  return forward(req, params.path);
}
export async function POST(req: Request, { params }: { params: { path: string[] } }) {
  return forward(req, params.path);
}
export async function PUT(req: Request, { params }: { params: { path: string[] } }) {
  return forward(req, params.path);
}
export async function PATCH(req: Request, { params }: { params: { path: string[] } }) {
  return forward(req, params.path);
}
export async function DELETE(req: Request, { params }: { params: { path: string[] } }) {
  return forward(req, params.path);
}

export const runtime = 'nodejs';

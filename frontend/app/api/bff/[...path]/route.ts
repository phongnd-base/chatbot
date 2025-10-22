import { cookies, headers as nextHeaders } from 'next/headers';
import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

async function refreshAccessToken() {
  try {
    const jar = cookies();
    const refreshToken = jar.get('refreshToken')?.value;

    if (!refreshToken) {
      return null;
    }

    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.accessToken;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return null;
  }
}

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
  let accessToken = jar.get('accessToken')?.value;

  if (accessToken) {
    outHeaders.set('authorization', `Bearer ${accessToken}`);
  }

  const method = req.method;
  const body = method === 'GET' || method === 'HEAD' ? undefined : req.body;

  let upstream = await fetch(targetUrl, {
    method,
    headers: outHeaders,
    body,
    // @ts-expect-error Node fetch duplex hint for streaming requests
    duplex: 'half',
  });

  // If 401, try to refresh token and retry once
  if (upstream.status === 401 && accessToken) {
    console.log('[BFF] Received 401, attempting token refresh...');
    const newAccessToken = await refreshAccessToken();
    
    if (newAccessToken) {
      console.log('[BFF] Token refresh successful, retrying request...');
      // Update cookie with new access token
      const maxAge = 60 * 60 * 24 * 7;
      const secure = process.env.NODE_ENV === 'production';
      cookies().set('accessToken', newAccessToken, {
        httpOnly: true,
        path: '/',
        maxAge,
        sameSite: 'lax',
        secure,
      });

      // Retry request with new token
      outHeaders.set('authorization', `Bearer ${newAccessToken}`);
      
      // For POST/PUT/PATCH, we need to recreate the body
      let retryBody;
      if (method !== 'GET' && method !== 'HEAD') {
        // Clone the original request to read body again
        const clonedReq = req.clone();
        retryBody = await clonedReq.blob();
      }

      upstream = await fetch(targetUrl, {
        method,
        headers: outHeaders,
        body: retryBody,
        // @ts-expect-error Node fetch duplex hint
        duplex: 'half',
      });
      
      console.log('[BFF] Retry completed with status:', upstream.status);
    } else {
      console.warn('[BFF] Token refresh failed, returning 401 with X-Auth-Required');
      // Refresh failed, return 401 with special header to trigger client-side logout
      return new NextResponse(JSON.stringify({ error: 'Session expired', needsLogin: true }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Required': 'true',
        },
      });
    }
  }

  // Stream back response preserving status and headers
  const respHeaders = new Headers();
  upstream.headers.forEach((v, k) => {
    // Avoid setting hop-by-hop headers
    if (['transfer-encoding'].includes(k.toLowerCase())) return;
    respHeaders.set(k, v);
  });

  // If still 401 after refresh attempt, add auth required header
  if (upstream.status === 401) {
    console.warn('[BFF] Still 401 after handling, adding X-Auth-Required header');
    respHeaders.set('X-Auth-Required', 'true');
  }

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

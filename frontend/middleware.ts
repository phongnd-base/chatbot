import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const debug = req.nextUrl.searchParams.get('debugAuth') === '1';
  // Public paths that should bypass auth
  const publicPaths = ['/login', '/register', '/', '/_next', '/favicon.ico'];
  const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (isPublic) {
	const res = NextResponse.next();
	if (debug) res.headers.set('x-auth-debug', `path=${pathname} isPublic=true`);
	return res;
  }
  // Only protect chat routes for now
  const isProtected = pathname.startsWith('/chat');
  const token = req.cookies.get('accessToken')?.value;

  if (isProtected) {
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.search = `from=${encodeURIComponent(pathname + search)}&expired=1`;
      if (debug) {
        return new Response(`Blocked by middleware\npath=${pathname}\nisProtected=true\nhasToken=false\nredirectTo=${url.pathname + url.search}`, { status: 401, headers: { 'content-type': 'text/plain' } });
      }
      console.log('[Middleware] No token found, redirecting to login:', url.pathname + url.search);
      return NextResponse.redirect(url);
    }
  }
  const res = NextResponse.next();
  if (debug) res.headers.set('x-auth-debug', `path=${pathname} isProtected=${isProtected} hasToken=${!!token}`);
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

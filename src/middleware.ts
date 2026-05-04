import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const isAuth = !!req.nextauth.token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/register');
    const isPublicPage = req.nextUrl.pathname === '/' || req.nextUrl.pathname.startsWith('/play') || req.nextUrl.pathname.startsWith('/belajar');
    const role = req.nextauth.token?.role;

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      return null;
    }

    if (!isAuth && !isPublicPage) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Protect admin routes
    if ((req.nextUrl.pathname === '/admin' || req.nextUrl.pathname.startsWith('/admin/')) && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  },
  {
    callbacks: {
      authorized: () => true,
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback_secret_key_change_me",
  }
);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

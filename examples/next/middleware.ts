import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  return NextResponse.next({
    request: {
      headers: new Headers({
        'x-next-origin': request.nextUrl.origin,
        'x-next-pathname': request.nextUrl.pathname,
        'x-next-search-params': request.nextUrl.searchParams.toString(),
      }),
    },
  });
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

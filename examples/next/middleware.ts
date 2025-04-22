/*
 * Copyright 2024-2025 Bloomreach
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {NextResponse, type NextRequest} from 'next/server';
import {cookies} from 'next/headers';

export async function middleware(request: NextRequest) {
  const HEADER_X_FORWARDED_FOR = 'X-Forwarded-For';

  return NextResponse.next({
    request: {
      headers: new Headers({
        'x-next-pathname': request.nextUrl.pathname,
        'x-next-search-params': request.nextUrl.searchParams.toString(),
        'x-next-cookie': (await cookies()).toString(),
        'x-next-origin': request.nextUrl.origin,
        'x-next-forwarded-for': request.headers.get(HEADER_X_FORWARDED_FOR),
      }),
    },
  });
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

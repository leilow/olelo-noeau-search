import { NextResponse, type NextRequest } from 'next/server';
import { isAllowedApiRequest } from '@/lib/api-auth';
import { proxy } from './proxy';

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api')) {
    if (!isAllowedApiRequest(request)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }
  return proxy(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

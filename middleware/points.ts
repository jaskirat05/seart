import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PointsManager } from '@/utils/points';
import { SessionManager } from '@/utils/redis';

export async function middleware(request: NextRequest) {
  // Skip if it's not an API route we want to protect
  if (!request.nextUrl.pathname.startsWith('/api/generations')) {
    return NextResponse.next();
  }

  // Get user session from Clerk (if exists)
  const userId = request.headers.get('x-user-id');
  
  // If no user, handle anonymous session
  if (!userId) {
    const ip = request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for') ?? 'unknown';
    try {
      // Check Redis first
      let sessionCache = await SessionManager.getSessionCache(ip);
      
      if (sessionCache) {
        // Check rate limit and update access
        if (!await SessionManager.updateSessionAccess(ip)) {
          return NextResponse.json(
            { error: 'Rate limit exceeded' },
            { status: 429 }
          );
        }
      } else {
        // Create new session in Postgres
        const session = await PointsManager.getOrCreateAnonymousSession(ip);
        // Cache in Redis
        await SessionManager.createSessionCache(session.id, ip);
        sessionCache = await SessionManager.getSessionCache(ip);
      }
      
      if (!sessionCache) {
        throw new Error('Failed to create session');
      }

      // Clone the request and add session ID
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-session-id', sessionCache.sessionId);
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error('Error managing anonymous session:', error);
      return NextResponse.json(
        { error: 'Failed to manage session' },
        { status: 500 }
      );
    }
  }

  return NextResponse.next();
}

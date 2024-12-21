import { clerkMiddleware, createRouteMatcher} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PointsManager } from '@/utils/points';
import { SessionManager } from '@/utils/redis';

const publicRoutes = createRouteMatcher(["/", "/api/webhook", "/api/upload"]);

export default clerkMiddleware(async (auth, req) => {  
    const {userId} = await auth();
    const response = NextResponse.next();

    // For authenticated users, add user ID
    if (userId) {
        response.headers.set('x-user-id', userId);
        return response;
    }

    // For anonymous users on public routes that need session
    if (!userId && (req.nextUrl.pathname.startsWith('/api/upload') || 
                   req.nextUrl.pathname.startsWith('/api/generations'))) {
        const ip = req.headers.get('x-real-ip') ?? 
                  req.headers.get('x-forwarded-for') ?? 
                  'unknown';
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

            // Add session ID to response headers
            response.headers.set('x-session-id', sessionCache.sessionId);
            return response;

        } catch (error) {
            console.error('Error creating session:', error);
            return NextResponse.json(
                { error: 'Failed to create session' },
                { status: 500 }
            );
        }
    }

    // For all other routes/cases
    return response;
});

export const config = {
    matcher: [
        "/((?!.*\\..*|_next).*)",
        "/",
        "/(api|trpc)(.*)",
    ],
};
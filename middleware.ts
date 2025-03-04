import { clerkClient, clerkMiddleware, createRouteMatcher} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PointsManager } from '@/utils/points';
import { SessionManager } from '@/utils/redis';
import { useState } from "react";

 
import { cookies } from 'next/headers'
import { q } from "framer-motion/client";

const publicRoutes = createRouteMatcher(["/", "/api/webhook", "/api/upload","api/signUp","/login","/history", "/api/history","/settings","/pricing"]);
const webhookRoutes = createRouteMatcher(["/api/webhook","/api/signUp"]);

export default clerkMiddleware(async (auth, req) => {  
  
    const {userId,has} = await auth();
    const response = NextResponse.next();
    const completeOnboarding = async(key:string) => {
        const { userId } = await auth()
      
        const sessionId = key
        if (!userId) {
          return { message: 'No Logged In User' }
        }
      
        const client = await clerkClient()
      
        try {
          const res = await client.users.updateUserMetadata(userId, {
            publicMetadata: {
              onboardingComplete: true,
              session_id: sessionId,
              role: 'user'
            },
          })
          return { message: res.publicMetadata }
        } catch (err) {
          return { error: 'There was an error updating the user metadata.' }
        }
      }
    // For authenticated users, add user ID
    if(webhookRoutes(req)){
        return response;
    }
    // For anonymous users on public routes that need session
    if (!userId && publicRoutes(req)) {
        console.log("in a publicrouter")
        const cookieStore = await cookies();
       if (!cookieStore.has('anon_session_id')) {
        console.log("Creaing a new session, user doesn't have an existing one")
        
        const ip = req.headers.get('x-real-ip') ?? 
                  req.headers.get('x-forwarded-for') ?? 
                  'unknown';
        console.log("IP FOUND IS",ip)
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
              console.log("creating session")
                // Create new session in Postgres
                const session = await PointsManager.getOrCreateAnonymousSession(ip);
                console.log("Session details",session)
                // Cache in Redis
                await SessionManager.createSessionCache(session.id, ip);
                sessionCache = await SessionManager.getSessionCache(ip);
                cookieStore.set({
                  name: 'anon_session_id',  
                  value: session.id,
                  httpOnly: true,
                  path: '/',
                })
                
            }
            
            if (!sessionCache) {
                throw new Error('Failed to create session');
            }

            // Add session ID to response headers
            const sessionCookie = cookieStore.has('anon_session_id');
            if(!sessionCookie){
              cookieStore.set({
                name: 'anon_session_id',  
                value: sessionCache.sessionId,
                httpOnly: true,
                path: '/',
              })} 
            response.headers.set('x-session-id', sessionCache.sessionId);
            console.log('Session ID present:', sessionCookie);
            return response;

        } catch (error) {
            console.error('Error creating session:', error);
            return NextResponse.json(
                { error: 'Failed to create session' },
                { status: 500 }
            );
        }}
        else if (cookieStore.has('anon_session_id')) { 
            const sessionCookie = cookieStore.get('anon_session_id')?.value;
            response.headers.set('x-session-id', sessionCookie!);
            console.log('Session ID present:', sessionCookie);
            return response;  
        }
    

    }
    else if (userId &&(await auth()).sessionClaims?.metadata?.role == 'user' && publicRoutes(req)) {
      console.log("setting user role, authorized")
        return response;

    }
    else if (userId && (await auth()).sessionClaims?.metadata?.role == undefined&&publicRoutes(req)) {
        console.log("setting user role")
        const cookieStore = await cookies();
        if (!cookieStore.has('anon_session_id')) {
  
          
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
                  cookieStore.set({
                    name: 'anon_session_id',  
                    value: session.id,
                    httpOnly: true,
                    path: '/',
                  })
              }
              
              if (!sessionCache) {
                  throw new Error('Failed to create session');
              }
  
              // Add session ID to response headers
              const sessionCookie = cookieStore.has('anon_session_id');
              if(!sessionCookie){
                cookieStore.set({
                  name: 'anon_session_id',  
                  value: sessionCache.sessionId,
                  httpOnly: true,
                  path: '/',
                })} 
              response.headers.set('x-session-id', sessionCache.sessionId);
              console.log('Session ID present:', sessionCookie);
              await completeOnboarding(sessionCache.sessionId);
              return response;
  
          } catch (error) {
              console.error('Error creating session:', error);
              return NextResponse.json(
                  { error: 'Failed to create session' },
                  { status: 500 }
              );
          }}
          else if (cookieStore.has('anon_session_id')) { 
              const sessionCookie = cookieStore.get('anon_session_id')?.value;
              await completeOnboarding(sessionCookie!);
              return response;  
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
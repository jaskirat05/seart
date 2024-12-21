// types/redis.ts
export interface AnonymousSessionCache {
    sessionId: string;
    ipAddress: string;
    lastAccess: number;
    requestCount: number;  // For rate limiting
  }
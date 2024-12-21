import { Redis } from '@upstash/redis'
import type { AnonymousSessionCache } from '@/types/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
})

export class SessionManager {
  private static readonly SESSION_PREFIX = 'anon_session:'
  private static readonly IP_PREFIX = 'ip_rate:'
  private static readonly SESSION_TTL = 60 * 60 * 24 * 7 // 7 days
  private static readonly RATE_LIMIT_TTL = 60 * 60 // 1 hour
  private static readonly MAX_REQUESTS_PER_HOUR = 100

  static async getSessionCache(ipAddress: string): Promise<AnonymousSessionCache | null> {
    const ipKey = `${this.IP_PREFIX}${ipAddress}`
    return redis.get(ipKey)
  }

  static async createSessionCache(sessionId: string, ipAddress: string): Promise<void> {
    const ipKey = `${this.IP_PREFIX}${ipAddress}`
    const sessionKey = `${this.SESSION_PREFIX}${sessionId}`

    const sessionCache: AnonymousSessionCache = {
      sessionId,
      ipAddress,
      lastAccess: Date.now(),
      requestCount: 1
    }

    // Store both IP -> Session and Session -> IP mappings
    await Promise.all([
      redis.set(ipKey, sessionCache, { ex: this.SESSION_TTL }),
      redis.set(sessionKey, ipAddress, { ex: this.SESSION_TTL })
    ])
  }

  static async updateSessionAccess(ipAddress: string): Promise<boolean> {
    const ipKey = `${this.IP_PREFIX}${ipAddress}`
    
    // Update last access and increment request count
    const session = await this.getSessionCache(ipAddress)
    if (!session) return false

    session.lastAccess = Date.now()
    session.requestCount++

    // Check rate limit
    if (session.requestCount > this.MAX_REQUESTS_PER_HOUR) {
      return false
    }

    await redis.set(ipKey, session, { ex: this.SESSION_TTL })
    return true
  }

  static async invalidateSession(sessionId: string): Promise<void> {
    const sessionKey = `${this.SESSION_PREFIX}${sessionId}`
    const ipAddress = await redis.get<string>(sessionKey)

    if (ipAddress) {
      const ipKey = `${this.IP_PREFIX}${ipAddress}`
      await Promise.all([
        redis.del(sessionKey),
        redis.del(ipKey)
      ])
    }
  }
}

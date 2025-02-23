import { supabaseAdmin } from './supabaseAdmin';
import type { AnonymousSession, UserPoints } from '@/types/points';

export class PointsManager {
  static async getOrCreateAnonymousSession(ipAddress: string): Promise<AnonymousSession> {
    console.log('[PointsManager] Checking for existing session with IP:', ipAddress);
    
    // Check for existing active session
    const { data: existingSession, error: existingError } = await supabaseAdmin
      .from('anonymous_sessions')
      .select('*')
      .eq('ip_address', ipAddress)
      .eq('status', 'active')
      .single();

    if (existingError) {
      console.log('[PointsManager] Error checking existing session:', existingError);
    }

    if (existingSession) {
      console.log('[PointsManager] Found existing session:', existingSession);
      return existingSession;
    }

    console.log('[PointsManager] No existing session found, creating new one');

    // Create new session
    const { data: newSession, error } = await supabaseAdmin
      .from('anonymous_sessions')
      .insert({ ip_address: ipAddress })
      .select()
      .single();

    if (error) {
      console.error('[PointsManager] Error creating new session:', error);
      throw error;
    }

    console.log('[PointsManager] Successfully created new session:', newSession);
    return newSession;
  }

  static async getUserPoints(userId: string): Promise<UserPoints | null> {
    console.log('[PointsManager] Getting user points for:', userId);
    const { data: userPoints, error } = await supabaseAdmin
      .from('user_points')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    if (error) {
      console.log('[PointsManager] Error getting user points:', error);
    }

    console.log('[PointsManager] User points:', userPoints);
    return userPoints;
  }

  static async deductPoints(userId: string | null, sessionId: string | null, amount: number = 1): Promise<number> {
    console.log('[PointsManager] Deducting points for:', userId || sessionId);
    if (userId) {
      // Deduct from user points
      const { data: decrementedPoints, error: decrementError } = await supabaseAdmin.rpc('decrementpoints', { userid: userId, x: amount });
      if(decrementError) {
        console.error('[PointsManager] Error deducting points from user:', decrementError);
        throw decrementError;
      }
      console.log('[PointsManager] Successfully deducted points from user:', decrementedPoints);
      return decrementedPoints;
    } else if (sessionId) {
      const { data: decrementedPoints, error: decrementError } = await supabaseAdmin.rpc('decrement', { seesion_id: sessionId, x: amount });
      // Deduct from anonymous session
      if (decrementError) {
        console.error('[PointsManager] Error deducting points from session:', decrementError);
        throw decrementError;
      }
      console.log('[PointsManager] Successfully deducted points from session:', decrementedPoints);
      return decrementedPoints;
    }

    console.error('[PointsManager] Either userId or sessionId must be provided');
    throw new Error('Either userId or sessionId must be provided');
  }

  static async checkPointsAvailable(userId: string | null, sessionId: string | null): Promise<{ hasPoints: boolean; pointsBalance: number;shouldLogin:boolean }> {
    console.log('[PointsManager] Checking points for:', userId || sessionId);
    if (userId) {
      console.log('[PointsManager] Checking points for user:', userId);
      const userPoints = await this.getUserPoints(userId);
      console.log('[PointsManager] User points:', userPoints);
      return {
        hasPoints: userPoints?.points_remaining! > 0,
        pointsBalance: userPoints?.points_remaining || 0,
        shouldLogin:false
      };
    } else if (sessionId) {
      console.log('[PointsManager] Checking points for session:', sessionId);
      const { data: session, error } = await supabaseAdmin
        .from('anonymous_sessions')
        .select('points_remaining,status')
        .eq('id', sessionId)
        .single();

      if (error) {
        console.log('[PointsManager] Error checking session points:', error);
      }

      console.log('[PointsManager] Session points:', session);
      return {
        hasPoints: session?.points_remaining > 0,
        pointsBalance: session?.points_remaining || 0,
        shouldLogin:session?.status=='converted'?true:false
      };
    }

    console.error('[PointsManager] Either userId or sessionId must be provided');
    throw new Error('Either userId or sessionId must be provided');
  }

  static async convertAnonymousToUser(sessionId: string, userId: string): Promise<UserPoints> {
    console.log('[PointsManager] Converting anonymous session to user:', sessionId, userId);
    // Start transaction
    const { data: session, error } = await supabaseAdmin
      .from('anonymous_sessions')
      .select('points_remaining')
      .eq('id', sessionId)
      .single();

    if (error) {
      console.log('[PointsManager] Error getting session:', error);
    }

    if (!session) {
      console.error('[PointsManager] Session not found');
      throw new Error('Session not found');
    }

    console.log('[PointsManager] Session points:', session);

    // Create user points entry with bonus
    const { data: userPoints, error: userPointsError } = await supabaseAdmin
      .from('user_points')
      .insert({
        user_id: userId,
        points_remaining: session.points_remaining + 10, // Bonus points for signing up
        total_points_earned: session.points_remaining + 10
      })
      .select()
      .single();

    if (userPointsError) {
      console.error('[PointsManager] Error creating user points:', userPointsError);
      throw userPointsError;
    }

    console.log('[PointsManager] User points created:', userPoints);

    // Deactivate anonymous session
    await supabaseAdmin
      .from('anonymous_sessions')
      .update({ status: 'converted' })
      .eq('id', sessionId);

    console.log('[PointsManager] Session deactivated');
    return userPoints;
  }
}

import { supabaseAdmin } from './supabaseAdmin';
import type { AnonymousSession, UserPoints } from '@/types/points';

export class PointsManager {
  static async getOrCreateAnonymousSession(ipAddress: string): Promise<AnonymousSession> {
    // Check for existing active session
    const { data: existingSession } = await supabaseAdmin
      .from('anonymous_sessions')
      .select('*')
      .eq('ip_address', ipAddress)
      .eq('status', 'active')
      .single();

    if (existingSession) {
      return existingSession;
    }

    // Create new session
    const { data: newSession, error } = await supabaseAdmin
      .from('anonymous_sessions')
      .insert({ ip_address: ipAddress })
      .select()
      .single();

    if (error) throw error;
    return newSession;
  }

  static async getUserPoints(userId: string): Promise<UserPoints | null> {
    console.log('Getting user points for:', userId);
    const { data: userPoints } = await supabaseAdmin
      .from('user_points')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    return userPoints;
  }

  static async deductPoints(userId: string | null, sessionId: string | null, amount: number = 1): Promise<number> {
    if (userId) {
      // Deduct from user points
      const { data: userPoints, error } = await supabaseAdmin
        .from('user_points')
        .update({
          points_remaining: supabaseAdmin.rpc('decrement', { x:Number(amount) }),  
          last_generation: new Date().toISOString()
        })
        .eq('clerk_user_id', userId)
        .select('points_remaining')
        .single();

      if (error) throw error;
      return userPoints.points_remaining;
    } else if (sessionId) {
      const { data: decrementedPoints, error: decrementError } = await supabaseAdmin.rpc('decrement', { seesion_id: sessionId, x: amount });
      // Deduct from anonymous session
      if (decrementError) throw decrementError;
      return decrementedPoints;
    }

    throw new Error('Either userId or sessionId must be provided');
  }

  static async checkPointsAvailable(userId: string | null, sessionId: string | null): Promise<{ hasPoints: boolean; pointsBalance: number }> {
    if (userId) {
      console.log('Checking points for user:', userId);
      const userPoints = await this.getUserPoints(userId);
      return {
        hasPoints: userPoints?.points_remaining! > 0,
        pointsBalance: userPoints?.points_remaining || 0
      };
    } else if (sessionId) {
      const { data: session } = await supabaseAdmin
        .from('anonymous_sessions')
        .select('points_remaining')
        .eq('id', sessionId)
        .single();

      return {
        hasPoints: session?.points_remaining > 0,
        pointsBalance: session?.points_remaining || 0
      };
    }

    throw new Error('Either userId or sessionId must be provided');
  }

  static async convertAnonymousToUser(sessionId: string, userId: string): Promise<UserPoints> {
    // Start transaction
    const { data: session } = await supabaseAdmin
      .from('anonymous_sessions')
      .select('points_remaining')
      .eq('id', sessionId)
      .single();

    if (!session) throw new Error('Session not found');

    // Create user points entry with bonus
    const { data: userPoints, error } = await supabaseAdmin
      .from('user_points')
      .insert({
        user_id: userId,
        points_remaining: session.points_remaining + 10, // Bonus points for signing up
        total_points_earned: session.points_remaining + 10
      })
      .select()
      .single();

    if (error) throw error;

    // Deactivate anonymous session
    await supabaseAdmin
      .from('anonymous_sessions')
      .update({ status: 'converted' })
      .eq('id', sessionId);

    return userPoints;
  }
}

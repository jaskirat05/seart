"use client"
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

interface UsePointsProps {
  userId?: string;
  sessionId?: string;
}

interface PointsPayload {
  new: {
    points_remaining?: number;
    points?: number;
  };
}

export function usePoints({ userId, sessionId }: UsePointsProps) {
  const [points, setPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBonusModal, setShowBonusModal] = useState(false);

  useEffect(() => {
    console.log('usePoints effect triggered:', { userId, sessionId });
    
    if (!userId && !sessionId) {
      console.log('No userId or sessionId provided, resetting points');
      setPoints(null);
      setLoading(false);
      return;
    }

    // Initial fetch
    fetchPoints();

    // Set up real-time subscription
    console.log('Setting up real-time subscription for:', {
      type: userId ? 'user' : 'session',
      id: userId || sessionId
    });

    const channel = supabase
      .channel(userId ? userId: sessionId!)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: userId ? 'user_points' : 'anonymous_sessions',
          filter: userId 
            ? `clerk_user_id=eq.${userId}` 
            : `id=eq.${sessionId}`,
        },
        (payload: PointsPayload) => {
          console.log('Points update received:', {
            payload,
            source: userId ? 'user' : 'session',
            newPoints: payload.new.points_remaining
          });
          setPoints(payload.new.points_remaining!);
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up points subscription');
      channel.unsubscribe();
    };
  }, [userId, sessionId]);

  const fetchPoints = async () => {
    console.log('Fetching points for:', {
      type: userId ? 'user' : 'session',
      id: userId?userId: sessionId
    });
    try {
      setLoading(true);
      setError(null);

      if (userId) {
        // Fetch points for authenticated user
        const { data, error } = await supabase
          .from('user_points')
          .select('points_remaining, points_last_updated')
          .eq('clerk_user_id', userId)
          .single();

        if (error) throw error;

        const lastUpdated = data?.points_last_updated ? new Date(data.points_last_updated) : null;
        const now = new Date();
        const hoursSinceLastUpdate = lastUpdated 
          ? (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60)
          : null;

        if (hoursSinceLastUpdate === null || hoursSinceLastUpdate >= 24) {
          // Add 10 points and update the last updated timestamp
          const newPoints = (data?.points_remaining ?? 0) + 10;
          const { error: updateError } = await supabase
            .from('user_points')
            .update({ 
              points_remaining: newPoints,
              points_last_updated: now.toISOString()
            })
            .eq('clerk_user_id', userId);

          if (updateError) throw updateError;
          setPoints(newPoints);
          setShowBonusModal(true);
        } else {
          setPoints(data?.points_remaining ?? null);
        }
      } else if (sessionId) {
        // Fetch points for unauthenticated session
        const { data, error } = await supabase
          .from('anonymous_sessions')
          .select('points_remaining, points_last_updated')
          .eq('id', sessionId)
          .single();

        if (error) throw error;

        const lastUpdated = data?.points_last_updated ? new Date(data.points_last_updated) : null;
        const now = new Date();
        const hoursSinceLastUpdate = lastUpdated 
          ? (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60)
          : null;

        if (hoursSinceLastUpdate === null || hoursSinceLastUpdate >= 24) {
          // Add 10 points and update the last updated timestamp
          const newPoints = (data?.points_remaining ?? 0) + 10;
          const { error: updateError } = await supabase
            .from('anonymous_sessions')
            .update({ 
              points_remaining: newPoints,
              points_last_updated: now.toISOString()
            })
            .eq('id', sessionId);

          if (updateError) throw updateError;
          setPoints(newPoints);
          setShowBonusModal(true);
        } else {
          setPoints(data?.points_remaining ?? null);
        }
      }
    } catch (err) {
      console.error('Error fetching points:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch points');
      setPoints(null);
    } finally {
      setLoading(false);
    }
  };

  const updatePoints = async (newPoints: number) => {
    try {
      setError(null);
      
      if (userId) {
        const { error } = await supabase
          .from('user_points')
          .update({ points_remaining: newPoints })
          .eq('clerk_user_id', userId);

        if (error) throw error;
      } else if (sessionId) {
        const { error } = await supabase
          .from('anonymous_sessions')
          .update({ points_remaining: newPoints })
          .eq('id', sessionId);

        if (error) throw error;
      }
    } catch (err) {
      console.error('Error updating points:', err);
      setError(err instanceof Error ? err.message : 'Failed to update points');
    }
  };

  return {
    points,
    loading,
    error,
    refetchPoints: fetchPoints,
    updatePoints,
    showBonusModal,
    setShowBonusModal
  };
}

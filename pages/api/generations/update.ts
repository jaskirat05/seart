import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { supabase } from '@/utils/supabase';
import type { UpdateImageGeneration } from '@/types/database';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user or session ID
    const { userId } = getAuth(req);
    const sessionId = req.headers['x-session-id'] as string | undefined;

    if (!userId && !sessionId) {
      return res.status(401).json({ error: 'Unauthorized - No user or session ID' });
    }

    const { id } = req.query;
    if (!id || Array.isArray(id)) {
      return res.status(400).json({ error: 'Invalid generation ID' });
    }

    // Only allow updating these fields directly
    const updates: Partial<UpdateImageGeneration> = {};
    
    // Add only defined values
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.favorite !== undefined) updates.favorite = req.body.favorite;
    if (req.body.tags !== undefined) updates.tags = req.body.tags;

    // If no valid updates, return early
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid updates provided' });
    }

    const { data, error } = await supabase
      .from('image_generations')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId || sessionId!) // Check against both user ID and session ID
      .select()
      .single();

    if (error) {
      console.error('Error updating generation:', error);
      throw error;
    }
    
    if (!data) {
      return res.status(404).json({ error: 'Generation not found or not owned by user' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to update generation' });
  }
}

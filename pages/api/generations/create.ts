import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { supabase } from '@/utils/supabase';
import type { CreateImageGeneration } from '@/types/database';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const generation: CreateImageGeneration = {
      job_id: req.body.job_id,
      session_id:null,
      user_id: userId,
      prompt: req.body.prompt,
      name: req.body.name || null,
      favorite: false,
      model_settings: req.body.model_settings || null,
      tags: req.body.tags || null,
    };

    const { data, error } = await supabase
      .from('image_generations')
      .insert(generation)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error creating generation:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

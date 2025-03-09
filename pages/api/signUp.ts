import { NextApiRequest, NextApiResponse } from 'next';
import { Webhook } from 'svix';
import { auth, WebhookEvent } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/utils/supabaseAdmin';
import { clerkClient } from '@clerk/nextjs/server';
import {useUser} from '@clerk/nextjs';
export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!SIGNING_SECRET) {
    console.error('Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET);

  // Get headers
  const svix_id = req.headers['svix-id'] as string;
  const svix_timestamp = req.headers['svix-timestamp'] as string;
  const svix_signature = req.headers['svix-signature'] as string;

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Missing Svix headers' });
  }

  // Get body
  const body = JSON.stringify(req.body);

  let evt: WebhookEvent;

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error: Could not verify webhook:', err);
    return res.status(400).json({ error: 'Webhook verification failed' });
  }

  // Handle user.created event
  if (evt.type === 'user.updated') {
    const { id: clerkUserId } = evt.data;

    
    try {
      // Get session ID from cookie
      const {id:clerk_id,public_metadata}=evt.data
      const sessionId= public_metadata.session_id;
      //const sessionId=(await client.users.getUser(userId.userId!)).publicMetadata.session_id;
      

      const{data:user_points}=await supabaseAdmin
      .from('user_points')
      .select('*')
      .eq('clerk_user_id',clerkUserId)
      if (user_points && user_points.length > 0) {
        return res.status(200).json({
          message: 'User already exists',
          points: user_points[0].points_remaining,
        });
      }
      // Get active session if it exists
      const { data: session, error: sessionError } = await supabaseAdmin
        .from('anonymous_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('status', 'active')
        .single();

      if (sessionError && sessionError.code !== 'PGRST116') {
        console.error('Error fetching session:', sessionError);
        return res.status(500).json({ error: 'Failed to fetch session' });
      }

      // Calculate points
      const basePoints = 10;
      const sessionPoints = session.points_remaining ?? 0;
      const totalPoints = basePoints + sessionPoints;

      // Create user points record using session ID as user_id
      const { error: pointsError } = await supabaseAdmin
        .from('user_points')
        .insert({
          user_id: session.id, // Use session ID as user_id
          points_remaining: totalPoints,
          total_points_earned: totalPoints,
          clerk_user_id: clerkUserId
        });

      if (pointsError) {
        console.error('Error creating user points:', pointsError);
        return res.status(500).json({ error: 'Failed to create user points' });
      }

      // If there was an active session, mark it as converted
      if (session) {
        const { error: updateError } = await supabaseAdmin
          .from('anonymous_sessions')
          .update({
            status: 'active',
            points_remaining: 0,
            converted_user_id: clerkUserId, // Store Clerk's user ID here
          })
          .eq('id', session.id);

        if (updateError) {
          console.error('Error updating session:', updateError);
          return res.status(500).json({ error: 'Failed to update session' });
        }
      }

      console.log('Successfully processed user.created event:', {
        clerkUserId,
        sessionId,
        totalPoints,
        sessionConverted: !!session
      });

      return res.status(200).json({
        message: 'User created and points allocated successfully',
        points: totalPoints,
      });
    } catch (error) {
      console.error('Error processing user.created event:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Return 200 for other event types
  return res.status(200).json({ message: 'Webhook processed' });
}

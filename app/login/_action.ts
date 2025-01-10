'use server'

import { auth, clerkClient } from '@clerk/nextjs/server'
import {cookies} from 'next/headers';

// In-memory store for temporary session IDs
const sessionStore = new Map<string, string>();

export const storeSessionId = async () => {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('anon_session_id')?.value;

  

  return sessionId;
}



export const completeOnboarding = async(key:string) => {
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
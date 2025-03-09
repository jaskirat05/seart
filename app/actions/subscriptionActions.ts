'use server';

import { supabase } from '@/utils/supabase';
import { supabaseAdmin } from '@/utils/supabaseAdmin';
import { auth } from '@clerk/nextjs/server';
import { currentUser } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
/**
 * Process yearly subscription credit for a user
 * @param userId The Clerk user ID
 * @param pointsPerCredit The number of points to credit
 * @returns Object containing success status and updated points
 */
export async function processYearlyCredit(userID: string, pointsPerCredit: number) {
  try {
    // Get current user points from Supabase
    const { data, error } = await supabase
      .from('user_points')
      .select('points_remaining')
      .eq('clerk_user_id', userID)
      .single();
      
    if (error) throw error;
    
    // Calculate new points total
    const newPoints = (data?.points_remaining || 0) + pointsPerCredit;
    
    // Update points in Supabase
    const { error: updateError } = await supabase
      .from('user_points')
      .update({ 
        points_remaining: newPoints
      })
      .eq('clerk_user_id', userID);
    
    if (updateError) throw updateError;
    
    // Get user from Clerk to update metadata
     const client= await clerkClient();

    
    // Calculate next credit date (1 month from now)
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const update = await client.users.updateUser(userID, {
      publicMetadata: {
        next_points_credit: nextMonth.toISOString()
      }
    })
    // Update next_points_credit in Clerk metadata via Supabase
    // Since we can't directly update Clerk metadata from server actions,
    // we'll use Supabase to store the next credit date

  
    
    return { 
      success: true, 
      points: newPoints,
      nextCreditDate: nextMonth.toISOString()
    };
  } catch (error) {
    console.error('Error processing yearly subscription credit:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check if a user has an active subscription
 * @returns Subscription status information
 */
export async function checkSubscriptionStatus() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return {
        isSubscribed: false,
        subscriptionType: null,
        subscriptionEnd: null,
        nextPointsCredit: null
      };
    }
    
    const subscriptionType = user.publicMetadata.subscription_type as string | undefined;
    const subscriptionEnd = user.publicMetadata.subscription_end as string | undefined;
    const nextPointsCredit = user.publicMetadata.next_points_credit as string | undefined;
    
    if (!subscriptionType || !subscriptionEnd) {
      return {
        isSubscribed: false,
        subscriptionType: null,
        subscriptionEnd: null,
        nextPointsCredit: null
      };
    }
    
    // Check if subscription is still valid (not expired)
    const endDate = new Date(subscriptionEnd);
    const isValid = new Date() < endDate;
    
    return {
      isSubscribed: isValid,
      subscriptionType: subscriptionType as 'monthly' | 'yearly',
      subscriptionEnd,
      nextPointsCredit: nextPointsCredit || null
    };
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return {
      isSubscribed: false,
      subscriptionType: null,
      subscriptionEnd: null,
      nextPointsCredit: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

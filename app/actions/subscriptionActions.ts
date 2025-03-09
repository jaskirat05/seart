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
    const newPoints = (data?.points_remaining || 0) + Number(pointsPerCredit);
    
    // Update points in Supabase
    const { error: updateError } = await supabase
      .from('user_points')
      .update({ 
        points_remaining: newPoints
      })
      .eq('clerk_user_id', userID);
    
    if (updateError) throw updateError;
    
    // Get user from Clerk to update metadata
    const client = await clerkClient();
    const user = await client.users.getUser(userID);

    // Calculate next credit date (1 month from now)
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    // Only update next_points_credit if it will be less than subscription_end
    const subscriptionEnd = user.publicMetadata.subscription_end as string | undefined;
    
    if (subscriptionEnd) {
      const endDate = new Date(subscriptionEnd);
      
      // Only update if next credit date is before subscription end
      if (nextMonth < endDate) {
        // Update next_points_credit in Clerk while preserving all other metadata
        const update = await client.users.updateUser(userID, {
          publicMetadata: {
            ...user.publicMetadata,
            next_points_credit: nextMonth.toISOString()
          }
        });
      } else {
        const update = await client.users.updateUser(userID, {
          publicMetadata: {
            ...user.publicMetadata,
            next_points_credit: null
          }
        });
        console.log('Next credit date would be after subscription end, not updating');
      }
    }
    
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
        nextPointsCredit: null,
        isCancelled: false
      };
    }
    
    const subscriptionType = user.publicMetadata.subscription_type as string | undefined;
    const subscriptionEnd = user.publicMetadata.subscription_end as string | undefined;
    const nextPointsCredit = user.publicMetadata.next_points_credit as string | undefined;
    const isCancelled = !!user.publicMetadata.cancel_at_period_end;
    
    if (!subscriptionType || !subscriptionEnd) {
      return {
        isSubscribed: false,
        subscriptionType: null,
        subscriptionEnd: null,
        nextPointsCredit: null,
        isCancelled: false
      };
    }
    
    // Check if subscription is still valid (not expired)
    const endDate = new Date(subscriptionEnd);
    const isValid = new Date() < endDate;
    
    return {
      isSubscribed: isValid,
      subscriptionType: subscriptionType as 'monthly' | 'yearly',
      subscriptionEnd,
      nextPointsCredit: nextPointsCredit || null,
      isCancelled
    };
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return {
      isSubscribed: false,
      subscriptionType: null,
      subscriptionEnd: null,
      nextPointsCredit: null,
      isCancelled: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Cancel a user's subscription in Stripe and update Clerk metadata
 * @returns Object containing success status and message
 */
export async function cancelSubscription() {
  try {
    // Get the current user
    const user = await currentUser();
    
    if (!user) {
      return {
        success: false,
        message: 'User not authenticated'
      };
    }
    
    // Get the subscription ID from user metadata
    const stripeSubscriptionId = user.publicMetadata.stripe_subscription_id as string | undefined;
    
    if (!stripeSubscriptionId) {
      return {
        success: false,
        message: 'No active subscription found'
      };
    }
    
    // Get Stripe API key from environment variable
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not found in environment variables');
    }
    
    // Initialize Stripe
    const stripe = require('stripe')(stripeSecretKey);
    
    // Cancel the subscription in Stripe
    // This will cancel at period end, not immediately
    await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: true
    });
    
    // Get the Clerk client
    const clerk = await clerkClient();
    
    // Update user metadata to reflect cancellation status
    await clerk.users.updateUser(user.id, {
      publicMetadata: {
        ...user.publicMetadata,
        cancel_at_period_end: true
      }
    });
    
    return {
      success: true,
      message: 'Subscription cancelled successfully. You will have access until the end of your billing period.'
    };
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

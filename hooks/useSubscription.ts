'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { processYearlyCredit, checkSubscriptionStatus } from '@/app/actions/subscriptionActions';

interface SubscriptionInfo {
  isSubscribed: boolean;
  subscriptionType: 'monthly' | 'yearly' | null;
  subscriptionEnd: string | null;
  nextPointsCredit: string | null;
  isCancelled: boolean;
}

export function useSubscription() {
  const { user, isLoaded } = useUser();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo>({
    isSubscribed: false,
    subscriptionType: null,
    subscriptionEnd: null,
    nextPointsCredit: null,
    isCancelled: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    
    const checkSubscription = async () => {
      setLoading(true);
      
      if (!user) {
        setSubscriptionInfo({
          isSubscribed: false,
          subscriptionType: null,
          subscriptionEnd: null,
          nextPointsCredit: null,
          isCancelled: false
        });
        setLoading(false);
        return;
      }
      
      try {
        // Check Clerk publicMetadata for subscription info
        const subscriptionType = user.publicMetadata.subscription_type as string | undefined;
        const subscriptionEnd = user.publicMetadata.subscription_end as string | undefined;
        const nextPointsCredit = user.publicMetadata.next_points_credit as string | undefined;
        
        if (subscriptionType) {
          // Check if subscription is still valid (not expired)
          const endDate = subscriptionEnd ? new Date(subscriptionEnd) : null;
          const isValid = endDate ? new Date() < endDate : false;
          
          setSubscriptionInfo({
            isSubscribed: isValid,
            subscriptionType: subscriptionType as 'monthly' | 'yearly',
            subscriptionEnd: subscriptionEnd || null,
            nextPointsCredit: nextPointsCredit || null,
            isCancelled: !!user.publicMetadata.cancel_at_period_end
          });
        } else {
          // No subscription found in metadata
          setSubscriptionInfo({
            isSubscribed: false,
            subscriptionType: null,
            subscriptionEnd: null,
            nextPointsCredit: null,
            isCancelled: false
          });
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        // Reset subscription info on error
        setSubscriptionInfo({
          isSubscribed: false,
          subscriptionType: null,
          subscriptionEnd: null,
          nextPointsCredit: null,
          isCancelled: false
        });
      } finally {
        setLoading(false);
      }
    };
    
    checkSubscription();
  }, [user, isLoaded]);
  
  // Function to check if yearly subscription needs points credit today
  const checkYearlyCredit = async () => {
    if (!user || subscriptionInfo.subscriptionType !== 'yearly' || !subscriptionInfo.nextPointsCredit) {
      return false;
    }
    
    try {
      const nextCredit = new Date(subscriptionInfo.nextPointsCredit);
      const today = new Date();
      
      // Check if today is the day for credit (compare year, month, day)
      if (
        nextCredit.getFullYear() === today.getFullYear() &&
        nextCredit.getMonth() === today.getMonth() &&
        nextCredit.getDate() === today.getDate()
      ) {
        // It's time to credit points - use the server action
        const pointsPerCredit = user.publicMetadata.points_per_credit as number;
        
        if (!pointsPerCredit) return false;
        
        // Call the server action to process the credit
        const result = await processYearlyCredit(user.id, pointsPerCredit);
        
        if (result.success) {
          // Update local state with new next credit date
          setSubscriptionInfo({
            ...subscriptionInfo,
            nextPointsCredit: result.nextCreditDate || null
          });
          
          return true;
        }
      }
    } catch (error) {
      console.error('Error processing yearly subscription credit:', error);
    }
    
    return false;
  };

  // Function to refresh subscription status from server
  const refreshSubscription = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const status = await checkSubscriptionStatus();
      setSubscriptionInfo(status);
    } catch (error) {
      console.error('Error refreshing subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    ...subscriptionInfo,
    loading,
    checkYearlyCredit,
    refreshSubscription
  };
}

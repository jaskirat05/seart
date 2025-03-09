'use client';

import { useEffect } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';

/**
 * Component that checks for yearly subscription credits
 * This is a silent component with no UI that runs the credit check
 * when the app loads
 */
export default function SubscriptionCreditor() {
  const { checkYearlyCredit, subscriptionType, nextPointsCredit, loading } = useSubscription();

  useEffect(() => {
    // Only run this effect when the subscription data is loaded
    if (loading) return;

    // Only check for yearly subscription credits
    if (subscriptionType !== 'yearly' || !nextPointsCredit) return;

    const checkForCredits = async () => {
      try {
        const credited = await checkYearlyCredit();
        if (credited) {
          toast.success('Your yearly subscription points have been credited!', {
            description: 'Thank you for being a subscriber.',
            duration: 5000,
          });
        }
      } catch (error) {
        console.error('Error checking for yearly subscription credits:', error);
      }
    };

    checkForCredits();
  }, [checkYearlyCredit, subscriptionType, nextPointsCredit, loading]);

  // This component doesn't render anything
  return null;
}

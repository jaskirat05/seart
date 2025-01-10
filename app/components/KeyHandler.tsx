'use client';

import { useUser } from '@clerk/nextjs';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { completeOnboarding } from '../login/_action';

export function KeyHandler() {
  const { isLoaded, isSignedIn } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const key = searchParams?.get('key');

  useEffect(() => {
    async function handleKey() {
      if (key && isLoaded && isSignedIn && !isProcessing) {
        try {
          setIsProcessing(true);
          await completeOnboarding(key);
          
          // Remove key from URL and redirect
          const url = new URL(window.location.href);
          url.searchParams.delete('key');
          router.replace(url.pathname);
        } catch (error) {
          console.error('Error updating user:', error);
        } finally {
          setIsProcessing(false);
        }
      }
    }

    handleKey();
  }, [key, isLoaded, isSignedIn, router, isProcessing]);

  // Component doesn't render anything
  return null;
}

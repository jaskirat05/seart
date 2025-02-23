'use client';

import { Suspense, useEffect, useState } from 'react';
import { redirect, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { IoCheckmarkCircle } from 'react-icons/io5';

function Success() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(2);
  
  
  const sessionId = searchParams?.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      redirect('/');
      return;
    }

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionId, router]);

  return (
    
      

    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4 text-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="flex justify-center mb-6">
            <IoCheckmarkCircle className="text-green-500 text-6xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. Your points have been added to your account.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to home in {countdown} seconds...
          </p>
        </div>
      </div>
    </div>
  
  );
}
export default function SuccessPage(){
  return(
    <Suspense><Success /></Suspense>
  )
}
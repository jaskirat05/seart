'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';

export default function Page() {
  const searchParams = useSearchParams();
  const key = searchParams?.get('key') || '';

  return (
    <>
    <div id="clerk-captcha" />
    <AuthenticateWithRedirectCallback  />
    </>
  );
}
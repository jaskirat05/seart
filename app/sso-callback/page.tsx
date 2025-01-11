'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';

export default function Page() {
 

  return (
    <>
    <div id="clerk-captcha" />
    <AuthenticateWithRedirectCallback  />
    </>
  );
}
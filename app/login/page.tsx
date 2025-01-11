'use client';

import { useState } from 'react';

import Image from 'next/image';
import { FcGoogle } from 'react-icons/fc';
import { useSignIn, useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { storeSessionId } from './_action';
import Error from 'next/error';
;

type AuthMode = 'signin' | 'signup';

export default function AuthPage() {
  const { isLoaded: isSignInLoaded, signIn } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignInLoaded) return;

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive!({ session: result.createdSessionId });
        router.push("/");
      }
    } catch (err:any) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || 'An error occurred');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignUpLoaded) return;

    try {
      await signUp.create({
        emailAddress: email,
        password,
        username,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerifying(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || 'An error occurred');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignUpLoaded) return;

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (result.status === "complete") {
       const sessionId=await storeSessionId();
        
        await setActive({ session: result.createdSessionId });
       

        
        router.push("/");
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || 'An error occurred');
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left side - Branding */}
      <div className="hidden md:block w-1/2 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 opacity-90" />
        
        {/* Content overlay */}
        <div className="relative h-full flex flex-col items-center justify-center p-8">
          <div className="relative w-24 h-24 mb-6">
            <Image
              src="/seart-logo.svg"
              alt="Seart Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold text-white font-montserrat mb-4">
            Seart
          </h1>
          <p className="text-white/90 text-center text-lg max-w-md">
            Unleash your creativity with AI-powered image generation
          </p>
        </div>
      </div>

      {/* Right side - Auth Forms */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 md:p-8 bg-gray-50">
        {/* Mode Toggle */}
        <div className="flex p-1 bg-gray-200 rounded-full mb-8">
          <button
            onClick={() => setMode('signin')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              mode === 'signin'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              mode === 'signup'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Auth Forms */}
        <div className="w-full max-w-md">
          {mode === 'signin' ? (
            <form className="space-y-4" onSubmit={handleSignIn}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-2 px-4 bg-accent-red hover:bg-accent-red/90 text-white rounded-lg font-medium transition-colors"
              >
                Sign In
              </button>
            </form>
          ) : verifying ? (
            <form className="space-y-4" onSubmit={handleVerify}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter verification code"
                />
                 
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-accent-red hover:bg-accent-red/90 text-white rounded-lg font-medium transition-colors"
              >
                Verify
              </button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleSignUp}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Choose a password"
                />
                
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-accent-red hover:bg-accent-red/90 text-white rounded-lg font-medium transition-colors"
              >
                Sign Up
              </button>
            </form>
          )}

          {/* Google Auth Button */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <button 
              onClick={async () => {
                try {
                 

                  if (mode === 'signin') {
                    signIn?.authenticateWithRedirect({
                      strategy: "oauth_google",
                      redirectUrl:"/sso-callback",
                      redirectUrlComplete: `/`
                    });
                  } else {
                    signUp?.authenticateWithRedirect({
                      strategy: "oauth_google",
                      redirectUrl:"/sso-callback",
                      redirectUrlComplete: `/`
                    });
                  }
                } catch (error) {
                  console.error('Error in OAuth flow:', error);
                  setError('Failed to start OAuth flow');
                }
              }}
              type="button"
              className="mt-4 w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FcGoogle className="w-5 h-5" />
              <span className="text-gray-700">
                {mode === 'signin' ? 'Sign in' : 'Sign up'} with Google
              </span>
            </button>
          </div>
        </div>
      </div>
      <div id="clerk-captcha" /> 
    </div>
  );
}

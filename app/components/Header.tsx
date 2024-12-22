"use client"
import { useState } from 'react';
import Link from 'next/link';
import Drawer from './Drawer';
import { SignInButton, SignUpButton, UserButton, useUser,useAuth } from '@clerk/nextjs';
import { auth} from '@clerk/nextjs/server'
import { cookies } from 'next/headers'
import { usePoints } from '@/hooks/usePoints';
interface HeaderProps{
  sessionId?:string | null  
  userId?:string | null 
}
const Header =  ({sessionId ,userId}:HeaderProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { isSignedIn } = useUser();
  const {points,loading,error,refetchPoints,updatePoints} = usePoints({userId:userId?userId:undefined,  sessionId: sessionId?sessionId:undefined });  
  
  return (
    <header className="w-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] fixed top-0 z-40">
      <div className="w-full h-[60px]">
        <div className="flex justify-between items-center h-full px-4 sm:px-8 md:px-16 lg:px-[120px] relative">
          {/* Logo and Website Name */}
          <div className="flex items-center">
            <span className="material-symbols-outlined text-black">
              animated_images
            </span>
            <span className="ml-2 text-lg font-bold text-black">
              Hell&apos;s kitchen
            </span>
          </div>

          {/* Points Display - Centered */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3">
            <div className="flex items-center">
              <span className="material-symbols-outlined text-[#FFA41D] text-xs">
                battery_charging_full
              </span>
              <span className="ml-1 text-xs font-medium text-black">{points}</span>
            </div>
            <button className="text-[#FFA41D] text-xs font-medium hover:text-opacity-80 transition-colors">
              Upgrade
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/pricing" 
              className="text-black hover:text-[#DE3C4B] transition-colors flex items-center text-lg"
            >
              Pricing
            </Link>
            {isSignedIn ? (
              <UserButton />
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="text-black hover:text-[#DE3C4B] transition-colors flex items-center text-lg">
                    Login
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-[#FFA41D] text-white px-4 py-2 flex items-center justify-center text-lg rounded-lg hover:bg-opacity-90 transition-colors">
                    Sign Up
                  </button>
                </SignUpButton>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-black"
            onClick={() => setIsDrawerOpen(true)}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <div className="flex flex-col space-y-4">
          <Link href="/pricing" className="text-black hover:text-[#DE3C4B] transition-colors">
            Pricing
          </Link>
          {isSignedIn ? (
            <UserButton />
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="text-black hover:text-[#DE3C4B] transition-colors">
                  Login
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-[#FFA41D] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors">
                  Sign Up
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </Drawer>
    </header>
  );
};

export default Header;

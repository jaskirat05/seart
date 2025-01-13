"use client"
import { useState } from 'react';
import Link from 'next/link';
import Drawer from './Drawer';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { usePoints } from '@/hooks/usePoints';
import { usePathname, useRouter } from 'next/navigation';

interface HeaderProps {
  sessionId?: string | null;
  userId?: string | null;
}

const Header = ({ sessionId, userId }: HeaderProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { isSignedIn } = useUser();
  const { points, loading, error, refetchPoints, updatePoints } = usePoints({ userId: userId ? userId : undefined, sessionId: sessionId ? sessionId : undefined });
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <header className="w-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] fixed top-0 z-40">
      <div className="w-full h-[60px]">
        <div className="flex justify-between items-center h-full px-4 sm:px-8 md:px-16 lg:px-[120px] relative">
          {/* Logo and Website Name */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsDrawerOpen(true)}
                className="md:hidden text-black hover:text-gray-600 transition-colors"
              >
                <span className="material-symbols-outlined">
                  menu
                </span>
              </button>
              <div className="ml-4 flex items-center">
                <span className="material-symbols-outlined text-black">
                  animated_images
                </span>
                <span className="ml-2 text-lg font-bold text-black hidden md:inline">
                  Hell&apos;s kitchen
                </span>
              </div>
            </div>
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
              <div className="flex items-center space-x-8">
                <Link href="/settings" className="text-black hover:text-[#DE3C4B] transition-colors flex items-center text-lg">
                  Settings
                </Link>
                <Link href="/history" className="text-black hover:text-[#DE3C4B] transition-colors flex items-center text-lg">
                  Gallery
                </Link>
                <UserButton />
              </div>
            ) : (
              <>
                <Link href="/settings" className="text-black hover:text-[#DE3C4B] transition-colors">
                  <span className="material-symbols-outlined !text-[18px] scale-75">settings</span>
                </Link>
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

          {/* Mobile Drawer */}
          <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
            <div className="flex flex-col items-center space-y-6">
              {/* Website Name in Drawer */}
              <div className="flex items-center mb-6">
                <span className="material-symbols-outlined text-black text-2xl">
                  animated_images
                </span>
                <span className="ml-2 text-xl font-bold text-black">
                  Hell&apos;s kitchen
                </span>
              </div>

              {/* Mobile Points Display */}
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-[#FFA41D]">
                    battery_charging_full
                  </span>
                  <span className="ml-1 font-medium text-black">{points}</span>
                </div>
                <button className="text-[#FFA41D] font-medium hover:text-opacity-80 transition-colors">
                  Upgrade
                </button>
              </div>

              <div 
                onClick={() => handleNavigation('/pricing')}
                className={`cursor-pointer transition-all flex items-center gap-2 px-4 py-2 rounded-lg ${
                  pathname === '/pricing' 
                    ? 'bg-gradient-to-r from-[#FFD700] to-[#FF6B6B] text-white' 
                    : 'text-black hover:text-[#DE3C4B]'
                }`}
              >
                <span className={`material-symbols-outlined !text-[18px] scale-75 ${
                  pathname === '/pricing' ? 'text-white' : ''
                }`}>
                  payments
                </span>
                <span className="text-lg">Pricing</span>
              </div>

              <div
                onClick={() => handleNavigation('/settings')}
                className={`cursor-pointer transition-all flex items-center gap-2 px-4 py-2 rounded-lg ${
                  pathname === '/settings'
                    ? 'bg-gradient-to-r from-[#FFD700] to-[#FF6B6B] text-white'
                    : 'text-black hover:text-[#DE3C4B]'
                }`}
              >
                <span className={`material-symbols-outlined !text-[18px] scale-75 ${
                  pathname === '/settings' ? 'text-white' : ''
                }`}>
                  settings
                </span>
                <span className="text-md">Settings</span>
              </div>

              <div
                onClick={() => handleNavigation('/history')}
                className={`cursor-pointer transition-all flex items-center gap-2 px-4 py-2 rounded-lg ${
                  pathname === '/history'
                    ? 'bg-gradient-to-r from-[#FFD700] to-[#FF6B6B] text-white'
                    : 'text-black hover:text-[#DE3C4B]'
                }`}
              >
                <span className={`material-symbols-outlined !text-[18px] scale-75 ${
                  pathname === '/history' ? 'text-white' : ''
                }`}>
                  photo_library
                </span>
                <span className="text-md">Gallery</span>
              </div>

              {!isSignedIn ? (
                <>
                  <SignInButton>
                    <button className="text-black hover:text-[#DE3C4B] transition-colors text-lg">
                      Login
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button className="bg-[#FFA41D] text-white px-6 py-2 rounded-xl hover:bg-opacity-90 transition-colors text-lg">
                      Sign Up
                    </button>
                  </SignUpButton>
                </>
              ) : (
                <UserButton afterSignOutUrl="/" />
              )}
            </div>
          </Drawer>
        </div>
      </div>
    </header>
  );
};

export default Header;

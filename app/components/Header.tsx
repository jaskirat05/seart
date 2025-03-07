'use client';

import { useState, useEffect } from 'react';
import Drawer from './Drawer';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { usePoints } from '@/hooks/usePoints';
import { IoLeaf } from "react-icons/io5";
import Link from 'next/link';
import BonusPointsModal from './BonusPointsModal';
import RecentGenerations from './RecentGenerations';
import PointsPackModal from './PointsPackModal';

interface HeaderProps {
  sessionId?: string | null;
  userId?: string | null;
  points?: number;
  loading?: boolean;
  recentGenerations?: Array<{
    id: string;
    imageUrl: string;
    prompt: string;
    createdAt: string;
  }>;
}

const Header = ({ sessionId, userId, points = 0, loading = false, recentGenerations = [] }: HeaderProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showPointsWarning, setShowPointsWarning] = useState(false);
  const [showBonusPointsModal, setShowBonusPointsModal] = useState(false);
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);
  const { isSignedIn } = useUser();
  const { points: userPoints, loading: userLoading, refetchPoints } = usePoints({ 
    userId: userId ? userId : undefined, 
    sessionId: sessionId ? sessionId : undefined 
  });

  useEffect(() => {
    
    if (!userLoading && userPoints === 0) {
      setShowPointsWarning(true);
    }
  }, [userPoints, userLoading]);

  return (
    <header className="w-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] fixed top-0 z-40">
      <div className="w-full h-[60px]">
        <div className="flex items-center justify-between h-full px-4 sm:px-8 md:px-16 lg:px-[120px] relative">
          {/* Left Section: Logo */}
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
              <Link href="/" className="ml-2 text-lg font-bold text-black hover:opacity-80 transition-opacity hidden md:inline">
                Hell&apos;s kitchen
              </Link>
            </div>
          </div>

          {/* Center Section: Points Display (Desktop) */}
          <div className="hidden md:flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <IoLeaf className="text-[#FFA41D] text-xl" />
              <span className="text-lg font-medium">
                {userLoading ? "..." : userPoints} 
              </span>
              <button
                onClick={() => setIsPointsModalOpen(true)}
                className="w-6 h-6 rounded-full bg-[#FFA41D] hover:bg-[#FFA41D]/90 transition-colors flex items-center justify-center"
              >
                <span className="text-white text-sm font-bold leading-none">+</span>
              </button>
            </div>
            <Link href="/pricing" className="px-4 py-2 rounded-lg text-white bg-[#FFA41D] hover:bg-opacity-80 hover:text-white/80 transition-colors">
              Upgrade
            </Link>
          </div>

          {/* Right Section: Navigation */}
          <div className="flex items-center space-x-4">
            <Link href="/settings" className="inline-flex px-4 py-2 rounded-lg text-white bg-[#FFA41D] hover:bg-opacity-80 hover:text-white/80 transition-colors">
              Create
            </Link>
            {/* Auth buttons - only show on desktop */}
            <div className="hidden md:flex items-center space-x-4">
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
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        {/* Website Name in Drawer */}
        <div className="p-6 bg-white border-b border-gray-100">
          <div className="flex items-center">
            <span className="material-symbols-outlined text-[#FFA41D] text-2xl">
              animated_images
            </span>
            <Link href="/" className="ml-2 text-xl font-bold text-black hover:opacity-80 transition-opacity">
              Hell&apos;s kitchen
            </Link>
          </div>
        </div>

        {/* Points Display Container in Mobile Drawer */}
        <div className="mx-6 mt-6 mb-8 p-6 bg-[#FFA41D] rounded-3xl shadow-lg">
          <div className="flex flex-col items-center">
            <span className="text-white text-sm font-medium mb-2">Available Points</span>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-white text-3xl">
                stars
              </span>
              <span className="text-3xl font-bold text-white">
                {userLoading ? "..." : userPoints}
              </span>
              <button
                onClick={() => {
                  setIsPointsModalOpen(true);
                  setIsDrawerOpen(false);
                }}
                className="w-8 h-8 rounded-full bg-white hover:bg-white/90 transition-colors flex items-center justify-center"
              >
                <span className="text-[#FFA41D] text-xl font-bold leading-none">+</span>
              </button>
            </div>
            <Link
              href="/pricing"
              onClick={() => setIsDrawerOpen(false)}
              className="w-full py-2 bg-white text-[#FFA41D] rounded-xl text-center font-medium hover:bg-white/90 transition-colors"
            >
              Upgrade Plan
            </Link>
          </div>
        </div>

        {/* Recent Generations */}
        <div className="px-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Recent Generations</h3>
          <RecentGenerations 
            userId={userId || undefined} 
            sessionId={sessionId || undefined} 
          />
        </div>

        {/* Auth Buttons */}
        <div className="px-6 mt-6 pb-6">
          {isSignedIn ? (
            <div className="flex justify-center">
              <UserButton afterSignOutUrl="/" />
            </div>
          ) : (
            <div className="space-y-3">
              <SignInButton mode="modal">
                <button 
                  className="w-full py-2.5 text-[#FFA41D] border-2 border-[#FFA41D] rounded-xl font-medium hover:bg-[#FFA41D]/5 transition-colors"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  Login
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button 
                  className="w-full py-2.5 bg-[#FFA41D] text-white rounded-xl font-medium hover:bg-[#FFA41D]/90 transition-colors"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          )}
        </div>
      </Drawer>

      {/* Points Warning Modal */}
      {showPointsWarning && (
        <div className="fixed bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-start mb-4">
            <span className="material-symbols-outlined text-[#FFA41D] text-xl mr-3">
              warning
            </span>
            <div>
              <h3 className="text-lg font-semibold mb-1">Low on Points</h3>
              <p className="text-gray-600">
                You&apos;re running low on points. Get more points to continue creating amazing images!
              </p>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowPointsWarning(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Later
            </button>
            <button
              onClick={() => {
                setShowPointsWarning(false);
                setIsPointsModalOpen(true);
              }}
              className="px-4 py-2 bg-[#FFA41D] text-white rounded-lg hover:bg-opacity-80 transition-colors"
            >
              Get Points
            </button>
          </div>
        </div>
      )}

      {/* Points Pack Modal */}
      <PointsPackModal 
        isOpen={isPointsModalOpen}
        onClose={() => setIsPointsModalOpen(false)}
      />

      {/* Bonus Points Modal */}
      <BonusPointsModal 
        isOpen={showBonusPointsModal}
        onClose={() => setShowBonusPointsModal(false)}
      />
    </header>
  );
};

export default Header;

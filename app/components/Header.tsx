"use client"
import { useState, useEffect } from 'react';
import Drawer from './Drawer';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { usePoints } from '@/hooks/usePoints';
import { IoLeaf } from "react-icons/io5";
import { useRouter } from 'next/router';
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
  const { isSignedIn, isLoaded } = useUser();
  const { points: userPoints, loading: userLoading, refetchPoints, showBonusModal, setShowBonusModal } = usePoints({ 
    userId: userId ? userId : undefined, 
    sessionId: sessionId ? sessionId : undefined 
  });

  // Fetch points immediately when component mounts or auth state changes
  useEffect(() => {
    if (isLoaded && (userId || sessionId)) {
      refetchPoints();
    }
  }, [isLoaded, userId, sessionId]);

  useEffect(() => {
    if (!userLoading && userPoints === 0) {
      setShowPointsWarning(true);
    }
  }, [userPoints, userLoading]);

  console.log("Hey I am the header",userId)
  console.log(sessionId)

  return (
    <header className="w-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] fixed top-0 z-40">
      <div className="w-full h-[60px]">
        <div className="grid grid-cols-3 items-center h-full px-4 sm:px-8 md:px-16 lg:px-[120px] relative">
          {/* Logo */}
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

          {/* Points Display (Desktop) */}
          <div className="hidden md:flex items-center justify-center space-x-2">
            <IoLeaf className="text-[#FFA41D] text-xl" />
            <span className="text-lg font-medium">
              {userLoading ? "..." : userPoints} 
            </span>
            <button
              onClick={() => setIsPointsModalOpen(true)}
              className="flex items-center justify-center w-4 h-4 rounded-full bg-[#FFA41D] hover:bg-[#FFA41D]/90 transition-colors"
            >
              <span className="text-white text-xs font-bold leading-none mb-0.5">+</span>
            </button>
            <span>
              <Link href="/pricing" className="px-4 py-2 rounded-lg text-white bg-[#FFA41D] hover:bg-opacity-80 hover:text-white/80 transition-colors">
                Upgrade
              </Link>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="flex items-center justify-end md:space-x-4">
            <Link href="/settings" className="hidden md:inline-flex px-4 py-2 rounded-lg text-white bg-[#FFA41D] hover:bg-opacity-80 hover:text-white/80 transition-colors">
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

            {/* Points Display Container */}
            <div className="mx-6 mt-6 mb-8 p-6 bg-[#FFA41D] rounded-3xl shadow-lg">
              <div className="flex flex-col items-center">
                <span className="text-white text-sm font-medium mb-2">Available Points</span>
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-green-400 text-3xl">
                    stars
                  </span>
                  <span className="text-3xl font-bold text-green-400">
                    {userLoading ? "..." : userPoints}
                  </span>
                </div>
                <Link
                  href="/pricing"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full py-2.5 bg-white text-[#FFA41D] rounded-xl font-medium hover:bg-white/90 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">
                    add_circle
                  </span>
                  Get More Points
                </Link>
              </div>
            </div>

            {/* Recent Generations */}
            <RecentGenerations userId={userId || undefined} sessionId={sessionId || undefined} />

            {/* Navigation Links */}
            <div className="px-6 space-y-4 mb-6">
              <Link
                href="/settings"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                onClick={() => setIsDrawerOpen(false)}
              >
                <span className="material-symbols-outlined">
                  history
                </span>
                <span>History</span>
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="px-6 pb-6">
              {isSignedIn ? (
                <div className="flex justify-center">
                  <UserButton />
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
                      className="w-full py-2.5 bg-[#FFA41D] text-white rounded-xl font-medium hover:bg-[#FF9100] transition-colors"
                      onClick={() => setIsDrawerOpen(false)}
                    >
                      Sign Up
                    </button>
                  </SignUpButton>
                </div>
              )}
            </div>
          </Drawer>
        </div>
      </div>

      {/* Points Warning Modal */}
      {showPointsWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-2">No Points Available</h3>
            <p className="text-gray-600 mb-4">
              You exhausted your energy, but good news! We have exclusive discounts for you
            </p>
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
                View Offers
              </button>
            </div>
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

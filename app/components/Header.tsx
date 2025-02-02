"use client"
import { useState, useEffect } from 'react';
import Drawer from './Drawer';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { usePoints } from '@/hooks/usePoints';
import { IoLeaf } from "react-icons/io5";
import { useRouter } from 'next/router';
import Link from 'next/link';

interface HeaderProps {
  sessionId?: string | null;
  userId?: string | null;
}

const Header = ({ sessionId, userId }: HeaderProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showPointsWarning, setShowPointsWarning] = useState(false);
  const { isSignedIn } = useUser();
  console.log("Hey I am the header",userId)
  console.log(sessionId)
  const { points, loading } = usePoints({ userId: userId ? userId : undefined, sessionId: sessionId ? sessionId : undefined });

  useEffect(() => {
    if (!loading && points === 0) {
      setShowPointsWarning(true);
    }
  }, [points, loading]);

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
              {loading ? "..." : points}
            </span>
            <span>
              <Link href="/pricing" className="ml-2 px-4 py-2 rounded-lg text-white bg-[#FFA41D] hover:bg-opacity-80 hover:text-white/80 transition-colors">
                recharge
              </Link>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="flex items-center justify-end space-x-8">
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

          {/* Mobile Drawer */}
          <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
            <div className="flex flex-col items-center space-y-6">
              {/* Website Name in Drawer */}
              <div className="flex items-center mb-6">
                <span className="material-symbols-outlined text-black text-2xl">
                  animated_images
                </span>
                
                <Link href="/" className="ml-2 text-xl font-bold text-black hover:opacity-80 transition-opacity">
                  Hell&apos;s kitchen
                </Link>
                
              </div>

              {/* Points Display in Drawer */}
              <div className="flex items-center space-x-2">
                <IoLeaf className="text-[#FFA41D] text-xl" />
                <span className="text-lg font-medium">
                  {loading ? "..." : points}
                </span>
              </div>

              {/* Auth Buttons */}
              {isSignedIn ? (
                <div className="mt-4">
                  <UserButton />
                </div>
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
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
              <Link
                href="/pricing"
                className="px-4 py-2 bg-[#FFA41D] text-white rounded-lg hover:bg-opacity-80"
                onClick={() => setShowPointsWarning(false)}
              >
                Get More Points
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

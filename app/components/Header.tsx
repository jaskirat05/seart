"use client"
import { useState } from 'react';
import Link from 'next/link';
import Drawer from './Drawer';

const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <header className="w-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] fixed top-0 z-40">
      <div className="w-full h-[100px] md:h-[155px]">
        <div className="flex justify-between items-center h-full px-4 sm:px-8 md:px-16 lg:px-[120px]">
          {/* Logo and Website Name */}
          <div className="flex items-center">
            <span className="material-symbols-outlined text-black">
              animated_images
            </span>
            <span className="ml-2 md:ml-4 text-lg md:text-2xl font-bold text-black">
              Hell&apos;s kitchen
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/pricing" 
              className="text-black hover:text-[#DE3C4B] transition-colors flex items-center text-2xl"
            >
              Pricing
            </Link>
            <Link 
              href="/login" 
              className="text-black hover:text-[#DE3C4B] transition-colors flex items-center text-2xl"
            >
              Login
            </Link>
            <Link 
              href="/upgrade" 
              className="bg-[#FFA41D] text-white p-10 h-[1.5vh] flex items-center justify-center text-2xl rounded-xl hover:bg-opacity-90 transition-colors min-w-[150px]"
            >
              Upgrade
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="material-symbols-outlined text-black"
            >
              menu
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <Drawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </header>
  );
};

export default Header;

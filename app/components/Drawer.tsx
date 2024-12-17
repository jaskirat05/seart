"use client"
import { useEffect } from 'react';
import Link from 'next/link';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const Drawer = ({ isOpen, onClose }: DrawerProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity md:hidden"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed right-0 top-0 h-full w-[250px] bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 flex justify-end">
            <button 
              onClick={onClose}
              className="material-symbols-outlined text-black"
            >
              close
            </button>
          </div>
          
          <nav className="flex flex-col items-center pt-8 space-y-8">
            <Link 
              href="/pricing" 
              className="text-black hover:text-[#DE3C4B] transition-colors text-xl font-medium"
              onClick={onClose}
            >
              Pricing
            </Link>
            <Link 
              href="/login" 
              className="text-black hover:text-[#DE3C4B] transition-colors text-xl font-medium"
              onClick={onClose}
            >
              Login
            </Link>
            <Link 
              href="/upgrade" 
              className="bg-[#FFA41D] text-white px-8 py-3 rounded-xl hover:bg-opacity-90 transition-colors text-xl font-medium text-center"
              onClick={onClose}
            >
              Upgrade
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Drawer;

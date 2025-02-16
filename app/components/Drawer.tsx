"use client"
import { useEffect } from 'react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Drawer = ({ isOpen, onClose, children }: DrawerProps) => {
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
      <div className="fixed left-0 top-0 h-full w-[250px] bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden overflow-hidden flex flex-col">
        {/* Close Button */}
        <div className="p-4 flex justify-end bg-white sticky top-0 z-10 border-b border-gray-100">
          <button 
            onClick={onClose}
            className="material-symbols-outlined text-gray-500 hover:text-gray-700"
          >
            close
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  );
};

export default Drawer;

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-gray-50 shadow-sm border-t border-gray-100 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center space-y-6">
          {/* Website Name and Logo */}
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-[#FFA41D] text-2xl">
              animated_images
            </span>
            <Link 
              href="https://hellsk.com" 
              className="text-lg font-bold hover:text-[#FFA41D] transition-colors"
            >
              hellsk.com
            </Link>
          </div>

          {/* Company Info and Links Row */}
          <div className="flex flex-col md:flex-row items-center w-full justify-between md:space-x-8 space-y-4 md:space-y-0">
            <div className="text-lg font-bold text-center md:text-left">
              Evo Growth LLC
            </div>

            <div className="flex flex-wrap justify-center items-center gap-4 text-sm">
              <Link 
                href="/legal-notice" 
                className="hover:text-[#FFA41D] transition-colors"
              >
                Legal Notice
              </Link>
              <span className="text-gray-300 hidden md:inline">|</span>
              <Link 
                href="/dmca" 
                className="hover:text-[#FFA41D] transition-colors"
              >
                DMCA
              </Link>
              <span className="text-gray-300 hidden md:inline">|</span>
              <Link 
                href="/terms" 
                className="hover:text-[#FFA41D] transition-colors"
              >
                Terms of Service
              </Link>
              <span className="text-gray-300 hidden md:inline">|</span>
              <Link 
                href="/cookie-policy" 
                className="hover:text-[#FFA41D] transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>

          {/* Copyright Notice */}
          <div className="text-sm text-gray-500 text-center">
            2025 Evo Growth LLC. All Rights Reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

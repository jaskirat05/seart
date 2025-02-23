'use client';

import { useState, useEffect } from 'react';
import { pointsPacks } from '@/constants/pointsPacks';
import PointsPackCarousel from './PointsPackCarousel';

interface PointsPackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PointsPackModal({ isOpen, onClose }: PointsPackModalProps) {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
    } else {
      const timer = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !mounted) return null;

  const handlePurchase = async (points: number, price: number) => {
    try {
      setLoading(true);
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          points,
          amount: price * 100,
          mode: 'payment',
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className={`fixed inset-0 bg-black transition-opacity duration-200 z-50 ${
        isOpen ? 'bg-opacity-50' : 'bg-opacity-0'
      } ${!isOpen && 'pointer-events-none'}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className={`fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center p-4 transition-all duration-200 ${
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 md:translate-y-0 md:scale-95'
        }`}
      >
        <div className="bg-white rounded-t-[32px] md:rounded-lg shadow-xl w-full max-w-4xl mx-auto">
          <div className="h-1.5 w-12 bg-gray-300 rounded-full mx-auto mt-3 mb-2 md:hidden" />
          
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Get More Points</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Mobile: Carousel View */}
            <div className="md:hidden">
              <PointsPackCarousel onPurchase={handlePurchase} loading={loading} />
            </div>

            {/* Desktop: Grid View */}
            <div className="hidden md:grid grid-cols-4 gap-4">
              {pointsPacks.map((pack, index) => (
                <div
                  key={pack.id}
                  className={`p-6 rounded-xl ${
                    index === 1 
                      ? 'bg-gradient-to-br from-[#FFA41D] to-[#FF8C00] text-white' 
                      : 'bg-gray-50'
                  }`}
                >
                  {pack.savings && (
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${
                      index === 1 
                        ? 'bg-white/20 text-white' 
                        : 'bg-[#FFA41D]/20 text-[#FFA41D]'
                    }`}>
                      {pack.savings}
                    </div>
                  )}
                  <div className={`text-4xl font-bold mb-2 ${index === 1 ? 'text-white' : 'text-gray-900'}`}>
                    {pack.points.toLocaleString()}
                  </div>
                  <div className={index === 1 ? 'text-white/80' : 'text-gray-500'}>
                    Points
                  </div>
                  <div className={`text-3xl font-bold my-4 ${index === 1 ? 'text-white' : 'text-gray-900'}`}>
                    ${pack.price}
                  </div>
                  <button
                    onClick={() => handlePurchase(pack.points, pack.price)}
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
                      index === 1
                        ? 'bg-white text-[#FFA41D] hover:bg-white/90'
                        : 'bg-[#FFA41D] text-white hover:bg-[#FFA41D]/90'
                    } disabled:opacity-50`}
                  >
                    {loading ? 'Processing...' : 'Get Points'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

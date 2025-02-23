'use client';

import { useState, useEffect } from 'react';

interface PointsPack {
  id: string;
  points: number;
  price: number;
  savings?: string;
}

const pointsPacks: PointsPack[] = [
  {
    id: 'starter',
    points: 10000,
    price: 10,
  },
  {
    id: 'popular',
    points: 45000,
    price: 45,
    savings: 'Save 10%',
  },
  {
    id: 'pro',
    points: 95000,
    price: 75,
    savings: 'Save 25%',
  },
  {
    id: 'enterprise',
    points: 300000,
    price: 150,
    savings: 'Save 50%',
  },
];

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

  const handlePurchase = async (pack: PointsPack) => {
    try {
      setLoading(true);
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          points: pack.points,
          amount: pack.price * 100, // Convert to cents
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
    >
      <div 
        className={`fixed inset-0 flex items-center justify-center p-4 transition-all duration-200 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4">
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#FFA41D] bg-opacity-20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#FFA41D] text-2xl">
                    redeem
                  </span>
                </div>
                <h3 className="text-2xl font-medium">Choose Your Points Pack</h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="material-symbols-outlined">
                  close
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pointsPacks.map((pack) => (
                <div
                  key={pack.id}
                  className="relative rounded-lg border-2 border-gray-200 p-6 hover:border-[#FFA41D] transition-colors"
                >
                  {pack.savings && (
                    <span className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2">
                      <span className="inline-flex rounded-full bg-[#FFA41D] px-4 py-1 text-sm font-semibold text-white">
                        {pack.savings}
                      </span>
                    </span>
                  )}
                  
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {pack.points.toLocaleString()}
                    </div>
                    <div className="text-gray-500 mb-4">Energy Points</div>
                    <div className="text-3xl font-bold text-gray-900 mb-6">
                      ${pack.price}
                    </div>
                    <button
                      onClick={() => handlePurchase(pack)}
                      disabled={loading}
                      className="w-full py-2 px-4 rounded-md bg-[#FFA41D] text-white font-medium hover:bg-[#FFA41D]/90 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Purchase'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

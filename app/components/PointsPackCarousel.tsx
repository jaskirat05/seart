'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { pointsPacks } from '@/constants/pointsPacks';

interface PointsPackCarouselProps {
  onPurchase: (points: number, price: number) => Promise<void>;
  loading: boolean;
}

export default function PointsPackCarousel({ onPurchase, loading }: PointsPackCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Prevent page scroll when touching carousel
  useEffect(() => {
    const preventDefault = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', preventDefault, { passive: false });
    return () => {
      document.removeEventListener('touchmove', preventDefault);
    };
  }, [isDragging]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setTouchEndX(e.targetTouches[0].clientX);
    e.preventDefault(); // Prevent page scroll while dragging
  };

  const handleTouchEnd = useCallback(() => {
    if (!touchStartX || !touchEndX) return;
    
    const distance = touchStartX - touchEndX;
    const isSwipeLeft = distance > 50;
    const isSwipeRight = distance < -50;

    if (isSwipeLeft && activeIndex < pointsPacks.length - 1) {
      setActiveIndex(prev => prev + 1);
    } else if (isSwipeRight && activeIndex > 0) {
      setActiveIndex(prev => prev - 1);
    }

    setTouchStartX(0);
    setTouchEndX(0);
    setIsDragging(false);
  }, [touchStartX, touchEndX, activeIndex]);

  return (
    <div 
      ref={carouselRef}
      className="relative overflow-hidden touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => setIsDragging(false)}
    >
      <div 
        className="flex snap-x snap-mandatory transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {pointsPacks.map((pack, index) => (
          <div 
            key={pack.id}
            className="w-full flex-shrink-0 snap-center px-4"
          >
            <div 
              className={`p-6 rounded-2xl ${
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
                onClick={() => onPurchase(pack.points, pack.price)}
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
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {pointsPacks.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === activeIndex ? 'bg-[#FFA41D]' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

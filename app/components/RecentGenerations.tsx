'use client';

import { useRef, useEffect, useState, TouchEvent } from 'react';
import Image from 'next/image';
import { ImageGeneration } from '@/types/database';

interface RecentGenerationsProps {
  userId?: string;
  sessionId?: string;
}

const RecentGenerations = ({ userId, sessionId }: RecentGenerationsProps) => {
  const [generations, setGenerations] = useState<ImageGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const maxScroll = container.scrollWidth - container.clientWidth;
    const currentScroll = container.scrollLeft;
    const scrollPercentage = currentScroll / maxScroll;
    
    setScrollPosition(currentScroll);
    
    // Calculate which image should be shown based on scroll position
    const imageIndex = Math.min(
      Math.floor((scrollPercentage * generations.length * 1.1)),
      generations.length - 1
    );
    if (imageIndex !== currentIndex) {
      setCurrentIndex(imageIndex);
    }
  };

  useEffect(() => {
    const fetchRecentGenerations = async () => {
      try {
        const response = await fetch('/api/history?page=1&limit=5');
        if (!response.ok) {
          throw new Error('Failed to fetch generations');
        }
        const data = await response.json();
        setGenerations(data.data || []);
      } catch (error) {
        console.error('Error fetching recent generations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentGenerations();
  }, [userId, sessionId]);

  if (loading) {
    return (
      <div className="w-full bg-gray-50/50 py-4">
        <div className="flex items-center justify-between px-6 mb-3">
          <h3 className="text-sm font-medium text-gray-700">Recent Creations</h3>
          <span className="text-xs text-gray-500">Loading...</span>
        </div>
        <div className="px-6">
          <div className="w-full aspect-square rounded-xl bg-gray-100 animate-pulse" />
        </div>
      </div>
    );
  }

  if (generations.length === 0) return null;

  const currentGen = generations[currentIndex];

  return (
    <div className="w-full bg-gray-50/50 py-4">
      <div className="flex items-center justify-between px-6 mb-3">
        <h3 className="text-sm font-medium text-gray-700">Recent Creations</h3>
        <span className="text-xs text-gray-500">{currentIndex + 1} of {generations.length}</span>
      </div>
      
      <div className="relative">
        {/* Current Image */}
        <div className="px-6">
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200">
            {currentGen.image_url ? (
              <Image
                src={currentGen.image_url}
                alt={currentGen.prompt}
                fill
                className="object-cover transition-opacity duration-300"
                sizes="(max-width: 768px) 100vw, 300px"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">
                  image_not_supported
                </span>
                <p className="text-sm text-gray-500 text-center">
                  {currentGen.status === 'pending' 
                    ? 'Image is being generated...' 
                    : 'Image not available'}
                </p>
              </div>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-600 text-center">
            {currentGen.prompt}
          </p>
          <p className="mt-1 text-xs text-gray-500 text-center">
            {new Date(currentGen.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </p>
        </div>

        {/* Scroll Container */}
        <div 
          ref={containerRef}
          className="absolute inset-0 overflow-x-auto scrollbar-hide"
          onScroll={handleScroll}
        >
          <div className="w-[300%] h-full" />
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-1.5 mt-3">
          {generations.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-[#FFA41D] w-3' 
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentGenerations;

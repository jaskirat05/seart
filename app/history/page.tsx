"use client";

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { ImageGeneration } from '@/types/database';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import ImageCard from '../components/ImageCard';

interface FetchResponse {
  data: ImageGeneration[];
  totalCount: number;
  hasMore: boolean;
}

const PAGE_SIZE = 10;

export default function HistoryPage() {
  const { user, isSignedIn } = useUser();
  const { ref, inView } = useInView();

  const fetchGenerations = async ({ pageParam = 1 }) => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', pageParam.toString());

    const response = await fetch(`/api/history?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch generations');
    }
    
    return response.json();
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useInfiniteQuery({
    queryKey: ['generations', isSignedIn, user?.id],
    queryFn: fetchGenerations,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (status === 'pending' || !data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <span className="material-symbols-outlined text-4xl mb-4">error</span>
        <p>Error loading images: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  const generations = data.pages.flatMap(page => page.data);

  if (generations.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <span className="material-symbols-outlined text-4xl mb-4">
          image_not_supported
        </span>
        <p>No images generated yet</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white mt-[50px]">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Generated Images</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {generations.map((generation) => (
            <ImageCard key={generation.id} generation={generation} />
          ))}
        </div>
        {hasNextPage && (
          <div 
            ref={ref}
            className="h-20 flex items-center justify-center mt-8"
          >
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
        {!hasNextPage && generations.length > 0 && (
          <p className="text-center text-gray-400 mt-8">No more images to load</p>
        )}
      </div>
    </div>
  );
}

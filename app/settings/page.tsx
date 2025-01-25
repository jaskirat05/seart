"use client"
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useMultiImageGeneration } from '@/hooks/useMultiImageGeneration';
import { ImageResolution, ImageResolutions } from '@/types/imageResolution';
import { toast } from 'sonner';
import GallerySection from '../components/GallerySection';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ImageGeneration } from '@/types/database';
import { useInView } from 'react-intersection-observer';
import { UUID } from 'crypto';

interface FetchResponse {
  data: ImageGeneration[];
  totalCount: number;
  hasMore: boolean;
}

const Settings = () => {
  const { user } = useUser();
  const [model, setModel] = useState('flux');
  const [batchId,setBatchId] = useState<string|null>(null);
  const [prompt, setPrompt] = useState('');
  const [imgResolution, setResolution] = useState<ImageResolution>(ImageResolutions.FLUXSQUARE);
  const [seed, setSeed] = useState(0);
  const [noOfImages, setNoOfImages] = useState(1);

  const { generate, generations, isAnyLoading } = useMultiImageGeneration();
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    refetch
  } = useInfiniteQuery({
    queryKey: ['settings-generations'],
    queryFn: async ({ pageParam = 1 }) => {
      console.log('Fetching page:', pageParam); // Debug log
      const response = await fetch(`/api/history?page=${pageParam}`);
      if (!response.ok) {
        throw new Error('Failed to fetch generations');
      }
      const data = await response.json();
      console.log('Response data:', data); // Debug log
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      console.log('getNextPageParam called with:', { lastPage, allPages }); // Debug log
      if (!lastPage.hasMore) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    console.log('inView:', inView, 'hasNextPage:', hasNextPage, 'isFetchingNextPage:', isFetchingNextPage); // Debug log
    if (inView && hasNextPage && !isFetchingNextPage) {
      console.log('Triggering fetchNextPage'); // Debug log
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const generationsData = data?.pages.flatMap(page => page.data) || [];
  const combinedGenerations = [...(generations || []), ...generationsData];

  const handleResolutionChange = (resolution: ImageResolution) => {
    setResolution(resolution);
  }

  const handleGenerate = async () => {
    const newBatchId = crypto.randomUUID();
    setBatchId(newBatchId);

    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    
    try {
      await generate({
        prompt,
        numberOfImages: noOfImages,
        settings: {
          height: imgResolution.height,
          width: imgResolution.width,
          seed: seed==0?Math.floor(Math.random() * 2147483647) + 1:seed,
          model: model,
          nImages: Number(1),
          
        },
        batch_ID: newBatchId
      });
      // Refetch generations after successful generation
      await refetch();
    } catch (error: any) {
      if (error.message === 'INSUFFICIENT_POINTS') {
        toast.error('Not enough points to generate images');
      } 
      else if (error.message === 'LOGIN REQUIRED'){
        toast.error('Please login to generate images');
      }
        else {
        toast.error('Failed to generate images');
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Settings Panel - Full width on mobile, 1/4 width on desktop */}
      <div className="w-full lg:w-1/4 bg-white p-6 mt-24 border-b lg:border-b-0 lg:border-r border-gray-200 lg:h-screen lg:fixed lg:left-0 lg:overflow-y-auto">
        {/* Model Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          {/* Model Version */}
          <div className="mb-6">
            <h3 className="text-base font-medium text-gray-700">Model</h3>
            <select
              value={model}
              onChange={
                (e) => {
                  setModel(e.target.value);
                  handleResolutionChange(model === 'flux' ? ImageResolutions.FLUXSQUARE : ImageResolutions.SQUARE);
                }
              }
              className="mt-2 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-[#FFA41D] focus:border-[#FFA41D] rounded-md"
            >
              <option value="flux">Flux Dev</option>
              <option value="pony">Pony Diffusion</option>
            </select>
          </div>

          {/* Image Settings */}
          <div className="mb-6">
            <h3 className="text-base font-medium text-gray-700">Image Settings</h3>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <button 
                className={`aspect-square border rounded-md hover:bg-gray-50 focus:outline-none relative group overflow-hidden
                  ${imgResolution === ImageResolutions.SQUARE || imgResolution === ImageResolutions.FLUXSQUARE
                    ? 'border-[#FFA41D] shadow-[0_0_10px_rgba(255,164,29,0.3)]' 
                    : 'border-gray-300'}`}
                onClick={() => handleResolutionChange(model === 'flux' ? ImageResolutions.FLUXSQUARE : ImageResolutions.SQUARE)}
              >
                <div className={`absolute inset-2 rounded transition-colors
                  ${imgResolution === ImageResolutions.SQUARE || imgResolution === ImageResolutions.FLUXSQUARE
                    ? 'bg-[#FFA41D]/10' 
                    : 'bg-gray-100 group-hover:bg-gray-200'}`}
                ></div>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-700">1:1</span>
              </button>
              <button 
                className={`aspect-[9/5] border rounded-md hover:bg-gray-50 focus:outline-none relative group overflow-hidden
                  ${imgResolution === ImageResolutions.LANDSCAPE ||imgResolution === ImageResolutions.FLUXLANDSCAPE
                    ? 'border-[#FFA41D] shadow-[0_0_10px_rgba(255,164,29,0.3)]' 
                    : 'border-gray-300'}`}
                onClick={() => handleResolutionChange(model === 'flux' ? ImageResolutions.FLUXLANDSCAPE : ImageResolutions.LANDSCAPE)}
              >
                <div className={`absolute inset-2 rounded transition-colors
                  ${imgResolution === ImageResolutions.LANDSCAPE || imgResolution === ImageResolutions.FLUXLANDSCAPE
                    ? 'bg-[#FFA41D]/10' 
                    : 'bg-gray-100 group-hover:bg-gray-200'}`}
                ></div>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-700">9:16</span>
              </button>
              <button 
                className={`aspect-[9/16] border rounded-md hover:bg-gray-50 focus:outline-none relative group overflow-hidden
                  ${imgResolution === ImageResolutions.PORTRAIT || imgResolution === ImageResolutions.FLUXPORTRAIT
                    ? 'border-[#FFA41D] shadow-[0_0_10px_rgba(255,164,29,0.3)]' 
                    : 'border-gray-300'}`}
                onClick={() => handleResolutionChange(model === 'flux' ? ImageResolutions.FLUXPORTRAIT : ImageResolutions.PORTRAIT)}
              >
                <div className={`absolute inset-2 rounded transition-colors
                  ${imgResolution === ImageResolutions.PORTRAIT || imgResolution === ImageResolutions.FLUXPORTRAIT
                    ? 'bg-[#FFA41D]/10' 
                    : 'bg-gray-100 group-hover:bg-gray-200'}`}
                ></div>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-700">9:16</span>
              </button>
            </div>
          </div>

          {/* Image Quantity */}
          <div>
            <h3 className="text-base font-medium text-gray-700">Image Quantity</h3>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  onClick={() => setNoOfImages(num)}
                  className={`flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all
                    ${noOfImages === num 
                      ? 'border-[#FFA41D] shadow-[0_0_10px_rgba(255,164,29,0.3)] bg-[#FFA41D]/10' 
                      : 'border-gray-300'}`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Plan Section */}
        <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-900">Plan</h3>
             
            </div>
            <button className="bg-[#FFA41D] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors">
              Upgrade
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area - Full width on mobile, 3/4 width on desktop */}
      <div className="w-full lg:w-3/4 lg:ml-[25%] flex flex-col mt-24">
        {/* Generation Input Area */}
        <div className="p-6">
          <div className="relative">
            {/* Glowing border effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#EEFF02] to-[#FFA41D] rounded-xl blur-sm"></div>
            
            {/* Input and Button */}
            <div className="relative flex bg-white rounded-lg">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt here..."
                className="w-full px-6 py-4 text-lg outline-none rounded-l-lg"
              />
              <button 
                onClick={handleGenerate}
                disabled={isAnyLoading}
                className="bg-[#FFA41D] text-white px-10 py-4 rounded-xl transition-colors font-medium m-2 hover:bg-opacity-90 disabled:bg-opacity-50 disabled:cursor-not-allowed"
              >
                {isAnyLoading ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>

          {/* Current Generations Display */}
          <div className="mt-6 bg-white rounded-xl p-6 shadow-sm min-h-[400px]">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: noOfImages }).map((_, i) => (
                <div 
                  key={i}
                  className={`bg-gray-50 rounded-lg flex items-center justify-center ${
                    imgResolution === ImageResolutions.SQUARE || imgResolution === ImageResolutions.FLUXSQUARE
                      ? 'aspect-square'
                      : imgResolution === ImageResolutions.LANDSCAPE || imgResolution === ImageResolutions.FLUXLANDSCAPE
                      ? 'aspect-[16/9]'
                      : 'aspect-[9/16]'
                  }`}
                >
                  <span className="material-symbols-outlined text-gray-200" style={{ fontSize: '120px' }}>
                    image
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Generations Section */}
        <div className="p-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Recent Generations</h2>
            <GallerySection generations={combinedGenerations} />
            {hasNextPage && (
              <div ref={ref} className="h-20 flex items-center justify-center mt-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
              </div>
            )}
            {!hasNextPage && combinedGenerations.length > 0 && (
              <p className="text-center text-gray-500 mt-8">No more images to load</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

"use client";

import { useState } from 'react';
import Image from 'next/image';
import { ImageGeneration } from '@/types/database';
import { MdDownload, MdZoomOutMap } from 'react-icons/md';
import { toast } from 'sonner';

interface ImageCardProps {
  generation: ImageGeneration;
}

export default function ImageCard({ generation }: ImageCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showHoverInfo, setShowHoverInfo] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!generation.image_url) {
      toast.error('Image URL is not available');
      return;
    }

    setIsDownloading(true);
    try {
      // Use our proxy API endpoint
      const response = await fetch(`/api/download?url=${encodeURIComponent(generation.image_url)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `seart-${generation.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Image downloaded successfully');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div 
        className="relative aspect-square bg-zinc-900 rounded-lg overflow-hidden group"
        onMouseEnter={() => setShowHoverInfo(true)}
        onMouseLeave={() => setShowHoverInfo(false)}
      >
        {generation.image_url && (
          <div className="relative aspect-square w-full h-full flex items-center justify-center">
            <Image
              src={generation.image_url||'Pending'}
              alt={generation.prompt}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
        )}
        
        {/* Hover overlay */}
        <div 
          className={`absolute inset-0 bg-black/80 transition-opacity flex flex-col justify-between p-4
            ${showHoverInfo ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center rounded-full border border-white/20 bg-zinc-900 overflow-hidden">
              <span className="bg-[#DE3C4B] text-white px-3 py-1 text-sm">Model</span>
              <span className="text-white px-3 py-1 text-sm">{generation.model_settings?.model || 'NA'}</span>
            </div>
            <div className="flex items-center rounded-full border border-white/20 bg-zinc-900 overflow-hidden">
              <span className="bg-[#DE3C4B] text-white px-3 py-1 text-sm">Size</span>
              <span className="text-white px-3 py-1 text-sm">{generation.model_settings?.width}x{generation.model_settings?.height}</span>
            </div>
            <div className="flex items-center rounded-full border border-white/20 bg-zinc-900 overflow-hidden">
              <span className="bg-[#DE3C4B] text-white px-3 py-1 text-sm">Seed</span>
              <span className="text-white px-3 py-1 text-sm">{generation.model_settings?.seed || 'NA'}</span>
            </div>
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-[#DE3C4B] text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-[#DE3C4B]/90 transition-colors"
          >
            <MdZoomOutMap className="text-xl" />
            <span>Enlarge</span>
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-7xl">
            {/* Close button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 md:text-3xl text-2xl p-2"
            >
              ×
            </button>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Image container */}
              <div className="relative md:h-[80vh] h-[50vh] w-full md:w-auto md:flex-shrink-0">
                <Image
                  src={generation.image_url||'Pending'}
                  alt={generation.prompt}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 1280px"
                />
              </div>

              {/* Info container */}
              <div className="flex-1 text-white flex flex-col">
                <div className="mb-4 md:mb-8">
                  <p className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 leading-tight font-fredoka">
                    {generation.prompt}
                  </p>
                  <p className="text-sm text-gray-300">
                    {new Date(generation.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 md:gap-3 mb-4 md:mb-8">
                  <div className="flex items-center rounded-full border border-white/20 bg-zinc-900 overflow-hidden">
                    <span className="bg-[#DE3C4B] text-white px-2 md:px-3 py-1 text-xs md:text-sm">Model</span>
                    <span className="text-white px-2 md:px-3 py-1 text-xs md:text-sm">{generation.model_settings?.model || 'NA'}</span>
                  </div>
                  <div className="flex items-center rounded-full border border-white/20 bg-zinc-900 overflow-hidden">
                    <span className="bg-[#DE3C4B] text-white px-2 md:px-3 py-1 text-xs md:text-sm">Size</span>
                    <span className="text-white px-2 md:px-3 py-1 text-xs md:text-sm">{generation.model_settings?.width}x{generation.model_settings?.height}</span>
                  </div>
                  <div className="flex items-center rounded-full border border-white/20 bg-zinc-900 overflow-hidden">
                    <span className="bg-[#DE3C4B] text-white px-2 md:px-3 py-1 text-xs md:text-sm">Seed</span>
                    <span className="text-white px-2 md:px-3 py-1 text-xs md:text-sm">{generation.model_settings?.seed || 'NA'}</span>
                  </div>
                </div>

                <div className="mt-auto justify-center">
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full bg-[#DE3C4B] text-white py-2 md:py-3 px-4 md:px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-[#DE3C4B]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                  >
                    {isDownloading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 md:h-5 w-4 md:w-5 border-2 border-white border-t-transparent" />
                        <span>Downloading...</span>
                      </>
                    ) : (
                      <>
                        <MdDownload className="text-lg md:text-xl" />
                        <span>Download</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

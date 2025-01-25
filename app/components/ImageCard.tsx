"use client"

import { ImageGeneration } from '@/types/database';
import { MdDownload } from 'react-icons/md';
import { toast } from 'sonner';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState } from 'react';


interface ImageCardProps {
  generations: ImageGeneration[];
}

const ImageCard = ({ generations }: ImageCardProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const mainGeneration = generations[0]; // Use first generation for metadata, this is a change

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = async (imageUrl: string) => {
    if (!imageUrl) {
      toast.error('Image URL is not available');
      return;
    }

    setIsDownloading(true);
    try {
      const proxyUrl = `/api/download?url=${encodeURIComponent(imageUrl)}`;
      console.log('Downloading through proxy:', proxyUrl);

      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const filename = imageUrl.split('/').pop() || 'generated-image.png';
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Image downloaded successfully');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to download image');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header with Prompt and Model Info */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Prompt with Glow Effect */}
        <div className="relative flex-1">
          <p className="text-md font-extralight italic font-fredoka text-gray-900 glow-text">
            {mainGeneration.prompt}
          </p>
        </div>

        {/* Model Name and Date */}
        <div className="flex-shrink-0 flex flex-col md:flex-row gap-2 md:gap-4">
          <span className="bg-[#FFA41D] border-[#FFA41D]/50 border-b-2 text-white px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap uppercase w-fit">
            {mainGeneration.model_settings?.model || 'NA'}
          </span>
          <span className="text-black px-3 py-1 text-sm font-medium whitespace-nowrap uppercase w-fit">
            {formatDate(mainGeneration.created_at || 'NA')}
          </span>
        </div>
      </div>

      {/* Images Row/Column */}
      <div className="flex flex-col md:flex-row gap-4 md:overflow-x-auto md:pb-4">
        {generations.map((gen) => {
          // Determine aspect ratio based on model settings
          const aspectRatioClass = gen.model_settings?.width && gen.model_settings?.height
            ? gen.model_settings.width === gen.model_settings.height
              ? 'aspect-square'
              : gen.model_settings.width > gen.model_settings.height
                ? 'aspect-[16/9]'
                : 'aspect-[9/16]'
            : 'aspect-square';

          return (
            <div key={gen.id} className="relative group w-fit flex-shrink-0">
              {(!gen.image_url || gen.status === 'pending') ? (
                <div className={`w-[280px] md:w-[400px] ${aspectRatioClass} rounded-lg bg-gray-50 flex items-center justify-center`}>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFA41D]"></div>
                </div>
              ) : (
                <>
                  <Image
                    src={gen.image_url}
                    alt={gen.prompt || 'Generated image'}
                    width={400}
                    height={400}
                    className={`rounded-lg h-auto max-h-[70vh] object-contain w-[280px] md:w-[400px] ${aspectRatioClass}`}
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col justify-between p-4">
                    <div className="flex justify-between items-start text-white">
                      <span className="text-sm bg-[#FFA41D] border-[#FFA41D]/50 border-b-2 text-white px-3 py-1 rounded-full">
                        Seed: {gen.model_settings?.seed || 'NA'}
                      </span>
                      <span className="text-sm bg-purple-800 border-purple-800/50 border-b-2 text-white px-3 py-1 rounded-full">
                        {gen.model_settings?.width}x{gen.model_settings?.height}
                      </span>
                    </div>
                    
                    <div className="flex justify-end">
                      <motion.button
                        onClick={() => handleDownload(gen.image_url!)}
                        disabled={isDownloading}
                        className="p-2 rounded-full bg-[#FF9933] text-white hover:bg-[#E68A2E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isDownloading ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        ) : (
                          <MdDownload className="text-xl" />
                        )}
                      </motion.button>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
      <style jsx>{`
        .glow-text {
          position: relative;
          text-shadow: 0 0 8px rgba(255, 153, 51, 0.2),
                       0 0 16px rgba(255, 153, 51, 0.1);
          animation: glow 3s ease-in-out infinite alternate;
        }

        @keyframes glow {
          from {
            text-shadow: 0 0 8px rgba(255, 153, 51, 0.2),
                         0 0 16px rgba(255, 153, 51, 0.1);
          }
          to {
            text-shadow: 0 0 12px rgba(255, 153, 51, 0.3),
                         0 0 24px rgba(255, 153, 51, 0.15);
          }
        }
      `}</style>
    </div>
  );
};

export default ImageCard;

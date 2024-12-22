"use client"
import { motion } from 'framer-motion';

interface ImageDisplayProps {
  imageUrl?: string;
  isLoading: boolean;
  seed?: number;
  onRefresh?: () => void;
}

const ImageDisplay = ({ imageUrl, isLoading, seed, onRefresh }: ImageDisplayProps) => {
  return (
    <div className="flex flex-col items-center mt-12">
      {/* Image Container with 3D effect and skeleton loading */}
      <motion.div 
        className="relative w-[390px] h-[675px] rounded-xl overflow-hidden"
        initial={{ rotateY: 0 }}
        animate={{ 
          rotateY: imageUrl ? [0, 360] : 0,
          scale: imageUrl ? [0.9, 1] : 1
        }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{
          perspective: '1000px',
          transformStyle: 'preserve-3d'
        }}
      >
        {isLoading ? (
          <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" 
                 style={{ 
                   backgroundSize: '200% 100%',
                   animation: 'shimmer 2s infinite linear'
                 }}
            />
          </div>
        ) : imageUrl ? (
          <motion.img
            src={imageUrl}
            alt="Generated art"
            className="w-full h-full object-cover shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">Your art will appear here</span>
          </div>
        )}
      </motion.div>

      {/* Action Buttons */}
      <div className="flex gap-20 mt-6">
        {/* Refresh Button and Seed */}
        <div className="flex flex-col items-center">
          <motion.button 
            className="flex flex-col items-center group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onRefresh}
          >
            <span className="material-symbols-outlined text-4xl opacity-50 text-[#DE3C4B] mb-1 group-hover:opacity-100 transition-opacity">
              refresh
            </span>
            <span className="text-[#666464] text-sm">Refresh</span>
          </motion.button>
          <span className="text-xs text-gray-500 mt-2">
            {seed ? `Seed: ${seed}` : 'Generate to see seed'}
          </span>
        </div>

        {/* Download Button */}
        <motion.button 
          className="flex flex-col items-center group"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          disabled={!imageUrl}
        >
          <span className="material-symbols-outlined text-4xl opacity-50 text-[#3E7CB1] mb-2 group-hover:opacity-100 transition-opacity">
            download
          </span>
          <span className="text-[#666464] text-sm">Download</span>
        </motion.button>
      </div>
    </div>
  );
};

export default ImageDisplay;

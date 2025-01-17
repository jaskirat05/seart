"use client"

import { ImageGeneration } from '@/types/database';
import ImageCard from './ImageCard';

interface GallerySectionProps {
  generations: ImageGeneration[];
}

const GallerySection = ({ generations }: GallerySectionProps) => {
  // Group generations by batch_id and sort by creation date
  const groupedGenerations = generations.reduce((acc, gen) => {
    const batchId = gen.batch_id || gen.id;
    if (!acc[batchId]) {
      acc[batchId] = [];
    }
    acc[batchId].push(gen);
    return acc;
  }, {} as Record<string, ImageGeneration[]>);

  // Sort each batch's images by seed
  Object.values(groupedGenerations).forEach(batch => {
    batch.sort((a, b) => {
      // First sort by creation date
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      if (dateA !== dateB) return dateB - dateA;
      
      // If same date, sort by seed
      const seedA = a.model_settings?.seed || 0;
      const seedB = b.model_settings?.seed || 0;
      return seedA - seedB;
    });
  });

  // Sort batches by their first image's creation date
  const sortedBatchIds = Object.entries(groupedGenerations)
    .sort(([, a], [, b]) => {
      const dateA = new Date(a[0]?.created_at || 0).getTime();
      const dateB = new Date(b[0]?.created_at || 0).getTime();
      return dateB - dateA;
    })
    .map(([id]) => id);

  if (!generations || generations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-gray-500">No images generated yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-gray-200">
      {sortedBatchIds.map((batchId) => (
        <div key={batchId} className="py-12 first:pt-6 last:pb-6">
          <ImageCard generations={groupedGenerations[batchId]} />
        </div>
      ))}
    </div>
  );
};

export default GallerySection;

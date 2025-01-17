import { useState, useMemo } from 'react';
import { useGenerationStatus, GenerationStatus } from './useGenerationStatus';
import { ModelSettings } from '@/types/database';
import { ImageResolutions } from '@/types/imageResolution';
import { redirect } from 'next/navigation';

interface GenerateMultiImageOptions {
  batch_ID?:string;
  prompt: string;
  numberOfImages?: number;
  settings?: Partial<ModelSettings>;
}

interface Generation {
  id: string;
  status: GenerationStatus;
  imageUrl?: string;
  isLoading: boolean;
}

interface UseMultiImageGenerationReturn {
  generate: (options: GenerateMultiImageOptions) => Promise<void>;
  generations: Generation[];
  isAnyLoading: boolean;
}

const MAX_GENERATIONS = 4;

export function useMultiImageGeneration(): UseMultiImageGenerationReturn {
  const [generationIds, setGenerationIds] = useState<string[]>([]);

  // Create separate status states for each possible generation
  const status1 = useGenerationStatus({
    generationId: generationIds[0],
    onComplete: (url) => console.log('Generation 1 complete:', url),
    onError: () => console.error('Generation 1 failed')
  });

  const status2 = useGenerationStatus({
    generationId: generationIds[1],
    onComplete: (url) => console.log('Generation 2 complete:', url),
    onError: () => console.error('Generation 2 failed')
  });

  const status3 = useGenerationStatus({
    generationId: generationIds[2],
    onComplete: (url) => console.log('Generation 3 complete:', url),
    onError: () => console.error('Generation 3 failed')
  });

  const status4 = useGenerationStatus({
    generationId: generationIds[3],
    onComplete: (url) => console.log('Generation 4 complete:', url),
    onError: () => console.error('Generation 4 failed')
  });

  // Combine all statuses
  const allStatuses = [status1, status2, status3, status4];

  // Map the statuses to our Generation interface
  const generations = useMemo(() => {
    return generationIds.map((id, index) => {
      const status = allStatuses[index];
      return {
        id,
        status: status.status,
        imageUrl: status.imageUrl,
        isLoading: status.isLoading
      };
    });
  }, [generationIds, allStatuses]);

  const generate = async ({ prompt, numberOfImages = 1, settings,batch_ID }: GenerateMultiImageOptions) => {
    const batchSize = 1;
    const newIds: string[] = [];
    const actualNumberOfImages = Math.min(numberOfImages, MAX_GENERATIONS);
    const baseSeed = settings?.seed ?? 0;
    
    // Generate in batches of 3
    for (let i = 0; i < actualNumberOfImages; i += batchSize) {
      const currentBatchSize = Math.min(batchSize, actualNumberOfImages - i);
      const batchPromises = Array.from(
        { length: currentBatchSize },
        (_, index) => {
          // Calculate the next seed for this image
          const nextSeed = baseSeed + i + index;
          
          return fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt,
              settings: {
                ...settings,
                seed: nextSeed,
                prompt,
                nImages: Number(1),
                  // Keep the nImages setting from page.tsx
              },
              batchId:batch_ID
            })
          }).then(async response => {
            if (response.status === 403) {
              throw new Error('INSUFFICIENT_POINTS');

            }
            else if (response.status==410){
              throw new Error('LOGIN REQUIRED');
            }
            if (!response.ok) {
              throw new Error('Failed to generate image');
            }
            
            return response.json();
          })
        }
      );

      const batchResults = await Promise.all(batchPromises);
      newIds.push(...batchResults.map(r => r.generationId));
    }

    setGenerationIds(newIds);
  };

  const isAnyLoading = generations.some(gen => gen.isLoading);

  return {
    generate,
    generations,
    isAnyLoading
  };
}

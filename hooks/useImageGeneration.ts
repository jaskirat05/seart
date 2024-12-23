import { useState } from 'react';
import { toast } from 'sonner';
import { ImageResolutions } from '@/types/imageResolution';
import { ModelSettings } from '@/types/database';

interface GenerateImageOptions {
  prompt: string;
  settings?: Partial<ModelSettings>; 
  resolution?: 'portrait' | 'landscape' | 'square';
}

interface UseImageGenerationReturn {
  generate: (options: GenerateImageOptions) => Promise<string | undefined>;
  isLoading: boolean;
  error: string | null;
}

export function useImageGeneration(): UseImageGenerationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async ({ prompt, settings = {}, resolution = 'portrait' }: GenerateImageOptions) => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const imageResolution = ImageResolutions.getResolution(resolution);
      
      const requestBody = {
        prompt: prompt.trim(),
        settings: {
          height: imageResolution.height,
          width: imageResolution.width,
          prompt: prompt.trim(),
          ...settings
        }
      };

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(`${data.error}. Points remaining: ${data.pointsBalance}`);
        }
        throw new Error(data.error || 'Failed to generate image');
      }

      toast.success('Generation started! Your image will be ready soon.');
      return data.generationId;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate image';
      setError(errorMessage);
      toast.error(errorMessage);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generate,
    isLoading,
    error
  };
}
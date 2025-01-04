import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { toast } from 'sonner';

export type GenerationStatus = 'pending' | 'completed' | 'failed';

interface Generation {
  status: GenerationStatus;
  imageUrl?: string;
}

interface UseGenerationStatusProps {
  generationId?: string;
  onComplete?: (imageUrl: string) => void;
  onError?: () => void;
}

export function useGenerationStatus({ 
  generationId, 
  onComplete, 
  onError 
}: UseGenerationStatusProps): Generation & { isLoading: boolean } {
  const [status, setStatus] = useState<GenerationStatus>('pending');
  const [imageUrl, setImageUrl] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('useGenerationStatus - generationId changed:', generationId);
    
    if (!generationId) {
      setIsLoading(false);
      setStatus('pending');
      setImageUrl(undefined);
      return;
    }

    setIsLoading(true);

    // First get the current status
    const fetchStatus = async () => {
      console.log('Fetching status for:', generationId);
      const { data, error } = await supabase
        .from('image_generations')
        .select('status, image_url')
        .eq('id', generationId)
        .single();

      if (error) {
        console.error('Error fetching status:', error);
        return;
      }

      console.log('Fetched data:', data);
      if (data) {
        if (data.status == 'completed' && data.image_url) {
          setStatus('completed');
          setImageUrl(data.image_url);
          setIsLoading(false);
          onComplete?.(data.image_url);
        } else if (data.status == 'failed') {
          setStatus('failed');
          setIsLoading(false);
          onError?.();
        }
      }
    };

    fetchStatus();

    // Subscribe to changes
    console.log('Setting up subscription...');
    const subscription = supabase
      .channel(generationId)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'image_generations',
          filter: `id=eq.${generationId}`,
        },
        (payload) => {
          console.log('Received change:', payload);
          const generation = payload.new;
          
          if (generation.status == 'completed' && generation.image_url) {
            console.log('Generation completed:', generation);
            setStatus('completed');
            setImageUrl(generation.image_url);
            setIsLoading(false);
            onComplete?.(generation.image_url);
            toast.success('Your image is ready!');
          } else if (generation.status == 'failed') {
            console.log('Generation failed');
            setStatus('failed');
            setIsLoading(false);
            onError?.();
            toast.error('Generation failed. Please try again.');
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, [generationId]);

  return {
    status,
    imageUrl,
    isLoading
  };
}

"use client"
import { useState } from 'react';
import ImageDisplay from './ImageDisplay';
import { ImageResolutions } from '@/types/imageResolution';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';
import { useGenerationStatus } from '@/hooks/useGenerationStatus';
import Footer from './Footer';

const Hero = () => {
  const [prompt, setPrompt] = useState('');
  const [generationId, setGenerationId] = useState<string>();
  const { user, isLoaded } = useUser();
  const [currentimageUrl,setImageUrl] = useState<string>();  
  const [seed, setSeed] = useState(0);  
  const [isDownloading, setIsDownloading] = useState(false);

  console.log('Hero render - generationId:', generationId);

  // Ensure state updates are triggering re-renders
   // Function to generate a random seed
   const generateSeed = () => {
    // Generate a random number between 1 and 2^32 - 1 (max positive 32-bit integer)
    const seed=Math.floor(Math.random() * 2147483647) + 1;
    setSeed(seed);
    handleGenerate();
    //return seed;

  };



  const { status, imageUrl, isLoading } = useGenerationStatus({
    generationId,
    onComplete: (url) => {
      console.log('Generation complete with URL:', url);
      setImageUrl(url);
      // Don't clear generationId here, let it persist
    },
    onError: () => {
      console.log('Generation error');
      setGenerationId(undefined); // Only clear on error
    }
  });

  console.log('Hook returned - status:', status, 'isLoading:', isLoading, 'imageUrl:', imageUrl);

  const handleGenerate = async () => {
    console.log('handleGenerate called');
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    
    try {
      const resolution = ImageResolutions.getResolution('portrait');
      console.log('Sending request with resolution:', resolution);
      
      const requestBody = {
        prompt: prompt.trim(),
        settings: {
          height: resolution.height,
          width: resolution.width,
          prompt: prompt.trim(),
          seed:seed,
          nImages:1,
          model:"flux"
        }
      };
      console.log('Request body:', requestBody);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Raw response:', response);
      const data = await response.json();
      console.log('Upload response data:', data);

      if (!response.ok) {
        console.error('Response not OK:', response.status, response.statusText);
        if (response.status === 403) {
          toast.error(`${data.error}. Points remaining: ${data.pointsBalance}`);
        } else {
          toast.error(data.error || 'Failed to generate image');
        }
        return;
      }

      toast.success('Generation started! Your image will be ready soon.');
      //setPrompt(''); // Clear prompt after successful submission
      setSeed(Math.floor(Math.random() * 2147483647) + 1);
      
      if (data.generationId) {
        console.log('Setting generationId:', data.generationId);
        // Force state update
        setGenerationId(prev => {
          console.log('Previous generationId:', prev);
          return data.generationId;
        });
      } else {
        console.error('No generationId in response:', data);
      }
    } catch (error) {
      console.error('Error in handleGenerate:', error);
      toast.error('Failed to generate image');
    }
  };

  
  return (
    <section className="w-full flex flex-col items-center justify-center mt-[70px] px-4">
      {/* Headline */}
      <h1 className="text-4xl md:text-6xl font-black text-center">
        Create art in seconds
      </h1>

      {/* Subheading */}
      <h2 className="text-lg md:text-[20px] mt-8 text-center font-bold">
        {user ? (
          <>Welcome back! You have unlimited generations.</>
        ) : (
          <>Type in what you imagine, sign up for bonus points</>
        )}
      </h2>

      {/* Input Container */}
      <div className="w-full lg:w-[60%] md:w-[80%] mt-6 relative">
        <div className="relative">
          {/* Glowing border effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#EEFF02] to-[#FFA41D] rounded-xl blur-sm"></div>
          
          {/* Input and Button */}
          <div className="relative flex bg-white rounded-lg">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Japanese model"
              className="w-full px-6 py-4 text-lg outline-none rounded-l-lg"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleGenerate();
                }
              }}
            />
            <button 
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className={`${
                isLoading ? 'bg-opacity-70 cursor-not-allowed' : 'hover:bg-opacity-90'
              } bg-[#FFA41D] text-white px-10 py-4 rounded-xl transition-colors font-medium m-2`}
            >
              {isLoading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>
      </div>

      {/* Image Display with Action Buttons */}
     
      <ImageDisplay imageUrl={imageUrl} isLoading={isLoading} seed= {seed} onRefresh={generateSeed} />
      
    </section>
  );
};

export default Hero;

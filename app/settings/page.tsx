"use client"
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Header from '../components/Header';
import { useImageGeneration} from '@/hooks/useImageGeneration';  
import { useGenerationStatus } from '@/hooks/useGenerationStatus';  
import { ImageResolution, ImageResolutions } from '@/types/imageResolution';

const Settings = () => {
  const { user } = useUser();
  const [model, setModel] = useState('1.1');
  const [prompt, setPrompt] = useState('');
 const [imgResolution,setResolution]=useState<ImageResolution>(ImageResolutions.PORTRAIT);
  const [seed, setSeed] = useState(0);  

  const [noOfImages, setNoOfImages] = useState(1);
  const [generationId, setGenerationId] = useState<string>();

  const { generate, isLoading } = useImageGeneration();
  const { status, imageUrl } = useGenerationStatus({
    generationId,
    onComplete: (url) => {
      console.log('Generation complete:', url);
    },
    onError: () => {
      setGenerationId(undefined);
    }
  });
  const handleResolutionChange = (resolution: ImageResolution) => {  
    setResolution(resolution);  
  }
  const handleGenerate = async () => {
    const newGenerationId = await generate({
      prompt,
      settings: {
        height:imgResolution.height,
        width:imgResolution.width,
        seed:seed,
        model:model,
        nImages:noOfImages 
      }
    });
    
    if (newGenerationId) {
      setGenerationId(newGenerationId);
    }
  
  };

  return (
    <div className="min-h-screen bg-white">
     
      
      {/* Main Content */}
      <main className="pt-[60px] px-4 sm:px-8 md:px-16 lg:px-[120px]">
        <div className="flex flex-col-reverse lg:flex-row gap-8 py-6">
          {/* Left Sidebar - Settings */}
          <div className="w-full lg:w-[400px] lg:flex-shrink-0">
            {/* Model Settings */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              {/* Model Version */}
              <div className="mb-6">
                <h3 className="text-base font-medium text-gray-700">Model</h3>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="mt-2 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-[#FFA41D] focus:border-[#FFA41D] rounded-md"
                >
                  <option value="1.1">Flux 1.1</option>
                </select>
              </div>

              {/* Image Settings */}
              <div className="mb-6">
                <h3 className="text-base font-medium text-gray-700">Image Settings</h3>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <button className="aspect-square border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFA41D] relative group" onClick={() => handleResolutionChange(ImageResolutions.SQUARE)} >
                    <div className="absolute inset-2 bg-gray-100 rounded group-hover:bg-gray-200 transition-colors"></div>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-700">1:1</span>
                  </button>
                  <button className="aspect-[9/5] border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFA41D] relative group  " onClick={() => handleResolutionChange(ImageResolutions.LANDSCAPE)} >
                    <div className="absolute inset-2 bg-gray-100 rounded group-hover:bg-gray-200 transition-colors"></div>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-700">9:5</span>
                  </button>
                  <button className="aspect-[9/16] border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFA41D] relative group " onClick={() => handleResolutionChange(ImageResolutions.PORTRAIT)} >
                    <div className="absolute inset-2 bg-gray-100 rounded group-hover:bg-gray-200 transition-colors"></div>
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
                      onClick={()=>setNoOfImages(num)} 
                      className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFA41D]"
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
                  <p className="mt-1 text-sm text-gray-500">
                    Your generations will appear here
                  </p>
                </div>
                <button className="bg-[#FFA41D] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors">
                  Upgrade
                </button>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1">
            {/* Text Input and Generate Button */}
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
                  disabled={isLoading}
                  className="bg-[#FFA41D] text-white px-10 py-4 rounded-xl transition-colors font-medium m-2 hover:bg-opacity-90 disabled:bg-opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </div>

            {/* Generations Display Area */}
            <div className="mt-6 bg-white rounded-xl p-6 shadow-sm min-h-[400px]">
              {/* Show generated image if available */}
              {imageUrl ? (
                <div className="flex justify-center">
                  <img src={imageUrl} alt="Generated" className="max-w-full rounded-lg" />
                </div>
              ) : (
                /* Single Row of Image Placeholders */
                <div className="flex gap-4 h-full">
                  {[1, 2, 3, 4].map((_, i) => (
                    <div 
                      key={i} 
                      className="flex-1 aspect-square bg-gray-50 rounded-lg flex items-center justify-center relative overflow-hidden"
                      
                    >
                      <span className="material-symbols-outlined text-gray-200" style={{ fontSize: '120px' }}>
                        animated_images
                      </span>
                      {/* Skeleton Animation (shown when loading) */}
                      <div className={`absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 animate-shimmer ${isLoading ? '' : 'hidden'}`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent" 
                             style={{ 
                               backgroundSize: '200% 100%',
                               animation: 'shimmer 2s infinite linear'
                             }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;

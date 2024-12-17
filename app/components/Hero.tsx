"use client"
import { useState } from 'react';
import ImageDisplay from './ImageDisplay';

const Hero = () => {
  const [prompt, setPrompt] = useState('');

  return (
    <section className="w-full flex flex-col items-center justify-center pt-24 px-4">
      {/* Headline */}
      <h1 className="text-4xl md:text-6xl font-black text-center">
        Create art in seconds
      </h1>

      {/* Subheading */}
      <h2 className="text-lg md:text-[20px] mt-8 text-center font-bold">
        Type in what you imagine, no login required
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
            />
            <button 
              className="bg-[#FFA41D] text-white px-10 py-4 rounded-xl hover:bg-opacity-90 transition-colors font-medium m-2"
            >
              Generate
            </button>
          </div>
        </div>
      </div>

      {/* Image Display with Action Buttons */}
      <ImageDisplay />
    </section>
  );
};

export default Hero;

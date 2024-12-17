"use client"

const ImageDisplay = () => {
  return (
    <div className="flex flex-col items-center mt-12">
      {/* Image Container with aspect ratio */}
      <div className="relative w-[390px] h-[675px] bg-gray-100 rounded-xl overflow-hidden">
        {/* Placeholder image - replace src with actual image */}
        <img
          src="/placeholder.jpg"
          alt="Generated art"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-20 mt-6">
        {/* Refresh Button */}
        <button className="flex flex-col items-center group">
          <span className="material-symbols-outlined text-4xl opacity-50 text-[#DE3C4B] mb-2">
            refresh
          </span>
          <span className="text-[#666464] text-sm">Refresh</span>
        </button>

        {/* Download Button */}
        <button className="flex flex-col items-center group">
          <span className="material-symbols-outlined text-4xl opacity-50 text-[#3E7CB1] mb-2">
            download
          </span>
          <span className="text-[#666464] text-sm">Download</span>
        </button>
      </div>
    </div>
  );
};

export default ImageDisplay;

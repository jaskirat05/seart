import { Fragment } from 'react'

interface BonusPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BonusPointsModal({ isOpen, onClose }: BonusPointsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-[#FFA41D] bg-opacity-20 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[#FFA41D] text-2xl">
              redeem
            </span>
          </div>
          <h3 className="text-lg font-medium mb-2">Daily Bonus Points!</h3>
          <p className="text-gray-600 mb-4 text-center">
            You've received 10 bonus points for coming back today! Keep checking in daily for more bonus points.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#FFA41D] text-white rounded-lg hover:bg-opacity-80 transition-colors"
          >
            Awesome!
          </button>
        </div>
      </div>
    </div>
  );
}

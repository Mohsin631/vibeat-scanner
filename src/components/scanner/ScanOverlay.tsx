
import React from 'react';

interface ScanOverlayProps {
  isVisible: boolean;
}

const ScanOverlay = ({ isVisible }: ScanOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-48 h-48 border-2 border-white rounded-lg animate-pulse">
        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500"></div>
        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500"></div>
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500"></div>
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500"></div>
      </div>
    </div>
  );
};

export default ScanOverlay;

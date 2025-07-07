
import React from 'react';
import { XCircle } from 'lucide-react';

interface CameraErrorProps {
  error: string | null;
}

const CameraError = ({ error }: CameraErrorProps) => {
  if (!error) return null;

  return (
    <div className="p-4 rounded-lg border-2 bg-red-50 border-red-200 text-red-800">
      <div className="flex items-center space-x-3">
        <XCircle className="w-6 h-6 text-red-600" />
        <div>
          <p className="font-medium">Camera Error</p>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      </div>
    </div>
  );
};

export default CameraError;

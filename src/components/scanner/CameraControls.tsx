
import React from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Square, ScanLine } from 'lucide-react';
import { CameraControlsProps } from '@/types/scanner';

const CameraControls = ({ 
  isScanning, 
  cameraError, 
  hasScannedTicket,
  onStartScanning, 
  onStopScanning,
  onScanNext
}: CameraControlsProps) => {
  if (hasScannedTicket) {
    return (
      <div className="space-y-3">
        <Button
          onClick={onScanNext}
          className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg"
        >
          <ScanLine className="w-5 h-5 mr-2" />
          Scan Next Ticket
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!isScanning ? (
        <Button
          onClick={onStartScanning}
          className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
          disabled={!!cameraError}
        >
          <Camera className="w-5 h-5 mr-2" />
          Start Camera
        </Button>
      ) : (
        <Button
          onClick={onStopScanning}
          variant="destructive"
          className="w-full h-12 text-lg"
        >
          <Square className="w-5 h-5 mr-2" />
          Stop Scanning
        </Button>
      )}
    </div>
  );
};

export default CameraControls;

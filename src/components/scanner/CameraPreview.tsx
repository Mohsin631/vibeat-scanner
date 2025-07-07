
import React, { useEffect } from 'react';
import { Camera } from 'lucide-react';
import { CameraPreviewProps } from '@/types/scanner';

const CameraPreview = ({ 
  isScanning, 
  onCameraReady, 
  onCameraError, 
  videoRef, 
  streamRef 
}: CameraPreviewProps) => {
  
  const startCamera = async () => {
    try {
      console.log('Requesting camera access...');
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser');
      }

      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera access granted, stream:', stream);
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video element not available'));
            return;
          }
          
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded');
            resolve();
          };
          
          videoRef.current.onerror = () => {
            reject(new Error('Video loading error'));
          };
        });
        
        if (videoRef.current) {
          await videoRef.current.play();
          console.log('Video playing successfully');
          onCameraReady();
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      let errorMessage = 'Unable to access camera. ';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage += 'Please allow camera permission and try again.';
        } else if (error.name === 'NotFoundError') {
          errorMessage += 'No camera found on this device.';
        } else if (error.name === 'NotSupportedError') {
          errorMessage += 'Camera is not supported in this browser.';
        } else {
          errorMessage += error.message;
        }
      }
      
      onCameraError(errorMessage);
    }
  };

  useEffect(() => {
    if (isScanning && !streamRef.current) {
      startCamera();
    }
  }, [isScanning]);

  return (
    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover ${isScanning ? 'block' : 'hidden'}`}
      />
      {!isScanning && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Camera preview will appear here</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraPreview;

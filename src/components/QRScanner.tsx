
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { QRScannerProps, ScanResult } from '@/types/scanner';
import CameraPreview from '@/components/scanner/CameraPreview';
import ScanOverlay from '@/components/scanner/ScanOverlay';
import ScanResultDisplay from '@/components/scanner/ScanResultDisplay';
import CameraControls from '@/components/scanner/CameraControls';
import CameraError from '@/components/scanner/CameraError';
import { stopCameraStream } from '@/utils/scannerUtils';
import { detectQRCode } from '@/utils/qrDetection';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const QRScanner = ({ onBack, eventName, eventId, token, onTokenExpired }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasScannedTicket, setHasScannedTicket] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const scanForQRCode = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) {
      return;
    }

    try {
      const qrData = detectQRCode(videoRef.current, canvasRef.current);
      
      if (qrData) {
        console.log('QR Code detected:', qrData);
        setIsProcessing(true);
        
        // Stop scanning immediately when QR is detected
        if (scanIntervalRef.current) {
          clearInterval(scanIntervalRef.current);
          scanIntervalRef.current = null;
        }
        setIsScanning(false);
        setHasScannedTicket(true);

        try {
          const response = await apiService.scanTicket(token, qrData, eventId);
          
          setScanResult({
            type: 'success',
            message: response.message,
            attendeeName: response.ticket?.attendee_name,
            attendeeEmail: response.ticket?.attendee_email,
            scanTime: response.ticket?.scan_time || new Date().toISOString()
          });

          toast({
            title: "Success",
            description: `Ticket scanned successfully for ${response.ticket?.attendee_name}`,
          });

        } catch (error) {
          console.error('Error scanning ticket:', error);
          
          // Check for token expiration
          if (error instanceof Error && (error.message === 'Unauthorized' || error.message.includes('token'))) {
            toast({
              title: "Session Expired",
              description: "Please login again.",
              variant: "destructive",
            });
            onTokenExpired();
            return;
          }
          
          setScanResult({
            type: 'error',
            message: error instanceof Error ? error.message : 'Failed to scan ticket'
          });

          toast({
            title: "Scan Failed",
            description: error instanceof Error ? error.message : 'Failed to scan ticket',
            variant: "destructive",
          });
        }

        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error detecting QR code:', error);
    }
  }, [token, eventId, isProcessing, toast, onTokenExpired]);

  useEffect(() => {
    if (isScanning && !isProcessing) {
      scanIntervalRef.current = setInterval(scanForQRCode, 100);
    } else if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
    };
  }, [isScanning, isProcessing, scanForQRCode]);

  useEffect(() => {
    return () => {
      stopCameraStream(streamRef, videoRef);
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, []);

  const handleCameraReady = () => {
    setIsScanning(true);
  };

  const handleCameraError = (error: string) => {
    setCameraError(error);
  };

  const handleStartScanning = () => {
    setCameraError(null);
    setScanResult(null);
    setIsProcessing(false);
    setHasScannedTicket(false);
    setIsScanning(true);
  };

  const handleStopScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    stopCameraStream(streamRef, videoRef);
    setIsScanning(false);
    setCameraError(null);
    setIsProcessing(false);
    setHasScannedTicket(false);
  };

  const handleScanNext = () => {
    setScanResult(null);
    setHasScannedTicket(false);
    setIsScanning(true);
  };

  return (
    <div className="min-h-screen gradient-bg-primary">
      <div className="glass-effect border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="mr-4 p-2 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">Vibeat QR Scanner</h1>
              <p className="text-sm text-gray-200">{eventName}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <Card className="w-full max-w-md glass-effect gradient-bg-card border-white/20 shadow-2xl">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Camera Preview */}
              <div className="relative">
                <CameraPreview
                  isScanning={isScanning}
                  onCameraReady={handleCameraReady}
                  onCameraError={handleCameraError}
                  videoRef={videoRef}
                  streamRef={streamRef}
                />
                <ScanOverlay isVisible={isScanning && !isProcessing} />
                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <p className="text-sm">Processing...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Hidden canvas for QR detection */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Camera Error */}
              <CameraError error={cameraError} />

              {/* Scan Result */}
              <ScanResultDisplay scanResult={scanResult} />

              {/* Controls */}
              <CameraControls
                isScanning={isScanning}
                cameraError={cameraError}
                hasScannedTicket={hasScannedTicket}
                onStartScanning={handleStartScanning}
                onStopScanning={handleStopScanning}
                onScanNext={handleScanNext}
              />

              <div className="text-center text-sm text-gray-200">
                <p>Position QR code within the frame to scan</p>
                {isProcessing && (
                  <p className="text-blue-300 mt-2 font-medium">
                    Processing QR code...
                  </p>
                )}
                {cameraError && (
                  <p className="text-red-300 mt-2">
                    Make sure to allow camera permission in your browser settings
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QRScanner;

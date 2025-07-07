
import { ScanResult } from '@/types/scanner';

export const simulateScanResult = (): ScanResult => {
  const results: ScanResult[] = [
    { type: 'success', message: 'Ticket verified successfully!', attendeeName: 'John Doe' },
    { type: 'error', message: 'Invalid ticket or already scanned' },
    { type: 'warning', message: 'Ticket valid but for different event', attendeeName: 'Jane Smith' }
  ];
  return results[Math.floor(Math.random() * results.length)];
};

export const stopCameraStream = (streamRef: React.MutableRefObject<MediaStream | null>, videoRef: React.RefObject<HTMLVideoElement>) => {
  console.log('Stopping camera...');
  
  if (streamRef.current) {
    streamRef.current.getTracks().forEach(track => {
      console.log('Stopping track:', track);
      track.stop();
    });
    streamRef.current = null;
  }
  
  if (videoRef.current) {
    videoRef.current.srcObject = null;
  }
};

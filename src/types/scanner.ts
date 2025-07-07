export interface QRScannerProps {
  onBack: () => void;
  eventName: string;
  eventId: number;
  token: string;
  onTokenExpired: () => void;
}

export type ScanResult = {
  type: 'success' | 'error' | 'warning';
  message: string;
  attendeeName?: string;
  attendeeEmail?: string;
  scanTime?: string;
};

export interface CameraPreviewProps {
  isScanning: boolean;
  onCameraReady: () => void;
  onCameraError: (error: string) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  streamRef: React.MutableRefObject<MediaStream | null>;
}

export interface ScanResultDisplayProps {
  scanResult: ScanResult | null;
}

export interface CameraControlsProps {
  isScanning: boolean;
  cameraError: string | null;
  hasScannedTicket: boolean;
  onStartScanning: () => void;
  onStopScanning: () => void;
  onScanNext: () => void;
}

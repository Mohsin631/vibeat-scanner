
import jsQR from 'jsqr';

export const detectQRCode = (videoElement: HTMLVideoElement, canvas: HTMLCanvasElement): string | null => {
  const context = canvas.getContext('2d');
  if (!context || !videoElement.videoWidth || !videoElement.videoHeight) {
    return null;
  }

  // Set canvas dimensions to match video
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  // Draw current video frame to canvas
  context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

  // Get image data from canvas
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

  // Detect QR code
  const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

  return qrCode ? qrCode.data : null;
};

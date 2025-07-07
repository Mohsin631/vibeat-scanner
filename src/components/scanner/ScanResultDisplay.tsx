
import React from 'react';
import { CheckCircle, XCircle, AlertCircle, User, Mail, Clock } from 'lucide-react';
import { ScanResultDisplayProps } from '@/types/scanner';

const ScanResultDisplay = ({ scanResult }: ScanResultDisplayProps) => {
  if (!scanResult) return null;

  const getScanResultIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getScanResultColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const formatScanTime = (scanTime?: string) => {
    if (!scanTime) return 'Just now';
    
    try {
      const date = new Date(scanTime);
      return date.toLocaleString();
    } catch {
      return scanTime;
    }
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${getScanResultColor(scanResult.type)} transition-all duration-300`}>
      <div className="space-y-3">
        {/* Header with icon and message */}
        <div className="flex items-center space-x-3">
          {getScanResultIcon(scanResult.type)}
          <p className="font-medium">{scanResult.message}</p>
        </div>

        {/* Attendee Details for Success */}
        {scanResult.type === 'success' && (scanResult.attendeeName || scanResult.attendeeEmail) && (
          <div className="space-y-2 pl-9">
            {scanResult.attendeeName && (
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 opacity-70" />
                <span className="text-sm font-medium">{scanResult.attendeeName}</span>
              </div>
            )}
            
            {scanResult.attendeeEmail && (
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 opacity-70" />
                <span className="text-sm">{scanResult.attendeeEmail}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 opacity-70" />
              <span className="text-sm">Scanned: {formatScanTime(scanResult.scanTime)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanResultDisplay;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, QrCode, Users, BarChart3, Settings } from 'lucide-react';
import { Event } from '@/services/api';

interface EventManagementProps {
  event: Event;
  onBack: () => void;
  onScanQR: () => void;
  onViewAttendees: () => void;
}

const EventManagement = ({ event, onBack, onScanQR, onViewAttendees }: EventManagementProps) => {
  const scanProgress = event.total_tickets > 0 ? (event.scanned_tickets / event.total_tickets) * 100 : 0;

  const truncateLocation = (location: string, maxLength: number = 30) => {
    if (location.length <= maxLength) return location;
    return location.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen gradient-bg-primary">
      <div className="glass-effect border-b border-white/20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="mr-3 sm:mr-4 p-2 text-white hover:bg-white/10 flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
              <img 
                src={event.thumbnail} 
                alt={event.event_name}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border border-white/20 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-white truncate">
                  {event.event_name}
                </h1>
                <p className="text-xs sm:text-sm text-gray-200 font-mono tracking-wider truncate">
                  {new Date(event.start_date).toLocaleDateString()} • {truncateLocation(event.location)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="glass-effect gradient-bg-card border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Attendees</CardTitle>
              <Users className="h-4 w-4 text-white/70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{event.total_tickets}</div>
            </CardContent>
          </Card>
          
          <Card className="glass-effect gradient-bg-card border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Scanned Tickets</CardTitle>
              <QrCode className="h-4 w-4 text-white/70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-300">{event.scanned_tickets}</div>
            </CardContent>
          </Card>
          
          <Card className="glass-effect gradient-bg-card border-white/20 sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Check-in Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-white/70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{scanProgress.toFixed(1)}%</div>
              <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="glass-effect gradient-bg-card hover:bg-white/20 transition-all duration-300 border-white/20 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-lg flex items-center justify-center glass-effect">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-white text-lg">Scan QR Codes</CardTitle>
                  <p className="text-sm text-gray-200 break-words">Scan attendee tickets for check-in</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={onScanQR}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 h-12 text-base sm:text-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Scanning
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-effect gradient-bg-card hover:bg-white/20 transition-all duration-300 border-white/20 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500/30 to-blue-500/30 rounded-lg flex items-center justify-center glass-effect">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-white text-lg">View Attendees</CardTitle>
                  <p className="text-sm text-gray-200 break-words">Manage attendee list and status</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={onViewAttendees}
                className="w-full glass-effect border border-white/30 bg-white/10 text-white hover:bg-white/20 font-semibold backdrop-blur-xl h-12 text-base sm:text-lg"
              >
                View List
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EventManagement;

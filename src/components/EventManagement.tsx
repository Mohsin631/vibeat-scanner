
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

  const truncateLocation = (location: string, maxWords: number = 3) => {
    const words = location.split(' ');
    if (words.length <= maxWords) return location;
    return words.slice(0, maxWords).join(' ') + '...';
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
            <div className="flex items-center space-x-4 flex-1">
              <img 
                src={event.thumbnail} 
                alt={event.event_name}
                className="w-12 h-12 rounded-lg object-cover border border-white/20"
              />
              <div className="flex-1">
                <h1 className="text-xl font-bold text-white">{event.event_name}</h1>
                <p className="text-sm text-gray-200 font-mono tracking-wider">
                  {new Date(event.start_date).toLocaleDateString()} • {truncateLocation(event.location)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
          
          <Card className="glass-effect gradient-bg-card border-white/20">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-effect gradient-bg-card hover:bg-white/20 transition-all duration-300 border-white/20 shadow-xl">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-lg flex items-center justify-center glass-effect">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white">Scan QR Codes</CardTitle>
                  <p className="text-sm text-gray-200">Scan attendee tickets for check-in</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={onScanQR}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 h-12 text-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Scanning
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-effect gradient-bg-card hover:bg-white/20 transition-all duration-300 border-white/20 shadow-xl">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500/30 to-blue-500/30 rounded-lg flex items-center justify-center glass-effect">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white">View Attendees</CardTitle>
                  <p className="text-sm text-gray-200">Manage attendee list and status</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={onViewAttendees}
                className="w-full glass-effect border border-white/30 bg-white/10 text-white hover:bg-white/20 font-semibold backdrop-blur-xl h-12 text-lg"
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

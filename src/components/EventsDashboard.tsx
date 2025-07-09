import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, Calendar, MapPin, Users, QrCode, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService, Event } from '@/services/api';

interface EventsDashboardProps {
  token: string;
  onSelectEvent: (event: Event) => void;
  onLogout: () => void;
}

const EventsDashboard = ({ token, onSelectEvent, onLogout }: EventsDashboardProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const eventsData = await apiService.getEvents(token);
        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast({
          title: "Error",
          description: "Failed to load events. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [token, toast]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateLocation = (location: string, maxLength: number = 25) => {
    if (location.length <= maxLength) return location;
    return location.substring(0, maxLength) + '...';
  };

  const getEventStatus = (startDate: string, endDate?: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    
    if (end) {
      // If we have end date, check if event is currently running or past
      if (now >= start && now <= end) {
        return { status: 'Live', className: 'bg-green-500/20 text-green-300 border-green-500/30' };
      } else if (now > end) {
        return { status: 'Past', className: 'bg-gray-500/20 text-gray-300 border-gray-500/30' };
      } else {
        return { status: 'Upcoming', className: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      }
    } else {
      // If no end date, just check if start date has passed
      if (now > start) {
        return { status: 'Past', className: 'bg-gray-500/20 text-gray-300 border-gray-500/30' };
      } else {
        return { status: 'Upcoming', className: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      }
    }
  };

  // Sort events: Upcoming first, then Live, then Past
  const sortedEvents = [...events].sort((a, b) => {
    const statusA = getEventStatus(a.start_date, a.end_date);
    const statusB = getEventStatus(b.start_date, b.end_date);
    
    const statusOrder = { 'Upcoming': 0, 'Live': 1, 'Past': 2 };
    const orderA = statusOrder[statusA.status as keyof typeof statusOrder];
    const orderB = statusOrder[statusB.status as keyof typeof statusOrder];
    
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    
    // Within same status, sort by date (upcoming events by start date ascending, past events by start date descending)
    if (statusA.status === 'Past') {
      return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
    }
    return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
  });

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg-primary flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
          <p className="text-white text-lg font-medium">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg-primary">
      {/* Header */}
      <div className="glass-effect border-b border-white/20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl blur-md opacity-60 animate-pulse"></div>
                <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-white relative z-10" />
                <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300 animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                  Vibeat Event Scanner
                </h1>
                <p className="text-xs sm:text-sm text-gray-200 font-medium">
                  Manage your events
                </p>
              </div>
            </div>
            
            <Button
              onClick={onLogout}
              variant="ghost"
              className="p-2 sm:p-3 text-white hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {sortedEvents.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-white/70" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">No Events Found</h2>
            <p className="text-gray-200 text-sm sm:text-base">You don't have any events to manage right now.</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Your Events</h2>
              <p className="text-gray-200 text-sm sm:text-base">Select an event to start scanning tickets</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {sortedEvents.map((event) => {
                const eventStatus = getEventStatus(event.start_date, event.end_date);
                
                return (
                  <Card 
                    key={event.id} 
                    className="glass-effect gradient-bg-card hover:bg-white/20 transition-all duration-300 border-white/20 shadow-xl cursor-pointer overflow-hidden"
                    onClick={() => onSelectEvent(event)}
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        {/* Event Image */}
                        <div className="w-full sm:w-32 h-32 sm:h-full flex-shrink-0">
                          <img 
                            src={event.thumbnail} 
                            alt={event.event_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Event Details */}
                        <div className="flex-1 p-4 sm:p-6 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="text-lg sm:text-xl font-bold text-white leading-tight break-words flex-1">
                                  {event.event_name}
                                </h3>
                                <Badge 
                                  className={`ml-2 text-xs px-2 py-1 flex-shrink-0 ${eventStatus.className}`}
                                >
                                  {eventStatus.status}
                                </Badge>
                              </div>
                              
                              <div className="space-y-2 mb-4">
                                <div className="flex items-center text-gray-200 text-sm">
                                  <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                                  <span className="break-words">{formatDate(event.start_date)}</span>
                                </div>
                                
                                <div className="flex items-start text-gray-200 text-sm">
                                  <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                  <span className="break-words leading-relaxed">
                                    {truncateLocation(event.location, 40)}
                                  </span>
                                </div>
                                
                                <div className="flex items-center text-gray-200 text-sm">
                                  <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                                  <span>{event.total_tickets} attendees</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Stats Badge */}
                            <div className="flex flex-row sm:flex-col gap-2 sm:gap-3 flex-shrink-0">
                              <Badge 
                                variant="secondary" 
                                className="bg-green-500/20 text-green-300 border-green-500/30 text-xs px-2 py-1"
                              >
                                {event.scanned_tickets} scanned
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className="text-white border-white/30 text-xs px-2 py-1"
                              >
                                {((event.scanned_tickets / event.total_tickets) * 100).toFixed(0)}% checked in
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="w-full bg-white/20 rounded-full h-2 mt-4">
                            <div 
                              className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${event.total_tickets > 0 ? (event.scanned_tickets / event.total_tickets) * 100 : 0}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsDashboard;

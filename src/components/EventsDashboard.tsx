
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, QrCode, BarChart3 } from 'lucide-react';
import { apiService, Event, Organizer } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface EventsDashboardProps {
  token: string;
  onSelectEvent: (event: Event) => void;
  onLogout: () => void;
}

const EventsDashboard = ({ token, onSelectEvent, onLogout }: EventsDashboardProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [organizerData, eventsData] = await Promise.all([
          apiService.getOrganizer(token),
          apiService.getEvents(token)
        ]);
        
        setOrganizer(organizerData);
        // Sort events: running (status "1") first, then past (status "2")
        const sortedEvents = eventsData.sort((a, b) => {
          if (a.status === "1" && b.status !== "1") return -1;
          if (a.status !== "1" && b.status === "1") return 1;
          return 0;
        });
        setEvents(sortedEvents);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error instanceof Error && error.message === 'Unauthorized') {
          toast({
            title: "Session Expired",
            description: "Please login again.",
            variant: "destructive",
          });
          onLogout();
        } else {
          toast({
            title: "Error",
            description: "Failed to load data. Please try again.",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token, onLogout, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white font-medium text-lg">Loading your events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg-primary">
      <div className="glass-effect border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <QrCode className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-1xl font-bold text-white">Vibeat Ticket Scanner</h1>
                <div className="flex items-center space-x-2">
                 
                  <p className="text-gray-200 font-medium">
                    {organizer ? `Welcome, ${organizer.name}` : 'Organizer Dashboard'}
                  </p>
                </div>
              </div>
            </div>
            <Button 
              onClick={onLogout}
              className="glass-effect border border-white/30 bg-white/10 text-white hover:bg-white/20 font-medium backdrop-blur-xl"
            >
              Log out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-3">Your Events</h2>
          <p className="text-gray-200 text-lg font-medium">Manage and scan tickets for your events</p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 glass-effect">
              <QrCode className="w-10 h-10 text-white/60" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">No events found</h3>
            <p className="text-gray-200 font-medium">You don't have any events yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card key={event.id} className="glass-effect gradient-bg-card hover:bg-white/15 transition-all duration-300 cursor-pointer border-white/20 shadow-xl hover:shadow-2xl transform hover:scale-[1.02]">
                <CardHeader>
                  <div className="flex items-start space-x-4 mb-3">
                    <img 
                      src={event.thumbnail} 
                      alt={event.event_name}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-white/20"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-xl truncate text-white font-bold">{event.event_name}</CardTitle>
                        <Badge 
                          variant={event.status === "1" ? "default" : "secondary"}
                          className={event.status === "1" 
                            ? "bg-green-500/80 hover:bg-green-600/80 text-white font-semibold" 
                            : "bg-gray-500/80 hover:bg-gray-600/80 text-white font-semibold"
                          }
                        >
                          {event.status === "1" ? "Running" : "Past"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="flex items-center space-x-2 text-gray-200">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">{new Date(event.start_date).toLocaleDateString()}</span>
                  </CardDescription>
                  <CardDescription className="font-mono tracking-wider text-sm text-gray-300">
                    {event.location}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-200 font-medium">Total Tickets:</span>
                    <span className="font-bold text-white">{event.total_tickets}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-200 font-medium">Scanned:</span>
                    <span className="font-bold text-green-400">{event.scanned_tickets}</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2.5">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ 
                        width: event.total_tickets > 0 
                          ? `${(event.scanned_tickets / event.total_tickets) * 100}%` 
                          : '0%' 
                      }}
                    ></div>
                  </div>
                  <Button 
                    onClick={() => onSelectEvent(event)}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold h-12 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Manage Event
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsDashboard;

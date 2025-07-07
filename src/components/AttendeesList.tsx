
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Search, CheckCircle, XCircle, Ticket } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { apiService, Attendee } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface AttendeesListProps {
  onBack: () => void;
  eventName: string;
  eventId: string;
  token: string;
}

interface GroupedBooking {
  booking_id: string;
  attendees: Attendee[];
}

const AttendeesList = ({ onBack, eventName, eventId, token }: AttendeesListProps) => {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [groupedBookings, setGroupedBookings] = useState<GroupedBooking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<GroupedBooking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching attendees for event:', eventId);
        const attendeeData = await apiService.getEventAttendees(eventId, token);
        console.log('Attendees data received:', attendeeData);
        setAttendees(attendeeData);
        
        // Group by booking_id
        const grouped = attendeeData.reduce((acc: { [key: string]: Attendee[] }, attendee) => {
          if (!acc[attendee.booking_id]) {
            acc[attendee.booking_id] = [];
          }
          acc[attendee.booking_id].push(attendee);
          return acc;
        }, {});

        const groupedArray = Object.entries(grouped).map(([booking_id, attendees]) => ({
          booking_id,
          attendees: attendees.sort((a, b) => a.id - b.id) // Sort by ticket id
        }));

        setGroupedBookings(groupedArray);
        setFilteredBookings(groupedArray);
      } catch (error) {
        console.error('Error fetching attendees:', error);
        toast({
          title: "Error",
          description: "Failed to load attendees. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendees();
  }, [eventId, token, toast]);

  useEffect(() => {
    const filtered = groupedBookings.filter(booking =>
      booking.attendees.some(attendee =>
        attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.booking_id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredBookings(filtered);
  }, [searchTerm, groupedBookings]);

  const checkedInCount = attendees.filter(attendee => attendee.scanned).length;
  const totalCount = attendees.length;

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white font-medium text-lg">Loading attendees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg-primary">
      {/* Header */}
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
              <div className="w-12 h-12 bg-gradient-to-br from-green-500/30 to-blue-500/30 rounded-lg flex items-center justify-center glass-effect">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-white">Attendees List</h1>
                <p className="text-sm text-gray-200 font-mono tracking-wider">
                  {eventName}
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
              <div className="text-2xl font-bold text-white">{totalCount}</div>
            </CardContent>
          </Card>
          
          <Card className="glass-effect gradient-bg-card border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Checked In</CardTitle>
              <CheckCircle className="h-4 w-4 text-white/70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-300">{checkedInCount}</div>
            </CardContent>
          </Card>
          
          <Card className="glass-effect gradient-bg-card border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Check-in Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-white/70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {totalCount > 0 ? ((checkedInCount / totalCount) * 100).toFixed(1) : '0'}%
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: totalCount > 0 ? `${(checkedInCount / totalCount) * 100}%` : '0%' 
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="glass-effect gradient-bg-card border-white/20 mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by name, email, or booking ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass-effect border-white/30 bg-white/10 text-white placeholder:text-white/60 focus:border-white/50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <div className="grid gap-6">
          {filteredBookings.length === 0 ? (
            <Card className="glass-effect gradient-bg-card border-white/20">
              <CardContent className="text-center py-12">
                <Users className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  {searchTerm ? 'No bookings found' : 'No bookings yet'}
                </h3>
                <p className="text-gray-300">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Bookings will appear here once tickets are issued'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredBookings.map((booking) => (
              <Card key={booking.booking_id} className="glass-effect gradient-bg-card border-white/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-lg flex items-center justify-center glass-effect">
                      <Ticket className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-white">Booking ID: {booking.booking_id}</CardTitle>
                      <CardDescription className="text-gray-300">
                        {booking.attendees.length} ticket{booking.attendees.length > 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {booking.attendees.map((attendee, index) => (
                    <div key={attendee.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500/30 to-blue-500/30 rounded-full flex items-center justify-center glass-effect">
                          <span className="text-xs font-bold text-white">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">Ticket {index + 1}</h4>
                          <p className="text-sm text-gray-300">{attendee.name}</p>
                          <p className="text-xs text-gray-400 font-mono">{attendee.email}</p>
                          {attendee.ticket_type && (
                            <p className="text-xs text-gray-400 mt-1">Type: {attendee.ticket_type}</p>
                          )}
                        </div>
                      </div>
                      <Badge 
                        variant={attendee.scanned ? "default" : "secondary"}
                        className={attendee.scanned 
                          ? "bg-green-500/80 hover:bg-green-600/80 text-white font-semibold" 
                          : "bg-gray-500/80 hover:bg-gray-600/80 text-white font-semibold"
                        }
                      >
                        {attendee.scanned ? (
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>Checked In</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <XCircle className="w-3 h-3" />
                            <span>Not Checked</span>
                          </div>
                        )}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendeesList;

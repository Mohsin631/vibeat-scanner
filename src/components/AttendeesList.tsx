
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { ArrowLeft, Search, Users, CheckCircle, XCircle, Clock, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService, PaginatedAttendeesResponse, Ticket } from '@/services/api';

interface Attendee {
  id: string;
  name: string;
  email: string;
  phone: string;
  ticket_type: string;
  is_scanned: boolean;
  scanned_at: string | null;
  registration_date: string;
  booking_id: string;
  ticket_number: number;
}

interface AttendeesListProps {
  eventName: string;
  eventId: string;
  token: string;
  onBack: () => void;
}

const AttendeesList = ({ eventName, eventId, token, onBack }: AttendeesListProps) => {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [filteredAttendees, setFilteredAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'checked-in' | 'pending'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAttendees, setTotalAttendees] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        setIsLoading(true);
        const attendeesData: PaginatedAttendeesResponse = await apiService.getEventAttendeesPaginated(eventId, token, currentPage);
        
        // Group by booking_id and assign ticket numbers
        const bookingGroups: { [key: string]: Ticket[] } = {};
        attendeesData.data.forEach((ticket) => {
          if (!bookingGroups[ticket.booking_id]) {
            bookingGroups[ticket.booking_id] = [];
          }
          bookingGroups[ticket.booking_id].push(ticket);
        });

        // Transform the API response to match our Attendee interface with ticket numbering
        const transformedAttendees: Attendee[] = [];
        Object.keys(bookingGroups).forEach((bookingId) => {
          const bookingTickets = bookingGroups[bookingId];
          bookingTickets.forEach((ticket, index) => {
            transformedAttendees.push({
              id: ticket.id.toString(),
              name: ticket.attendee_name,
              email: ticket.attendee_email,
              phone: '', // Phone not available in current API response
              ticket_type: ticket.ticket_type || 'General',
              is_scanned: ticket.scan_status === 1,
              scanned_at: ticket.scan_time,
              registration_date: ticket.created_at,
              booking_id: ticket.booking_id,
              ticket_number: index + 1,
            });
          });
        });
        
        setAttendees(transformedAttendees);
        setTotalPages(attendeesData.last_page);
        setTotalAttendees(attendeesData.total);
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
  }, [eventId, token, currentPage, toast]);

  useEffect(() => {
    let filtered = attendees;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(attendee =>
        attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendee.booking_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter === 'checked-in') {
      filtered = filtered.filter(attendee => attendee.is_scanned);
    } else if (statusFilter === 'pending') {
      filtered = filtered.filter(attendee => !attendee.is_scanned);
    }

    setFilteredAttendees(filtered);
  }, [attendees, searchTerm, statusFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const checkedInCount = attendees.filter(a => a.is_scanned).length;
  const pendingCount = attendees.length - checkedInCount;

  // Group filtered attendees by booking_id for display
  const groupedAttendees = filteredAttendees.reduce((groups: { [key: string]: Attendee[] }, attendee) => {
    if (!groups[attendee.booking_id]) {
      groups[attendee.booking_id] = [];
    }
    groups[attendee.booking_id].push(attendee);
    return groups;
  }, {});

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <PaginationItem key={page}>
          <PaginationLink
            onClick={() => handlePageChange(page)}
            isActive={currentPage === page}
            className={`cursor-pointer ${
              currentPage === page 
                ? 'bg-white/20 text-white border-white/30' 
                : 'text-white/70 hover:bg-white/10 hover:text-white border-white/20'
            }`}
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg-primary flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
          <p className="text-white text-lg font-medium">Loading attendees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg-primary">
      {/* Header */}
      <div className="glass-effect border-b border-white/20">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="mr-3 sm:mr-4 p-2 text-white hover:bg-white/10 flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-white truncate">
                Attendees
              </h1>
              <p className="text-xs sm:text-sm text-gray-200 truncate">
                {truncateText(eventName, 40)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <Card className="glass-effect gradient-bg-card border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-white flex items-center">
                <Users className="w-4 h-4 mr-1" />
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-white">{totalAttendees}</div>
            </CardContent>
          </Card>
          
          <Card className="glass-effect gradient-bg-card border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-white flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                Checked In
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-300">{checkedInCount}</div>
            </CardContent>
          </Card>
          
          <Card className="glass-effect gradient-bg-card border-white/20 col-span-2 sm:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-white flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-orange-300">{pendingCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="glass-effect gradient-bg-card border-white/20 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search by name, email, or booking ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 glass-effect bg-white/10 border-white/20 text-white placeholder:text-gray-300 text-sm sm:text-base"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-2 text-xs sm:text-sm glass-effect border border-white/20 transition-all ${statusFilter === 'all' 
                    ? 'bg-white/20 text-white border-white/30' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                >
                  All
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setStatusFilter('checked-in')}
                  className={`px-3 py-2 text-xs sm:text-sm glass-effect border border-white/20 transition-all ${statusFilter === 'checked-in' 
                    ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                >
                  Checked In
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setStatusFilter('pending')}
                  className={`px-3 py-2 text-xs sm:text-sm glass-effect border border-white/20 transition-all ${statusFilter === 'pending' 
                    ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                >
                  Pending
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendees List */}
        <Card className="glass-effect gradient-bg-card border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-lg sm:text-xl flex items-center justify-between">
              <span>Attendees ({filteredAttendees.length})</span>
              <span className="text-sm font-normal text-white/70">
                Page {currentPage} of {totalPages}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[50vh]">
              {Object.keys(groupedAttendees).length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Users className="w-12 h-12 text-white/50 mx-auto mb-4" />
                  <p className="text-white/70 text-sm sm:text-base">
                    {searchTerm || statusFilter !== 'all' ? 'No attendees match your search.' : 'No attendees found.'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {Object.entries(groupedAttendees).map(([bookingId, tickets]) => (
                    <div key={bookingId} className="p-4 hover:bg-white/5 transition-colors">
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-medium text-sm sm:text-base">
                            Booking ID: {bookingId}
                          </h4>
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                            {tickets.length} {tickets.length === 1 ? 'Ticket' : 'Tickets'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {tickets.map((attendee) => (
                          <div key={attendee.id} className="bg-white/5 rounded-lg p-3">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                  <div className="flex items-center gap-2">
                                    <h5 className="font-semibold text-white text-sm sm:text-base break-words">
                                      {attendee.name}
                                    </h5>
                                    <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30 text-xs flex-shrink-0">
                                      Ticket {attendee.ticket_number}
                                    </Badge>
                                  </div>
                                  <Badge
                                    variant={attendee.is_scanned ? 'default' : 'outline'}
                                    className={`text-xs px-2 py-1 flex-shrink-0 w-fit ${
                                      attendee.is_scanned
                                        ? 'bg-green-500/20 text-green-300 border-green-500/30'
                                        : 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                                    }`}
                                  >
                                    {attendee.is_scanned ? (
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                    ) : (
                                      <Clock className="w-3 h-3 mr-1" />
                                    )}
                                    {attendee.is_scanned ? 'Checked In' : 'Pending'}
                                  </Badge>
                                </div>
                                
                                <div className="space-y-1 text-xs sm:text-sm text-gray-300">
                                  <p className="break-words">{attendee.email}</p>
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                                    <span>Type: {attendee.ticket_type}</span>
                                    {attendee.is_scanned && attendee.scanned_at && (
                                      <span className="text-green-300">
                                        Scanned: {formatDate(attendee.scanned_at)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card className="glass-effect gradient-bg-card border-white/20 mt-6">
            <CardContent className="p-4">
              <Pagination className="w-full">
                <PaginationContent className="flex items-center justify-center gap-2">
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={`cursor-pointer ${
                        currentPage === 1 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      } border-white/20`}
                    />
                  </PaginationItem>
                  
                  {renderPaginationItems()}
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={`cursor-pointer ${
                        currentPage === totalPages 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      } border-white/20`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AttendeesList;

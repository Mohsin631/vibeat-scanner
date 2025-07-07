
const BASE_URL = 'https://vibeat.io/api/v1/scanner';

export interface LoginResponse {
  token?: string;
  message?: string;
}

export interface Organizer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  thumbnail: string;
}

export interface Event {
  id: number;
  event_name: string;
  start_date: string;
  status: string;
  location: string;
  thumbnail: string;
  total_tickets: number;
  scanned_tickets: number;
}

export interface Ticket {
  id: number;
  booking_id: string;
  ticket_id: string;
  attendee_name: string;
  attendee_email: string;
  ticket_type: string;
  scan_status: number;
  scan_time: string | null;
  created_at: string;
}

export interface Attendee {
  id: number;
  name: string;
  email: string;
  booking_id: string;
  ticket_type?: string;
  scanned: boolean;
}

export const apiService = {
  async getAccessToken(otp: string): Promise<LoginResponse> {
    const response = await fetch(`${BASE_URL}/get-access-token?otp=${otp}`);
    return await response.json();
  },

  async getOrganizer(token: string): Promise<Organizer> {
    const response = await fetch(`${BASE_URL}/organizer?token=${token}`);
    const data = await response.json();
    
    if (data.message === 'Unauthorized') {
      throw new Error('Unauthorized');
    }
    
    return data;
  },

  async getEvents(token: string): Promise<Event[]> {
    const response = await fetch(`${BASE_URL}/events?token=${token}`);
    const data = await response.json();
    
    if (data.message === 'Unauthorized') {
      throw new Error('Unauthorized');
    }
    
    return data;
  },

  async getTickets(eventId: number, token: string): Promise<Ticket[]> {
    const response = await fetch(`${BASE_URL}/tickets/${eventId}?token=${token}`);
    const data = await response.json();
    
    if (data.message === 'Unauthorized') {
      throw new Error('Unauthorized');
    }
    
    return data;
  },

  async getEventAttendees(eventId: string, token: string): Promise<Attendee[]> {
    const response = await fetch(`${BASE_URL}/tickets/${eventId}?token=${token}`);
    const data = await response.json();
    
    if (data.message === 'Unauthorized') {
      throw new Error('Unauthorized');
    }
    
    // Transform tickets to attendees format
    return data.map((ticket: Ticket) => ({
      id: ticket.id,
      name: ticket.attendee_name,
      email: ticket.attendee_email,
      booking_id: ticket.booking_id,
      ticket_type: ticket.ticket_type,
      scanned: ticket.scan_status === 1
    }));
  },

  async scanTicket(token: string, qrCode: string, eventId: number): Promise<{
    message: string;
    ticket?: Ticket;
  }> {
    const response = await fetch(`${BASE_URL}/scan-ticket?token=${token}&qr_code=${encodeURIComponent(qrCode)}&event_id=${eventId}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to scan ticket');
    }
    
    return data;
  }
};

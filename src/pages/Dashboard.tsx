
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import EventsDashboard from '@/components/EventsDashboard';
import EventManagement from '@/components/EventManagement';
import QRScanner from '@/components/QRScanner';
import AttendeesList from '@/components/AttendeesList';
import { Event } from '@/services/api';

type DashboardState = 'dashboard' | 'event-management' | 'qr-scanner' | 'attendees';

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentState, setCurrentState] = useState<DashboardState>('dashboard');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [authToken, setAuthToken] = useState<string>('');
  const [refreshEventData, setRefreshEventData] = useState(0);

  // Check for authentication on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('vibeat_token');
    const stateToken = location.state?.token;
    
    if (stateToken) {
      setAuthToken(stateToken);
    } else if (storedToken) {
      setAuthToken(storedToken);
    } else {
      // No token found, redirect to login
      navigate('/login');
      return;
    }

    // Clear the state to prevent re-triggering
    if (location.state) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('vibeat_token');
    setSelectedEvent(null);
    setAuthToken('');
    setRefreshEventData(0);
    navigate('/login');
  };

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    setCurrentState('event-management');
  };

  const handleBackToDashboard = () => {
    setCurrentState('dashboard');
    setSelectedEvent(null);
    // Trigger refresh of dashboard data
    setRefreshEventData(prev => prev + 1);
  };

  const handleScanQR = () => {
    setCurrentState('qr-scanner');
  };

  const handleViewAttendees = () => {
    setCurrentState('attendees');
  };

  const handleBackToEventManagement = () => {
    setCurrentState('event-management');
    // Trigger refresh of event data when coming back from scanner or attendees
    setRefreshEventData(prev => prev + 1);
  };

  const handleTokenExpired = () => {
    handleLogout();
  };

  // Don't render anything if no token
  if (!authToken) {
    return null;
  }

  switch (currentState) {
    case 'dashboard':
      return (
        <EventsDashboard 
          token={authToken}
          onSelectEvent={handleSelectEvent}
          onLogout={handleLogout}
          key={refreshEventData} // Force re-render when data needs refresh
        />
      );
    
    case 'event-management':
      return selectedEvent ? (
        <EventManagement
          event={selectedEvent}
          onBack={handleBackToDashboard}
          onScanQR={handleScanQR}
          onViewAttendees={handleViewAttendees}
          key={refreshEventData} // Force re-render when data needs refresh
        />
      ) : null;
    
    case 'qr-scanner':
      return selectedEvent ? (
        <QRScanner
          onBack={handleBackToEventManagement}
          eventName={selectedEvent.event_name}
          eventId={selectedEvent.id}
          token={authToken}
          onTokenExpired={handleTokenExpired}
        />
      ) : null;
    
    case 'attendees':
      return selectedEvent ? (
        <AttendeesList
          onBack={handleBackToEventManagement}
          eventName={selectedEvent.event_name}
          eventId={selectedEvent.id.toString()}
          token={authToken}
        />
      ) : null;
    
    default:
      return (
        <EventsDashboard 
          token={authToken}
          onSelectEvent={handleSelectEvent}
          onLogout={handleLogout}
          key={refreshEventData}
        />
      );
  }
};

export default Dashboard;

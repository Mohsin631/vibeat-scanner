
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Login from '@/components/Login';
import EventsDashboard from '@/components/EventsDashboard';
import EventManagement from '@/components/EventManagement';
import QRScanner from '@/components/QRScanner';
import AttendeesList from '@/components/AttendeesList';
import { Event } from '@/services/api';

type AppState = 'login' | 'dashboard' | 'event-management' | 'qr-scanner' | 'attendees';

const Index = () => {
  const location = useLocation();
  const [currentState, setCurrentState] = useState<AppState>('login');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [authToken, setAuthToken] = useState<string>('');
  const [refreshEventData, setRefreshEventData] = useState(0);

  // Handle auto-login from direct login route
  useEffect(() => {
    if (location.state?.autoLogin && location.state?.token) {
      console.log('Auto-login triggered with token:', location.state.token);
      setAuthToken(location.state.token);
      setCurrentState('dashboard');
      
      // Clear the state to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleLogin = (token: string) => {
    console.log('Login with token:', token);
    setAuthToken(token);
    setCurrentState('dashboard');
  };

  const handleLogout = () => {
    setCurrentState('login');
    setSelectedEvent(null);
    setAuthToken('');
    setRefreshEventData(0);
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

  switch (currentState) {
    case 'login':
      return <Login onLogin={handleLogin} />;
    
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
      return <Login onLogin={handleLogin} />;
  }
};

export default Index;

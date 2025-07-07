
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginComponent from '@/components/Login';

const Login = () => {
  const navigate = useNavigate();

  // Check if user is already logged in on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('vibeat_token');
    if (storedToken) {
      // User is already logged in, redirect to dashboard
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLogin = (token: string) => {
    console.log('Login with token:', token);
    navigate('/dashboard', { state: { token } });
  };

  return <LoginComponent onLogin={handleLogin} />;
};

export default Login;

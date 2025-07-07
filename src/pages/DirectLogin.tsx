
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DirectLogin = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const handleDirectLogin = async () => {
      const otp = searchParams.get('otp');
      
      if (!otp) {
        toast({
          title: "Invalid URL",
          description: "No OTP provided in the URL.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      if (otp.length !== 10) {
        toast({
          title: "Invalid OTP",
          description: "OTP must be 10 digits long.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      try {
        const response = await fetch(`https://vibeat.io/api/v1/scanner/get-access-token?otp=${otp}`);
        const data = await response.json();
        
        if (data.token) {
          // Store token and redirect to dashboard with token
          sessionStorage.setItem('vibeat_token', data.token);
          toast({
            title: "Login Successful",
            description: "Redirecting to dashboard...",
          });
          
          // Navigate to main app with token in state
          navigate('/', { 
            state: { 
              autoLogin: true, 
              token: data.token 
            } 
          });
        } else if (data.message) {
          toast({
            title: "Login Failed",
            description: data.message,
            variant: "destructive",
          });
          navigate('/');
        }
      } catch (error) {
        console.error('Direct login error:', error);
        toast({
          title: "Network Error",
          description: "Please check your connection and try again.",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    handleDirectLogin();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg-primary relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-2xl animate-[float_6s_ease-in-out_infinite]"></div>
        <div className="absolute top-40 right-20 w-80 h-80 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-2xl animate-[float_8s_ease-in-out_infinite] [animation-delay:2s]"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-2xl animate-[float_7s_ease-in-out_infinite] [animation-delay:4s]"></div>
      </div>

      <Card className="w-full max-w-md relative glass-effect gradient-bg-card shadow-2xl">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl blur-xl opacity-60 animate-pulse"></div>
            <QrCode className="w-12 h-12 text-white relative z-10" />
          </div>
          
          <div className="space-y-3">
            <CardTitle className="text-4xl font-bold text-white">
              Vibeat Ticket Scanner
            </CardTitle>
            <CardDescription className="text-gray-200 text-lg font-medium">
              {isLoading ? "Logging you in..." : "Redirecting..."}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-8 pb-8">
          <div className="flex justify-center">
            <div className="flex items-center space-x-3">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
              <span className="text-white font-medium text-lg">Processing login...</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.05);
          }
        }
      `}</style>
    </div>
  );
};

export default DirectLogin;

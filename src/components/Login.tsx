
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { QrCode, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LoginProps {
  onLogin: (token: string) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 10) {
      setIsLoading(true);
      
      try {
        const response = await fetch(`https://vibeat.io/api/v1/scanner/get-access-token?otp=${otp}`);
        const data = await response.json();
        
        if (data.token) {
          // Store token in localStorage for persistence
          localStorage.setItem('vibeat_token', data.token);
          onLogin(data.token);
          toast({
            title: "Login Successful",
            description: "Welcome to Vibeat Ticket Scanner!",
          });
        } else if (data.message) {
          toast({
            title: "Login Failed",
            description: data.message,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Login error:', error);
        toast({
          title: "Network Error",
          description: "Please check your connection and try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setOtp(value);
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center gradient-bg-primary relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-2xl animate-[float_6s_ease-in-out_infinite]"></div>
          <div className="absolute top-40 right-20 w-80 h-80 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-2xl animate-[float_8s_ease-in-out_infinite] [animation-delay:2s]"></div>
          <div className="absolute -bottom-8 left-40 w-72 h-72 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-2xl animate-[float_7s_ease-in-out_infinite] [animation-delay:4s]"></div>
        </div>

        <Card className="w-full max-w-md relative glass-effect gradient-bg-card shadow-2xl">
          <CardHeader className="text-center space-y-6 pb-8">
            {/* Logo with enhanced glow effect */}
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl blur-xl opacity-60 animate-pulse"></div>
              <QrCode className="w-12 h-12 text-white relative z-10" />
              <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-yellow-300 animate-pulse" />
            </div>
            
            <div className="space-y-3">
              <CardTitle className="text-2xl font-bold text-white">
                Vibeat Ticket Scanner
              </CardTitle>
              <CardDescription className="text-gray-200 text-lg font-small">
                Enter your 10-digit organizer code
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter 10-digit code"
                    value={otp}
                    onChange={handleInputChange}
                    maxLength={10}
                    className="w-full h-16 text-center text-2xl font-mono tracking-widest glass-effect text-white placeholder:text-gray-300 placeholder:text-sm md:placeholder:text-base focus:ring-2 focus:ring-white/40 focus:border-white/40 transition-all duration-300 bg-white/10"
                  />
                </div>
                
                <div className="flex justify-center">
                  <p className="text-sm text-gray-300 font-medium">
                    {otp.length}/10 digits
                  </p>
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 border-0 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 text-white"
                disabled={otp.length !== 10 || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Logging in...</span>
                  </div>
                ) : (
                  'Access Dashboard'
                )}
              </Button>
            </form>
            
            <div className="text-center">
              <p className="text-sm text-gray-300 font-medium">
                Secure access to your event management
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

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
    </>
  );
};

export default Login;

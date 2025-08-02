'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useNavigation, ROUTES } from '@/lib/navigation';
import { trpc } from '@/utils/trpc';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { HiCheckCircle, HiXCircle, HiArrowLeft } from 'react-icons/hi';

export default function VerifyPage() {
  const params = useParams();
  const navigation = useNavigation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const verifyAccount = trpc.auth.verify.useMutation({
    onSuccess: () => {
      setStatus('success');
      setMessage('Your account has been successfully verified!');
    },
    onError: (error) => {
      setStatus('error');
      setMessage(error.message || 'Verification failed. Please try again.');
    },
  });

  useEffect(() => {
    const token = params.token as string;
    if (token) {
      verifyAccount.mutate({ token });
    }
  }, [params.token]);

  const handleRedirect = () => {
    navigation.push(ROUTES.LOGIN);
  };

  return (
    <div className="h-screen w-full flex flex-col justify-center items-center bg-background-subtle">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="Studious" className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {status === 'loading' && 'Verifying Account'}
            {status === 'success' && 'Account Verified'}
            {status === 'error' && 'Verification Failed'}
          </h1>
          <p className="text-foreground-muted">
            {status === 'loading' && 'Please wait while we verify your account...'}
            {status === 'success' && 'Your account has been successfully verified!'}
            {status === 'error' && 'We encountered an issue verifying your account'}
          </p>
        </div>

        <Card className="p-8">
          <div className="text-center space-y-6">
            {status === 'loading' && (
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                <p className="text-foreground-muted">Please wait while we verify your account...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-green-100 rounded-full">
                  <HiCheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-green-600 font-medium">{message}</p>
                <Button.Primary onClick={handleRedirect} className="w-full font-medium">
                  Continue to Sign In
                </Button.Primary>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-red-100 rounded-full">
                  <HiXCircle className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-red-600 font-medium">{message}</p>
                <div className="space-y-3">
                  <Button.Primary onClick={handleRedirect} className="w-full font-medium">
                    Go to Sign In
                  </Button.Primary>
                  <Button.Light 
                    onClick={() => window.location.reload()} 
                    className="w-full font-medium"
                  >
                    Try Again
                  </Button.Light>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
} 
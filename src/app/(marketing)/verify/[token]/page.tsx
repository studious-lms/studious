"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { CheckCircle, XCircle, Mail } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function VerifyEmail() {
  const t = useTranslations('auth.verification');
  const tCommon = useTranslations('common');
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [isVerified, setIsVerified] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Placeholder for the actual API call
  const verifyEmailMutation = (trpc.auth as any).verify.useMutation({
    onSuccess: () => {
      setIsVerified(true);
      setIsVerifying(false);
      toast.success(t('successTitle'));
    },
    onError: (error: any) => {
      setIsError(true);
      setIsVerifying(false);
      toast.error(error.message || t('errorMessage'));
    }
  });

  const handleVerify = () => {
    if (!token) {
      toast.error("Invalid verification token");
      return;
    }

    setIsVerifying(true);
    setIsError(false);
    
    verifyEmailMutation.mutate({
      token: token,
    });
    
    // Placeholder: Simulate API call
    setTimeout(() => {
      // For now, just show success (remove this when implementing actual API)
      setIsVerified(true);
      setIsVerifying(false);
      toast.success(t('successTitle'));
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-background-subtle px-4 py-8 sm:px-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-3 sm:mb-4">
            <img src="/logo.png" alt="Studious" className="w-9 h-9 sm:w-10 sm:h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{t('title')}</h1>
          <p className="text-sm sm:text-base text-foreground-muted">{t('subtitle')}</p>
        </div>

        {isVerified ? (
          <Card className="p-6 sm:p-8">
            <div className="text-center space-y-4 sm:space-y-6">
              {/* Success Icon */}
              <div className="flex justify-center">
                <div className="p-3 sm:p-4 bg-green-100 rounded-full">
                  <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
                </div>
              </div>

              {/* Success Message */}
              <div className="space-y-2">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground">{t('successTitle')}</h2>
                <p className="text-sm sm:text-base text-foreground-muted">
                  {t('successMessage')}
                </p>
              </div>

              {/* Back to Sign In Button */}
              <Button
                onClick={() => router.push('/login')}
                className="w-full font-medium"
              >
                {t('backToSignIn')}
              </Button>
            </div>
          </Card>
        ) : isError ? (
          <Card className="p-6 sm:p-8">
            <div className="text-center space-y-4 sm:space-y-6">
              {/* Error Icon */}
              <div className="flex justify-center">
                <div className="p-3 sm:p-4 bg-red-100 rounded-full">
                  <XCircle className="w-7 h-7 sm:w-8 sm:h-8 text-red-600" />
                </div>
              </div>

              {/* Error Message */}
              <div className="space-y-2">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground">{t('errorTitle')}</h2>
                <p className="text-sm sm:text-base text-foreground-muted">
                  {t('errorMessage')}
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={handleVerify}
                  className="w-full font-medium"
                  disabled={isVerifying}
                >
                  {isVerifying ? t('verifying') : t('verifyEmail')}
                </Button>
                <Link 
                  href="/login" 
                  className="block text-center text-sm text-primary-500 hover:underline"
                >
                  {t('backToSignIn')}
                </Link>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-6 sm:p-8">
            <div className="text-center space-y-4 sm:space-y-6">
              {/* Email Icon */}
              <div className="flex justify-center">
                <div className="p-3 sm:p-4 bg-blue-100 rounded-full">
                  <Mail className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-2">
                <p className="text-sm sm:text-base text-foreground-muted">
                  {t('subtitle')}
                </p>
              </div>

              {/* Verify Button */}
              <Button
                onClick={handleVerify}
                className="w-full font-medium"
                disabled={isVerifying}
              >
                {isVerifying ? t('verifying') : t('verifyEmail')}
              </Button>

              {/* Back to Sign In Link */}
              <div className="text-center">
                <Button variant="link" className="px-0 mt-4 sm:mt-6 text-sm" asChild>
                  <a href="/login">{t('backToSignIn')}</a>
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

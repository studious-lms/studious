"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Mail } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function ForgotPassword() {
  const t = useTranslations('auth.forgotPassword');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const requestPasswordResetMutation = (trpc.auth as any).requestPasswordReset.useMutation({
    onSuccess: () => {
      setEmailSent(true);
      toast.success(t('successMessage'));
    },
    onError: (error: any) => {
      toast.error(error.message || t('errorMessage'));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic email validation
    if (!email || !email.includes("@")) {
      toast.error(t('invalidEmail'));
      return;
    }

    requestPasswordResetMutation.mutate({
      email: email,
    });
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

        {!emailSent ? (
          <Card className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('email')}</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  required
                  autoFocus
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full font-medium"
                disabled={requestPasswordResetMutation.isPending}
              >
                {requestPasswordResetMutation.isPending ? t('sending') : t('sendResetLink')}
              </Button>

              {/* Back to Sign In Link */}
              <div className="text-center">
                <Link 
                  href="/login" 
                  className="text-sm text-primary-500 hover:underline"
                >
                  {t('backToSignIn')}
                </Link>
              </div>
            </form>
          </Card>
        ) : (
          <Card className="p-6 sm:p-8">
            <div className="text-center space-y-4 sm:space-y-6">
              {/* Success Icon */}
              <div className="flex justify-center">
                <div className="p-3 sm:p-4 bg-green-100 rounded-full">
                  <Mail className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
                </div>
              </div>

              {/* Success Message */}
              <div className="space-y-2">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground">{t('successTitle')}</h2>
                <p className="text-sm sm:text-base text-foreground-muted">
                  {t('successMessage')}
                </p>
                <p className="text-sm text-foreground-muted">
                  {t('checkInbox')}
                </p>
              </div>

              {/* Back to Sign In Button */}
              <Button variant="link" className="px-0 mt-4 sm:mt-6 text-sm" asChild>
                <a href="/login">{t('backToSignIn')}</a>
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}


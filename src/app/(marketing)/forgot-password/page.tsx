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
import { PageLayout } from "@/components/ui/page-layout";
import { NavbarPopup } from "@/components/marketing/NavbarPopup";

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
    <PageLayout className="min-h-screen bg-background">
      {/* Navigation Bar - Full Width at Top */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-4">
        <NavbarPopup />
      </div>

      {/* Centered Content */}
      <div className="flex items-center justify-center px-4 py-8 sm:px-6">
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
            </div>
          </Card>
        )}
        {/* Back to Sign In Button */}
        <div className="mt-4 sm:mt-6 text-center text-sm">
          <Button variant="link" className="px-0 text-sm" asChild>
            <a href="/login">{t('backToSignIn')}</a>
          </Button>
        </div>
        </div>
      </div>
    </PageLayout>
  );
}


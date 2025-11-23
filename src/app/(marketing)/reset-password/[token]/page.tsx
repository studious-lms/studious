"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Lock, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { PageLayout } from "@/components/ui/page-layout";
import { NavbarPopup } from "@/components/marketing/NavbarPopup";

export default function ResetPassword() {
  const t = useTranslations('auth.resetPassword');
  const tCommon = useTranslations('common');
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordReset, setPasswordReset] = useState(false);

  const resetPasswordMutation = (trpc.auth as any).resetPassword.useMutation({
    onSuccess: () => {
      setPasswordReset(true);
      toast.success(t('successTitle'));
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to reset password. Please try again.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password length
    if (password.length < 6) {
      toast.error(t('passwordTooShort'));
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      toast.error(t('passwordsDoNotMatch'));
      return;
    }

    resetPasswordMutation.mutate({
      token: token,
      password: password,
      confirmPassword: confirmPassword,
    });
  };

  return (
    <PageLayout className="min-h-screen bg-background">
      {/* Navigation Bar - Full Width at Top */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-4">
        <NavbarPopup backToHome={true} />
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

        {!passwordReset ? (
          <Card className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('password')}</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  required
                  autoFocus
                  minLength={6}
                />
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('confirmPassword')}</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('confirmPasswordPlaceholder')}
                  required
                  minLength={6}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full font-medium"
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending ? t('resetting') : t('resetPassword')}
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
              <Button variant="link" className="px-0 mt-4 sm:mt-6 text-sm" asChild>
                <a href="/login">{t('backToSignIn')}</a>
              </Button>
            </div>
          </Card>
        )}
        </div>
      </div>
    </PageLayout>
  );
}

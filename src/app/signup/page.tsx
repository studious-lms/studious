"use client";
import { AlertLevel } from "@/lib/alertLevel";
import { addAlert } from "@/store/appSlice";
import { RootState } from "@/store/store";
import { trpc } from "@/utils/trpc";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RouterInputs, RouterOutputs } from "@/utils/trpc";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { HiAcademicCap, HiMail, HiArrowLeft, HiCheckCircle } from "react-icons/hi";
import Link from "next/link";
import { getErrorMessage, getFieldErrors } from "@/utils/errorHandler";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState<RouterInputs['auth']['register']>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showVerificationPage, setShowVerificationPage] = useState(false);

  const dispatch = useDispatch();

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data: RouterOutputs['auth']['register']) => {
      dispatch(addAlert({ remark: 'Account created successfully! Please check your email to verify your account.', level: AlertLevel.SUCCESS }));
      setShowVerificationPage(true);
    },
    onError: (error) => {
      const message = error.message || 'Registration failed. Please try again.';
      dispatch(addAlert({ remark: message, level: AlertLevel.ERROR }));
      
      // Handle specific validation errors
      if (error.data?.zodError) {
        const fieldErrors: Record<string, string> = {};
        Object.entries(error.data.zodError.fieldErrors).forEach(([field, messages]) => {
          if (messages && messages.length > 0) {
            fieldErrors[field] = messages[0];
          }
        });
        setErrors(fieldErrors);
      }
    }
  });
  
  const appState = useSelector((state: RootState) => state.app);

  useEffect(() => {
    if (appState.user.loggedIn) {
      redirect('/classes/');
    }
  }, [appState.user.loggedIn]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Basic client-side validation
    const newErrors: Record<string, string> = {};
    
    if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    registerMutation.mutate({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    });
  };

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleBackToSignup = () => {
    setShowVerificationPage(false);
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setErrors({});
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
            {showVerificationPage ? 'Check Your Email' : 'Create Account'}
          </h1>
          <p className="text-foreground-muted">
            {showVerificationPage 
              ? 'We\'ve sent a verification link to your email address'
              : 'Join Studious and start your learning journey'
            }
          </p>
        </div>

        {/* Verification Page */}
        {showVerificationPage && (
          <Card className="p-8">
            <div className="text-center space-y-6">
              {/* Email Icon */}
              <div className="flex justify-center">
                <div className="p-4 bg-green-100 rounded-full">
                  <HiMail className="w-8 h-8 text-green-600" />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <p className="text-sm text-foreground-muted">We've sent a verification link to:</p>
                <p className="font-medium text-foreground">{formData.email}</p>
              </div>

              {/* Instructions */}
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <HiCheckCircle className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                    <div className="text-left">
                      <h3 className="font-medium text-primary-500 mb-1">Next Steps:</h3>
                      <ul className="text-sm text-primary-500 space-y-1">
                        <li>• Check your email inbox (and spam folder)</li>
                        <li>• Click the verification link in the email</li>
                        <li>• Return here to sign in to your account</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button.Primary
                  onClick={() => router.push('/login')}
                  className="w-full font-medium"
                >
                  Go to Sign In
                </Button.Primary>
                
                <Button.Light
                  onClick={handleBackToSignup}
                  className="w-full font-medium flex items-center justify-center"
                >
                  <HiArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign Up
                </Button.Light>
              </div>

              {/* Resend Email */}
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-foreground-muted mb-2">
                  Didn't receive the email?
                </p>
                <button 
                  className="text-sm text-primary-500 hover:underline font-medium"
                  onClick={() => {
                    trpc.auth.resendVerificationEmail.useMutation({
                      onSuccess: () => {
                        dispatch(addAlert({ remark: 'Verification email sent!', level: AlertLevel.SUCCESS }));
                      },
                      onError: (error) => {
                        dispatch(addAlert({ remark: error.message, level: AlertLevel.ERROR }));
                      }
                    });
                  }}
                >
                  Resend verification email
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Signup Form */}
        {!showVerificationPage && <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <Input.Text
                label="Username"
                value={formData.username}
                onChange={handleInputChange('username')}
                placeholder="Enter your username"
                className={errors.username ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Input.Text
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                placeholder="Enter your email"
                className={errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Input.Text
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleInputChange('password')}
                placeholder="Create a password"
                className={errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Input.Text
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                placeholder="Confirm your password"
                className={errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button.Primary
              type="submit"
              className="w-full font-medium"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
            </Button.Primary>

            {/* Terms and Privacy */}
            <p className="text-xs text-foreground-muted text-center">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-primary-500 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary-500 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </form>
        </Card>}

        {/* Login Link */}
        {!showVerificationPage && (
          <div className="text-center mt-6">
            <p className="text-foreground-muted">
              Already have an account?{' '}
              <Link href="/login" className="text-primary-500 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 
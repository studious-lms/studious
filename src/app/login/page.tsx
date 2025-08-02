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
import Link from "next/link";
import Checkbox from "@/components/ui/Checkbox";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState<RouterInputs['auth']['login']>({
    username: '',
    password: '',
  });

  const [resendEmailFormData, setResendEmailFormData] = useState<RouterInputs['auth']['resendVerificationEmail']>({
    email: '',
  });

  const [userNotVerified, setUserNotVerified] = useState(false);
  const [showResendForm, setShowResendForm] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const dispatch = useDispatch();

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data: RouterOutputs['auth']['login']) => {
      if ('token' in data) {
        dispatch(addAlert({ remark: 'Successfully logged in', level: AlertLevel.SUCCESS }));
        // set the session cookie
        document.cookie = `token=${data.token}`;
        router.push('/classes/');
      } else {
        // user not verified
        setUserNotVerified(true);
        setResendEmailFormData({ email: data.user.email });
      }
    },
    onError: (error) => {
      dispatch(addAlert({ remark: 'Invalid credentials', level: AlertLevel.ERROR }));
    }
  });

  const resendVerificationMutation = trpc.auth.resendVerificationEmail.useMutation({
    onSuccess: () => {
      setResendSuccess(true);
      dispatch(addAlert({ remark: 'Verification email sent successfully!', level: AlertLevel.SUCCESS }));
    },
    onError: (error) => {
      dispatch(addAlert({ remark: error.message || 'Failed to send verification email', level: AlertLevel.ERROR }));
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
    
    loginMutation.mutate({
      username: formData.username,
      password: formData.password,
    });
  };

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleResendEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResendEmailFormData({ email: e.target.value });
  };

  const handleResendVerification = (e: React.FormEvent) => {
    e.preventDefault();
    resendVerificationMutation.mutate(resendEmailFormData);
  };

  const handleBackToLogin = () => {
    setUserNotVerified(false);
    setShowResendForm(false);
    setResendSuccess(false);
    setResendEmailFormData({ email: '' });
  };

  return (
    <div className="h-screen w-full flex flex-col justify-center items-center bg-background-subtle">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="Studious" className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-foreground-muted">Sign in to your Studious account</p>
        </div>

        {userNotVerified && (
          <Card className="p-8 mb-6">
            <div className="text-center space-y-6">
              {/* Warning Icon */}
              <div className="flex justify-center">
                <div className="p-4 bg-yellow-100 rounded-full">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">Account Not Verified</h2>
                <p className="text-foreground-muted">
                  Your account needs to be verified before you can sign in. 
                  Please check your email for a verification link.
                </p>
              </div>

              {/* Email Display */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-foreground-muted mb-1">Verification email sent to:</p>
                <p className="font-medium text-foreground">{resendEmailFormData.email}</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {!resendSuccess ? (
                  <>
                    <Button.Primary
                      onClick={() => setShowResendForm(true)}
                      className="w-full font-medium"
                    >
                      Resend Verification Email
                    </Button.Primary>
                    <Button.Light
                      onClick={handleBackToLogin}
                      className="w-full font-medium"
                    >
                      Back to Sign In
                    </Button.Light>
                  </>
                ) : (
                  <>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-green-700 font-medium">Verification email sent!</p>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        Please check your inbox and spam folder.
                      </p>
                    </div>
                    <Button.Primary
                      onClick={handleBackToLogin}
                      className="w-full font-medium"
                    >
                      Back to Sign In
                    </Button.Primary>
                  </>
                )}
              </div>

              {/* Resend Form */}
              {showResendForm && !resendSuccess && (
                <div className="border-t border-gray-200 pt-6">
                  <form onSubmit={handleResendVerification} className="space-y-4">
                    <Input.Text
                      label="Email Address"
                      value={resendEmailFormData.email}
                      onChange={handleResendEmailChange}
                      placeholder="Enter your email address"
                      required
                    />
                    <div className="flex space-x-3">
                      <Button.Primary
                        type="submit"
                        className="flex-1 font-medium"
                        disabled={resendVerificationMutation.isPending}
                      >
                        {resendVerificationMutation.isPending ? 'Sending...' : 'Send Email'}
                      </Button.Primary>
                      <Button.Light
                        onClick={() => setShowResendForm(false)}
                        className="flex-1 font-medium"
                      >
                        Cancel
                      </Button.Light>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </Card>
        )}

        {!userNotVerified && (
          <>
            {/* Login Form */}
            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Field */}
                <Input.Text
                  label="Username"
                  value={formData.username}
                  onChange={handleInputChange('username')}
                  placeholder="Enter your username"
                />

                {/* Password Field */}
                <div className="relative">
                  <Input.Text
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    placeholder="Enter your password"
                    className="pr-10"
                  />
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between w-full">
                  <Checkbox
                    label="Remember me"
                    checked={true}
                    onChange={() => {}}
                  />
                  <Link href="/forgot-password" className="text-sm text-primary-500 hover:underline">
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <Button.Primary
                  type="submit"
                  className="w-full font-medium"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
                </Button.Primary>
              </form>
            </Card>

            {/* Signup Link */}
            <div className="text-center mt-6">
              <p className="text-foreground-muted">
                Don't have an account?{' '}
                <Link href="/signup" className="text-primary-500 hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

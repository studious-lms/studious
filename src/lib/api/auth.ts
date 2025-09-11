import { trpcClient } from '../trpc-client';
import { setAuthToken, clearAuthToken } from '../trpc-client';
import { useStableCallback } from './hooks';
import { withRateLimit } from './rate-limiter';
import { trpc } from '../trpc';
import type { 
  AuthRegisterInput,
  AuthLoginInput,
  AuthRegisterOutput,
  AuthLoginOutput,
  AuthCheckOutput
} from '../trpc';

// ===== AUTHENTICATION API =====

/**
 * Register a new user account
 * @param input - Registration data
 * @returns Promise with user data
 */
export const register = async (input: AuthRegisterInput): Promise<AuthRegisterOutput> => {
  try {
    const result = await trpcClient.auth.register.mutate(input);
    return result;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

/**
 * Login with username and password
 * @param input - Login credentials
 * @returns Promise with token and user data
 */
export const login = withRateLimit(async (input: AuthLoginInput): Promise<AuthLoginOutput> => {
  try {
    const result = await trpcClient.auth.login.mutate(input);
    
    // Store the auth token
    if ('token' in result) {
      setAuthToken(result.token, true); // Store persistently
    }
    
    return result;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}, 'login');

/**
 * Logout and invalidate session
 * @returns Promise with success status
 */
export const logout = async (): Promise<{ success: boolean }> => {
  try {
    const result = await trpcClient.auth.logout.mutate();
    
    // Clear the auth token from storage
    clearAuthToken();
    
    return result;
  } catch (error) {
    console.error('Logout failed:', error);
    // Even if the API call fails, clear the local token
    clearAuthToken();
    throw error;
  }
};

/**
 * Verify current authentication status
 * @returns Promise with current user data
 */
export const checkAuth = async (): Promise<AuthCheckOutput> => {
  try {
    const result = await trpcClient.auth.check.query();
    return result;
  } catch (error) {
    console.error('Auth check failed:', error);
    // If auth check fails, clear the token
    clearAuthToken();
    throw error;
  }
};

/**
 * Verify email with token
 * @param token - Email verification token
 * @returns Promise with verification result
 */
export const verifyEmail = async (token: string): Promise<any> => {
  try {
    const result = await trpcClient.auth.verify.mutate({ token });
    return result;
  } catch (error) {
    console.error('Email verification failed:', error);
    throw error;
  }
};

/**
 * Resend verification email
 * @param email - Email address to resend verification to
 * @returns Promise with resend result
 */
export const resendVerificationEmail = async (email: string): Promise<any> => {
  try {
    const result = await trpcClient.auth.resendVerificationEmail.mutate({ email });
    return result;
  } catch (error) {
    console.error('Resend verification email failed:', error);
    throw error;
  }
};

// ===== AUTHENTICATION HOOKS =====

/**
 * Hook for user registration
 */
export const useRegister = () => {
  return {
    register: async (input: AuthRegisterInput) => {
      return await register(input);
    }
  };
};

/**
 * Hook for user login
 */
export const useLogin = () => {
  const stableLogin = useStableCallback(login);
  
  return {
    login: stableLogin
  };
};

/**
 * Hook for user logout
 */
export const useLogout = () => {
  return {
    logout: async () => {
      return await logout();
    }
  };
};

// ===== REACT QUERY HOOKS =====

/**
 * React Query mutation for user login
 */
export const useLoginMutation = () => {
  return trpc.auth.login.useMutation();
};

/**
 * React Query mutation for user registration
 */
export const useRegisterMutation = () => {
  return trpc.auth.register.useMutation();
};

/**
 * React Query mutation for user logout
 */
export const useLogoutMutation = () => {
  return trpc.auth.logout.useMutation();
};

/**
 * React Query mutation for resending verification email
 */
export const useResendVerificationEmailMutation = () => {
  return trpc.auth.resendVerificationEmail.useMutation();
};

/**
 * React Query query for checking auth status
 */
export const useAuthCheckQuery = () => {
  return trpc.auth.check.useQuery();
};

/**
 * Hook for checking authentication status
 */
export const useAuthCheck = () => {
  return {
    checkAuth: async () => {
      return await checkAuth();
    }
  };
};

/**
 * Hook for email verification
 */
export const useEmailVerification = () => {
  return {
    verifyEmail: async (token: string) => {
      return await verifyEmail(token);
    },
    resendVerificationEmail: async (email: string) => {
      return await resendVerificationEmail(email);
    }
  };
};

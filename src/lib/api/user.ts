import { trpcClient } from '../trpc-client';
import { useStableCallback } from './hooks';
import { withRateLimit } from './rate-limiter';
import { trpc } from '../trpc';
import type { UserGetProfileOutput, UserUpdateProfileInput } from '../trpc';

// ===== USER MANAGEMENT API =====

/**
 * Get current user profile
 * @returns Promise with user profile data
 */
export const getProfile = withRateLimit(async (): Promise<UserGetProfileOutput> => {
  try {
    const result = await trpcClient.user.getProfile.query();
    return result;
  } catch (error) {
    console.error('Get profile failed:', error);
    throw error;
  }
}, 'getProfile');

/**
 * Update user profile
 * @param input - Profile update data
 * @returns Promise with updated profile
 */
export const updateProfile = async (input: UserUpdateProfileInput): Promise<UserGetProfileOutput> => {
  try {
    const result = await trpcClient.user.updateProfile.mutate(input);
    return result;
  } catch (error) {
    console.error('Update profile failed:', error);
    throw error;
  }
};

// ===== USER MANAGEMENT HOOKS =====

/**
 * Hook for getting user profile
 */
export const useGetProfile = () => {
  return {
    getProfile: async () => {
      return await getProfile();
    }
  };
};

/**
 * Hook for updating user profile
 */
export const useUpdateProfile = () => {
  return {
    updateProfile: async (input: UpdateProfileInput) => {
      return await updateProfile(input);
    }
  };
};

/**
 * Hook for user profile management (combines get and update)
 */
export const useUserProfile = () => {
  const stableGetProfile = useStableCallback(getProfile);
  const stableUpdateProfile = useStableCallback(updateProfile);
  
  return {
    getProfile: stableGetProfile,
    updateProfile: stableUpdateProfile
  };
};

// ===== REACT QUERY HOOKS =====

/**
 * React Query query for getting user profile
 */
export const useGetUserProfileQuery = () => {
  return trpc.user.getProfile.useQuery();
};

/**
 * React Query mutation for updating user profile
 */
export const useUpdateUserProfileMutation = () => {
  return trpc.user.updateProfile.useMutation();
};

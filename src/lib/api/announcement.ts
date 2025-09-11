import { trpcClient } from '../trpc-client';
import { useStableCallback } from './hooks';
import { withRateLimit } from './rate-limiter';
import { trpc } from '../trpc';
import type { 
  AnnouncementGetAllOutput,
  AnnouncementCreateInput,
  AnnouncementUpdateInput
} from '../trpc';

// ===== ANNOUNCEMENT API =====

/**
 * Get all class announcements
 * @param classId - Class ID
 * @returns Promise with announcements array
 */
export const getAllAnnouncements = withRateLimit(async (classId: string): Promise<AnnouncementGetAllOutput> => {
  try {
    const result = await trpcClient.announcement.getAll.query({ classId });
    return result;
  } catch (error) {
    console.error('Get all announcements failed:', error);
    throw error;
  }
}, 'getAllAnnouncements');

/**
 * Create new announcement (Teacher Only)
 * @param input - Announcement creation data
 * @returns Promise with created announcement
 */
export const createAnnouncement = async (input: AnnouncementCreateInput): Promise<any> => {
  try {
    const result = await trpcClient.announcement.create.mutate(input);
    return result;
  } catch (error) {
    console.error('Create announcement failed:', error);
    throw error;
  }
};

/**
 * Update announcement
 * @param input - Announcement update data
 * @returns Promise with updated announcement
 */
export const updateAnnouncement = async (input: AnnouncementUpdateInput): Promise<any> => {
  try {
    const result = await trpcClient.announcement.update.mutate(input);
    return result;
  } catch (error) {
    console.error('Update announcement failed:', error);
    throw error;
  }
};

/**
 * Delete announcement
 * @param id - Announcement ID
 * @returns Promise with deletion result
 */
export const deleteAnnouncement = async (id: string): Promise<any> => {
  try {
    const result = await trpcClient.announcement.delete.mutate({ id });
    return result;
  } catch (error) {
    console.error('Delete announcement failed:', error);
    throw error;
  }
};

// ===== ANNOUNCEMENT HOOKS =====

/**
 * Hook for getting all announcements
 */
export const useGetAllAnnouncements = () => {
  const stableGetAllAnnouncements = useStableCallback(getAllAnnouncements);
  
  return {
    getAllAnnouncements: stableGetAllAnnouncements
  };
};

/**
 * Hook for announcement creation
 */
export const useCreateAnnouncement = () => {
  const stableCreateAnnouncement = useStableCallback(createAnnouncement);
  
  return {
    createAnnouncement: stableCreateAnnouncement
  };
};

/**
 * Hook for announcement updates
 */
export const useUpdateAnnouncement = () => {
  const stableUpdateAnnouncement = useStableCallback(updateAnnouncement);
  
  return {
    updateAnnouncement: stableUpdateAnnouncement
  };
};

/**
 * Hook for announcement deletion
 */
export const useDeleteAnnouncement = () => {
  const stableDeleteAnnouncement = useStableCallback(deleteAnnouncement);
  
  return {
    deleteAnnouncement: stableDeleteAnnouncement
  };
};

/**
 * Comprehensive announcement management hook
 */
export const useAnnouncementManagement = () => {
  return {
    getAllAnnouncements: async (classId: string) => {
      return await getAllAnnouncements(classId);
    },
    createAnnouncement: async (input: CreateAnnouncementInput) => {
      return await createAnnouncement(input);
    },
    updateAnnouncement: async (input: UpdateAnnouncementInput) => {
      return await updateAnnouncement(input);
    },
    deleteAnnouncement: async (id: string) => {
      return await deleteAnnouncement(id);
    }
  };
};

// ===== REACT QUERY HOOKS =====

/**
 * React Query query for getting all announcements
 */
export const useGetAllAnnouncementsQuery = (classId: string) => {
  return trpc.announcement.getAll.useQuery({ classId });
};

/**
 * React Query mutation for creating announcement
 */
export const useCreateAnnouncementMutation = () => {
  return trpc.announcement.create.useMutation();
};

/**
 * React Query mutation for updating announcement
 */
export const useUpdateAnnouncementMutation = () => {
  return trpc.announcement.update.useMutation();
};

/**
 * React Query mutation for deleting announcement
 */
export const useDeleteAnnouncementMutation = () => {
  return trpc.announcement.delete.useMutation();
};

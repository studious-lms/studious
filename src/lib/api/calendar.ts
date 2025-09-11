import { trpcClient } from '../trpc-client';
import { useStableCallback } from './hooks';
import { withRateLimit } from './rate-limiter';
import { trpc } from '../trpc';

// ===== CALENDAR & EVENTS API =====

/**
 * Get class events (Teacher Only)
 * @param classId - Class ID
 * @returns Promise with events array
 */
export const getClassEvents = withRateLimit(async (classId: string): Promise<any> => {
  try {
    const result = await trpcClient.class.getEvents.query({ classId });
    return result;
  } catch (error) {
    console.error('Get class events failed:', error);
    throw error;
  }
}, 'getClassEvents');

/**
 * Attach assignment to event (Teacher Only)
 * @param assignmentId - Assignment ID
 * @param eventId - Event ID
 * @returns Promise with attachment result
 */
export const attachAssignmentToEvent = async (assignmentId: string, eventId: string): Promise<any> => {
  try {
    const result = await trpcClient.assignment.attachToEvent.mutate({ assignmentId, eventId });
    return result;
  } catch (error) {
    console.error('Attach assignment to event failed:', error);
    throw error;
  }
};

/**
 * Detach assignment from event (Teacher Only)
 * @param assignmentId - Assignment ID
 * @returns Promise with detachment result
 */
export const detachAssignmentFromEvent = async (assignmentId: string): Promise<any> => {
  try {
    const result = await trpcClient.assignment.detachEvent.mutate({ assignmentId });
    return result;
  } catch (error) {
    console.error('Detach assignment from event failed:', error);
    throw error;
  }
};

/**
 * Get available events for assignment (Teacher Only)
 * @param assignmentId - Assignment ID
 * @returns Promise with available events
 */
export const getAvailableEvents = async (assignmentId: string): Promise<any> => {
  try {
    const result = await trpcClient.assignment.getAvailableEvents.query({ assignmentId });
    return result;
  } catch (error) {
    console.error('Get available events failed:', error);
    throw error;
  }
};

// ===== LAB DRAFT API =====

/**
 * List lab drafts (Teacher Only)
 * @param classId - Class ID
 * @returns Promise with lab drafts array
 */
export const listLabDrafts = async (classId: string): Promise<any> => {
  try {
    const result = await trpcClient.class.listLabDrafts.query({ classId });
    return result;
  } catch (error) {
    console.error('List lab drafts failed:', error);
    throw error;
  }
};

/**
 * Create lab draft (Teacher Only)
 * @param classId - Class ID
 * @param data - Lab draft data
 * @returns Promise with created lab draft
 */
export const createLabDraft = async (classId: string, data: any): Promise<any> => {
  try {
    const result = await trpcClient.class.createLabDraft.mutate({ classId, ...data });
    return result;
  } catch (error) {
    console.error('Create lab draft failed:', error);
    throw error;
  }
};

/**
 * Update lab draft (Teacher Only)
 * @param classId - Class ID
 * @param labDraftId - Lab draft ID
 * @param data - Lab draft update data
 * @returns Promise with updated lab draft
 */
export const updateLabDraft = async (classId: string, labDraftId: string, data: any): Promise<any> => {
  try {
    const result = await trpcClient.class.updateLabDraft.mutate({ classId, labDraftId, ...data });
    return result;
  } catch (error) {
    console.error('Update lab draft failed:', error);
    throw error;
  }
};

/**
 * Delete lab draft (Teacher Only)
 * @param classId - Class ID
 * @param labDraftId - Lab draft ID
 * @returns Promise with deletion result
 */
export const deleteLabDraft = async (classId: string, labDraftId: string): Promise<any> => {
  try {
    const result = await trpcClient.class.deleteLabDraft.mutate({ classId, labDraftId });
    return result;
  } catch (error) {
    console.error('Delete lab draft failed:', error);
    throw error;
  }
};

/**
 * Publish lab draft as assignment (Teacher Only)
 * @param classId - Class ID
 * @param labDraftId - Lab draft ID
 * @returns Promise with publish result
 */
export const publishLabDraft = async (classId: string, labDraftId: string): Promise<any> => {
  try {
    const result = await trpcClient.class.publishLabDraft.mutate({ classId, labDraftId });
    return result;
  } catch (error) {
    console.error('Publish lab draft failed:', error);
    throw error;
  }
};

// ===== CALENDAR HOOKS =====

/**
 * Hook for class events management
 */
export const useClassEvents = () => {
  return {
    getClassEvents: async (classId: string) => {
      return await getClassEvents(classId);
    }
  };
};

/**
 * Hook for assignment-event attachment
 */
export const useAssignmentEventAttachment = () => {
  return {
    attachAssignmentToEvent: async (assignmentId: string, eventId: string) => {
      return await attachAssignmentToEvent(assignmentId, eventId);
    },
    detachAssignmentFromEvent: async (assignmentId: string) => {
      return await detachAssignmentFromEvent(assignmentId);
    },
    getAvailableEvents: async (assignmentId: string) => {
      return await getAvailableEvents(assignmentId);
    }
  };
};

/**
 * Hook for lab draft management
 */
export const useLabDraftManagement = () => {
  return {
    listLabDrafts: async (classId: string) => {
      return await listLabDrafts(classId);
    },
    createLabDraft: async (classId: string, data: any) => {
      return await createLabDraft(classId, data);
    },
    updateLabDraft: async (classId: string, labDraftId: string, data: any) => {
      return await updateLabDraft(classId, labDraftId, data);
    },
    deleteLabDraft: async (classId: string, labDraftId: string) => {
      return await deleteLabDraft(classId, labDraftId);
    },
    publishLabDraft: async (classId: string, labDraftId: string) => {
      return await publishLabDraft(classId, labDraftId);
    }
  };
};

/**
 * Comprehensive calendar and events management hook
 */
export const useCalendarManagement = () => {
  const stableGetClassEvents = useStableCallback(getClassEvents);
  const stableAttachAssignmentToEvent = useStableCallback(attachAssignmentToEvent);
  const stableDetachAssignmentFromEvent = useStableCallback(detachAssignmentFromEvent);
  const stableGetAvailableEvents = useStableCallback(getAvailableEvents);
  const stableListLabDrafts = useStableCallback(listLabDrafts);
  const stableCreateLabDraft = useStableCallback(createLabDraft);
  const stableUpdateLabDraft = useStableCallback(updateLabDraft);
  const stableDeleteLabDraft = useStableCallback(deleteLabDraft);
  const stablePublishLabDraft = useStableCallback(publishLabDraft);
  
  return {
    // Class events
    getClassEvents: stableGetClassEvents,
    
    // Assignment-event attachment
    attachAssignmentToEvent: stableAttachAssignmentToEvent,
    detachAssignmentFromEvent: stableDetachAssignmentFromEvent,
    getAvailableEvents: stableGetAvailableEvents,
    
    // Lab draft management
    listLabDrafts: stableListLabDrafts,
    createLabDraft: stableCreateLabDraft,
    updateLabDraft: stableUpdateLabDraft,
    deleteLabDraft: stableDeleteLabDraft,
    publishLabDraft: stablePublishLabDraft
  };
};

// ===== REACT QUERY HOOKS =====

/**
 * React Query query for getting class events
 */
export const useGetClassEventsQuery = (classId: string) => {
  return trpc.calendar.getClassEvents.useQuery({ classId });
};

/**
 * React Query mutation for creating event
 */
export const useCreateEventMutation = () => {
  return trpc.calendar.createEvent.useMutation();
};

/**
 * React Query mutation for updating event
 */
export const useUpdateEventMutation = () => {
  return trpc.calendar.updateEvent.useMutation();
};

/**
 * React Query mutation for deleting event
 */
export const useDeleteEventMutation = () => {
  return trpc.calendar.deleteEvent.useMutation();
};

/**
 * React Query query for getting calendar
 */
export const useGetCalendarQuery = (classId: string) => {
  return trpc.calendar.getCalendar.useQuery({ classId });
};

/**
 * React Query mutation for updating calendar
 */
export const useUpdateCalendarMutation = () => {
  return trpc.calendar.updateCalendar.useMutation();
};

import { trpcClient } from '../trpc-client';
import { useStableCallback } from './hooks';
import { withRateLimit } from './rate-limiter';
import { trpc } from '../trpc';
import type { 
  AssignmentCreateInput,
  AssignmentUpdateInput,
  AssignmentGetOutput,
  AssignmentGetSubmissionOutput,
  AssignmentGetSubmissionsOutput,
  AssignmentUpdateSubmissionInput,
  AssignmentUpdateSubmissionAsTeacherInput
} from '../trpc';

// ===== ASSIGNMENT MANAGEMENT API =====

/**
 * Create a new assignment
 * @param input - Assignment creation data
 * @returns Promise with created assignment
 */
export const createAssignment = withRateLimit(async (input: AssignmentCreateInput): Promise<AssignmentGetOutput> => {
  try {
    const result = await trpcClient.assignment.create.mutate(input);
    return result;
  } catch (error) {
    console.error('Create assignment failed:', error);
    throw error;
  }
}, 'createAssignment');

/**
 * Update assignment
 * @param input - Assignment update data
 * @returns Promise with updated assignment
 */
export const updateAssignment = async (input: AssignmentUpdateInput): Promise<AssignmentGetOutput> => {
  try {
    const result = await trpcClient.assignment.update.mutate(input);
    return result;
  } catch (error) {
    console.error('Update assignment failed:', error);
    throw error;
  }
};

/**
 * Delete assignment
 * @param id - Assignment ID
 * @param classId - Class ID
 * @returns Promise with deletion result
 */
export const deleteAssignment = async (id: string, classId: string): Promise<any> => {
  try {
    const result = await trpcClient.assignment.delete.mutate({ id, classId });
    return result;
  } catch (error) {
    console.error('Delete assignment failed:', error);
    throw error;
  }
};

/**
 * Get assignment details
 * @param id - Assignment ID
 * @param classId - Class ID
 * @returns Promise with assignment details
 */
export const getAssignment = withRateLimit(async (id: string, classId: string): Promise<AssignmentGetOutput> => {
  try {
    const result = await trpcClient.assignment.get.query({ id, classId });
    return result;
  } catch (error) {
    console.error('Get assignment failed:', error);
    throw error;
  }
}, 'getAssignment');

/**
 * Get student's submission for assignment
 * @param assignmentId - Assignment ID
 * @param classId - Class ID
 * @returns Promise with submission data
 */
export const getSubmission = withRateLimit(async (assignmentId: string, classId: string): Promise<AssignmentGetSubmissionOutput> => {
  try {
    const result = await trpcClient.assignment.getSubmission.query({ assignmentId, classId });
    return result;
  } catch (error) {
    console.error('Get submission failed:', error);
    throw error;
  }
}, 'getSubmission');

/**
 * Get all submissions for assignment (Teacher Only)
 * @param assignmentId - Assignment ID
 * @param classId - Class ID
 * @returns Promise with all submissions
 */
export const getSubmissions = async (assignmentId: string, classId: string): Promise<AssignmentGetSubmissionsOutput> => {
  try {
    const result = await trpcClient.assignment.getSubmissions.query({ assignmentId, classId });
    return result;
  } catch (error) {
    console.error('Get submissions failed:', error);
    throw error;
  }
};

/**
 * Update student submission
 * @param input - Submission update data
 * @returns Promise with updated submission
 */
export const updateSubmission = async (input: AssignmentUpdateSubmissionInput): Promise<AssignmentGetSubmissionOutput> => {
  try {
    const result = await trpcClient.assignment.updateSubmission.mutate(input);
    return result;
  } catch (error) {
    console.error('Update submission failed:', error);
    throw error;
  }
};

/**
 * Update submission as teacher (grading)
 * @param input - Teacher submission update data
 * @returns Promise with updated submission
 */
export const updateSubmissionAsTeacher = async (input: AssignmentUpdateSubmissionAsTeacherInput): Promise<AssignmentGetSubmissionOutput> => {
  try {
    const result = await trpcClient.assignment.updateSubmissionAsTeacher.mutate(input);
    return result;
  } catch (error) {
    console.error('Update submission as teacher failed:', error);
    throw error;
  }
};

// ===== ASSIGNMENT MANAGEMENT HOOKS =====

/**
 * Hook for assignment creation
 */
export const useCreateAssignment = () => {
  return {
    createAssignment: async (input: CreateAssignmentInput) => {
      return await createAssignment(input);
    }
  };
};

/**
 * Hook for assignment updates
 */
export const useUpdateAssignment = () => {
  return {
    updateAssignment: async (input: UpdateAssignmentInput) => {
      return await updateAssignment(input);
    }
  };
};

/**
 * Hook for assignment deletion
 */
export const useDeleteAssignment = () => {
  return {
    deleteAssignment: async (id: string, classId: string) => {
      return await deleteAssignment(id, classId);
    }
  };
};

/**
 * Hook for getting assignment details
 */
export const useGetAssignment = () => {
  const stableGetAssignment = useStableCallback(getAssignment);
  
  return {
    getAssignment: stableGetAssignment
  };
};

/**
 * Hook for submission management
 */
export const useSubmissionManagement = () => {
  const stableGetSubmission = useStableCallback(getSubmission);
  const stableGetSubmissions = useStableCallback(getSubmissions);
  const stableUpdateSubmission = useStableCallback(updateSubmission);
  const stableUpdateSubmissionAsTeacher = useStableCallback(updateSubmissionAsTeacher);
  
  return {
    getSubmission: stableGetSubmission,
    getSubmissions: stableGetSubmissions,
    updateSubmission: stableUpdateSubmission,
    updateSubmissionAsTeacher: stableUpdateSubmissionAsTeacher
  };
};

/**
 * Comprehensive assignment management hook
 */
export const useAssignmentManagement = () => {
  return {
    // Assignment CRUD
    createAssignment: async (input: CreateAssignmentInput) => {
      return await createAssignment(input);
    },
    updateAssignment: async (input: UpdateAssignmentInput) => {
      return await updateAssignment(input);
    },
    deleteAssignment: async (id: string, classId: string) => {
      return await deleteAssignment(id, classId);
    },
    getAssignment: async (id: string, classId: string) => {
      return await getAssignment(id, classId);
    },
    
    // Submission management
    getSubmission: async (assignmentId: string, classId: string) => {
      return await getSubmission(assignmentId, classId);
    },
    getSubmissions: async (assignmentId: string, classId: string) => {
      return await getSubmissions(assignmentId, classId);
    },
    updateSubmission: async (input: UpdateSubmissionInput) => {
      return await updateSubmission(input);
    },
    updateSubmissionAsTeacher: async (input: UpdateSubmissionAsTeacherInput) => {
      return await updateSubmissionAsTeacher(input);
    }
  };
};

// ===== REACT QUERY HOOKS =====

/**
 * React Query query for getting assignment details
 */
export const useGetAssignmentQuery = (id: string, classId: string) => {
  return trpc.assignment.get.useQuery({ id, classId });
};

/**
 * React Query mutation for creating assignment
 */
export const useCreateAssignmentMutation = () => {
  return trpc.assignment.create.useMutation();
};

/**
 * React Query mutation for updating assignment
 */
export const useUpdateAssignmentMutation = () => {
  return trpc.assignment.update.useMutation();
};

/**
 * React Query mutation for deleting assignment
 */
export const useDeleteAssignmentMutation = () => {
  return trpc.assignment.delete.useMutation();
};

/**
 * React Query query for getting submission
 */
export const useGetSubmissionQuery = (assignmentId: string, classId: string) => {
  return trpc.assignment.getSubmission.useQuery({ assignmentId, classId });
};

/**
 * React Query query for getting all submissions
 */
export const useGetSubmissionsQuery = (assignmentId: string, classId: string) => {
  return trpc.assignment.getSubmissions.useQuery({ assignmentId, classId });
};

/**
 * React Query mutation for updating submission
 */
export const useUpdateSubmissionMutation = () => {
  return trpc.assignment.updateSubmission.useMutation();
};

/**
 * React Query mutation for updating submission as teacher
 */
export const useUpdateSubmissionAsTeacherMutation = () => {
  return trpc.assignment.updateSubmissionAsTeacher.useMutation();
};

import { trpcClient } from '../trpc-client';
import { useStableCallback } from './hooks';
import { withRateLimit } from './rate-limiter';
import { trpc } from '../trpc';
import type { 
  ClassGetAllOutput,
  ClassGetOutput,
  ClassCreateInput,
  ClassUpdateInput,
  ClassJoinInput,
  ClassChangeRoleInput,
  ClassGetInviteCodeOutput,
  ClassGetGradesOutput,
  ClassGetSyllabusOutput,
  ClassGetFilesOutput
} from '../trpc';

// ===== CLASS MANAGEMENT API =====

/**
 * Get all classes for current user
 * @returns Promise with teacher and student classes
 */
export const getAllClasses = withRateLimit(async (): Promise<ClassGetAllOutput> => {
  try {
    const result = await trpcClient.class.getAll.query();
    return result;
  } catch (error) {
    console.error('Get all classes failed:', error);
    throw error;
  }
}, 'getAllClasses');

/**
 * Get specific class details
 * @param classId - Class ID
 * @returns Promise with class details
 */
export const getClass = async (classId: string): Promise<ClassGetOutput> => {
  try {
    const result = await trpcClient.class.get.query({ classId });
    return result;
  } catch (error) {
    console.error('Get class failed:', error);
    throw error;
  }
};

/**
 * Create a new class
 * @param input - Class creation data
 * @returns Promise with created class
 */
export const createClass = async (input: CreateClassInput): Promise<any> => {
  try {
    const result = await trpcClient.class.create.mutate(input);
    return result;
  } catch (error) {
    console.error('Create class failed:', error);
    throw error;
  }
};

/**
 * Update class details (Teacher Only)
 * @param input - Class update data
 * @returns Promise with updated class
 */
export const updateClass = async (input: UpdateClassInput): Promise<any> => {
  try {
    const result = await trpcClient.class.update.mutate(input);
    return result;
  } catch (error) {
    console.error('Update class failed:', error);
    throw error;
  }
};

/**
 * Delete a class (Teacher Only)
 * @param classId - Class ID
 * @param id - Class ID (duplicate parameter from spec)
 * @returns Promise with deletion result
 */
export const deleteClass = async (classId: string, id: string): Promise<any> => {
  try {
    const result = await trpcClient.class.delete.mutate({ classId, id });
    return result;
  } catch (error) {
    console.error('Delete class failed:', error);
    throw error;
  }
};

/**
 * Join class with invite code
 * @param input - Join class data
 * @returns Promise with join result
 */
export const joinClass = async (input: JoinClassInput): Promise<any> => {
  try {
    const result = await trpcClient.class.join.mutate(input);
    return result;
  } catch (error) {
    console.error('Join class failed:', error);
    throw error;
  }
};

/**
 * Get class invite code (Teacher Only)
 * @param classId - Class ID
 * @returns Promise with invite code
 */
export const getInviteCode = async (classId: string): Promise<ClassGetInviteCodeOutput> => {
  try {
    const result = await trpcClient.class.getInviteCode.query({ classId });
    return result;
  } catch (error) {
    console.error('Get invite code failed:', error);
    throw error;
  }
};

/**
 * Add student to class (Teacher Only)
 * @param classId - Class ID
 * @param studentId - Student ID
 * @returns Promise with add result
 */
export const addStudent = async (classId: string, studentId: string): Promise<any> => {
  try {
    const result = await trpcClient.class.addStudent.mutate({ classId, studentId });
    return result;
  } catch (error) {
    console.error('Add student failed:', error);
    throw error;
  }
};

/**
 * Change user role in class (Teacher Only)
 * @param input - Role change data
 * @returns Promise with role change result
 */
export const changeRole = async (input: ChangeRoleInput): Promise<any> => {
  try {
    const result = await trpcClient.class.changeRole.mutate(input);
    return result;
  } catch (error) {
    console.error('Change role failed:', error);
    throw error;
  }
};

/**
 * Remove member from class (Teacher Only)
 * @param classId - Class ID
 * @param userId - User ID
 * @returns Promise with removal result
 */
export const removeMember = async (classId: string, userId: string): Promise<any> => {
  try {
    const result = await trpcClient.class.removeMember.mutate({ classId, userId });
    return result;
  } catch (error) {
    console.error('Remove member failed:', error);
    throw error;
  }
};

// ===== CLASS MANAGEMENT HOOKS =====

/**
 * Hook for getting all classes with React Query features
 */
export const useGetAllClasses = () => {
  const stableGetAllClasses = useStableCallback(getAllClasses);
  
  return {
    getAllClasses: stableGetAllClasses
  };
};

/**
 * React Query hook for getting all classes with loading, error, and data states
 */
export const useGetAllClassesQuery = () => {
  return trpc.class.getAll.useQuery();
};

/**
 * React Query hook for getting a specific class
 */
export const useGetClassQuery = (classId: string) => {
  return trpc.class.get.useQuery({ classId });
};

/**
 * React Query mutation for creating a class
 */
export const useCreateClassMutation = () => {
  return trpc.class.create.useMutation();
};

/**
 * React Query mutation for updating a class
 */
export const useUpdateClassMutation = () => {
  return trpc.class.update.useMutation();
};

/**
 * React Query mutation for deleting a class
 */
export const useDeleteClassMutation = () => {
  return trpc.class.delete.useMutation();
};

/**
 * React Query mutation for joining a class
 */
export const useJoinClassMutation = () => {
  return trpc.class.join.useMutation();
};

/**
 * React Query mutation for changing user role
 */
export const useChangeRoleMutation = () => {
  return trpc.class.changeRole.useMutation();
};

/**
 * React Query mutation for removing member
 */
export const useRemoveMemberMutation = () => {
  return trpc.class.removeMember.useMutation();
};

/**
 * React Query query for getting invite code
 */
export const useGetInviteCodeQuery = (classId: string) => {
  return trpc.class.getInviteCode.useQuery({ classId });
};

/**
 * React Query query for listing mark schemes
 */
export const useListMarkSchemesQuery = (classId: string) => {
  return trpc.class.listMarkSchemes.useQuery({ classId });
};

/**
 * React Query mutation for creating mark scheme
 */
export const useCreateMarkSchemeMutation = () => {
  return trpc.class.createMarkScheme.useMutation();
};

/**
 * React Query mutation for updating mark scheme
 */
export const useUpdateMarkSchemeMutation = () => {
  return trpc.class.updateMarkScheme.useMutation();
};

/**
 * React Query mutation for deleting mark scheme
 */
export const useDeleteMarkSchemeMutation = () => {
  return trpc.class.deleteMarkScheme.useMutation();
};

/**
 * React Query query for listing grading boundaries
 */
export const useListGradingBoundariesQuery = (classId: string) => {
  return trpc.class.listGradingBoundaries.useQuery({ classId });
};

/**
 * React Query mutation for creating grading boundary
 */
export const useCreateGradingBoundaryMutation = () => {
  return trpc.class.createGradingBoundary.useMutation();
};

/**
 * React Query mutation for updating grading boundary
 */
export const useUpdateGradingBoundaryMutation = () => {
  return trpc.class.updateGradingBoundary.useMutation();
};

/**
 * React Query mutation for deleting grading boundary
 */
export const useDeleteGradingBoundaryMutation = () => {
  return trpc.class.deleteGradingBoundary.useMutation();
};

/**
 * Hook for getting specific class
 */
export const useGetClass = () => {
  return {
    getClass: async (classId: string) => {
      return await getClass(classId);
    }
  };
};

/**
 * Hook for class creation
 */
export const useCreateClass = () => {
  return {
    createClass: async (input: CreateClassInput) => {
      return await createClass(input);
    }
  };
};

/**
 * Hook for class updates
 */
export const useUpdateClass = () => {
  return {
    updateClass: async (input: UpdateClassInput) => {
      return await updateClass(input);
    }
  };
};

/**
 * Hook for class deletion
 */
export const useDeleteClass = () => {
  return {
    deleteClass: async (classId: string, id: string) => {
      return await deleteClass(classId, id);
    }
  };
};

/**
 * Hook for joining classes
 */
export const useJoinClass = () => {
  return {
    joinClass: async (input: JoinClassInput) => {
      return await joinClass(input);
    }
  };
};

/**
 * Hook for invite code management
 */
export const useInviteCode = () => {
  return {
    getInviteCode: async (classId: string) => {
      return await getInviteCode(classId);
    }
  };
};

/**
 * Hook for member management
 */
export const useMemberManagement = () => {
  return {
    addStudent: async (classId: string, studentId: string) => {
      return await addStudent(classId, studentId);
    },
    changeRole: async (input: ChangeRoleInput) => {
      return await changeRole(input);
    },
    removeMember: async (classId: string, userId: string) => {
      return await removeMember(classId, userId);
    }
  };
};

/**
 * Comprehensive class management hook
 */
export const useClassManagement = () => {
  return {
    // Queries
    getAllClasses: async () => {
      return await getAllClasses();
    },
    getClass: async (classId: string) => {
      return await getClass(classId);
    },
    getInviteCode: async (classId: string) => {
      return await getInviteCode(classId);
    },
    
    // Mutations
    createClass: async (input: CreateClassInput) => {
      return await createClass(input);
    },
    updateClass: async (input: UpdateClassInput) => {
      return await updateClass(input);
    },
    deleteClass: async (classId: string, id: string) => {
      return await deleteClass(classId, id);
    },
    joinClass: async (input: JoinClassInput) => {
      return await joinClass(input);
    },
    
    // Member management
    addStudent: async (classId: string, studentId: string) => {
      return await addStudent(classId, studentId);
    },
    changeRole: async (input: ChangeRoleInput) => {
      return await changeRole(input);
    },
    removeMember: async (classId: string, userId: string) => {
      return await removeMember(classId, userId);
    }
  };
};

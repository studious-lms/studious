import { trpc } from '../trpc';

// ===== REACT QUERY HOOKS =====

/**
 * React Query query for getting grades
 */
export const useGetGradesQuery = (classId: string, userId: string) => {
  return trpc.class.getGrades.useQuery({ classId, userId });
};

/**
 * React Query mutation for updating grade
 */
export const useUpdateGradeMutation = () => {
  return trpc.class.updateGrade.useMutation();
};

/**
 * React Query query for getting syllabus
 */
export const useGetSyllabusQuery = (classId: string) => {
  return trpc.class.getSyllabus.useQuery({ classId });
};

/**
 * React Query mutation for updating syllabus
 */
export const useUpdateSyllabusMutation = () => {
  return trpc.class.updateSyllabus.useMutation();
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
// ===== MAIN API EXPORTS =====
// This file exports all API functions and hooks for easy importing

// Authentication API
export * from './auth';

// User Management API
export * from './user';

// Class Management API
export * from './class';

// React Query hooks for classes
export {
  useGetAllClassesQuery,
  useGetClassQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
  useJoinClassMutation,
  useChangeRoleMutation,
  useRemoveMemberMutation,
  useGetInviteCodeQuery,
  useListMarkSchemesQuery,
  useCreateMarkSchemeMutation,
  useUpdateMarkSchemeMutation,
  useDeleteMarkSchemeMutation,
} from './class';

// React Query hooks for auth
export {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useResendVerificationEmailMutation,
  useAuthCheckQuery
} from './auth';

// React Query hooks for assignments
export {
  useGetAssignmentQuery,
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
  useGetSubmissionQuery,
  useGetSubmissionsQuery,
  useUpdateSubmissionMutation,
  useUpdateSubmissionAsTeacherMutation
} from './assignment';

// React Query hooks for user
export {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation
} from './user';

// React Query hooks for announcements
export {
  useGetAllAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation
} from './announcement';

// React Query hooks for files
export {
  useGetSignedUrlMutation,
  useGetClassFilesQuery,
  useMoveFileMutation,
  useRenameFileMutation,
  useDeleteFileMutation
} from './file';

// React Query hooks for notifications
export {
  useListNotificationsQuery,
  useGetNotificationQuery,
  useSendNotificationMutation,
  useSendNotificationToMultipleMutation,
  useMarkNotificationAsReadMutation
} from './notification';

// React Query hooks for grading
export {
  useGetGradesQuery,
  useUpdateGradeMutation,
  useGetSyllabusQuery,
  useUpdateSyllabusMutation,
  useListGradingBoundariesQuery,
  useCreateGradingBoundaryMutation,
  useUpdateGradingBoundaryMutation,
  useDeleteGradingBoundaryMutation
} from './grading';

// React Query hooks for calendar
export {
  useGetClassEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useGetCalendarQuery,
  useUpdateCalendarMutation
} from './calendar';

// Assignment Management API
export * from './assignment';

// Announcement API
export * from './announcement';

// File Management API
export * from './file';

// Notification API
export * from './notification';

// Grading & Assessment API
export * from './grading';

// Calendar & Events API
export * from './calendar';

// tRPC client and types
export { trpcClient, setAuthToken, clearAuthToken, isAuthenticated } from '../trpc-client';
export { trpc, RouterOutputs, RouterInputs } from '../trpc';

// ===== CONVENIENCE EXPORTS =====
// Re-export commonly used types for convenience

// Authentication types
export type {
  AuthRegisterInput,
  AuthLoginInput,
  AuthRegisterOutput,
  AuthLoginOutput,
  AuthCheckOutput
} from '../trpc';

// User types
export type {
  UserGetProfileOutput,
  UserUpdateProfileInput
} from '../trpc';

// Class types
export type {
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

// Assignment types
export type {
  AssignmentCreateInput,
  AssignmentUpdateInput,
  AssignmentGetOutput,
  AssignmentGetSubmissionOutput,
  AssignmentGetSubmissionsOutput,
  AssignmentUpdateSubmissionInput,
  AssignmentUpdateSubmissionAsTeacherInput
} from '../trpc';

// Announcement types
export type {
  AnnouncementGetAllOutput,
  AnnouncementCreateInput,
  AnnouncementUpdateInput
} from '../trpc';

// File types
export type {
  FileGetSignedUrlOutput
} from '../trpc';

// Notification types
export type {
  NotificationListOutput,
  NotificationGetOutput,
  NotificationSendToInput,
  NotificationSendToMultipleInput
} from '../trpc';

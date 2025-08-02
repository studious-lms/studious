import { useRouter } from 'next/navigation';

/**
 * Custom hook for consistent navigation throughout the application
 * Provides methods that ensure SPA navigation behavior
 */
export const useNavigation = () => {
  const router = useRouter();

  return {
    /**
     * Navigate to a route using Next.js router (SPA navigation)
     * @param href - The route to navigate to
     */
    push: (href: string) => {
      router.push(href);
    },

    /**
     * Navigate to a route and replace current history entry
     * @param href - The route to navigate to
     */
    replace: (href: string) => {
      router.replace(href);
    },

    /**
     * Navigate back in history
     */
    back: () => {
      router.back();
    },

    /**
     * Navigate forward in history
     */
    forward: () => {
      router.forward();
    },

    /**
     * Refresh the current page (use sparingly, prefer router.refresh())
     */
    refresh: () => {
      router.refresh();
    },

    /**
     * Navigate to external URL (opens in new tab)
     * @param url - The external URL
     */
    openExternal: (url: string) => {
      window.open(url, '_blank', 'noopener,noreferrer');
    },

    /**
     * Navigate to external URL (same tab)
     * @param url - The external URL
     */
    navigateExternal: (url: string) => {
      window.location.href = url;
    }
  };
};

/**
 * Navigation constants for commonly used routes
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  CLASSES: '/classes',
  AGENDA: '/agenda',
  PRICING: '/pricing',
  
  // Class routes
  CLASS: (classId: string) => `/classes/${classId}`,
  CLASS_ASSIGNMENTS: (classId: string) => `/classes/${classId}/assignments`,
  CLASS_FILES: (classId: string) => `/classes/${classId}/files`,
  CLASS_GRADES: (classId: string) => `/classes/${classId}/grades`,
  CLASS_MEMBERS: (classId: string) => `/classes/${classId}/members`,
  CLASS_SETTINGS: (classId: string) => `/classes/${classId}/settings`,
  CLASS_SYLLABUS: (classId: string) => `/classes/${classId}/syllabus`,
  CLASS_ATTENDANCE: (classId: string) => `/classes/${classId}/attendance`,
  CLASS_LABS: (classId: string) => `/classes/${classId}/labs`,
  
  // Assignment routes
  ASSIGNMENT: (classId: string, assignmentId: string) => 
    `/classes/${classId}/assignment/${assignmentId}`,
  ASSIGNMENT_EDIT: (classId: string, assignmentId: string) => 
    `/classes/${classId}/assignment/${assignmentId}/edit`,
  ASSIGNMENT_SUBMISSION: (classId: string, assignmentId: string, submissionId: string) => 
    `/classes/${classId}/assignment/${assignmentId}/submission/${submissionId}`,
  
  // File routes
  FILES_FOLDER: (classId: string, folderId: string) => 
    `/classes/${classId}/files/${folderId}`,
  FILES_ASSIGNMENT: (classId: string, assignmentId: string) => 
    `/classes/${classId}/files/assignments/${assignmentId}`,
  
  // Grade routes
  GRADES_USER: (classId: string, userId: string) => 
    `/classes/${classId}/grades/${userId}`,
} as const; 
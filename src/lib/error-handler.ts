import * as Sentry from '@sentry/nextjs';
import { toast } from 'sonner';

/**
 * Initialize global error handlers for unhandled errors
 */
export function setupGlobalErrorHandlers() {
  if (typeof window === 'undefined') return;

  // Handle unhandled JavaScript errors
  window.addEventListener('error', (event) => {
    // Don't log errors from extensions or external scripts
    if (event.filename && !event.filename.includes(window.location.origin)) {
      return;
    }

    Sentry.captureException(event.error || new Error(event.message), {
      tags: {
        errorType: 'unhandled',
        filename: event.filename,
        lineno: event.lineno?.toString(),
        colno: event.colno?.toString(),
      },
    });

    // Only log in development
    if (process.env.NODE_ENV === 'development' && event.error) {
      console.error('Unhandled error:', event.error);
    }
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason));

    Sentry.captureException(error, {
      tags: {
        errorType: 'unhandledRejection',
      },
    });

    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Unhandled promise rejection:', error);
    }
    
    // Optionally show toast for critical errors
    if (error.message.includes('Network') || error.message.includes('fetch')) {
      toast.error('Network error. Please check your connection.');
    }
  });
}


import { trpcClient } from '../trpc-client';
import { useStableCallback } from './hooks';
import { withRateLimit } from './rate-limiter';
import { trpc } from '../trpc';
import type { 
  NotificationListOutput,
  NotificationGetOutput,
  NotificationSendToInput,
  NotificationSendToMultipleInput
} from '../trpc';

// ===== NOTIFICATION API =====

/**
 * Get all notifications for user
 * @returns Promise with notifications array
 */
export const listNotifications = withRateLimit(async (): Promise<NotificationListOutput> => {
  try {
    const result = await trpcClient.notification.list.query();
    return result;
  } catch (error) {
    console.error('List notifications failed:', error);
    throw error;
  }
}, 'listNotifications');

/**
 * Get specific notification
 * @param id - Notification ID
 * @returns Promise with notification data
 */
export const getNotification = async (id: string): Promise<NotificationGetOutput> => {
  try {
    const result = await trpcClient.notification.get.query({ id });
    return result;
  } catch (error) {
    console.error('Get notification failed:', error);
    throw error;
  }
};

/**
 * Send notification to user
 * @param input - Notification data
 * @returns Promise with send result
 */
export const sendNotification = async (input: NotificationSendToInput): Promise<any> => {
  try {
    const result = await trpcClient.notification.sendTo.mutate(input);
    return result;
  } catch (error) {
    console.error('Send notification failed:', error);
    throw error;
  }
};

/**
 * Send notification to multiple users
 * @param input - Multiple notification data
 * @returns Promise with send result
 */
export const sendNotificationToMultiple = async (input: NotificationSendToMultipleInput): Promise<any> => {
  try {
    const result = await trpcClient.notification.sendToMultiple.mutate(input);
    return result;
  } catch (error) {
    console.error('Send notification to multiple failed:', error);
    throw error;
  }
};

/**
 * Mark notification as read
 * @param id - Notification ID
 * @returns Promise with mark result
 */
export const markNotificationAsRead = async (id: string): Promise<any> => {
  try {
    const result = await trpcClient.notification.markAsRead.mutate({ id });
    return result;
  } catch (error) {
    console.error('Mark notification as read failed:', error);
    throw error;
  }
};

// ===== NOTIFICATION HOOKS =====

/**
 * Hook for listing notifications
 */
export const useListNotifications = () => {
  const stableListNotifications = useStableCallback(listNotifications);
  
  return {
    listNotifications: stableListNotifications
  };
};

/**
 * Hook for getting specific notification
 */
export const useGetNotification = () => {
  const stableGetNotification = useStableCallback(getNotification);
  
  return {
    getNotification: stableGetNotification
  };
};

/**
 * Hook for sending notifications
 */
export const useSendNotification = () => {
  const stableSendNotification = useStableCallback(sendNotification);
  const stableSendNotificationToMultiple = useStableCallback(sendNotificationToMultiple);
  
  return {
    sendNotification: stableSendNotification,
    sendNotificationToMultiple: stableSendNotificationToMultiple
  };
};

/**
 * Hook for notification status management
 */
export const useNotificationStatus = () => {
  const stableMarkAsRead = useStableCallback(markNotificationAsRead);
  
  return {
    markAsRead: stableMarkAsRead
  };
};

/**
 * Comprehensive notification management hook
 */
export const useNotificationManagement = () => {
  return {
    // Queries
    listNotifications: async () => {
      return await listNotifications();
    },
    getNotification: async (id: string) => {
      return await getNotification(id);
    },
    
    // Mutations
    sendNotification: async (input: SendNotificationInput) => {
      return await sendNotification(input);
    },
    sendNotificationToMultiple: async (input: SendNotificationToMultipleInput) => {
      return await sendNotificationToMultiple(input);
    },
    markAsRead: async (id: string) => {
      return await markNotificationAsRead(id);
    }
  };
};

// ===== REACT QUERY HOOKS =====

/**
 * React Query query for listing notifications
 */
export const useListNotificationsQuery = () => {
  return trpc.notification.list.useQuery();
};

/**
 * React Query query for getting specific notification
 */
export const useGetNotificationQuery = (id: string) => {
  return trpc.notification.get.useQuery({ id });
};

/**
 * React Query mutation for sending notification
 */
export const useSendNotificationMutation = () => {
  return trpc.notification.sendTo.useMutation();
};

/**
 * React Query mutation for sending notification to multiple users
 */
export const useSendNotificationToMultipleMutation = () => {
  return trpc.notification.sendToMultiple.useMutation();
};

/**
 * React Query mutation for marking notification as read
 */
export const useMarkNotificationAsReadMutation = () => {
  return trpc.notification.markAsRead.useMutation();
};

// ===== NOTIFICATION UTILITY FUNCTIONS =====

/**
 * Get unread notifications count
 * @param notifications - Array of notifications
 * @returns Number of unread notifications
 */
export const getUnreadCount = (notifications: Notification[]): number => {
  return notifications.filter(notification => !notification.read).length;
};

/**
 * Get recent notifications (last 7 days)
 * @param notifications - Array of notifications
 * @returns Array of recent notifications
 */
export const getRecentNotifications = (notifications: Notification[]): Notification[] => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return notifications.filter(notification => 
    new Date(notification.createdAt) >= sevenDaysAgo
  );
};

/**
 * Group notifications by date
 * @param notifications - Array of notifications
 * @returns Object with date keys and notification arrays
 */
export const groupNotificationsByDate = (notifications: Notification[]): Record<string, Notification[]> => {
  return notifications.reduce((groups, notification) => {
    const date = new Date(notification.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {} as Record<string, Notification[]>);
};

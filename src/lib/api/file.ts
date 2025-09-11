import { trpcClient } from '../trpc-client';
import { useStableCallback } from './hooks';
import { withRateLimit } from './rate-limiter';
import { trpc } from '../trpc';
import type { FileGetSignedUrlOutput, ClassGetFilesOutput } from '../trpc';

// ===== FILE MANAGEMENT API =====

/**
 * Get signed URL for file download
 * @param fileId - File ID
 * @returns Promise with signed URL
 */
export const getSignedUrl = withRateLimit(async (fileId: string): Promise<FileGetSignedUrlOutput> => {
  try {
    const result = await trpcClient.file.getSignedUrl.mutate({ fileId });
    return result;
  } catch (error) {
    console.error('Get signed URL failed:', error);
    throw error;
  }
}, 'getSignedUrl');

/**
 * Move file to different folder (Teacher Only)
 * @param fileId - File ID
 * @param targetFolderId - Target folder ID
 * @param classId - Class ID
 * @returns Promise with move result
 */
export const moveFile = async (fileId: string, targetFolderId: string, classId: string): Promise<any> => {
  try {
    const result = await trpcClient.file.move.mutate({ fileId, targetFolderId, classId });
    return result;
  } catch (error) {
    console.error('Move file failed:', error);
    throw error;
  }
};

/**
 * Rename file (Teacher Only)
 * @param fileId - File ID
 * @param newName - New file name
 * @param classId - Class ID
 * @returns Promise with rename result
 */
export const renameFile = async (fileId: string, newName: string, classId: string): Promise<any> => {
  try {
    const result = await trpcClient.file.rename.mutate({ fileId, newName, classId });
    return result;
  } catch (error) {
    console.error('Rename file failed:', error);
    throw error;
  }
};

/**
 * Delete file (Teacher Only)
 * @param fileId - File ID
 * @param classId - Class ID
 * @returns Promise with deletion result
 */
export const deleteFile = async (fileId: string, classId: string): Promise<any> => {
  try {
    const result = await trpcClient.file.delete.mutate({ fileId, classId });
    return result;
  } catch (error) {
    console.error('Delete file failed:', error);
    throw error;
  }
};

/**
 * Get organized files for class
 * @param classId - Class ID
 * @returns Promise with organized files
 */
export const getClassFiles = async (classId: string): Promise<ClassGetFilesOutput> => {
  try {
    const result = await trpcClient.class.getFiles.query({ classId });
    return result;
  } catch (error) {
    console.error('Get class files failed:', error);
    throw error;
  }
};

// ===== FILE MANAGEMENT HOOKS =====

/**
 * Hook for file downloads
 */
export const useFileDownload = () => {
  const stableGetSignedUrl = useStableCallback(getSignedUrl);
  
  return {
    getSignedUrl: stableGetSignedUrl
  };
};

/**
 * Hook for file operations (Teacher Only)
 */
export const useFileOperations = () => {
  const stableMoveFile = useStableCallback(moveFile);
  const stableRenameFile = useStableCallback(renameFile);
  const stableDeleteFile = useStableCallback(deleteFile);
  
  return {
    moveFile: stableMoveFile,
    renameFile: stableRenameFile,
    deleteFile: stableDeleteFile
  };
};

/**
 * Hook for class file organization
 */
export const useClassFiles = () => {
  const stableGetClassFiles = useStableCallback(getClassFiles);
  
  return {
    getClassFiles: stableGetClassFiles
  };
};

/**
 * Comprehensive file management hook
 */
export const useFileManagement = () => {
  return {
    // File access
    getSignedUrl: async (fileId: string) => {
      return await getSignedUrl(fileId);
    },
    getClassFiles: async (classId: string) => {
      return await getClassFiles(classId);
    },
    
    // File operations (Teacher Only)
    moveFile: async (fileId: string, targetFolderId: string, classId: string) => {
      return await moveFile(fileId, targetFolderId, classId);
    },
    renameFile: async (fileId: string, newName: string, classId: string) => {
      return await renameFile(fileId, newName, classId);
    },
    deleteFile: async (fileId: string, classId: string) => {
      return await deleteFile(fileId, classId);
    }
  };
};

// ===== REACT QUERY HOOKS =====

/**
 * React Query mutation for getting signed URL
 */
export const useGetSignedUrlMutation = () => {
  return trpc.file.getSignedUrl.useMutation();
};

/**
 * React Query query for getting class files
 */
export const useGetClassFilesQuery = (classId: string) => {
  return trpc.class.getFiles.useQuery({ classId });
};

/**
 * React Query mutation for moving file
 */
export const useMoveFileMutation = () => {
  return trpc.file.move.useMutation();
};

/**
 * React Query mutation for renaming file
 */
export const useRenameFileMutation = () => {
  return trpc.file.rename.useMutation();
};

/**
 * React Query mutation for deleting file
 */
export const useDeleteFileMutation = () => {
  return trpc.file.delete.useMutation();
};

// ===== FILE UTILITY FUNCTIONS =====

/**
 * Convert file to base64 for upload
 * @param file - File object
 * @returns Promise with base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Create file object for API upload
 * @param file - File object
 * @returns Promise with API file object
 */
export const createApiFile = async (file: File): Promise<{
  name: string;
  type: string;
  size: number;
  data: string;
}> => {
  const base64Data = await fileToBase64(file);
  return {
    name: file.name,
    type: file.type,
    size: file.size,
    data: base64Data
  };
};

/**
 * Download file from signed URL
 * @param url - Signed URL
 * @param filename - Optional filename
 */
export const downloadFile = (url: string, filename?: string) => {
  const link = document.createElement('a');
  link.href = url;
  if (filename) {
    link.download = filename;
  }
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

import { trpc } from './trpc';

/**
 * Direct Upload Utility Functions
 * 
 * These functions provide a clean interface for the new direct upload endpoints.
 */

/**
 * Fix upload URL to use the correct API base URL from environment variables
 * This handles both development and production environments
 */
export function fixUploadUrl(uploadUrl: string): string {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/trpc', '') || 'http://localhost:3001';
  return uploadUrl.replace(/^https?:\/\/[^\/]+/, apiBaseUrl);
}

// Assignment file upload functions
export const assignmentUpload = {
  /**
   * Get upload URLs for assignment files
   */
  async getUploadUrls(files: { name: string; type: string; size: number }[], assignmentId: string, classId: string) {
    return await trpc.assignment.getAssignmentUploadUrls.mutate({
      assignmentId,
      classId,
      files
    });
  },

  /**
   * Confirm assignment file upload
   */
  async confirmUpload(fileId: string, success: boolean) {
    return await trpc.assignment.confirmAssignmentUpload.mutate({
      fileId,
      uploadSuccess: success
    });
  }
};

// Submission file upload functions
export const submissionUpload = {
  /**
   * Get upload URLs for submission files
   */
  async getUploadUrls(files: { name: string; type: string; size: number }[], assignmentId: string, classId: string, submissionId: string) {
    return await trpc.assignment.getSubmissionUploadUrls.mutate({
      assignmentId,
      classId,
      submissionId,
      files
    });
  },

  /**
   * Confirm submission file upload
   */
  async confirmUpload(fileId: string, success: boolean) {
    return await trpc.assignment.confirmSubmissionUpload.mutate({
      fileId,
      uploadSuccess: success
    });
  }
};

// Folder file upload functions
export const folderUpload = {
  /**
   * Get upload URLs for folder files
   */
  async getUploadUrls(files: { name: string; type: string; size: number }[], classId: string, folderId: string) {
    return await trpc.folder.getFolderUploadUrls.mutate({
      classId,
      folderId,
      files
    });
  },

  /**
   * Confirm folder file upload
   */
  async confirmUpload(fileId: string, success: boolean) {
    return await trpc.folder.confirmFolderUpload.mutate({
      fileId,
      uploadSuccess: success
    });
  }
};

/**
 * Generic direct upload function that handles the complete flow
 */
export async function performDirectUpload(
  files: File[],
  getUploadUrls: (files: { name: string; type: string; size: number }[]) => Promise<{ fileId: string; uploadUrl: string }[]>,
  confirmUpload: (fileId: string, success: boolean) => Promise<void>,
  onProgress?: (fileId: string, progress: number) => void
): Promise<{ fileId: string; name: string; type: string; size: number }[]> {
  
  const fileData = files.map(file => ({
    name: file.name,
    type: file.type,
    size: file.size
  }));

  // Get upload URLs from backend
  const uploadUrls = await getUploadUrls(fileData);

  // Upload each file to GCS
  const uploadPromises = files.map(async (file, index) => {
    const { fileId, uploadUrl } = uploadUrls[index];
    
    try {
      // Upload to backend proxy with progress tracking (resolves CORS issues)
      const xhr = new XMLHttpRequest();
      
      await new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress?.(fileId, progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        const fixedUploadUrl = fixUploadUrl(uploadUrl);
        xhr.open('POST', fixedUploadUrl); // Backend proxy uses POST
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      // Confirm upload success
      await confirmUpload(fileId, true);
      
      return {
        fileId,
        name: file.name,
        type: file.type,
        size: file.size
      };
      
    } catch (error) {
      // Confirm upload failure
      await confirmUpload(fileId, false);
      throw error;
    }
  });

  return await Promise.all(uploadPromises);
}

/**
 * Example usage in components:
 * 
 * ```typescript
 * import { assignmentUpload, performDirectUpload } from '@/lib/directUpload';
 * 
 * const handleFileUpload = async (files: File[]) => {
 *   try {
 *     const uploadedFiles = await performDirectUpload(
 *       files,
 *       (fileData) => assignmentUpload.getUploadUrls(fileData, assignmentId, classId),
 *       (fileId, success) => assignmentUpload.confirmUpload(fileId, success),
 *       (fileId, progress) => {
 *         // Update progress UI
 *         console.log(`File ${fileId}: ${progress}%`);
 *       }
 *     );
 *     
 *     console.log('Upload completed:', uploadedFiles);
 *   } catch (error) {
 *     console.error('Upload failed:', error);
 *   }
 * };
 * ```
 */

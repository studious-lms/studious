/**
 * Direct Upload Utility Functions
 * 
 * These utilities help with the direct upload flow to Google Cloud Storage.
 */

/**
 * Fix upload URL to use the correct API base URL from environment variables
 * This handles both development and production environments
 */
export function fixUploadUrl(uploadUrl: string): string {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/trpc', '') || 'http://localhost:3001';
  return uploadUrl.replace(/^https?:\/\/[^\/]+/, apiBaseUrl);
}

/**
 * BACKEND API STRUCTURE REFERENCE
 * 
 * Use these patterns in React components with TRPC hooks:
 * 
 * === ASSIGNMENT UPLOAD (Teacher creates/updates assignment with files) ===
 * const getUploadUrls = trpc.assignment.getAssignmentUploadUrls.useMutation();
 * const response = await getUploadUrls.mutateAsync({ assignmentId, classId, files });
 * // Returns: { success: true, uploadFiles: [{ id, name, type, size, path, uploadUrl, uploadExpiresAt, uploadSessionId }] }
 * 
 * === SUBMISSION UPLOAD (Student submits their work) ===
 * const getUploadUrls = trpc.assignment.getSubmissionUploadUrls.useMutation();
 * const response = await getUploadUrls.mutateAsync({ submissionId, classId, files });
 * // Returns: { success: true, uploadFiles: [{ id, name, type, size, path, uploadUrl, uploadExpiresAt, uploadSessionId }] }
 * // Note: NO assignmentId parameter needed
 * 
 * === ANNOTATION UPLOAD (Teacher adds feedback files to student submission) ===
 * const getUploadUrls = trpc.assignment.getAnnotationUploadUrls.useMutation();
 * const response = await getUploadUrls.mutateAsync({ submissionId, classId, files });
 * // Returns: { success: true, uploadFiles: [{ id, name, type, size, path, uploadUrl, uploadExpiresAt, uploadSessionId }] }
 * 
 * === FOLDER UPLOAD (Teacher uploads files to class folder) ===
 * const getUploadUrls = trpc.folder.getFolderUploadUrls.useMutation();
 * const response = await getUploadUrls.mutateAsync({ classId, folderId, files });
 * // Returns: [{ id, name, type, size, path, uploadUrl, uploadExpiresAt, uploadSessionId }]
 * // Note: Returns array DIRECTLY, not wrapped in { uploadFiles: [] }
 * 
 * === CONFIRM UPLOAD ===
 * // Assignment confirm
 * const confirmUpload = trpc.assignment.confirmAssignmentUpload.useMutation();
 * await confirmUpload.mutateAsync({ classId, fileId, uploadSuccess: true });
 * 
 * // Submission confirm
 * const confirmUpload = trpc.assignment.confirmSubmissionUpload.useMutation();
 * await confirmUpload.mutateAsync({ classId, fileId, uploadSuccess: true });
 * 
 * // Annotation confirm
 * const confirmUpload = trpc.assignment.confirmAnnotationUpload.useMutation();
 * await confirmUpload.mutateAsync({ classId, fileId, uploadSuccess: true });
 * 
 * // Folder confirm
 * const confirmUpload = trpc.folder.confirmFolderUpload.useMutation();
 * await confirmUpload.mutateAsync({ classId, fileId, uploadSuccess: true });
 */

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
 * // === ASSIGNMENT UPLOAD (Teacher creates assignment with files) ===
 * const getAssignmentUploadUrls = trpc.assignment.getAssignmentUploadUrls.useMutation();
 * const confirmAssignmentUpload = trpc.assignment.confirmAssignmentUpload.useMutation();
 * 
 * const handleAssignmentUpload = async (files: File[]) => {
 *   const fileMetadata = Array.from(files).map(file => ({
 *     name: file.name,
 *     type: file.type,
 *     size: file.size
 *   }));
 *   
 *   const response = await getAssignmentUploadUrls.mutateAsync({
 *     assignmentId,
 *     classId,
 *     files: fileMetadata
 *   });
 *   
 *   for (const [index, file] of Array.from(files).entries()) {
 *     const uploadFile = response.uploadFiles[index];
 *     const fixedUrl = fixUploadUrl(uploadFile.uploadUrl);
 *     
 *     await fetch(fixedUrl, {
 *       method: 'POST',
 *       body: file,
 *       headers: { 'Content-Type': file.type }
 *     });
 *     
 *     await confirmAssignmentUpload.mutateAsync({
 *       classId,
 *       fileId: uploadFile.id,
 *       uploadSuccess: true
 *     });
 *   }
 * };
 * 
 * // === SUBMISSION UPLOAD (Student submits work) ===
 * const getSubmissionUploadUrls = trpc.assignment.getSubmissionUploadUrls.useMutation();
 * const confirmSubmissionUpload = trpc.assignment.confirmSubmissionUpload.useMutation();
 * 
 * const handleSubmissionUpload = async (files: File[]) => {
 *   const response = await getSubmissionUploadUrls.mutateAsync({
 *     submissionId,
 *     classId,
 *     files: fileMetadata
 *   });
 *   
 *   // ... same upload flow as above ...
 * };
 * 
 * // === ANNOTATION UPLOAD (Teacher adds feedback files) ===
 * const getAnnotationUploadUrls = trpc.assignment.getAnnotationUploadUrls.useMutation();
 * const confirmAnnotationUpload = trpc.assignment.confirmAnnotationUpload.useMutation();
 * 
 * const handleAnnotationUpload = async (files: File[]) => {
 *   const response = await getAnnotationUploadUrls.mutateAsync({
 *     submissionId,
 *     classId,
 *     files: fileMetadata
 *   });
 *   
 *   // ... same upload flow as above ...
 * };
 * 
 * // === FOLDER UPLOAD (Teacher uploads to class folder) ===
 * const getFolderUploadUrls = trpc.folder.getFolderUploadUrls.useMutation();
 * const confirmFolderUpload = trpc.folder.confirmFolderUpload.useMutation();
 * 
 * const handleFolderUpload = async (files: File[]) => {
 *   const response = await getFolderUploadUrls.mutateAsync({
 *     classId,
 *     folderId,
 *     files: fileMetadata
 *   });
 *   // Note: response is ARRAY directly, not { uploadFiles: [] }
 *   
 *   // ... same upload flow as above ...
 * };
 * ```
 */

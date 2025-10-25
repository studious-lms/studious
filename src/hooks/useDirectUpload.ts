import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface UploadFile {
  id: string;
  file: File;
  name: string;
  type: string;
  size: number;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  error?: string;
  uploadUrl?: string;
  fileId?: string;
}

export interface DirectUploadOptions {
  onProgress?: (fileId: string, progress: number) => void;
  onComplete?: (fileId: string, fileData: any) => void;
  onError?: (fileId: string, error: string) => void;
}

export function useDirectUpload(options: DirectUploadOptions = {}) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const addFiles = useCallback((newFiles: File[]) => {
    const uploadFiles: UploadFile[] = newFiles.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      name: file.name,
      type: file.type,
      size: file.size,
      progress: 0,
      status: 'pending'
    }));

    setFiles(prev => [...prev, ...uploadFiles]);
    return uploadFiles;
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  }, []);

  const updateFileStatus = useCallback((fileId: string, updates: Partial<UploadFile>) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, ...updates } : file
    ));
  }, []);

  const uploadFileToGCS = useCallback(async (
    file: UploadFile,
    uploadUrl: string,
    onProgress?: (progress: number) => void
  ): Promise<Response> => {
    const xhr = new XMLHttpRequest();
    
    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress?.(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response);
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file.file);
    });
  }, []);

  const uploadFiles = useCallback(async (
    getUploadUrls: (files: { name: string; type: string; size: number }[]) => Promise<{ fileId: string; uploadUrl: string }[]>,
    confirmUpload: (fileId: string, success: boolean) => Promise<void>
  ) => {
    if (files.length === 0) {
      toast.error("No files selected");
      return;
    }

    setIsUploading(true);

    try {
      // Get upload URLs from backend
      const fileData = files.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size
      }));

      const uploadUrls = await getUploadUrls(fileData);

      // Upload each file to GCS
      const uploadPromises = files.map(async (file, index) => {
        const { fileId, uploadUrl } = uploadUrls[index];
        
        updateFileStatus(file.id, { 
          status: 'uploading', 
          fileId,
          uploadUrl 
        });

        try {
          await uploadFileToGCS(
            file,
            uploadUrl,
            (progress) => {
              updateFileStatus(file.id, { progress });
              options.onProgress?.(file.id, progress);
            }
          );

          // Confirm upload success
          await confirmUpload(fileId, true);
          
          updateFileStatus(file.id, { 
            status: 'completed', 
            progress: 100 
          });
          
          options.onComplete?.(file.id, { fileId, name: file.name, type: file.type, size: file.size });
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Upload failed';
          
          updateFileStatus(file.id, { 
            status: 'failed', 
            error: errorMessage 
          });
          
          // Confirm upload failure
          await confirmUpload(fileId, false);
          
          options.onError?.(file.id, errorMessage);
        }
      });

      await Promise.all(uploadPromises);
      
      const successfulUploads = files.filter(file => file.status === 'completed');
      if (successfulUploads.length > 0) {
        toast.success(`Successfully uploaded ${successfulUploads.length} file(s)`);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, [files, uploadFileToGCS, updateFileStatus, options]);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const reset = useCallback(() => {
    setFiles([]);
    setIsUploading(false);
  }, []);

  return {
    files,
    isUploading,
    addFiles,
    removeFile,
    updateFileStatus,
    uploadFiles,
    clearFiles,
    reset
  };
}

import React, { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Upload, 
  FileIcon, 
  FileText, 
  ImageIcon, 
  FileVideo, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useDirectUpload, UploadFile } from '@/hooks/useDirectUpload';
import { toast } from 'sonner';

interface DirectUploadModalProps {
  children: React.ReactNode;
  onFilesUploaded?: (files: any[]) => void;
  getUploadUrls: (files: { name: string; type: string; size: number }[]) => Promise<{ fileId: string; uploadUrl: string }[]>;
  confirmUpload: (fileId: string, success: boolean) => Promise<void>;
  title?: string;
  description?: string;
  maxFiles?: number;
  acceptedFileTypes?: string;
}

export function DirectUploadModal({ 
  children, 
  onFilesUploaded, 
  getUploadUrls,
  confirmUpload,
  title,
  description,
  maxFiles = 10,
  acceptedFileTypes = "*"
}: DirectUploadModalProps) {
  const t = useTranslations('directUpload');
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    files,
    isUploading,
    addFiles,
    removeFile,
    uploadFiles,
    clearFiles,
    reset
  } = useDirectUpload({
    onComplete: (fileId, fileData) => {
      // Handle successful upload
    },
    onError: (fileId, error) => {
      toast.error(t('uploadFailed', { error }));
    }
  });

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <ImageIcon className="h-4 w-4" />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <FileVideo className="h-4 w-4" />;
      case 'pdf':
      case 'doc':
      case 'docx':
      case 'txt':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileIcon className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'uploading':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">{t('status.pending')}</Badge>;
      case 'uploading':
        return <Badge variant="secondary">{t('status.uploading')}</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-500">{t('status.completed')}</Badge>;
      case 'failed':
        return <Badge variant="destructive">{t('status.failed')}</Badge>;
      default:
        return null;
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (selectedFiles.length + files.length > maxFiles) {
      toast.error(t('maxFilesExceeded', { max: maxFiles }));
      return;
    }

    addFiles(selectedFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error(t('noFilesSelected'));
      return;
    }

    try {
      await uploadFiles(getUploadUrls, confirmUpload);
      
      // Get completed files for callback
      const completedFiles = files.filter(file => file.status === 'completed');
      if (completedFiles.length > 0 && onFilesUploaded) {
        onFilesUploaded(completedFiles.map(file => ({
          id: file.fileId,
          name: file.name,
          type: file.type,
          size: file.size,
          fileId: file.fileId
        })));
      }

      // Close modal and reset if all uploads successful
      const failedUploads = files.filter(file => file.status === 'failed');
      if (failedUploads.length === 0) {
        setOpen(false);
        reset();
      }
    } catch (error) {
      toast.error(t('uploadFailedGeneric'));
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setOpen(false);
      reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title || t('title')}</DialogTitle>
          <p className="text-sm text-muted-foreground">{description || t('description')}</p>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Input */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">{t('selectFiles')}</Label>
            <Input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              multiple
              accept={acceptedFileTypes}
              onChange={handleFileSelect}
              disabled={isUploading}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              {t('maxFiles', { max: maxFiles, types: acceptedFileTypes === "*" ? t('allFiles') : acceptedFileTypes })}
            </p>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <Label>{t('selectedFiles', { count: files.length })}</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {files.map((file) => (
                  <Card key={file.id} className="p-3">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          {getFileIcon(file.name)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </span>
                              {getStatusBadge(file.status)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(file.status)}
                          {file.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.id)}
                              disabled={isUploading}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      {file.status === 'uploading' && (
                        <div className="mt-2">
                          <Progress value={file.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {t('progressUploaded', { progress: file.progress })}
                          </p>
                        </div>
                      )}
                      
                      {/* Error Message */}
                      {file.status === 'failed' && file.error && (
                        <p className="text-xs text-red-500 mt-1">{file.error}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('uploading')}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {files.length === 1 ? t('upload', { count: files.length }) : t('uploadPlural', { count: files.length })}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

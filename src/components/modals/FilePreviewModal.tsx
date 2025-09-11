"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  Share,
  X,
  FileText,
  Image,
  FileVideo,
  Music,
  Archive,
  FileSpreadsheet,
  Presentation,
  File,
  Calendar,
  User,
  HardDrive,
  Eye
} from "lucide-react";

interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  fileType?: string;
  size?: string;
  uploadedBy?: string;
  uploadedAt?: string;
}

interface FilePreviewModalProps {
  file: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: string, file: FileItem) => void;
}

export function FilePreviewModal({ file, isOpen, onClose, onAction }: FilePreviewModalProps) {
  if (!file) return null;

  const getFileIcon = (fileType: string) => {
    const iconSize = "h-12 w-12";
    
    switch (fileType) {
      case "pdf":
        return <FileText className={`${iconSize} text-red-500`} />;
      case "docx":
        return <FileText className={`${iconSize} text-blue-500`} />;
      case "pptx":
        return <Presentation className={`${iconSize} text-orange-500`} />;
      case "xlsx":
        return <FileSpreadsheet className={`${iconSize} text-green-500`} />;
      case "mp4":
        return <FileVideo className={`${iconSize} text-purple-500`} />;
      case "mp3":
        return <Music className={`${iconSize} text-pink-500`} />;
      case "zip":
        return <Archive className={`${iconSize} text-gray-500`} />;
      case "jpg":
      case "png":
      case "gif":
        return <Image className={`${iconSize} text-emerald-500`} />;
      default:
        return <File className={`${iconSize} text-slate-500`} />;
    }
  };

  const getFileTypeLabel = (fileType: string) => {
    const types: Record<string, string> = {
      pdf: "PDF Document",
      docx: "Word Document",
      pptx: "PowerPoint Presentation",
      xlsx: "Excel Spreadsheet",
      mp4: "Video File",
      mp3: "Audio File",
      zip: "Archive File",
      jpg: "JPEG Image",
      png: "PNG Image",
      gif: "GIF Image"
    };
    return types[fileType] || "File";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const renderPreview = () => {
    if (!file.fileType) return null;

    switch (file.fileType) {
      case "jpg":
      case "png":
      case "gif":
        return (
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
            <div className="text-center">
              <Image className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Image preview not available</p>
            </div>
          </div>
        );
      case "mp4":
        return (
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
            <div className="text-center">
              <FileVideo className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Video preview not available</p>
            </div>
          </div>
        );
      case "pdf":
        return (
          <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center mb-4">
            <div className="text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">PDF preview not available</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
            <div className="text-center">
              <Eye className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Preview not available for this file type</p>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getFileIcon(file.fileType!)}
            <div>
              <div className="flex items-center gap-2">
                <span>{file.name}</span>
              </div>
              <Badge variant="secondary" className="text-xs mt-1">
                {getFileTypeLabel(file.fileType!)}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview Area */}
          {renderPreview()}

          {/* File Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">File Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Size:</span>
                  <span>{file.size}</span>
                </div>
                {file.uploadedBy && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Uploaded by:</span>
                    <span>{file.uploadedBy}</span>
                  </div>
                )}
                {file.uploadedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Uploaded:</span>
                    <span>{formatDate(file.uploadedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Actions</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAction("download", file)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAction("share", file)}
                >
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
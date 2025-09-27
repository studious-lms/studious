import { RouterOutputs } from "@/lib/trpc";

// API types from router outputs
export type ApiFile = NonNullable<RouterOutputs["folder"]["getRootFolder"]>["files"][number];
export type ApiFolder = NonNullable<RouterOutputs["folder"]["getRootFolder"]>["childFolders"][number];

// API types for folder.get endpoint (for specific folder pages)
export type ApiFolderGetFile = NonNullable<RouterOutputs["folder"]["get"]>["files"][number];
export type ApiFolderGetFolder = NonNullable<RouterOutputs["folder"]["get"]>["childFolders"][number];

// Internal FileItem type used throughout the application
export interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  fileType?: string;
  size?: string;
  color?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  itemCount?: number;
  lastModified?: string;
  children?: FileItem[];
  readonly?: boolean;
  starred?: boolean;
}

// Handler types for external logic
export interface FileHandlers {
  onFileClick?: (file: FileItem) => void;
  onFolderClick: (folderName: string) => void;
  onDownload: (item: FileItem) => Promise<void>;
  onShare: (item: FileItem) => Promise<void>;
  onRename: (item: FileItem, newName: string, color?: string) => Promise<void>;
  onDelete: (item: FileItem) => Promise<void>;
  onMove: (draggedItemId: string, targetFolderId: string, draggedItemType: string) => Promise<void>;
  onStar?: (item: FileItem) => Promise<void>;
  onPreview?: (file: FileItem) => void;
  onRefresh?: () => void;
}

// Component props interfaces
export interface BaseFileComponentProps {
  item: FileItem;
  classId: string;
  currentFolderId?: string;
  readonly?: boolean;
  handlers: FileHandlers;
}

export interface GridFileComponentProps extends BaseFileComponentProps {
  getFileIcon: (fileType: string, size?: "sm" | "lg") => React.ReactNode;
  getFolderColor?: (folderId: string) => string;
}

export interface TableFileComponentProps extends BaseFileComponentProps {
  getFileIcon: (fileType: string, size?: "sm" | "lg") => React.ReactNode;
  getFolderColor: (folderId: string) => string;
  formatDate: (dateString: string) => string;
}

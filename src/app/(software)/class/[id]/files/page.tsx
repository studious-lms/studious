"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { PageLayout } from "@/components/ui/page-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { 
  Upload, 
  FolderPlus, 
  Search, 
  Download,
  File,
  FileText,
  Image,
  FileVideo,
  Grid3X3,
  List,
  Filter,
  Share,
  Trash2,
  ArrowUpDown,
  HardDrive,
  Music,
  Archive,
  FileSpreadsheet,
  Presentation,
  AlertCircle,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UploadFileModal, FilePreviewModal, RenameModal, CreateFolderModal } from "@/components/modals";
import { DraggableFileItem } from "@/components/DraggableFileItem";
import { DroppableFolderItem } from "@/components/DroppableFolderItem";
import { DraggableTableRow } from "@/components/DraggableTableRow";
import {
  trpc,
  FolderUploadFilesInput
} from "@/lib/trpc";
import { FileItem, FileHandlers, ApiFolder } from "@/lib/types/file";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { toast } from "sonner";
import { transformFileToFileItem, transformFolderToFileItem } from "@/lib/file/file";

export default function Files() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;
  const appState = useSelector((state: RootState) => state.app);
  const t = useTranslations('classFiles');
  
  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedItems] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"name" | "modified" | "size">("name");
  const [renameItem, setRenameItem] = useState<FileItem | null>(null);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  
  // API calls
  // Get root folder with its files and subfolders
  const { data: rootFolder, isLoading: customLoading, error: customError, refetch } = trpc.folder.getRootFolder.useQuery(
    { classId },
    { enabled: !!classId }
  );

  // Mutations
  const createFolderMutation = trpc.folder.create.useMutation({
    onSuccess: () => {
      toast.success(t('toasts.folderCreated'));
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });
  
  const deleteFolderMutation = trpc.folder.delete.useMutation({
    onSuccess: () => {
      toast.success(t('toasts.folderDeleted'));
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });
  
  const renameFolderMutation = trpc.folder.update.useMutation({
    onSuccess: () => {
      toast.success(t('toasts.folderRenamed'));
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });
  
  const moveFolderMutation = trpc.folder.move.useMutation({
    onSuccess: () => {
      toast.success(t('toasts.folderMoved'));
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });
  
  const uploadFilesMutation = trpc.folder.uploadFiles.useMutation({
    onSuccess: () => {
      toast.success(t('toasts.filesUploaded'));
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });
  
  const deleteFileMutation = trpc.file.delete.useMutation({
    onSuccess: () => {
      toast.success(t('toasts.fileDeleted'));
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });
  
  const renameFileMutation = trpc.file.rename.useMutation({
    onSuccess: () => {
      toast.success(t('toasts.fileRenamed'));
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });
  
  const moveFileMutation = trpc.file.move.useMutation({
    onSuccess: () => {
      toast.success(t('toasts.fileMoved'));
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });
  
  const getSignedUrlMutation = trpc.file.getSignedUrl.useMutation();
  
  // Check if user is teacher
  const isTeacher = appState.user.teacher;
  
  
  // Get current folder content
  const getCurrentFolderContent = (): FileItem[] => {
    // Root folder only
    const folders = rootFolder?.childFolders?.map((folder => transformFolderToFileItem(folder, isTeacher))) || [];
    const files = rootFolder?.files?.map((file) => transformFileToFileItem(file, isTeacher)) || [];
    return [...folders, ...files];
  };

  const currentItems = getCurrentFolderContent();
  
  const filteredItems = currentItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );


  // External handlers for all file/folder operations
  const fileHandlers: FileHandlers = {
    onFolderClick: (folderName: string) => {
      // Find the folder by name to get its ID
      const folder = currentItems.find(item => item.name === folderName && item.type === "folder");
      if (folder) {
        // Navigate to the folder page using Next.js routing
        router.push(`/class/${classId}/files/${folder.id}`);
      }
    },

    onDownload: async (item: FileItem) => {
      if (!isTeacher && ["modify", "delete", "move"].includes("download")) {
        toast.error(t('errors.teacherOnly'));
        return;
      }
      
      try {
        const result = await getSignedUrlMutation.mutateAsync({ fileId: item.id });
        window.open(result.url, '_blank');
        toast.success(t('toasts.downloadStarted'));
      } catch (error) {
        toast.error(t('errors.downloadFailed'));
        throw error;
      }
    },

    onShare: async (item: FileItem) => {
      try {
        const result = await getSignedUrlMutation.mutateAsync({ fileId: item.id });
        await navigator.clipboard.writeText(result.url);
        toast.success(t('toasts.shareCopied'));
      } catch (error) {
        toast.error(t('errors.shareFailed'));
        throw error;
      }
    },

    onRename: async (item: FileItem, newName: string, color?: string) => {
      if (!isTeacher) {
        toast.error(t('errors.teacherOnly'));
        return;
      }

      // If called with the same name and no color change, open the rename modal
      if (newName === item.name && (!color || color === item.color)) {
        setRenameItem(item);
        setIsRenameOpen(true);
        return;
      }

      try {
        if (item.type === "folder") {
          // For folders, we can change name and/or color
          await renameFolderMutation.mutateAsync({ 
            classId, 
            folderId: item.id, 
            name: newName,
            color: color || item.color
          });
        } else {
          // For files, only rename (no color)
          if (newName !== item.name) {
            await renameFileMutation.mutateAsync({ classId, fileId: item.id, newName });
          }
        }
      } catch (error) {
        throw error;
      }
    },

    onDelete: async (item: FileItem) => {
      if (!isTeacher) {
        toast.error(t('errors.teacherOnly'));
        return;
      }

      try {
        if (item.type === "folder") {
          await deleteFolderMutation.mutateAsync({ classId, folderId: item.id });
        } else {
          await deleteFileMutation.mutateAsync({ classId, fileId: item.id });
        }
      } catch (error) {
        throw error;
      }
    },

    onMove: async (draggedItemId: string, targetFolderId: string, draggedItemType: string) => {
      if (!isTeacher) {
        toast.error("Only teachers can move files.");
        return;
      }

      try {
        if (draggedItemType === "folder") {
          await moveFolderMutation.mutateAsync({
            classId,
            folderId: draggedItemId,
            targetParentFolderId: targetFolderId
          });
        } else {
          await moveFileMutation.mutateAsync({
            classId,
            fileId: draggedItemId,
            targetFolderId: targetFolderId
          });
        }
      } catch (error) {
        throw error;
      }
    },
    onRefresh: () => {
      refetch();
    }
  };

  const handleCreateFolder = async (folderData: { name: string; description?: string; color?: string }) => {
    try {
      await createFolderMutation.mutateAsync({
        classId,
        name: folderData.name,
        parentFolderId: undefined, // Root folder only
        color: folderData.color || "#3b82f6" // Default blue color
      });
    } catch (error) {
      // Error handling is done by the mutation hook
      throw error;
    }
  };

  const handleUploadFiles = (files: FolderUploadFilesInput['files']) => {
    // Files are already uploaded via direct upload in the modal
    // Just refresh the file list to show the new files
    refetch();
  };

  const handleModify = (item: FileItem, newName: string, color?: string) => {
    fileHandlers.onRename(item, newName, color);
  };

  const selectedCount = selectedItems.length;
  const isLoading = customLoading;
  const hasError = customError;

  return (
    <DndProvider backend={HTML5Backend}>
      <PageLayout>
        {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        
        {isTeacher && (
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCreateFolderModalOpen(true)}
              disabled={createFolderMutation.isPending}
            >
              {createFolderMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FolderPlus className="h-4 w-4 mr-2" />
              )}
              {t('actions.newFolder')}
            </Button>
            <UploadFileModal 
              currentFolder="root"
              classId={classId}
              folderId={rootFolder?.id || ''}
              onFilesUploaded={handleUploadFiles}
            >
              <Button 
                size="sm" 
                disabled={uploadFilesMutation.isPending || !rootFolder?.id || customLoading}
              >
                {uploadFilesMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {t('actions.upload')}
              </Button>
            </UploadFileModal>
          </div>
        )}
      </div>

        {/* Error Alert */}
        {hasError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t('errors.failedToLoad')}
            </AlertDescription>
          </Alert>
        )}

      {/* Breadcrumbs */}
      <div className="flex items-center space-x-1 mb-4 text-sm">
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 font-medium hover:bg-muted cursor-default"
              disabled
            >
              {t('breadcrumbs.classFiles')}
            </Button>
          </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          
          {selectedCount > 0 && (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{t('selected', { count: selectedCount })}</Badge>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                {t('actions.download')}
              </Button>
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                {t('actions.share')}
              </Button>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                {t('actions.delete')}
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                {t('actions.filter')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>{t('filters.fileType')}</DropdownMenuLabel>
              <DropdownMenuCheckboxItem>{t('filters.documents')}</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>{t('filters.images')}</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>{t('filters.videos')}</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>{t('filters.presentations')}</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                {t('actions.sort')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy("name")}>
                {t('sort.name')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("modified")}>
                {t('sort.lastModified')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("size")}>
                {t('sort.fileSize')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
        {isLoading ? (
          /* Loading State */
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-12 w-12 mx-auto mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-2/3 mx-auto" />
                </Card>
              ))}
            </div>
          </div>
        ) : filteredItems.length > 0 ? (
        viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {filteredItems.map((item) => (
              item.type === "folder" ? (
                <DroppableFolderItem
                  key={item.id}
                  item={item}
                  classId={classId}
                  readonly={item.readonly}
                  handlers={fileHandlers}
                />
              ) : (
                <DraggableFileItem
                  key={item.id}
                  item={item}
                  classId={classId}
                  readonly={item.readonly}
                  handlers={fileHandlers}
                />
              )
            ))}
          </div>
        ) : (
          /* List View */
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.name')}</TableHead>
                  <TableHead>{t('table.owner')}</TableHead>
                  <TableHead>{t('table.lastModified')}</TableHead>
                  <TableHead>{t('table.fileSize')}</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 {filteredItems.map((item) => (
                    <DraggableTableRow
                      key={item.id}
                      item={item}
                      classId={classId}
                      readonly={item.readonly}
                      handlers={fileHandlers}
                    />
                 ))}
              </TableBody>
            </Table>
          </Card>
        )
      ) : (
        /* Empty State */
        <div className="space-y-6">
          <EmptyState
            icon={HardDrive}
            title={searchQuery ? t('empty.searchTitle') : t('empty.title')}
            description={searchQuery 
              ? t('empty.searchDescription', { query: searchQuery })
              : t('empty.description')
            }
          />
          {isTeacher && (
            <div className="flex justify-center space-x-3">
              <UploadFileModal 
                currentFolder="root"
                classId={classId}
                folderId={rootFolder?.id || ''}
                onFilesUploaded={handleUploadFiles}
              >
                <Button disabled={uploadFilesMutation.isPending || !rootFolder?.id || customLoading}>
                  {uploadFilesMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {t('actions.uploadFiles')}
                </Button>
              </UploadFileModal>
              <Button 
                variant="outline"
                onClick={() => setCreateFolderModalOpen(true)}
                disabled={createFolderMutation.isPending}
              >
                {createFolderMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FolderPlus className="h-4 w-4 mr-2" />
                )}
                {t('actions.createFolder')}
              </Button>
            </div>
          )}
        </div>
      )}

        {/* Rename Modal */}
        <RenameModal
          item={renameItem}
          isOpen={isRenameOpen}
          onClose={() => setIsRenameOpen(false)}
          onRename={handleModify}
        />

        {/* Create Folder Modal */}
        <CreateFolderModal
          open={createFolderModalOpen}
          onOpenChange={setCreateFolderModalOpen}
          onFolderCreated={handleCreateFolder}
          isLoading={createFolderMutation.isPending}
        />
      </PageLayout>
    </DndProvider>
  );
}
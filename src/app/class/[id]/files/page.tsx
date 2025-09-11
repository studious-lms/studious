"use client";

import { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { PageLayout, PageHeader } from "@/components/ui/page-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Upload, 
  FolderPlus, 
  Search, 
  Download,
  MoreHorizontal,
  File,
  Folder,
  FileText,
  Image,
  FileVideo,
  Grid3X3,
  List,
  SortAsc,
  Filter,
  Share,
  Trash2,
  Edit,
  Copy,
  Star,
  Home,
  ChevronRight,
  ArrowUpDown,
  Calendar,
  User,
  HardDrive,
  Eye,
  Music,
  Archive,
  FileSpreadsheet,
  Presentation
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { UploadFileModal, FilePreviewModal, RenameModal } from "@/components/modals";
import { DraggableFileItem } from "@/components/DraggableFileItem";
import { DroppableFolderItem } from "@/components/DroppableFolderItem";
import { DroppableBreadcrumb } from "@/components/DroppableBreadcrumb";
import { DraggableTableRow } from "@/components/DraggableTableRow";

// Mock folder structure
const mockFileSystem = {
  "/": {
    id: "root",
    name: "Class Files",
    type: "folder" as const,
    children: [
      {
        id: "1",
        name: "Lecture Materials",
        type: "folder" as const,
        itemCount: 12,
        lastModified: "2024-01-15T10:30:00Z",
        children: [
          {
            id: "1-1",
            name: "Week 1 - Introduction.pptx",
            type: "file" as const,
            fileType: "pptx",
            size: "4.2 MB",
            uploadedBy: "Dr. Smith",
            uploadedAt: "2024-01-08T14:20:00Z"
          },
          {
            id: "1-2", 
            name: "Week 2 - Fundamentals.pptx",
            type: "file" as const,
            fileType: "pptx",
            size: "3.8 MB",
            uploadedBy: "Dr. Smith",
            uploadedAt: "2024-01-10T09:15:00Z"
          }
        ]
      },
      {
        id: "2",
        name: "Assignments",
        type: "folder" as const,
        itemCount: 8,
        lastModified: "2024-01-14T16:45:00Z",
        children: [
          {
            id: "2-1",
            name: "Assignment 1 - Template.docx",
            type: "file" as const,
            fileType: "docx",
            size: "125 KB",
            uploadedBy: "Dr. Smith",
            uploadedAt: "2024-01-05T11:30:00Z"
          }
        ]
      },
      {
        id: "3",
        name: "Lab Resources",
        type: "folder" as const,
        itemCount: 15,
        lastModified: "2024-01-12T13:22:00Z",
        children: [
          {
            id: "3-1",
            name: "Lab Setup Instructions.pdf",
            type: "file" as const,
            fileType: "pdf",
            size: "2.1 MB",
            uploadedBy: "Dr. Smith",
            uploadedAt: "2024-01-03T08:45:00Z"
          },
          {
            id: "3-2",
            name: "Safety Guidelines.pdf",
            type: "file" as const,
            fileType: "pdf",
            size: "1.8 MB",
            uploadedBy: "Dr. Smith",
            uploadedAt: "2024-01-03T08:50:00Z"
          },
          {
            id: "3-3",
            name: "Demo Video.mp4",
            type: "file" as const,
            fileType: "mp4",
            size: "45.2 MB",
            uploadedBy: "Dr. Smith",
            uploadedAt: "2024-01-10T15:30:00Z"
          }
        ]
      },
      {
        id: "4",
        name: "Student Submissions",
        type: "folder" as const,
        itemCount: 24,
        lastModified: "2024-01-14T18:30:00Z",
        children: []
      },
      {
        id: "5",
        name: "Course Syllabus.pdf",
        type: "file" as const,
        fileType: "pdf",
        size: "890 KB",
        uploadedBy: "Dr. Smith",
        uploadedAt: "2024-01-01T12:00:00Z"
      },
      {
        id: "6",
        name: "Reading List.xlsx",
        type: "file" as const,
        fileType: "xlsx",
        size: "245 KB",
        uploadedBy: "Dr. Smith",
        uploadedAt: "2024-01-02T14:30:00Z"
      }
    ]
  }
};

type FileItem = {
  id: string;
  name: string;
  type: "file" | "folder";
  fileType?: string;
  size?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  itemCount?: number;
  lastModified?: string;
  children?: FileItem[];
};

export default function Files() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPath, setCurrentPath] = useState("/");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "modified" | "size">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [renameItem, setRenameItem] = useState<FileItem | null>(null);
  const [isRenameOpen, setIsRenameOpen] = useState(false);

  // Get current folder content
  const getCurrentFolderContent = () => {
    if (currentPath === "/") {
      return mockFileSystem["/"].children || [];
    }
    
    // Navigate to subfolder (simplified for demo)
    const pathParts = currentPath.split("/").filter(Boolean);
    let current = mockFileSystem["/"];
    
    for (const part of pathParts) {
      const found = current.children?.find(item => item.name === part);
      if (found && found.type === "folder" && found.children) {
        current = { ...found, children: found.children };
      }
    }
    
    return current.children || [];
  };

  const currentItems = getCurrentFolderContent();
  
  const filteredItems = currentItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Generate breadcrumbs
  const getBreadcrumbs = () => {
    if (currentPath === "/") return [{ name: "Class Files", path: "/" }];
    
    const parts = currentPath.split("/").filter(Boolean);
    const breadcrumbs = [{ name: "Class Files", path: "/" }];
    
    let path = "";
    for (const part of parts) {
      path += `/${part}`;
      breadcrumbs.push({ name: part, path });
    }
    
    return breadcrumbs;
  };

  const getFileIcon = (fileType: string, size: "sm" | "lg" = "sm") => {
    const iconSize = size === "sm" ? "h-4 w-4" : "h-8 w-8";
    
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getFolderColor = (folderId: string) => {
    const colors = [
      "text-blue-500",
      "text-green-500", 
      "text-purple-500",
      "text-orange-500",
      "text-pink-500",
      "text-indigo-500",
      "text-teal-500",
      "text-red-500"
    ];
    const index = parseInt(folderId) % colors.length;
    return colors[index];
  };

  const handleFolderClick = (folderName: string) => {
    if (currentPath === "/") {
      setCurrentPath(`/${folderName}`);
    } else {
      setCurrentPath(`${currentPath}/${folderName}`);
    }
  };

  const handleBreadcrumbClick = (path: string) => {
    setCurrentPath(path);
  };

  const handleItemAction = (action: string, item: FileItem) => {
    switch (action) {
      case "download":
        toast({
          title: "Download started",
          description: `Downloading ${item.name}...`,
        });
        break;
      case "share":
        toast({
          title: "Share link created",
          description: `Share link for ${item.name} copied to clipboard.`,
        });
        break;
      case "rename":
        setRenameItem(item);
        setIsRenameOpen(true);
        break;
      case "delete":
        toast({
          title: "File deleted",
          description: `${item.name} has been moved to trash.`,
          variant: "destructive"
        });
        break;
    }
  };

  const handleFileClick = (file: FileItem) => {
    if (file.type === "file") {
      setPreviewFile(file);
      setIsPreviewOpen(true);
    }
  };

  const handleRename = (item: FileItem, newName: string) => {
    toast({
      title: "Item renamed",
      description: `${item.name} has been renamed to ${newName}.`,
    });
  };

  const handleUpload = () => {
    toast({
      title: "Upload started",
      description: "Files are being uploaded to the current folder.",
    });
  };

  const handleMoveItem = (itemId: string, targetPath: string) => {
    toast({
      title: "File moved",
      description: `File has been moved to ${targetPath === "/" ? "root" : targetPath.split("/").pop()}.`,
    });
  };

  const selectedCount = selectedItems.length;

  return (
    <DndProvider backend={HTML5Backend}>
      <PageLayout>
        {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Files</h1>
          <p className="text-muted-foreground">Manage class files and resources</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentPath("/new-folder")}>
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
          <UploadFileModal currentFolder={currentPath}>
            <Button size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </UploadFileModal>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center space-x-1 mb-4 text-sm">
        {getBreadcrumbs().map((crumb, index) => (
          <DroppableBreadcrumb
            key={crumb.path}
            crumb={crumb}
            index={index}
            totalCrumbs={getBreadcrumbs().length}
            onBreadcrumbClick={handleBreadcrumbClick}
            onMoveItem={handleMoveItem}
          />
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search in files"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          
          {selectedCount > 0 && (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{selectedCount} selected</Badge>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>File Type</DropdownMenuLabel>
              <DropdownMenuCheckboxItem>Documents</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Images</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Videos</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Presentations</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy("name")}>
                Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("modified")}>
                Last modified
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("size")}>
                File size
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
      {filteredItems.length > 0 ? (
        viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {filteredItems.map((item) => (
              item.type === "folder" ? (
                <DroppableFolderItem
                  key={item.id}
                  item={item}
                  getFolderColor={getFolderColor}
                  onFolderClick={handleFolderClick}
                  onItemAction={handleItemAction}
                  onMoveItem={handleMoveItem}
                />
              ) : (
                <DraggableFileItem
                  key={item.id}
                  item={item}
                  getFileIcon={getFileIcon}
                  getFolderColor={getFolderColor}
                  onFolderClick={handleFolderClick}
                  onItemAction={handleItemAction}
                  onFileClick={handleFileClick}
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
                  <TableHead>Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Last modified</TableHead>
                  <TableHead>File size</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 {filteredItems.map((item) => (
                    <DraggableTableRow
                      key={item.id}
                      item={item}
                      getFolderColor={getFolderColor}
                      getFileIcon={getFileIcon}
                      formatDate={formatDate}
                      onFolderClick={handleFolderClick}
                      onItemAction={handleItemAction}
                      onMoveItem={handleMoveItem}
                      onFileClick={handleFileClick}
                    />
                 ))}
              </TableBody>
            </Table>
          </Card>
        )
      ) : (
        /* Empty State */
        <Card className="text-center py-16">
          <CardContent>
            <div className="mx-auto w-48 h-48 mb-6 bg-muted rounded-lg flex items-center justify-center">
              <HardDrive className="h-16 w-16 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery ? "No files found" : "This folder is empty"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              {searchQuery 
                ? `No files match "${searchQuery}". Try a different search term.`
                : "Upload files or create folders to get started organizing your class materials."
              }
            </p>
            <div className="flex justify-center space-x-3">
              <UploadFileModal currentFolder={currentPath}>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
              </UploadFileModal>
              <Button variant="outline">
                <FolderPlus className="h-4 w-4 mr-2" />
                Create Folder
              </Button>
            </div>
          </CardContent>
          </Card>
        )}

        {/* File Preview Modal */}
        <FilePreviewModal
          file={previewFile}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          onAction={handleItemAction}
        />

        {/* Rename Modal */}
        <RenameModal
          item={renameItem}
          isOpen={isRenameOpen}
          onClose={() => setIsRenameOpen(false)}
          onRename={handleRename}
        />
      </PageLayout>
    </DndProvider>
  );
}
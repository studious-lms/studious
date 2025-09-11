import { useDrag } from "react-dnd";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Download,
  MoreHorizontal,
  Share,
  Edit,
  Trash2,
  Eye,
  Folder,
  GripVertical
} from "lucide-react";

interface FileItem {
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
}

interface DraggableFileItemProps {
  item: FileItem;
  getFileIcon: (fileType: string, size?: "sm" | "lg") => React.ReactNode;
  getFolderColor: (folderId: string) => string;
  onFolderClick: (folderName: string) => void;
  onItemAction: (action: string, item: FileItem) => void;
  onFileClick?: (file: FileItem) => void;
}

export function DraggableFileItem({ 
  item, 
  getFileIcon, 
  getFolderColor, 
  onFolderClick, 
  onItemAction,
  onFileClick 
}: DraggableFileItemProps) {
  const [{ isDragging }, drag] = useDrag({
    type: "file",
    item: { id: item.id, name: item.name, type: item.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div 
      ref={drag} 
      className={`group relative rounded-lg border border-transparent hover:border-border hover:shadow-sm transition-all duration-200 cursor-pointer bg-background ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
      onClick={() => {
        if (item.type === "folder") {
          onFolderClick(item.name);
        } else if (item.type === "file" && onFileClick) {
          onFileClick(item);
        }
      }}
    >
      <div className="p-3 flex flex-col items-center">
        {/* Drag Handle */}
        <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
        </div>

        {/* Icon and Star */}
        <div className="relative mb-2 flex justify-center">
          {item.type === "folder" ? (
            <div className="relative">
              <Folder className={`h-8 w-8 ${getFolderColor(item.id)} fill-current drop-shadow-sm`} />
            </div>
          ) : (
            <div className="relative">
              <div className="mb-2">
                {getFileIcon(item.fileType!, "lg")}
              </div>
            </div>
          )}
        </div>
        
        {/* File Name */}
        <div className="w-full text-center">
          <p className="text-xs font-medium text-foreground truncate leading-tight mb-1" title={item.name}>
            {item.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {item.type === "folder" 
              ? `${item.itemCount} items`
              : item.size
            }
          </p>
        </div>
      </div>

      {/* Actions Menu */}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 bg-background/80 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {item.type === "file" && (
              <>
                <DropdownMenuItem onClick={() => onItemAction("download", item)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem onClick={() => onItemAction("share", item)}>
              <Share className="mr-2 h-4 w-4" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onItemAction("rename", item)}>
              <Edit className="mr-2 h-4 w-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onItemAction("delete", item)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
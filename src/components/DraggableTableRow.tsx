import { useDrag, useDrop } from "react-dnd";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Share,
  Edit,
  Trash2,
  Folder,
  Download,
  Eye,
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

interface DraggableTableRowProps {
  item: FileItem;
  getFolderColor: (folderId: string) => string;
  getFileIcon: (fileType: string, size?: "sm" | "lg") => JSX.Element;
  formatDate: (dateString: string) => string;
  onFolderClick: (folderName: string) => void;
  onItemAction: (action: string, item: FileItem) => void;
  onMoveItem: (itemId: string, targetFolderId: string | null) => void;
  onFileClick?: (file: FileItem) => void;
}

export function DraggableTableRow({ 
  item, 
  getFolderColor,
  getFileIcon,
  formatDate,
  onFolderClick, 
  onItemAction,
  onMoveItem,
  onFileClick
}: DraggableTableRowProps) {
  const [{ isDragging }, drag] = useDrag({
    type: "file",
    item: { id: item.id, name: item.name, type: item.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "file",
    drop: (draggedItem: { id: string; name: string; type: string }) => {
      if (draggedItem.id !== item.id && item.type === "folder") {
        onMoveItem(draggedItem.id, item.id);
      }
    },
    canDrop: (draggedItem) => draggedItem.id !== item.id && item.type === "folder",
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <TableRow
      ref={(node) => drag(drop(node))}
      className={`group cursor-pointer transition-all ${
        isDragging ? 'opacity-50' : ''
      } ${
        isOver && canDrop 
          ? 'bg-primary/5' 
          : 'hover:bg-muted/50'
      }`}
      onClick={() => {
        if (item.type === "folder") {
          onFolderClick(item.name);
        } else if (item.type === "file" && onFileClick) {
          onFileClick(item);
        }
      }}
    >
      <TableCell>
        <div className="flex items-center space-x-3">
          {/* Drag Handle */}
          <div 
            ref={drag}
            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-move"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          
          {item.type === "folder" ? (
            <Folder className={`h-5 w-5 ${getFolderColor(item.id)} fill-current`} />
          ) : (
            getFileIcon(item.fileType!)
          )}
          <span className="font-medium">{item.name}</span>
          
          {/* Drop indicator for folders */}
          {isOver && canDrop && (
            <span className="text-primary font-medium text-sm ml-2">Drop here</span>
          )}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {item.uploadedBy || "—"}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {item.lastModified 
          ? formatDate(item.lastModified)
          : item.uploadedAt
          ? formatDate(item.uploadedAt)
          : "—"
        }
      </TableCell>
      <TableCell className="text-muted-foreground">
        {item.type === "folder" 
          ? `${item.itemCount} items`
          : item.size || "—"
        }
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="h-4 w-4" />
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
      </TableCell>
    </TableRow>
  );
}

import { useDrop, useDrag } from "react-dnd";
import { Button } from "@/components/ui/button";
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
  Star,
  Trash2,
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
  starred?: boolean;
  children?: FileItem[];
}

interface DroppableFolderItemProps {
  item: FileItem;
  getFolderColor: (folderId: string) => string;
  onFolderClick: (folderName: string) => void;
  onItemAction: (action: string, item: FileItem) => void;
  onMoveItem: (itemId: string, targetFolderId: string | null) => void;
}

export function DroppableFolderItem({ 
  item, 
  getFolderColor, 
  onFolderClick, 
  onItemAction,
  onMoveItem
}: DroppableFolderItemProps) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "file",
    drop: (draggedItem: { id: string; name: string; type: string }) => {
      if (draggedItem.id !== item.id) {
        onMoveItem(draggedItem.id, item.id);
      }
    },
    canDrop: (draggedItem) => draggedItem.id !== item.id, // Can't drop on itself
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const [{ isDragging }, drag] = useDrag({
    type: "file",
    item: { id: item.id, name: item.name, type: item.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div 
      ref={(node) => drag(drop(node))}
      className={`group relative rounded-lg border transition-all duration-200 cursor-pointer bg-background ${
        isDragging ? 'opacity-50' : ''
      } ${
        isOver && canDrop 
          ? 'border-primary bg-primary/5 shadow-md' 
          : 'border-transparent hover:border-border hover:shadow-sm'
      }`}
      onClick={() => onFolderClick(item.name)}
    >
      <div className="p-3 flex flex-col items-center">
        {/* Drag Handle */}
        <div 
          ref={drag}
          className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-move"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Drop indicator */}
        {isOver && canDrop && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/10 rounded-lg border-2 border-dashed border-primary">
            <span className="text-primary font-medium text-sm">Drop here</span>
          </div>
        )}

        {/* Icon and Star */}
        <div className="relative mb-2 flex justify-center">
          <div className="relative">
            <Folder className={`h-8 w-8 ${getFolderColor(item.id)} fill-current drop-shadow-sm`} />
            {item.starred && (
              <Star className="h-3 w-3 text-yellow-500 fill-current absolute -top-0.5 -right-0.5" />
            )}
          </div>
        </div>
        
        {/* Folder Name */}
        <div className="w-full text-center">
          <p className="text-xs font-medium text-foreground truncate leading-tight mb-1" title={item.name}>
            {item.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {item.itemCount} items
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
            <DropdownMenuItem onClick={() => onItemAction("share", item)}>
              <Share className="mr-2 h-4 w-4" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onItemAction("star", item)}>
              <Star className="mr-2 h-4 w-4" />
              {item.starred ? "Remove star" : "Add star"}
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
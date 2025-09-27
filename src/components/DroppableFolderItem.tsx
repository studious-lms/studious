import { useState, useRef } from "react";
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
  GripVertical,
} from "lucide-react";
import { GridFileComponentProps } from "@/lib/types/file";
import { MoveItemDropdown } from "@/components/MoveItemDropdown";

export function DroppableFolderItem({ 
  item, 
  classId,
  currentFolderId,
  readonly = false,
  handlers,
  getFolderColor
}: GridFileComponentProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleAction = async (action: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDropdownOpen(false);
    
    try {
      switch (action) {
        case "share":
          await handlers.onShare(item);
          break;
        case "rename":
          // This will trigger external rename modal/dialog
          await handlers.onRename(item, item.name, item.color);
          break;
        case "delete":
          await handlers.onDelete(item);
          break;
        case "star":
          if (handlers.onStar) {
            await handlers.onStar(item);
          }
          break;
      }
    } catch (error) {
      // Error handling is done by the handlers
      console.error(`Action ${action} failed:`, error);
    }
  };

  const handleMoveItem = async (draggedItemId: string, draggedItemType: string) => {
    if (draggedItemId !== item.id) {
      await handlers.onMove(draggedItemId, item.id, draggedItemType);
    }
  };

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "file",
    drop: (draggedItem: { id: string; name: string; type: string }) => {
      if (draggedItem.id !== item.id) {
        handleMoveItem(draggedItem.id, draggedItem.type);
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
    canDrag: !readonly && !item.readonly,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const ref = useRef<HTMLDivElement>(null);
  drag(drop(ref));

  return (
    <div 
      ref={ref}
      className={`group relative rounded-lg border transition-all duration-200 bg-background ${
        isDragging ? 'opacity-50' : ''
      } ${
        isOver && canDrop 
          ? 'border-primary bg-primary/5 shadow-md' 
          : 'border-transparent hover:border-border hover:shadow-sm'
      }`}
      onDoubleClick={() => handlers.onFolderClick(item.name)}
    >
      <div className="p-3 flex flex-col items-center">
        {/* Drag Handle */}
        {!readonly && !item.readonly && (
          <div 
            ref={drag as unknown as React.Ref<HTMLDivElement>}
            className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-move"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        )}

        {/* Drop indicator */}
        {isOver && canDrop && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/10 rounded-lg border-2 border-dashed border-primary">
            <span className="text-primary font-medium text-sm">Drop here</span>
          </div>
        )}

        {/* Icon and Star */}
        <div className="relative mb-2 flex justify-center">
          <div className="relative">
            <Folder 
              className="h-8 w-8 fill-current drop-shadow-sm" 
              style={{ color: item.color || (getFolderColor ? getFolderColor(item.id) : "#3b82f6") }} 
            />
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
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 bg-background/80 backdrop-blur-sm" 
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={(e) => handleAction("share", e)}>
              <Share className="mr-2 h-4 w-4" />
              Share
            </DropdownMenuItem>
            {!readonly && !item.readonly && (
              <>
                <DropdownMenuItem onClick={(e) => handleAction("rename", e)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modify
                </DropdownMenuItem>
                <MoveItemDropdown
                  itemId={item.id}
                  itemName={item.name}
                  itemType={item.type}
                  classId={classId}
                  currentFolderId={currentFolderId}
                  onSuccess={() => handlers.onRefresh?.()}
                  onOpenChange={(open) => {
                    if (open) {
                      setDropdownOpen(false);
                    }
                  }}
                />
                {handlers.onStar && (
                  <DropdownMenuItem onClick={(e) => handleAction("star", e)}>
                    <Star className="mr-2 h-4 w-4" />
                    {item.starred ? "Remove star" : "Add star"}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={(e) => handleAction("delete", e)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
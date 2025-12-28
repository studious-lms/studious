import { useDrag, useDrop } from "react-dnd";
import { useRef, useState } from "react";
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
  GripVertical,
} from "lucide-react";
import { BaseFileComponentProps } from "@/lib/types/file";
import { MoveItemDropdown } from "@/components/MoveItemDropdown";
import { formatDate, getFileIcon, getFilePreviewHandlers } from "@/lib/file/file";
import { FilePreviewModal } from "@/components/modals/FilePreviewModal";

export function DraggableTableRow({ 
  item, 
  classId,
  currentFolderId,
  readonly = false,
  handlers,
}: BaseFileComponentProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const handleAction = async (action: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDropdownOpen(false);
    
    try {
      switch (action) {
        case "download":
          await handlers.onDownload(item);
          break;
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
      }
    } catch (error) {
      // Error handling is done by the handlers
      console.error(`Action ${action} failed:`, error);
    }
  };

  const handleMoveItem = async (draggedItemId: string, draggedItemType: string) => {
    if (draggedItemId !== item.id && item.type === "folder") {
      await handlers.onMove(draggedItemId, item.id, draggedItemType);
    }
  };

  const [{ isDragging }, drag] = useDrag({
    type: "file",
    item: { id: item.id, name: item.name, type: item.type },
    canDrag: !readonly && !item.readonly,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "file",
    drop: (draggedItem: { id: string; name: string; type: string }) => {
      if (draggedItem.id !== item.id && item.type === "folder") {
        handleMoveItem(draggedItem.id, draggedItem.type);
      }
    },
    canDrop: (draggedItem) => draggedItem.id !== item.id && item.type === "folder",
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const ref = useRef<HTMLTableRowElement>(null);
  drag(drop(ref));

  return (
    <TableRow
      ref={ref}
      className={`group cursor-pointer transition-all ${
        isDragging ? 'opacity-50' : ''
      } ${
        isOver && canDrop 
          ? 'bg-primary/5' 
          : 'hover:bg-muted/50'
      }`}
      onDoubleClick={() => {
        if (item.type === "folder") {
          handlers.onFolderClick(item.name);
        } else if (item.type === "file") {
          setPreviewOpen(true);
        }
      }}
    >
      <TableCell>
        <div className="flex items-center space-x-3">
          {/* Drag Handle */}
          {!readonly && !item.readonly && (
            <div 
              ref={drag as unknown as React.Ref<HTMLDivElement>}
              className="opacity-0 group-hover:opacity-100 transition-opacity cursor-move"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            {item.type === "folder" ? (
              <Folder 
                className="h-5 w-5 fill-current" 
                style={{ color: item.color }} 
              />
            ) : (
              getFileIcon(item.fileType!)
            )}
            <span className="font-medium flex items-center space-x-1">
              {item.name}
            </span>
          </div>
          
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
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {item.type === "file" && (
              <>
                <DropdownMenuItem onClick={(e) => handleAction("download", e)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => setPreviewOpen(true)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem onClick={(e) => handleAction("share", e)}>
              <Share className="mr-2 h-4 w-4" />
              Share
            </DropdownMenuItem>
            {!readonly && !item.readonly && (
              <>
                <DropdownMenuItem onClick={(e) => handleAction("rename", e)}>
                  <Edit className="mr-2 h-4 w-4" />
                  {item.type === "folder" ? "Modify" : "Rename"}
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
        {previewOpen && (
          <FilePreviewModal
            file={item}
            isOpen={previewOpen}
            onClose={() => setPreviewOpen(false)}
            onAction={getFilePreviewHandlers}
          />
        )}
      </TableCell>
    </TableRow>
  );
}
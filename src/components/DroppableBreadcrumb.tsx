import { useDrop } from "react-dnd";
import { Home, ChevronRight } from "lucide-react";

interface DroppableBreadcrumbProps {
  crumb: { name: string; path: string };
  index: number;
  totalCrumbs: number;
  onBreadcrumbClick: (path: string) => void;
  onMoveItem: (itemId: string, targetPath: string) => void;
}

export function DroppableBreadcrumb({ 
  crumb, 
  index, 
  totalCrumbs, 
  onBreadcrumbClick, 
  onMoveItem 
}: DroppableBreadcrumbProps) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "file",
    drop: (draggedItem: { id: string; name: string; type: string }) => {
      onMoveItem(draggedItem.id, crumb.path);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div ref={drop as unknown as React.Ref<HTMLDivElement>} className="flex items-center space-x-1">
      {index === 0 && <Home className="h-4 w-4" />}
      <button
        onClick={() => onBreadcrumbClick(crumb.path)}
        className={`text-primary hover:underline transition-all duration-200 px-2 py-1 rounded ${
          isOver && canDrop 
            ? 'bg-primary/10 border border-primary/20' 
            : ''
        }`}
      >
        {crumb.name}
        {isOver && canDrop && (
          <span className="ml-2 text-xs text-primary font-medium">Drop here</span>
        )}
      </button>
      {index < totalCrumbs - 1 && (
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      )}
    </div>
  );
}
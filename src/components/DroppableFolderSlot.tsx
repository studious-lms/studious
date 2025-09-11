import { useDrop } from "react-dnd";

interface DroppableFolderSlotProps {
  children: React.ReactNode;
  index: number;
  onMoveFolder: (folderId: string, targetIndex: number) => void;
}

export function DroppableFolderSlot({ 
  children, 
  index, 
  onMoveFolder 
}: DroppableFolderSlotProps) {
  const [{ isOver }, drop] = useDrop({
    accept: "folder",
    drop: (item: { id: string }, monitor) => {
      if (monitor.didDrop()) return; // Already handled by child
      onMoveFolder(item.id, index);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  return (
    <div ref={drop} className="relative">
      {isOver && (
        <div className="absolute -top-1 left-0 right-0 h-0.5 bg-primary rounded-full z-10" />
      )}
      {children}
    </div>
  );
}
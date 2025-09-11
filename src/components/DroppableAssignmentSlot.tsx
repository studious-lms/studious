import { useDrop } from "react-dnd";

interface DroppableAssignmentSlotProps {
  children: React.ReactNode;
  index: number;
  folderId: string | null;
  onMoveAssignment: (assignmentId: string, targetFolderId: string | null, targetIndex?: number) => void;
}

export function DroppableAssignmentSlot({ 
  children, 
  index, 
  folderId, 
  onMoveAssignment 
}: DroppableAssignmentSlotProps) {
  const [{ isOver }, drop] = useDrop({
    accept: "assignment",
    drop: (item: { id: string }, monitor) => {
      if (monitor.didDrop()) return; // Already handled by child
      onMoveAssignment(item.id, folderId, index);
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
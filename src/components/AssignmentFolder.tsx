import { useDrop, useDrag } from "react-dnd";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Folder, FolderOpen } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DraggableAssignment } from "./DraggableAssignment";
import { DroppableAssignmentSlot } from "./DroppableAssignmentSlot";

interface Assignment {
  id: string;
  title: string;
  description: string;
  type: string;
  dueDate: string;
  dueTime: string;
  status: string;
  submissions: number;
  totalStudents: number;
  points: number;
  hasAttachments: boolean;
}

interface AssignmentFolderProps {
  folder: {
    id: string;
    title: string;
    color: string;
    assignments: Assignment[];
  };
  classId: string;
  isOpen: boolean;
  onToggle: () => void;
  onMoveAssignment: (assignmentId: string, targetFolderId: string | null, targetIndex?: number) => void;
}

export function AssignmentFolder({ 
  folder, 
  classId, 
  isOpen, 
  onToggle, 
  onMoveAssignment 
}: AssignmentFolderProps) {
  const [{ isOver }, drop] = useDrop({
    accept: "assignment",
    drop: (item: { id: string }, monitor) => {
      if (monitor.didDrop()) return; // Already handled by child
      onMoveAssignment(item.id, folder.id);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const [{ isDragging }, drag] = useDrag({
    type: "folder",
    item: { id: folder.id, type: "folder" },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const getDotColor = (color: string) => {
    const colors = {
      blue: "bg-blue-500",
      green: "bg-green-500", 
      gray: "bg-gray-500",
      purple: "bg-purple-500",
    };
    return colors[color as keyof typeof colors] || colors.purple;
  };

  return (
    <div ref={(node) => drag(drop(node))} className={`transition-opacity ${isDragging ? 'opacity-50' : 'opacity-100'}`}>
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <Card className={`transition-all duration-200 bg-white dark:bg-card cursor-move ${isOver ? 'ring-2 ring-primary shadow-lg' : ''}`}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${getDotColor(folder.color)}`} />
                  <CardTitle className="text-sm font-bold">
                    {folder.title}
                  </CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    {folder.assignments.length} assignment{folder.assignments.length !== 1 ? 's' : ''}
                  </Badge>
                  {isOver && (
                    <Badge variant="outline" className="bg-primary/10 text-primary">
                      Drop here
                    </Badge>
                  )}
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 px-4 pb-3">
              <div className="space-y-2">
                {folder.assignments.map((assignment, index) => (
                  <DroppableAssignmentSlot
                    key={assignment.id}
                    index={index}
                    folderId={folder.id}
                    onMoveAssignment={onMoveAssignment}
                  >
                    <DraggableAssignment
                      assignment={assignment}
                      classId={classId}
                    />
                  </DroppableAssignmentSlot>
                ))}
                {folder.assignments.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Empty folder - drag assignments here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
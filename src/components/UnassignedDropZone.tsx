import { useDrop } from "react-dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Folder, FolderOpen } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DraggableAssignment } from "./DraggableAssignment";

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

interface UnassignedDropZoneProps {
  assignments: Assignment[];
  classId: string;
  isOpen: boolean;
  onToggle: () => void;
  onMoveAssignment: (assignmentId: string, targetFolderId: string | null) => void;
}

export function UnassignedDropZone({ 
  assignments, 
  classId, 
  isOpen, 
  onToggle, 
  onMoveAssignment 
}: UnassignedDropZoneProps) {
  const [{ isOver }, drop] = useDrop({
    accept: "assignment",
    drop: (item: { id: string }) => {
      onMoveAssignment(item.id, null); // null indicates unassigned
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div ref={drop as unknown as React.Ref<HTMLDivElement>}>
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <Card className={`transition-all duration-200 bg-card ${isOver ? 'ring-2 ring-primary shadow-lg' : ''}`}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                  <CardTitle className="text-sm font-bold">
                    Unassigned
                  </CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    {assignments.length} assignment{assignments.length !== 1 ? 's' : ''}
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
                {assignments.map((assignment) => (
                  <DraggableAssignment
                    key={assignment.id}
                    assignment={assignment}
                    classId={classId}
                  />
                ))}
                {assignments.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No unassigned assignments - drag assignments here to unorganize them</p>
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
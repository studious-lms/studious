import { useDispatch } from "react-redux";
import { addAlert } from "@/store/appSlice";
import { AlertLevel } from "@/lib/alertLevel";
import { trpc } from "@/utils/trpc";
import Button from "@/components/ui/Button";
import { HiPaperClip, HiX, HiExternalLink, HiDocumentText, HiAcademicCap } from "react-icons/hi";
import { assignmentTypes, formatAssignmentType, getAssignmentIcon } from "@/lib/assignment";
import IconFrame from "@/components/ui/IconFrame";
import { useRouter } from "next/navigation";
import { RouterOutputs } from "@/utils/trpc";
import { useState } from "react";
import Empty from "../ui/Empty";
import { useNavigation, ROUTES } from "@/lib/navigation";

type AttachedAssignment = RouterOutputs["event"]["get"]["event"]["assignmentsAttached"][number];

interface AttachedAssignmentsProps {
  eventId: string;
  assignments: AttachedAssignment[];
  classId: string;
  onAssignmentDetached?: () => void;
}

export default function AttachedAssignments({ 
  eventId, 
  assignments, 
  classId, 
  onAssignmentDetached 
}: AttachedAssignmentsProps) {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [_assignments, _setAssignments] = useState<AttachedAssignment[]>(assignments);

  const detachAssignment = trpc.event.detachAssignment.useMutation({
    onSuccess: () => {
      dispatch(addAlert({
        level: AlertLevel.SUCCESS,
        remark: "Assignment detached successfully",
      }));
      onAssignmentDetached?.();
    },
    onError: (error) => {
      dispatch(addAlert({
        level: AlertLevel.ERROR,
        remark: error.message || "Failed to detach assignment",
      }));
    }
  });

  const handleDetachAssignment = (assignmentId: string) => {
    _setAssignments(_assignments.filter(assignment => assignment.id !== assignmentId));

    detachAssignment.mutate({
      eventId,
      assignmentId,
    });
  };

  const handleViewAssignment = (assignmentId: string) => {
    navigation.push(ROUTES.ASSIGNMENT(classId, assignmentId));
  };

  if (!_assignments || _assignments.length === 0) {
    return (
      <Empty
        icon={HiPaperClip}
        title="No assignments attached"
        description="This event doesn't have any assignments attached to it. Click the 'Attach Assignment' button above to add one."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <HiDocumentText className="w-5 h-5 text-primary-500" />
        <span className="text-sm font-medium text-foreground-secondary">
          {_assignments.length} assignment{_assignments.length !== 1 ? 's' : ''} attached
        </span>
      </div>
      
      <div className="space-y-3">
        {_assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="group relative bg-background border border-border rounded-lg p-4 hover:border-primary-300 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <IconFrame className="p-2 size-8 bg-primary-50 text-primary-600 rounded-lg">
                    {getAssignmentIcon(assignment.type as "HOMEWORK" | "QUIZ" | "TEST" | "PROJECT" | "ESSAY" | "DISCUSSION" | "PRESENTATION" | "LAB" | "OTHER")}
                  </IconFrame>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-foreground text-sm truncate">
                      {assignment.title}
                    </h4>
                    <Button.SM
                      onClick={() => handleViewAssignment(assignment.id)}
                      className="p-1 text-foreground-muted hover:text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <HiExternalLink className="w-3 h-3" />
                    </Button.SM>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 text-xs text-foreground-muted mb-2">
                    {assignment.section?.name && (
                      <span className="bg-background-muted px-2 py-1 rounded-full">
                        {assignment.section.name}
                      </span>
                    )}
                    <span className="bg-primary-50 text-primary-700 px-2 py-1 rounded-full">
                      {formatAssignmentType(assignment.type)}
                    </span>
                    {assignment.graded && (
                      <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full">
                        {assignment.maxGrade} points
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-foreground-muted">
                    <div className="flex items-center space-x-1">
                      <HiAcademicCap className="w-3 h-3" />
                      <span>{assignment.teacher.username}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <HiDocumentText className="w-3 h-3" />
                      <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                    </div>
                    {assignment.attachments.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <HiPaperClip className="w-3 h-3" />
                        <span>{assignment.attachments.length} file{assignment.attachments.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <Button.SM
                onClick={() => handleDetachAssignment(assignment.id)}
                disabled={detachAssignment.isPending}
                className="p-2 text-foreground-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <HiX className="w-4 h-4" />
              </Button.SM>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
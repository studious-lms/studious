"use client";

import { useState } from "react";
import { format } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar,
  Clock, 
  MapPin, 
  FileText,
  School,
  User,
  Edit,
  Trash2,
  X,
  Plus,
  ExternalLink,
  Loader2
} from "lucide-react";
import { trpc, type RouterOutputs } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { getStudentAssignmentStatus, getStatusColor } from "@/lib/assignment/getStudentAssignmentStatus";
import { EmptyState } from "@/components/ui/empty-state";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { AttachAssignmentsToEventModal } from "./AttachAssignmentsToEventModal";

type Event = RouterOutputs["event"]["get"]['event'];

interface EventPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event | null;
  onEdit?: (event: Event) => void;
  onDelete?: (event: Event) => void;
  showActions?: boolean; // Whether to show edit/delete buttons
  onRefresh?: () => void; // Callback to refresh event data
}

export function EventPreviewModal({
  open,
  onOpenChange,
  event,
  onEdit,
  onDelete,
  showActions = false,
  onRefresh
}: EventPreviewModalProps) {
  const router = useRouter();
  const appState = useSelector((state: RootState) => state.app);
  const [attachModalOpen, setAttachModalOpen] = useState(false);
  const [detachingAssignmentId, setDetachingAssignmentId] = useState<string | null>(null);

  const { data: classData, isLoading: isClassLoading } = trpc.class.get.useQuery({ classId: event?.classId as string }, {
    enabled: !!event?.classId,
  });

  const utils = trpc.useUtils();

  // Detach event mutation
  const detachEventMutation = trpc.assignment.detachEvent.useMutation({
    onSuccess: () => {
      toast.success("Assignment detached from event");
      setDetachingAssignmentId(null);
      onRefresh?.();
      utils.event.get.invalidate({ id: event?.id });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to detach assignment");
      setDetachingAssignmentId(null);
    },
  });

  const isTeacherInClass = classData?.class?.teachers.some(teacher => teacher.id === appState.user.id);

  const handleDetachAssignment = (assignmentId: string, classId: string) => {
    setDetachingAssignmentId(assignmentId);
    detachEventMutation.mutate({ assignmentId, classId });
  };

  if (!event) return null;

  const startDate = new Date(event.startTime);
  const endDate = new Date(event.endTime);
  const isMultiDay = format(startDate, 'yyyy-MM-dd') !== format(endDate, 'yyyy-MM-dd');
  const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60)); // Duration in minutes
    
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full border-2"
              style={{ 
                backgroundColor: 'transparent',
                borderColor: event.color || "#3B82F6"
              }}
            />
            Event Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Event Title */}
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {event.name}
            </h3>
            {event.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <MapPin className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Date and Time */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {format(startDate, 'EEEE, MMMM d, yyyy')}
                </span>
                {isMultiDay && (
                  <span className="text-xs text-muted-foreground">
                    to {format(endDate, 'EEEE, MMMM d, yyyy')}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {formatDuration(duration)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Event Type */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              {event.class ? (
                <>
                  <School className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="default" className="text-xs">
                    Class Event
                  </Badge>
                  {event.class && (
                    <span className="text-sm text-muted-foreground">
                      {event.class.name} • {event.class.section}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <User className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="secondary" className="text-xs">
                    Personal Event
                  </Badge>
                </>
              )}
            </div>
          </div>

          {/* Remarks */}
          {event.remarks && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Notes</span>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap pl-6">
                  {event.remarks}
                </p>
              </div>
            </>
          )}

          {/* Assignments Section */}
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Linked Assignments</span>
                {event.assignmentsAttached && event.assignmentsAttached.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {event.assignmentsAttached.length}
                  </Badge>
                )}
              </div>
              {isTeacherInClass && event.classId && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setAttachModalOpen(true)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Attach
                </Button>
              )}
            </div>
            
            {event.assignmentsAttached && event.assignmentsAttached.length > 0 ? (
              <div className="space-y-2">
                {event.assignmentsAttached.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="group flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span 
                          className="text-sm font-medium hover:underline cursor-pointer truncate"
                          onClick={() => router.push(`/class/${assignment.classId}/assignment/${assignment.id}`)}
                        >
                          {assignment.title}
                        </span>
                        {!isTeacherInClass && !isClassLoading && (
                          <>
                            {getStudentAssignmentStatus(assignment).map((status) => (
                              <Badge key={status} className={`${getStatusColor(status)} text-xs`}>
                                {status}
                              </Badge>
                            ))}
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Due {format(new Date(assignment.dueDate), 'MMM d, yyyy \'at\' h:mm a')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => router.push(`/class/${assignment.classId}/assignment/${assignment.id}`)}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                      {isTeacherInClass && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                          onClick={() => handleDetachAssignment(assignment.id, assignment.classId)}
                          disabled={detachingAssignmentId === assignment.id}
                        >
                          {detachingAssignmentId === assignment.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <X className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={FileText}
                title="No assignments linked"
                description="Link assignments to this event to show them here"
                className="py-6"
              />
            )}
          </div>
        

          {/* Actions */}
          {showActions && (onEdit || onDelete) && (
            <>
              <Separator />
              <div className="flex justify-end gap-2">
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onEdit(event);
                      onOpenChange(false);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      onDelete(event);
                      onOpenChange(false);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>

      {/* Attach Assignments Modal */}
      {event.classId && (
        <AttachAssignmentsToEventModal
          open={attachModalOpen}
          onOpenChange={setAttachModalOpen}
          eventId={event.id}
          classId={event.classId}
          onAttached={() => {
            onRefresh?.();
            utils.event.get.invalidate({ id: event.id });
          }}
        />
      )}
    </Dialog>
  );
}

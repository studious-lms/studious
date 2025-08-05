import { useState } from "react";
import { useDispatch } from "react-redux";
import { addAlert, closeModal } from "@/store/appSlice";
import { AlertLevel } from "@/lib/alertLevel";
import { trpc } from "@/utils/trpc";
import Button from "@/components/ui/Button";
import { HiPaperClip, HiSearch, HiX, HiDocumentText, HiAcademicCap } from "react-icons/hi";
import { assignmentTypes, formatAssignmentType, getAssignmentIcon } from "@/lib/assignment";
import IconFrame from "@/components/ui/IconFrame";
import Input from "@/components/ui/Input";
import Skeleton from "@/components/ui/Skeleton";

interface AttachAssignmentToEventProps {
  eventId: string;
  onAssignmentAttached?: () => void;
}

export default function AttachAssignmentToEvent({ eventId, onAssignmentAttached }: AttachAssignmentToEventProps) {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([]);

  const { data: availableAssignments, isLoading } = trpc.event.getAvailableAssignments.useQuery({
    eventId
  });

  const attachAssignments = trpc.event.attachAssignment.useMutation({
    onSuccess: (data) => {
      console.log('Assignment attached successfully:', data);
      dispatch(addAlert({
        level: AlertLevel.SUCCESS,
        remark: 'Assignments attached successfully'
      }));
      console.log('Calling onAssignmentAttached callback');
      onAssignmentAttached?.();
      dispatch(closeModal());
    },
    onError: (error) => {
      console.log('Assignment attach error:', error);
      dispatch(addAlert({
        level: AlertLevel.ERROR,
        remark: error.message || 'Failed to attach assignments'
      }));
    }
  });

  const filteredAssignments = availableAssignments?.assignments.filter(assignment =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.teacher.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.type.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleToggleAssignment = (assignmentId: string) => {
    setSelectedAssignments(prev => 
      prev.includes(assignmentId)
        ? prev.filter(id => id !== assignmentId)
        : [...prev, assignmentId]
    );
  };

  const handleAttachAssignments = () => {
    if (selectedAssignments.length === 0) {
      dispatch(addAlert({
        level: AlertLevel.ERROR,
        remark: 'Please select at least one assignment'
      }));
      return;
    }
    for (const assignmentId of selectedAssignments) {
      attachAssignments.mutate({
        eventId,
        assignmentId
      });
    }
  };

  const handleRemoveSelection = (assignmentId: string) => {
    setSelectedAssignments(prev => prev.filter(id => id !== assignmentId));
  };

  return (
    <div className="w-[40rem] max-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <IconFrame>
            <HiPaperClip className="w-5 h-5" />
          </IconFrame>
          <div>
            <h2 className="text-xl font-bold text-foreground">Attach Assignments</h2>
            <p className="text-sm text-foreground-muted">
              Select assignments to attach to this event
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground-muted" />
        <Input.Text
          type="text"
          placeholder="Search assignments by title, teacher, or type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3"
        />
      </div>

      {/* Selected Assignments */}
      {selectedAssignments.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Selected ({selectedAssignments.length})
          </h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {selectedAssignments.map(assignmentId => {
              const assignment = availableAssignments?.assignments.find(a => a.id === assignmentId);
              if (!assignment) return null;
              
              return (
                <div key={assignmentId} className="flex items-center justify-between bg-primary-50 border border-primary-200 rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    <IconFrame className="p-1 size-6 bg-primary-100 text-primary-600 rounded">
                      {getAssignmentIcon(assignment.type as "HOMEWORK" | "QUIZ" | "TEST" | "PROJECT" | "ESSAY" | "DISCUSSION" | "PRESENTATION" | "LAB" | "OTHER")}
                    </IconFrame>
                    <div>
                      <p className="text-sm font-medium text-foreground">{assignment.title}</p>
                      <p className="text-xs text-foreground-muted">{assignment.teacher.username}</p>
                    </div>
                  </div>
                  <Button.SM
                    onClick={() => handleRemoveSelection(assignmentId)}
                    className="p-1 text-foreground-muted hover:text-red-500"
                  >
                    <HiX className="w-4 h-4" />
                  </Button.SM>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Assignments */}
      <div className="flex-1 overflow-hidden">
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Available Assignments
        </h3>
        
        {isLoading ? (
          <AttachAssignmentToEventSkeleton />
        ) : filteredAssignments.length === 0 ? (
          <div className="text-center py-8">
            <HiDocumentText className="w-12 h-12 text-foreground-muted mx-auto mb-3" />
            <p className="text-foreground-muted">
              {searchTerm ? 'No assignments found matching your search.' : 'No available assignments to attach.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredAssignments.map((assignment) => (
              <div
                key={assignment.id}
                onClick={() => handleToggleAssignment(assignment.id)}
                className={`cursor-pointer border rounded-lg p-3 transition-all duration-200 ${
                  selectedAssignments.includes(assignment.id)
                    ? 'bg-primary-50 border-primary-300 shadow-sm'
                    : 'bg-background border-border hover:border-primary-200 hover:bg-background-muted'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <IconFrame className={`p-2 size-8 rounded-lg ${
                      selectedAssignments.includes(assignment.id)
                        ? 'bg-primary-100 text-primary-600'
                        : 'bg-background-muted text-foreground-muted'
                    }`}>
                      {getAssignmentIcon(assignment.type as "HOMEWORK" | "QUIZ" | "TEST" | "PROJECT" | "ESSAY" | "DISCUSSION" | "PRESENTATION" | "LAB" | "OTHER")}
                    </IconFrame>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-foreground text-sm truncate">
                        {assignment.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          selectedAssignments.includes(assignment.id)
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-background-muted text-foreground-muted'
                        }`}>
                          {formatAssignmentType(assignment.type)}
                        </span>
                        {assignment.graded && (
                          <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                            {assignment.maxGrade} pts
                          </span>
                        )}
                      </div>
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
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border">
        <Button.Light
          onClick={() => dispatch(closeModal())}
          isLoading={attachAssignments.isPending}
        >
          Cancel
        </Button.Light>
        <Button.Primary
          onClick={handleAttachAssignments}
          isLoading={attachAssignments.isPending}
          disabled={selectedAssignments.length === 0}
          className="flex items-center space-x-2"
        >
          <HiPaperClip className="w-4 h-4" />
          <span>
            {attachAssignments.isPending ? 'Attaching...' : `Attach ${selectedAssignments.length} Assignment${selectedAssignments.length !== 1 ? 's' : ''}`}
          </span>
        </Button.Primary>
      </div>
    </div>
  );
} 

// Skeleton component for assignment items
const AssignmentItemSkeleton = () => (
  <div className="border rounded-lg p-3">
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0">
        <Skeleton variant="circular" width={32} height={32} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <Skeleton variant="text" width="60%" height="1rem" />
          <div className="flex items-center space-x-2">
            <Skeleton variant="text" width="4rem" height="1.25rem" />
            <Skeleton variant="text" width="3rem" height="1.25rem" />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Skeleton variant="circular" width={12} height={12} />
            <Skeleton variant="text" width="4rem" height="0.75rem" />
          </div>
          <div className="flex items-center space-x-1">
            <Skeleton variant="circular" width={12} height={12} />
            <Skeleton variant="text" width="6rem" height="0.75rem" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Skeleton component for the entire modal
const AttachAssignmentToEventSkeleton = () => (
  <div className="w-[40rem] max-h-[80vh] flex flex-col">
    {/* Header skeleton */}
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
      <div className="flex items-center space-x-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div>
          <Skeleton variant="text" width="8rem" height="1.5rem" className="mb-1" />
          <Skeleton variant="text" width="12rem" height="1rem" />
        </div>
      </div>
    </div>

    {/* Search skeleton */}
    <div className="relative mb-6">
      <Skeleton variant="rectangular" width="100%" height="3rem" />
    </div>

    {/* Available Assignments skeleton */}
    <div className="flex-1 overflow-hidden">
      <Skeleton variant="text" width="6rem" height="1rem" className="mb-3" />
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {Array.from({ length: 5 }).map((_, index) => (
          <AssignmentItemSkeleton key={index} />
        ))}
      </div>
    </div>

    {/* Actions skeleton */}
    <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border">
      <Skeleton variant="rectangular" width="5rem" height="2.5rem" />
      <Skeleton variant="rectangular" width="8rem" height="2.5rem" />
    </div>
  </div>
); 
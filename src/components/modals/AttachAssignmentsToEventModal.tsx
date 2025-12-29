"use client";

import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar, Search, Link as LinkIcon, Loader2, FileText, SearchX } from "lucide-react";
import { toast } from "sonner";
import { trpc, type RouterOutputs } from "@/lib/trpc";
import { EmptyState } from "@/components/ui/empty-state";

type Assignment = RouterOutputs["class"]["get"]["class"]["assignments"][number];

interface AttachAssignmentsToEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  classId: string;
  onAttached?: () => void;
}

export function AttachAssignmentsToEventModal({
  open,
  onOpenChange,
  eventId,
  classId,
  onAttached,
}: AttachAssignmentsToEventModalProps) {
  const [selectedAssignmentIds, setSelectedAssignmentIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch class data to get assignments
  const { data: classData, isLoading: isLoadingClass } = trpc.class.get.useQuery(
    { classId },
    { enabled: open && !!classId }
  );

  // Fetch event data to see which assignments are already attached
  const { data: eventData } = trpc.event.get.useQuery(
    { id: eventId },
    { enabled: open && !!eventId }
  );

  // Attach to event mutation
  const attachToEventMutation = trpc.assignment.attachToEvent.useMutation({
    onSuccess: () => {
      // Will be handled in handleAttach
    },
    onError: (error) => {
      toast.error(error.message || "Failed to attach assignment");
    },
  });

  const assignments = classData?.class?.assignments || [];
  const alreadyAttachedIds = new Set(
    eventData?.event?.assignmentsAttached?.map(a => a.id) || []
  );

  // Filter to only show assignments not already attached to this event
  const availableAssignments = useMemo(() => {
    return assignments.filter(a => !alreadyAttachedIds.has(a.id));
  }, [assignments, alreadyAttachedIds]);

  // Filter assignments based on search query
  const filteredAssignments = useMemo(() => {
    if (!searchQuery.trim()) return availableAssignments;
    const query = searchQuery.toLowerCase();
    return availableAssignments.filter(assignment =>
      assignment.title.toLowerCase().includes(query)
    );
  }, [availableAssignments, searchQuery]);

  // Reset selection when modal opens
  useEffect(() => {
    if (open) {
      setSelectedAssignmentIds(new Set());
      setSearchQuery("");
    }
  }, [open]);

  const toggleAssignmentSelection = (assignmentId: string) => {
    setSelectedAssignmentIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(assignmentId)) {
        newSet.delete(assignmentId);
      } else {
        newSet.add(assignmentId);
      }
      return newSet;
    });
  };

  const selectAllAssignments = () => {
    setSelectedAssignmentIds(new Set(filteredAssignments.map(a => a.id)));
  };

  const deselectAllAssignments = () => {
    setSelectedAssignmentIds(new Set());
  };

  const handleAttach = async () => {
    if (selectedAssignmentIds.size === 0) {
      toast.error('Please select at least one assignment to attach');
      return;
    }

    const assignmentsToAttach = Array.from(selectedAssignmentIds);

    try {
      // Attach each assignment sequentially
      for (const assignmentId of assignmentsToAttach) {
        await attachToEventMutation.mutateAsync({
          classId,
          assignmentId,
          eventId,
        });
      }

      toast.success(`Successfully attached ${assignmentsToAttach.length} assignment(s)`);
      onAttached?.();
      onOpenChange(false);
      setSelectedAssignmentIds(new Set());
      setSearchQuery("");
    } catch (error) {
      // Error already handled in mutation
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSearchQuery("");
    setSelectedAssignmentIds(new Set());
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Attach Assignments to Event
          </DialogTitle>
          <DialogDescription>
            Select assignments to link to this event. Students will see these assignments connected to the event.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Search and Select All */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search assignments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {selectedAssignmentIds.size} of {filteredAssignments.length} selected
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllAssignments}
                  disabled={filteredAssignments.length === 0}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deselectAllAssignments}
                  disabled={selectedAssignmentIds.size === 0}
                >
                  Deselect All
                </Button>
              </div>
            </div>
          </div>

          {/* Assignments List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {isLoadingClass ? (
              <div className="text-center text-muted-foreground py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading assignments...
              </div>
            ) : filteredAssignments.length === 0 ? (
              searchQuery ? (
                <EmptyState
                  icon={SearchX}
                  title="No results found"
                  description="Try adjusting your search query"
                  className="py-6"
                />
              ) : availableAssignments.length === 0 ? (
                <EmptyState
                  icon={LinkIcon}
                  title="All assignments attached"
                  description="Every assignment in this class is already linked to this event"
                  className="py-6"
                />
              ) : (
                <EmptyState
                  icon={FileText}
                  title="No assignments available"
                  description="Create assignments in this class first"
                  className="py-6"
                />
              )
            ) : (
              filteredAssignments.map((assignment) => {
                const isSelected = selectedAssignmentIds.has(assignment.id);
                const dueDate = new Date(assignment.dueDate);
                const isPastDue = dueDate < new Date();

                return (
                  <div
                    key={assignment.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => toggleAssignmentSelection(assignment.id)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onClick={(e) => e.stopPropagation()}
                      onCheckedChange={() => toggleAssignmentSelection(assignment.id)}
                    />
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">
                          {assignment.title}
                        </h4>
                        {isPastDue && (
                          <Badge variant="secondary" className="text-xs">
                            Past Due
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Due {format(dueDate, 'MMM d, yyyy \'at\' h:mm a')}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAttach}
            disabled={selectedAssignmentIds.size === 0 || attachToEventMutation.isPending}
          >
            {attachToEventMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Attaching...
              </>
            ) : (
              <>
                <LinkIcon className="h-4 w-4 mr-2" />
                Attach ({selectedAssignmentIds.size} assignment{selectedAssignmentIds.size !== 1 ? 's' : ''})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


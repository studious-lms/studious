"use client";

import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Search, Link as LinkIcon, Loader2, SearchX, CalendarX } from "lucide-react";
import { toast } from "sonner";
import { trpc, type RouterOutputs } from "@/lib/trpc";
import { EmptyState } from "@/components/ui/empty-state";

type Event = RouterOutputs["event"]["get"]['event'];
type AvailableEvents = RouterOutputs["assignment"]["getAvailableEvents"];

interface AttachEventsToAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentId: string;
  classId: string;
  onAttached?: () => void;
}

export function AttachEventsToAssignmentModal({
  open,
  onOpenChange,
  assignmentId,
  classId,
  onAttached,
}: AttachEventsToAssignmentModalProps) {
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch available events
  const { data: availableEventsData, isLoading: isLoadingEvents } = trpc.assignment.getAvailableEvents.useQuery(
    { assignmentId, classId },
    { enabled: open && !!assignmentId && !!classId }
  );

  // Fetch assignment to see already attached events
  const { data: assignment } = trpc.assignment.get.useQuery(
    { id: assignmentId, classId },
    { enabled: open && !!assignmentId && !!classId }
  );

  // Attach events mutation
  const attachToEventMutation = trpc.assignment.attachToEvent.useMutation({
    onSuccess: () => {
      // Will be handled in handleAttach
    },
    onError: (error) => {
      toast.error(error.message || "Failed to attach event");
    },
  });

  // Initialize selected events with already attached event
  useEffect(() => {
    if (open && assignment?.eventAttached) {
      setSelectedEventIds(new Set([assignment.eventAttached.id]));
    } else if (open) {
      setSelectedEventIds(new Set());
    }
  }, [open, assignment?.eventAttached]);

  const availableEvents = availableEventsData?.events || [];

  // Filter events based on search query
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return availableEvents;
    const query = searchQuery.toLowerCase();
    return availableEvents.filter(event =>
      event.name?.toLowerCase().includes(query) ||
      event.location?.toLowerCase().includes(query)
    );
  }, [availableEvents, searchQuery]);

  const toggleEventSelection = (eventId: string) => {
    setSelectedEventIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const selectAllEvents = () => {
    setSelectedEventIds(new Set(filteredEvents.map(e => e.id)));
  };

  const deselectAllEvents = () => {
    setSelectedEventIds(new Set());
  };

  const handleAttach = async () => {
    if (selectedEventIds.size === 0) {
      toast.error('Please select at least one event to attach');
      return;
    }

    const eventsToAttach = Array.from(selectedEventIds);
    const alreadyAttached = assignment?.eventAttached?.id;
    
    // Filter out the already attached event if it's selected
    const newEventsToAttach = alreadyAttached
      ? eventsToAttach.filter(id => id !== alreadyAttached)
      : eventsToAttach;

    if (newEventsToAttach.length === 0) {
      toast.info('No new events to attach');
      onOpenChange(false);
      return;
    }

    try {
      // Attach each event sequentially
      for (const eventId of newEventsToAttach) {
        await attachToEventMutation.mutateAsync({
          classId,
          assignmentId,
          eventId,
        });
      }

      toast.success(`Successfully attached ${newEventsToAttach.length} event(s)`);
      onAttached?.();
      onOpenChange(false);
      setSelectedEventIds(new Set());
      setSearchQuery("");
    } catch (error) {
      // Error already handled in mutation
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSearchQuery("");
  };

  const isEventAttached = (eventId: string) => {
    return assignment?.eventAttached?.id === eventId;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Attach Events to Assignment
          </DialogTitle>
          <DialogDescription>
            Select one or more events to attach to this assignment. Students will see these events linked to the assignment.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Search and Select All */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {selectedEventIds.size} of {filteredEvents.length} selected
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllEvents}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deselectAllEvents}
                >
                  Deselect All
                </Button>
              </div>
            </div>
          </div>

          {/* Events List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {isLoadingEvents ? (
              <div className="text-center text-muted-foreground py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading events...
              </div>
            ) : filteredEvents.length === 0 ? (
              searchQuery ? (
                <EmptyState
                  icon={SearchX}
                  title="No results found"
                  description="Try adjusting your search query"
                  className="py-6"
                />
              ) : (
                <EmptyState
                  icon={CalendarX}
                  title="No events available"
                  description="Create events in this class first"
                  className="py-6"
                />
              )
            ) : (
              filteredEvents.map((event) => {
                const isSelected = selectedEventIds.has(event.id);
                const isAttached = isEventAttached(event.id);
                const startDate = new Date(event.startTime);
                const endDate = new Date(event.endTime);

                return (
                  <div
                    key={event.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                    } ${isAttached ? 'border-green-500/50 bg-green-500/5' : ''}`}
                    onClick={() => toggleEventSelection(event.id)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onClick={(e) => e.stopPropagation()}
                      onCheckedChange={() => toggleEventSelection(event.id)}
                    />
                    <div
                      className="w-1 h-12 rounded-full flex-shrink-0"
                      style={{ backgroundColor: event.color || '#3B82F6' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">
                          {event.name || 'Untitled Event'}
                        </h4>
                        {isAttached && (
                          <Badge variant="secondary" className="text-xs">
                            Already Attached
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{format(startDate, 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
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
            disabled={selectedEventIds.size === 0 || attachToEventMutation.isPending}
          >
            {attachToEventMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Attaching...
              </>
            ) : (
              <>
                <LinkIcon className="h-4 w-4 mr-2" />
                Attach ({selectedEventIds.size} event{selectedEventIds.size !== 1 ? 's' : ''})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


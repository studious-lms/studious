import { useState } from "react";
import { useDispatch } from "react-redux";
import { addAlert, closeModal } from "@/store/appSlice";
import { AlertLevel } from "@/lib/alertLevel";
import { trpc } from "@/utils/trpc";
import Button from "@/components/ui/Button";
import Skeleton, { SkeletonText } from "@/components/ui/Skeleton";
import { HiCalendar } from "react-icons/hi";
import { format, parseISO } from "date-fns";

interface AttachEventToAssignmentProps {
  assignmentId: string;
  classId: string;
  onEventAttached?: () => void;
}

// Skeleton component for event items
const EventSkeleton = () => (
  <div className="p-3 border rounded-lg">
    <div className="flex items-start justify-between">
      <div className="flex items-start space-x-3 flex-1">
        <Skeleton variant="circular" width="1.25rem" height="1.25rem" />
        <div className="flex-1 min-w-0">
          <Skeleton width="60%" height="1rem" className="mb-2" />
          <Skeleton width="40%" height="0.75rem" className="mb-1" />
          <Skeleton width="50%" height="0.75rem" />
        </div>
      </div>
    </div>
  </div>
);

// Skeleton for the entire component
const AttachEventToAssignmentSkeleton = () => (
  <div className="w-[40rem] space-y-4">
    <div className="space-y-3">
      <Skeleton width="12rem" height="1.5rem" />
      <SkeletonText lines={2} />
    </div>
    
    <div className="space-y-3">
      <Skeleton width="8rem" height="1rem" />
      <div className="max-h-60 overflow-y-auto space-y-2">
        <EventSkeleton />
        <EventSkeleton />
        <EventSkeleton />
      </div>
    </div>

    <div className="flex justify-end space-x-2 pt-4">
      <Skeleton width="4rem" height="2.5rem" />
      <Skeleton width="7rem" height="2.5rem" />
    </div>
  </div>
);

export default function AttachEventToAssignment({ assignmentId, onEventAttached, classId }: AttachEventToAssignmentProps) {
  const dispatch = useDispatch();
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  const { data: availableEvents, refetch: refetchEvents, isLoading } = trpc.assignment.getAvailableEvents.useQuery({
    classId,
    assignmentId
  });

  const attachToEvent = trpc.assignment.attachToEvent.useMutation({
    onSuccess: () => {
      dispatch(addAlert({
        level: AlertLevel.SUCCESS,
        remark: "Assignment attached to event successfully",
      }));
      refetchEvents();
      onEventAttached?.();
      setSelectedEventId("");
    },
    onError: (error) => {
      dispatch(addAlert({
        level: AlertLevel.ERROR,
        remark: error.message || "Failed to attach assignment to event",
      }));
    }
  });

  const handleAttachToEvent = () => {
    if (!selectedEventId) {
      dispatch(addAlert({
        level: AlertLevel.ERROR,
        remark: "Please select an event to attach to",
      }));
      return;
    }

    attachToEvent.mutate({
      classId,
      assignmentId,
      eventId: selectedEventId,
    });
  };

  // Show skeleton loading while data is being fetched
  if (isLoading || !availableEvents) {
    return <AttachEventToAssignmentSkeleton />;
  }

  return (
    <div className="w-[40rem] space-y-4">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Attach Assignment to Event</h3>
        <p className="text-sm text-foreground-muted">
          Select an event to attach this assignment to. Only events that don't already have this assignment attached will be shown.
        </p>
      </div>

      {availableEvents?.events && availableEvents.events.length > 0 ? (
        <div className="space-y-3">
          <label className="text-sm font-semibold">Available Events:</label>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {availableEvents.events.map((event) => (
              <div
                key={event.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedEventId === event.id
                    ? "border-primary-500 bg-primary-100"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => {event.id === selectedEventId ? setSelectedEventId("") : setSelectedEventId(event.id)}}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <HiCalendar className="w-5 h-5 text-foreground-muted shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{event.name || 'Untitled Event'}</h4>
                      <p className="text-xs text-foreground-muted mt-1">
                        {format(parseISO(event.startTime), 'MMM d, yyyy')} • {format(parseISO(event.startTime), 'h:mm a')} - {format(parseISO(event.endTime), 'h:mm a')}
                      </p>
                      {event.location && (
                        <p className="text-xs text-foreground-muted mt-1">
                          Location: {event.location}
                        </p>
                      )}
                      {event.remarks && (
                        <p className="text-xs text-foreground-muted mt-1 truncate">
                          {event.remarks}
                        </p>
                      )}
                    </div>
                  </div>
                  {selectedEventId === event.id && (
                    <div className="shrink-0">
                      <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <HiCalendar className="mx-auto h-12 w-12 text-foreground-muted" />
          <h3 className="mt-2 text-sm font-medium text-foreground-muted">No available events</h3>
          <p className="mt-1 text-sm text-foreground-muted">
            All events already have this assignment attached or there are no events in this class.
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button.Light onClick={() => dispatch(closeModal())}>
          Cancel
        </Button.Light>
        <Button.Primary
          onClick={handleAttachToEvent}
          isLoading={attachToEvent.isPending}
          disabled={!selectedEventId}
        >
          {attachToEvent.isPending ? "Attaching..." : "Attach to Event"}
        </Button.Primary>
      </div>
    </div>
  );
} 
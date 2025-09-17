"use client";

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
  Trash2
} from "lucide-react";
import type { RouterOutputs } from "@/lib/trpc";

type AttendanceRecord = RouterOutputs["attendance"]["get"][number];
type Event = RouterOutputs["event"]["get"]['event'];

interface EventPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event | null;
  onEdit?: (event: Event) => void;
  onDelete?: (event: Event) => void;
  showActions?: boolean; // Whether to show edit/delete buttons
}

export function EventPreviewModal({
  open,
  onOpenChange,
  event,
  onEdit,
  onDelete,
  showActions = false
}: EventPreviewModalProps) {
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
    </Dialog>
  );
}

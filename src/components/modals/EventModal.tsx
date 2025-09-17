"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Clock, MapPin, Plus } from "lucide-react";
import ColorPicker from "@/components/ui/color-picker";
import { useCreateEventMutation, useUpdateEventMutation } from "@/lib/api/calendar";
import { useGetClassQuery } from "@/lib/api/class";
import { toast } from "sonner";
import { trpc, type RouterOutputs } from "@/lib/trpc";

type AttendanceRecord = RouterOutputs["attendance"]["get"][number];
type Event = RouterOutputs["event"]["get"]["event"];

interface EventFormData {
  name: string;
  startDate: Date | undefined;
  startTime: string;
  endDate: Date | undefined;
  endTime: string;
  location: string;
  remarks: string;
  color: string;
}

interface ClassEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: Event | null; // Optional - if provided, we're editing; if not, we're creating
  classId: string;
  onEventCreated?: (event: any) => void;
  onEventUpdated?: () => void;
  children?: React.ReactNode; // For trigger button when creating
}

const defaultFormData: EventFormData = {
  name: "",
  startDate: undefined,
  startTime: "09:00",
  endDate: undefined,
  endTime: "10:00",
  location: "",
  remarks: "",
  color: "#3B82F6"
};

export function ClassEventModal({
  open,
  onOpenChange,
  event,
  classId,
  onEventCreated,
  onEventUpdated,
  children
}: ClassEventModalProps) {
  const [formData, setFormData] = useState<EventFormData>(defaultFormData);

  const createEventMutation = useCreateEventMutation();
  const updateEventMutation = useUpdateEventMutation();
  const { data: classData } = useGetClassQuery(classId);

  const isEditing = !!event;
  const isLoading = createEventMutation.isPending || updateEventMutation.isPending;

  // Populate form when event changes (for editing)
  useEffect(() => {
    if (event) {
      const startDate = new Date(event.startTime);
      const endDate = new Date(event.endTime);
      
      setFormData({
        name: event.name || "",
        startDate: startDate,
        startTime: format(startDate, "HH:mm"),
        endDate: endDate,
        endTime: format(endDate, "HH:mm"),
        location: event.location || "",
        remarks: event.remarks || "",
        color: event.color || "#3B82F6"
      });
    } else {
      // Reset form for creating new event
      setFormData(defaultFormData);
    }
  }, [event]);

  const resetForm = () => {
    setFormData(defaultFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.startDate || !formData.endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Combine date and time for start and end
      const startDateTime = new Date(formData.startDate);
      const [startHour, startMinute] = formData.startTime.split(':');
      startDateTime.setHours(parseInt(startHour), parseInt(startMinute));

      const endDateTime = new Date(formData.endDate);
      const [endHour, endMinute] = formData.endTime.split(':');
      endDateTime.setHours(parseInt(endHour), parseInt(endMinute));

      if (isEditing && event) {
        // Update existing event
        await updateEventMutation.mutateAsync({
          id: event.id,
          data: {
            name: formData.name,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            location: formData.location || undefined,
            remarks: formData.remarks || undefined,
            color: formData.color
          }
        });

        toast.success("Event updated successfully");
        onEventUpdated?.();
      } else {
        // Create new event
        const newEvent = await createEventMutation.mutateAsync({
          classId,
          name: formData.name,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          location: formData.location || undefined,
          remarks: formData.remarks || undefined,
          color: formData.color
        });

        toast.success("Event created successfully");
        onEventCreated?.(newEvent);
      }

      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} event:`, error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} event`);
    }
  };

  const handleInputChange = (field: keyof EventFormData, value: string | Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  return (
    <>
      {/* Render trigger button only when creating (not editing) */}
      {!isEditing && children && (
        <div onClick={() => onOpenChange(true)}>
          {children}
        </div>
      )}
      
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {isEditing ? "Edit Class Event" : "Create New Class Event"}
              </div>
              {classData?.class && (
                <div className="flex items-center gap-2 text-sm font-normal">
                  <div 
                    className="w-3 h-3 rounded-full border"
                    style={{ backgroundColor: classData.class.color || '#3B82F6' }}
                  />
                  <span className="text-muted-foreground">
                    {classData.class.name} • {classData.class.section}
                  </span>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Event Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter event name"
                required
              />
            </div>

            {/* Date and Time Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date & Time */}
              <div className="space-y-2">
                <Label>Start Date & Time *</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "flex-1 justify-start text-left font-normal",
                          !formData.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.startDate ? format(formData.startDate, "PPP") : "Pick date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date) => handleInputChange("startDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => handleInputChange("startTime", e.target.value)}
                      className="w-24"
                    />
                  </div>
                </div>
              </div>

              {/* End Date & Time */}
              <div className="space-y-2">
                <Label>End Date & Time *</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "flex-1 justify-start text-left font-normal",
                          !formData.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.endDate ? format(formData.endDate, "PPP") : "Pick date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date) => handleInputChange("endDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => handleInputChange("endTime", e.target.value)}
                      className="w-24"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="Enter event location"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <ColorPicker
                value={formData.color}
                onChange={(color) => handleInputChange("color", color)}
                label="Event Color"
                description="Choose a color for this event"
              />
            </div>

            {/* Remarks */}
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={formData.remarks}
                onChange={(e) => handleInputChange("remarks", e.target.value)}
                placeholder="Additional notes or remarks about the event"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !formData.name || !formData.startDate || !formData.endDate}
              >
                {isLoading 
                  ? (isEditing ? "Updating..." : "Creating...")
                  : (isEditing ? "Update Event" : "Create Event")
                }
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Convenience wrapper for creating class events with a default trigger button
interface CreateClassEventButtonProps {
  classId: string;
  onEventCreated?: (event: any) => void;
  children?: React.ReactNode;
}

export function CreateClassEventButton({ classId, onEventCreated, children }: CreateClassEventButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <ClassEventModal
      open={open}
      onOpenChange={setOpen}
      classId={classId}
      onEventCreated={onEventCreated}
    >
      {children || (
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Class Event
        </Button>
      )}
    </ClassEventModal>
  );
}
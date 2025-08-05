import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { addAlert, closeModal } from "@/store/appSlice";
import { AlertLevel } from "@/lib/alertLevel";
import { RouterOutputs, trpc } from "@/utils/trpc";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ColorPicker from "@/components/ui/ColorPicker";
import Skeleton from "@/components/ui/Skeleton";
import { format, parseISO } from "date-fns";

interface UpdatePersonalEventProps {
  id: string;
  onUpdate?: (event: RouterOutputs['agenda']['get']['events']['personal'][number]) => void;
}

// Skeleton component for the form fields
const UpdatePersonalEventSkeleton = () => (
  <div className="space-y-4 w-[24rem] max-w-full">
    {/* Name field skeleton */}
    <div className="space-y-2">
      <Skeleton width="3rem" height="1rem" />
      <Skeleton width="100%" height="2.5rem" />
    </div>
    
    {/* Location field skeleton */}
    <div className="space-y-2">
      <Skeleton width="4rem" height="1rem" />
      <Skeleton width="100%" height="2.5rem" />
    </div>
    
    {/* Remarks field skeleton */}
    <div className="space-y-2">
      <Skeleton width="4rem" height="1rem" />
      <Skeleton width="100%" height="4rem" />
    </div>
    
    {/* Color picker skeleton */}
    <div className="space-y-2">
      <Skeleton width="6rem" height="1rem" />
      <Skeleton width="100%" height="2.5rem" />
    </div>
    
    {/* Start Time field skeleton */}
    <div className="space-y-2">
      <Skeleton width="5rem" height="1rem" />
      <Skeleton width="100%" height="2.5rem" />
    </div>
    
    {/* End Time field skeleton */}
    <div className="space-y-2">
      <Skeleton width="5rem" height="1rem" />
      <Skeleton width="100%" height="2.5rem" />
    </div>
    
    {/* Buttons skeleton */}
    <div className="flex justify-end space-x-2">
      <Skeleton width="4rem" height="2.5rem" />
      <Skeleton width="6rem" height="2.5rem" />
    </div>
  </div>
);

export default function UpdatePersonalEvent({ id, onUpdate }: UpdatePersonalEventProps) {
  const [eventData, setEventData] = useState({
    name: "",
    location: "",
    remarks: "",
    startTime: "",
    endTime: "",
    color: "#3B82F6",
  });

  const dispatch = useDispatch();

  const { data: event, isPending } = trpc.event.get.useQuery({ id });

  useEffect(() => {
    if (event?.event) {
      // Convert UTC times to local timezone for display in form
      const startDate = parseISO(event.event.startTime);
      const endDate = parseISO(event.event.endTime);
      
      setEventData({
        name: event.event.name || "",
        location: event.event.location || "",
        remarks: event.event.remarks || "",
        startTime: format(startDate, "yyyy-MM-dd'T'HH:mm"),
        endTime: format(endDate, "yyyy-MM-dd'T'HH:mm"),
        color: event.event.color || "#3B82F6",
      });
    }
  }, [event]);

  const updateEvent = trpc.event.update.useMutation({
    onSuccess: (data) => {
      dispatch(addAlert({ level: AlertLevel.SUCCESS, remark: "Event updated successfully" }));
      onUpdate && onUpdate(data.event as RouterOutputs['agenda']['get']['events']['personal'][number]);
    },
    onError: (error) => {
      dispatch(addAlert({ level: AlertLevel.ERROR, remark: error.message }));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEvent.mutate({
      id,
      data: eventData,
    });
    dispatch(closeModal());
  };

  // Show skeleton loading while event data is being fetched
  if (isPending) {
    return <UpdatePersonalEventSkeleton />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-[24rem] max-w-full">
      <Input.Text
        label="Name"
        value={eventData.name}
        onChange={(e) => setEventData({ ...eventData, name: e.target.value })}
        required
      />
      <Input.Text
        label="Location"
        value={eventData.location}
        onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
      />
      <Input.Textarea
        label="Remarks"
        value={eventData.remarks}
        onChange={(e) => setEventData({ ...eventData, remarks: e.target.value })}
      />
      <ColorPicker
        value={eventData.color}
        onChange={(color) => setEventData({ ...eventData, color })}
        label="Event Color"
        description="Choose a color to distinguish this event from others."
        size="sm"
        showCustomPicker={true}
      />
      <Input.Text
        label="Start Time"
        type="datetime-local"
        value={eventData.startTime}
        onChange={(e) => setEventData({ ...eventData, startTime: e.target.value })}
        required
      />
      <Input.Text
        label="End Time"
        type="datetime-local"
        value={eventData.endTime}
        onChange={(e) => setEventData({ ...eventData, endTime: e.target.value })}
        required
      />
      <div className="flex justify-end space-x-2">
        <Button.Light>Cancel</Button.Light>
        <Button.Primary isLoading={updateEvent.isPending} type="submit">{updateEvent.isPending ? 'Updating event' : 'Update event'}</Button.Primary>
      </div>
    </form>
  );
}
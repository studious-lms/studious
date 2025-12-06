"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { PageLayout } from "@/components/ui/page-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { 
  Calendar as CalendarIcon, 
  UserCheck, 
  UserX, 
  Clock,
  Plus,
  MapPin,
  Check,
  X,
  ClipboardCheck,
  Edit,
  ArrowUpDown,
  Trash2,
  Eye
} from "lucide-react";
import { trpc, type RouterOutputs } from "@/lib/trpc";
import { ClassEventModal } from "@/components/modals";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

type AttendanceRecord = RouterOutputs["attendance"]["get"][number];
type Event = RouterOutputs["event"]["get"]["event"];

interface EventTableRow {
  id: string;
  date: string;
  name: string;
  time: string;
  location?: string | null;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  totalStudents: number;
  attendanceRate: number;
  status: 'completed' | 'upcoming' | 'ongoing';
}

function AttendanceListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>

      {/* Date picker card */}
      <div className="p-4 rounded-lg border">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="mt-4">
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}

export default function Attendance() {
  const t = useTranslations('attendance');
  const tCommon = useTranslations('common');
  const { id: classId } = useParams();
  const router = useRouter();
  const appState = useSelector((state: RootState) => state.app);
  const isStudent = appState.user.student;
  const currentUserId = appState.user.id;
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<{ id: string; name: string; } | null>(null);

  // Get class data (students)
  const { data: classData, isLoading: classLoading, refetch: refetchClass } = trpc.class.get.useQuery({ 
    classId: classId as string 
  });

  // Fetch all attendance records for the class
  const { data: attendanceDataRaw, isLoading: attendanceLoading, refetch: refetchAttendance } = trpc.attendance.get.useQuery({ 
    classId: classId as string 
  });

  // Delete event mutation
  const deleteEventMutation = trpc.event.delete.useMutation();

  const students = useMemo(() => classData?.class?.students || [], [classData?.class?.students]);
  const attendanceData = useMemo(() => attendanceDataRaw || [], [attendanceDataRaw]);
  
  // Extract events from attendance records
  const allEvents = useMemo(() => 
    attendanceData
      .map((record: AttendanceRecord) => record.event)
      .filter((event): event is NonNullable<AttendanceRecord["event"]> => !!event),
    [attendanceData]
  );

  // Define table columns
  const columns: ColumnDef<EventTableRow>[] = [
    {
      accessorKey: "date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t('table.date')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("date")}</div>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t('table.eventName')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue("name")}</div>
          <div className="text-sm text-muted-foreground">{row.original.time}</div>
          {row.original.location && (
            <div className="text-xs text-muted-foreground flex items-center mt-1">
              <MapPin className="h-3 w-3 mr-1" />
              {row.original.location}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "attendanceRate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t('table.attendanceRate')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const rate = row.getValue("attendanceRate") as number;
        return (
          <div className="text-center">
            <div className="font-medium">{rate}%</div>
            <div className="text-xs text-muted-foreground">
              {row.original.presentCount + row.original.lateCount}/{row.original.totalStudents}
            </div>
          </div>
        );
      },
    },
    {
      id: "attendance",
      header: t('table.attendance'),
      cell: ({ row }) => (
        <div className="flex space-x-1 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>{row.original.presentCount}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>{row.original.lateCount}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>{row.original.absentCount}</span>
          </div>
        </div>
      ),
    },
    {
      id: "actions",
      header: t('table.actions'),
      cell: ({ row }) => {
        const event = allEvents.find(e => e.id === row.original.id);
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/class/${classId}/attendance/${row.original.id}`);
              }}
            >
              <Eye className="h-4 w-4 mr-1" />
              {t('actions.viewDetails')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setEventToEdit(event as Event);
                setEventModalOpen(true);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                setEventToDelete({id: event!.id, name: event!.name || ""});
                setDeleteConfirmOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Process data for the table
  const tableData: EventTableRow[] = useMemo(() => {
    return allEvents
      .map((event) => {
        const record = attendanceData.find(r => r.event?.id === event.id);
        const presentCount = record?.present?.length || 0;
        const lateCount = record?.late?.length || 0;
        const absentCount = record?.absent?.length || 0;
        const totalStudents = students.length;
        const attendanceRate = totalStudents > 0 
          ? Math.round(((presentCount + lateCount) / totalStudents) * 100) 
          : 0;
        
        const now = new Date();
        const eventStart = new Date(event.startTime);
        const eventEnd = new Date(event.endTime);
        
        let status: 'completed' | 'upcoming' | 'ongoing' = 'upcoming';
        if (now > eventEnd) {
          status = 'completed';
        } else if (now >= eventStart && now <= eventEnd) {
          status = 'ongoing';
        }

        return {
          id: event.id,
          date: format(eventStart, "MMM d, yyyy"),
          name: event.name || 'Untitled Event',
          time: `${format(eventStart, "h:mm a")} - ${format(eventEnd, "h:mm a")}`,
          location: event.location || undefined,
          presentCount,
          lateCount,
          absentCount,
          totalStudents,
          attendanceRate,
          status,
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allEvents, attendanceData, students]);

  // Events for selected date
  const eventsForDate = selectedDate 
    ? allEvents.filter(event => {
        const eventDate = new Date(event.startTime);
        const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
        const eventDateStr = format(eventDate, 'yyyy-MM-dd');
        return selectedDateStr === eventDateStr;
      })
    : [];

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;

    try {
      await deleteEventMutation.mutateAsync({
        id: eventToDelete.id
      });
      
      toast.success(t('toast.eventDeleted'));
      setDeleteConfirmOpen(false);
      setEventToDelete(null);
      
      refetchAttendance();
      refetchClass();
    } catch (error) {
      console.error("Failed to delete event:", error);
      toast.error(t('toast.eventDeleteFailed'));
    }
  };

  // Student-specific data
  const studentAttendanceData = useMemo(() => {
    if (!isStudent || !attendanceData) return [];
    
    return attendanceData.map((record) => {
      const event = allEvents.find(e => e.id === record.eventId);
      
      let status: 'present' | 'late' | 'absent' | 'not_taken' = 'not_taken';
      if (record.present.some(s => s.id === currentUserId)) {
        status = 'present';
      } else if (record.late.some(s => s.id === currentUserId)) {
        status = 'late';
      } else if (record.absent.some(s => s.id === currentUserId)) {
        status = 'absent';
      }
      
      return {
        event,
        status,
        date: event?.startTime,
        name: event?.name,
        location: event?.location,
      };
    }).filter(item => item.event);
  }, [isStudent, attendanceData, allEvents, currentUserId]);

  const studentStats = useMemo(() => {
    if (!isStudent || studentAttendanceData.length === 0) {
      return { present: 0, late: 0, absent: 0, total: 0, attendanceRate: 0 };
    }

    const present = studentAttendanceData.filter(item => item.status === 'present').length;
    const late = studentAttendanceData.filter(item => item.status === 'late').length;
    const absent = studentAttendanceData.filter(item => item.status === 'absent').length;
    const total = studentAttendanceData.filter(item => item.status !== 'not_taken').length;
    const attendanceRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    return { present, late, absent, total, attendanceRate };
  }, [isStudent, studentAttendanceData]);

  const getStatusIcon = (status: 'present' | 'late' | 'absent' | 'not_taken') => {
    switch (status) {
      case 'present':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'late':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'absent':
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <span className="text-sm text-muted-foreground">-</span>;
    }
  };

  // Student attendance table columns
  const studentAttendanceColumns: ColumnDef<typeof studentAttendanceData[number]>[] = [
    {
      accessorKey: "date",
      header: t('table.date'),
      cell: ({ row }) => {
        const date = row.original.event?.startTime;
        return date ? format(new Date(date), "MMM d, yyyy") : "-";
      },
    },
    {
      accessorKey: "name",
      header: t('student.event'),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.event?.name}</div>
          {row.original.event?.location && (
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {row.original.event.location}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: t('student.status'),
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <div className="flex items-center gap-2">
            {getStatusIcon(status)}
            <Badge variant={
              status === 'present' ? 'default' : 
              status === 'late' ? 'secondary' : 
              status === 'absent' ? 'destructive' : 
              'outline'
            }>
              {status === 'not_taken' ? t('status.notTaken') : status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
        );
      },
    },
  ];

  if (classLoading || attendanceLoading) {
    return (
      <PageLayout>
        <AttendanceListSkeleton />
      </PageLayout>
    );
  }

  // Student view
  if (isStudent) {
    return (
      <PageLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold">{t('student.title')}</h1>
            <p className="text-muted-foreground">
              {t('student.subtitle', { className: classData?.class?.name || tCommon('class') })}
            </p>
          </div>

          {/* Student Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{studentStats.present}</p>
                    <p className="text-xs text-muted-foreground">{t('status.present')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{studentStats.late}</p>
                    <p className="text-xs text-muted-foreground">{t('status.late')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                    <UserX className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{studentStats.absent}</p>
                    <p className="text-xs text-muted-foreground">{t('status.absent')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{studentStats.attendanceRate}%</p>
                    <p className="text-xs text-muted-foreground">{t('student.attendanceRate')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance History */}
          {studentAttendanceData.length === 0 ? (
            <EmptyState
              icon={ClipboardCheck}
              title={t('student.empty.title')}
              description={t('student.empty.description')}
            />
          ) : (
            <DataTable
              columns={studentAttendanceColumns}
              data={studentAttendanceData}
              searchKey="name"
              searchPlaceholder={t('student.searchPlaceholder')}
            />
          )}
        </div>
      </PageLayout>
    );
  }

  // Teacher view
  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground">{t('subtitle')}</p>
          </div>
          
          <Button onClick={() => {
            setEventToEdit(null);
            setEventModalOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            {t('actions.createEvent')}
          </Button>
        </div>

        {/* Date Picker Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "MMMM dd") : t('eventsList.pickDate')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardHeader>
          <CardContent>
            {eventsForDate.length === 0 ? (
              <div className="space-y-4">
                <EmptyState
                  icon={CalendarIcon}
                  title={selectedDate ? t('eventsList.empty.noEventsOnDate') : t('eventsList.empty.noEvents')}
                  description={selectedDate 
                    ? t('eventsList.empty.noEventsOnDateDescription', { date: format(selectedDate, "MMM d, yyyy") })
                    : t('eventsList.empty.noEventsDescription')
                  }
                />
                <Button
                  onClick={() => {
                    setEventToEdit(null);
                    setEventModalOpen(true);
                  }}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {selectedDate ? t('eventsList.empty.createForDate') : t('eventsList.empty.createFirst')}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {eventsForDate.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => router.push(`/class/${classId}/attendance/${event.id}`)}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-1 h-10 rounded-full"
                        style={{ backgroundColor: event.color || '#3B82F6' }}
                      />
                      <div>
                        <h3 className="font-medium">{event.name || t('eventsList.untitled')}</h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(new Date(event.startTime), "h:mm a")} - {format(new Date(event.endTime), "h:mm a")}
                          {event.location && (
                            <>
                              <span className="mx-2">•</span>
                              <MapPin className="h-3 w-3 mr-1" />
                              {event.location}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Events Table */}
        {tableData.length === 0 ? (
          <EmptyState
            icon={CalendarIcon}
            title={t('allEvents.empty.title')}
            description={t('allEvents.empty.description')}
          />
        ) : (
          <DataTable
            columns={columns}
            data={tableData}
            searchKey="name"
            searchPlaceholder={t('allEvents.searchPlaceholder')}
            onRowClick={(row) => {
              router.push(`/class/${classId}/attendance/${row.id}`);
            }}
            pageSize={10}
          />
        )}
      </div>

      {/* Class Event Modal (Create/Edit) */}
      <ClassEventModal
        open={eventModalOpen}
        onOpenChange={(open) => {
          setEventModalOpen(open);
          if (!open) {
            setEventToEdit(null);
          }
        }}
        event={eventToEdit}
        classId={classId as string}
        onEventCreated={() => {
          refetchClass();
          refetchAttendance();
        }}
        onEventUpdated={() => {
          refetchClass();
          refetchAttendance();
        }}
      />

      {/* Delete Event Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteDialog.description', { eventName: eventToDelete?.name || "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteEventMutation.isPending}
            >
              {deleteEventMutation.isPending ? t('deleteDialog.deleting') : t('deleteDialog.deleteButton')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { PageLayout } from "@/components/ui/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft,
  UserCheck, 
  UserX, 
  Clock,
  MapPin,
  Calendar,
  Save,
} from "lucide-react";
import { trpc, type RouterOutputs } from "@/lib/trpc";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import UserProfilePicture from "@/components/UserProfilePicture";

type AttendanceRecord = RouterOutputs["attendance"]["get"][number];

function EventDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Back button */}
      <Skeleton className="h-4 w-16" />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Event info */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-6 w-64" />
        <div className="flex gap-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <Separator />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-xl border">
            <Skeleton className="h-8 w-12 mx-auto mb-2" />
            <Skeleton className="h-4 w-16 mx-auto" />
          </div>
        ))}
      </div>

      {/* Student roster */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-32" />
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-xl border">
              <div className="flex items-center gap-3 mb-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24 mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function EventAttendance() {
  const t = useTranslations('attendance');
  const { id: classId, eventId } = useParams();
  const router = useRouter();
  const appState = useSelector((state: RootState) => state.app);
  const isStudent = appState.user.student;
  
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastModified, setLastModified] = useState<number>(0);
  const [lastSaved, setLastSaved] = useState<number>(0);

  // Get class data (students)
  const { data: classData, isLoading: classLoading } = trpc.class.get.useQuery({ 
    classId: classId as string 
  });

  // Get event data
  const { data: eventData, isLoading: eventLoading } = trpc.event.get.useQuery({
    id: eventId as string
  });

  // Fetch attendance records for the class
  const { data: attendanceDataRaw, isLoading: attendanceLoading, refetch: refetchAttendance } = trpc.attendance.get.useQuery({ 
    classId: classId as string 
  });

  // Update attendance mutation
  const updateAttendanceMutation = trpc.attendance.update.useMutation({
    onSuccess: () => {
      if (!isAutoSaving) {
        refetchAttendance();
      }
    }
  });

  const students = classData?.class?.students || [];
  const event = eventData?.event;
  const attendanceData = useMemo(() => attendanceDataRaw || [], [attendanceDataRaw]);

  // Find the attendance record for this event
  const eventAttendanceRecord = useMemo(() => {
    return attendanceData.find((record: AttendanceRecord) => record.event?.id === eventId);
  }, [attendanceData, eventId]);

  // Initialize attendance when data loads
  useEffect(() => {
    if (!students.length) return;
    
    if (eventAttendanceRecord) {
      const newAttendance: Record<string, string> = {};
      
      eventAttendanceRecord.present.forEach(student => {
        newAttendance[student.id] = "present";
      });
      eventAttendanceRecord.late.forEach(student => {
        newAttendance[student.id] = "late";
      });
      eventAttendanceRecord.absent.forEach(student => {
        newAttendance[student.id] = "absent";
      });
      
      // Default remaining students to present
      students.forEach(student => {
        if (!newAttendance[student.id]) {
          newAttendance[student.id] = "present";
        }
      });
      
      setAttendance(newAttendance);
    } else {
      // Initialize with all present for new attendance
      const newAttendance: Record<string, string> = {};
      students.forEach(student => {
        newAttendance[student.id] = "present";
      });
      setAttendance(newAttendance);
    }
  }, [students, eventAttendanceRecord]);

  const updateAttendanceStatus = (studentId: string, status: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
    setLastModified(Date.now());
  };

  const getStatusStats = () => {
    const stats = Object.values(attendance).reduce((acc, status) => {
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      present: stats.present || 0,
      late: stats.late || 0,
      absent: stats.absent || 0,
      total: students.length
    };
  };

  const saveAttendance = async (showToast = false) => {
    if (!eventId || Object.keys(attendance).length === 0) return;

    const saveTimestamp = Date.now();
    
    try {
      const present = students.filter(s => attendance[s.id] === "present");
      const late = students.filter(s => attendance[s.id] === "late");
      const absent = students.filter(s => attendance[s.id] === "absent");

      await updateAttendanceMutation.mutateAsync({
        classId: classId as string,
        eventId: eventId as string,
        attendance: {
          eventId: eventId as string,
          present: present.map(s => ({ id: s.id, username: s.username })),
          late: late.map(s => ({ id: s.id, username: s.username })),
          absent: absent.map(s => ({ id: s.id, username: s.username })),
        }
      });

      setLastSaved(saveTimestamp);
      
      if (showToast) {
        toast.success(t('toast.attendanceSaved'));
      }
    } catch (error) {
      console.error("Failed to save attendance:", error);
      if (showToast) {
        toast.error(t('toast.attendanceSaveFailed'));
      }
    }
  };

  // Autosave
  const hasUnsavedChanges = lastModified > lastSaved;

  useEffect(() => {
    if (!eventId || !hasUnsavedChanges || Object.keys(attendance).length === 0) return;
    
    setIsAutoSaving(true);
    
    const timeoutId = setTimeout(async () => {
      await saveAttendance();
      setIsAutoSaving(false);
    }, 1500);

    return () => {
      clearTimeout(timeoutId);
      setIsAutoSaving(false);
    };
  }, [lastModified, eventId]);

  const stats = getStatusStats();

  if (classLoading || eventLoading || attendanceLoading) {
    return (
      <PageLayout>
        <EventDetailSkeleton />
      </PageLayout>
    );
  }

  if (!event) {
    return (
      <PageLayout>
        <div className="space-y-4">
          <button 
            onClick={() => router.back()}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← {t('actions.back')}
          </button>
          <EmptyState
            icon={Calendar}
            title={t('eventDetail.notFound.title')}
            description={t('eventDetail.notFound.description')}
          />
        </div>
      </PageLayout>
    );
  }

  const attendanceRate = stats.total > 0 
    ? Math.round(((stats.present + stats.late) / stats.total) * 100) 
    : 0;

  // Calculate duration
  const startTime = new Date(event.startTime);
  const endTime = new Date(event.endTime);
  const durationHours = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60));

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Back button */}
        <button 
          onClick={() => router.push(`/class/${classId}/attendance`)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('actions.back')}
        </button>

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t('eventDetail.title')}</h1>
          
          {!isStudent && (
            <Button 
              onClick={() => saveAttendance(true)}
              disabled={updateAttendanceMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {updateAttendanceMutation.isPending ? t('saving.saving') : t('actions.saveAttendance')}
            </Button>
          )}
        </div>

        {/* Event Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">{t('eventDetail.basicInfo')}</h2>
          <h3 className="text-xl font-medium">{event.name}</h3>
          
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {event.location && (
              <div className="flex items-center gap-1.5">
                <span className="text-foreground font-medium">{t('eventDetail.address')}:</span>
                <MapPin className="h-4 w-4" />
                {event.location}
              </div>
            )}
            
            <div className="flex items-center gap-1.5">
              <span className="text-foreground font-medium">{t('eventDetail.date')}:</span>
              <Calendar className="h-4 w-4" />
              {format(startTime, "EEEE, MMMM d, yyyy")}
              {format(startTime, "yyyy-MM-dd") !== format(endTime, "yyyy-MM-dd") && (
                <span> to {format(endTime, "EEEE, MMMM d, yyyy")}</span>
              )}
            </div>
            
            <div className="flex items-center gap-1.5">
              <span className="text-foreground font-medium">{t('eventDetail.time')}:</span>
              <Clock className="h-4 w-4" />
              {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
              <Badge variant="secondary" className="ml-2">{durationHours}h</Badge>
            </div>
          </div>

        </div>

        <Separator />

        {/* Summary Stats */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">{t('summary.title')}</h2>
          <p className="text-sm text-muted-foreground">{event.name}</p>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.present}</div>
              <p className="text-sm text-green-700 dark:text-green-300">{t('status.present')}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.late}</div>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">{t('status.late')}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.absent}</div>
              <p className="text-sm text-red-700 dark:text-red-300">{t('status.absent')}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted border">
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-sm text-muted-foreground">{t('summary.total')}</p>
            </div>
          </div>
        </div>

        {/* Student Roster */}
        {!isStudent && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{t('roster.title')}</h2>
                <p className="text-sm text-muted-foreground">{t('roster.description')}</p>
              </div>
            </div>

            {/* Attendance Rate & Quick Actions */}
            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
              <div className="text-sm">
                {t('summary.attendanceRate')}: <span className="font-semibold">{attendanceRate}%</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const newAttendance = {...attendance};
                    students.forEach(student => {
                      newAttendance[student.id] = "present";
                    });
                    setAttendance(newAttendance);
                    setLastModified(Date.now());
                  }}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  {t('actions.markAllPresent')}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const newAttendance = {...attendance};
                    students.forEach(student => {
                      newAttendance[student.id] = "absent";
                    });
                    setAttendance(newAttendance);
                    setLastModified(Date.now());
                  }}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  {t('actions.markAllAbsent')}
                </Button>
              </div>
            </div>

            {students.length === 0 ? (
              <EmptyState
                icon={UserCheck}
                title={t('roster.empty.title')}
                description={t('roster.empty.description')}
              />
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {students.map((student) => (
                  <div key={student.id} className="p-4 rounded-xl border hover:shadow-sm transition-shadow">
                    <div className="flex items-center space-x-3 mb-3">
                      <UserProfilePicture profilePicture={student.profile?.profilePicture || ""} username={student.username} />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{student.profile?.displayName || student.username}</h4>
                        <p className="text-xs text-muted-foreground truncate">{student.username}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={attendance[student.id] === "present" ? "default" : "outline"}
                        size="sm"
                        className="text-xs"
                        onClick={() => updateAttendanceStatus(student.id, "present")}
                      >
                        {t('status.present')}
                      </Button>
                      <Button
                        variant={attendance[student.id] === "late" ? "default" : "outline"}
                        size="sm"
                        className={`text-xs ${attendance[student.id] === "late" ? "bg-yellow-500 hover:bg-yellow-600 text-white" : ""}`}
                        onClick={() => updateAttendanceStatus(student.id, "late")}
                      >
                        {t('status.late')}
                      </Button>
                      <Button
                        variant={attendance[student.id] === "absent" ? "destructive" : "outline"}
                        size="sm"
                        className="text-xs"
                        onClick={() => updateAttendanceStatus(student.id, "absent")}
                      >
                        {t('status.absent')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}


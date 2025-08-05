"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { addAlert, openModal, setRefetch } from "@/store/appSlice";
import { AlertLevel } from "@/lib/alertLevel";
import Button from "@/components/ui/Button";
import UpdateClassEvent from "@/components/class/forms/UpdateClassEvent";
import ManageAttendance from "@/components/class/forms/ManageAttendance";
import CreateClassEvent from "@/components/class/forms/CreateClassEvent";
import Loading from "@/components/Loading";
import Empty from "@/components/ui/Empty";
import { HiCalendar, HiLocationMarker, HiClock, HiClipboardCheck, HiPencil, HiInformationCircle, HiCheck, HiX, HiClock as HiClockIcon, HiPlus } from "react-icons/hi";
import { initializeSocket, joinClass, leaveClass } from "@/lib/socket";
import { trpc } from "@/utils/trpc";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@studious-lms/server";
import type { RouterOutputs } from "@/utils/trpc";
import Card from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { fmtTime } from "@/lib/time";
import Skeleton, { SkeletonText, SkeletonTable } from "@/components/ui/Skeleton";

interface AttendanceStatus {
    eventId: string;
    status: 'present' | 'late' | 'absent' | 'not_taken';
}

type RouterOutput = inferRouterOutputs<AppRouter>;
type AttendanceRecord = RouterOutput["attendance"]["get"][number];
type AttendanceQueryResult = RouterOutput["attendance"]["get"];

// Skeleton component for attendance page
const AttendancePageSkeleton = () => (
    <div className="flex flex-col space-y-6 max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
            <Skeleton width="12rem" height="1.5rem" />
            <Skeleton width="7rem" height="2.5rem" />
        </div>

        {/* Table skeleton */}
        <SkeletonTable rows={5} columns={5} />
    </div>
);

export default function AttendancePage({ params }: { params: { classId: string } }) {
    const [attendanceStatuses, setAttendanceStatuses] = useState<Record<string, AttendanceStatus>>({});
    const appState = useSelector((state: RootState) => state.app);
    const dispatch = useDispatch();

    // Fetch all attendance records for the class
    const { data: attendanceDataRaw, isLoading: attendanceLoading, refetch: refetchAttendance } = trpc.attendance.get.useQuery({ classId: params.classId });
    const attendanceData = attendanceDataRaw;

    // Socket connection and event handling
    useEffect(() => {
        const socket = initializeSocket();
        joinClass(params.classId);
        socket.on('attendance-updated', () => {
            refetchAttendance();
        });
        return () => {
            leaveClass(params.classId);
            socket.off('attendance-updated');
        };
    }, [params.classId, refetchAttendance]);

    const attendanceArray = (attendanceDataRaw as RouterOutputs["attendance"]["get"]) || [];
    const events = attendanceArray
        .map((record: AttendanceRecord) => record.event)
        .filter((event: AttendanceRecord["event"]): event is NonNullable<AttendanceRecord["event"]> => !!event);

    // Map attendance status for each event for the current user
    useEffect(() => {
        if (!attendanceData || !attendanceData) return;
        const statusMap: Record<string, AttendanceStatus> = {};
        for (const record of attendanceData) {
            if (!record.event) continue;
            const studentId = appState.user.id;
            let status: 'present' | 'late' | 'absent' | 'not_taken' = 'not_taken';
            if (record.present.some((s: { id: string }) => s.id === studentId)) {
                status = 'present';
            } else if (record.late.some((s: { id: string }) => s.id === studentId)) {
                status = 'late';
            } else if (record.absent.some((s: { id: string }) => s.id === studentId)) {
                status = 'absent';
            }
            statusMap[record.event.id] = { eventId: record.event.id, status };
        }
        setAttendanceStatuses(statusMap);
    }, [attendanceData, appState.user.id]);

    const getStatusIcon = (status: AttendanceStatus['status']) => {
        switch (status) {
            case 'present':
                return <HiCheck className="h-5 w-5 text-green-500" />;
            case 'late':
                return <HiClockIcon className="h-5 w-5 text-yellow-500" />;
            case 'absent':
                return <HiX className="h-5 w-5 text-red-500" />;
            default:
                return <span className="text-sm text-foreground-muted">-</span>;
        }
    };

    const getStatusText = (status: AttendanceStatus['status']) => {
        switch (status) {
            case 'present':
                return 'Present';
            case 'late':
                return 'Late';
            case 'absent':
                return 'Absent';
            default:
                return 'N/A';
        }
    };

    const columns = [
        {
            header: "Event Name",
            accessor: "name",
            cell: (row: any) => (
                <div className="flex items-center">
                    <div className="w-1 h-8 rounded-full mr-3 border-l-4" style={{ borderColor: `${row.color}` }}></div>
                    <span className="font-medium text-foreground-primary">
                        {row.name || 'Class Event'}
                    </span>
                </div>
            ),
        },
        {
            header: "Date & Time",
            accessor: "startTime",
            cell: (row: any) => (
                <div className="flex items-center text-sm text-foreground-muted">
                    <HiClock className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>
                        {new Date(row.startTime).toLocaleDateString()} {fmtTime(new Date(row.startTime))} - {fmtTime(new Date(row.endTime))}
                    </span>
                </div>
            ),
        },
        {
            header: "Location",
            accessor: "location",
            cell: (row: any) => (
                row.location ? (
                    <div className="flex items-center text-sm text-foreground-muted">
                        <HiLocationMarker className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{row.location}</span>
                    </div>
                ) : (
                    <span className="text-sm text-foreground-muted">-</span>
                )
            ),
        },
        {
            header: "Remarks",
            accessor: "remarks",
            cell: (row: any) => (
                <span className="text-sm text-foreground-muted">
                    {row.remarks || '-'}
                </span>
            ),
        },
        {
            header: appState.user.teacher ? "Actions" : "Status",
            accessor: "actions",
            cell: (row: any) => (
                appState.user.teacher ? (
                    <div className="flex space-x-2">
                        <Button.SM 
                            onClick={() => dispatch(openModal({
                                body: <ManageAttendance classId={params.classId} eventId={row.id} />,
                                header: 'Manage Attendance'
                            }))}
                            className="flex items-center text-foreground hover:text-primary-500"
                        >
                            <HiClipboardCheck className="h-5 w-5" />
                        </Button.SM>
                        <Button.SM 
                            onClick={() => dispatch(openModal({
                                body: <UpdateClassEvent id={row.id} onUpdate={() => refetchAttendance()} />,
                                header: 'Edit Event'
                            }))}
                            className="flex items-center text-foreground hover:text-primary-500"
                        >
                            <HiPencil className="h-5 w-5" />
                        </Button.SM>
                    </div>
                ) : (
                    <div className="flex items-center space-x-2">
                        {getStatusIcon(attendanceStatuses[row.id]?.status || 'not_taken')}
                        <span className="text-sm font-medium">
                            {getStatusText(attendanceStatuses[row.id]?.status || 'not_taken')}
                        </span>
                    </div>
                )
            ),
        },
    ];

    if (attendanceLoading) {
        return <AttendancePageSkeleton />;
    }

    return (
        <div className="flex flex-col space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="font-semibold text-xl text-foreground-primary">Class Events & Attendance</h1>
                {appState.user.teacher}
                {appState.user.teacher && (
                    <Button.Primary
                        onClick={() => dispatch(openModal({
                            body: <CreateClassEvent classId={params.classId} onCreate={refetchAttendance} />,
                            header: 'Add Event'
                        }))}
                        className="flex items-center space-x-2"
                    >
                        <HiPlus className="h-5 w-5" />
                        <span>Add Event</span>
                    </Button.Primary>
                )}
            </div>

            {events.length === 0 ? (
                <Card className="p-6">
                    <Empty 
                        icon={HiCalendar}
                        title="No events found"
                        description="There are no events scheduled for this class"
                    />
                </Card>
            ) : (
                <DataTable
                    columns={columns}
                    data={events}
                    emptyTitle="No events found"
                    emptyDescription="There are no events scheduled for this class"
                />
                
            )}
        </div>
    );
}

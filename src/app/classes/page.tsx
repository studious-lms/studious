"use client";

import { addAlert, setRefetch, openModal } from "@/store/appSlice";
import { RootState } from "@/store/store";
import { useEffect, useState } from "react";
import { HiClipboardCheck, HiDocumentReport, HiTrash, HiPlus, HiAcademicCap, HiClock, HiExclamation, HiFolder } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { AlertLevel } from "@/lib/alertLevel";
import { HiPhoto } from "react-icons/hi2";
import { trpc } from "@/utils/trpc";
import { TRPCClientErrorLike } from "@trpc/client";
import { RouterOutputs } from "@/utils/trpc";
import Button from "@/components/ui/Button";
import CreateClass from "@/components/class/forms/CreateClass";
import JoinClass from "@/components/class/forms/JoinClass";
import OrganizedFiles from "@/components/class/OrganizedFiles";
import Shelf from "@/components/ui/Shelf";
import Tabs from "@/components/ui/Tabs";
import { getContrastingTextColor } from '@/utils/color';
import Card from "@/components/ui/Card";
import { initializeSocket, joinClass } from "@/lib/socket";
import { SkeletonCard } from "@/components/ui/Skeleton";
import IconFrame from "@/components/ui/IconFrame";
import { getAssignmentIcon } from "@/lib/assignment";
import Badge from "@/components/Badge";
import { useRouter } from "next/navigation";

type Class = RouterOutputs['class']['getAll']['teacherInClass'][number];

type Tab = 'teaching' | 'enrolled' | 'files';

type FilterState = {
    search: string;
    subject: 'ALL' | string;
    section: string;
};

// Skeleton component for class cards
const ClassCardSkeleton = () => (
    <Card className="p-0 mx-2">
        <div className="flex flex-col h-full">
            {/* Header skeleton */}
            <div className="px-6 py-6 bg-gray-200 dark:bg-gray-700">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <div className="size-10 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
                        <div>
                            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-2 w-32"></div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                        </div>
                    </div>
                    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                </div>
            </div>
            
            {/* Content skeleton */}
            <div className="flex-1 p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-200 dark:bg-gray-700 rounded-lg">
                        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16 mx-auto"></div>
                    </div>
                    <div className="text-center p-3 bg-gray-200 dark:bg-gray-700 rounded-lg">
                        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20 mx-auto"></div>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    <div className="space-y-2">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                </div>
            </div>
            
            {/* Actions skeleton */}
            <div className="px-6 py-4 border-t border-border bg-gray-100 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                    </div>
                    <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
            </div>
        </div>
    </Card>
);

// Skeleton for the entire classes page
const ClassesPageSkeleton = () => (
    <div className="flex flex-col space-y-4 w-full h-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-40 pt-5">
        {/* Header skeleton */}
        <div className="flex flex-row items-center justify-between w-full">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div className="flex space-x-2">
                <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
            </div>
        </div>

        {/* Tabs skeleton */}
        <div className="flex space-x-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        </div>

        {/* Class cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6 auto-rows-fr">
            {Array.from({ length: 6 }).map((_, index) => (
                <ClassCardSkeleton key={index} />
            ))}
        </div>
    </div>
);

export default function Classes() {
    const dispatch = useDispatch();
    const appState = useSelector((state: RootState) => state.app);
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>('teaching');
    const [filters, setFilters] = useState<FilterState>({
        search: '',
        subject: 'ALL',
        section: ''
    });

    const { data: classes, isLoading, refetch } = trpc.class.getAll.useQuery();

    const { mutate: deleteClass } = trpc.class.delete.useMutation();

    useEffect(() => {
        if (appState.refetch) {
            refetch();
            dispatch(setRefetch(false));
        }
    }, [appState.refetch, refetch, dispatch]);

    // Auto-select non-empty tab when current tab is empty
    useEffect(() => {
        if (classes) {
            const teachingCount = classes.teacherInClass.length;
            const enrolledCount = classes.studentInClass.length;
            
            if (activeTab === 'teaching' && teachingCount === 0 && enrolledCount > 0) {
                setActiveTab('enrolled');
            } else if (activeTab === 'enrolled' && enrolledCount === 0 && teachingCount > 0) {
                setActiveTab('teaching');
            } else if (activeTab === 'files' && teachingCount === 0 && enrolledCount === 0) {
                setActiveTab('teaching');
            }
        }
    }, [classes, activeTab]);

    // Show skeleton loading instead of spinner
    if (isLoading || !classes) {
        return <ClassesPageSkeleton />;
    }

    const renderClassCard = (cls: Class, isTeacher: boolean) => (
        <Card key={cls.id} className="p-0 group hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer w-full h-full flex flex-col">
            <div className="flex flex-col h-full">
                {/* Header with gradient background */}
                <div 
                    className="relative px-6 py-6 text-white overflow-hidden"
                    style={{ 
                        background: `linear-gradient(135deg, ${cls.color ?? '#3B82F6'} 0%, ${cls.color ?? '#3B82F6'}dd 100%)`,
                    }}
                    onClick={() => router.push(`/classes/${cls.id}`)}
                >
                    {/* Decorative background pattern */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
                        <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
                            <div className="w-full h-full border-2 border-white rounded-full"></div>
                        </div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 transform -translate-x-6 translate-y-6">
                            <div className="w-full h-full border border-white rounded-full"></div>
                        </div>
                    </div>
                    
                    {/* Class info */}
                    <div className="relative z-10">
                        <div className="flex items-start space-x-3">
                            <IconFrame 
                                backgroundColor="bg-white/20" 
                                baseColor="text-white"
                                className="size-10"
                            >
                                <HiAcademicCap className="w-5 h-5" />
                            </IconFrame>
                            <div className="truncate">
                                <h3 className="text-xl font-bold text-white leading-tight truncate max-w-[140px]">
                                    {cls.name}
                                </h3>
                                <div className="flex flex-col mt-2 space-y-1">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs text-white/70 font-medium">Section</span>
                                        <span className="text-sm text-white font-semibold truncate">{cls.section}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs text-white/70 font-medium">Subject</span>
                                        <span className="text-sm text-white font-semibold truncate">{cls.subject}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content section */}
                <div className="flex-1 p-4 space-y-4 overflow-hidden">
                    {/* Quick stats
                    <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-2 bg-background-muted rounded-lg">
                            <div className="text-2xl font-bold text-foreground">
                                {cls.dueToday?.length || 0}
                            </div>
                            <div className="text-xs text-foreground-muted font-medium">
                                Due Today
                            </div>
                        </div>
                        <div className="text-center p-2 bg-background-muted rounded-lg">
                            <div className="text-2xl font-bold text-foreground">
                                {cls.assignments?.length || 0}
                            </div>
                            <div className="text-xs text-foreground-muted font-medium">
                                Total Assignments
                            </div>
                        </div>
                    </div> */}

                    {/* Due today assignments */}
                    <div className="overflow-y-auto max-h-24">
                        <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-sm font-semibold text-foreground">Due Today</h4>
                            {cls.dueToday && cls.dueToday.length > 0 && (
                                <Badge variant="primary">
                                    {cls.dueToday.length}
                                </Badge>
                            )}
                        </div>
                        {cls.dueToday && cls.dueToday.length > 0 ? (
                            cls.dueToday.map((assignment, index: number) => (
                                <a 
                                    key={index} 
                                    href={`/classes/${cls.id}/assignment/${assignment.id}`} 
                                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-background-muted transition-colors duration-200 group/item truncate"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {getAssignmentIcon(assignment.type)}
                                    <span className="text-sm text-foreground-secondary group-hover/item:text-foreground transition-colors duration-200 truncate">
                                        {assignment.title}
                                    </span>
                                </a>
                            ))
                        ) : (
                            <div className="flex items-center space-x-2 p-2">
                                <HiClock className="w-4 h-4" />
                                <span className="text-sm font-medium truncate">
                                    No assignments due today
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action buttons */}
                <div className="px-4 py-3 border-t border-border bg-background-muted/50 mt-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Button.SM 
                                href={`/classes/${cls.id}/assignments`}
                            >
                                <HiClipboardCheck className="w-5 h-5 flex-shrink-0" />
                            </Button.SM>
                            <Button.SM 
                                href={`/classes/${cls.id}/grades${isTeacher ? '' : `/${appState.user.id}`}`}
                            >
                                <HiDocumentReport className="w-5 h-5 flex-shrink-0" />
                            </Button.SM>
                        </div>
                        {isTeacher && (
                            <Button.SM 
                                onClick={() => {
                                    deleteClass({ id: cls.id, classId: cls.id }, {
                                        onSuccess: () => {},
                                        onError: (error: TRPCClientErrorLike<any>) => {
                                            dispatch(addAlert({ 
                                                level: AlertLevel.ERROR, 
                                                remark: error.message 
                                            }));
                                        }
                                    });
                                }}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors duration-200"
                            >
                                <HiTrash className="w-4 h-4" />
                            </Button.SM>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );

    return (
        <div className="flex flex-col space-y-4 w-full h-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-40 pt-5">
            <div className="flex flex-row items-center justify-between w-full">
                <h1 className="text-xl font-semibold">Classes</h1>
                <div className="flex space-x-2">
                    <Button.Light 
                        onClick={() => dispatch(openModal({
                            body: <JoinClass onCreate={refetch} />,
                            header: 'Join Class',
                        }))}
                    >
                        Join Class
                    </Button.Light>
                    <Button.Primary 
                        onClick={() => dispatch(openModal({
                            body: <CreateClass onCreate={refetch} />,
                            header: 'Create Class'
                        }))}
                    >
                        Create Class
                    </Button.Primary>
                </div>
            </div>

            <Tabs
                tabs={[
                    { name: 'Teaching', count: classes.teacherInClass.length },
                    { name: 'Enrolled', count: classes.studentInClass.length },
                    { name: 'Files', count: 0 },
                ]}
                activeTab={activeTab === 'teaching' ? 0 : activeTab === 'enrolled' ? 1 : 2}
                onTabChange={(index) => setActiveTab(index === 0 ? 'teaching' : index === 1 ? 'enrolled' : 'files')}
            />

            {activeTab === 'files' ? (
                <div className="flex flex-col space-y-3">
                    {classes.teacherInClass.map(cls => (
                        <Shelf
                            key={cls.id}
                            label={
                                <div className="flex items-center space-x-3">
                                    <div 
                                        className="size-8 rounded-md flex items-center justify-center text-white"
                                        style={{ backgroundColor: cls.color ?? '#3B82F6' }}
                                    >
                                        <HiAcademicCap className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">{cls.name}</div>
                                        <div className="text-sm text-foreground-muted">{cls.subject} • {cls.section}</div>
                                    </div>
                                </div>
                            }
                            content={null}
                        >
                            <OrganizedFiles classId={cls.id} />
                        </Shelf>
                    ))}
                    {classes.studentInClass.map(cls => (
                        <Shelf
                            key={cls.id}
                            label={
                                <div className="flex items-center space-x-3">
                                    <div 
                                        className="size-8 rounded-md flex items-center justify-center text-white"
                                        style={{ backgroundColor: cls.color ?? '#3B82F6' }}
                                    >
                                        <HiAcademicCap className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">{cls.name}</div>
                                        <div className="text-sm text-foreground-muted">{cls.subject} • {cls.section}</div>
                                    </div>
                                </div>
                            }
                            content={null}
                        >
                            <OrganizedFiles classId={cls.id} />
                        </Shelf>
                    ))}
                    {classes.teacherInClass.length === 0 && classes.studentInClass.length === 0 && (
                        <div className="col-span-full flex flex-col space-y-3 pt-12 pb-12 items-center justify-center w-full h-full">
                            <HiPhoto className="size-12 text-foreground-muted" />
                            <span className="text-foreground-muted">You are not in any classes</span>
                        </div>
                    )}
                </div>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6 auto-rows-fr">
                {activeTab === 'teaching' && classes.teacherInClass.map(cls => renderClassCard(cls, true))}
                {activeTab === 'enrolled' && classes.studentInClass.map(cls => renderClassCard(cls, false))}

                {activeTab === 'teaching' && classes.teacherInClass.length === 0 && classes.studentInClass.length === 0 && (
                    <div className="col-span-full flex flex-col space-y-3 pt-12 pb-12 items-center justify-center w-full h-full">
                        <HiPhoto className="size-12 text-foreground-muted" />
                        <span className="text-foreground-muted">You are not teaching any classes</span>
                    </div>
                )}

                {activeTab === 'enrolled' && classes.studentInClass.length === 0 && classes.teacherInClass.length === 0 && (
                    <div className="col-span-full flex flex-col space-y-3 pt-12 pb-12 items-center justify-center w-full h-full">
                        <HiPhoto className="size-12 text-foreground-muted" />
                        <span className="text-foreground-muted">You are not enrolled in any classes</span>
                    </div>
                )}
            </div>
            )}
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { addAlert, openModal } from "@/store/appSlice";
import { AlertLevel } from "@/lib/alertLevel";
import { trpc } from "@/utils/trpc";
import type { RouterOutputs } from "@/utils/trpc";
import { HiDocumentText, HiClipboardCheck, HiClipboardList, HiPencil, HiSave, HiX, HiAcademicCap, HiChartBar, HiClock, HiCheckCircle } from "react-icons/hi";
import { MdAssignment, MdGrade, MdChecklist, MdTrendingUp, MdSchool, MdCalendarToday } from "react-icons/md";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Textbox from "@/components/ui/Textbox";
import { DataTable } from "@/components/ui/DataTable";
import Rubric from "@/components/ui/Rubric";
import GradingBoundaries from "@/components/ui/GradingBoundaries";
import Loading from "@/components/Loading";
import Empty from "@/components/ui/Empty";
import Shelf from "@/components/ui/Shelf";
import Skeleton, { SkeletonText } from "@/components/ui/Skeleton";

type Assignment = RouterOutputs['class']['get']['class']['assignments'][number];
type MarkScheme = RouterOutputs['class']['listMarkSchemes'][number];
type GradingBoundary = RouterOutputs['class']['listGradingBoundaries'][number];

// Skeleton component for statistics cards
const StatisticsCardSkeleton = () => (
    <Card className="p-4">
        <div className="flex items-center justify-between">
            <div>
                <Skeleton width="8rem" height="1rem" className="mb-2" />
                <Skeleton width="3rem" height="2rem" />
            </div>
            <Skeleton width="2.5rem" height="2.5rem" variant="circular" />
        </div>
    </Card>
);

// Skeleton component for the entire syllabus page
const SyllabusPageSkeleton = () => (
    <div className="flex flex-col space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
            <div>
                <Skeleton width="8rem" height="1.5rem" className="mb-2" />
                <Skeleton width="16rem" height="1rem" />
            </div>
            <div className="flex items-center space-x-3">
                <Skeleton width="7rem" height="2.5rem" />
            </div>
        </div>

        {/* Statistics Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatisticsCardSkeleton />
            <StatisticsCardSkeleton />
            <StatisticsCardSkeleton />
            <StatisticsCardSkeleton />
        </div>

        {/* Course Overview skeleton */}
        <Card>
            <Skeleton width="10rem" height="1.5rem" className="mb-6" />
            <div className="space-y-4">
                <SkeletonText lines={4} />
                <Skeleton width="100%" height="2rem" />
                <SkeletonText lines={3} />
            </div>
        </Card>

        {/* Grading Tools skeleton */}
        <Card>
            <div className="flex items-center space-x-2 mb-6">
                <Skeleton width="1.25rem" height="1.25rem" variant="circular" />
                <Skeleton width="12rem" height="1.5rem" />
            </div>
            <div className="space-y-6">
                <div>
                    <div className="flex items-center space-x-2 mb-3">
                        <Skeleton width="1rem" height="1rem" variant="circular" />
                        <Skeleton width="8rem" height="1.25rem" />
                    </div>
                    <div className="space-y-3">
                        <Skeleton width="100%" height="4rem" />
                        <Skeleton width="100%" height="4rem" />
                    </div>
                </div>
            </div>
        </Card>

        {/* Course Information skeleton */}
        <Card>
            <div className="flex items-center space-x-2 mb-6">
                <Skeleton width="1.25rem" height="1.25rem" variant="circular" />
                <Skeleton width="10rem" height="1.5rem" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <Skeleton width="8rem" height="1.25rem" className="mb-4" />
                    <div className="space-y-3">
                        <div className="bg-background-muted p-3 rounded-lg">
                            <Skeleton width="6rem" height="1rem" className="mb-2" />
                            <Skeleton width="10rem" height="1.25rem" />
                        </div>
                        <div className="bg-background-muted p-3 rounded-lg">
                            <Skeleton width="5rem" height="1rem" className="mb-2" />
                            <Skeleton width="8rem" height="1.25rem" />
                        </div>
                        <div className="bg-background-muted p-3 rounded-lg">
                            <Skeleton width="6rem" height="1rem" className="mb-2" />
                            <Skeleton width="8rem" height="1.25rem" />
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <Skeleton width="10rem" height="1.25rem" className="mb-4" />
                    <div className="space-y-3">
                        <div className="bg-background-muted p-3 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Skeleton width="8rem" height="1rem" className="mb-2" />
                                    <Skeleton width="3rem" height="1.5rem" />
                                </div>
                                <Skeleton width="1.5rem" height="1.5rem" variant="circular" />
                            </div>
                        </div>
                        <div className="bg-background-muted p-3 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Skeleton width="10rem" height="1rem" className="mb-2" />
                                    <Skeleton width="3rem" height="1.5rem" />
                                </div>
                                <Skeleton width="1.5rem" height="1.5rem" variant="circular" />
                            </div>
                        </div>
                        <div className="bg-background-muted p-3 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Skeleton width="7rem" height="1rem" className="mb-2" />
                                    <Skeleton width="3rem" height="1.5rem" />
                                </div>
                                <Skeleton width="1.5rem" height="1.5rem" variant="circular" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    </div>
);

export default function SyllabusPage({ params }: { params: { classId: string } }) {
    const dispatch = useDispatch();
    const appState = useSelector((state: RootState) => state.app);

    const [isEditing, setIsEditing] = useState(false);
    const [syllabusContent, setSyllabusContent] = useState("");
    const [originalContent, setOriginalContent] = useState("");

    // TRPC queries
    const { data: classData, isLoading: classLoading } = trpc.class.get.useQuery({ classId: params.classId });
    const { data: syllabusData, isLoading: syllabusLoading } = trpc.class.getSyllabus.useQuery({ classId: params.classId });
    const { data: markschemesData } = trpc.class.listMarkSchemes.useQuery({ classId: params.classId });
    const { data: gradingBoundariesData } = trpc.class.listGradingBoundaries.useQuery({ classId: params.classId });

    // TRPC mutations
    const updateSyllabus = trpc.class.updateSyllabus.useMutation({
        onSuccess: () => {
            dispatch(addAlert({
                level: AlertLevel.SUCCESS,
                remark: "Syllabus updated successfully",
            }));
            setIsEditing(false);
        },
        onError: (error) => {
            dispatch(addAlert({
                level: AlertLevel.ERROR,
                remark: error.message,
            }));
        },
    });

    // Initialize syllabus content
    useEffect(() => {
        if (syllabusData?.syllabus) {
            setSyllabusContent(syllabusData.syllabus);
            setOriginalContent(syllabusData.syllabus);
        }
    }, [syllabusData]);

    const handleSave = () => {
        updateSyllabus.mutate({
            classId: params.classId,
            contents: syllabusContent,
        });
    };

    const handleCancel = () => {
        setSyllabusContent(originalContent);
        setIsEditing(false);
    };

    const handleEdit = () => {
        setOriginalContent(syllabusContent);
        setIsEditing(true);
    };

    // Assignment table columns with improved styling
    const assignmentColumns = [
        {
            header: "Assignment",
            accessor: "title",
            cell: (row: Assignment) => (
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                        <MdAssignment className="w-4 h-4 text-primary-500" />
                    </div>
                    <div>
                        <span className="font-medium text-foreground block">
                            {row.title}
                        </span>
                        <span className="text-xs text-foreground-muted capitalize">
                            {row.type?.toLowerCase().replace('_', ' ') || 'Other'}
                        </span>
                    </div>
                </div>
            )
        },
        {
            header: "Due Date",
            accessor: "dueDate",
            cell: (row: Assignment) => (
                <div className="flex items-center space-x-2">
                    <MdCalendarToday className="w-4 h-4 text-foreground-muted" />
                    <span className="text-sm text-foreground-muted">
                        {row.dueDate ? new Date(row.dueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        }) : 'No due date'}
                    </span>
                </div>
            )
        },
        {
            header: "Points",
            accessor: "maxGrade",
            cell: (row: Assignment) => (
                <div className="text-right">
                    <span className="font-semibold text-foreground">
                        {row.maxGrade ? `${row.maxGrade}` : '—'}
                    </span>
                    {row.maxGrade && <span className="text-xs text-foreground-muted ml-1">pts</span>}
                </div>
            )
        },
        {
            header: "Weight",
            accessor: "weight",
            cell: (row: Assignment) => (
                <span className="text-sm text-foreground-muted font-medium">
                    {row.weight ? `${row.weight}%` : '—'}
                </span>
            )
        },
        {
            header: "Status",
            accessor: "graded",
            cell: (row: Assignment) => (
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${row.graded
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-gray-50 text-gray-600 border border-gray-200'
                    }`}>
                    {row.graded ? (
                        <>
                            <HiCheckCircle className="w-3 h-3 mr-1" />
                            Graded
                        </>
                    ) : (
                        <>
                            <HiClock className="w-3 h-3 mr-1" />
                            Pending
                        </>
                    )}
                </span>
            )
        }
    ];

    // Show skeleton loading instead of spinner
    if (classLoading || syllabusLoading) {
        return <SyllabusPageSkeleton />;
    }

    if (!classData?.class) {
        return (
            <div className="flex items-center justify-center h-full">
                <Empty
                    icon={HiDocumentText}
                    title="Class not found"
                    description="The class you're looking for doesn't exist or you don't have access to it."
                />
            </div>
        );
    }

    const assignments: Assignment[] = classData.class.assignments || [];
    const markschemes: MarkScheme[] = markschemesData || [];
    const gradingBoundaries: GradingBoundary[] = gradingBoundariesData || [];

    // Calculate statistics
    const totalPoints = assignments.reduce((sum, a: Assignment) => sum + (a.maxGrade || 0), 0);
    const completionRate = assignments.length > 0 ? Math.round((assignments.filter((a: Assignment) => a.graded).length / assignments.length) * 100) : 0;
    const upcomingAssignments = assignments.filter((a: Assignment) => a.dueDate && new Date(a.dueDate) > new Date()).length;

    return (
        <div className="flex flex-col space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-semibold text-xl text-foreground">Syllabus</h1>
                    <p className="text-sm text-foreground-muted mt-1">
                        {classData.class.name} • Course overview and academic information
                    </p>
                </div>
                {appState.user.teacher && (
                    <div className="flex items-center space-x-3">
                        {isEditing ? (
                            <>
                                <Button.Primary
                                    onClick={handleSave}
                                    className="flex items-center space-x-2"
                                    disabled={updateSyllabus.isPending}
                                >
                                    <HiSave className="w-4 h-4" />
                                    <span>Save Changes</span>
                                </Button.Primary>
                                <Button.Light
                                    onClick={handleCancel}
                                    className="flex items-center space-x-2"
                                >
                                    <HiX className="w-4 h-4" />
                                    <span>Cancel</span>
                                </Button.Light>
                            </>
                        ) : (
                            <Button.Primary
                                onClick={handleEdit}
                                className="flex items-center space-x-2"
                            >
                                <HiPencil className="w-4 h-4" />
                                <span>Edit Syllabus</span>
                            </Button.Primary>
                        )}
                    </div>
                )}
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-foreground-muted">Total Assignments</p>
                            <p className="text-2xl font-bold text-foreground mt-1">{assignments.length}</p>
                        </div>
                        <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                            <MdAssignment className="w-5 h-5 text-primary-500" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-foreground-muted">Completion Rate</p>
                            <p className="text-2xl font-bold text-foreground mt-1">{completionRate}%</p>
                        </div>
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                            <HiChartBar className="w-5 h-5 text-green-500" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-foreground-muted">Total Points</p>
                            <p className="text-2xl font-bold text-foreground mt-1">{totalPoints}</p>
                        </div>
                        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                            <MdTrendingUp className="w-5 h-5 text-purple-500" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-foreground-muted">Upcoming</p>
                            <p className="text-2xl font-bold text-foreground mt-1">{upcomingAssignments}</p>
                        </div>
                        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                            <HiClock className="w-5 h-5 text-orange-500" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Course Overview */}
            <Card>

                <h2 className="text-lg font-semibold text-foreground">Course Overview</h2>


                {isEditing ? (
                    <div className="space-y-4">
                        <Textbox
                            content={syllabusContent}
                            onChange={setSyllabusContent}
                            placeholder="Enter course overview, objectives, and other important information..."
                            className="min-h-[300px]"
                        />
                        <p className="text-sm text-foreground-muted">
                            Use the rich text editor to format your syllabus content. You can add headings, lists, links, and more.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="richText">
                            {syllabusContent ? (
                                <div dangerouslySetInnerHTML={{ __html: syllabusContent }} />
                            ) : (
                                <Empty
                                    icon={HiDocumentText}
                                    title="No syllabus content yet"
                                    description={appState.user.teacher
                                        ? "Click 'Edit Syllabus' to add course information, learning objectives, policies, and more."
                                        : "The teacher hasn't added syllabus content yet. Check back later for course information."
                                    }
                                />
                            )}
                        </div>

                        {/* Course Assignments - nested inside overview */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-foreground">Course Assignments</h3>
                                {assignments.length > 0 && (
                                    <div className="flex items-center space-x-4">
                                        <div className="text-sm text-foreground-muted">
                                            {assignments.filter(a => a.graded).length} of {assignments.length} graded
                                        </div>
                                        <div className="text-sm text-foreground-muted">
                                            {totalPoints} total points
                                        </div>
                                    </div>
                                )}
                            </div>

                            {assignments.length > 0 ? (
                                <DataTable
                                    columns={assignmentColumns}
                                    data={assignments}
                                    className="overflow-x-auto"
                                />
                            ) : (
                                <Empty
                                    icon={MdAssignment}
                                    title="No assignments yet"
                                    description={appState.user.teacher
                                        ? "Create assignments to see them listed here. Students will be able to view all course assignments in this section."
                                        : "The teacher hasn't created any assignments yet. Check back later for upcoming work."
                                    }
                                />
                            )}
                        </div>
                    </div>
                )}
            </Card>

            {/* Grading Tools */}
            {(markschemes.length > 0 || gradingBoundaries.length > 0) && (
                <Card>
                    <div className="flex items-center space-x-2 mb-6">
                        <MdChecklist className="w-5 h-5 text-primary-500" />
                        <h2 className="text-lg font-semibold text-foreground">Grading Tools & Standards</h2>
                    </div>

                    <div className="space-y-6">
                        {/* Marking Schemes */}
                        {markschemes.length > 0 && (
                            <div>
                                <h3 className="text-md font-medium text-foreground mb-3 flex items-center space-x-2">
                                    <HiClipboardCheck className="w-4 h-4 text-foreground-muted" />
                                    <span>Marking Schemes</span>
                                </h3>
                                <div className="space-y-3">
                                    {markschemes.map((markscheme: MarkScheme) => {
                                        let markschemeName = "Untitled Markscheme";
                                        try {
                                            const parsed = JSON.parse(markscheme.structured);
                                            markschemeName = parsed.name || "Untitled Markscheme";
                                        } catch (error) {
                                            console.error("Error parsing markscheme:", error);
                                        }

                                        return (
                                            <Shelf
                                                key={markscheme.id}
                                                label={markschemeName}
                                                content={
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-xs px-2 py-1 bg-background-muted text-foreground-muted rounded-full font-medium">
                                                            {(() => {
                                                                try {
                                                                    const parsed = JSON.parse(markscheme.structured);
                                                                    return parsed.criteria ? `${parsed.criteria.length} criteria` : 'Legacy format';
                                                                } catch {
                                                                    return 'Invalid format';
                                                                }
                                                            })()}
                                                        </span>
                                                    </div>
                                                }
                                            >
                                                {markscheme.structured && (
                                                    <Rubric
                                                        criteria={(() => {
                                                            try {
                                                                const parsed = JSON.parse(markscheme.structured);
                                                                return parsed.criteria || [];
                                                            } catch {
                                                                return [];
                                                            }
                                                        })()}
                                                        onChange={() => { }}
                                                        readonly={true}
                                                    />
                                                )}
                                            </Shelf>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Grading Boundaries */}
                        {gradingBoundaries.length > 0 && (
                            <div>
                                <h3 className="text-md font-medium text-foreground mb-3 flex items-center space-x-2">
                                    <HiClipboardList className="w-4 h-4 text-foreground-muted" />
                                    <span>Grading Boundaries</span>
                                </h3>
                                <div className="space-y-3">
                                    {gradingBoundaries.map((boundary: GradingBoundary) => {
                                        let boundaryName = "Untitled Grading Boundary";
                                        try {
                                            const parsed = JSON.parse(boundary.structured);
                                            boundaryName = parsed.name || "Untitled Grading Boundary";
                                        } catch (error) {
                                            console.error("Error parsing grading boundary:", error);
                                        }

                                        return (
                                            <Shelf
                                                key={boundary.id}
                                                label={boundaryName}
                                                content={
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-xs px-2 py-1 bg-background-muted text-foreground-muted rounded-full font-medium">
                                                            {(() => {
                                                                try {
                                                                    const parsed = JSON.parse(boundary.structured);
                                                                    return parsed.boundaries ? `${parsed.boundaries.length} boundaries` : 'Legacy format';
                                                                } catch {
                                                                    return 'Invalid format';
                                                                }
                                                            })()}
                                                        </span>
                                                    </div>
                                                }
                                            >
                                                {boundary.structured && (
                                                    <GradingBoundaries
                                                        boundaries={(() => {
                                                            try {
                                                                const parsed = JSON.parse(boundary.structured);
                                                                return parsed.boundaries || [];
                                                            } catch {
                                                                return [];
                                                            }
                                                        })()}
                                                        onChange={() => { }}
                                                        readonly={true}
                                                    />
                                                )}
                                            </Shelf>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {/* Course Information */}
            <Card>
                <div className="flex items-center space-x-2 mb-6">
                    <MdSchool className="w-5 h-5 text-primary-500" />
                    <h2 className="text-lg font-semibold text-foreground">Course Information</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-md font-medium text-foreground border-b border-border pb-2">
                            Basic Information
                        </h3>
                        <div className="space-y-3">
                            <div className="bg-background-muted p-3 rounded-lg">
                                <label className="text-xs font-medium text-foreground-muted uppercase tracking-wide">Class Name</label>
                                <p className="text-foreground font-medium mt-1">{classData.class.name}</p>
                            </div>
                            <div className="bg-background-muted p-3 rounded-lg">
                                <label className="text-xs font-medium text-foreground-muted uppercase tracking-wide">Section</label>
                                <p className="text-foreground mt-1">{classData.class.section || 'Not specified'}</p>
                            </div>
                            <div className="bg-background-muted p-3 rounded-lg">
                                <label className="text-xs font-medium text-foreground-muted uppercase tracking-wide">Subject</label>
                                <p className="text-foreground mt-1">{classData.class.subject || 'Not specified'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="space-y-4">
                        <h3 className="text-md font-medium text-foreground border-b border-border pb-2">
                            Course Statistics
                        </h3>
                        <div className="space-y-3">
                            <div className="bg-background-muted p-3 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="text-xs font-medium text-foreground-muted uppercase tracking-wide">Total Assignments</label>
                                        <p className="text-xl font-bold text-foreground mt-1">{assignments.length}</p>
                                    </div>
                                    <MdAssignment className="w-6 h-6 text-foreground-muted" />
                                </div>
                            </div>
                            <div className="bg-background-muted p-3 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="text-xs font-medium text-foreground-muted uppercase tracking-wide">Graded Assignments</label>
                                        <p className="text-xl font-bold text-foreground mt-1">{assignments.filter(a => a.graded).length}</p>
                                    </div>
                                    <HiCheckCircle className="w-6 h-6 text-foreground-muted" />
                                </div>
                            </div>
                            <div className="bg-background-muted p-3 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="text-xs font-medium text-foreground-muted uppercase tracking-wide">Total Points</label>
                                        <p className="text-xl font-bold text-foreground mt-1">{totalPoints}</p>
                                    </div>
                                    <MdTrendingUp className="w-6 h-6 text-foreground-muted" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}

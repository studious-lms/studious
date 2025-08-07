"use client";

import { AlertLevel } from "@/lib/alertLevel";
import { addAlert, setRefetch } from "@/store/appSlice";
import { RootState } from "@/store/store";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Input from "@/components/ui/Input";
import Empty from "@/components/ui/Empty";
import { MdGrade } from "react-icons/md";
import Loading from "@/components/Loading";
import Button from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { trpc } from "@/utils/trpc";
import type { RouterOutputs } from "@/utils/trpc";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "@studious-lms/server";
import { getSocket, joinClass, leaveClass, emitGradeUpdate } from "@/lib/socket";
import Card from "@/components/ui/Card";
import Skeleton, { SkeletonText, SkeletonTable } from "@/components/ui/Skeleton";

type Grade = RouterOutputs['class']['getGrades']['grades'][number];

// Skeleton component for the grades table
const GradesTableSkeleton = () => (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-4">
                <Skeleton width="25%" height="1rem" />
                <Skeleton width="20%" height="1rem" />
                <Skeleton width="15%" height="1rem" />
                <Skeleton width="15%" height="1rem" />
                <Skeleton width="15%" height="1rem" />
            </div>
        </div>
        
        {/* Rows */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="px-4 py-3">
                    <div className="flex space-x-4">
                        <Skeleton width="25%" height="1rem" />
                        <Skeleton width="20%" height="2rem" />
                        <Skeleton width="15%" height="1rem" />
                        <Skeleton width="15%" height="1rem" />
                        <Skeleton width="15%" height="1rem" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// Skeleton component for the average grade card
const AverageGradeCardSkeleton = () => (
    <Card className="grid grid-cols-[2fr_1fr] gap-4 p-4">
        <Skeleton width="8rem" height="1rem" />
        <Skeleton width="4rem" height="1rem" />
    </Card>
);

// Skeleton for the entire grades page
const GradesPageSkeleton = () => (
    <div className="flex flex-col space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
            <Skeleton width="6rem" height="2rem" />
        </div>

        {/* Grades table skeleton */}
        <GradesTableSkeleton />

        {/* Average grade card skeleton */}
        <AverageGradeCardSkeleton />
    </div>
);

export default function AllGradesPage({ params }: { params: { classId: string, userId: string } }) {
    const appState = useSelector((state: RootState) => state.app);
    const dispatch = useDispatch();
    const [grades, setGrades] = useState<(Grade & { edited?: boolean })[]>([]);
    const [average, setAverage] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    const { data: gradesData, refetch } = trpc.class.getGrades.useQuery({ 
        classId: params.classId,
        userId: params.userId
    });

    useEffect(() => {
        if (gradesData) {
            setGrades(gradesData.grades.map((grade: Grade) => ({...grade, edited: false})));
            setIsLoading(false);
        }
    }, [gradesData]);

    // Socket setup
    useEffect(() => {
        const socket = getSocket();
        
        // Join class room
        joinClass(params.classId);

        // Listen for grade updates
        socket.on('submission-updated', (updatedSubmission: any) => {
            if (updatedSubmission.studentId === params.userId) {
                setGrades(prev => prev.map(grade => 
                    grade.id === updatedSubmission.id 
                        ? { ...grade, gradeReceived: updatedSubmission.gradeReceived, edited: false }
                        : grade
                ));
            }
        });

        // Cleanup
        return () => {
            leaveClass(params.classId);
            socket.off('submission-updated');
        };
    }, [params.classId, params.userId]);

    useEffect(() => {
        if (grades.length === 0) {
            setAverage(0);
            return;
        }

        let totalWeightedGrade = 0;
        let totalWeight = 0;

        grades.forEach(grade => {
            if (grade.gradeReceived != null) {
                totalWeightedGrade += (grade.gradeReceived * grade.assignment.weight) / grade.assignment.maxGrade!;
                totalWeight += grade.assignment.weight;
            }
        });

        setAverage(totalWeight > 0 ? totalWeightedGrade / totalWeight : 0);
    }, [grades]);

    const updateGrade = trpc.class.updateGrade.useMutation({
        onSuccess: () => {
            dispatch(addAlert({
                level: AlertLevel.SUCCESS,
                remark: 'Grades updated successfully'
            }));
            refetch();
        },
        onError: (error: TRPCClientErrorLike<AppRouter>) => {
            dispatch(addAlert({
                level: AlertLevel.ERROR,
                remark: error.message || 'Failed to update grades'
            }));
        }
    });

    const handleGradeChange = (index: number, value: string) => {
        const newGrades = [...grades];
        newGrades[index] = {
            ...newGrades[index],
            gradeReceived: value === '' ? null : Number(value),
            edited: true
        };
        setGrades(newGrades);
    };

    const saveChanges = async () => {
        const editedGrades = grades.filter(grade => grade.edited);
        
        const updatePromises = editedGrades.map(grade => 
            updateGrade.mutateAsync({
                classId: params.classId,
                assignmentId: grade.assignment.id,
                submissionId: grade.id,
                gradeReceived: grade.gradeReceived
            }).then(() => {
                // Emit grade update through socket
                emitGradeUpdate(params.classId, {
                    id: grade.id,
                    studentId: params.userId,
                    gradeReceived: grade.gradeReceived,
                    assignment: grade.assignment
                });
            })
        );

        try {
            await Promise.all(updatePromises);
        } catch (error) {
            // Error handling is done in the mutation callbacks
        }
    };

    // Define columns for DataTable
    const columns = [
        {
            header: "Assignment",
            accessor: "assignmentTitle",
            cell: (row: any) => (
                <span className="font-medium text-foreground-primary overflow-hidden text-ellipsis whitespace-nowrap max-w-[10rem]">
                    {row.assignment.title}
                </span>
            )
        },
        {
            header: "Grade",
            accessor: "gradeReceived",
            cell: (row: any, index: number) => (
                appState.user.teacher ? (
                    <Input.Small
                        type="number"
                        value={row.gradeReceived || ''}
                        onChange={(e) => handleGradeChange(index, e.currentTarget.value)}
                        className="w-full !py-1.5 !px-3"
                        max={row.assignment.maxGrade}
                        min={0}
                    />
                ) : (
                    <span className="text-foreground-primary">
                        {row.gradeReceived ?? 'N/A'}
                    </span>
                )
            )
        },
        {
            header: "Total",
            accessor: "maxGrade",
            cell: (row: any) => (
                <span className="text-foreground-secondary">{row.assignment.maxGrade}</span>
            )
        },
        {
            header: "%",
            accessor: "percentage",
            cell: (row: any) => (
                <span className="text-foreground-secondary">
                    {row.gradeReceived != null 
                        ? `${((row.gradeReceived / row.assignment.maxGrade!) * 100).toFixed(1)}%` 
                        : 'N/A'
                    }
                </span>
            )
        },
        {
            header: "Weight",
            accessor: "weight",
            cell: (row: any) => (
                <span className="text-foreground-secondary">{row.assignment.weight}</span>
            )
        }
    ];

    // Show skeleton loading instead of spinner
    if (isLoading) {
        return <GradesPageSkeleton />;
    }

    return (
        <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="font-semibold text-4xl text-foreground-primary">Grades</h1>
            </div>

            {grades.length > 0 ? (
                <>
                    <DataTable 
                        columns={columns}
                        data={grades}
                        emptyTitle="No Grades"
                        emptyDescription="There are no grades available for this student yet. Grades will appear here once assignments are graded."
                    />

                    {appState.user.teacher && grades.some(grade => grade.edited) && (
                        <div className="flex justify-end">
                            <Button.Primary
                                onClick={saveChanges}
                                isLoading={updateGrade.isPending}
                            >
                                {updateGrade.isPending ? 'Saving...' : 'Save Changes'}
                            </Button.Primary>
                        </div>
                    )}

                    <Card className="grid grid-cols-[2fr_1fr] gap-4 p-4">
                        <span className="font-medium text-foreground-primary">Average Grade</span>
                        <span className="text-foreground-primary font-medium">
                            {(average * 100).toFixed(1)}%
                        </span>
                    </Card>
                </>
            ) : (
                <Empty
                    icon={MdGrade}
                    title="No Grades"
                    description="There are no grades available for this student yet. Grades will appear here once assignments are graded."
                />
            )}
        </div>
    );
}

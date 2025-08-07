"use client";

import Badge from "@/components/Badge";
import FileDownload from "@/components/class/FileDownload";
import FileEdit from "@/components/class/FileEdit";
import Empty from "@/components/ui/Empty";
import Button from "@/components/ui/Button";
import IconFrame from "@/components/ui/IconFrame";
import { AlertLevel } from "@/lib/alertLevel";
import { fileToBase64 } from "@/lib/fileToBase64";
import { addAlert, setRefetch } from "@/store/appSlice";
import { RootState } from "@/store/store";
import { useEffect, useRef, useState } from "react";
import { HiDocument, HiDownload, HiTrash, HiDocumentText, HiAnnotation, HiPaperClip, HiPencil, HiCalendar } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { v4 } from "uuid";
import ProfilePicture from "@/components/ui/ProfilePicture";
import { initializeSocket, joinClass, leaveClass } from "@/lib/socket";
import { trpc } from "@/utils/trpc";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "@studious-lms/server";
import type { inferRouterOutputs } from "@trpc/server";
import Loading from "@/components/Loading";
import Card from "@/components/ui/Card";
import { useRouter } from "next/navigation";
import AttachedEvent from "@/components/class/AttachedEvent";
import GradingInfo from "@/components/class/GradingInfo";
import AttachGradingToAssignment from "@/components/class/forms/AttachGradingToAssignment";
import { openModal } from "@/store/appSlice";
import { MdChecklist, MdSchool } from "react-icons/md";
import { RubricGrade, RubricCriteria } from "@/components/ui/EditableRubric";
import { calculateGrade } from "@/lib/gradeCalculator";
import FileSelector from "@/components/ui/FileSelector";
import { useParams, useRouter as useNextRouter } from "next/navigation";
import { useNavigation, ROUTES } from "@/lib/navigation";
import Skeleton, { SkeletonText } from "@/components/ui/Skeleton";

type RouterOutput = inferRouterOutputs<AppRouter>;
type Assignment = RouterOutput["assignment"]["get"];
type Submission = RouterOutput["assignment"]["getSubmissions"][number];
type Submissions = RouterOutput["assignment"]["getSubmissions"];

interface Attachment {
    id: string;
    name: string;
    type: string;
    thumbnailId?: string | null;
}

type FileData = {
    id: string;
    name: string;
    type: string;
    size: number;
    data: string;
};

// Skeleton component for submission card (teacher view)
const SubmissionCardSkeleton = () => (
    <div className="border border-border dark:border-border-dark rounded-lg p-6">
        <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-4">
                <Skeleton width="2.5rem" height="2.5rem" variant="circular" />
                <div className="flex flex-col flex-1">
                    <Skeleton width="8rem" height="1rem" className="mb-1" />
                    <Skeleton width="6rem" height="0.75rem" />
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                <Skeleton width="3rem" height="1.5rem" />
                <Skeleton width="4rem" height="1.5rem" />
                <Skeleton width="3.5rem" height="1.5rem" />
            </div>
        </div>
    </div>
);

// Skeleton component for file attachment
const FileAttachmentSkeleton = () => (
    <div className="flex flex-col rounded-md border border-border-secondary">
        <div className="bg-gray-200 dark:bg-gray-700 h-20 rounded-t-md"></div>
        <div className="py-2 px-3 flex flex-col space-y-2">
            <div className="flex flex-row space-x-2 items-center">
                <Skeleton width="8rem" height="1rem" />
                <Skeleton width="2rem" height="2rem" />
            </div>
            <Skeleton width="6rem" height="0.75rem" />
        </div>
    </div>
);

// Skeleton component for the entire assignment page
const AssignmentPageSkeleton = () => (
    <div>
        <div className="flex flex-col space-y-9 w-full">
            <div className="rounded-lg flex flex-col space-y-4 lg:flex-row lg:space-x-4 lg:space-y-0 justify-between">
                <div className="flex flex-col space-y-4 w-full">
                    <Card className="flex flex-col space-y-4 w-full">
                        {/* Assignment header skeleton */}
                        <div className="flex items-center justify-between">
                            <Skeleton width="12rem" height="1.5rem" />
                            <Skeleton width="2.5rem" height="2.5rem" />
                        </div>
                        
                        {/* Assignment details skeleton */}
                        <div className="flex flex-col justify-center space-y-2">
                            <Skeleton width="8rem" height="1rem" />
                            <Skeleton width="6rem" height="1rem" />
                        </div>

                        {/* Instructions skeleton */}
                        <div className="flex flex-row justify-between space-x-5">
                            <SkeletonText lines={3} />
                        </div>

                        {/* Attachments skeleton */}
                        <div className="flex flex-col space-y-4 w-full">
                            <div className="flex flex-row border-t border-border-secondary pt-4">
                                <FileAttachmentSkeleton />
                                <FileAttachmentSkeleton />
                            </div>
                            
                            {/* Grading tools skeleton */}
                            <div className="border-t border-border-secondary pt-4 w-full">
                                <div className="flex items-center justify-between mb-3">
                                    <Skeleton width="6rem" height="1rem" />
                                    <Skeleton width="5rem" height="2rem" />
                                </div>
                                <div className="space-y-3">
                                    <Skeleton width="100%" height="4rem" />
                                    <Skeleton width="100%" height="4rem" />
                                </div>
                            </div>
                        </div>

                        {/* Submissions skeleton (teacher view) */}
                        <div className="flex flex-col space-y-3">
                            <Skeleton width="6rem" height="1rem" />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <SubmissionCardSkeleton />
                                <SubmissionCardSkeleton />
                                <SubmissionCardSkeleton />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Sidebar skeleton */}
                <div className="min-w-[18rem] flex flex-col space-y-4">
                    <Card className="shrink-0 grow-0 flex flex-col justify-between">
                        <div className="flex flex-col space-y-2">
                            <Skeleton width="6rem" height="1.5rem" className="mb-2" />
                            <div className="space-y-3">
                                <FileAttachmentSkeleton />
                                <FileAttachmentSkeleton />
                            </div>
                        </div>
                        <div className="mt-4">
                            <Skeleton width="100%" height="8rem" />
                        </div>
                    </Card>
                    
                    <Card>
                        <div className="flex items-center justify-between mb-3">
                            <Skeleton width="6rem" height="1rem" />
                            <Skeleton width="5rem" height="2rem" />
                        </div>
                        <div className="space-y-3">
                            <Skeleton width="100%" height="4rem" />
                            <Skeleton width="100%" height="4rem" />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    </div>
);

export default function AssignmentPage({ params }: { params: { classId: string, assignmentId: string } }) {
    const dispatch = useDispatch();
    const fileInput = useRef<HTMLInputElement | null>(null);
    const assignmentFileInput = useRef<HTMLInputElement | null>(null);
    const appState = useSelector((state: RootState) => state.app);
    const router = useNextRouter();
    const navigation = useNavigation();
    const [isSavingAssignment, setIsSavingAssignment] = useState(false);
    const [rubricCriteria, setRubricCriteria] = useState<RubricCriteria[]>([]);
    const [rubricGrades, setRubricGrades] = useState<RubricGrade[]>([]);

    // Get assignment data
    const { data: assignmentData, refetch: refetchAssignment } = trpc.assignment.get.useQuery({
        id: params.assignmentId,
        classId: params.classId,
    });

    // Get submissions data (for teachers)
    const { data: submissionsData } = trpc.assignment.getSubmissions.useQuery({
        assignmentId: params.assignmentId,
        classId: params.classId,
    }, {
        enabled: !!appState.user.teacher,
    });

    // Get submission data (for students)
    const { data: submissionData, refetch: refetchSubmission } = trpc.assignment.getSubmission.useQuery({
        assignmentId: params.assignmentId,
        classId: params.classId,
    }, {
        enabled: !!appState.user.student,
    });

    // Update submission mutation
    const updateSubmission = trpc.assignment.updateSubmission.useMutation({
        onSuccess: () => {
            dispatch(addAlert({
                level: AlertLevel.SUCCESS,
                remark: "Submission updated successfully",
            }));
            refetchSubmission();
        },
        onError: (error: TRPCClientErrorLike<AppRouter>) => {
            dispatch(addAlert({
                level: AlertLevel.ERROR,
                remark: error.message,
            }));
        },
    });

    // Update assignment mutation (for teacher file attachments)
    const updateAssignment = trpc.assignment.update.useMutation({
        onSuccess: () => {
            dispatch(addAlert({
                level: AlertLevel.SUCCESS,
                remark: "Assignment updated successfully",
            }));
            refetchAssignment();
            setIsSavingAssignment(false);
        },
        onError: (error: TRPCClientErrorLike<AppRouter>) => {
            dispatch(addAlert({
                level: AlertLevel.ERROR,
                remark: error.message || 'Failed to update assignment',
            }));
            setIsSavingAssignment(false);
        },
    });

    // Socket connection and event handling
    useEffect(() => {
        const socket = initializeSocket();

        // Join the class room
        joinClass(params.classId);

        // Handle submission updates
        socket.on('submission-updated', (updatedSubmission: Submission, ack) => {
            if (appState.user.teacher) {
                // Update the submissions list for teachers
                refetchSubmission();
            } else {
                // Update the student's submission
                refetchSubmission();
            }
            if (ack) ack();
        });

        // Cleanup on unmount
        return () => {
            leaveClass(params.classId);
            socket.off('submission-updated');
        };
    }, [params.classId, appState.user.teacher]);

    // Parse rubric data when assignment loads
    useEffect(() => {
        if (assignmentData?.markScheme) {
            try {
                const parsed = JSON.parse(assignmentData.markScheme.structured);
                if (parsed.criteria) {
                    setRubricCriteria(parsed.criteria);
                }
            } catch (error) {
                console.error("Error parsing rubric:", error);
            }
        }
    }, [assignmentData?.markScheme]);

    // Parse rubric grades when submission loads
    useEffect(() => {
        if (submissionData?.rubricState) {
            try {
                const existingGrades = JSON.parse(submissionData.rubricState);
                setRubricGrades(existingGrades);
            } catch (error) {
                console.error("Error parsing rubric grades:", error);
            }
        }
    }, [submissionData?.rubricState]);

    if (!assignmentData || (!submissionsData && !submissionData)) return <AssignmentPageSkeleton />;

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0] || !submissionData?.id) return;
        try {
            const base64 = await fileToBase64(e.target.files[0]);
            const file = e.target.files[0];

            updateSubmission.mutate({
                assignmentId: params.assignmentId,
                classId: params.classId,
                submissionId: submissionData.id,
                newAttachments: [{
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: base64,
                }],
            });

            e.target.files = null;
            e.target.value = '';
        } catch (error) {
            dispatch(addAlert({
                level: AlertLevel.ERROR,
                remark: "Failed to upload file",
            }));
        }
    };

    const handleAssignmentFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        try {
            const base64 = await fileToBase64(e.target.files[0]);
            const file = e.target.files[0];

            setIsSavingAssignment(true);
            updateAssignment.mutate({
                classId: params.classId,
                id: params.assignmentId,
                files: [{
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: base64,
                }],
            });

            e.target.files = null;
            e.target.value = '';
        } catch (error) {
            dispatch(addAlert({
                level: AlertLevel.ERROR,
                remark: "Failed to upload file",
            }));
        }
    };

    const handleSubmit = () => {
        if (!submissionData?.id) return;
        updateSubmission.mutate({
            assignmentId: params.assignmentId,
            classId: params.classId,
            submissionId: submissionData.id,
            submit: true,
        });
    };

    const handleUnsubmit = () => {
        if (!submissionData?.id) return;
        updateSubmission.mutate({
            assignmentId: params.assignmentId,
            classId: params.classId,
            submissionId: submissionData.id,
            submit: false,
        });
    };

    const handleAttachGrading = () => {
        dispatch(openModal({
            header: 'Attach Grading Tools',
            body: (
                <AttachGradingToAssignment
                    classId={params.classId}
                    assignmentId={params.assignmentId}
                    currentMarkSchemeId={assignmentData?.markScheme?.id || null}
                    currentGradingBoundaryId={assignmentData?.gradingBoundary?.id || null}
                    onSuccess={refetchAssignment}
                />
            )
        }));
    };

    return (
        <div>
            <div className="flex flex-col space-y-9 w-full">
                <div className="rounded-lg flex flex-col space-y-4 lg:flex-row lg:space-x-4 lg:space-y-0 justify-between">
                    <div className="flex flex-col space-y-4 w-full">
                        <Card className="flex flex-col space-y-4 w-full">
                            <div className="flex items-center justify-between">
                                <span className="text-xl font-semibold">{assignmentData.title}</span>
                                {appState.user.teacher && (
                                    <Button.SM onClick={() => navigation.push(ROUTES.ASSIGNMENT_EDIT(params.classId, params.assignmentId))}>
                                        <HiPencil className="w-4 h-4" />
                                    </Button.SM>
                                )}
                            </div>
                            <div className="flex flex-col justify-center space-y-2">
                                <span className="font-bold text-foreground-subtle">
                                    {assignmentData.graded ? `Graded • /${assignmentData.maxGrade}` : 'Not Graded'}
                                </span>

                                <span className="text-foreground-muted text-nowrap">
                                    {assignmentData.dueDate ? assignmentData.dueDate.toString().slice(0, 10) : 'No due date'}
                                </span>
                            </div>

                            <div className="flex flex-row justify-between space-x-5">
                                <span className="flex-shrink">{assignmentData.instructions}</span>
                            </div>

                            {!appState.user.teacher && assignmentData.attachments.length > 0 && <div className="flex flex-col space-y-4 w-full">
                                <div className="flex flex-row border-t border-border-secondary pt-4">
                                    {assignmentData.attachments.map((attachment: Attachment) => (
                                        <div className="flex flex-col rounded-md border border-border-secondary hover:bg-background-subtle transition-colors" key={attachment.id}>
                                            {/* preview */}
                                            <div className="bg-primary-500 h-20 rounded-t-md"></div>
                                            <div className="py-2 px-3 flex flex-col space-y-2">
                                                <div className="flex flex-row space-x-2 items-center">
                                                    <span className="font-bold">{attachment.name.slice(0, 15)}...</span>
                                                    <Button.SM><HiDownload /></Button.SM>
                                                </div>
                                                <span className="text-muted">{attachment.type.slice(0, 15)}...</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Show grading information if any */}
                                <div className="border-t border-border-secondary pt-4 w-full">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-semibold text-foreground-secondary">Grading Tools</span>
                                        {appState.user.teacher && (
                                            <Button.Primary onClick={handleAttachGrading} className="flex items-center gap-2">
                                                <MdChecklist className="w-4 h-4" />
                                                Attach
                                            </Button.Primary>
                                        )}
                                    </div>
                                    {(assignmentData.markScheme || assignmentData.gradingBoundary) ? (
                                        <GradingInfo
                                            markScheme={assignmentData.markScheme}
                                            gradingBoundary={assignmentData.gradingBoundary}
                                            readonly={true}
                                        />
                                    ) : (
                                        <Empty
                                            icon={MdChecklist}
                                            title="No Grading Tools"
                                            description="No markscheme or grading boundary has been attached to this assignment."
                                        />
                                    )}
                                </div>
                            </div>}


                            {/* Show attached event if any */}
                            {assignmentData.eventAttached && (
                                <div className="border-t border-border-secondary pt-4">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <span className="text-sm font-semibold text-foreground-secondary">Attached Event</span>
                                    </div>
                                    <AttachedEvent
                                        assignmentId={params.assignmentId}
                                        event={assignmentData.eventAttached}
                                        classId={assignmentData.classId}
                                        isTeacher={appState.user.teacher}
                                        onEventDetached={() => {
                                            // Refetch assignment data to update the UI
                                            refetchAssignment();
                                        }}
                                    />
                                </div>
                            )}
                            {/* Show submissions for teachers */}
                            {appState.user.teacher && (
                                <>
                                    <div className="flex flex-col space-y-3">
                                        <span className="text-sm font-semibold">Submissions</span>
                                        {(!submissionsData || submissionsData.length === 0) && (
                                            <Empty
                                                icon={HiDocumentText}
                                                title="No Submissions"
                                                description="Student has not submitted their work yet."
                                            />
                                        )}
                                        {submissionsData && submissionsData.length > 0 && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {submissionsData.map((submission: Submission) => (
                                                    <div key={submission.id} className="border border-border dark:border-border-dark rounded-lg p-6 hover:bg-background-subtle transition-colors" onClick={() => navigation.push(ROUTES.ASSIGNMENT_SUBMISSION(params.classId, params.assignmentId, submission.id))}>
                                                        <div className="flex flex-col space-y-4">
                                                            <div className="flex items-center space-x-4">
                                                                <ProfilePicture
                                                                    username={submission.student.username}
                                                                    size="md"
                                                                    showName={false}
                                                                />
                                                                <div className="flex flex-col flex-1">
                                                                    <span className="font-semibold text-foreground">
                                                                        {submission.student.username}
                                                                    </span>
                                                                    <span className="text-foreground-muted text-xs">
                                                                        {submission.attachments.length} {submission.attachments.length === 1 ? 'attachment' : 'attachments'}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-wrap gap-2">
                                                                {submission.late && <Badge variant="warning">Late</Badge>}
                                                                {submission.submitted && !submission.returned && <Badge variant="success">Submitted</Badge>}
                                                                {submission.returned && <Badge variant="primary">Returned</Badge>}
                                                                {!submission.submitted && !submission.returned && <Badge variant="error">Missing</Badge>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                        </Card>
                        {/* Show teacher feedback if teacher has returned assignment */}
                        {appState.user.student && submissionData?.returned && (
                            <Card className="flex flex-col space-y-3">
                                <span className="text-lg font-semibold">Feedback</span>
                                
                                {/* Regular Grade Display */}
                                {assignmentData.graded && rubricGrades.length === 0 && (
                                    <div className="flex flex-row space-x-3">
                                        <span className="font-bold">Grade received:</span>
                                        <span>
                                            {submissionData.gradeReceived} / {assignmentData.maxGrade}
                                            {submissionData.assignment.gradingBoundary && submissionData.gradeReceived && assignmentData.maxGrade && assignmentData.gradingBoundary?.structured && (
                                                <span className="text-sm font-medium text-foreground-muted ml-2 px-2 py-1 rounded-md" style={{
                                                    backgroundColor: calculateGrade((submissionData.gradeReceived / assignmentData.maxGrade) * 100, JSON.parse(submissionData.assignment.gradingBoundary.structured).boundaries)?.color || '#e5e7eb',
                                                    color: calculateGrade((submissionData.gradeReceived / assignmentData.maxGrade) * 100, JSON.parse(submissionData.assignment.gradingBoundary.structured).boundaries)?.color ? '#ffffff' : '#374151'
                                                }}>
                                                    {calculateGrade((submissionData.gradeReceived / assignmentData.maxGrade) * 100, JSON.parse(submissionData.assignment.gradingBoundary.structured).boundaries)?.grade || 'N/A'}
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                )}
                                
                                {/* Rubric Feedback */}
                                {rubricGrades.length > 0 && (
                                    <div className="pt-4">
                                        <div className="mb-3">
                                            <span className="text-sm font-semibold text-foreground-secondary">Rubric Feedback</span>
                                        </div>
                                        <div className="space-y-4">
                                            {rubricCriteria.map((criterion) => {
                                                const grade = rubricGrades.find(g => g.criteriaId === criterion.id);
                                                const selectedLevel = criterion.levels.find(l => l.id === grade?.selectedLevelId);
                                                
                                                return (
                                                    <Card key={criterion.id}>
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="flex-1">
                                                                <h4 className="font-bold mb-1">
                                                                    {criterion.title}
                                                                </h4>
                                                                {criterion.description && (
                                                                    <p className="text-sm text-foreground-muted">
                                                                        {criterion.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-medium text-foreground-muted">
                                                                    {grade?.points || 0} pts
                                                                </span>
                                                                {selectedLevel && (
                                                                    <span 
                                                                        className="px-2 py-1 rounded text-xs font-medium"
                                                                        style={{
                                                                            backgroundColor: selectedLevel.color || '#e5e7eb',
                                                                            color: selectedLevel.color ? '#ffffff' : '#374151'
                                                                        }}
                                                                    >
                                                                        {selectedLevel.name}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        {grade?.comments && (
                                                            <div className="p-3 bg-background-muted dark:bg-background-subtle rounded border border-border dark:border-border-dark">
                                                                <div className="text-sm font-medium text-foreground mb-1">
                                                                    Teacher Comments:
                                                                </div>
                                                                <div className="text-sm text-foreground">
                                                                    {grade.comments}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                        
                                        {/* Summary */}
                                        <Card className="mt-4 p-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-foreground-muted">Total Score</span>
                                                <span className="text-lg font-semibold text-foreground">
                                                                                                        {rubricGrades.reduce((sum, grade) => sum + grade.points, 0)} / {rubricCriteria.reduce((sum, criterion) => {
                                                        const maxPoints = Math.max(...criterion.levels.map(level => level.points));
                                                        return sum + maxPoints;
                                                    }, 0)} points
                                                    {submissionData.assignment.gradingBoundary && submissionData.gradeReceived && assignmentData.maxGrade && (
                                                        <span className="text-sm font-medium text-foreground-muted ml-2 px-2 py-1 rounded-md" style={{
                                                            backgroundColor: calculateGrade((submissionData.gradeReceived / assignmentData.maxGrade) * 100, JSON.parse(submissionData.assignment.gradingBoundary.structured).boundaries)?.color || '#e5e7eb',
                                                            color: calculateGrade((submissionData.gradeReceived / assignmentData.maxGrade) * 100, JSON.parse(submissionData.assignment.gradingBoundary.structured).boundaries)?.color ? '#ffffff' : '#374151'
                                                        }}>
                                                            {
                                                                calculateGrade((submissionData.gradeReceived / assignmentData.maxGrade) * 100, JSON.parse(submissionData.assignment.gradingBoundary.structured).boundaries)?.grade || 'N/A'
                                                            }
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </Card>
                                    </div>
                                )}
                                
                                <div className="flex flex-col space-y-7">
                                    {submissionData.annotations.length === 0 && (
                                        <Empty
                                            icon={HiAnnotation}
                                            title="No Feedback"
                                            description="No feedback has been provided yet."
                                        />
                                    )}
                                    {submissionData.annotations.map((annotation: Attachment) => (
                                        <FileDownload
                                            key={annotation.id}
                                            src={annotation.id}
                                            name={annotation.name}
                                            type={annotation.type}
                                            thumbnailId={annotation.thumbnailId}
                                        />
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Show attachments (for teacher) */}
                    {appState.user.teacher && <div className="min-w-[18rem] flex flex-col space-y-4">
                    <Card className="shrink-0 grow-0 flex flex-col justify-between">
                        <div className="flex flex-col space-y-2">
                            <div className="text-lg font-semibold mb-2">Attachments</div>
                            {assignmentData.attachments.length === 0 && (
                                <Empty
                                    icon={HiPaperClip}
                                    title="No Attachments"
                                    description="No files have been attached to this assignment."
                                />
                            )}
                            {assignmentData.attachments.map((attachment: Attachment) => (
                                <FileDownload
                                    key={attachment.id}
                                    src={attachment.id}
                                    name={attachment.name}
                                    type={attachment.type}
                                    thumbnailId={attachment.thumbnailId}
                                />
                            ))}
                        </div>
                        <div className="mt-4">
                            <FileSelector
                                classId={params.classId}
                                onFilesSelected={(files) => {
                                    const newFiles = files.map(file => ({
                                        name: file.name,
                                        type: file.type,
                                        size: file.size,
                                        data: file.data || '',
                                    }));
                                    
                                    // Upload new files
                                    if (newFiles.length > 0) {
                                        setIsSavingAssignment(true);
                                        updateAssignment.mutate({
                                            classId: params.classId,
                                            id: params.assignmentId,
                                            files: newFiles,
                                        });
                                    }
                                }}
                                selectedFiles={[]}
                                accept="*/*"
                                multiple={true}
                                maxSize={50 * 1024 * 1024} // 50MB
                                maxFiles={20}
                                showPreview={true}
                            />
                        </div>
                    </Card>
                                                {/* Show grading information if any */}
                            <Card>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-semibold text-foreground-secondary">Grading Tools</span>
                                    {appState.user.teacher && (
                                        <Button.Primary onClick={handleAttachGrading} className="flex items-center gap-2">
                                            <MdChecklist className="w-4 h-4" />
                                            Attach
                                        </Button.Primary>
                                    )}
                                </div>
                                {(assignmentData.markScheme || assignmentData.gradingBoundary) ? (
                                    <GradingInfo
                                        markScheme={assignmentData.markScheme}
                                        gradingBoundary={assignmentData.gradingBoundary}
                                        readonly={true}
                                    />
                                ) : (
                                    <Empty
                                        icon={MdChecklist}
                                        title="No Grading Tools"
                                        description="No markscheme or grading boundary has been attached to this assignment."
                                    />
                                )}
                            </Card>
                    </div>}
                    {/* show submission (student) */}
                    {!appState.user.teacher && <Card className="min-w-[18rem] shrink-0 grow-0">
                        {appState.user.student && submissionData && (
                            <div className="flex flex-col justify-between space-y-3 h-full">
                                <div className="space-y-3">
                                    <span className="text-lg font-semibold">Submission</span>
                                    {submissionData.attachments.length === 0 && (
                                        <Empty
                                            icon={HiPaperClip}
                                            title="No Attachments"
                                            description="No files have been attached to this submission."
                                        />
                                    )}
                                    {submissionData.attachments.length > 0 && (
                                        <div className="flex flex-col space-y-7">
                                            {submissionData.attachments.map((attachment: Attachment) => (
                                                submissionData.submitted ? (
                                                    <FileDownload
                                                        key={attachment.id}
                                                        src={attachment.id}
                                                        name={attachment.name}
                                                        type={attachment.type}
                                                        thumbnailId={attachment.thumbnailId}
                                                    />
                                                ) : (
                                                    <FileEdit
                                                        key={attachment.id}
                                                        src={attachment.id}
                                                        name={attachment.name}
                                                        type={attachment.type}
                                                        thumbnailId={attachment.thumbnailId}
                                                        onDelete={() => {
                                                            updateSubmission.mutate({
                                                                assignmentId: params.assignmentId,
                                                                classId: params.classId,
                                                                submissionId: submissionData?.id,
                                                                removedAttachments: [attachment.id],
                                                            });
                                                        }}
                                                    />
                                                )
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    {!submissionData.submitted && (
                                        <FileSelector
                                            classId={params.classId}
                                            onFilesSelected={(files) => {
                                                const newFiles = files.map(file => ({
                                                    name: file.name,
                                                    type: file.type,
                                                    size: file.size,
                                                    data: file.data || '',
                                                }));
                                                
                                                // Separate new files from existing files
                                                const uploadFiles = newFiles.filter(file => !file.id);
                                                // const existingFileIds = newFiles.filter(file => file.id).map(file => file.id!);
                                                const existingFileIds = newFiles.filter(file => file.id).map(file => file.id!);
                                                
                                                if (uploadFiles.length > 0 || existingFileIds.length > 0) {
                                                    updateSubmission.mutate({
                                                        assignmentId: params.assignmentId,
                                                        classId: params.classId,
                                                        submissionId: submissionData.id,
                                                        newAttachments: uploadFiles,
                                                        existingFileIds: existingFileIds.length > 0 ? existingFileIds : undefined,
                                                    });
                                                }
                                            }}
                                            selectedFiles={[]}
                                            accept="*/*"
                                            multiple={true}
                                            maxSize={50 * 1024 * 1024} // 50MB
                                            maxFiles={20}
                                            showPreview={true}
                                        />
                                    )}
                                    
                                    <div className="flex flex-row justify-end space-x-2">
                                        {!submissionData.submitted ? (
                                            <Button.Primary onClick={handleSubmit}>
                                                Submit
                                            </Button.Primary>
                                        ) : (
                                            <div className="flex flex-row items-center space-x-3">
                                                <Button.Primary onClick={handleUnsubmit}>
                                                    Unsubmit
                                                </Button.Primary>
                                                <span className="text-foreground-muted">Submitted</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                    }
                </div>
            </div>
        </div>
    );
}
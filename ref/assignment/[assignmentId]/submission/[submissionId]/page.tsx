"use client";

import Badge from "@/components/Badge";
import Empty from "@/components/ui/Empty";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import ProfilePicture from "@/components/ui/ProfilePicture";
import { AlertLevel } from "@/lib/alertLevel";
import { fileToBase64 } from "@/lib/fileToBase64";
import { addAlert, setRefetch } from "@/store/appSlice";
import { RootState } from "@/store/store";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { HiPaperClip, HiAnnotation, HiDocumentText } from "react-icons/hi";
import { trpc } from "@/utils/trpc";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { RouterOutputs } from "@/utils/trpc";
import Loading from "@/components/Loading";
import GradingInfo from "@/components/class/GradingInfo";
import EditableRubric, { RubricGrade, RubricCriteria } from "@/components/ui/EditableRubric";
import FileSelector from "@/components/ui/FileSelector";
import FileDisplay from "@/components/class/FileDisplay";

type Submission = RouterOutputs["assignment"]["getSubmissionById"];

export default function SubmissionPage({ params }: { params: { classId: string, assignmentId: string, submissionId: string } }) {
    const dispatch = useDispatch();
    const fileInput = useRef<HTMLInputElement>(null);
    const appState = useSelector((state: RootState) => state.app);
    const [rubricCriteria, setRubricCriteria] = useState<RubricCriteria[]>([]);
    const [rubricGrades, setRubricGrades] = useState<RubricGrade[]>([]);

    // Get submission data
    const { data: submissionData, refetch: refetchSubmission } = trpc.assignment.getSubmissionById.useQuery({
        submissionId: params.submissionId,
        classId: params.classId,
    });

    // Update submission mutation
    const updateSubmission = trpc.assignment.updateSubmissionAsTeacher.useMutation({
        onSuccess: () => {
            dispatch(addAlert({
                level: AlertLevel.SUCCESS,
                remark: "Submission updated successfully",
            }));
            refetchSubmission();
        },
        onError: (error: any) => {
            dispatch(addAlert({
                level: AlertLevel.ERROR,
                remark: error.message,
            }));
        },
    });

    // Update submission as teacher mutation
    const updateSubmissionAsTeacher = trpc.assignment.updateSubmissionAsTeacher.useMutation({
        onSuccess: () => {
            refetchSubmission();
        },
        onError: (error: any) => {
            dispatch(addAlert({
                level: AlertLevel.ERROR,
                remark: error.message,
            }));
        },
    });

    useEffect(() => {
        if (appState.refetch) {
            refetchSubmission();
            dispatch(setRefetch(false));
        }
    }, [appState.refetch]);

    // Parse rubric data when submission loads
    useEffect(() => {
        if (submissionData?.assignment.markScheme) {
            try {
                const parsed = JSON.parse(submissionData.assignment.markScheme.structured);
                if (parsed.criteria) {
                    setRubricCriteria(parsed.criteria);
                    
                    // Load existing rubric grades if available
                    if (submissionData.rubricState) {
                        try {
                            const existingGrades = JSON.parse(submissionData.rubricState);
                            setRubricGrades(existingGrades);
                        } catch (error) {
                            console.error("Error parsing existing rubric grades:", error);
                            // Fallback to initial grades
                            const initialGrades: RubricGrade[] = parsed.criteria.map((criterion: RubricCriteria) => ({
                                criteriaId: criterion.id,
                                selectedLevelId: criterion.levels[0]?.id || '',
                                points: criterion.levels[0]?.points || 0,
                                comments: ''
                            }));
                            setRubricGrades(initialGrades);
                        }
                    } else if (rubricGrades.length === 0) {
                        // Initialize grades if not already set
                        const initialGrades: RubricGrade[] = parsed.criteria.map((criterion: RubricCriteria) => ({
                            criteriaId: criterion.id,
                            selectedLevelId: criterion.levels[0]?.id || '',
                            points: criterion.levels[0]?.points || 0,
                            comments: ''
                        }));
                        setRubricGrades(initialGrades);
                    }
                }
            } catch (error) {
                console.error("Error parsing rubric:", error);
            }
        }
    }, [submissionData?.assignment.markScheme, submissionData?.rubricState, rubricGrades.length]);

    if (!submissionData) return <Loading />;

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        try {
            const base64 = await fileToBase64(e.target.files[0]);
            const file = e.target.files[0];
            
            if (submissionData.returned) {
                // Teacher adding annotations
                updateSubmissionAsTeacher.mutate({
                    assignmentId: params.assignmentId,
                    classId: params.classId,
                    submissionId: params.submissionId,
                    newAttachments: [{
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: base64,
                    }],
                });
            } else {
                // Student adding attachments
                updateSubmission.mutate({
                    assignmentId: params.assignmentId,
                    classId: params.classId,
                    submissionId: params.submissionId,
                    newAttachments: [{
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: base64,
                    }],
                });
            }

            e.target.files = null;
            e.target.value = '';
        } catch (error) {
            dispatch(addAlert({
                level: AlertLevel.ERROR,
                remark: "Failed to upload file",
            }));
        }
    };

    const handleReturnToggle = () => {
        updateSubmissionAsTeacher.mutate({
            assignmentId: params.assignmentId,
            classId: params.classId,
            submissionId: params.submissionId,
            return: !submissionData.returned,
        });
    };

    const handleGradeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const maxGrade = submissionData.assignment.maxGrade ?? 0;
        const newGrade = !e.currentTarget.value || parseInt(e.currentTarget.value) < maxGrade 
            ? parseInt(e.currentTarget.value) 
            : maxGrade;

        updateSubmissionAsTeacher.mutate({
            assignmentId: params.assignmentId,
            classId: params.classId,
            submissionId: params.submissionId,
            gradeReceived: newGrade,
        });
    };

    const handleAnnotationDelete = (annotationId: string) => {
        updateSubmissionAsTeacher.mutate({
            assignmentId: params.assignmentId,
            classId: params.classId,
            submissionId: params.submissionId,
            removedAttachments: [annotationId],
        });
    };

    const handleRubricGradesChange = (grades: RubricGrade[]) => {
        setRubricGrades(grades);
        
        // Calculate total grade from rubric
        const totalGrade = grades.reduce((sum, grade) => sum + grade.points, 0);
        
        // Update submission with new grade
        updateSubmissionAsTeacher.mutate({
            assignmentId: params.assignmentId,
            classId: params.classId,
            submissionId: params.submissionId,
            gradeReceived: totalGrade,
            rubricGrades: grades, // This will need to be added to the tRPC procedure
        });
    };

    return (
        <div>
            <div className="w-full">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <Card className="flex flex-col space-y-4 w-full xl:col-span-2">
                        <div className="flex items-center space-x-4">
                            <ProfilePicture 
                                username={submissionData.student.username} 
                                size="lg" 
                                showName={false}
                            />
                            <div className="flex flex-col flex-1">
                                <span className="text-xl font-semibold">
                                    Submission from {submissionData.student.username}
                                </span>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {submissionData.late && <Badge variant="warning">Late</Badge>}
                                    {submissionData.submitted && !submissionData.returned && <Badge variant="success">Submitted</Badge>}
                                    {submissionData.returned && <Badge variant="primary">Returned</Badge>}
                                    {!submissionData.submitted && !submissionData.returned && <Badge variant="error">Missing</Badge>}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col space-y-6">
                            <span className="text-lg font-semibold">Student Attachments</span>
                            {submissionData.attachments.length === 0 && (
                                <Empty
                                    icon={HiDocumentText}
                                    title="No Attachments"
                                    description="Student has not attached any files to this submission."
                                />
                            )}
                            {submissionData.attachments.length > 0 && (
                                <div className="flex flex-col space-y-7">
                                    {submissionData.attachments.map((attachment) => (
                                        <FileDisplay
                                            key={attachment.id}
                                            file={{
                                                id: attachment.id,
                                                name: attachment.name,
                                                type: attachment.type,
                                                size: attachment.size,
                                                uploadedAt: attachment.uploadedAt,
                                                user: null,
                                            }}
                                            showDownload={true}
                                            showPreview={true}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Show grading information if any */}
                        {(submissionData.assignment.markScheme || submissionData.assignment.gradingBoundary) && (
                            <div className="border-t border-border-secondary pt-4">
                                <div className="mb-3">
                                    <span className="text-sm font-semibold text-foreground-secondary">Grading Tools</span>
                                </div>
                                <GradingInfo
                                    markScheme={submissionData.assignment.markScheme}
                                    gradingBoundary={submissionData.assignment.gradingBoundary}
                                    readonly={true}
                                />
                            </div>
                        )}

                        {/* Editable Rubric for grading */}
                        {submissionData.assignment.markScheme && rubricCriteria.length > 0 && (
                            <div className="border-t border-border-secondary pt-4">
                                <EditableRubric
                                    criteria={rubricCriteria}
                                    grades={rubricGrades}
                                    onGradesChange={handleRubricGradesChange}
                                    readonly={submissionData.returned || false}
                                />
                            </div>
                        )}
                    </Card>
                    
                    <div className="xl:col-span-1">
                    {/* Teacher controls and annotations */}
                    <Card>
                        <div className="flex flex-col justify-between space-y-3">
                            <div className="space-y-3">
                                <span className="text-lg font-semibold">Teacher Controls</span>
                                
                                {/* Grade input */}
                                {submissionData.assignment.graded && (
                                    <div className="flex flex-col space-y-2">
                                        <span className="font-semibold">Grade</span>
                                        <div className="flex flex-row">
                                            <Input.Text 
                                                className="rounded-tr-none rounded-br-none" 
                                                type="number" 
                                                max={submissionData.assignment.maxGrade} 
                                                value={submissionData.gradeReceived || 0} 
                                                onChange={handleGradeChange}
                                                disabled={(submissionData.returned && submissionData.assignment.graded) || submissionData.assignment.markSchemeId}
                                            />
                                            <div className="bg-primary-100 border border-primary-200 dark:bg-primary-800 dark:border-primary-600 px-4 py-2 rounded-tr-md rounded-br-md">
                                                <span>/{submissionData.assignment.maxGrade}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Annotations */}
                                <div className="flex flex-col space-y-2">
                                    <span className="font-semibold">Annotations</span>
                                    {submissionData.annotations.length === 0 && (
                                        <Empty
                                            icon={HiAnnotation}
                                            title="No Annotations"
                                            description="No annotations have been added to this submission."
                                        />
                                    )}
                                    {submissionData.annotations.length > 0 && (
                                        <div className="flex flex-col space-y-3">
                                            {submissionData.annotations.map((annotation) => (
                                                <FileDisplay
                                                    key={annotation.id}
                                                    file={{
                                                        id: annotation.id,
                                                        name: annotation.name,
                                                        type: annotation.type,
                                                        size: annotation.size,
                                                        uploadedAt: annotation.uploadedAt,
                                                        user: null,
                                                    }}
                                                    showDownload={true}
                                                    showPreview={true}
                                                    showDelete={true}
                                                    onDeleteOverride={() => handleAnnotationDelete(annotation.id)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* File selector for annotations */}
                            {!submissionData.returned && (
                                <div className="space-y-3">
                                    <FileSelector
                                        classId={params.classId}
                                        onFilesSelected={(files) => {
                                            const uploadFiles = files
                                                .filter(file => !file.id)
                                                .map(file => ({
                                                    name: file.name,
                                                    type: file.type,
                                                    size: file.size,
                                                    data: file.data || '',
                                                }));
                                            const existingFileIds = files
                                                .filter(file => !!file.id)
                                                .map(file => file.id!);

                                            if (uploadFiles.length > 0 || existingFileIds.length > 0) {
                                                updateSubmissionAsTeacher.mutate({
                                                    assignmentId: params.assignmentId,
                                                    classId: params.classId,
                                                    submissionId: params.submissionId,
                                                    newAttachments: uploadFiles,
                                                    existingFileIds: existingFileIds.length > 0 ? existingFileIds : undefined,
                                                });
                                            }
                                        }}
                                        accept="*/*"
                                        multiple={true}
                                        maxSize={50 * 1024 * 1024} // 50MB
                                        maxFiles={20}
                                        showPreview={false}
                                    />
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex flex-row justify-end space-x-2">
                                {!submissionData.returned && (
                                    <Button.Primary onClick={handleReturnToggle}>
                                        Return
                                    </Button.Primary>
                                )}
                                {submissionData.returned && (
                                    <Button.Primary onClick={handleReturnToggle}>
                                        Unreturn
                                    </Button.Primary>
                                )}
                            </div>
                        </div>
                    </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

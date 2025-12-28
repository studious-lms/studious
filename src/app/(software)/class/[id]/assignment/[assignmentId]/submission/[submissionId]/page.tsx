"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageLayout } from "@/components/ui/page-layout";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft,
  Save,
  Upload,
  ChevronDown,
} from "lucide-react";
import { format } from "date-fns";
import { trpc, type RouterOutputs, type RouterInputs } from "@/lib/trpc";
import { fixUploadUrl } from "@/lib/directUpload";
import type { 
  RubricGrade,
} from "@/lib/types/assignment";
import {  parseMarkScheme,
  parseGradingBoundary} from "@/lib/types/assignment";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import { FileItem, FileHandlers } from "@/lib/types/file";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FilePreviewModal } from "@/components/modals";
import {
  FileText,
  Image as ImageIcon,
  FileVideo,
  Music,
  Archive,
  FileSpreadsheet,
  Presentation,
  File
} from "lucide-react";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { baseFileHandler } from "@/lib/file/fileHandler";
import { getStatusColor, getStudentAssignmentStatus } from "@/lib/assignment/getStudentAssignmentStatus";
import { ExtendedResponse } from "@/components/submissions/ExtendedResponse";
import { AIPolicyDisplay } from "@/components/ui/ai-policy-card";
import { useTranslations } from "next-intl";
import { convertAttachmentsToFileItems } from "@/lib/file/file";
import AttachmentPreview from "@/components/AttachmentPreview";
import Attachment from "@/components/Attachment";

type AssignmentUpdateSubmissionAsTeacherInput = RouterInputs['assignment']['updateSubmissionAsTeacher'];

type RubricCriterion = {
  id: string;
  title: string;
  description?: string;
  levels: Array<{
    id: string;
    name: string;
    points: number;
    color?: string;
    description?: string;
  }>;
};

// RubricGrade type is now imported from @/lib/types/assignment

// Component to display a worksheet card that navigates to the worksheet page
function WorksheetCard({ 
  worksheetId, 
  submissionId,
  worksheetName,
  classId,
}: { 
  worksheetId: string; 
  submissionId: string;
  worksheetName: string;
  classId: string;
}) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/class/${classId}/worksheets/${worksheetId}/submission/${submissionId}`);
  };

  return (
    <button
      onClick={handleClick}
      className="w-full py-4 px-4 border rounded-lg hover:bg-muted/50 hover:border-primary/30 flex items-center justify-between text-left transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <span className="font-medium block">{worksheetName}</span>
          <span className="text-xs text-muted-foreground">View student&apos;s answers</span>
        </div>
      </div>
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground -rotate-90 transition-colors" />
    </button>
  );
}

function SubmissionDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
      </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-7 w-28 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
        </div>
        
      <Separator />

      {/* Files skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-36 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
      </div>

      {/* Grading skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    </div>
  );
}

export default function SubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  // @todo: move this outside of components.createAssignment
  const t = useTranslations('components.createAssignment');
  const appState = useSelector((state: RootState) => state.app);
  const classId = params.id as string;
  const assignmentId = params.assignmentId as string;
  const submissionId = params.submissionId as string;
  const isTeacher = appState.user.teacher;

  const [feedback, setFeedback] = useState("");
  const [grade, setGrade] = useState<number | undefined>(undefined);
  const [rubricGrades, setRubricGrades] = useState<RubricGrade[]>([]);

  // Track if form data has been initialized to prevent overwriting user input on refetch
  const isFormInitialized = useRef(false);

  // File upload state for annotations
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUploadStatus, setCurrentUploadStatus] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

  // Get submission data
  const { data: submission, isLoading, refetch: refetchSubmission } = trpc.assignment.getSubmissionById.useQuery({
    assignmentId: assignmentId,
    classId: classId,
    submissionId: submissionId,
  });

  // Get assignment data for rubric info
  const { data: assignment } = trpc.assignment.get.useQuery({
    id: assignmentId,
    classId: classId,
  });

  // Update submission as teacher mutation
  const utils = trpc.useUtils();
  const updateSubmissionMutation = trpc.assignment.updateSubmissionAsTeacher.useMutation({
    onSuccess: () => {
        toast.success("Grade saved");
      // Invalidate submissions list cache to update grades display
      utils.assignment.getSubmissions.invalidate({ assignmentId: assignmentId as string });
      // Navigate back to assignment detail page
      router.push(`/class/${classId}/assignment/${assignmentId}`);
    },
    onError: (error) => {
      toast.error(error.message || "There was a problem saving the grade. Please try again.");
    },
  });

  // Parse rubric criteria from assignment's mark scheme
  const [rubricCriteria, setRubricCriteria] = useState<RubricCriterion[]>([]);

  // Parse rubric data when assignment loads
  useEffect(() => {
    if (assignment?.markScheme?.structured) {
      const parsedMarkScheme = parseMarkScheme(assignment.markScheme.structured);
      console.log("Parsed mark scheme:", parsedMarkScheme);
      
      if (parsedMarkScheme?.criteria && parsedMarkScheme.criteria.length > 0) {
        console.log("Setting rubric criteria from assignment:", parsedMarkScheme.criteria.length, "criteria");
        setRubricCriteria(parsedMarkScheme.criteria);
      }
    }
  }, [assignment?.markScheme]);


  // Initialize form data from submission (only on first load to prevent overwriting user input)
  useEffect(() => {
    if (submission && !isFormInitialized.current) {
      setFeedback((submission).teacherComments || "");
      
      // Parse rubric grades if they exist
      if (submission.rubricState) {
        try {
          const existingGrades = JSON.parse(submission.rubricState);
          if (Array.isArray(existingGrades) && existingGrades.length > 0) {
            // Check if existing grades are compatible with current rubric criteria
            const isCompatible = existingGrades.every(grade => 
              rubricCriteria.some(criterion => 
                criterion.id === grade.criteriaId &&
                criterion.levels.some(level => level.id === grade.selectedLevelId)
              )
            );

            if (isCompatible && existingGrades.length === rubricCriteria.length) {
              // Rubric state is compatible, use existing grades
              setRubricGrades(existingGrades);
              isFormInitialized.current = true;
            } else {
              // Rubric state is incompatible, reset and initialize new grades
              console.log("Rubric state incompatible with current criteria, resetting...");
              if (rubricCriteria.length > 0) {
                const initialGrades = rubricCriteria.map(criterion => ({
                  criteriaId: criterion.id,
                  selectedLevelId: '',
                  points: 0,
                  comments: ''
                }));
                setRubricGrades(initialGrades);
                isFormInitialized.current = true;
              } else {
                setGrade(submission.gradeReceived || undefined);
                isFormInitialized.current = true;
              }
            }
          } else {
            // Empty rubric state, initialize with default grades if rubric exists
            if (rubricCriteria.length > 0) {
              const initialGrades = rubricCriteria.map(criterion => ({
                criteriaId: criterion.id,
                selectedLevelId: '',
                points: 0,
                comments: ''
              }));
              setRubricGrades(initialGrades);
              isFormInitialized.current = true;
            } else {
              setGrade(submission.gradeReceived || undefined);
              isFormInitialized.current = true;
            }
          }
        } catch (error) {
          console.error("Error parsing rubric grades:", error);
          // Reset to manual grading on parse error
          setGrade(submission.gradeReceived || undefined);
          setRubricGrades([]);
          isFormInitialized.current = true;
        }
      } else {
        // No rubric state, check if we need to initialize rubric or use manual grade
        if (rubricCriteria.length > 0) {
          const initialGrades = rubricCriteria.map(criterion => ({
            criteriaId: criterion.id,
            selectedLevelId: '',
            points: 0,
            comments: ''
          }));
          setRubricGrades(initialGrades);
          isFormInitialized.current = true;
        } else {
          setGrade(submission.gradeReceived || undefined);
          isFormInitialized.current = true;
        }
      }
    }
  }, [submission, rubricCriteria]);

  // Calculate rubric totals
  const totalRubricPoints = rubricGrades.reduce((sum, grade) => sum + grade.points, 0);

  const maxRubricPoints = rubricCriteria.reduce((sum, criterion) => {
    const maxPoints = Math.max(...criterion.levels.map(level => level.points));
    return sum + maxPoints;
  }, 0);

  // Update grade when rubric grades change
  useEffect(() => {
    if (rubricGrades.length > 0) {
      // When rubric is being used, sync the grade field with rubric total
      setGrade(totalRubricPoints);
    }
  }, [rubricGrades, totalRubricPoints]);

  const handleSaveGrade = async () => {
    if (!submission) return;

    // Check if rubric has any data (either selected levels or comments)
    const hasRubricData = rubricGrades.length > 0 && rubricGrades.some(g => 
      g.selectedLevelId || (g.comments)
    );

    // Calculate final grade based on rubric or manual input
    const finalGrade = hasRubricData && rubricGrades.some(g => g.selectedLevelId)
      ? totalRubricPoints 
      : grade;

    const updateData: AssignmentUpdateSubmissionAsTeacherInput = {
      assignmentId,
      classId,
      submissionId,
      gradeReceived: finalGrade,
      feedback: feedback,
      rubricGrades: hasRubricData ? rubricGrades : [],
    };

    updateSubmissionMutation.mutate(updateData);
  };

  const handleReturnSubmission = async () => {
    if (!submission) return;

    const updateData: AssignmentUpdateSubmissionAsTeacherInput = {
      assignmentId,
      classId,
      submissionId,
      'return': true, // Toggle the returned status
    };

    updateSubmissionMutation.mutate(updateData);
  };
  
  // File handlers for submission files
  const fileHandlers: FileHandlers = {
    ...baseFileHandler,
    onFolderClick: () => {}, // Not used in assignment context
    onRename: async () => {
      // Not allowed in submission view
    },
    onDelete: async (item: FileItem) => {
      if (isTeacher) {
        // Handle annotation deletion for teachers
        updateSubmissionMutation.mutate({
          assignmentId,
          classId,
          submissionId,
          removedAttachments: [item.id],
        });
      }
    },
    onMove: async () => {
      // Not applicable for submission files
    },
  };

  // Direct upload functions using proper TRPC hooks for annotations (teacher uploads)
  const getAnnotationUploadUrls = trpc.assignment.getAnnotationUploadUrls.useMutation();
  const confirmAnnotationUpload = trpc.assignment.confirmAnnotationUpload.useMutation();

  // Handle annotation file upload (teacher uploads feedback files to student submission)
  const handleAnnotationUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !submission) return;

    // Start upload progress tracking
    setIsUploading(true);
    setUploadProgress(0);
    setCurrentUploadStatus('Preparing annotation upload...');
    setTotalFiles(files.length);
    setUploadedFiles(0);

    try {
      // Use NEW direct upload approach for annotations
      const fileMetadata = Array.from(files).map(file => ({
        name: file.name,
        type: file.type,
        size: file.size
      }));

      // 1. Get upload URLs from backend using ANNOTATION endpoint
      setCurrentUploadStatus('Getting upload URLs...');
      setUploadProgress(10);

      const uploadResponse = await getAnnotationUploadUrls.mutateAsync({
        submissionId,
        classId,
        files: fileMetadata
      });

      setUploadProgress(20);

      // 2. Upload files through backend proxy
      const uploadPromises = Array.from(files).map(async (file, index) => {
        const uploadFile = uploadResponse.uploadFiles[index];
        
        // Update status for current file
        setCurrentUploadStatus(`Uploading annotation ${file.name}...`);
        const fileProgress = 20 + ((index / files.length) * 60); // 20-80% for uploads
        setUploadProgress(fileProgress);

        // Fix upload URL to use correct API base URL from environment
        const fixedUploadUrl = fixUploadUrl(uploadFile.uploadUrl);
        
        // Upload to backend proxy endpoint (resolves CORS issues)
        const response = await fetch(fixedUploadUrl, {
          method: 'POST', // Backend proxy uses POST
          body: file,
          headers: { 'Content-Type': file.type }
        });

        if (!response.ok) {
          throw new Error(`Upload failed for ${file.name}`);
        }

        // 3. Confirm upload to backend
        setCurrentUploadStatus(`Confirming ${file.name}...`);
        await confirmAnnotationUpload.mutateAsync({
          classId,
          fileId: uploadFile.id,
          uploadSuccess: true
        });

        // Update progress
        setUploadedFiles(index + 1);
        
        return uploadFile.id;
      });

      await Promise.all(uploadPromises);
      
      setUploadProgress(100);
      setCurrentUploadStatus('Upload complete!');
      toast.success('Annotations uploaded successfully');

      // Refresh submission to show new annotations
      refetchSubmission();

      // Clear the input
      event.target.value = '';

      // Reset progress after delay
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setCurrentUploadStatus('');
        setUploadedFiles(0);
        setTotalFiles(0);
      }, 1000);
    } catch (error) {
      toast.error(`Failed to upload files: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsUploading(false);
      setUploadProgress(0);
      setCurrentUploadStatus('');
    }
  };

  const updateRubricGrade = (criteriaId: string, levelId: string, points: number, comments?: string) => {
    setRubricGrades(prev => {
      const existing = prev.find(g => g.criteriaId === criteriaId);
      if (existing) {
        return prev.map(g => 
          g.criteriaId === criteriaId 
            ? { ...g, selectedLevelId: levelId, points, comments: comments || "" }
            : g
        );
      } else {
        return [...prev, { criteriaId, selectedLevelId: levelId, points, comments: comments || "" }];
      }
    });
  };

  if (isLoading) {
    return (
      <PageLayout>
        <SubmissionDetailSkeleton />
      </PageLayout>
    );
  }

  if (!submission) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <EmptyState
            icon={FileText}
            title="Submission not found"
            description="The submission you're looking for doesn't exist or has been removed."
          />
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <PageLayout>
        <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
          <div className="space-y-4">
            {/* Back button */}
        <div className="flex items-center justify-between">
              <button 
              onClick={() => router.back()}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back
              </button>
            </div>
            
            {/* Student Info + Title */}
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={submission.student?.profile?.profilePicture || ""} alt="" />
                <AvatarFallback>
                  {submission.student.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-3">
                  {submission.assignment.title}
                  {getStudentAssignmentStatus(submission).map((status) => (
                    <Badge className={getStatusColor(status)} key={status}>
                      {status}
                    </Badge>
                  ))}
                </h1>
                <p className="text-muted-foreground">
                  Submission by <span className="font-medium text-foreground">{submission.student.username}</span>
                </p>
            </div>
          </div>

            {/* Metadata badges */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {submission.submittedAt && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <span>Submitted {format(new Date(submission.submittedAt), 'MMM d, yyyy \'at\' h:mm a')}</span>
        </div>
              )}
              
              {submission.assignment.dueDate && (
                <Badge variant="secondary">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span>Due {format(new Date(submission.assignment.dueDate), 'MMM d, yyyy')}</span>
                  </div>
                </Badge>
              )}

              {submission.gradeReceived !== undefined && submission.gradeReceived !== null && (
                <Badge variant="secondary">
                  <div className="font-medium">
                    {submission.gradeReceived} / {submission.assignment.maxGrade} pts
                  </div>
                </Badge>
              )}
            </div>
          </div>

          {/* AI Policy */}
          {/* { getAIPolicy(assignment?.aiPolicyLevel) && (() => {
            const policy = getAIPolicy(assignment.aiPolicyLevel)!;
            return (
              <Collapsible open={aiPolicyExpanded} onOpenChange={setAiPolicyExpanded}>
                <div className={`w-full rounded-lg border transition-all ${getAIPolicyColor(assignment.aiPolicyLevel)}`}>
                  <CollapsibleTrigger asChild>
                    <div className="p-4 cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className={`w-3 h-3 rounded-full ${policy.color} mt-1.5 flex-shrink-0`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{policy.title}</h4>
                            <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${aiPolicyExpanded ? 'rotate-180' : ''}`} />
                          </div>
                          <p className="text-xs text-muted-foreground">{policy.description}</p>
                        </div>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4 pt-0 space-y-3 text-sm">
                      <div>
                        <div className="font-medium text-foreground mb-1">{t('aiPolicy.useCases')}</div>
                        <div className="text-muted-foreground">{policy.useCases}</div>
                      </div>
                      <div>
                        <div className="font-medium text-foreground mb-1">{t('aiPolicy.studentResponsibilities')}</div>
                        <div className="text-muted-foreground">{policy.studentResponsibilities}</div>
                      </div>
                      <div>
                        <div className="font-medium text-foreground mb-1">{t('aiPolicy.disclosureRequirements')}</div>
                        <div className="text-muted-foreground">{policy.disclosureRequirements}</div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })()} */}
          <AIPolicyDisplay level={assignment?.aiPolicyLevel} />

          <Separator />

            {/* Student Attachments - Only show if acceptFiles is true */}
            {assignment?.acceptFiles && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">Submitted Files</h2>
                  {submission.attachments.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {convertAttachmentsToFileItems(submission.attachments).map((fileItem) => (
                          // <DraggableFileItem
                          //   key={fileItem.id}
                          //   item={fileItem}
                          //   classId={classId}
                          //   readonly={true}
                          //   handlers={fileHandlers}
                          // />
                          <Attachment
                            key={fileItem.id}
                            fileItem={fileItem}
                          />
                        ))}
                      </div>
                  ) : (
                    <EmptyState
                      icon={FileText}
                      title="No files submitted"
                  description="The student hasn't submitted any files."
                  className="border rounded-lg border-dashed"
                    />
                  )}
            </div>
            )}

            {/* Extended Response - Only show if acceptExtendedResponse is true */}
            {assignment?.acceptExtendedResponse && (
              <ExtendedResponse extendedResponse={submission.extendedResponse} />
            )}

            {/* Worksheet Submission - Only show if acceptWorksheet is true */}
            {assignment?.acceptWorksheet && assignment.worksheets && assignment.worksheets.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">Worksheets</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {assignment.worksheets.map((worksheet) => (
                  <WorksheetCard
                        key={worksheet.id}
                        worksheetId={worksheet.id}
                        submissionId={submissionId}
                        worksheetName={worksheet.name || `Worksheet ${worksheet.id}`}
                    classId={classId}
                      />
                ))}
                </div>
              </div>
            )}

          {/* Teacher Annotations */}
          {isTeacher && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">Annotations & Feedback Files</h2>
              {submission.annotations.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {convertAttachmentsToFileItems(submission.annotations).map((fileItem) => (
                    // <DraggableFileItem
                    //   key={fileItem.id}
                    //   item={fileItem}
                    //   classId={classId}
                    //   readonly={false}
                      // handlers={fileHandlers}
                    // />
                    <AttachmentPreview
                    key={fileItem.id}
                      fileItem={fileItem}
                      onRemove={() => {
                        updateSubmissionMutation.mutate({
                          assignmentId,
                          classId,
                          submissionId,
                          removedAttachments: [fileItem.id],
                        });
                      }}
                      />
                  ))}
                </div>
              ) : null}

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2 p-4 bg-muted rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{currentUploadStatus}</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                  {totalFiles > 0 && (
                    <p className="text-xs text-muted-foreground text-center">
                      {uploadedFiles} of {totalFiles} annotations uploaded
                    </p>
                  )}
                </div>
              )}

              <Label htmlFor="annotation-upload" className="cursor-pointer">
                <div className="flex items-center justify-center w-full p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-muted-foreground/50 transition-colors">
                  <div className="text-center">
                    <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">{isUploading ? 'Uploading...' : 'Upload Annotations'}</p>
                    <p className="text-xs text-muted-foreground">Provide files as feedback to the student</p>
                  </div>
                </div>
              </Label>
              <Input
                id="annotation-upload"
                type="file"
                multiple
                onChange={handleAnnotationUpload}
                className="hidden"
                accept="*/*"
                disabled={isUploading}
              />
            </div>
          )}

          <Separator />

            {/* Grade & Feedback - Teacher Only */}
            {isTeacher && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-muted-foreground">
                  {rubricCriteria.length > 0 ? 'Rubric Grading' : 'Grading'}
                </h2>
                    {submission.returned && (
                  <Badge variant="secondary">Returned - Read Only</Badge>
                    )}
              </div>
                {/* Rubric Grading Section */}
                {rubricCriteria.length > 0 && (
                  <div className="space-y-6">
                    <div className="text-sm font-medium text-muted-foreground">
                      Rubric Assessment ({rubricCriteria.length} criteria)
                    </div>
                    {rubricCriteria.map((criterion) => {
                      const grade = rubricGrades.find(g => g.criteriaId === criterion.id);
                      return (
                        <div key={criterion.id} className="space-y-4">
                          <div>
                            <h4 className="font-semibold">{criterion.title}</h4>
                            {criterion.description && (
                              <p className="text-sm text-muted-foreground">{criterion.description}</p>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                            {criterion.levels.map((level) => (
                              <button
                                key={level.id}
                                onClick={() => !submission.returned && updateRubricGrade(criterion.id, level.id, level.points)}
                                disabled={submission.returned || false}
                                className={`p-3 rounded-lg border text-left transition-all ${
                                  grade?.selectedLevelId === level.id
                                    ? 'border-primary bg-primary/10'
                                    : submission.returned 
                                      ? 'border-border bg-muted cursor-not-allowed opacity-60'
                                      : 'border-border hover:border-primary/50'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-sm">{level.name}</span>
                                  <span className="text-sm font-semibold">{level.points}pts</span>
                                </div>
                                {level.description && (
                                  <p className="text-xs text-muted-foreground">{level.description}</p>
                                )}
                              </button>
                            ))}
                          </div>
                          
                          {grade && (
                            <Textarea
                              placeholder={submission.returned ? "Comments (read-only)" : "Add comments for this criterion..."}
                              value={grade.comments}
                              onChange={(e) => !submission.returned && updateRubricGrade(
                                criterion.id, 
                                grade.selectedLevelId, 
                                grade.points, 
                                e.target.value
                              )}
                              readOnly={submission.returned || false}
                              rows={2}
                              className={submission.returned ? "bg-muted cursor-not-allowed" : ""}
                            />
                          )}
                          
                          <Separator />
                        </div>
                      );
                    })}
                    
                    {rubricGrades.length > 0 && (
                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <span className="font-semibold">Rubric Total</span>
                        <span className="text-lg font-bold">
                          {totalRubricPoints} / {maxRubricPoints} points
                        </span>
                      </div>
                    )}

                    {/* Grade Preview */}
                    {(rubricGrades.length > 0 || grade !== undefined) && (
                      <div className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-lg font-bold text-primary">Final Grade Preview</span>
                            <p className="text-sm text-muted-foreground">What the student will see</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">
                              {rubricGrades.length > 0 ? totalRubricPoints : (grade || 0)} / {rubricGrades.length > 0 ? maxRubricPoints : (assignment?.maxGrade || submission.assignment?.maxGrade || 100)}
                            </div>
                            {assignment?.gradingBoundary && (rubricGrades.length > 0 || grade !== undefined) && (
                              <div className="text-sm font-medium text-primary/80">
                                {(() => {
                                  const finalGrade = rubricGrades.length > 0 ? totalRubricPoints : (grade || 0);
                                  const maxGrade = rubricGrades.length > 0 ? maxRubricPoints : (assignment?.maxGrade || submission.assignment?.maxGrade || 100);
                                  const percentage = (finalGrade / maxGrade) * 100;
                                  
                                  try {
                                    const parsedBoundary = parseGradingBoundary(assignment.gradingBoundary.structured);
                                    if (parsedBoundary?.boundaries) {
                                      const letterGrade = parsedBoundary.boundaries.find(b => 
                                        percentage >= b.minPercentage && percentage <= b.maxPercentage
                                      )?.grade || 'F';
                                      return `${percentage.toFixed(1)}% (${letterGrade})`;
                                    }
                                    return `${percentage.toFixed(1)}%`;
                                  } catch {
                                    return `${percentage.toFixed(1)}%`;
                                  }
                                })()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <Separator />
                  </div>
                )}

                {/* Traditional Grading Section - Only show when no rubric */}
                {rubricCriteria.length === 0 && (
                  <div className="space-y-4">
                    <div className="text-sm font-medium text-muted-foreground">Manual Grading</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="grade">Grade</Label>
                        <Input
                          id="grade"
                          type="number"
                          value={grade || ""}
                          onChange={(e) => !submission.returned && setGrade(e.target.value ? parseInt(e.target.value) : undefined)}
                          placeholder={submission.returned ? "Grade (read-only)" : "Enter grade"}
                          max={submission.assignment.maxGrade ?? undefined}
                          min="0"
                          readOnly={submission.returned || false}
                          className={submission.returned ? "bg-muted cursor-not-allowed" : ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Max Points</Label>
                        <div className="flex items-center h-10 px-3 border rounded-md bg-muted">
                          {submission.assignment.maxGrade}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Feedback Section - Always show */}
                <div className="space-y-4">
                  {rubricCriteria.length > 0 && (
                    <div className="text-sm font-medium text-muted-foreground">Overall Feedback</div>
                  )}

                <div className="space-y-2">
                  <Label htmlFor="feedback">Feedback</Label>
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => !submission.returned && setFeedback(e.target.value)}
                    placeholder={submission.returned ? "Feedback (read-only)" : "Provide feedback for the student..."}
                    rows={4}
                    readOnly={submission.returned || false}
                    className={submission.returned ? "bg-muted cursor-not-allowed" : ""}
                  />
                </div>

                <div className="flex items-center gap-3 pt-4">
                  {!submission.returned && (
                    <Button 
                      onClick={handleSaveGrade}
                      disabled={updateSubmissionMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateSubmissionMutation.isPending ? "Saving..." : "Save Grade"}
                    </Button>
                  )}
                  
                  <Button 
                    variant={submission.returned ? "default" : "outline"}
                    onClick={handleReturnSubmission}
                    disabled={updateSubmissionMutation.isPending}
                    className={submission.returned ? "bg-orange-600 hover:bg-orange-700" : ""}
                  >
                    {submission.returned ? "Unreturn Submission" : "Return to Student"}
                  </Button>
                    </div>

                {submission.returned && (
                  <p className="text-sm text-muted-foreground">
                    Grade and feedback have been returned to the student.
                          </p>
                        )}
                      </div>
                  </div>
                )}
        </div>
      </PageLayout>
    </DndProvider>
  );
}

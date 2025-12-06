"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageLayout } from "@/components/ui/page-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  Edit, 
  FileText, 
  CheckCircle,
  Upload,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { trpc, type RouterOutputs } from "@/lib/trpc";
import { fixUploadUrl } from "@/lib/directUpload";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { DataTable } from "@/components/ui/data-table";
import { toast } from "sonner";
import { DraggableFileItem } from "@/components/DraggableFileItem";
import { FileHandlers } from "@/lib/types/file";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FilePreviewModal } from "@/components/modals";
import {
  Image,
  FileVideo,
  Music,
  Archive,
  FileSpreadsheet,
  Presentation,
  File
  } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import type { 
  ParsedMarkScheme, 
  StoredRubricItem,
} from "@/lib/types/assignment";
import {  parseMarkScheme,
  parseGradingBoundary} from "@/lib/types/assignment";
import { baseFileHandler } from "@/lib/fileHandler";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { getStatusColor, getStudentAssignmentStatus } from "@/lib/getStudentAssignmentStatus";
import { AI_POLICY_LEVELS, getAIPolicyColor } from "@/lib/aiPolicy";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import type { RouterInputs } from "@/lib/trpc";

type Submissions = RouterOutputs['assignment']['getSubmissions'];
type Submission = Submissions[number];

type FileItem = {
  id: string;
  name: string;
  type: "file" | "folder";
  fileType?: string;
  size?: string;
  uploadedAt?: string;
};

// Component to display a worksheet card that navigates to the worksheet page
function WorksheetCard({ 
  worksheetId, 
  submissionId,
  classId,
  readonly,
}: { 
  worksheetId: string; 
  submissionId: string;
  classId: string;
  readonly: boolean;
}) {
  const router = useRouter();
  
  // Fetch worksheet to get the name
  const { data: worksheet, isLoading: isWorksheetLoading } = trpc.worksheet.getWorksheet.useQuery({
    worksheetId,
  });

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
          <span className="font-medium block">
            {isWorksheetLoading ? <Skeleton className="h-4 w-24" /> : worksheet?.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {readonly ? "View your answers" : "Continue working"}
          </span>
        </div>
      </div>
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground -rotate-90 transition-colors" />
    </button>
  );
}

function AssignmentDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header skeleton */}
      <div className="space-y-4">
      <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-20" />
        </div>
        <Skeleton className="h-8 w-72" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-7 w-28 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
      </div>
      
      {/* Instructions skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
        </div>
        
      {/* Attachments skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-36 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
      </div>

      {/* Worksheets skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <div className="grid gap-2 sm:grid-cols-2">
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </div>

      <Separator />
      
      {/* Statistics skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  );
}

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  // @todo: move this outside of components.createAssignment
  const t = useTranslations('components.createAssignment');

  const appState = useSelector((state: RootState) => state.app);
  const classId = params.id as string;
  const assignmentId = params.assignmentId as string;
  const isTeacher = appState.user.teacher;
  const isStudent = !isTeacher; // If not a teacher, assume student role

  // Build translated AI policy levels from shared config
  const getAIPolicy = (level: number) => {
    const policy = AI_POLICY_LEVELS.find(p => p.level === level);
    if (!policy) return null;
    return {
      level: policy.level,
      title: t(policy.titleKey),
      description: t(policy.descriptionKey),
      useCases: t(policy.useCasesKey),
      studentResponsibilities: t(policy.studentResponsibilitiesKey),
      disclosureRequirements: t(policy.disclosureRequirementsKey),
      color: policy.color,
    };
  };

  // State for AI policy collapsible
  const [aiPolicyExpanded, setAiPolicyExpanded] = useState(false);

  // Get assignment data
  const { data: assignment, isLoading: assignmentLoading } = trpc.assignment.get.useQuery({
    id: assignmentId,
    classId: classId,
  });

  // Get submissions data (for teachers)
  const { data: submissions, isLoading: submissionsLoading } = trpc.assignment.getSubmissions.useQuery({
    assignmentId: assignmentId,
    classId: classId,
  }, {
    enabled: isTeacher,
  });

  // Get student submission (for students)
  const { data: studentSubmission, isLoading: studentSubmissionLoading, refetch: refetchStudentSubmission } = trpc.assignment.getSubmission.useQuery({
    assignmentId: assignmentId,
    classId: classId,
  }, {
    enabled: isStudent,
  });

  // Initialize extended response and worksheet answers from submission
  useEffect(() => {
    if (studentSubmission) {
      if (studentSubmission.extendedResponse) {
        setExtendedResponse(studentSubmission.extendedResponse);
      }
    }
  }, [studentSubmission]);

  // Student submission upload mutation
  const updateStudentSubmissionMutation = trpc.assignment.updateSubmission.useMutation({
    onSuccess: () => {
      toast.success("Submission updated");
      refetchStudentSubmission();
    },
    onError: (error) => {
      toast.error(error.message || "There was a problem updating your submission. Please try again.");
    },
  });

  // Debounce timer ref for extended response auto-save
  const extendedResponseSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced save function for extended response
  const debouncedSaveExtendedResponse = useCallback((value: string) => {
    // Clear existing timeout
    if (extendedResponseSaveTimeoutRef.current) {
      clearTimeout(extendedResponseSaveTimeoutRef.current);
    }

    // Set new timeout to save after user stops typing (1.5 seconds)
    extendedResponseSaveTimeoutRef.current = setTimeout(() => {
      if (studentSubmission && value.trim()) {
        updateStudentSubmissionMutation.mutate({
          assignmentId,
          classId,
          submissionId: studentSubmission.id,
          extendedResponse: value,
        });
      }
    }, 5000);
  }, [studentSubmission, assignmentId, classId, updateStudentSubmissionMutation]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (extendedResponseSaveTimeoutRef.current) {
        clearTimeout(extendedResponseSaveTimeoutRef.current);
      }
    };
  }, []);

  // Direct upload functions using proper TRPC hooks
  const getSubmissionUploadUrls = trpc.assignment.getSubmissionUploadUrls.useMutation();
  const confirmSubmissionUpload = trpc.assignment.confirmSubmissionUpload.useMutation();

  const isLoading = assignmentLoading || submissionsLoading || studentSubmissionLoading;

  // Import toast for notifications

  // File preview state
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Progress tracking state for file uploads
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUploadStatus, setCurrentUploadStatus] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

  // Extended response state
  const [extendedResponse, setExtendedResponse] = useState("");

  // Status messages for different upload stages
  const uploadStatusMessages = [
    "Preparing files for upload...",
    "Getting upload URLs from server...",
    "Uploading files to secure cloud storage...",
    "Processing uploaded files...",
    "Confirming uploads...",
    "Finalizing submission...",
    "Almost done..."
  ];

  // Get signed URL mutation for file preview
  const getSignedUrlMutation = trpc.file.getSignedUrl.useMutation();

  if (isLoading) {
    return (
      <PageLayout>
        <AssignmentDetailSkeleton />
      </PageLayout>
    );
  }

  if (!assignment) {
    return (
      <PageLayout>
        <EmptyState
          icon={FileText}
          title="Assignment not found"
          description="The assignment you're looking for doesn't exist or has been removed."
        />
      </PageLayout>
    );
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string, size: "sm" | "lg" = "sm") => {
    const iconSize = size === "sm" ? "h-4 w-4" : "h-8 w-8";
    
    switch (fileType) {
      case "pdf":
        return <FileText className={`${iconSize} text-red-500`} />;
      case "docx":
        return <FileText className={`${iconSize} text-blue-500`} />;
      case "pptx":
        return <Presentation className={`${iconSize} text-orange-500`} />;
      case "xlsx":
        return <FileSpreadsheet className={`${iconSize} text-green-500`} />;
      case "mp4":
        return <FileVideo className={`${iconSize} text-purple-500`} />;
      case "mp3":
        return <Music className={`${iconSize} text-pink-500`} />;
      case "zip":
        return <Archive className={`${iconSize} text-gray-500`} />;
      case "jpg":
      case "png":
      case "gif":
        return <Image className={`${iconSize} text-emerald-500`} />;
      default:
        return <File className={`${iconSize} text-slate-500`} />;
    }
  };
  const convertAttachmentsToFileItems = (attachments: RouterOutputs['assignment']['getSubmission']['attachments']) => {
    return attachments.map(attachment => ({
      id: attachment.id,
      name: attachment.name,
      type: "file" as const,
      fileType: attachment.type.split('/')[1] || attachment.type,
      size: formatFileSize(attachment.size || 0),
      uploadedAt: attachment.uploadedAt || undefined,
    }));
  };

  // File handlers for student submission attachments
  const fileHandlers: FileHandlers = {
    ...baseFileHandler,
    onFolderClick: () => {}, // Not used in assignment context
    onRename: async () => {
      // Not allowed in assignment view
    },
    onDelete: async (file: FileItem) => {
      if (!studentSubmission || studentSubmission.submitted) {
        toast.error("Cannot delete files from submitted assignments");
        return;
      }
      
      try {
        await updateStudentSubmissionMutation.mutateAsync({
          assignmentId,
          classId,
          submissionId: studentSubmission.id,
          removedAttachments: [file.id]
        });
        toast.success("File deleted successfully");
      } catch {
        toast.error("Failed to delete file");
      }
    },
    onMove: async () => {
      // Not applicable for attachments
    },
    onPreview: (file: FileItem) => {
      setPreviewFile(file);
      setIsPreviewOpen(true);
    },
    onFileClick: (file: FileItem) => {
      setPreviewFile(file);
      setIsPreviewOpen(true);
    }
  };

  // Handle student submission file upload
  const handleStudentFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !studentSubmission) return;

    // Validate required parameters
    if (!classId || !assignmentId || !studentSubmission?.id) {
      toast.error("Missing required parameters for upload");
      return;
    }

    // Start upload progress tracking
    setIsUploading(true);
    setUploadProgress(0);
    setCurrentUploadStatus(uploadStatusMessages[0]);
    setTotalFiles(files.length);
    setUploadedFiles(0);

    try {
      // Use direct upload approach
      const fileMetadata = Array.from(files).map(file => ({
        name: file.name,
        type: file.type,
        size: file.size
      }));

      // 1. Get upload URLs from backend
      setCurrentUploadStatus(uploadStatusMessages[1]);
      setUploadProgress(20);
      
      const uploadResponse = await getSubmissionUploadUrls.mutateAsync({
        assignmentId,
        classId,
        submissionId: studentSubmission.id,
        files: fileMetadata
      });

      // 2. Upload files through backend proxy (not direct to GCS)
      setCurrentUploadStatus(uploadStatusMessages[2]);
      setUploadProgress(30);
      
      const uploadPromises = Array.from(files).map(async (file, index) => {
        const uploadFile = uploadResponse.uploadFiles[index];
        
        if (!uploadFile) {
          throw new Error(`No upload data for file ${file.name} at index ${index}`);
        }
        
        
        const { uploadUrl, id } = uploadFile;
        
        // Backend uses 'id' as the file identifier
        const actualFileId = id;
        
        if (!actualFileId || !uploadUrl) {
          throw new Error(`Missing fileId or uploadUrl for file ${file.name}: fileId=${actualFileId}, uploadUrl=${uploadUrl}, available props: ${Object.keys(uploadFile)}`);
        }
        
        // Update status for current file
        setCurrentUploadStatus(`Uploading ${file.name}...`);
        
        // Fix upload URL to use correct API base URL from environment
        const fixedUploadUrl = fixUploadUrl(uploadUrl);
        
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
        setCurrentUploadStatus(`Confirming upload for ${file.name}...`);
        await confirmSubmissionUpload.mutateAsync({
          fileId: actualFileId,
          uploadSuccess: true,
          classId: classId
        });
        
        // Update progress
        setUploadedFiles(prev => prev + 1);
        const fileProgress = 30 + ((index + 1) / files.length) * 50; // 30-80% for file uploads
        setUploadProgress(fileProgress);
        
        return {
          name: file.name,
          type: file.type,
          size: file.size,
          fileId: actualFileId
        };
      });
      // @todo: fix the `uploadStatusMessages` to remove redundant messages / steps      
      setCurrentUploadStatus(uploadStatusMessages[6]);
      setUploadProgress(100);

      // Refresh submission data to show new files
      refetchStudentSubmission();

      // Clear the input
      event.target.value = '';
      
      // Show success and reset after a delay
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
      setUploadedFiles(0);
      setTotalFiles(0);
    }
  };

  // Handle student submission toggle
  const handleSubmitToggle = () => {
    if (!studentSubmission) return;
    
    const updateData: RouterInputs['assignment']['updateSubmission'] = {
      assignmentId,
      classId,
      submissionId: studentSubmission.id,
      submit: !studentSubmission.submitted,
    };

    // Include extended response if assignment accepts it
    if (assignment?.acceptExtendedResponse && extendedResponse) {
      updateData.extendedResponse = extendedResponse;
    }

    updateStudentSubmissionMutation.mutate(updateData);
  };

  const submissionColumns = [
    {
      id: "student",
      accessorKey: "student.username",
      header: "Student",
      cell: ({ row }: { row: { original: Submission } }) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt="Student avatar" />
            <AvatarFallback>
              {row.original.student.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span>{row.original.student.username}</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: { original: Submission } }) => <div className="flex items-center space-x-2">{getStudentAssignmentStatus(row.original).map((status) => (
        <Badge className={getStatusColor(status)} key={status}>
          {status}
        </Badge>
      ))}</div>
    },
    {
      accessorKey: "gradeReceived",
      header: "Grade",
      cell: ({ row }: { row: { original: Submission } }) => (
        <span>
          {row.original.gradeReceived 
            ? `${row.original.gradeReceived}/${assignment.maxGrade}` 
            : '—'}
        </span>
      ),
    },
    {
      accessorKey: "attachments",
      header: "Files",
      cell: ({ row }: { row: { original: Submission } }) => (
        <span>{row.original.attachments.length}</span>
      ),
    },
  ];

  return (
    <DndProvider backend={HTML5Backend}>
      <PageLayout>
        <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
          <div className="space-y-4">
            {/* Back + Edit Row */}
        <div className="flex items-center justify-between">
              <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              {appState.user.teacher && (
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/class/${classId}/assignment/${assignmentId}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold flex items-center gap-4">
              {assignment.title}
              {isTeacher ? (
                getStudentAssignmentStatus(assignment).map((status) => (
                  <Badge className={getStatusColor(status)} key={status}>
                    {status}
                  </Badge>
                ))
              ) : studentSubmission && (
                getStudentAssignmentStatus(studentSubmission).map((status) => (
                  <Badge className={getStatusColor(status)} key={status}>
                    {status}
                  </Badge>
                ))
              )}
            </h1>
            
            {/* Metadata badges */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Due Date */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-sm">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>
                  {assignment.dueDate 
                    ? format(new Date(assignment.dueDate), 'MMM d, h:mm a')
                    : 'No due date'}
                </span>
              </div>
              
              {/* Points */}
              {assignment.graded && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-sm">
                  <CheckCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{assignment.maxGrade} pts</span>
                </div>
              )}
              
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">Instructions</h2>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-foreground leading-relaxed">{assignment.instructions}</p>
            </div>
          </div>

          {/* AI Policy */}
          {assignment.aiPolicyLevel && getAIPolicy(assignment.aiPolicyLevel) && (() => {
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
          })()}

          {/* Attachments - inline style */}
          {assignment.attachments.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">Attachments</h2>
              <div className="flex flex-wrap gap-2">
                {convertAttachmentsToFileItems(assignment.attachments).map((fileItem) => (
                  <button
                    key={fileItem.id}
                    onClick={() => {
                      setPreviewFile(fileItem);
                      setIsPreviewOpen(true);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors text-sm"
                  >
                    {getFileIcon(fileItem.fileType || 'file')}
                    <span className="max-w-[150px] truncate">{fileItem.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Worksheets - Show if assignment has worksheets */}
          {assignment?.worksheets && assignment.worksheets.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">Worksheets</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {assignment.worksheets.map((worksheet) => (
                  <button
                    key={worksheet.id}
                    onClick={() => {
                      if (isTeacher) {
                        router.push(`/class/${classId}/worksheets/edit/${worksheet.id}`);
                      } else if (studentSubmission) {
                        router.push(`/class/${classId}/worksheets/${worksheet.id}/submission/${studentSubmission.id}`);
                      }
                    }}
                    className="flex items-center justify-between px-4 py-3 rounded-lg border hover:bg-muted/50 transition-colors text-left group"
                  >
                    <span className="font-medium truncate">{worksheet.name}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground -rotate-90 group-hover:text-foreground transition-colors flex-shrink-0" />
                  </button>
                ))}
        </div>
            </div>
          )}

          <Separator />

          {/* Teacher View - Statistics & Submissions */}
          {isTeacher && submissions && (
            <div className="space-y-6">
              {/* Statistics Bars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">Submitted</span>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400 mt-1">
                    {submissions.filter(s => s.submitted).length}
                </div>
                  <div className="mt-2 h-1.5 bg-green-200 dark:bg-green-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all" 
                      style={{ width: `${submissions.length > 0 ? (submissions.filter(s => s.submitted).length / submissions.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900">
                  <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">Late</span>
                  <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400 mt-1">
                    {submissions.filter(s => s.submitted && s.late).length}
                  </div>
                  <div className="mt-2 h-1.5 bg-yellow-200 dark:bg-yellow-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 rounded-full transition-all" 
                      style={{ width: `${submissions.length > 0 ? (submissions.filter(s => s.submitted && s.late).length / submissions.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                  <span className="text-xs font-medium text-red-700 dark:text-red-300">Missing</span>
                  <div className="text-2xl font-bold text-red-700 dark:text-red-400 mt-1">
                    {submissions.filter(s => !s.submitted).length}
                  </div>
                  <div className="mt-2 h-1.5 bg-red-200 dark:bg-red-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 rounded-full transition-all" 
                      style={{ width: `${submissions.length > 0 ? (submissions.filter(s => !s.submitted).length / submissions.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Graded</span>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-400 mt-1">
                    {submissions.filter(s => s.returned).length}
                  </div>
                  <div className="mt-2 h-1.5 bg-blue-200 dark:bg-blue-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all" 
                      style={{ width: `${submissions.length > 0 ? (submissions.filter(s => s.returned).length / submissions.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Submissions Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Submissions</h2>
                  <span className="text-sm text-muted-foreground">
                    {submissions.filter(s => s.submitted).length} of {submissions.length} submitted
                  </span>
                </div>
                {submissions.length > 0 ? (
                    <DataTable
                      columns={submissionColumns}
                      searchPlaceholder="Search submissions..."
                      showSearch={true}
                      searchKey="student"
                      data={submissions}
                      onRowClick={(row) => 
                        router.push(`/class/${classId}/assignment/${assignmentId}/submission/${row.id}`)
                      }
                    />
                  ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="font-medium">No students enrolled</p>
                    <p className="text-sm">Add students to your class to see submissions.</p>
                  </div>
                  )}
              </div>
            </div>
            )}

            {/* Student View - My Submission */}
            {isStudent && studentSubmission && (
            <div className="space-y-6">
              {/* Newton Tutor Button */}
              <Link href={`/class/${classId}/assignment/${assignmentId}/tutor`}>
                <div className="p-4 rounded-xl bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 border border-violet-500/20 hover:border-violet-500/40 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        Newton Tutor
                        <Badge variant="secondary" className="bg-violet-500/10 text-violet-600 dark:text-violet-400 border-0 text-[10px]">
                          AI
                        </Badge>
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Get help understanding concepts, hints, and guidance for this assignment
                      </p>
                    </div>
                    <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>

              <h2 className="text-lg font-semibold">Your Work</h2>
                  
                  {/* File Upload Section - Only show if acceptFiles is true */}
                  {assignment?.acceptFiles && (
                    <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">File Attachments</h3>
                  {studentSubmission.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                            {convertAttachmentsToFileItems(studentSubmission.attachments).map((fileItem) => (
                              <DraggableFileItem
                                key={fileItem.id}
                                item={fileItem}
                                classId={classId}
                                readonly={studentSubmission.submitted || false}
                                handlers={fileHandlers}
                                getFileIcon={getFileIcon}
                              />
                            ))}
                          </div>
                      )}
                      
                      {!studentSubmission.submitted && (
                    <>
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
                                  {uploadedFiles} of {totalFiles} files uploaded
                                </p>
                              )}
                            </div>
                          )}
                      <Label htmlFor="student-file-upload" className="cursor-pointer block">
                        <div className="flex items-center justify-center w-full py-6 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-muted-foreground/50 transition-colors">
                                <div className="text-center">
                            <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm">{isUploading ? 'Uploading...' : 'Upload files'}</p>
                                </div>
                              </div>
                            </Label>
                          <Input
                            id="student-file-upload"
                            type="file"
                            multiple
                            onChange={handleStudentFileUpload}
                            className="hidden"
                            accept="*/*"
                            disabled={isUploading}
                          />
                    </>
                      )}
                    </div>
                  )}

                  {/* Extended Response Section - Only show if acceptExtendedResponse is true */}
                  {assignment?.acceptExtendedResponse && (
                    <div className="space-y-2">
                  <Label htmlFor="extended-response" className="text-sm font-medium text-muted-foreground">Written Response</Label>
                      <Textarea
                        id="extended-response"
                        value={extendedResponse}
                        onChange={(e) => {
                          const value = e.target.value;
                          setExtendedResponse(value);
                          debouncedSaveExtendedResponse(value);
                        }}
                        placeholder="Enter your response here..."
                    rows={6}
                        disabled={studentSubmission.submitted || false}
                        className={studentSubmission.submitted ? "bg-muted cursor-not-allowed" : ""}
                      />
                    </div>
                  )}

                  {/* Worksheet Submission Section - Only show if acceptWorksheet is true */}
                  {assignment?.acceptWorksheet && assignment.worksheets && assignment.worksheets.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Worksheets</h3>
                      <div className="space-y-2">
                        {assignment.worksheets.map((worksheet: RouterOutputs['assignment']['get']['worksheets'][number]) => (
                      <WorksheetCard
                            key={worksheet.id}
                            submissionId={studentSubmission.id}
                            worksheetId={worksheet.id}
                        classId={classId}
                            readonly={studentSubmission.submitted || false}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                    <Button
                      onClick={handleSubmitToggle}
                      disabled={updateStudentSubmissionMutation.isPending}
                      variant={studentSubmission.submitted ? "outline" : "default"}
                  size="lg"
                    >
                      {updateStudentSubmissionMutation.isPending 
                        ? "Updating..." 
                        : studentSubmission.submitted 
                          ? "Unsubmit" 
                          : "Submit Assignment"
                      }
                    </Button>
                  </div>
            </div>
            )}

            {/* Student View - Feedback (when submission is returned) */}
            {isStudent && assignment.graded && studentSubmission && studentSubmission.returned && (
            <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
              <CardContent className="pt-6 space-y-4">
                  {/* Grade Display */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Your Grade</h3>
                  <div className="text-right">
                    <span className="text-2xl font-bold">
                          {studentSubmission.gradeReceived ?? 0} / {assignment.maxGrade}
                        </span>
                      {assignment.gradingBoundary && (
                        <div className="text-sm text-muted-foreground">
                          {(() => {
                            try {
                              const parsedBoundary = parseGradingBoundary(assignment.gradingBoundary.structured);
                              if (parsedBoundary?.boundaries) {
                                const percentage = ((studentSubmission.gradeReceived ?? 0) / (assignment.maxGrade ?? 1)) * 100;
                                const letterGrade = parsedBoundary.boundaries.find(b => 
                                  percentage >= b.minPercentage && percentage <= b.maxPercentage
                                )?.grade || 'F';
                                return `${percentage.toFixed(1)}% (${letterGrade})`;
                              }
                              return `${(((studentSubmission.gradeReceived ?? 0) / (assignment.maxGrade ?? 1)) * 100).toFixed(1)}%`;
                            } catch {
                              return `${(((studentSubmission.gradeReceived ?? 0) / (assignment.maxGrade ?? 1)) * 100).toFixed(1)}%`;
                            }
                          })()}
                        </div>
                      )}
                    </div>
                </div>

                  {/* Rubric Feedback Display */}
                  {studentSubmission.rubricState?.trim() && (
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Rubric Breakdown</div>
                      {(() => {
                        try {
                          const rubricGrades = JSON.parse(studentSubmission.rubricState) as StoredRubricItem[];
                          let rubricCriteria: ParsedMarkScheme['criteria'] = [];
                          
                          if (assignment?.markScheme?.structured) {
                            const parsedMarkScheme = parseMarkScheme(assignment.markScheme.structured);
                            rubricCriteria = parsedMarkScheme?.criteria || [];
                          }

                          return rubricCriteria.map((criterion) => {
                            const grade = rubricGrades.find((g) => g.criteriaId === criterion.id);
                            if (!grade) return null;
                            const selectedLevel = criterion.levels.find(l => l.id === grade.selectedLevelId);
                            
                            return (
                            <div key={criterion.id} className="p-3 bg-background rounded-lg border">
                              <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                  <h4 className="font-medium text-sm">{criterion.title}</h4>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{grade.points} pts</span>
                                    {selectedLevel && (
                                      <Badge 
                                      style={{ backgroundColor: selectedLevel.color, color: 'white' }}
                                      className="text-xs"
                                      >
                                        {selectedLevel.name}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                {grade.comments && (
                                <p className="mt-2 text-sm text-muted-foreground">{grade.comments}</p>
                                )}
                              </div>
                            );
                          });
                        } catch {
                          return <p className="text-sm text-muted-foreground">Error loading rubric feedback</p>;
                        }
                      })()}
                    </div>
                  )}

                  {/* General Feedback */}
                  {(studentSubmission).teacherComments && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Teacher Comments</div>
                    <p className="text-sm text-muted-foreground bg-background p-3 rounded-lg border">
                      {(studentSubmission).teacherComments}
                    </p>
                    </div>
                  )}

                  {/* Annotations/Teacher Files */}
                  {studentSubmission.annotations && studentSubmission.annotations.length > 0 && (
                    <div className="space-y-2">
                    <div className="text-sm font-medium">Feedback Files</div>
                    <div className="flex flex-wrap gap-2">
                        {convertAttachmentsToFileItems(studentSubmission.annotations).map((fileItem) => (
                        <button
                            key={fileItem.id}
                          onClick={() => {
                            setPreviewFile(fileItem);
                            setIsPreviewOpen(true);
                          }}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-background hover:bg-muted/60 transition-colors text-sm"
                        >
                          {getFileIcon(fileItem.fileType || 'file')}
                          <span className="max-w-[120px] truncate">{fileItem.name}</span>
                        </button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

                </div>
                

        {/* File Preview Modal */}
        <FilePreviewModal
          file={previewFile}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          onAction={async (action: string, item: FileItem) => {
            switch (action) {
              case "download":
                await fileHandlers.onDownload(item);
                break;
              case "share":
                await fileHandlers.onShare(item);
                break;
              case "preview":
                fileHandlers.onPreview?.(item);
                break;
            }
          }}
          getPreviewUrl={async (fileId: string) => {
            const result = await getSignedUrlMutation.mutateAsync({ fileId });
            return result.url;
          }}
        />
      </PageLayout>
    </DndProvider>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageLayout } from "@/components/ui/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import ColorPicker from "@/components/ui/color-picker";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { 
  ArrowLeft,
  Save,
  Upload,
  Calendar,
  Settings,
  BookOpen,
  Plus,
  X,
  Users,
  ChevronDown,
  Search,
  Loader2,
  FileUp
} from "lucide-react";
import { format } from "date-fns";
import { trpc, type RouterOutputs, type RouterInputs } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import {
  ClipboardCheck,
  ClipboardList,
  Target
} from "lucide-react";
import { DraggableFileItem } from "@/components/DraggableFileItem";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FilePreviewModal } from "@/components/modals";
import { FileItem, FileHandlers } from "@/lib/types/file";
import {
  FileText,
  Image,
  FileVideo,
  Music,
  Archive,
  FileSpreadsheet,
  Presentation,
  File
} from "lucide-react";
import { baseFileHandler } from "@/lib/fileHandler";
import { fixUploadUrl } from "@/lib/directUpload";

type Assignment = RouterOutputs['assignment']['get'];
type AssignmentUpdateInput = RouterInputs['assignment']['update'];

type AssignmentType = 'HOMEWORK' | 'QUIZ' | 'TEST' | 'PROJECT' | 'ESSAY' | 'DISCUSSION' | 'PRESENTATION' | 'LAB' | 'OTHER';

function AssignmentEditSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-8 w-48" />
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AssignmentEditPage() {
  const t = useTranslations('components.createAssignment');
  const tAssignments = useTranslations('assignmentDetail');
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;
  const assignmentId = params.assignmentId as string;

  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState<Partial<Assignment & {
    acceptFiles?: boolean;
    acceptExtendedResponse?: boolean;
    acceptWorksheet?: boolean;
    gradeWithAI?: boolean;
    aiPolicyLevel?: number;
    worksheetIds?: string[];
    studentIds?: string[];
  }>>({});

  // Section creation state
  const [showNewSection, setShowNewSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionColor, setNewSectionColor] = useState('#3b82f6');

  // Worksheet search state
  const [worksheetSearchQuery, setWorksheetSearchQuery] = useState('');

  const assignmentTypes: { label: string; value: AssignmentType; icon: React.ReactNode }[] = [
    { label: t('types.homework'), value: "HOMEWORK", icon: <BookOpen className="h-4 w-4" /> },
    { label: t('types.quiz'), value: "QUIZ", icon: <FileText className="h-4 w-4" /> },
    { label: t('types.test'), value: "TEST", icon: <ClipboardCheck className="h-4 w-4" /> },
    { label: t('types.project'), value: "PROJECT", icon: <Target className="h-4 w-4" /> },
    { label: t('types.essay'), value: "ESSAY", icon: <FileText className="h-4 w-4" /> },
    { label: t('types.discussion'), value: "DISCUSSION", icon: <BookOpen className="h-4 w-4" /> },
    { label: t('types.presentation'), value: "PRESENTATION", icon: <Target className="h-4 w-4" /> },
    { label: t('types.lab'), value: "LAB", icon: <ClipboardList className="h-4 w-4" /> },
    { label: t('types.other'), value: "OTHER", icon: <FileText className="h-4 w-4" /> }
  ];

  // File preview state
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Upload progress state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUploadStatus, setCurrentUploadStatus] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

  // Get signed URL mutation for file preview
  const getSignedUrlMutation = trpc.file.getSignedUrl.useMutation();
  const getAssignmentUploadUrls = trpc.assignment.getAssignmentUploadUrls.useMutation();
  const confirmAssignmentUpload = trpc.assignment.confirmAssignmentUpload.useMutation();

  // Specific mutations for grading tools and events
  const attachMarkSchemeMutation = trpc.assignment.attachMarkScheme.useMutation({
    onSuccess: () => {
      toast.success("Rubric attached successfully.");
      refetchAssignment();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to attach rubric.");
    },
  });

  const detachMarkSchemeMutation = trpc.assignment.detachMarkScheme.useMutation({
    onSuccess: () => {
      toast.success("Rubric detached successfully.");
      toast.success("Rubric detached successfully.");
      refetchAssignment();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to detach rubric.");
    },
  });

  const attachGradingBoundaryMutation = trpc.assignment.attachGradingBoundary.useMutation({
    onSuccess: () => {
      toast.success("Grading boundary attached successfully.");
      handleSave();
      refetchAssignment();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to attach grading boundary.");
    },
  });

  const detachGradingBoundaryMutation = trpc.assignment.detachGradingBoundary.useMutation({
    onSuccess: () => {
      toast.success("Grading boundary detached successfully.");
      handleSave();
      refetchAssignment();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to detach grading boundary.");
    },
  });

  const attachToEventMutation = trpc.assignment.attachToEvent.useMutation({
    onSuccess: () => {
      toast.success("Event attached successfully.");
      handleSave();
      refetchAssignment();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to attach event.");
    },
  });

  const detachEventMutation = trpc.assignment.detachEvent.useMutation({
    onSuccess: () => {
      toast.success("Event detached successfully.");
      handleSave();
      refetchAssignment();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to detach event.");
    },
  });

  const createSectionMutation = trpc.section.create.useMutation({
    onSuccess: (data) => {
      setFormData(prev => ({ ...prev, sectionId: data.id }));
      setShowNewSection(false);
      setNewSectionName('');
      setNewSectionColor('#3b82f6');
      toast.success(t('toasts.sectionCreated', { name: data.name }));
      refetchAssignment();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  // Get available events for attachment
  const { data: availableEvents } = trpc.assignment.getAvailableEvents.useQuery({
    assignmentId,
    classId,
  });

  // Get assignment data
  const { data: assignment, isLoading, refetch: refetchAssignment } = trpc.assignment.get.useQuery({
    id: assignmentId,
    classId: classId,
  });

  // Get class data for sections
  const { data: classData } = trpc.class.get.useQuery({ classId });

  // Get grading tools data directly from tRPC
  const { data: markSchemes } = trpc.class.listMarkSchemes.useQuery({ classId });
  const { data: gradingBoundaries } = trpc.class.listGradingBoundaries.useQuery({ classId });
  const { data: worksheetsData } = trpc.worksheet.listWorksheets.useQuery({ classId });

  const sections = classData?.class?.sections || [];
  const students = classData?.class?.students || [];

  // Filter worksheets based on search
  const filteredWorksheets = useMemo(() => {
    if (!worksheetsData) return [];
    if (!worksheetSearchQuery.trim()) return worksheetsData;
    return worksheetsData.filter(worksheet =>
      worksheet.name.toLowerCase().includes(worksheetSearchQuery.toLowerCase())
    );
  }, [worksheetsData, worksheetSearchQuery]);

  // AI Policy levels configuration
  const aiPolicyLevels = [
    {
      level: 1,
      title: t('aiPolicy.level1.title'),
      description: t('aiPolicy.level1.description'),
      useCases: t('aiPolicy.level1.useCases'),
      studentResponsibilities: t('aiPolicy.level1.studentResponsibilities'),
      disclosureRequirements: t('aiPolicy.level1.disclosureRequirements'),
      color: 'bg-red-500'
    },
    {
      level: 2,
      title: t('aiPolicy.level2.title'),
      description: t('aiPolicy.level2.description'),
      useCases: t('aiPolicy.level2.useCases'),
      studentResponsibilities: t('aiPolicy.level2.studentResponsibilities'),
      disclosureRequirements: t('aiPolicy.level2.disclosureRequirements'),
      color: 'bg-orange-500'
    },
    {
      level: 3,
      title: t('aiPolicy.level3.title'),
      description: t('aiPolicy.level3.description'),
      useCases: t('aiPolicy.level3.useCases'),
      studentResponsibilities: t('aiPolicy.level3.studentResponsibilities'),
      disclosureRequirements: t('aiPolicy.level3.disclosureRequirements'),
      color: 'bg-yellow-500'
    },
    {
      level: 4,
      title: t('aiPolicy.level4.title'),
      description: t('aiPolicy.level4.description'),
      useCases: t('aiPolicy.level4.useCases'),
      studentResponsibilities: t('aiPolicy.level4.studentResponsibilities'),
      disclosureRequirements: t('aiPolicy.level4.disclosureRequirements'),
      color: 'bg-green-500'
    },
    {
      level: 5,
      title: t('aiPolicy.level5.title'),
      description: t('aiPolicy.level5.description'),
      useCases: t('aiPolicy.level5.useCases'),
      studentResponsibilities: t('aiPolicy.level5.studentResponsibilities'),
      disclosureRequirements: t('aiPolicy.level5.disclosureRequirements'),
      color: 'bg-green-500'
    }
  ];

  // Update assignment mutation
  const updateAssignmentMutation = trpc.assignment.update.useMutation({
    onSuccess: () => {
      toast.success("Assignment saved");
      setHasChanges(false);
      refetchAssignment();
    },
    onError: (error) => {
      toast.error(error.message || "There was a problem saving your changes. Please try again.");
    },
  });

  // Initialize form data when assignment loads
  useEffect(() => {
    if (assignment) {
      setFormData({
        title: assignment.title,
        instructions: assignment.instructions,
        dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().slice(0, 16) : undefined,
        maxGrade: assignment.maxGrade,
        graded: assignment.graded,
        type: assignment.type,
        weight: assignment.weight,
        inProgress: assignment.inProgress,
        sectionId: assignment.section?.id,
        markSchemeId: assignment.markScheme?.id,
        gradingBoundaryId: assignment.gradingBoundary?.id,
        acceptFiles: assignment.acceptFiles ?? false,
        acceptExtendedResponse: assignment.acceptExtendedResponse ?? false,
        acceptWorksheet: assignment.acceptWorksheet ?? false,
        gradeWithAI: assignment.gradeWithAI ?? false,
        aiPolicyLevel: assignment.aiPolicyLevel ?? 4,
        worksheetIds: assignment.worksheets?.map((w: RouterOutputs['assignment']['get']['worksheets'][number]) => w.id) || [],
        studentIds: assignment.studentIds || [],
      });
    }
  }, [assignment]);

  const updateFormData = (updates: Partial<Assignment & { markSchemeId?: string; gradingBoundaryId?: string }>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!assignment) return;
    
    const updateData: AssignmentUpdateInput = {
      classId,
      id: assignmentId,
      title: formData.title,
      instructions: formData.instructions,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
      maxGrade: formData.maxGrade,
      graded: formData.graded,
      type: formData.type,
      weight: formData.weight,
      inProgress: formData.inProgress,
      sectionId: formData.sectionId || null,
      acceptFiles: formData.acceptFiles,
      acceptExtendedResponse: formData.acceptExtendedResponse,
      acceptWorksheet: formData.acceptWorksheet,
      gradeWithAI: formData.gradeWithAI,
      aiPolicyLevel: formData.aiPolicyLevel,
      worksheetIds: formData.worksheetIds,
      studentIds: formData.studentIds?.length === 0 ? undefined : formData.studentIds,
    };
    
    updateAssignmentMutation.mutate(updateData);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !assignment) return;

    // Start upload progress tracking
    setIsUploading(true);
    setUploadProgress(0);
    setCurrentUploadStatus('Preparing upload...');
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
      setCurrentUploadStatus('Getting upload URLs...');
      setUploadProgress(10);

      const uploadResponse = await getAssignmentUploadUrls.mutateAsync({
        assignmentId,
        classId,
        files: fileMetadata
      });

      setUploadProgress(20);

      // 2. Upload files through backend proxy
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadFile = uploadResponse.uploadFiles[i];

        try {
          // Update status for current file
          setCurrentUploadStatus(`Uploading ${file.name}...`);
          const fileProgress = 20 + ((i / files.length) * 60); // 20-80% for uploads
          setUploadProgress(fileProgress);

          // Fix upload URL to use correct API base URL from environment
          const uploadUrl = fixUploadUrl(uploadFile.uploadUrl);

          // Upload to backend proxy endpoint
          const response = await fetch(uploadUrl, {
            method: 'POST',
            body: file,
            headers: {
              'Content-Type': file.type
            }
          });

          if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
          }

          // 3. Confirm upload to backend
          setCurrentUploadStatus(`Confirming ${file.name}...`);
          await confirmAssignmentUpload.mutateAsync({
            fileId: uploadFile.id,
            uploadSuccess: true,
            classId
          });

          // Update progress
          setUploadedFiles(i + 1);
        } catch (error) {
          // Report error to backend
          await confirmAssignmentUpload.mutateAsync({
            fileId: uploadFile.id,
            uploadSuccess: false,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            classId
          });

          toast.error(`Failed to upload ${file.name}`);
        }
      }

      // Final steps
      setCurrentUploadStatus('Finalizing...');
      setUploadProgress(90);

      // Refresh assignment data to show new files
      refetchAssignment();
      
      setUploadProgress(100);
      setCurrentUploadStatus('Upload complete!');
      toast.success("Files uploaded successfully");
      
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
      toast.error('Failed to upload files');
      setIsUploading(false);
      setUploadProgress(0);
      setCurrentUploadStatus('');
    }
  };

  const removeAttachment = (attachmentId: string) => {
    if (!assignment) return;
    
    updateAssignmentMutation.mutate({
      classId,
      id: assignmentId,
      removedAttachments: [attachmentId],
    });
  };

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

  const convertAttachmentsToFileItems = (attachments: Assignment['attachments']) => {
    return attachments.map((attachment: Assignment['attachments'][number]) => ({
      id: attachment.id,
      name: attachment.name,
      type: "file" as const,
      fileType: attachment.type.split('/')[1] || attachment.type,
      size: formatFileSize(attachment.size),
      uploadedAt: attachment.uploadedAt,
    }));
  };

  // File handlers for attachments
  const fileHandlers: FileHandlers = {
    ...baseFileHandler,
    onDelete: async (item: FileItem) => {
      removeAttachment(item.id);
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

  const handleFileClick = (file: FileItem) => {
    // Handle file click - open preview
    setPreviewFile(file);
    setIsPreviewOpen(true);
  };

  if (isLoading) {
    return (
      <PageLayout>
        <AssignmentEditSkeleton />
      </PageLayout>
    );
  }

  if (!assignment) {
    return (
      <PageLayout>
        <EmptyState
          icon={FileText}
          title="Assignment not found"
          description="The assignment you're trying to edit doesn't exist or has been removed."
        />
      </PageLayout>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <PageLayout>
        <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">{tAssignments('actions.edit')}</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            {hasChanges && (
              <Badge variant="secondary">Unsaved changes</Badge>
            )}
            <Button 
              onClick={handleSave}
              disabled={!hasChanges || updateAssignmentMutation.isPending}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{updateAssignmentMutation.isPending ? "Saving..." : "Save Changes"}</span>
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Main Form */}
          <div className="xl:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('sections.details')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">{t('fields.title')}</Label>
                    <Input
                      id="title"
                      value={formData.title || ''}
                      onChange={(e) => updateFormData({ title: e.target.value })}
                      placeholder={t('placeholders.title')}
                      className="text-base"
                    />
                </div>

                {/* Instructions */}
                <div className="space-y-2">
                  <Label htmlFor="instructions" className="text-sm font-medium">{t('fields.instructions')}</Label>
                    <Textarea
                      id="instructions"
                      value={formData.instructions || ''}
                      onChange={(e) => updateFormData({ instructions: e.target.value })}
                      placeholder={t('placeholders.instructions')}
                      rows={4}
                      className="resize-none"
                    />
                </div>

                {/* Due Date and Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">{t('fields.dueDate')}</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="dueDate"
                        type="datetime-local"
                        value={formData.dueDate || ""}
                        onChange={(e) => updateFormData({ dueDate: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('fields.type')}</Label>
                    <Select
                      value={formData.type || "HOMEWORK"}
                      onValueChange={(value: AssignmentType) => updateFormData({ type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {assignmentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              {type.icon}
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Students */}
                <div className="space-y-2">
                  <Label>{t('fields.students')}</Label>
                  <div className="flex flex-wrap gap-2 p-2 min-h-[42px] border rounded-md">
                    {(!formData.studentIds || formData.studentIds.length === 0) ? (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {t('students.all')}
                      </Badge>
                    ) : (
                      formData.studentIds.map((studentId) => {
                        const student = students.find(s => s.id === studentId);
                        return student ? (
                          <Badge key={studentId} variant="secondary" className="flex items-center gap-1">
                            {student.username}
                            <button
                              type="button"
                              onClick={() => {
                                const newIds = formData.studentIds?.filter(id => id !== studentId) || [];
                                updateFormData({ studentIds: newIds });
                              }}
                              className="ml-1 hover:bg-muted rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ) : null;
                      })
                    )}
                    <Select
                      value=""
                      onValueChange={(value) => {
                        if (value === 'all') {
                          updateFormData({ studentIds: [] });
                        } else {
                          const currentIds = formData.studentIds || [];
                          if (!currentIds.includes(value)) {
                            updateFormData({ studentIds: [...currentIds, value] });
                          }
                        }
                      }}
                    >
                      <SelectTrigger className="h-8 w-auto border-0 shadow-none focus:ring-0">
                        <SelectValue placeholder={t('students.selectPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('students.all')}</SelectItem>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Section */}
                <div className="space-y-2">
                  <Label>{t('fields.section')}</Label>
                  {!showNewSection ? (
                    <Select
                      value={formData.sectionId || 'none'}
                      onValueChange={(value) => {
                        if (value === 'create-new') {
                          setShowNewSection(true);
                        } else {
                          updateFormData({ sectionId: value === 'none' ? undefined : value });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('placeholders.chooseSection')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t('section.none')}</SelectItem>
                        {sections.map((section) => (
                          <SelectItem key={section.id} value={section.id}>
                            {section.name}
                          </SelectItem>
                        ))}
                        <Separator />
                        <SelectItem value="create-new">
                          <div className="flex items-center gap-2 text-primary">
                            <Plus className="h-3 w-3" />
                            <span>{t('section.createNew')}</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={newSectionName}
                          onChange={(e) => setNewSectionName(e.target.value)}
                          placeholder={t('placeholders.newSectionName')}
                          className="flex-1"
                          autoFocus
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            if (newSectionName.trim()) {
                              createSectionMutation.mutate({
                                classId: classId as string,
                                name: newSectionName.trim(),
                                color: newSectionColor
                              });
                            }
                          }}
                          disabled={!newSectionName.trim()}
                        >
                          {t('actions.add')}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowNewSection(false);
                            setNewSectionName('');
                            setNewSectionColor('#3b82f6');
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <ColorPicker
                          value={newSectionColor}
                          onChange={setNewSectionColor}
                          label={t('fields.sectionColor')}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Assignment Options */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 rounded-lg border">
                    <Checkbox
                      id="graded"
                      checked={formData.graded || false}
                      onCheckedChange={(checked) => updateFormData({ graded: !!checked })}
                    />
                    <div className="flex-1">
                      <Label htmlFor="graded" className="text-sm font-medium cursor-pointer">
                        {t('options.graded.label')}
                      </Label>
                      <p className="text-xs text-muted-foreground">{t('options.graded.description')}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 rounded-lg border">
                    <Checkbox
                      id="inProgress"
                      checked={formData.inProgress || false}
                      onCheckedChange={(checked) => updateFormData({ inProgress: !!checked })}
                    />
                    <div className="flex-1">
                      <Label htmlFor="inProgress" className="text-sm font-medium cursor-pointer">
                        {t('options.draft.label')}
                      </Label>
                      <p className="text-xs text-muted-foreground">{t('options.draft.description')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Grading & Assessment */}
            {formData.graded && (
              <Card>
                <CardHeader>
                <CardTitle>{t('sections.grading')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Rubric Selection */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{t('fields.rubric')}</Label>
                      <Select
                        value={formData.markSchemeId || 'none'}
                        onValueChange={(value) => {
                          if (value === 'none') {
                            if (formData.markSchemeId) {
                              detachMarkSchemeMutation.mutate({ classId, assignmentId });
                            }
                          } else {
                            attachMarkSchemeMutation.mutate({ classId, assignmentId, markSchemeId: value });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('placeholders.chooseRubric')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{t('rubric.none')}</SelectItem>
                          {markSchemes?.map((markScheme) => {
                            let name = t('rubric.untitled');
                            try {
                              if (markScheme.structured && markScheme.structured.trim()) {
                                const parsed = JSON.parse(markScheme.structured);
                                name = parsed.name || t('rubric.untitled');
                              }
                            } catch {
                              name = t('rubric.untitled');
                            }
                            return (
                              <SelectItem key={markScheme.id} value={markScheme.id}>
                                <div className="flex items-center gap-2">
                                  <ClipboardCheck className="h-3 w-3" />
                                  {name}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Grading Boundaries */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{t('fields.gradeScale')}</Label>
                      <Select
                        value={formData.gradingBoundaryId || 'none'}
                        onValueChange={(value) => {
                          if (value === 'none') {
                            if (formData.gradingBoundaryId) {
                              detachGradingBoundaryMutation.mutate({ classId, assignmentId });
                            }
                          } else {
                            attachGradingBoundaryMutation.mutate({ classId, assignmentId, gradingBoundaryId: value });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('placeholders.chooseGradeScale')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{t('gradeScale.default')}</SelectItem>
                          {gradingBoundaries?.map((boundary) => {
                            let name = t('gradeScale.untitled');
                            try {
                              if (boundary.structured && boundary.structured.trim()) {
                                const parsed = JSON.parse(boundary.structured);
                                name = parsed.name || t('gradeScale.untitled');
                              }
                            } catch {
                              name = t('gradeScale.untitled');
                            }
                            return (
                              <SelectItem key={boundary.id} value={boundary.id}>
                                <div className="flex items-center gap-2">
                                  <ClipboardList className="h-3 w-3" />
                                  {name}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Scoring Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {!formData.markSchemeId && (
                      <div className="space-y-2">
                        <Label htmlFor="maxGrade" className="text-sm font-medium">{t('fields.maxPoints')}</Label>
                        <Input
                          id="maxGrade"
                          type="number"
                          value={formData.maxGrade || 0}
                          onChange={(e) => updateFormData({ maxGrade: parseInt(e.target.value) || 0 })}
                          min="0"
                          placeholder={t('placeholders.maxPoints')}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="weight" className="text-sm font-medium">{t('fields.weight')}</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={formData.weight || 0}
                        onChange={(e) => updateFormData({ weight: parseInt(e.target.value) || 0 })}
                        min="0"
                        step="0.1"
                        placeholder={t('placeholders.weight')}
                      />
                    </div>
                  </div>

                  {formData.markSchemeId && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <ClipboardCheck className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-700 dark:text-blue-300">
                        {t('rubric.autoCalculate')}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 📦 Deliverables Section */}
            <Card>
              <CardHeader>
                <CardTitle>{t('sections.deliverables')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* File Upload */}
                <div className="flex items-center space-x-3 p-3 rounded-lg border">
                  <Checkbox
                    id="fileUpload"
                    checked={formData.acceptFiles || false}
                    onCheckedChange={(checked) => updateFormData({ acceptFiles: !!checked })}
                  />
                  <div className="flex-1">
                    <Label htmlFor="fileUpload" className="text-sm font-medium cursor-pointer">
                      {t('deliverables.fileUpload.label')}
                    </Label>
                    <p className="text-xs text-muted-foreground">{t('deliverables.fileUpload.description')}</p>
                  </div>
                </div>

                {/* Extended Response */}
                <div className="flex items-center space-x-3 p-3 rounded-lg border">
                  <Checkbox
                    id="extendedResponse"
                    checked={formData.acceptExtendedResponse || false}
                    onCheckedChange={(checked) => updateFormData({ acceptExtendedResponse: !!checked })}
                  />
                  <div className="flex-1">
                    <Label htmlFor="extendedResponse" className="text-sm font-medium cursor-pointer">
                      {t('deliverables.extendedResponse.label')}
                    </Label>
                    <p className="text-xs text-muted-foreground">{t('deliverables.extendedResponse.description')}</p>
                  </div>
                </div>

                {/* Worksheet Submission */}
                <div
                  className={`w-full rounded-lg border transition-all overflow-hidden ${
                    formData.acceptWorksheet ? 'border-primary bg-primary/5 dark:bg-primary/10' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3 p-3">
                    <Checkbox
                      id="worksheetSubmission"
                      checked={formData.acceptWorksheet || false}
                      onCheckedChange={(checked) => {
                        updateFormData({ acceptWorksheet: !!checked });
                      }}
                    />
                    <div className="flex-1">
                      <Label htmlFor="worksheetSubmission" className="text-sm font-medium cursor-pointer">
                        {t('deliverables.worksheetSubmission.label')}
                      </Label>
                      <p className="text-xs text-muted-foreground">{t('deliverables.worksheetSubmission.description')}</p>
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${formData.acceptWorksheet ? 'rotate-180' : ''}`} />
                  </div>
                  {formData.acceptWorksheet && (
                    <div className="px-3 pb-3 pt-0 space-y-3 animate-in slide-in-from-top-2 duration-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder={t('deliverables.worksheetSubmission.searchPlaceholder')}
                          value={worksheetSearchQuery}
                          onChange={(e) => setWorksheetSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      {filteredWorksheets.length > 0 && (
                        <div className="text-xs text-muted-foreground mb-2">
                          {t('deliverables.worksheetSubmission.found', { count: filteredWorksheets.length })}
                        </div>
                      )}
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {filteredWorksheets.map((worksheet) => {
                          const isSelected = formData.worksheetIds?.includes(worksheet.id);
                          return (
                            <div
                              key={worksheet.id}
                              className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                isSelected ? 'bg-primary/10 dark:bg-primary/20 border-primary/20' : 'hover:bg-muted/50'
                              }`}
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => {
                                  const currentIds = formData.worksheetIds || [];
                                  const newIds = checked
                                    ? (currentIds.includes(worksheet.id) ? currentIds : [...currentIds, worksheet.id])
                                    : currentIds.filter(id => id !== worksheet.id);
                                  updateFormData({ worksheetIds: newIds });
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm flex-1">{worksheet.name}</span>
                            </div>
                          );
                        })}
                      </div>
                      {filteredWorksheets.length === 0 && worksheetSearchQuery && (
                        <div className="text-sm text-muted-foreground text-center py-4">
                          {t('deliverables.worksheetSubmission.noResults')}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Grade and feedback with AI */}
                <div className="flex items-center space-x-3 p-3 rounded-lg border">
                  <Checkbox
                    id="aiGrading"
                    checked={formData.gradeWithAI || false}
                    onCheckedChange={(checked) => updateFormData({ gradeWithAI: !!checked })}
                  />
                  <div className="flex-1">
                    <Label htmlFor="gradeWithAI" className="text-sm font-medium cursor-pointer">
                      {t('deliverables.aiGrading.label')}
                    </Label>
                    <p className="text-xs text-muted-foreground">{t('deliverables.aiGrading.description')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 🤖 AI Policy Section */}
            <Card>
              <CardHeader>
                <CardTitle>{t('sections.aiPolicy')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiPolicyLevels.map((policy) => {
                  const isSelected = formData.aiPolicyLevel === policy.level;
                  return (
                    <Collapsible
                      key={policy.level}
                      open={isSelected}
                      onOpenChange={(open) => {
                        if (open) {
                          updateFormData({ aiPolicyLevel: policy.level });
                        }
                      }}
                    >
                      <div
                        className={`w-full rounded-lg border cursor-pointer transition-all ${
                          isSelected ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'hover:bg-muted/50'
                        }`}
                      >
                        <CollapsibleTrigger asChild>
                          <div className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={`w-3 h-3 rounded-full ${policy.color} mt-1.5 flex-shrink-0`} />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-sm">{policy.title}</h4>
                                  <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${isSelected ? 'rotate-180' : ''}`} />
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
                })}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Attachments */}
            <Card>
              <CardHeader>
                <CardTitle>Attachments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {assignment.attachments.length > 0 ? (
                  <DndProvider backend={HTML5Backend}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {convertAttachmentsToFileItems(assignment.attachments).map((fileItem: FileItem) => (
                        <DraggableFileItem
                          key={fileItem.id}
                          item={fileItem}
                          classId={classId}
                          readonly={false}
                          handlers={fileHandlers}
                          getFileIcon={getFileIcon}
                        />
                      ))}
                    </div>
                  </DndProvider>
                ) : (
                  <EmptyState
                    icon={FileText}
                    title="No attachments"
                    description="Upload files to attach to this assignment."
                  />
                )}

                <Separator />

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

                <div>
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex items-center justify-center w-full p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-muted-foreground/50 transition-colors">
                      <div className="text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">Upload files</p>
                        <p className="text-xs text-muted-foreground">Click to select files or drag and drop</p>
                      </div>
                    </div>
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="*/*"
                    disabled={isUploading}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Event Attachment */}
            <Card>
              <CardHeader>
                <CardTitle>Event Attachment</CardTitle>
              </CardHeader>
              <CardContent>
                {assignment.eventAttached ? (
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{assignment.eventAttached.name}</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Detach event using specific endpoint
                          detachEventMutation.mutate({ classId, assignmentId });
                        }}
                      >
                        Detach
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(assignment.eventAttached.startTime), 'MMM d, yyyy \'at\' h:mm a')}
                    </p>
                    {assignment.eventAttached.location && (
                      <p className="text-xs text-muted-foreground mt-1">
                        📍 {assignment.eventAttached.location}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Attach to Event</Label>
                      <Select
                        value="none"
                        onValueChange={(value) => {
                          if (value !== 'none') {
                            attachToEventMutation.mutate({ classId, assignmentId, eventId: value });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose event" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No event</SelectItem>
                          {availableEvents?.events.map((event) => (
                            <SelectItem key={event.id} value={event.id}>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                <span>{event.name}</span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  {format(new Date(event.startTime), 'MMM d')}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
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
              case "delete":
                await fileHandlers.onDelete(item);
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

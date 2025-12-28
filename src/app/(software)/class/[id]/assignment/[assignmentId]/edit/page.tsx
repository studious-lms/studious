"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageLayout } from "@/components/ui/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import ColorPicker from "@/components/ui/color-picker";
import { OptionCard, ExpandableOptionCard } from "@/components/ui/option-card";
import { AIPolicySelector } from "@/components/ui/ai-policy-card";
import { useTranslations } from "next-intl";
import { 
  ArrowLeft,
  Save,
  Upload,
  Calendar,
  BookOpen,
  Plus,
  X,
  Users,
  Search,
  FileText,
  Image as ImageIcon,
  ClipboardCheck,
  ClipboardList,
  Target,
  Sparkles,
  FileUp,
  Link2,
} from "lucide-react";
import { format } from "date-fns";
import { trpc, type RouterOutputs, type RouterInputs } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import { DraggableFileItem } from "@/components/DraggableFileItem";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FileItem, FileHandlers } from "@/lib/types/file";
import { baseFileHandler } from "@/lib/file/fileHandler";
import { fixUploadUrl } from "@/lib/directUpload";
import AttachmentPreview from "@/components/AttachmentPreview";

type Assignment = RouterOutputs['assignment']['get'];
type AssignmentUpdateInput = RouterInputs['assignment']['update'];
type AssignmentType = 'HOMEWORK' | 'QUIZ' | 'TEST' | 'PROJECT' | 'ESSAY' | 'DISCUSSION' | 'PRESENTATION' | 'LAB' | 'OTHER';

function AssignmentEditSkeleton() {
  return (
    <div className="space-y-6">
      {/* Back button */}
      <Skeleton className="h-4 w-16" />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Details section */}
          <div className="space-y-4">
            <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
          </div>
          
          {/* Options */}
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>
        
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
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

  // Upload progress state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUploadStatus, setCurrentUploadStatus] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

  // Mutations
  const getAssignmentUploadUrls = trpc.assignment.getAssignmentUploadUrls.useMutation();
  const confirmAssignmentUpload = trpc.assignment.confirmAssignmentUpload.useMutation();

  const attachMarkSchemeMutation = trpc.assignment.attachMarkScheme.useMutation({
    onSuccess: () => {
      toast.success("Rubric attached successfully.");
      refetchAssignment();
    },
    onError: (error) => toast.error(error.message || "Failed to attach rubric."),
  });

  const detachMarkSchemeMutation = trpc.assignment.detachMarkScheme.useMutation({
    onSuccess: () => {
      toast.success("Rubric detached successfully.");
      refetchAssignment();
    },
    onError: (error) => toast.error(error.message || "Failed to detach rubric."),
  });

  const attachGradingBoundaryMutation = trpc.assignment.attachGradingBoundary.useMutation({
    onSuccess: () => {
      toast.success("Grading boundary attached successfully.");
      handleSave();
      refetchAssignment();
    },
    onError: (error) => toast.error(error.message || "Failed to attach grading boundary."),
  });

  const detachGradingBoundaryMutation = trpc.assignment.detachGradingBoundary.useMutation({
    onSuccess: () => {
      toast.success("Grading boundary detached successfully.");
      handleSave();
      refetchAssignment();
    },
    onError: (error) => toast.error(error.message || "Failed to detach grading boundary."),
  });

  const attachToEventMutation = trpc.assignment.attachToEvent.useMutation({
    onSuccess: () => {
      toast.success("Event attached successfully.");
      handleSave();
      refetchAssignment();
    },
    onError: (error) => toast.error(error.message || "Failed to attach event."),
  });

  const detachEventMutation = trpc.assignment.detachEvent.useMutation({
    onSuccess: () => {
      toast.success("Event detached successfully.");
      handleSave();
      refetchAssignment();
    },
    onError: (error) => toast.error(error.message || "Failed to detach event."),
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
    onError: (error) => toast.error(error.message),
  });

  // Queries
  const { data: availableEvents } = trpc.assignment.getAvailableEvents.useQuery({ assignmentId, classId });
  const { data: assignment, isLoading, refetch: refetchAssignment } = trpc.assignment.get.useQuery({ id: assignmentId, classId });
  const { data: classData } = trpc.class.get.useQuery({ classId });
  const { data: markSchemes } = trpc.class.listMarkSchemes.useQuery({ classId });
  const { data: gradingBoundaries } = trpc.class.listGradingBoundaries.useQuery({ classId });
  const { data: worksheetsData } = trpc.worksheet.listWorksheets.useQuery({ classId });

  const sections = classData?.class?.sections || [];
  const students = classData?.class?.students || [];

  const filteredWorksheets = useMemo(() => {
    if (!worksheetsData) return [];
    if (!worksheetSearchQuery.trim()) return worksheetsData;
    return worksheetsData.filter(worksheet =>
      worksheet.name.toLowerCase().includes(worksheetSearchQuery.toLowerCase())
    );
  }, [worksheetsData, worksheetSearchQuery]);

  // AI Policy levels

  const updateAssignmentMutation = trpc.assignment.update.useMutation({
    onSuccess: () => {
      toast.success("Assignment saved");
      setHasChanges(false);
      refetchAssignment();
    },
    onError: (error) => toast.error(error.message || "There was a problem saving your changes. Please try again."),
  });

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

    setIsUploading(true);
    setUploadProgress(0);
    setCurrentUploadStatus('Preparing upload...');
    setTotalFiles(files.length);
    setUploadedFiles(0);

    try {
      const fileMetadata = Array.from(files).map(file => ({
        name: file.name,
        type: file.type,
        size: file.size
      }));

      setCurrentUploadStatus('Getting upload URLs...');
      setUploadProgress(10);

      const uploadResponse = await getAssignmentUploadUrls.mutateAsync({
        assignmentId,
        classId,
        files: fileMetadata
      });

      setUploadProgress(20);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadFile = uploadResponse.uploadFiles[i];

        try {
          setCurrentUploadStatus(`Uploading ${file.name}...`);
          const fileProgress = 20 + ((i / files.length) * 60);
          setUploadProgress(fileProgress);

          const uploadUrl = fixUploadUrl(uploadFile.uploadUrl);

          const response = await fetch(uploadUrl, {
            method: 'POST',
            body: file,
            headers: { 'Content-Type': file.type }
          });

          if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);

          setCurrentUploadStatus(`Confirming ${file.name}...`);
          await confirmAssignmentUpload.mutateAsync({
            fileId: uploadFile.id,
            uploadSuccess: true,
            classId
          });

          setUploadedFiles(i + 1);
        } catch (error) {
          await confirmAssignmentUpload.mutateAsync({
            fileId: uploadFile.id,
            uploadSuccess: false,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            classId
          });
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      setCurrentUploadStatus('Finalizing...');
      setUploadProgress(90);
      refetchAssignment();
      setUploadProgress(100);
      setCurrentUploadStatus('Upload complete!');
      toast.success("Files uploaded successfully");
      event.target.value = '';

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setCurrentUploadStatus('');
        setUploadedFiles(0);
        setTotalFiles(0);
      }, 1000);
    } catch {
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

  const fileHandlers: FileHandlers = {
    ...baseFileHandler,
    onDelete: async (item: FileItem) => removeAttachment(item.id),
    onMove: async () => {},
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
          {/* Back button */}
          <button 
              onClick={() => router.back()}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
            {tAssignments('actions.back')}
          </button>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
            <h1 className="text-2xl font-bold">{tAssignments('actions.edit')}</h1>
              <p className="text-muted-foreground text-sm">{assignment.title}</p>
          </div>
          
            <div className="flex items-center gap-2">
            {hasChanges && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 border-0">
                  Unsaved changes
                </Badge>
            )}
            <Button 
              onClick={handleSave}
              disabled={!hasChanges || updateAssignmentMutation.isPending}
            >
                <Save className="h-4 w-4 mr-2" />
                {updateAssignmentMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column */}
          <div className="xl:col-span-2 space-y-6">
              
              {/* Details Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">{t('sections.details')}</h2>
                
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">{t('fields.title')}</Label>
                    <Input
                      id="title"
                      value={formData.title || ''}
                      onChange={(e) => updateFormData({ title: e.target.value })}
                      placeholder={t('placeholders.title')}
                    />
                </div>

                {/* Instructions */}
                <div className="space-y-2">
                  <Label htmlFor="instructions">{t('fields.instructions')}</Label>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <SelectItem key={section.id} value={section.id}>{section.name}</SelectItem>
                        ))}
                        <Separator className="my-1" />
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
                          size="sm"
                          onClick={() => {
                            if (newSectionName.trim()) {
                              createSectionMutation.mutate({
                                classId,
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
                        <ColorPicker
                          value={newSectionColor}
                          onChange={setNewSectionColor}
                          label={t('fields.sectionColor')}
                        />
                    </div>
                  )}
                </div>

                {/* Students */}
                <div className="space-y-2">
                  <Label>{t('fields.students')}</Label>
                  <div className="flex flex-wrap gap-2 p-3 min-h-[44px] border rounded-lg bg-muted/30">
                    {(!formData.studentIds || formData.studentIds.length === 0) ? (
                      <Badge variant="secondary">
                        <Users className="h-3 w-3 mr-1" />
                        {t('students.all')}
                      </Badge>
                    ) : (
                      formData.studentIds.map((studentId) => {
                        const student = students.find(s => s.id === studentId);
                        return student ? (
                          <Badge key={studentId} variant="secondary">
                            {student.username}
                            <button
                              type="button"
                              onClick={() => {
                                const newIds = formData.studentIds?.filter(id => id !== studentId) || [];
                                updateFormData({ studentIds: newIds });
                              }}
                              className="ml-1.5 hover:bg-muted rounded-full"
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
                      <SelectTrigger className="h-7 w-auto border-0 shadow-none bg-transparent hover:bg-muted">
                        <Plus className="h-3 w-3" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('students.all')}</SelectItem>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>{student.username}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                    </div>
                  </div>

              <Separator />

              {/* Options Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Options</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <OptionCard
                    checked={formData.graded || false}
                    onCheckedChange={(checked) => updateFormData({ graded: checked })}
                    title={t('options.graded.label')}
                    description={t('options.graded.description')}
                  />
                  <OptionCard
                      checked={formData.inProgress || false}
                    onCheckedChange={(checked) => updateFormData({ inProgress: checked })}
                    title={t('options.draft.label')}
                    description={t('options.draft.description')}
                    />
                    </div>
                  </div>

              {/* Grading Section */}
            {formData.graded && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">{t('sections.grading')}</h2>
                    
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Rubric */}
                    <div className="space-y-2">
                        <Label>{t('fields.rubric')}</Label>
                      <Select
                        value={formData.markSchemeId || 'none'}
                        onValueChange={(value) => {
                          if (value === 'none') {
                              if (formData.markSchemeId) detachMarkSchemeMutation.mutate({ classId, assignmentId });
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
                                if (markScheme.structured?.trim()) {
                                const parsed = JSON.parse(markScheme.structured);
                                name = parsed.name || t('rubric.untitled');
                              }
                              } catch { name = t('rubric.untitled'); }
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

                      {/* Grade Scale */}
                    <div className="space-y-2">
                        <Label>{t('fields.gradeScale')}</Label>
                      <Select
                        value={formData.gradingBoundaryId || 'none'}
                        onValueChange={(value) => {
                          if (value === 'none') {
                              if (formData.gradingBoundaryId) detachGradingBoundaryMutation.mutate({ classId, assignmentId });
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
                                if (boundary.structured?.trim()) {
                                const parsed = JSON.parse(boundary.structured);
                                name = parsed.name || t('gradeScale.untitled');
                              }
                              } catch { name = t('gradeScale.untitled'); }
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

                    {/* Points & Weight */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {!formData.markSchemeId && (
                      <div className="space-y-2">
                          <Label htmlFor="maxGrade">{t('fields.maxPoints')}</Label>
                        <Input
                          id="maxGrade"
                          type="number"
                          value={formData.maxGrade || 0}
                          onChange={(e) => updateFormData({ maxGrade: parseInt(e.target.value) || 0 })}
                          min="0"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="weight">{t('fields.weight')}</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={formData.weight || 0}
                        onChange={(e) => updateFormData({ weight: parseInt(e.target.value) || 0 })}
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>

                  {formData.markSchemeId && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <ClipboardCheck className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-700 dark:text-blue-300">{t('rubric.autoCalculate')}</span>
                    </div>
                  )}
                  </div>
                </>
            )}

              <Separator />

              {/* Deliverables Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">{t('sections.deliverables')}</h2>
                
                <div className="space-y-3">
                  <OptionCard
                    checked={formData.acceptFiles || false}
                    onCheckedChange={(checked) => updateFormData({ acceptFiles: checked })}
                    title={t('deliverables.fileUpload.label')}
                    description={t('deliverables.fileUpload.description')}
                    icon={FileUp}
                  />

                  <OptionCard
                    checked={formData.acceptExtendedResponse || false}
                    onCheckedChange={(checked) => updateFormData({ acceptExtendedResponse: checked })}
                    title={t('deliverables.extendedResponse.label')}
                    description={t('deliverables.extendedResponse.description')}
                    icon={FileText}
                  />

                  <ExpandableOptionCard
                      checked={formData.acceptWorksheet || false}
                    onCheckedChange={(checked) => updateFormData({ acceptWorksheet: checked })}
                    title={t('deliverables.worksheetSubmission.label')}
                    description={t('deliverables.worksheetSubmission.description')}
                    icon={ClipboardList}
                    expandedContent={
                      <div className="space-y-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder={t('deliverables.worksheetSubmission.searchPlaceholder')}
                          value={worksheetSearchQuery}
                          onChange={(e) => setWorksheetSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {filteredWorksheets.map((worksheet) => {
                          const isSelected = formData.worksheetIds?.includes(worksheet.id);
                          return (
                            <div
                              key={worksheet.id}
                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                  isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                              }`}
                                onClick={() => {
                                  const currentIds = formData.worksheetIds || [];
                                  const newIds = isSelected
                                    ? currentIds.filter(id => id !== worksheet.id)
                                    : [...currentIds, worksheet.id];
                                  updateFormData({ worksheetIds: newIds });
                                }}
                              >
                                <Checkbox checked={isSelected} onClick={(e) => e.stopPropagation()} />
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm flex-1">{worksheet.name}</span>
                            </div>
                          );
                        })}
                          {filteredWorksheets.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              {worksheetSearchQuery ? t('deliverables.worksheetSubmission.noResults') : 'No worksheets available'}
                            </p>
                      )}
                    </div>
                </div>
                    }
                  />

                  <OptionCard
                    checked={formData.gradeWithAI || false}
                    onCheckedChange={(checked) => updateFormData({ gradeWithAI: checked })}
                    title={t('deliverables.aiGrading.label')}
                    description={t('deliverables.aiGrading.description')}
                    icon={Sparkles}
                  />
                  </div>
                </div>

              <Separator />

              {/* AI Policy Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">{t('sections.aiPolicy')}</h2>
                
                <AIPolicySelector
                  selectedLevel={formData.aiPolicyLevel || 4}
                  onSelectLevel={(level) => updateFormData({ aiPolicyLevel: level })}
                />
                                </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Attachments */}
            <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Attachments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {assignment.attachments.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {convertAttachmentsToFileItems(assignment.attachments).map((fileItem: FileItem) => (
                        <AttachmentPreview
                          key={fileItem.id}
                          fileItem={fileItem}
                          onRemove={() => removeAttachment(fileItem.id)}
                          // classId={classId}
                          // readonly={false}
                          // handlers={fileHandlers}
                        />
                      ))}
                    </div>
                ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No attachments yet
                    </div>
                )}

                {/* Upload Progress */}
                {isUploading && (
                    <div className="space-y-2 p-3 bg-muted rounded-lg">
                      <div className="flex justify-between text-xs">
                        <span>{currentUploadStatus}</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                      <Progress value={uploadProgress} className="h-1.5" />
                    {totalFiles > 0 && (
                      <p className="text-xs text-muted-foreground text-center">
                          {uploadedFiles} of {totalFiles} files
                      </p>
                    )}
                  </div>
                )}

                  <Label htmlFor="file-upload" className="cursor-pointer block">
                    <div className="flex items-center justify-center p-4 border-2 border-dashed rounded-lg hover:border-primary/50 transition-colors">
                      <div className="text-center">
                        <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">Upload files</p>
                        <p className="text-xs text-muted-foreground">Click or drag and drop</p>
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
              </CardContent>
            </Card>

            {/* Event Attachment */}
            <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    Linked Event
                  </CardTitle>
              </CardHeader>
              <CardContent>
                {assignment.eventAttached ? (
                    <div className="p-3 rounded-lg border bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{assignment.eventAttached.name}</h4>
                      <Button
                          variant="ghost"
                        size="sm"
                          className="h-7 text-xs"
                          onClick={() => detachEventMutation.mutate({ classId, assignmentId })}
                      >
                        Detach
                      </Button>
                    </div>
                      <p className="text-xs text-muted-foreground">
                      {format(new Date(assignment.eventAttached.startTime), 'MMM d, yyyy \'at\' h:mm a')}
                    </p>
                    {assignment.eventAttached.location && (
                      <p className="text-xs text-muted-foreground mt-1">
                        📍 {assignment.eventAttached.location}
                      </p>
                    )}
                  </div>
                ) : (
                      <Select
                        value="none"
                        onValueChange={(value) => {
                          if (value !== 'none') {
                            attachToEventMutation.mutate({ classId, assignmentId, eventId: value });
                          }
                        }}
                      >
                        <SelectTrigger>
                        <SelectValue placeholder="Attach to event" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No event</SelectItem>
                          {availableEvents?.events.map((event) => (
                            <SelectItem key={event.id} value={event.id}>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                <span>{event.name}</span>
                              <span className="text-xs text-muted-foreground">
                                  {format(new Date(event.startTime), 'MMM d')}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </PageLayout>
    </DndProvider>
  );
}

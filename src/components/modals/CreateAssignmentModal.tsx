"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import ColorPicker from "@/components/ui/color-picker";
import {
  Plus,
  FileText,
  Upload,
  X,
  ClipboardCheck,
  ClipboardList,
  Calendar,
  Target,
  BookOpen,
  Trash2,
  Loader2,
  CheckCircle,
  FileUp
} from "lucide-react";
import { useParams } from "next/navigation";
import {
  trpc,
} from "@/lib/trpc";
import { fixUploadUrl } from "@/lib/directUpload";
import { useTranslations } from "next-intl";


type FileData = {
  id?: string;
  name: string;
  type: string;
  size: number;
  data?: string; // Optional for base64 files
  file?: File; // For direct upload files
};

interface AssignmentFormData {
  title: string;
  instructions: string;
  dueDate: string;
  sectionId?: string;
  graded: boolean;
  maxGrade: number;
  weight: number;
  type: 'HOMEWORK' | 'QUIZ' | 'TEST' | 'PROJECT' | 'ESSAY' | 'DISCUSSION' | 'PRESENTATION' | 'LAB' | 'OTHER';
  markSchemeId?: string | null;
  gradingBoundaryId?: string | null;
  inProgress: boolean;
  files: FileData[];
}

interface CreateAssignmentModalProps {
  children?: React.ReactNode;
  onAssignmentCreated?: (assignmentData: AssignmentFormData) => void;
}

const defaultFormData: AssignmentFormData = {
  title: '',
  instructions: '',
  dueDate: new Date().toISOString().split('T')[0],
  sectionId: undefined,
  graded: false,
  maxGrade: 100,
  weight: 1,
  type: 'HOMEWORK',
  markSchemeId: null,
  gradingBoundaryId: null,
  inProgress: false,
  files: []
};

export function CreateAssignmentModal({ children, onAssignmentCreated }: CreateAssignmentModalProps) {
  const t = useTranslations('components.createAssignment');
  
  const assignmentTypes: { label: string; value: AssignmentFormData['type']; icon: React.ReactNode }[] = [
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
  
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<AssignmentFormData>(defaultFormData);
  const [showNewSection, setShowNewSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionColor, setNewSectionColor] = useState('#3b82f6');
  
  // Progress tracking state
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStatus, setCurrentStatus] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

  const { id: classId } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API queries
  const { data: classData } = trpc.class.get.useQuery({ classId: classId as string });
  const { data: markSchemes } = trpc.class.listMarkSchemes.useQuery({ classId: classId as string });
  const { data: gradingBoundaries } = trpc.class.listGradingBoundaries.useQuery({ classId: classId as string });

  // Mutations
  const utils = trpc.useUtils();
  const createAssignmentMutation = trpc.assignment.create.useMutation({
    onSuccess: (data) => {
      console.log('Assignment created successfully:', data);
    },
    onError: (error) => {
      console.error('Failed to create assignment:', error);
      toast.error(t('toasts.errorFailed'));
    }
  });
  const getAssignmentUploadUrls = trpc.assignment.getAssignmentUploadUrls.useMutation();
  const confirmAssignmentUpload = trpc.assignment.confirmAssignmentUpload.useMutation();
  const createSectionMutation = trpc.section.create.useMutation({
    onSuccess: (data) => {
      setFormData(prev => ({ ...prev, sectionId: data.id }));
      setShowNewSection(false);
      setNewSectionName('');
      setNewSectionColor('#3b82f6');
      toast.success(t('toasts.sectionCreated', { name: data.name }));
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const sections = classData?.class?.sections || [];

  const resetForm = () => {
    setFormData(defaultFormData);
    setShowNewSection(false);
    setNewSectionName('');
    setNewSectionColor('#3b82f6');
    setIsCreating(false);
    setProgress(0);
    setCurrentStatus('');
    setUploadedFiles(0);
    setTotalFiles(0);
  };

  // Status messages for different stages
  const statusMessages = [
    t('status.creating'),
    t('status.settingUp'),
    t('status.preparing'),
    t('status.uploading'),
    t('status.processing'),
    t('status.finalizing'),
    t('status.assigning'),
    t('status.almostDone')
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    // Store files temporarily - we'll upload them after assignment creation
    const newFiles: FileData[] = files.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size,
      // Store the actual File object for later upload
      file: file
    } as FileData & { file: File }));

        setFormData(prev => ({
          ...prev,
      files: [...prev.files, ...newFiles]
    }));
    
    console.log('Files added to form, will upload after assignment creation');
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.instructions.trim()) {
      toast.error(t('toasts.errorRequired'));
      return;
    }

    setIsCreating(true);
    setProgress(0);
    setCurrentStatus(statusMessages[0]);

    try {
      // 1. Create assignment WITHOUT files first
      setCurrentStatus(statusMessages[1]);
      setProgress(20);
      
      const assignmentData = {
        classId: classId as string,
        title: formData.title,
        instructions: formData.instructions,
        dueDate: formData.dueDate,
        maxGrade: formData.graded ? formData.maxGrade : undefined,
        graded: formData.graded,
        weight: formData.graded ? formData.weight : undefined,
        sectionId: formData.sectionId || undefined,
        type: formData.type,
        markSchemeId: formData.markSchemeId === "none" || formData.markSchemeId === null ? undefined : formData.markSchemeId,
        gradingBoundaryId: formData.gradingBoundaryId === "none" || formData.gradingBoundaryId === null ? undefined : formData.gradingBoundaryId,
        inProgress: formData.inProgress
      };

      const assignment = await createAssignmentMutation.mutateAsync(assignmentData);
      setProgress(30);

      // 2. If there are files, upload them using direct upload
      const filesToUpload = formData.files.filter(file => file.file && !file.id);
      if (filesToUpload.length > 0) {
        setCurrentStatus(statusMessages[2]);
        setProgress(40);
        setTotalFiles(filesToUpload.length);
        setUploadedFiles(0);
        
        // Convert files to metadata (no base64!)
        const fileMetadata = filesToUpload.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size,
        }));

        // Get upload URLs from backend
        setCurrentStatus(statusMessages[3]);
        setProgress(50);
        const uploadResponse = await getAssignmentUploadUrls.mutateAsync({
          assignmentId: assignment.id,
          classId: classId as string,
          files: fileMetadata,
        });

        // Upload files through backend proxy (not direct to GCS)
        for (let i = 0; i < filesToUpload.length; i++) {
          const fileData = filesToUpload[i];
          const uploadFile = uploadResponse.uploadFiles[i];

          try {
            // Update status for current file
            setCurrentStatus(t('status.uploadingFile', { name: fileData.name }));
            
            // Fix upload URL to use correct API base URL from environment
            const uploadUrl = fixUploadUrl(uploadFile.uploadUrl);
            
            // Upload to backend proxy endpoint (resolves CORS issues)
            const response = await fetch(uploadUrl, {
              method: 'POST', // Backend proxy uses POST
              body: fileData.file!,
              headers: {
                'Content-Type': fileData.type,
              },
            });

            if (!response.ok) {
              throw new Error(`Upload failed: ${response.statusText}`);
            }

            // Confirm upload to backend
            await confirmAssignmentUpload.mutateAsync({
              fileId: uploadFile.id,
              uploadSuccess: true,
              classId: classId as string,
            });

            // Update progress
            setUploadedFiles(prev => prev + 1);
            const fileProgress = 50 + ((i + 1) / filesToUpload.length) * 30; // 50-80% for file uploads
            setProgress(fileProgress);
            
            console.log(`File ${fileData.name} uploaded successfully`);
          } catch (error) {
            // Report error to backend
            await confirmAssignmentUpload.mutateAsync({
              fileId: uploadFile.id,
              uploadSuccess: false,
              errorMessage: error instanceof Error ? error.message : 'Unknown error',
              classId: classId as string,
            });

            console.error(`Upload failed for ${fileData.name}:`, error);
            toast.error(t('toasts.errorUploadFailed', { name: fileData.name }));
          }
        }

        // Invalidate assignment detail so attachments show immediately
        setCurrentStatus(statusMessages[4]);
        setProgress(85);
        await utils.assignment.get.invalidate({ id: assignment.id, classId: classId as string });
      }

      // Final steps
      setCurrentStatus(statusMessages[5]);
      setProgress(90);
      
      setCurrentStatus(statusMessages[6]);
      setProgress(95);
      
      setCurrentStatus(statusMessages[7]);
      setProgress(100);

      toast.success(formData.inProgress ? t('toasts.successDraft') : t('toasts.successCreated'));

      onAssignmentCreated?.(formData);
      
      // Small delay to show completion
      setTimeout(() => {
        setOpen(false);
        resetForm();
      }, 1000);
    } catch (error) {
      console.error('Failed to create assignment:', error);
      toast.error(t('toasts.errorFailed'));
      setIsCreating(false);
      setProgress(0);
      setCurrentStatus('');
    }
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t('buttonLabel')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">

        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {t('title')}
          </DialogTitle>
        </DialogHeader>

        {/* Inline Progress Indicator */}
        {isCreating && (
          <div className="mb-6 p-4 bg-muted/50 rounded-lg border">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm font-medium">{t('status.creatingProgress')}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{currentStatus}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {totalFiles > 0 && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileUp className="w-3 h-3" />
                  <span>{t('files.filesUploaded', { uploaded: uploadedFiles, total: totalFiles })}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="space-y-8 pr-4">
            {/* 📝 Basic Information Section */}
            <div className="space-y-6">
              <div className="text-lg font-semibold">
                {t('sections.details')}
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">{t('fields.title')}</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={t('placeholders.title')}
                    className="text-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions" className="text-sm font-medium">{t('fields.instructions')}</Label>
                  <Textarea
                    id="instructions"
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder={t('placeholders.instructions')}
                    rows={4}
                    className="resize-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* ⚙️ Assignment Configuration */}
            <div className="space-y-6">
              <div className="text-lg font-semibold">
                {t('sections.configuration')}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Side - Basic Settings */}
                <div className="space-y-4">
                  {/* Due Date */}
                  <div className="space-y-2">
                    <Label htmlFor="dueDate" className="text-sm font-medium">{t('fields.dueDate')}</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Assignment Type */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{t('fields.type')}</Label>
                    <Select value={formData.type} onValueChange={(value: AssignmentFormData['type']) => setFormData({ ...formData, type: value })}>
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

                {/* Right Side - Advanced Settings */}
                <div className="space-y-4">
                  {/* Section */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{t('fields.section')}</Label>
                    {!showNewSection ? (
                      <Select
                        value={formData.sectionId || 'none'}
                        onValueChange={(value) => {
                          if (value === 'create-new') {
                            setShowNewSection(true);
                          } else {
                            setFormData({ ...formData, sectionId: value === 'none' ? undefined : value });
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
                        checked={formData.graded}
                        onCheckedChange={(checked) => setFormData({ ...formData, graded: !!checked })}
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
                        checked={formData.inProgress}
                        onCheckedChange={(checked) => setFormData({ ...formData, inProgress: !!checked })}
                      />
                      <div className="flex-1">
                        <Label htmlFor="inProgress" className="text-sm font-medium cursor-pointer">
                          {t('options.draft.label')}
                        </Label>
                        <p className="text-xs text-muted-foreground">{t('options.draft.description')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 📊 Grading Settings (conditional) */}
            {formData.graded && (
              <div className="space-y-6">
                <div className="text-lg font-semibold">
                  {t('sections.grading')}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Rubric Selection */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{t('fields.rubric')}</Label>
                    <Select
                      value={formData.markSchemeId || 'none'}
                      onValueChange={(value) => setFormData({ ...formData, markSchemeId: value === 'none' ? null : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('placeholders.chooseRubric')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t('rubric.none')}</SelectItem>
                        {markSchemes?.map((markScheme) => {
                          let name = t('rubric.untitled');
                          try {
                            const parsed = JSON.parse(markScheme.structured);
                            name = parsed.name || t('rubric.untitled');
                          } catch (error) {
                            console.error("Error parsing markscheme:", error);
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
                      onValueChange={(value) => setFormData({ ...formData, gradingBoundaryId: value === 'none' ? null : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('placeholders.chooseGradeScale')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t('gradeScale.default')}</SelectItem>
                        {gradingBoundaries?.map((boundary) => {
                          let name = t('gradeScale.untitled');
                          try {
                            const parsed = JSON.parse(boundary.structured);
                            name = parsed.name || t('gradeScale.untitled');
                          } catch (error) {
                            console.error("Error parsing grading boundary:", error);
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
                        value={formData.maxGrade}
                        onChange={(e) => setFormData({ ...formData, maxGrade: parseInt(e.target.value) || 0 })}
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
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) || 0 })}
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
              </div>
            )}

            {/* 📎 File Attachments */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">
                  {t('sections.attachments')}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {t('files.uploadButton')}
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept="*/*"
              />

              {formData.files.length > 0 ? (
                <div className="grid gap-3">
                  {formData.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-muted-foreground/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">{t('files.dropZone')}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('files.dropZoneHint')}</p>
                </div>
              )}
            </div>

            {/* 🎯 Final Actions */}
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {formData.inProgress ? (
                  <>
                    <FileText className="h-4 w-4" />
                    <span>{t('status.draftStatus')}</span>
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4" />
                    <span>{t('status.publishedStatus')}</span>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    resetForm();
                  }}
                  disabled={isCreating}
                >
                  {t('actions.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || !formData.title.trim() || !formData.instructions.trim()}
                  className="min-w-[140px]"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('actions.creating')}
                    </>
                  ) : formData.inProgress ? (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      {t('actions.saveDraft')}
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      {t('actions.create')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
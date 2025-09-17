"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageLayout } from "@/components/ui/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  MessageSquare,
  Star,
  Upload
} from "lucide-react";
import { format } from "date-fns";
import { trpc, type RouterOutputs, type RouterInputs } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/hooks/use-toast";
import { DraggableFileItem } from "@/components/DraggableFileItem";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FilePreviewModal } from "@/components/modals";
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

type AssignmentUpdateSubmissionAsTeacherInput = RouterInputs['assignment']['updateSubmissionAsTeacher'];

type FileItem = {
  id: string;
  name: string;
  type: "file" | "folder";
  fileType?: string;
  size?: string;
  uploadedAt?: string;
};

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

type RubricGrade = {
  criteriaId: string;
  selectedLevelId: string;
  points: number;
  comments?: string;
};

function SubmissionDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-8 w-64" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-32 w-full" />
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

export default function SubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const classId = params.id as string;
  const assignmentId = params.assignmentId as string;
  const submissionId = params.submissionId as string;

  const [feedback, setFeedback] = useState("");
  const [grade, setGrade] = useState<number | undefined>(undefined);
  const [rubricGrades, setRubricGrades] = useState<RubricGrade[]>([]);

  // File upload state for annotations
  const [isUploading, setIsUploading] = useState(false);

  // File preview state
  const [previewFile, setPreviewFile] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Get signed URL mutation for file preview
  const getSignedUrlMutation = trpc.file.getSignedUrl.useMutation();

  // Get submission data
  const { data: submission, isLoading, refetch: refetchSubmission } = trpc.assignment.getSubmission.useQuery({
    assignmentId: assignmentId,
    classId: classId,
  });

  // Get assignment data for rubric info
  const { data: assignment } = trpc.assignment.get.useQuery({
    id: assignmentId,
    classId: classId,
  });

  // Update submission as teacher mutation
  const updateSubmissionMutation = trpc.assignment.updateSubmissionAsTeacher.useMutation({
    onSuccess: () => {
      toast({
        title: "Grade saved",
        description: "The grade and feedback have been saved successfully.",
      });
      refetchSubmission();
    },
    onError: (error) => {
      toast({
        title: "Error saving grade",
        description: error.message || "There was a problem saving the grade. Please try again.",
        variant: "destructive",
      });
    },
  });

  // File upload mutation for annotations
  const uploadAnnotationMutation = trpc.assignment.updateSubmissionAsTeacher.useMutation({
    onSuccess: () => {
      toast({
        title: "Files uploaded",
        description: "Annotation files have been uploaded successfully.",
      });
      refetchSubmission();
      setIsUploading(false);
    },
    onError: (error) => {
      toast({
        title: "Error uploading files",
        description: error.message || "There was a problem uploading the files. Please try again.",
        variant: "destructive",
      });
      setIsUploading(false);
    },
  });

  // Parse rubric criteria from assignment's mark scheme
  const [rubricCriteria, setRubricCriteria] = useState<RubricCriterion[]>([]);

  // Parse rubric data when assignment loads
  useEffect(() => {
    if (assignment?.markScheme) {
      try {
        const parsed = JSON.parse(assignment.markScheme.structured);
        if (parsed.criteria) {
          setRubricCriteria(parsed.criteria);
        }
      } catch (error) {
        console.error("Error parsing rubric:", error);
      }
    }
  }, [assignment?.markScheme]);

  // Mock fallback data for when no rubric is attached
  const mockRubricCriteria: RubricCriterion[] = [
    {
      id: "1",
      title: "Content Quality",
      description: "Demonstrates understanding of the topic",
      levels: [
        { id: "1a", name: "Excellent", points: 25, color: "#22c55e", description: "Exceptional understanding" },
        { id: "1b", name: "Good", points: 20, color: "#3b82f6", description: "Good understanding" },
        { id: "1c", name: "Fair", points: 15, color: "#f59e0b", description: "Basic understanding" },
        { id: "1d", name: "Poor", points: 10, color: "#ef4444", description: "Limited understanding" }
      ]
    },
    {
      id: "2", 
      title: "Writing Style",
      description: "Grammar, clarity, and organization",
      levels: [
        { id: "2a", name: "Excellent", points: 25, color: "#22c55e" },
        { id: "2b", name: "Good", points: 20, color: "#3b82f6" },
        { id: "2c", name: "Fair", points: 15, color: "#f59e0b" },
        { id: "2d", name: "Poor", points: 10, color: "#ef4444" }
      ]
    }
  ];

  // Initialize form data from submission
  useEffect(() => {
    if (submission) {
      setFeedback((submission as any).feedback || "");
      
      // Parse rubric grades if they exist
      if (submission.rubricState) {
        try {
          const existingGrades = JSON.parse(submission.rubricState);
          setRubricGrades(existingGrades);
          // If rubric grades exist, don't set manual grade
          if (existingGrades.length === 0) {
            setGrade(submission.gradeReceived || undefined);
          }
        } catch (error) {
          console.error("Error parsing rubric grades:", error);
          setGrade(submission.gradeReceived || undefined);
        }
      } else {
        // No rubric state, use manual grade
        setGrade(submission.gradeReceived || undefined);
      }
    }
  }, [submission]);

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

    // Calculate final grade based on rubric or manual input
    const finalGrade = rubricGrades.length > 0 ? totalRubricPoints : grade;

    const updateData: AssignmentUpdateSubmissionAsTeacherInput = {
      assignmentId,
      classId,
      submissionId,
      gradeReceived: finalGrade,
      feedback: feedback,
      rubricState: rubricGrades.length > 0 ? JSON.stringify(rubricGrades) : undefined,
    };

    updateSubmissionMutation.mutate(updateData);
  };

  const handleReturnSubmission = async () => {
    if (!submission) return;

    const updateData: AssignmentUpdateSubmissionAsTeacherInput = {
      assignmentId,
      classId,
      submissionId,
      returned: true,
    };

    updateSubmissionMutation.mutate(updateData);
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

  const getFolderColor = (folderId: string) => {
    const colors = [
      "text-blue-500",
      "text-green-500", 
      "text-purple-500",
      "text-orange-500",
      "text-pink-500",
      "text-indigo-500",
      "text-teal-500",
      "text-red-500"
    ];
    const index = parseInt(folderId) % colors.length;
    return colors[index];
  };

  const convertAttachmentsToFileItems = (attachments: any[]) => {
    return attachments.map(attachment => ({
      id: attachment.id,
      name: attachment.name,
      type: "file" as const,
      fileType: attachment.type.split('/')[1] || attachment.type,
      size: formatFileSize(attachment.size),
      uploadedAt: attachment.uploadedAt,
    }));
  };

  const handleFileAction = (action: string, item: FileItem) => {
    if (action === "download") {
      // Handle download
      console.log("Download file:", item);
    } else if (action === "preview") {
      // Handle preview
      setPreviewFile(item);
      setIsPreviewOpen(true);
    }
  };

  const handleFileClick = (file: FileItem) => {
    // Handle file click - open preview
    setPreviewFile(file);
    setIsPreviewOpen(true);
  };

  // Handle annotation file upload
  const handleAnnotationUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !submission) return;

    setIsUploading(true);

    try {
      // Convert files to base64
      const filePromises = Array.from(files).map(async (file) => {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        
        return {
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64.split(',')[1], // Remove data:type;base64, prefix
        };
      });

      const newFiles = await Promise.all(filePromises);
      
      // Upload as annotations
      uploadAnnotationMutation.mutate({
        assignmentId,
        classId,
        submissionId,
        newAttachments: newFiles,
      });

      // Clear the input
      event.target.value = '';
    } catch (error) {
      toast({
        title: "Error processing files",
        description: "There was a problem processing the files. Please try again.",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  const getStatusBadge = () => {
    if (!submission) return null;

    if (submission.returned) {
      return <Badge variant="default">Returned</Badge>;
    }
    if (submission.submitted && submission.late) {
      return <Badge variant="destructive">Late Submission</Badge>;
    }
    if (submission.submitted) {
      return <Badge variant="secondary">Submitted</Badge>;
    }
    return <Badge variant="outline">Not Submitted</Badge>;
  };

  const updateRubricGrade = (criteriaId: string, levelId: string, points: number, comments?: string) => {
    setRubricGrades(prev => {
      const existing = prev.find(g => g.criteriaId === criteriaId);
      if (existing) {
        return prev.map(g => 
          g.criteriaId === criteriaId 
            ? { ...g, selectedLevelId: levelId, points, comments }
            : g
        );
      } else {
        return [...prev, { criteriaId, selectedLevelId: levelId, points, comments }];
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
        <EmptyState
          icon={FileText}
          title="Submission not found"
          description="The submission you're looking for doesn't exist or has been removed."
          action={
            <Button onClick={() => router.back()}>
              Go Back
            </Button>
          }
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
            <div>
              <h1 className="text-2xl font-bold">{submission.assignment.title}</h1>
              <p className="text-muted-foreground">Submission by {submission.student.username}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {getStatusBadge()}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Submission Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student Attachments */}
            <Card>
              <CardHeader>
                <CardTitle>Student Submission</CardTitle>
              </CardHeader>
              <CardContent>
                {submission.attachments.length > 0 ? (
                  <DndProvider backend={HTML5Backend}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {convertAttachmentsToFileItems(submission.attachments).map((fileItem) => (
                        <DraggableFileItem
                          key={fileItem.id}
                          item={fileItem}
                          getFileIcon={getFileIcon}
                          getFolderColor={getFolderColor}
                          onFolderClick={() => {}}
                          onItemAction={handleFileAction}
                          onFileClick={handleFileClick}
                          classId={classId}
                          readonly={true}
                        />
                      ))}
                    </div>
                  </DndProvider>
                ) : (
                  <EmptyState
                    icon={FileText}
                    title="No files submitted"
                    description="The student hasn't submitted any files for this assignment."
                    compact
                  />
                )}
              </CardContent>
            </Card>

            {/* Grade & Feedback */}
            <Card>
              <CardHeader>
                <CardTitle>{rubricCriteria.length > 0 ? 'Rubric Grading & Feedback' : 'Grade & Feedback'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Rubric Grading Section */}
                {rubricCriteria.length > 0 && (
                  <div className="space-y-6">
                    <div className="text-sm font-medium text-muted-foreground">Rubric Assessment</div>
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
                                onClick={() => updateRubricGrade(criterion.id, level.id, level.points)}
                                className={`p-3 rounded-lg border text-left transition-all ${
                                  grade?.selectedLevelId === level.id
                                    ? 'border-primary bg-primary/10'
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
                              placeholder="Add comments for this criterion..."
                              value={grade.comments || ""}
                              onChange={(e) => updateRubricGrade(
                                criterion.id, 
                                grade.selectedLevelId, 
                                grade.points, 
                                e.target.value
                              )}
                              rows={2}
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
                                    const boundaries = JSON.parse(assignment.gradingBoundary.structured).boundaries;
                                    const letterGrade = boundaries.find((b: any) => percentage >= b.min)?.grade || 'F';
                                    return `${percentage.toFixed(1)}% (${letterGrade})`;
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
                          onChange={(e) => setGrade(e.target.value ? parseInt(e.target.value) : undefined)}
                          placeholder="Enter grade"
                          max={submission.assignment.maxGrade}
                          min="0"
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
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide feedback for the student..."
                    rows={4}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={handleSaveGrade}
                    disabled={updateSubmissionMutation.isPending}
                    className="flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{updateSubmissionMutation.isPending ? "Saving..." : "Save Grade"}</span>
                  </Button>
                  
                  {!submission.returned && (
                    <Button 
                      variant="outline"
                      onClick={handleReturnSubmission}
                      disabled={updateSubmissionMutation.isPending}
                    >
                      Return to Student
                    </Button>
                  )}
                </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Student Info */}
            <Card>
              <CardHeader>
                <CardTitle>Student</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={submission.student.avatar} />
                    <AvatarFallback>
                      {submission.student.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{submission.student.username}</p>
                    <p className="text-sm text-muted-foreground">Student</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submission Details */}
            <Card>
              <CardHeader>
                <CardTitle>Submission Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  {getStatusBadge()}
                </div>
                
                {submission.submittedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Submitted</span>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(submission.submittedAt), 'MMM d, yyyy \'at\' h:mm a')}
                    </span>
                  </div>
                )}
                
                {submission.assignment.dueDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Due Date</span>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(submission.assignment.dueDate), 'MMM d, yyyy \'at\' h:mm a')}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Files</span>
                  <span className="text-sm">{submission.attachments.length}</span>
                </div>
                
                {submission.gradeReceived !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Grade</span>
                    <span className="text-sm font-semibold">
                      {submission.gradeReceived} / {submission.assignment.maxGrade}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Teacher Annotations */}
            <Card>
              <CardHeader>
                <CardTitle>Annotations & Files</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {submission.annotations.length > 0 ? (
                  <DndProvider backend={HTML5Backend}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {convertAttachmentsToFileItems(submission.annotations).map((fileItem) => (
                        <DraggableFileItem
                          key={fileItem.id}
                          item={fileItem}
                          getFileIcon={getFileIcon}
                          getFolderColor={getFolderColor}
                          onFolderClick={() => {}}
                          onItemAction={handleFileAction}
                          onFileClick={handleFileClick}
                          classId={classId}
                          readonly={false}
                          onRefetch={refetchSubmission}
                        />
                      ))}
                    </div>
                  </DndProvider>
                ) : (
                  <div className="text-center py-4">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium mb-1">No annotations</p>
                    <p className="text-xs text-muted-foreground mb-3">Upload files to provide additional feedback to the student.</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="annotation-upload" className="cursor-pointer">
                    <div className="flex items-center justify-center w-full p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-muted-foreground/50 transition-colors">
                      <div className="text-center">
                        <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">{isUploading ? 'Uploading...' : 'Upload Annotations'}</p>
                        <p className="text-xs text-muted-foreground">Click to select files or drag and drop</p>
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
          onAction={handleFileAction}
          getPreviewUrl={async (fileId: string) => {
            const result = await getSignedUrlMutation.mutateAsync({ fileId });
            return result.url;
          }}
        />
      </PageLayout>
    </DndProvider>
  );
}

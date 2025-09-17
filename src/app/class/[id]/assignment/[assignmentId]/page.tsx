"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageLayout } from "@/components/ui/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  Edit, 
  FileText, 
  Users,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";
import { trpc, type RouterOutputs } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { DataTable } from "@/components/ui/data-table";
import { DraggableFileItem } from "@/components/DraggableFileItem";
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

function AssignmentDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-20" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;
  const assignmentId = params.assignmentId as string;

  // Get assignment data
  const { data: assignment, isLoading: assignmentLoading } = trpc.assignment.get.useQuery({
    id: assignmentId,
    classId: classId,
  });

  // Get submissions data (for teachers)
  const { data: submissions, isLoading: submissionsLoading } = trpc.assignment.getSubmissions.useQuery({
    assignmentId: assignmentId,
    classId: classId,
  });

  const isLoading = assignmentLoading || submissionsLoading;

  // File preview state
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

  const getStatusBadge = (submission: Submission) => {
    if (submission.returned) {
      return <Badge variant="default">Returned</Badge>;
    }
    if (submission.submitted && submission.late) {
      return <Badge variant="destructive">Late</Badge>;
    }
    if (submission.submitted) {
      return <Badge variant="secondary">Submitted</Badge>;
    }
    return <Badge variant="outline">Missing</Badge>;
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

  const convertAttachmentsToFileItems = (attachments: Submission['attachments']) => {
    return attachments.map(attachment => ({
      id: attachment.id,
      name: attachment.name,
      type: "file" as const,
      fileType: attachment.type.split('/')[1] || attachment.type,
      size: formatFileSize(attachment.size || 0),
      uploadedAt: attachment.uploadedAt || undefined,
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

  const submissionColumns = [
    {
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
      cell: ({ row }: { row: { original: Submission } }) => getStatusBadge(row.original),
    },
    {
      accessorKey: "gradeReceived",
      header: "Grade",
      cell: ({ row }: { row: { original: Submission } }) => (
        <span>
          {row.original.gradeReceived !== undefined 
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
        <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{assignment.title}</h1>
            <div className="flex items-center space-x-4 mt-2 text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>
                  Due {assignment.dueDate 
                    ? format(new Date(assignment.dueDate), 'MMM d, yyyy \'at\' h:mm a')
                    : 'No due date'}
                </span>
              </div>
              {assignment.graded && (
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>{assignment.maxGrade} points</span>
                </div>
              )}
            </div>
          </div>
          
          <Button 
            onClick={() => router.push(`/class/${classId}/assignment/${assignmentId}/edit`)}
            className="flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Instructions and Submissions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{assignment.instructions}</p>
                </div>
              </CardContent>
            </Card>

            {/* Submissions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Submissions</span>
                  <Badge variant="outline">
                    {submissions?.filter(s => s.submitted).length || 0} / {submissions?.length || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {submissions && submissions.length > 0 ? (
                  <DataTable
                    columns={submissionColumns}
                    data={submissions}
                    onRowClick={(row) => 
                      router.push(`/class/${classId}/assignment/${assignmentId}/submission/${row.id}`)
                    }
                  />
                ) : (
                  <EmptyState
                    icon={Users}
                    title="No submissions yet"
                    description="Students haven't submitted their work for this assignment."
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Assignment Details */}
            <Card>
              <CardHeader>
                <CardTitle>Assignment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Type</span>
                  <Badge variant="outline">{assignment.type}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Graded</span>
                  <Badge variant={assignment.graded ? "default" : "secondary"}>
                    {assignment.graded ? "Yes" : "No"}
                  </Badge>
                </div>
                
                {assignment.graded && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Points</span>
                    <span className="text-sm">{assignment.maxGrade}</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="space-y-2">
                  <span className="text-sm font-medium">Submission Status</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-lg font-semibold text-green-700 dark:text-green-400">
                        {submissions?.filter(s => s.submitted && !s.late).length || 0}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-500">On Time</div>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">
                        {submissions?.filter(s => s.submitted && s.late).length || 0}
                      </div>
                      <div className="text-xs text-yellow-600 dark:text-yellow-500">Late</div>
                    </div>
                    <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="text-lg font-semibold text-red-700 dark:text-red-400">
                        {submissions?.filter(s => !s.submitted).length || 0}
                      </div>
                      <div className="text-xs text-red-600 dark:text-red-500">Missing</div>
                    </div>
                    <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                        {submissions?.filter(s => s.returned).length || 0}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-500">Returned</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attachments */}
            <Card>
              <CardHeader>
                <CardTitle>Attachments</CardTitle>
              </CardHeader>
              <CardContent>
                {assignment.attachments.length > 0 ? (
                  <DndProvider backend={HTML5Backend}>
                    <div className="grid grid-cols-3">
                      {convertAttachmentsToFileItems(assignment.attachments).map((fileItem) => (
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
                    title="No attachments"
                    description="No files have been attached to this assignment."
                  />
                )}
              </CardContent>
            </Card>
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
        </div>
      </PageLayout>
    </DndProvider>
  );
}

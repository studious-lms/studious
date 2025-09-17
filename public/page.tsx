// "use client";

// import { useState } from "react";
// import { useParams } from "next/navigation";
// import Link from "next/link";
// import { PageLayout, PageHeader } from "@/components/ui/page-layout";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Textarea } from "@/components/ui/textarea";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Separator } from "@/components/ui/separator";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { toast } from "sonner";
// import { 
//   ArrowLeft,
//   Calendar,
//   Clock,
//   Download,
//   Upload,
//   FileText,
//   Paperclip,
//   Send,
//   User,
//   GraduationCap,
//   CheckCircle,
//   AlertCircle
// } from "lucide-react";
// import { trpc } from "@/lib/trpc";
// import { Skeleton } from "@/components/ui/skeleton";
// import { DraggableFileItem } from "@/components/DraggableFileItem";
// import { DndProvider, useDrop } from "react-dnd";
// import { HTML5Backend } from "react-dnd-html5-backend";
// import { UploadFileModal, CreateFolderModal } from "@/components/modals";
// import { 
//   Grid3X3, 
//   List, 
//   FolderPlus,
//   Home,
//   ChevronRight
// } from "lucide-react";
  

// const mockComments = [
//   {
//     id: "1",
//     author: "Dr. Smith",
//     authorType: "teacher",
//     content: "Remember to include error analysis in your conclusions section.",
//     timestamp: "2024-01-10T10:30:00Z",
//     isPrivate: false
//   },
//   {
//     id: "2", 
//     author: "Alex Johnson",
//     authorType: "student",
//     content: "Should we include the uncertainty calculations for each measurement?",
//     timestamp: "2024-01-11T14:15:00Z",
//     isPrivate: false
//   },
//   {
//     id: "3",
//     author: "Dr. Smith", 
//     authorType: "teacher",
//     content: "Yes, uncertainty analysis is important for this lab. Good question!",
//     timestamp: "2024-01-11T16:45:00Z",
//     isPrivate: false
//   },
//   {
//     id: "4",
//     author: "Dr. Smith",
//     authorType: "teacher", 
//     content: "Your previous lab showed excellent data collection. Keep up the good work!",
//     timestamp: "2024-01-12T09:20:00Z",
//     isPrivate: true
//   }
// ];

// const mockSubmission = {
//   id: "1",
//   studentId: "alex-johnson",
//   submittedAt: "2024-01-14T20:45:00Z",
//   files: [
//     { id: "1", name: "Lab_Report_3_Johnson.pdf", size: "1.2 MB" }
//   ],
//   grade: null,
//   feedback: null,
//   status: "submitted"
// };

// export default function AssignmentDetail() {
//   const { id: classId, assignmentId } = useParams();
//   const [activeTab, setActiveTab] = useState("details");
//   const [newComment, setNewComment] = useState("");
//   const [userRole] = useState<"student" | "teacher">("student"); // Mock role
  
//   // File system state
//   const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
//   const [breadcrumb, setBreadcrumb] = useState<Array<{id: string, name: string}>>([]);
//   const [uploadModalOpen, setUploadModalOpen] = useState(false);
//   const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
//   const [searchQuery, setSearchQuery] = useState("");
//   // API queries
//   const { data: assignmentData, isLoading: assignmentLoading, refetch: refetchAssignment } = trpc.assignment.get.useQuery({ 
//     id: assignmentId as string,
//     classId: classId as string 
//   });
  
//   const { data: submissionData, isLoading: submissionLoading, refetch: refetchSubmission } = trpc.assignment.getSubmission.useQuery({ 
//     assignmentId: assignmentId as string,
//     classId: classId as string 
//   });

//   const assignment = assignmentData;
//   const submission = submissionData;
//   const isLoading = assignmentLoading || submissionLoading;

//   // Mutations
//   const updateSubmissionMutation = trpc.assignment.updateSubmission.useMutation({
//     onSuccess: () => {
//       refetchSubmission();
//       toast.success("Submission updated successfully");
//     },
//     onError: (error) => {
//       toast.error(error.message || "Failed to update submission");
//     }
//   });

  
//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long', 
//       day: 'numeric'
//     });
//   };

//   const formatTime = (dateString: string) => {
//     return new Date(dateString).toLocaleString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       hour: 'numeric',
//       minute: '2-digit'
//     });
//   };

//   const handleSubmitComment = async () => {
//     if (!newComment.trim()) return;
    
//     try {
//       // In a real implementation, this would update the submission with a comment
//       toast.success("Comment posted", {
//         description: "Your comment has been added to the assignment.",
//       });
//       setNewComment("");
//     } catch (error) {
//       console.error("Failed to post comment:", error);
//       toast.error("Failed to post comment");
//     }
//   };

//   // File system helper functions
//   const getFileIcon = (fileType: string, size: "sm" | "lg" = "sm") => {
//     const iconClass = size === "lg" ? "h-8 w-8" : "h-4 w-4";
    
//     if (fileType?.includes('pdf')) return <FileText className={`${iconClass} text-red-500`} />;
//     if (fileType?.includes('image')) return <FileText className={`${iconClass} text-green-500`} />;
//     if (fileType?.includes('video')) return <FileText className={`${iconClass} text-purple-500`} />;
//     if (fileType?.includes('audio')) return <FileText className={`${iconClass} text-orange-500`} />;
//     if (fileType?.includes('zip') || fileType?.includes('rar')) return <FileText className={`${iconClass} text-yellow-500`} />;
//     return <FileText className={`${iconClass} text-muted-foreground`} />;
//   };

//   const getFolderColor = (folderId: string) => {
//     const colors = ["text-blue-500", "text-green-500", "text-purple-500", "text-orange-500"];
//     const index = folderId.length % colors.length;
//     return colors[index];
//   };

//   const navigateToFolder = (folderId: string, folderName: string) => {
//     setCurrentFolderId(folderId);
//     setBreadcrumb(prev => [...prev, { id: folderId, name: folderName }]);
//   };

//   const navigateToBreadcrumb = (index: number) => {
//     if (index === -1) {
//       // Navigate to root
//       setCurrentFolderId(null);
//       setBreadcrumb([]);
//     } else {
//       const targetFolder = breadcrumb[index];
//       setCurrentFolderId(targetFolder.id);
//       setBreadcrumb(prev => prev.slice(0, index + 1));
//     }
//   };

//   const handleFileUpload = async () => {
//     setUploadModalOpen(true);
//   };

//   const handleSubmitAssignment = async () => {
//     if (!submission) return;
    
//     try {
//       await updateSubmissionMutation.mutateAsync({
//         assignmentId: assignmentId as string,
//         classId: classId as string,
//         submissionId: submission.id,
//         submit: true
//       });
      
//       toast.success("Assignment submitted", {
//         description: "Your assignment has been submitted successfully.",
//       });
      
//       // Reload submission data
//       const updatedSubmission = await trpc.assignment.getSubmission.useQuery({
//         assignmentId: assignmentId as string,
//         classId: classId as string,
//       });
//       setSubmission(updatedSubmission);
//     } catch (error) {
//       console.error("Failed to submit assignment:", error);
//       toast.error("Failed to submit assignment");
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "open": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
//       case "closed": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
//       case "submitted": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
//       default: return "bg-secondary text-secondary-foreground";
//     }
//   };

//   if (isLoading) {
//     return (
//       <PageLayout>
//         <PageHeader
//           title="Loading Assignment..."
//           description="Please wait while we load the assignment details."
//         >
//           <div className="flex items-center space-x-3">
//             <Skeleton className="h-8 w-20" />
//             <Skeleton className="h-8 w-24" />
//           </div>
//         </PageHeader>

//         <div className="space-y-6">
//           {/* Assignment header skeleton */}
//           <Card>
//             <CardHeader>
//               <div className="flex items-start justify-between">
//                 <div className="space-y-2 flex-1">
//                   <Skeleton className="h-8 w-3/4" />
//                   <Skeleton className="h-4 w-1/2" />
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <Skeleton className="h-6 w-16" />
//                   <Skeleton className="h-6 w-20" />
//                 </div>
//               </div>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <Skeleton className="h-4 w-full" />
//               <Skeleton className="h-4 w-5/6" />
//               <Skeleton className="h-4 w-4/6" />
//             </CardContent>
//           </Card>

//           {/* Tabs skeleton */}
//           <div className="space-y-4">
//             <div className="flex space-x-1">
//               <Skeleton className="h-10 w-24" />
//               <Skeleton className="h-10 w-32" />
//               <Skeleton className="h-10 w-28" />
//             </div>

//             {/* Tab content skeleton */}
//             <div className="space-y-4">
//               <Card>
//                 <CardHeader>
//                   <Skeleton className="h-6 w-1/3" />
//                 </CardHeader>
//                 <CardContent className="space-y-3">
//                   <Skeleton className="h-4 w-full" />
//                   <Skeleton className="h-4 w-5/6" />
//                   <Skeleton className="h-4 w-4/6" />
//                   <Skeleton className="h-20 w-full" />
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader>
//                   <Skeleton className="h-6 w-1/4" />
//                 </CardHeader>
//                 <CardContent className="space-y-3">
//                   <div className="flex items-center space-x-3">
//                     <Skeleton className="h-10 w-10 rounded-full" />
//                     <div className="space-y-2 flex-1">
//                       <Skeleton className="h-4 w-1/3" />
//                       <Skeleton className="h-3 w-1/4" />
//                     </div>
//                   </div>
//                   <Skeleton className="h-4 w-full" />
//                   <Skeleton className="h-4 w-3/4" />
//                 </CardContent>
//               </Card>
//             </div>
//           </div>
//         </div>
//       </PageLayout>
//     );
//   }

//   if ( !assignment) {
//     return (
//       <PageLayout>
//         <PageHeader
//           title="Assignment Not Found"
//           description="The requested assignment could not be loaded."
//         />
//         <div className="text-center py-12">
//           <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
//           <p className="text-muted-foreground">{error || "Assignment not found"}</p>
//         </div>
//       </PageLayout>
//     );
//   }

//   return (
//     <PageLayout>
//       <PageHeader
//         title={assignment.title || assignment.name}
//         description={`${assignment.type} • ${assignment.points} points`}
//       >
//         <div className="flex items-center space-x-3">
//           <Button variant="ghost" size="sm" asChild>
//             <Link href={`/classes/${classId}/assignments`}>
//               <ArrowLeft className="h-4 w-4" />
//             </Link>
//           </Button>
//           <Badge className={getStatusColor(assignment.status)}>
//             {assignment.status}
//           </Badge>
//           <div className="flex items-center space-x-1 text-sm text-muted-foreground">
//             <Calendar className="h-4 w-4" />
//             <span>Due {formatDate(assignment.dueDate)}</span>
//           </div>
//           <div className="flex items-center space-x-1 text-sm text-muted-foreground">
//             <Clock className="h-4 w-4" />
//             <span>{assignment.dueTime}</span>
//           </div>
//         </div>
//       </PageHeader>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Main Content */}
//         <div className="lg:col-span-2 space-y-6">
//           <Tabs value={activeTab} onValueChange={setActiveTab}>
//             <TabsList className="grid w-full grid-cols-3">
//               <TabsTrigger value="details">Assignment</TabsTrigger>
//               <TabsTrigger value="submission">My Work</TabsTrigger>
//               <TabsTrigger value="comments">Comments</TabsTrigger>
//             </TabsList>

//             <TabsContent value="details" className="space-y-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Description</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <p className="text-muted-foreground mb-4">
//                     {assignment.description}
//                   </p>
                  
//                   <div className="prose prose-sm max-w-none dark:prose-invert">
//                     <div dangerouslySetInnerHTML={{ 
//                       __html: assignment.instructions.replace(/\n/g, '<br/>') 
//                     }} />
//                   </div>
//                 </CardContent>
//               </Card>

//               {assignment?.attachments && assignment.attachments.length > 0 && (
//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="flex items-center space-x-2">
//                       <Paperclip className="h-5 w-5" />
//                       <span>Assignment Files</span>
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <DndProvider backend={HTML5Backend}>
//                       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//                         {assignment.attachments.map((file: any) => (
//                           <DraggableFileItem
//                             key={file.id}
//                             item={{
//                               id: file.id,
//                               name: file.name,
//                               type: "file",
//                               fileType: file.type || "document",
//                               size: file.size || "Unknown",
//                               uploadedBy: "Teacher",
//                               uploadedAt: assignment.createdAt
//                             }}
//                             getFileIcon={(fileType: string) => <FileText className="h-8 w-8 text-muted-foreground" />}
//                             getFolderColor={() => "text-blue-500"}
//                             onFolderClick={() => {}}
//                             onItemAction={(action, item) => {
//                               if (action === "download") {
//                                 // TODO: Implement file download
//                                 console.log("Download file:", item.name);
//                               }
//                             }}
//                             onFileClick={(file) => {
//                               // TODO: Implement file preview
//                               console.log("Preview file:", file.name);
//                             }}
//                             classId={classId as string}
//                             readonly={true}
//                           />
//                       ))}
//                     </div>
//                     </DndProvider>
//                   </CardContent>
//                 </Card>
//               )}
//             </TabsContent>

//             <TabsContent value="submission" className="space-y-6">
//               {userRole === "student" ? (
//                 <DndProvider backend={HTML5Backend}>
//                   {/* Header with Status and Actions */}
//                   <div className="flex items-center justify-between mb-6">
//                     <div className="flex items-center space-x-3">
//                       {submission?.submitted ? (
//                         <>
//                           <CheckCircle className="h-6 w-6 text-green-600" />
//                           <div>
//                             <h2 className="text-xl font-bold">My Submission</h2>
//                             <p className="text-sm text-muted-foreground">
//                               Submitted {submission.submittedAt ? formatTime(submission.submittedAt) : 'recently'}
//                             </p>
//                           </div>
//                           </>
//                         ) : (
//                           <>
//                           <AlertCircle className="h-6 w-6 text-orange-600" />
//                           <div>
//                             <h2 className="text-xl font-bold">Work in Progress</h2>
//                             <p className="text-sm text-muted-foreground">Upload files and submit when ready</p>
//                           </div>
//                         </>
//                       )}
//                     </div>

//                     <div className="flex items-center gap-2">
//                       {!submission?.submitted && (
//                         <>
//                           <Button variant="outline" size="sm" onClick={() => {
//                             const folderName = prompt("Enter folder name:");
//                             if (folderName?.trim()) {
//                               // TODO: Implement folder creation
//                               console.log("Create folder:", folderName);
//                             }
//                           }}>
//                             <FolderPlus className="h-4 w-4 mr-2" />
//                             New Folder
//                           </Button>
//                           <Button variant="outline" size="sm" onClick={() => setUploadModalOpen(true)}>
//                             <Upload className="h-4 w-4 mr-2" />
//                             Upload Files
//                           </Button>
//                           </>
//                         )}
//                     </div>
//                   </div>

//                   {/* File Management Controls */}
//                   <div className="flex items-center justify-between mb-6">
//                     {/* Breadcrumb Navigation */}
//                     <div className="flex items-center space-x-1 text-sm">
//                       <Button 
//                         variant="ghost" 
//                         size="sm" 
//                         onClick={() => navigateToBreadcrumb(-1)}
//                         className="h-8 px-2"
//                       >
//                         <Home className="h-4 w-4 mr-1" />
//                         My Work
//                       </Button>
//                       {breadcrumb.map((folder, index) => (
//                         <div key={folder.id} className="flex items-center">
//                           <ChevronRight className="h-4 w-4 text-muted-foreground" />
//                           <Button 
//                             variant="ghost" 
//                             size="sm" 
//                             onClick={() => navigateToBreadcrumb(index)}
//                             className="h-8 px-2"
//                           >
//                             {folder.name}
//                           </Button>
//                         </div>
//                       ))}
//                     </div>

//                     {/* View Mode Toggle */}
//                     <div className="flex items-center border rounded-md">
//                       <Button
//                         variant={viewMode === "grid" ? "default" : "ghost"}
//                         size="sm"
//                         onClick={() => setViewMode("grid")}
//                       >
//                         <Grid3X3 className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         variant={viewMode === "list" ? "default" : "ghost"}
//                         size="sm"
//                         onClick={() => setViewMode("list")}
//                       >
//                         <List className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </div>

//                   {/* File System Content */}
//                   {(submission?.attachments && submission.attachments.length > 0) || (submission?.folders && submission.folders.length > 0) ? (
//                     <div className={viewMode === "grid" 
//                       ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3"
//                       : "space-y-2"
//                     }>
//                       {/* Folders */}
//                       {/* {([] as any[]).map((folder: any) => (
//                         <DraggableFileItem
//                           key={folder.id}
//                           item={{
//                             id: folder.id,
//                             name: folder.name,
//                             type: "folder",
//                             itemCount: folder.files?.length || 0,
//                             lastModified: folder.updatedAt
//                           }}
//                           getFileIcon={getFileIcon}
//                           getFolderColor={getFolderColor}
//                           onFolderClick={(folderName) => navigateToFolder(folder.id, folderName)}
//                           onItemAction={(action, item) => {
//                             console.log(`${action} folder:`, item.name);
//                           }}
//                           classId={classId as string}
//                           readonly={submission?.submitted || false}
//                           onRefetch={() => refetchSubmission()}
//                         />
//                       )) || []} */}

//                       {/* Files */}
//                       {/* {submission?.attachments?.map((file: any) => (
//                         <DraggableFileItem
//                           key={file.id}
//                           item={{
//                             id: file.id,
//                             name: file.name,
//                             type: "file",
//                             fileType: file.type || "document",
//                             size: file.size || "Unknown",
//                             uploadedBy: "You",
//                             uploadedAt: file.uploadedAt || submission.submittedAt
//                           }}
//                           getFileIcon={getFileIcon}
//                           getFolderColor={getFolderColor}
//                           onFolderClick={() => {}}
//                           onItemAction={(action, item) => {
//                             console.log(`${action} file:`, item.name);
//                           }}
//                           onFileClick={(file) => {
//                             console.log("Preview file:", file.name);
//                           }}
//                           classId={classId as string}
//                           readonly={submission?.submitted || false}
//                           onRefetch={() => refetchSubmission()}
//                         />
//                       )) || []} */}
//                     </div>
//                   ) : (
//                     // <div className="text-center py-16">
//                     //   <Upload className="h-16 w-16 mx-auto mb-6 text-muted-foreground/50" />
//                     //   <h3 className="text-xl font-semibold mb-2">Start your submission</h3>
//                     //   <p className="text-muted-foreground mb-6 max-w-md mx-auto">
//                     //     Upload files and organize them in folders to create your assignment submission.
//                     //   </p>
//                     //   <div className="flex items-center justify-center gap-3">
//                     //     <Button onClick={handleFileUpload}>
//                     //       <Upload className="h-4 w-4 mr-2" />
//                     //       Upload Files
//                     //     </Button>
//                     //     <Button variant="outline" onClick={() => {
//                     //       const folderName = prompt("Enter folder name:");
//                     //       if (folderName?.trim()) {
//                     //         // TODO: Implement folder creation
//                     //         console.log("Create folder:", folderName);
//                     //       }
//                     //     }}>
//                     //       <FolderPlus className="h-4 w-4 mr-2" />
//                     //       Create Folder
//                     //     </Button>
//                     //   </div>
//                     // </div>
//                   )}

//                   {/* Submit Section */}
//                   {!submission?.submitted && ((submission?.attachments && submission.attachments.length > 0) || (submission?.folders && submission.folders.length > 0)) && (
//                     <Card className="mt-6">
//                       <CardContent className="pt-6">
//                         <div className="flex items-center justify-between">
//                           <div>
//                             <h4 className="font-medium">Ready to submit?</h4>
//                             <p className="text-sm text-muted-foreground">
//                               Review your files and submit your assignment for grading.
//                             </p>
//                           </div>
//                           <Button onClick={handleSubmitAssignment} size="lg">
//                             <Send className="h-4 w-4 mr-2" />
//                             Submit Assignment
//                           </Button>
//                         </div>
//                       </CardContent>
//                     </Card>
//                   )}
//                 </DndProvider>
//                     <CardContent className="space-y-4">
//                       {submission?.submitted ? (
//                         <div className="space-y-4">
//                           <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
//                             <p className="text-sm text-green-700 dark:text-green-300">
//                               Submitted on {submission?.submittedAt ? formatTime(submission.submittedAt) : 'Unknown'}
//                             </p>
//                           </div>
                          
//                           <div className="space-y-4">
//                             <h4 className="font-medium">Submitted Files:</h4>
//                             <DndProvider backend={HTML5Backend}>
//                               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                                 {submission?.attachments?.map((file: any) => (
//                                   <DraggableFileItem
//                                     key={file.id}
//                                     item={{
//                                       id: file.id,
//                                       name: file.name,
//                                       type: "file",
//                                       fileType: file.type || "document",
//                                       size: file.size || "Unknown",
//                                       uploadedBy: "You",
//                                       uploadedAt: submission.submittedAt
//                                     }}
//                                     getFileIcon={(fileType: string) => <FileText className="h-8 w-8 text-primary" />}
//                                     getFolderColor={() => "text-blue-500"}
//                                     onFolderClick={() => {}}
//                                     onItemAction={(action, item) => {
//                                       if (action === "download") {
//                                         // TODO: Implement file download
//                                         console.log("Download submission file:", item.name);
//                                       } else if (action === "delete") {
//                                         // TODO: Implement file removal from submission
//                                         console.log("Remove file from submission:", item.name);
//                                       }
//                                     }}
//                                     onFileClick={(file) => {
//                                       // TODO: Implement file preview
//                                       console.log("Preview submission file:", file.name);
//                                     }}
//                                     classId={classId as string}
//                                     readonly={false}
//                                     onRefetch={() => refetchSubmission()}
//                                   />
//                                 )) || []}
//                               </div>
//                             </DndProvider>
//                           </div>
                          
//                           <Button variant="outline" className="w-full">
//                             <Upload className="h-4 w-4 mr-2" />
//                             Update Submission
//                           </Button>
//                         </div>
//                       ) : (
//                         <div className="space-y-4">
//                           <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
//                             <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
//                             <h3 className="text-lg font-semibold mb-2">Upload your work</h3>
//                             <p className="text-muted-foreground mb-4">
//                               Drag and drop files here or click to browse
//                             </p>
//                             <Button onClick={handleFileUpload}>
//                               Choose Files
//                             </Button>
//                           </div>
//                         </div>
//                       )}
//                     </CardContent>
//                   </Card>
//                 </>
//               ) : (
//                 /* Teacher View - Assignment Content Only */
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Assignment Content</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <p className="text-muted-foreground mb-4">
//                       {assignment.description}
//                     </p>
                    
//                     <div className="prose prose-sm max-w-none dark:prose-invert">
//                       <div dangerouslySetInnerHTML={{ 
//                         __html: assignment.instructions.replace(/\n/g, '<br/>') 
//                       }} />
//                     </div>
//                   </CardContent>
//                 </Card>
//               )}
//             </TabsContent>

//             <TabsContent value="comments" className="space-y-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Discussion</CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   {/* Comment Input */}
//                   <div className="space-y-3">
//                     <Textarea
//                       placeholder="Add a comment..."
//                       value={newComment}
//                       onChange={(e) => setNewComment(e.target.value)}
//                       className="min-h-[100px]"
//                     />
//                     <div className="flex justify-between items-center">
//                       <p className="text-xs text-muted-foreground">
//                         Comments are visible to all class members
//                       </p>
//                       <Button 
//                         onClick={handleSubmitComment}
//                         disabled={!newComment.trim()}
//                         size="sm"
//                       >
//                         <Send className="h-4 w-4 mr-2" />
//                         Post Comment
//                       </Button>
//                     </div>
//                   </div>

//                   <Separator />

//                   {/* Comments List */}
//                   <div className="space-y-4">
//                     {mockComments.map((comment) => (
//                       <div
//                         key={comment.id}
//                         className={`p-4 rounded-lg border ${
//                           comment.isPrivate 
//                             ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' 
//                             : 'bg-card'
//                         }`}
//                       >
//                         <div className="flex items-start space-x-3">
//                           <Avatar className="h-8 w-8">
//                             <AvatarFallback>
//                               {comment.authorType === "teacher" ? (
//                                 <GraduationCap className="h-4 w-4" />
//                               ) : (
//                                 <User className="h-4 w-4" />
//                               )}
//                             </AvatarFallback>
//                           </Avatar>
//                           <div className="flex-1 space-y-1">
//                             <div className="flex items-center space-x-2">
//                               <p className="font-medium text-sm">{comment.author}</p>
//                               <Badge 
//                                 variant={comment.authorType === "teacher" ? "default" : "secondary"}
//                                 className="text-xs"
//                               >
//                                 {comment.authorType}
//                               </Badge>
//                               {comment.isPrivate && (
//                                 <Badge variant="outline" className="text-xs">
//                                   Private
//                                 </Badge>
//                               )}
//                               <p className="text-xs text-muted-foreground">
//                                 {formatTime(comment.timestamp)}
//                               </p>
//                             </div>
//                             <p className="text-sm">{comment.content}</p>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>
//           </Tabs>
//         </div>

//         {/* Sidebar */}
//         <div className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Assignment Info</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               <div className="flex justify-between">
//                 <span className="text-sm text-muted-foreground">Points</span>
//                 <span className="font-medium">{assignment.points}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-sm text-muted-foreground">Due Date</span>
//                 <span className="font-medium">{formatDate(assignment.dueDate)}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-sm text-muted-foreground">Due Time</span>
//                 <span className="font-medium">{assignment.dueTime}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-sm text-muted-foreground">Status</span>
//                 <Badge className={getStatusColor(assignment.status)}>
//                   {assignment.status}
//                 </Badge>
//               </div>
//             </CardContent>
//           </Card>

//           {userRole === "student" && mockSubmission.grade && (
//             <Card>
//               <CardHeader>
//                 <CardTitle>Grade</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-center">
//                   <div className="text-3xl font-bold text-primary">
//                     {submission?.gradeReceived || 0}%
//                   </div>
//                   <p className="text-sm text-muted-foreground">
//                     {submission?.gradeReceived || 0} / {assignment?.maxGrade || 0} points
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>
//           )}
//         </div>
//       </div>

//       {/* Upload File Modal */}
//       <UploadFileModal
//         open={uploadModalOpen}
//         onOpenChange={setUploadModalOpen}
//         classId={classId as string}
//         folderId={currentFolderId || undefined}
//         onFilesUploaded={() => {
//           refetchSubmission();
//           toast.success("Files uploaded successfully");
//         }}
//       />
//     </PageLayout>
//   );
// }
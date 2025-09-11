"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageLayout, PageHeader } from "@/components/ui/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  Upload,
  FileText,
  Paperclip,
  Send,
  MessageCircle,
  User,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useGetAssignment, useGetSubmission, useUpdateSubmission } from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data - would come from API/context in real app
const mockAssignment = {
  id: "1",
  title: "Physics Lab Report #3",
  description: "Complete analysis of pendulum motion experiments. Include data collection, analysis, and conclusions.",
  instructions: `
    ## Instructions
    
    Complete the following for your lab report:
    
    1. **Data Collection**: Record at least 10 measurements of pendulum periods
    2. **Analysis**: Calculate theoretical vs experimental values
    3. **Graphs**: Include period vs length relationship
    4. **Conclusion**: Discuss sources of error and accuracy
    
    ## Requirements
    - Minimum 5 pages
    - Include raw data in appendix
    - Use proper scientific notation
    - Cite all sources using APA format
    
    ## Grading Rubric
    - Data Collection (25 points)
    - Analysis (35 points) 
    - Presentation (25 points)
    - Conclusion (15 points)
  `,
  type: "Lab Report",
  dueDate: "2024-01-15",
  dueTime: "11:59 PM",
  status: "open",
  points: 100,
  attachments: [
    { id: "1", name: "Lab_Instructions.pdf", size: "245 KB" },
    { id: "2", name: "Data_Template.xlsx", size: "18 KB" }
  ]
};

const mockComments = [
  {
    id: "1",
    author: "Dr. Smith",
    authorType: "teacher",
    content: "Remember to include error analysis in your conclusions section.",
    timestamp: "2024-01-10T10:30:00Z",
    isPrivate: false
  },
  {
    id: "2", 
    author: "Alex Johnson",
    authorType: "student",
    content: "Should we include the uncertainty calculations for each measurement?",
    timestamp: "2024-01-11T14:15:00Z",
    isPrivate: false
  },
  {
    id: "3",
    author: "Dr. Smith", 
    authorType: "teacher",
    content: "Yes, uncertainty analysis is important for this lab. Good question!",
    timestamp: "2024-01-11T16:45:00Z",
    isPrivate: false
  },
  {
    id: "4",
    author: "Dr. Smith",
    authorType: "teacher", 
    content: "Your previous lab showed excellent data collection. Keep up the good work!",
    timestamp: "2024-01-12T09:20:00Z",
    isPrivate: true
  }
];

const mockSubmission = {
  id: "1",
  studentId: "alex-johnson",
  submittedAt: "2024-01-14T20:45:00Z",
  files: [
    { id: "1", name: "Lab_Report_3_Johnson.pdf", size: "1.2 MB" }
  ],
  grade: null,
  feedback: null,
  status: "submitted"
};

export default function AssignmentDetail() {
  const { classId, assignmentId } = useParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  const [newComment, setNewComment] = useState("");
  const [userRole] = useState<"student" | "teacher">("student"); // Mock role
  const [assignment, setAssignment] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { getAssignment } = useGetAssignment();
  const { getSubmission } = useGetSubmission();
  const { updateSubmission } = useUpdateSubmission();

  // Load assignment and submission data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load assignment details
        const assignmentData = await getAssignment(assignmentId as string, classId as string);
        setAssignment(assignmentData);
        
        // Load submission if user is a student
        if (userRole === "student") {
          try {
            const submissionData = await getSubmission(assignmentId as string, classId as string);
            setSubmission(submissionData);
          } catch (err) {
            // Submission might not exist yet, which is fine
            console.log("No submission found yet");
          }
        }
      } catch (err) {
        console.error("Failed to load assignment data:", err);
        setError("Failed to load assignment");
        // Use mock data as fallback
        setAssignment(mockAssignment);
        setSubmission(mockSubmission);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [assignmentId, classId, userRole]); // ✅ FIXED: Removed function dependencies
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      // In a real implementation, this would update the submission with a comment
      toast.success("Comment posted", {
        description: "Your comment has been added to the assignment.",
      });
      setNewComment("");
    } catch (error) {
      console.error("Failed to post comment:", error);
      toast.error("Failed to post comment");
    }
  };

  const handleFileUpload = async () => {
    try {
      // In a real implementation, this would upload files and update the submission
      toast.success("File uploaded", {
        description: "Your submission has been uploaded successfully.",
      });
    } catch (error) {
      console.error("Failed to upload file:", error);
      toast.error("Failed to upload file");
    }
  };

  const handleSubmitAssignment = async () => {
    if (!submission) return;
    
    try {
      await updateSubmission({
        assignmentId: assignmentId as string,
        classId: classId as string,
        submissionId: submission.id,
        submit: true
      });
      
      toast.success("Assignment submitted", {
        description: "Your assignment has been submitted successfully.",
      });
      
      // Reload submission data
      const updatedSubmission = await getSubmission(assignmentId as string, classId as string);
      setSubmission(updatedSubmission);
    } catch (error) {
      console.error("Failed to submit assignment:", error);
      toast.error("Failed to submit assignment");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "closed": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      case "submitted": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <PageHeader
          title="Loading Assignment..."
          description="Please wait while we load the assignment details."
        >
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        </PageHeader>

        <div className="space-y-6">
          {/* Assignment header skeleton */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </CardContent>
          </Card>

          {/* Tabs skeleton */}
          <div className="space-y-4">
            <div className="flex space-x-1">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-28" />
            </div>

            {/* Tab content skeleton */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-1/3" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-1/4" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !assignment) {
    return (
      <PageLayout>
        <PageHeader
          title="Assignment Not Found"
          description="The requested assignment could not be loaded."
        />
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{error || "Assignment not found"}</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title={assignment.title || assignment.name}
        description={`${mockAssignment.type} • ${mockAssignment.points} points`}
      >
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/classes/${classId}/assignments`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Badge className={getStatusColor(mockAssignment.status)}>
            {mockAssignment.status}
          </Badge>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Due {formatDate(mockAssignment.dueDate)}</span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{mockAssignment.dueTime}</span>
          </div>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Assignment</TabsTrigger>
              <TabsTrigger value="submission">My Work</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {mockAssignment.description}
                  </p>
                  
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <div dangerouslySetInnerHTML={{ 
                      __html: mockAssignment.instructions.replace(/\n/g, '<br/>') 
                    }} />
                  </div>
                </CardContent>
              </Card>

              {mockAssignment.attachments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Paperclip className="h-5 w-5" />
                      <span>Attachments</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {mockAssignment.attachments.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 border rounded-md">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm text-muted-foreground">{file.size}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="submission" className="space-y-6">
              {userRole === "student" ? (
                <>
                  {/* Student Submission Interface */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        {mockSubmission.status === "submitted" ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span>Submitted</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-5 w-5 text-orange-600" />
                            <span>Not Submitted</span>
                          </>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {mockSubmission.status === "submitted" ? (
                        <div className="space-y-4">
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                            <p className="text-sm text-green-700 dark:text-green-300">
                              Submitted on {formatTime(mockSubmission.submittedAt)}
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <h4 className="font-medium">Submitted Files:</h4>
                            {mockSubmission.files.map((file) => (
                              <div key={file.id} className="flex items-center justify-between p-3 border rounded-md">
                                <div className="flex items-center space-x-3">
                                  <FileText className="h-5 w-5 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium">{file.name}</p>
                                    <p className="text-sm text-muted-foreground">{file.size}</p>
                                  </div>
                                </div>
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </Button>
                              </div>
                            ))}
                          </div>
                          
                          <Button variant="outline" className="w-full">
                            <Upload className="h-4 w-4 mr-2" />
                            Update Submission
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mb-2">Upload your work</h3>
                            <p className="text-muted-foreground mb-4">
                              Drag and drop files here or click to browse
                            </p>
                            <Button onClick={handleFileUpload}>
                              Choose Files
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                /* Teacher View - Assignment Content Only */
                <Card>
                  <CardHeader>
                    <CardTitle>Assignment Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {mockAssignment.description}
                    </p>
                    
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <div dangerouslySetInnerHTML={{ 
                        __html: mockAssignment.instructions.replace(/\n/g, '<br/>') 
                      }} />
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="comments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Discussion</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Comment Input */}
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">
                        Comments are visible to all class members
                      </p>
                      <Button 
                        onClick={handleSubmitComment}
                        disabled={!newComment.trim()}
                        size="sm"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Post Comment
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Comments List */}
                  <div className="space-y-4">
                    {mockComments.map((comment) => (
                      <div
                        key={comment.id}
                        className={`p-4 rounded-lg border ${
                          comment.isPrivate 
                            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' 
                            : 'bg-card'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {comment.authorType === "teacher" ? (
                                <GraduationCap className="h-4 w-4" />
                              ) : (
                                <User className="h-4 w-4" />
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-sm">{comment.author}</p>
                              <Badge 
                                variant={comment.authorType === "teacher" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {comment.authorType}
                              </Badge>
                              {comment.isPrivate && (
                                <Badge variant="outline" className="text-xs">
                                  Private
                                </Badge>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {formatTime(comment.timestamp)}
                              </p>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Points</span>
                <span className="font-medium">{mockAssignment.points}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Due Date</span>
                <span className="font-medium">{formatDate(mockAssignment.dueDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Due Time</span>
                <span className="font-medium">{mockAssignment.dueTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge className={getStatusColor(mockAssignment.status)}>
                  {mockAssignment.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {userRole === "student" && mockSubmission.grade && (
            <Card>
              <CardHeader>
                <CardTitle>Grade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {mockSubmission.grade}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {Math.round((mockSubmission.grade / 100) * mockAssignment.points)} / {mockAssignment.points} points
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
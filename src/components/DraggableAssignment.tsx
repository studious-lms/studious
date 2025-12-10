import { useState } from "react";
import { useDrag } from "react-dnd";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Paperclip,
  GripVertical,
  Check,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RouterOutputs } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { getStudentAssignmentStatus, getStatusColor, Status } from "@/lib/getStudentAssignmentStatus";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import getGradeDisplay from "@/lib/getGradeDisplay";
import { getAIPolicyShortLabel, getAIPolicyColor } from "@/lib/aiPolicy";
interface DraggableAssignmentProps {
  assignment: RouterOutputs['assignment']['get'];
  classId: string;
  index?: number;
  onDelete?: (assignmentId: string) => void;
  onPublish?: (assignmentId: string) => void;
  isTeacher?: boolean;
}

export function DraggableAssignment({ assignment, classId, index, onDelete, onPublish, isTeacher }: DraggableAssignmentProps) {
  const appState = useSelector((state: RootState) => state.app);
  const [isExpanded, setIsExpanded] = useState(false);
  const [{ isDragging }, drag] = useDrag({
    type: "assignment",
    item: { id: assignment.id, type: "assignment", index },
    canDrag: isTeacher,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const totalStudents = assignment.submissions ? assignment.submissions.length : 0;
  const totalSubmissions = assignment.submissions ? assignment.submissions.filter(submission => submission.submitted).length : 0;
  const gradedSubmissions = assignment.submissions ? assignment.submissions.filter(submission => submission.returned).length : 0;

  const status: Status[] = isTeacher ? (gradedSubmissions == totalStudents ? ["Graded"] : ["Pending"]) : getStudentAssignmentStatus(assignment);

  const router = useRouter();

  return (
    <div ref={isTeacher ? drag as unknown as React.Ref<HTMLDivElement> : null} className={`transition-opacity ${isDragging ? 'opacity-50' : 'opacity-100'}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <Card className={`hover:shadow-md transition-all duration-200 border-l-4 border-l-primary group ${isTeacher ? 'cursor-move' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                {isTeacher && (
                  <GripVertical className="h-5 w-5 text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                ) }
                <div className="flex-1 space-y-3">
                  <div className="flex items-center space-x-3">
                    <Link
                      href={`/class/${classId}/assignment/${assignment.id}`}
                      className="text-sm font-medium text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {assignment.title}
                    </Link>
                    {assignment.inProgress && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Draft
                      </Badge>
                    )}
                    {status.map((s) => (
                      <Badge className={getStatusColor(s)} key={s}>
                        {s}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">{assignment.type.charAt(0).toUpperCase() + assignment.type.slice(1).toLowerCase()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Due {formatDate(assignment.dueDate)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>{assignment.maxGrade} points</span>
                    </div>
                  </div>

                  {isTeacher && (
                    <div className="flex items-center gap-x-4 gap-y-1 flex-wrap">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm">
                          <strong>{totalSubmissions}</strong> of <strong>{totalStudents}</strong> submitted
                        </span>
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${totalStudents > 0 ? (totalSubmissions / totalStudents) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm">
                          <strong>{gradedSubmissions}</strong> of <strong>{totalStudents}</strong> returned
                        </span>
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${totalStudents > 0 ? (gradedSubmissions / totalStudents) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                {assignment.inProgress && isTeacher && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onPublish?.(assignment.id)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Publish
                  </Button>
                )}

                {!isTeacher && assignment.returned && assignment.graded && (
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-xs font-semibold">Grade Achieved</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold">{assignment.submissions?.find(submission => submission.studentId === appState.user.id)?.gradeReceived} </span>
                      <span className="text-xs text-muted-foreground">/ {assignment.maxGrade}</span>
                      <span className="text-xs text-muted-foreground flex items-center">
                        ({getGradeDisplay(assignment.submissions?.find(submission => submission.studentId === appState.user.id)?.gradeReceived, assignment.maxGrade, assignment.gradingBoundary)})
                      </span>
                    </div>
                  </div>
                )}

                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>

                {isTeacher && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/class/${classId}/assignment/${assignment.id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Assignment
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onDelete?.(assignment.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </CardContent>

          {/* Expanded Preview */}
          <CollapsibleContent>
            <div className="border-t px-4 py-4 space-y-4 bg-muted/30">
              {/* Instructions Preview */}
              {assignment.instructions && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Instructions</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">
                    {assignment.instructions}
                  </p>
                </div>
              )}

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Attachments */}
                {assignment.attachments && assignment.attachments.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Attachments</span>
                    <div className="flex items-center gap-1">
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{assignment.attachments.length} file{assignment.attachments.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                )}

                {/* Worksheets */}
                {assignment.worksheets && assignment.worksheets.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Worksheets</span>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{assignment.worksheets.length} worksheet{assignment.worksheets.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                )}

                {/* AI Policy */}
                {assignment.aiPolicyLevel && (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">AI Policy</span>
                    <Badge className={getAIPolicyColor(assignment.aiPolicyLevel)}>
                      <Sparkles className="h-3 w-3 mr-1" />
                      {getAIPolicyShortLabel(assignment.aiPolicyLevel)}
                    </Badge>
                  </div>
                )}

                {/* Grading */}
                {assignment.graded && (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Grading</span>
                    <span className="text-sm font-medium">
                      {assignment.maxGrade} pts
                      {assignment.weight && assignment.weight !== 1 && ` (${assignment.weight}x weight)`}
                    </span>
                  </div>
                )}
              </div>

              {/* Deliverables */}
              <div className="flex flex-wrap gap-2">
                {assignment.acceptFiles && (
                  <Badge variant="outline" className="text-xs">
                    <Paperclip className="h-3 w-3 mr-1" />
                    File Upload
                  </Badge>
                )}
                {assignment.acceptExtendedResponse && (
                  <Badge variant="outline" className="text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    Written Response
                  </Badge>
                )}
                {assignment.acceptWorksheet && (
                  <Badge variant="outline" className="text-xs">
                    <Check className="h-3 w-3 mr-1" />
                    Worksheet
                  </Badge>
                )}
                {assignment.gradeWithAI && (
                  <Badge variant="outline" className="text-xs bg-purple-50 border-purple-200 text-purple-700">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Grading
                  </Badge>
                )}
              </div>

              {/* View Assignment Button */}
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/class/${classId}/assignment/${assignment.id}`)}
                  className="w-full"
                >
                  View Full Assignment
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
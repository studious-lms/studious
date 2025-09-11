"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { PageLayout, PageHeader } from "@/components/ui/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Avatar } from "@/components/ui/avatar";
import { GradingBoundariesModal, RubricModal } from "@/components/modals";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Rubric } from "@/components/rubric";

import {
  BarChart3,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  Settings,
  FileText,
  Edit,
  Trash2,
  ClipboardCheck,
  ClipboardList,
  Eye,
  Edit3
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import {
  useListMarkSchemesQuery,
  useDeleteMarkSchemeMutation,
  useListGradingBoundariesQuery,
  useDeleteGradingBoundaryMutation,
} from "@/lib/api";
import type {
  MarkScheme,
  GradingBoundary,
  RubricCriteria,
  GradeBoundary,
  ParsedMarkScheme,
} from "@/lib/types";



export default function Grades() {
  const { id: classId } = useParams();
  const [gradingBoundariesOpen, setGradingBoundariesOpen] = useState(false);
  const [rubricModalOpen, setRubricModalOpen] = useState(false);
  const [editingGradingBoundary, setEditingGradingBoundary] = useState<GradingBoundary | null>(null);
  // Track edits for fields; if a field is undefined we fall back to original
  const [rowEdits, setRowEdits] = useState<Record<string, { maxGrade?: number; weight?: number; graded?: boolean }>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Preview states
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewMarkscheme, setPreviewMarkscheme] = useState<MarkScheme | null>(null);
  const [previewGradingBoundary, setPreviewGradingBoundary] = useState<GradingBoundary | null>(null);
  const [previewRubricCriteria, setPreviewRubricCriteria] = useState<RubricCriteria[]>([]);
  const [previewGradeBoundaries, setPreviewGradeBoundaries] = useState<GradeBoundary[]>([]);

  // Edit states
  const [editingRubric, setEditingRubric] = useState<MarkScheme | null>(null);

  const { data: classData, isLoading: classLoading, refetch } = trpc.class.get.useQuery({ classId: classId as string });
  const { data: markschemesData, isLoading: markschemesLoading, refetch: refetchMarkschemes } = useListMarkSchemesQuery(classId as string);
  const { data: gradingBoundariesData, isLoading: gradingBoundariesLoading, refetch: refetchGrading } = useListGradingBoundariesQuery(classId as string);
  const updateAssignment = trpc.assignment.update.useMutation();

  // Get grades for all students to calculate real averages
  const students = classData?.class?.students || [];
  const assignments = classData?.class?.assignments || [];
  const markschemes: MarkScheme[] = markschemesData ?? [];
  const gradingBoundaries: GradingBoundary[] = gradingBoundariesData ?? [];

  // Get grades for each student
  const studentGradesQueries = students.map(student =>
    trpc.class.getGrades.useQuery({
      classId: classId as string,
      userId: student.id
    }, { enabled: !!student.id })
  );

  const deleteMarkscheme = useDeleteMarkSchemeMutation();
  const deleteGradingBoundary = useDeleteGradingBoundaryMutation();

  // Preview handlers
  const handlePreviewMarkscheme = (markscheme: MarkScheme) => {
    try {
      console.log("Preview markscheme:", markscheme);
      const parsed = JSON.parse(markscheme.structured);
      console.log("Parsed markscheme:", parsed);
      let criteria = [];

      if (parsed.criteria) {
        criteria = parsed.criteria;
        console.log("Using criteria:", criteria);
      } else if (parsed.items) {
        // Convert old format to new format
        criteria = parsed.items.map((item: { id: string; title: string; description: string; criteria: string[]; maxPoints: number }, index: number) => ({
          id: item.id || `criteria-${index}`,
          title: item.title || `Criteria ${index + 1}`,
          description: item.description || "",
          levels: [
            { id: "excellent", name: "Excellent", description: item.criteria?.[0] || "Outstanding performance", points: item.maxPoints || 4, color: "#4CAF50" },
            { id: "good", name: "Good", description: item.criteria?.[1] || "Good performance", points: Math.floor((item.maxPoints || 4) * 0.75), color: "#8BC34A" },
            { id: "satisfactory", name: "Satisfactory", description: item.criteria?.[2] || "Adequate performance", points: Math.floor((item.maxPoints || 4) * 0.5), color: "#FFEB3B" },
            { id: "needs-improvement", name: "Needs Improvement", description: item.criteria?.[3] || "Below expectations", points: Math.floor((item.maxPoints || 4) * 0.25), color: "#FF9800" }
          ]
        }));
        console.log("Converted criteria:", criteria);
      }

      // Set both states together to avoid any intermediate state issues
      setPreviewRubricCriteria(criteria);
      setPreviewMarkscheme(markscheme);
      setPreviewGradingBoundary(null); // Clear grading boundary if showing rubric
      setPreviewModalOpen(true);
      console.log("Set preview states");
    } catch (error) {
      console.error("Error parsing markscheme:", error);
    }
  };

  const handlePreviewGradingBoundary = (gradingBoundary: GradingBoundary) => {
    try {
      const parsed = JSON.parse(gradingBoundary.structured);
      setPreviewGradeBoundaries(parsed.boundaries || []);
      setPreviewGradingBoundary(gradingBoundary);
      setPreviewMarkscheme(null); // Clear markscheme if showing grading boundary
      setPreviewModalOpen(true);
    } catch (error) {
      console.error("Error parsing grading boundary:", error);
    }
  };

  const closePreview = () => {
    setPreviewModalOpen(false);
    setPreviewMarkscheme(null);
    setPreviewGradingBoundary(null);
    setPreviewRubricCriteria([]);
    setPreviewGradeBoundaries([]);
  };

  const handleEditRubric = (markscheme: MarkScheme) => {
    setEditingRubric(markscheme);
    setRubricModalOpen(true);
  };

  const handleCreateNewRubric = () => {
    setEditingRubric(null);
    setRubricModalOpen(true);
  };

  // Remove duplicate declarations - these are already defined above

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-accent" />;
      case "down": return <TrendingDown className="h-4 w-4 text-destructive" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getGradeColor = (grade: number | null, status: string) => {
    if (!grade) {
      return status === "missing" ? "text-destructive font-semibold" : "text-warning font-medium";
    }
    if (grade >= 90) return "text-primary font-semibold";
    if (grade >= 80) return "text-accent font-medium";
    if (grade >= 70) return "text-foreground font-medium";
    return "text-destructive font-semibold";
  };

  // Calculate real class average from student grades
  const classAverage = useMemo(() => {
    if (!students.length || !assignments.length) return 0;

    let totalGrade = 0;
    let totalStudents = 0;

    studentGradesQueries.forEach((query, index) => {
      if (query.data?.grades) {
        const studentGrades = query.data.grades
          .filter(grade => grade.gradeReceived !== null)
          .map(grade => {
            const percentage = (grade.gradeReceived! / grade.assignment.maxGrade!) * 100;
            return percentage;
          });

        if (studentGrades.length > 0) {
          const studentAverage = studentGrades.reduce((sum, grade) => sum + grade, 0) / studentGrades.length;
          totalGrade += studentAverage;
          totalStudents++;
        }
      }
    });

    return totalStudents > 0 ? totalGrade / totalStudents : 0;
  }, [studentGradesQueries, students, assignments]);

  const getEffective = (id: string, field: "maxGrade" | "weight" | "graded", original: any) => {
    const edit = rowEdits[id];
    if (edit && edit[field] !== undefined) return edit[field] as any;
    return original;
  };

  const setEdit = (id: string, field: "maxGrade" | "weight" | "graded", value: number | boolean) => {
    setRowEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value as any } }));
  };

  // Determine if there are modifications relative to originals
  const hasChanges = useMemo(() => {
    return assignments.some(a => {
      const e = rowEdits[a.id];
      if (!e) return false;
      const graded = e.graded ?? a.graded ?? false;
      const maxGrade = e.maxGrade ?? a.maxGrade ?? 0;
      const weight = e.weight ?? a.weight ?? 0;
      return graded !== (a.graded ?? false) || maxGrade !== (a.maxGrade ?? 0) || weight !== (a.weight ?? 0);
    });
  }, [assignments, rowEdits]);

  const saveAllChanges = async () => {
    setIsSaving(true);
    try {
      const updates = assignments
        .map(a => ({ a, e: rowEdits[a.id] }))
        .filter(({ a, e }) => e && (
          (e.graded ?? a.graded ?? false) !== (a.graded ?? false) ||
          (e.maxGrade ?? a.maxGrade ?? 0) !== (a.maxGrade ?? 0) ||
          (e.weight ?? a.weight ?? 0) !== (a.weight ?? 0)
        ))
        .map(({ a, e }) => updateAssignment.mutateAsync({
          classId: classId as string,
          id: a.id,
          graded: e!.graded ?? a.graded ?? false,
          maxGrade: e!.maxGrade ?? a.maxGrade ?? 0,
          weight: e!.weight ?? a.weight ?? 0
        }));

      await Promise.all(updates);
      await refetch();
      setRowEdits({});
    } finally {
      setIsSaving(false);
    }
  };

  if (classLoading || markschemesLoading || gradingBoundariesLoading) {
    return (
      <PageLayout>
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <Card className="mb-6">
            <CardHeader>
              <div className="h-5 w-40 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-40 w-full bg-muted rounded" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="h-5 w-40 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-40 w-full bg-muted rounded" />
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Grades</h1>
          <p className="text-muted-foreground">View and manage student grades</p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Class Stats */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Class Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{classAverage.toFixed(1)}%</div>
              <p className="text-sm text-muted-foreground">Class Average</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{students.length}</div>
              <p className="text-sm text-muted-foreground">Total Students</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{assignments.length}</div>
              <p className="text-sm text-muted-foreground">Assignments</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">92%</div>
              <p className="text-sm text-muted-foreground">Submission Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Management Table */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Assignment Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Assignment</th>
                  <th className="text-center p-3 font-medium w-[100px]">Max Points</th>
                  <th className="text-center p-3 font-medium w-[100px]">Weight</th>
                  <th className="text-center p-3 font-medium w-[80px]">Graded</th>
                  <th className="text-center p-3 font-medium w-[100px]">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => {
                  const effectiveGraded = Boolean(getEffective(assignment.id, "graded", assignment.graded ?? false));
                  const effectiveMax = Number(getEffective(assignment.id, "maxGrade", assignment.maxGrade ?? 0));
                  const effectiveWeight = Number(getEffective(assignment.id, "weight", assignment.weight ?? 0));

                  return (
                    <tr key={assignment.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{assignment.title}</td>
                      <td className="text-center p-3">
                        <Input
                          type="number"
                          value={effectiveMax}
                          onChange={(e) => setEdit(assignment.id, "maxGrade", parseInt(e.target.value) || 0)}
                          className="w-20 text-center border-0 bg-transparent hover:bg-muted/50 focus:bg-background focus:border-input"
                          disabled={!effectiveGraded}
                        />
                      </td>
                      <td className="text-center p-3">
                        <Input
                          type="number"
                          value={effectiveWeight}
                          onChange={(e) => setEdit(assignment.id, "weight", parseInt(e.target.value) || 0)}
                          className="w-16 text-center border-0 bg-transparent hover:bg-muted/50 focus:bg-background focus:border-input"
                          min="0"
                          step="0.1"
                          disabled={!effectiveGraded}
                        />
                      </td>
                      <td className="text-center p-3">
                        <Switch
                          checked={effectiveGraded}
                          onCheckedChange={(checked) => setEdit(assignment.id, "graded", checked)}
                        />
                      </td>
                      <td className="text-center p-3">
                        <span className="text-sm text-muted-foreground">
                          {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : '-'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {hasChanges && (
            <div className="mt-4 flex justify-end">
              <Button onClick={saveAllChanges} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Students</CardTitle>
            <Button onClick={() => window.location.href = `/class/${classId}/grades/all`}>
              View All Students
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Student</th>
                  <th className="text-center p-3 font-medium">Overall Grade</th>
                  <th className="text-center p-3 font-medium">Assignments Completed</th>
                  <th className="text-center p-3 font-medium">Trend</th>
                  <th className="text-center p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => {
                  const studentGradesQuery = studentGradesQueries[index];
                  const studentGrades = studentGradesQuery?.data?.grades || [];

                  // Calculate real completed assignments and overall grade
                  const completedAssignments = studentGrades.filter(grade => grade.gradeReceived !== null).length;
                  const totalAssignments = assignments.filter(assignment => assignment.graded).length;

                  // Calculate overall grade percentage
                  let overallGrade = 0;
                  if (studentGrades.length > 0) {
                    const validGrades = studentGrades.filter(grade => grade.gradeReceived !== null);
                    if (validGrades.length > 0) {
                      const totalPoints = validGrades.reduce((sum, grade) => sum + grade.gradeReceived!, 0);
                      const maxPoints = validGrades.reduce((sum, grade) => sum + grade.assignment.maxGrade!, 0);
                      overallGrade = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
                    }
                  }

                  return (
                    <tr key={student.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.username}`} alt={student.username} />
                          </Avatar>
                          <span>{student.username}</span>
                        </div>
                      </td>
                      <td className="text-center p-3">
                        <div className={`text-lg font-bold ${getGradeColor(overallGrade, "graded")}`}>
                          {overallGrade}%
                        </div>
                      </td>
                      <td className="text-center p-3">
                        <span className="text-muted-foreground">
                          {completedAssignments}/{totalAssignments}
                        </span>
                      </td>
                      <td className="text-center p-3">
                        {getTrendIcon("up")}
                      </td>
                      <td className="text-center p-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.location.href = `/class/${classId}/grades/student/${student.id}`}
                        >
                          View Grades
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Grade Boundaries Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Grade Boundaries</CardTitle>
            <Button size="sm" onClick={() => setGradingBoundariesOpen(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Manage
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {gradingBoundaries.map((boundary) => {
              let name = "Untitled Grading Boundary";
              try {
                const parsed = JSON.parse(boundary.structured);
                name = parsed.name || name;
              } catch { }
              return (
                <div key={boundary.id} className="flex flex-row justify-between items-center p-3 rounded-md hover:bg-background-muted dark:hover:bg-background-subtle transition-colors">
                  <div className="flex flex-row items-center space-x-4">
                    <ClipboardList className="w-5 h-5 text-primary-500" />
                    <span className="font-medium text-foreground cursor-pointer hover:text-primary-500 transition-colors" onClick={() => handlePreviewGradingBoundary(boundary)}>
                      {name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handlePreviewGradingBoundary(boundary)} title="Preview">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => {
                      setEditingGradingBoundary(boundary);
                      setGradingBoundariesOpen(true);
                    }} title="Edit">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => {
                      if (confirm('Are you sure you want to delete this grading boundary?')) {
                        deleteGradingBoundary.mutate({ classId: classId as string, gradingBoundaryId: boundary.id });
                        refetchGrading();
                      }
                    }} disabled={deleteGradingBoundary.isPending} title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Rubrics Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Rubrics</CardTitle>
            <Button size="sm" onClick={handleCreateNewRubric}>
              <FileText className="h-4 w-4 mr-2" />
              Create New
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {markschemes.map((markscheme) => {
              let markschemeName = "Untitled Markscheme";
              try {
                const parsed = JSON.parse(markscheme.structured);
                markschemeName = parsed.name || markschemeName;
              } catch { }
              return (
                <div key={markscheme.id} className="flex flex-row justify-between items-center p-3 rounded-md hover:bg-background-muted dark:hover:bg-background-subtle transition-colors">
                  <div className="flex flex-row items-center space-x-4">
                    <ClipboardCheck className="w-5 h-5 text-primary-500" />
                    <span className="font-medium text-foreground cursor-pointer hover:text-primary-500 transition-colors" onClick={() => handlePreviewMarkscheme(markscheme)}>
                      {markschemeName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handlePreviewMarkscheme(markscheme)} title="Preview">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleEditRubric(markscheme)} title="Edit">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => {
                      if (confirm('Are you sure you want to delete this markscheme?')) {
                        deleteMarkscheme.mutate({ classId: classId as string, markSchemeId: markscheme.id });
                        refetchMarkschemes();
                      }
                    }} disabled={deleteMarkscheme.isPending} title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Preview Modal */}
      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              {previewMarkscheme ? (
                <>
                  <ClipboardCheck className="w-5 h-5 text-primary-500" />
                  Rubric Preview
                </>
              ) : (
                <>
                  <ClipboardList className="w-5 h-5 text-primary-500" />
                  Grading Boundaries Preview
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {previewMarkscheme && (
              <div className="flex-1 flex flex-col min-h-0">
                <ScrollArea className="flex-1 min-h-0">
                  <div className="space-y-4 pr-4">
                    {/* Rubric Details Card */}
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <Edit3 className="h-4 w-4" />
                          <CardTitle className="text-base">Rubric Details</CardTitle>
                          <Badge variant="outline" className="ml-auto">
                            {previewMarkscheme.structured ? (() => {
                              try {
                                const parsed = JSON.parse(previewMarkscheme.structured);
                                return parsed.category || 'Custom';
                              } catch {
                                return 'Custom';
                              }
                            })() : 'Custom'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Name</Label>
                            <div className="h-8 text-sm flex items-center">
                              {previewMarkscheme.structured ? (() => {
                                try {
                                  const parsed = JSON.parse(previewMarkscheme.structured);
                                  return parsed.name || 'Untitled Rubric';
                                } catch {
                                  return 'Untitled Rubric';
                                }
                              })() : 'Untitled Rubric'}
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs">Category</Label>
                            <div className="h-8 text-sm flex items-center">
                              {previewMarkscheme.structured ? (() => {
                                try {
                                  const parsed = JSON.parse(previewMarkscheme.structured);
                                  return parsed.category || 'Custom';
                                } catch {
                                  return 'Custom';
                                }
                              })() : 'Custom'}
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Description</Label>
                          <div className="text-sm text-muted-foreground">
                            {previewMarkscheme.structured ? (() => {
                              try {
                                const parsed = JSON.parse(previewMarkscheme.structured);
                                return parsed.description || 'No description provided';
                              } catch {
                                return 'No description provided';
                              }
                            })() : 'No description provided'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Rubric Component */}
                    {previewRubricCriteria.length > 0 ? (
                      <Rubric criteria={previewRubricCriteria} onChange={() => { }} />
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No criteria found in this rubric</p>
                        <p className="text-sm mt-2">Debug: {JSON.stringify(previewRubricCriteria)}</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}

            {previewGradingBoundary && (
              <div className="flex-1 flex flex-col min-h-0">
                <ScrollArea className="flex-1 min-h-0">
                  <div className="space-y-4 pr-4">
                    {/* Grading Boundary Details Card */}
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <ClipboardList className="h-4 w-4" />
                          <CardTitle className="text-base">Grading Boundary Details</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-xs">Name</Label>
                          <div className="h-8 text-sm flex items-center">
                            {previewGradingBoundary.structured ? (() => {
                              try {
                                const parsed = JSON.parse(previewGradingBoundary.structured);
                                return parsed.name || 'Untitled Grading Boundary';
                              } catch {
                                return 'Untitled Grading Boundary';
                              }
                            })() : 'Untitled Grading Boundary'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Grading Boundaries List */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Grade Boundaries</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {previewGradeBoundaries.map((boundary, index) => (
                          <div key={boundary.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
                                style={{ backgroundColor: boundary.color || '#6B7280' }}
                              >
                                {boundary.grade?.charAt(0) || 'G'}
                              </div>
                              <div>
                                <span className="font-medium">{boundary.grade || 'Grade'}</span>
                                <p className="text-sm text-muted-foreground">{boundary.description || 'No description'}</p>
                              </div>
                            </div>
                            <Badge variant="outline">
                              {boundary.minPercentage || 0}% - {boundary.maxPercentage || 100}%
                            </Badge>
                          </div>
                        ))}
                        {previewGradeBoundaries.length === 0 && (
                          <p className="text-muted-foreground text-center py-4">No grading boundaries defined</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <GradingBoundariesModal
        open={gradingBoundariesOpen}
        onOpenChange={(o) => { setGradingBoundariesOpen(o); if (!o) { refetchGrading(); setEditingGradingBoundary(null); } }}
        classId={classId as string}
        existingGradingBoundary={editingGradingBoundary}
      />

      <RubricModal
        open={rubricModalOpen}
        onOpenChange={(o) => { setRubricModalOpen(o); if (!o) { refetchMarkschemes(); setEditingRubric(null); } }}
        classId={classId as string}
        existingRubric={editingRubric}
      />
    </PageLayout>
  );
}
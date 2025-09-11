"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { PageLayout, PageHeader } from "@/components/ui/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { 
  ArrowLeft,
  Download,
  Edit,
  CheckCircle,
  X,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function StudentGrades() {
  const params = useParams();
  const classId = params.id as string;
  const studentId = params.studentId as string;
  const [editingGrades, setEditingGrades] = useState<{[key: string]: string}>({});
  
  const { data: classData, isLoading: classLoading } = trpc.class.get.useQuery({ classId });
  const { data: studentGrades, isLoading: gradesLoading, refetch } = trpc.class.getGrades.useQuery({ classId, userId: studentId });
  const updateGrade = trpc.class.updateGrade.useMutation({ onSuccess: () => refetch() });

  const student = classData?.class?.students.find(s => s.id === studentId);
  const grades = studentGrades?.grades ?? [];

  if (classLoading || gradesLoading) {
    return (
      <PageLayout>
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-6 w-64 bg-muted rounded" />
                  <div className="h-4 w-48 bg-muted rounded" />
                </div>
              </div>
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

  if (!student) {
    return (
      <PageLayout>
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-muted-foreground">Student not found</h2>
          <Button 
            className="mt-4"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>
      </PageLayout>
    );
  }

  const startEditing = (assignmentId: string, currentValue: string) => {
    setEditingGrades(prev => ({
      ...prev,
      [assignmentId]: currentValue
    }));
  };

  const handleGradeChange = (assignmentId: string, value: string) => {
    setEditingGrades(prev => ({
      ...prev,
      [assignmentId]: value
    }));
  };

  const saveGrade = async (assignmentId: string, submissionId: string) => {
    const editedValue = editingGrades[assignmentId];
    if (editedValue !== undefined) {
      await updateGrade.mutateAsync({
        classId,
        assignmentId,
        submissionId,
        gradeReceived: editedValue === "" ? null : Number(editedValue)
      });
      setEditingGrades(prev => {
        const newState = { ...prev };
        delete newState[assignmentId];
        return newState;
      });
    }
  };

  const cancelEditing = (assignmentId: string) => {
    setEditingGrades(prev => {
      const newState = { ...prev };
      delete newState[assignmentId];
      return newState;
    });
  };

  const getGradeColor = (grade: number | null, status: string) => {
    if (!grade) {
      return status === "missing" ? "text-destructive font-semibold" : "text-warning font-medium";
    }
    if (grade >= 90) return "text-green-600 font-semibold";
    if (grade >= 80) return "text-blue-600 font-medium";
    if (grade >= 70) return "text-yellow-600 font-medium";
    return "text-red-600 font-semibold";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down": return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Calculate overall grade
  let totalWeighted = 0;
  let totalWeight = 0;
  for (const g of grades) {
    if (g.gradeReceived != null && g.assignment.maxGrade && g.assignment.weight) {
      totalWeighted += (g.gradeReceived / g.assignment.maxGrade) * g.assignment.weight;
      totalWeight += g.assignment.weight;
    }
  }
  const overallGrade = totalWeight > 0 ? (totalWeighted / totalWeight) * 100 : 0;
  const completedAssignments = grades.filter(g => g.gradeReceived != null).length;
  const totalAssignments = grades.length;

  return (
    <PageLayout>
      <PageHeader 
        title={`${student.username} - Grades`}
        description="Individual student grade management"
      >
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </PageHeader>

      {/* Student Info */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.username}`} alt={student.username} />
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{student.username}</h2>
              {student.email && <p className="text-muted-foreground">{student.email}</p>}
            </div>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className={`text-2xl font-bold ${getGradeColor(overallGrade, "graded")}`}>
                  {overallGrade.toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">Overall Grade</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {completedAssignments}/{totalAssignments}
                </div>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <div>
                <div className="flex items-center justify-center">
                  {getTrendIcon("up")}
                </div>
                <p className="text-sm text-muted-foreground">Trend</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Assignment</th>
                  <th className="text-center p-3 font-medium w-[100px]">Grade</th>
                  <th className="text-center p-3 font-medium w-[100px]">Total</th>
                  <th className="text-center p-3 font-medium w-[100px]">%</th>
                  <th className="text-center p-3 font-medium w-[120px]">Status</th>
                  <th className="text-center p-3 font-medium w-[120px]">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((g) => {
                  const isEditing = editingGrades[g.assignment.id] !== undefined;
                  const percentage = g.gradeReceived ? 
                    (g.gradeReceived / (g.assignment.maxGrade || 1) * 100).toFixed(1) : null;
                  
                  return (
                    <tr key={g.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{g.assignment.title}</td>
                      <td className="text-center p-3">
                        {isEditing ? (
                          <div className="flex items-center justify-center space-x-1">
                            <Input
                              type="number"
                              value={editingGrades[g.assignment.id]}
                              onChange={(e) => handleGradeChange(g.assignment.id, e.target.value)}
                              className="w-16 text-center"
                              max={g.assignment.maxGrade || undefined}
                              min={0}
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => saveGrade(g.assignment.id, g.id)}
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => cancelEditing(g.assignment.id)}
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        ) : (
                          <div className="group relative">
                            {g.gradeReceived ? (
                              <div 
                                className="cursor-pointer hover:bg-muted/50 p-1 rounded border border-transparent hover:border-border" 
                                onClick={() => startEditing(g.assignment.id, g.gradeReceived?.toString() || '')}
                              >
                                <div className={`font-medium ${getGradeColor(g.gradeReceived, "graded")}`}>
                                  {g.gradeReceived}
                                </div>
                                <Edit className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-1 -right-1" />
                              </div>
                            ) : (
                              <div 
                                className="cursor-pointer hover:bg-muted/50 p-1 rounded border border-transparent hover:border-border" 
                                onClick={() => startEditing(g.assignment.id, '')}
                              >
                                <span className="text-muted-foreground">-</span>
                                <Edit className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-1 -right-1" />
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="text-center p-3 text-muted-foreground">
                        {g.assignment.maxGrade || "-"}
                      </td>
                      <td className="text-center p-3">
                        {percentage ? `${percentage}%` : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="text-center p-3">
                        <Badge variant={
                          g.gradeReceived ? "default" : "secondary"
                        }>
                          {g.gradeReceived ? "graded" : "pending"}
                        </Badge>
                      </td>
                      <td className="text-center p-3 text-sm text-muted-foreground">
                        {g.submittedAt ? 
                          new Date(g.submittedAt).toLocaleDateString() : 
                          "-"
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

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

// Mock data
const mockStudentData = {
  "1": {
    id: "1",
    name: "Alex Johnson",
    email: "alex.johnson@school.edu",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    assignments: [
      { assignmentId: "1", name: "Lab Report #3", grade: 95, points: 100, status: "graded", submittedAt: "2024-01-20" },
      { assignmentId: "2", name: "Chapter 8 Quiz", grade: 87, points: 50, status: "graded", submittedAt: "2024-01-18" },
      { assignmentId: "3", name: "Homework Set 5", grade: null, points: 75, status: "pending", submittedAt: null }
    ],
    overallGrade: 91.2,
    trend: "up"
  },
  "2": {
    id: "2",
    name: "Sarah Chen",
    email: "sarah.chen@school.edu",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    assignments: [
      { assignmentId: "1", name: "Lab Report #3", grade: 88, points: 100, status: "graded", submittedAt: "2024-01-20" },
      { assignmentId: "2", name: "Chapter 8 Quiz", grade: 92, points: 50, status: "graded", submittedAt: "2024-01-18" },
      { assignmentId: "3", name: "Homework Set 5", grade: 78, points: 75, status: "graded", submittedAt: "2024-01-25" }
    ],
    overallGrade: 86.4,
    trend: "down"
  },
  "3": {
    id: "3",
    name: "Michael Rodriguez",
    email: "michael.rodriguez@school.edu",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    assignments: [
      { assignmentId: "1", name: "Lab Report #3", grade: 92, points: 100, status: "graded", submittedAt: "2024-01-20" },
      { assignmentId: "2", name: "Chapter 8 Quiz", grade: 85, points: 50, status: "graded", submittedAt: "2024-01-18" },
      { assignmentId: "3", name: "Homework Set 5", grade: null, points: 75, status: "missing", submittedAt: null }
    ],
    overallGrade: 88.5,
    trend: "stable"
  }
};

export default function StudentGrades() {
  const { studentId } = useParams<{ studentId: string }>();
  const [editingGrades, setEditingGrades] = useState<{[key: string]: string}>({});
  
  const student = studentId ? mockStudentData[studentId as keyof typeof mockStudentData] : null;

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

  const saveGrade = (assignmentId: string) => {
    const editedValue = editingGrades[assignmentId];
    if (editedValue !== undefined) {
      console.log(`Saving grade for student ${student.id}, assignment ${assignmentId}: ${editedValue}`);
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

  const completedAssignments = student.assignments.filter(a => a.grade !== null).length;
  const totalAssignments = student.assignments.length;

  return (
    <PageLayout>
      <PageHeader 
        title={`${student.name} - Grades`}
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
              <img src={student.avatar} alt={student.name} />
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{student.name}</h2>
              <p className="text-muted-foreground">{student.email}</p>
            </div>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className={`text-2xl font-bold ${getGradeColor(student.overallGrade, "graded")}`}>
                  {student.overallGrade}%
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
                  {getTrendIcon(student.trend)}
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
                {student.assignments.map((assignment) => {
                  const isEditing = editingGrades[assignment.assignmentId] !== undefined;
                  const percentage = assignment.grade ? 
                    (assignment.grade / assignment.points * 100).toFixed(1) : null;
                  
                  return (
                    <tr key={assignment.assignmentId} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{assignment.name}</td>
                      <td className="text-center p-3">
                        {isEditing ? (
                          <div className="flex items-center justify-center space-x-1">
                            <Input
                              type="number"
                              value={editingGrades[assignment.assignmentId]}
                              onChange={(e) => handleGradeChange(assignment.assignmentId, e.target.value)}
                              className="w-16 text-center"
                              max={assignment.points}
                              min={0}
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => saveGrade(assignment.assignmentId)}
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => cancelEditing(assignment.assignmentId)}
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        ) : (
                          <div className="group relative">
                            {assignment.grade ? (
                              <div 
                                className="cursor-pointer hover:bg-muted/50 p-1 rounded border border-transparent hover:border-border" 
                                onClick={() => startEditing(assignment.assignmentId, assignment.grade?.toString() || '')}
                              >
                                <div className={`font-medium ${getGradeColor(assignment.grade, assignment.status)}`}>
                                  {assignment.grade}
                                </div>
                                <Edit className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-1 -right-1" />
                              </div>
                            ) : (
                              <div 
                                className="cursor-pointer hover:bg-muted/50 p-1 rounded border border-transparent hover:border-border" 
                                onClick={() => startEditing(assignment.assignmentId, '')}
                              >
                                <span className="text-muted-foreground">-</span>
                                <Edit className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-1 -right-1" />
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="text-center p-3 text-muted-foreground">
                        {assignment.points}
                      </td>
                      <td className="text-center p-3">
                        {percentage ? `${percentage}%` : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="text-center p-3">
                        <Badge variant={
                          assignment.status === "missing" ? "destructive" : 
                          assignment.status === "graded" ? "default" : "secondary"
                        }>
                          {assignment.status}
                        </Badge>
                      </td>
                      <td className="text-center p-3 text-sm text-muted-foreground">
                        {assignment.submittedAt ? 
                          new Date(assignment.submittedAt).toLocaleDateString() : 
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
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { PageLayout } from "@/components/ui/page-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { DataTable } from "@/components/ui/data-table";
import { 
  Download,
  Edit,
  CheckCircle,
  X,
  ClipboardList,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Minus,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { RouterOutputs, trpc } from "@/lib/trpc";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { calculateTrend, getTrendIcon, getGradeColor, cn, getGradeBorderAndBackground } from "@/lib/utils";
import UserProfilePicture from "@/components/UserProfilePicture";

function StudentGradesSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-16" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-muted/30 rounded-lg space-y-2">
          <Skeleton className="h-8 w-20 mx-auto" />
          <Skeleton className="h-3 w-24 mx-auto" />
        </div>
        <div className="p-4 bg-muted/30 rounded-lg space-y-2">
          <Skeleton className="h-8 w-16 mx-auto" />
          <Skeleton className="h-3 w-20 mx-auto" />
        </div>
        <div className="p-4 bg-muted/30 rounded-lg space-y-2">
          <Skeleton className="h-8 w-8 mx-auto" />
          <Skeleton className="h-3 w-12 mx-auto" />
        </div>
      </div>

      <Separator />

      {/* Table skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  );
}

export default function StudentGrades() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;
  const studentId = params.studentId as string;
  const [editingGrades, setEditingGrades] = useState<{[key: string]: string}>({});
  const t = useTranslations('individualGrades');
  
  const appState = useSelector((state: RootState) => state.app);
  const isStudent = appState.user.student;
  
  const { data: classData, isLoading: classLoading } = trpc.class.get.useQuery({ classId });
  const { data: studentGrades, isLoading: gradesLoading, refetch } = trpc.class.getGrades.useQuery({ classId, userId: studentId });
  const updateGrade = trpc.class.updateGrade.useMutation({ onSuccess: () => refetch() });

  const student = classData?.class?.students.find(s => s.id === studentId);
  const grades = studentGrades?.grades ?? [];

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

  // Grade table columns
  const gradeColumns: ColumnDef<RouterOutputs["class"]["getGrades"]["grades"][number]>[] = [
    {
      id: "assignmentTitle",
      accessorKey: "assignment.title",
      header: t('table.assignment'),
      cell: ({ row }) => {
        const grade = row.original;
        const hasRubric = grade.assignment.markScheme !== null;
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{grade.assignment.title}</span>
            {hasRubric && (
              <Badge variant="secondary" className="text-[10px]">Rubric</Badge>
            )}
          </div>
        );
      },
      filterFn: (row, id, value) => {
        const searchValue = String(value || '').toLowerCase().trim();
        if (!searchValue) return true;
        const assignmentTitle = row.original.assignment.title?.toLowerCase() || '';
        return assignmentTitle.includes(searchValue);
      },
    },
    {
      accessorKey: "grade",
      header: t('table.grade'),
      cell: ({ row }) => {
        const grade = row.original;
        const hasRubric = grade.assignment.markScheme !== null;
        const isEditing = !isStudent && !hasRubric && editingGrades[grade.assignment.id] !== undefined;
        
        // Read-only view for students
        if (isStudent) {
          const percentage = grade.gradeReceived && grade.assignment.maxGrade
            ? (grade.gradeReceived / grade.assignment.maxGrade) * 100
            : null;
          return (
            <div className="w-24 text-center">
              {grade.gradeReceived ? (
                <div className={`font-medium ${getGradeColor(percentage)}`}>
                  {grade.gradeReceived}
                </div>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
          );
        }
        
        // If assignment has a rubric, show grade with button to open assignment
        if (hasRubric) {
          const percentage = grade.gradeReceived && grade.assignment.maxGrade
            ? (grade.gradeReceived / grade.assignment.maxGrade) * 100
            : null;
          return (
            <div className="flex items-center justify-center">
              <div className="w-16 text-center">
                {grade.gradeReceived ? (
                  <div className={`font-medium ${getGradeColor(percentage)}`}>
                    {grade.gradeReceived}
                  </div>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/class/${classId}/assignment/${grade.assignment.id}`)}
                className="h-6 px-2 text-xs shrink-0"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                {t('grade')}
              </Button>
            </div>
          );
        }
        
        // Editable view for teachers (no rubric)
        if (isEditing) {
          return (
            <div className="flex items-center justify-center gap-1 w-32">
              <Input
                type="number"
                value={editingGrades[grade.assignment.id]}
                onChange={(e) => handleGradeChange(grade.assignment.id, e.target.value)}
                className="w-16 text-center"
                max={grade.assignment.maxGrade || undefined}
                min={0}
                autoFocus
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => saveGrade(grade.assignment.id, grade.id)}
                disabled={updateGrade.isPending}
                className="h-6 w-6 p-0 shrink-0"
              >
                <CheckCircle className="h-4 w-4 text-green-600" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => cancelEditing(grade.assignment.id)}
                className="h-6 w-6 p-0 shrink-0"
              >
                <X className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          );
        }

        const percentage = grade.gradeReceived && grade.assignment.maxGrade
          ? (grade.gradeReceived / grade.assignment.maxGrade) * 100
          : null;
        return (
          <div className="w-24 text-center group relative">
            {grade.gradeReceived ? (
              <div 
                className="cursor-pointer hover:bg-muted/50 p-1 rounded border border-transparent hover:border-border inline-block"
                onClick={() => startEditing(grade.assignment.id, grade.gradeReceived?.toString() || '')}
              >
                <div className={`font-medium ${getGradeColor(percentage)}`}>
                  {grade.gradeReceived}
                </div>
                <Edit className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-1 -right-1" />
              </div>
            ) : (
              <div 
                className="cursor-pointer hover:bg-muted/50 p-1 rounded border border-transparent hover:border-border inline-block"
                onClick={() => startEditing(grade.assignment.id, '')}
              >
                <span className="text-muted-foreground">—</span>
                <Edit className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-1 -right-1" />
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "assignment.maxGrade",
      header: t('table.total'),
      cell: ({ row }) => {
        const grade = row.original;
        return (
          <div className="w-20 text-center text-muted-foreground">
            {grade.assignment.maxGrade || "—"}
          </div>
        );
      },
    },
    {
      accessorKey: "percentage",
      header: t('table.percentage'),
      cell: ({ row }) => {
        const grade = row.original;
        const percentage = grade.gradeReceived ? 
          (grade.gradeReceived / (grade.assignment.maxGrade || 1) * 100).toFixed(1) : null;
        
        return (
          <div className="w-24 text-center">
            {percentage ? (
              <span className={getGradeColor(parseFloat(percentage))}>{percentage}%</span>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: t('table.status'),
      cell: ({ row }) => {
        const grade = row.original;
        return (
          <div className="w-28 flex justify-center">
            <Badge variant={grade.gradeReceived !== null ? "default" : "secondary"}>
              {grade.gradeReceived !== null ? t('status.graded') : t('status.pending')}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "submitted",
      header: t('table.submitted'),
      cell: ({ row }) => {
        const grade = row.original;
        return (
          <div className="w-32 text-center">
            <span className="text-sm text-muted-foreground">
              {grade.submittedAt ? new Date(grade.submittedAt).toLocaleDateString() : '—'}
            </span>
          </div>
        );
      },
    },
  ];

  if (classLoading || gradesLoading) {
    return (
      <PageLayout>
        <StudentGradesSkeleton />
      </PageLayout>
    );
  }

  if (!student) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <EmptyState
              icon={GraduationCap}
              title={t('studentNotFound')}
              description="The student you're looking for doesn't exist or has been removed."
            />
            <Button onClick={() => router.back()}>
              {t('goBack')}
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

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
  const trend = calculateTrend(grades);

  // Get trend details for display
  const getTrendDetails = (trend: number) => {
    if (trend > 5) return { icon: <TrendingUp className="h-6 w-6 text-green-500" />, label: "Improving", color: "text-green-500" };
    if (trend < -5) return { icon: <TrendingDown className="h-6 w-6 text-red-500" />, label: "Declining", color: "text-red-500" };
    return { icon: <Minus className="h-6 w-6 text-muted-foreground" />, label: "Stable", color: "text-muted-foreground" };
  };

  const trendDetails = getTrendDetails(Number(trend));

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          {/* Back button */}
          <button 
            onClick={() => router.back()}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </button>

          {/* Student Info */}
          <div className="flex items-center gap-4">
            <UserProfilePicture profilePicture={student.profile?.profilePicture || ""} username={student.username} />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                {isStudent ? t('myGrades') : student.profile?.displayName || student.username}
              </h1>
              <p className="text-muted-foreground">
                {isStudent ? t('trackProgress') : t('individualManagement')}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card className={getGradeBorderAndBackground(overallGrade)}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getGradeColor(overallGrade)}`}>
                  {overallGrade.toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground mt-1">{t('overallGrade')}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold">
                  <span className="text-foreground">{completedAssignments}</span>
                  <span className="text-muted-foreground text-xl">/{totalAssignments}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{t('completed')}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex justify-center mb-1">
                  {trendDetails.icon}
                </div>
                <p className={`text-sm font-medium ${trendDetails.color}`}>{trendDetails.label}</p>
                <p className="text-xs text-muted-foreground">{t('trend')}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Assignments Table */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">
              {isStudent ? t('yourGrades') : t('assignments')}
            </h2>
          </div>

          {grades.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title={t('empty.title')}
              description={t('empty.description')}
              className="border rounded-lg"
            />
          ) : (
            <DataTable
              columns={gradeColumns}
              data={grades}
              searchKey="assignmentTitle"
              searchPlaceholder={t('searchPlaceholder')}
              allowDownload={!isStudent}
              downloadFileName={`${student.username}_grades`}
              getRawValue={(column, row) => {
                const grade = row;
                const columnDef = column.columnDef as any;
                const accessorKey = columnDef.accessorKey;
                const columnId = column.id;
                
                // Handle by column ID first
                if (columnId === 'assignmentTitle') {
                  return grade.assignment.title;
                }
                
                // Handle by accessorKey
                if (accessorKey === 'grade') {
                  return grade.gradeReceived ?? '';
                }
                
                if (accessorKey === 'assignment.maxGrade') {
                  return grade.assignment.maxGrade ?? '';
                }
                
                if (accessorKey === 'percentage') {
                  const percentage = grade.gradeReceived && grade.assignment.maxGrade
                    ? (grade.gradeReceived / grade.assignment.maxGrade * 100).toFixed(1)
                    : null;
                  return percentage ? `${percentage}%` : '';
                }
                
                if (accessorKey === 'status') {
                  return grade.gradeReceived !== null ? t('status.graded') : t('status.pending');
                }
                
                if (accessorKey === 'submitted') {
                  return grade.submittedAt ? new Date(grade.submittedAt).toLocaleDateString() : '';
                }
                
                // Fallback: try to get value using accessorKey with nested properties
                if (accessorKey && accessorKey.includes('.')) {
                  const keys = accessorKey.split('.');
                  const value = keys.reduce((obj: any, key: string) => obj?.[key], grade);
                  return value ?? '';
                }
                
                return undefined; // Let default behavior handle it
              }}
            />
          )}
        </div>
      </div>
    </PageLayout>
  );
}

"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { PageLayout } from "@/components/ui/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { DataTable } from "@/components/ui/data-table";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { 
  Edit,
  CheckCircle,
  X,
  ClipboardList,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Minus,
  GraduationCap,
  Send,
  Sparkles,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { RouterOutputs, trpc } from "@/lib/trpc";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { calculateTrend, getGradeColor, cn, getGradeBorderAndBackground } from "@/lib/utils";
import UserProfilePicture from "@/components/UserProfilePicture";

function StudentGradesSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
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
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="p-4 bg-muted/30 rounded-lg space-y-2">
            <Skeleton className="h-8 w-20 mx-auto" />
            <Skeleton className="h-3 w-24 mx-auto" />
          </div>
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}

export default function StudentGrades() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;
  const studentId = params.studentId as string;
  const [editingGrades, setEditingGrades] = useState<{[key: string]: string}>({});
  const [aiMessage, setAiMessage] = useState("");
  const [aiChat, setAiChat] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const t = useTranslations('individualGrades');
  
  const appState = useSelector((state: RootState) => state.app);
  const isStudent = appState.user.student;
  
  const { data: classData, isLoading: classLoading } = trpc.class.get.useQuery({ classId });
  const { data: studentGrades, isLoading: gradesLoading, refetch } = trpc.class.getGrades.useQuery({ classId, userId: studentId });
  const updateGrade = trpc.class.updateGrade.useMutation({ onSuccess: () => refetch() });

  const student = classData?.class?.students.find(s => s.id === studentId);
  const grades = studentGrades?.grades ?? [];


  console.log(grades)
  // Prepare chart data - sort by submission date
  const chartData = useMemo(() => {
    const sortedGrades = [...grades]
      .filter(g => g.gradeReceived != null && g.returned)
      .sort((a, b) => new Date(a.assignment.dueDate || '').getTime() - new Date(b.assignment.dueDate || '').getTime());
    
    return sortedGrades.map((g, idx) => ({
      name: g.assignment.title.length > 12 ? g.assignment.title.slice(0, 12) + '...' : g.assignment.title,
      fullName: g.assignment.title,
      grade: g.gradeReceived,
      percentage: g.assignment.maxGrade ? Math.round((g.gradeReceived! / g.assignment.maxGrade) * 100) : 0,
      maxGrade: g.assignment.maxGrade,
      date: g.submittedAt ? new Date(g.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
      idx: idx + 1,
    }));
  }, [grades]);

  console.log(chartData)

  // Calculate running average for trajectory
  const trajectoryData = useMemo(() => {
    let runningTotal = 0;
    return chartData.map((item, idx) => {
      runningTotal += item.percentage;
      return {
        ...item,
        average: Math.round(runningTotal / (idx + 1)),
      };
    });
  }, [chartData]);

  const startEditing = (assignmentId: string, currentValue: string) => {
    setEditingGrades(prev => ({ ...prev, [assignmentId]: currentValue }));
  };

  const handleGradeChange = (assignmentId: string, value: string) => {
    setEditingGrades(prev => ({ ...prev, [assignmentId]: value }));
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

  // AI Chat handler (mock for now - would connect to actual AI endpoint)
  const handleAiSubmit = async () => {
    if (!aiMessage.trim()) return;
    
    const userMsg = aiMessage;
    setAiChat(prev => [...prev, { role: 'user', content: userMsg }]);
    setAiMessage("");
    setIsAiLoading(true);

    // Simulate AI response - in production this would call your AI endpoint
    setTimeout(() => {
      const studentName = student?.profile?.displayName || student?.username || "this student";
      const avgGrade = trajectoryData.length > 0 
        ? trajectoryData[trajectoryData.length - 1].average 
        : 0;
      
      let response = "";
      if (userMsg.toLowerCase().includes("improve") || userMsg.toLowerCase().includes("help")) {
        response = `Based on ${studentName}'s current trajectory (${avgGrade}% average), I'd recommend focusing on consistent practice and timely submissions. Their recent assignments show ${trend == 'up' ? 'improvement' : trend == 'down' ? 'a slight dip' : 'stable performance'}. Consider reviewing any concepts from lower-scoring assignments.`;
      } else if (userMsg.toLowerCase().includes("strength") || userMsg.toLowerCase().includes("good")) {
        response = `${studentName} has shown strong performance in completing assignments on time. Their best scores are in the most recent submissions, indicating growth. Keep encouraging this momentum!`;
      } else {
        response = `${studentName} currently has an average of ${avgGrade}% across ${chartData.length} graded assignments. ${trend =='up' ? 'Their grades are trending upward, which is great!' : trend == 'down' ? 'Recent grades have dipped slightly - might be worth checking in.' : 'Performance has been consistent.'} Is there something specific you'd like to know about their progress?`;
      }
      
      setAiChat(prev => [...prev, { role: 'ai', content: response }]);
      setIsAiLoading(false);
    }, 1000);
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
      cell: ({ row }) => (
        <div className="w-20 text-center text-muted-foreground">
          {row.original.assignment.maxGrade || "—"}
        </div>
      ),
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
      cell: ({ row }) => (
        <div className="w-28 flex justify-center">
          <Badge variant={row.original.gradeReceived !== null ? "default" : "secondary"}>
            {row.original.gradeReceived !== null ? t('status.graded') : t('status.pending')}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "submitted",
      header: t('table.submitted'),
      cell: ({ row }) => (
        <div className="w-32 text-center">
          <span className="text-sm text-muted-foreground">
            {row.original.submittedAt ? new Date(row.original.submittedAt).toLocaleDateString() : '—'}
          </span>
        </div>
      ),
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
        <div className="max-w-5xl mx-auto">
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

  const getTrendDetails = (trend: number) => {
    if (trend > 5) return { icon: <TrendingUp className="h-5 w-5 text-green-500" />, label: "Improving", color: "text-green-500" };
    if (trend < -5) return { icon: <TrendingDown className="h-5 w-5 text-red-500" />, label: "Declining", color: "text-red-500" };
    return { icon: <Minus className="h-5 w-5 text-muted-foreground" />, label: "Stable", color: "text-muted-foreground" };
  };

  const trendDetails = getTrendDetails(Number(trend));

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium">{payload[0]?.payload?.fullName || label}</p>
          <p className="text-sm text-muted-foreground">{payload[0]?.payload?.date}</p>
          <p className="text-sm mt-1">
            <span className="font-medium">{payload[0]?.value}%</span>
            {payload[1] && <span className="text-muted-foreground ml-2">avg: {payload[1].value}%</span>}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <button 
            onClick={() => router.back()}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </button>

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
            <CardContent className="pt-5 pb-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getGradeColor(overallGrade)}`}>
                  {overallGrade.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">{t('overallGrade')}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  <span>{completedAssignments}</span>
                  <span className="text-muted-foreground text-lg">/{totalAssignments}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{t('completed')}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="text-center">
                <div className="flex justify-center items-center gap-2">
                  {trendDetails.icon}
                  <span className={`text-sm font-medium ${trendDetails.color}`}>{trendDetails.label}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{t('trend')}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        {chartData.length > 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Grade Trajectory Line Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Grade Trajectory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trajectoryData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 10 }} 
                        className="text-muted-foreground"
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        tick={{ fontSize: 10 }} 
                        className="text-muted-foreground"
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine y={70} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" opacity={0.5} />
                      <Line 
                        type="monotone" 
                        dataKey="percentage" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="average" 
                        stroke="hsl(var(--muted-foreground))" 
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Solid line: individual grades · Dashed: running average
                </p>
              </CardContent>
            </Card>

            {/* Performance Area Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Performance Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trajectoryData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="gradeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 10 }} 
                        className="text-muted-foreground"
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        tick={{ fontSize: 10 }} 
                        className="text-muted-foreground"
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="percentage" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#gradeGradient)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* AI Chat Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Ask AI about {isStudent ? 'your' : 'this student\'s'} performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiChat.length > 0 && (
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {aiChat.map((msg, idx) => (
                  <div key={idx} className={cn(
                    "text-sm p-3 rounded-lg",
                    msg.role === 'user' 
                      ? "bg-primary/10 ml-8" 
                      : "bg-muted mr-8"
                  )}>
                    {msg.content}
                  </div>
                ))}
                {isAiLoading && (
                  <div className="bg-muted mr-8 p-3 rounded-lg">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <Textarea
                placeholder="e.g., How can this student improve? What are their strengths?"
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAiSubmit();
                  }
                }}
                className="min-h-[40px] max-h-[80px] resize-none"
                rows={1}
              />
              <Button 
                size="icon" 
                onClick={handleAiSubmit}
                disabled={!aiMessage.trim() || isAiLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Assignments Table */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            {isStudent ? t('yourGrades') : t('assignments')}
          </h2>

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
                
                if (columnId === 'assignmentTitle') return grade.assignment.title;
                if (accessorKey === 'grade') return grade.gradeReceived ?? '';
                if (accessorKey === 'assignment.maxGrade') return grade.assignment.maxGrade ?? '';
                if (accessorKey === 'percentage') {
                  const percentage = grade.gradeReceived && grade.assignment.maxGrade
                    ? (grade.gradeReceived / grade.assignment.maxGrade * 100).toFixed(1)
                    : null;
                  return percentage ? `${percentage}%` : '';
                }
                if (accessorKey === 'status') return grade.gradeReceived !== null ? t('status.graded') : t('status.pending');
                if (accessorKey === 'submitted') return grade.submittedAt ? new Date(grade.submittedAt).toLocaleDateString() : '';
                if (accessorKey && accessorKey.includes('.')) {
                  const keys = accessorKey.split('.');
                  const value = keys.reduce((obj: any, key: string) => obj?.[key], grade);
                  return value ?? '';
                }
                return undefined;
              }}
            />
          )}
        </div>
      </div>
    </PageLayout>
  );
}

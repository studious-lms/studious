"use client";

import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ChevronRight, FileText, Sparkles } from "lucide-react";
import { WorksheetDoer } from "@/components/worksheets/worksheetdoer/WorksheetDoer";
import { WorksheetViewer } from "@/components/worksheets/worksheet-viewer";

export default function WorksheetSubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const appState = useSelector((state: RootState) => state.app);

  const classId = params.id as string;
  const worksheetId = params.worksheetId as string;
  const submissionId = params.submissionId as string;

  const isTeacher = appState.user.teacher;

  // Fetch worksheet to get the name and questions count
  const { data: worksheet, isLoading: isWorksheetLoading } = trpc.worksheet.getWorksheet.useQuery({
    worksheetId,
  });

  // Fetch submission to check status
  const { data: submission, isLoading: isSubmissionLoading } = trpc.assignment.getSubmissionById.useQuery({
    submissionId,
    classId,
  }, {
    enabled: !!submissionId,
    retry: false,
  });

  const isLoading = isWorksheetLoading || isSubmissionLoading;

  // Determine if the worksheet should be readonly
  // Students: readonly if submitted, Teachers: always view mode

  const isReadonly = isTeacher || submission?.submitted;
  const showFeedback = submission?.returned || false;

  // Navigate back
  const handleBack = () => {
    router.back();
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-3rem)] gap-4 px-4 pt-4">
        {/* Header Card Skeleton */}
        <Card className="flex-shrink-0">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              {/* Breadcrumb Skeleton */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-4 w-24" />
                <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                <Skeleton className="h-4 w-32" />
              </div>
              {/* Title Skeleton */}
              <Skeleton className="h-8 w-64" />
              {/* Stats Skeleton */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Skeleton */}
        <Card className="flex-1">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] gap-4 px-4 pt-4">
      {/* Header Card */}
      <Card className="flex-shrink-0 w-full max-w-[55rem] mx-auto">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2">
              <nav className="flex items-center text-sm text-muted-foreground">
                <button
                  onClick={handleBack}
                  className="hover:text-foreground transition-colors"
                >
                  {submission?.assignment.title}
                </button>
                <ChevronRight className="h-4 w-4 mx-1.5" />
                <span className="text-foreground font-medium truncate max-w-[200px]">
                  {worksheet?.name || "Worksheet"}
                </span>
              </nav>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-semibold">
              {worksheet?.name || "Worksheet"}
            </h1>

            {/* Stats Row */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60">
                <FileText className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {worksheet?.questions?.length || 0} questions
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60">
                <Sparkles className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {isTeacher ? "Viewing student work" : isReadonly ? "Submitted" : "In progress"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Worksheet Content */}
      <div className="flex-shrink-0 w-full max-w-[55rem] mx-auto">
          {isReadonly ? (
            <WorksheetViewer
              submissionId={submissionId}
              worksheetId={worksheetId}
              showFeedback={showFeedback}
            />
          ) : (
            <WorksheetDoer
              readonly={false}
              submissionId={submissionId}
              worksheetId={worksheetId}
            />
          )}
        </div>
    </div>
  );
}


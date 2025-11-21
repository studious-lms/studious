"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { RouterOutputs, trpc } from "@/lib/trpc";
import { RootState } from "@/store/store";
import { WorksheetQuestionViewer } from "./worksheet-question-viewer";

interface WorksheetViewerProps {
  worksheetId: string;
  submissionId?: string;
  showAnswers?: boolean;
  showFeedback?: boolean;
}
export function WorksheetViewer({ 
  worksheetId,
  submissionId,
  showAnswers = false,
  showFeedback = false
}: WorksheetViewerProps) {
  const appState = useSelector((state: RootState) => state.app);
  const isTeacher = appState.user.teacher;

  // Fetch worksheet
  const { data: worksheet, isLoading: worksheetLoading } = trpc.worksheet.getWorksheet.useQuery({
    worksheetId,
  });

  // Fetch student responses if submissionId is provided
  const { data: worksheetResponse, refetch: refetchWorksheetResponse } = trpc.worksheet.getWorksheetSubmission.useQuery(
    {
      worksheetId,
      submissionId: submissionId!,
    },
    {
      enabled: !!submissionId,
    }
  );

  const questions = useMemo(() => worksheet?.questions || [], [worksheet?.questions]);

  // Initialize answers from student responses if in submission mode
  const initializeAnswers = useCallback(() => {
    const initial: Record<string, string | string[]> = {};
    
    if (worksheetResponse && worksheetResponse.responses && questions.length > 0) {
      worksheetResponse.responses.forEach((response: RouterOutputs['worksheet']['getWorksheetSubmission']['responses'][number]) => {
        const question = questions.find((q) => q.id === response.questionId);
        if (question && question.type === "MULTIPLE_CHOICE" && typeof response.response === 'string') {
          try {
            const parsed = JSON.parse(response.response);
            initial[response.questionId] = parsed;
          } catch {
            initial[response.questionId] = response.response;
          }
        } else {
          initial[response.questionId] = response.response;
        }
      });
    }
    
    return initial;
  }, [questions, worksheetResponse]);

  const [answers, setAnswers] = useState<Record<string, string | string[]>>(initializeAnswers());

  useEffect(() => {
    setAnswers(initializeAnswers());
  }, [initializeAnswers]);

  if (worksheetLoading) {
    return (
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-muted-foreground">Loading worksheet...</p>
      </div>
    );
  }

  if (!worksheet) {
    return (
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-muted-foreground">Worksheet not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Questions */}
      <div className="space-y-4">
        {questions.map((question, index) => {
          const answer = submissionId ? (answers[question.id] || 'No answer provided') : null;

          return (
            <WorksheetQuestionViewer
              key={question.id}
                      question={question}
              index={index}
              answer={answer}
              showAnswers={showAnswers}
              showFeedback={showFeedback}
              isTeacher={isTeacher}
              
              submissionId={submissionId}
                  // @ts-expect-error - worksheetResponse is typed as RouterOutputs['worksheet']['getWorksheetSubmission'], issues with JsonValue.
                      worksheetResponse={worksheetResponse as WorksheetSubmissionResponse}
              worksheetId={worksheetId}
              onChangeComment={() => {
                refetchWorksheetResponse();
              }}
            />
          );
        })}
      </div>
    </div>
  );
}


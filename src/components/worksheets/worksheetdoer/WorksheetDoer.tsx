"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText,
  Clock,
  Gem,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { WorksheetQuestionInput } from "./WorksheetQuestionInput";
import { 
  CheckCircle,
  Calculator,
  ToggleLeft,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface WorksheetDoerProps {
  onSubmit?: (answers: Record<string, any>) => void;
  readonly?: boolean;
  worksheetId?: string;
  submissionId?: string;
}

export function WorksheetDoer({ 
  onSubmit,
  readonly = false,
  worksheetId,
  submissionId
}: WorksheetDoerProps) {
  // Fetch worksheet submission if worksheetId and submissionId are provided
  const { data: worksheetResponse, isLoading: isWorksheetResponseLoading } = trpc.worksheet.getWorksheetSubmission.useQuery(
    {
      worksheetId: worksheetId!,
      submissionId: submissionId!,
    },
    {
      enabled: !!worksheetId && !!submissionId,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );

  const { data: worksheet, isLoading: isWorksheetLoading } = trpc.worksheet.getWorksheet.useQuery({
    worksheetId: worksheetId!,
  });

  const questions = worksheet?.questions || [];

  // Get the worksheet response ID (first one from the array)
  const worksheetResponseId = worksheetResponse?.id;
  const isSubmitted = worksheetResponse?.submitted || false;

  // Initialize answers, parsing question.answer for multiple choice questions
  const initializeAnswers = useCallback(() => {
    const initial: Record<string, any> = {};
    
    if (!worksheet) return initial;
    
    const questions = worksheet.questions || [];
    
    // First, try to get answers from worksheet responses if available
    if (worksheetResponse && worksheetResponse.responses && worksheetResponse.responses.length > 0) {
      const responses = worksheetResponse.responses || [];
      responses.forEach((response: any) => {
        const question = questions.find(q => q.id === response.questionId);
        if (question && question.type === "MULTIPLE_CHOICE" && typeof response.response === 'string') {
          try {
            // Parse JSON string for multiple choice answers
            const parsed = JSON.parse(response.response);
            initial[response.questionId] = parsed;
          } catch {
            // If parsing fails, use the string as-is
            initial[response.questionId] = response.response;
          }
        } else {
          initial[response.questionId] = response.response;
        }
      });
    }
  
    
    return initial;
  }, [worksheet, worksheetResponse]);

  const [answers, setAnswers] = useState<Record<string, any>>(initializeAnswers());

  // Update answers when worksheet or worksheetResponse changes
  useEffect(() => {
    if (!worksheet) return;
    
    const updatedAnswers = initializeAnswers();
    setAnswers(updatedAnswers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [worksheet?.id, worksheetResponse?.id]);

  // Update readonly state if worksheet is already submitted
  const effectiveReadonly = readonly || isSubmitted;

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "MULTIPLE_CHOICE":
        return <CheckCircle className="h-4 w-4" />;
      case "LONG_ANSWER":
        return <FileText className="h-4 w-4" />;
      case "MATH_EXPRESSION":
        return <Calculator className="h-4 w-4" />;
      case "TRUE_FALSE":
        return <ToggleLeft className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "MULTIPLE_CHOICE":
        return "Multiple Choice";
      case "LONG_ANSWER":
        return "Long Form Answer";
      case "MATH_EXPRESSION":
        return "Math Answer";
      case "TRUE_FALSE":
        return "True/False";
      default:
        return type;
    }
  };

  const handleAnswerChange = useCallback((questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  }, []);

  // Calculate progress
  const answeredCount = Object.keys(answers).filter(key => {
    const answer = answers[key];
    return answer !== undefined && answer !== null && answer !== "";
  }).length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;


  if (isWorksheetResponseLoading || isWorksheetLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <div className="space-y-4">
      {/* Header with progress */}

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((question, index) => {
          const answer = answers[question.id];
          const isAnswered = answer !== undefined && answer !== null && answer !== "";

          return (
            <WorksheetQuestionInput
              key={question.id}
              question={question}
              index={index}
              answer={answer}
              isAnswered={isAnswered}
              effectiveReadonly={effectiveReadonly}
              onAnswerChange={handleAnswerChange}
              getQuestionTypeIcon={getQuestionTypeIcon}
              getQuestionTypeLabel={getQuestionTypeLabel}
              worksheetResponseId={worksheetResponseId}
            />
          );
        })}
      </div>
    </div>
  );
}


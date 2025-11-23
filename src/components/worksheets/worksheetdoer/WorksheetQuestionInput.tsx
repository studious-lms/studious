"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  CheckCircle,
  FileText,
  Calculator,
  ToggleLeft,
  CheckCircle2
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface WorksheetQuestionInputProps {
  question: any;
  index: number;
  answer: any;
  isAnswered: boolean;
  effectiveReadonly: boolean;
  onAnswerChange: (questionId: string, value: any) => void;
  getQuestionTypeIcon: (type: string) => React.ReactNode | null;
  getQuestionTypeLabel: (type: string) => string;
  worksheetResponseId?: string;
}

export function WorksheetQuestionInput({
  question,
  index,
  answer,
  isAnswered,
  effectiveReadonly,
  onAnswerChange,
  getQuestionTypeIcon,
  getQuestionTypeLabel,
  worksheetResponseId,
}: WorksheetQuestionInputProps) {
  const [localAnswer, setLocalAnswer] = useState(answer);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedAnswerRef = useRef<any>(answer);

  // Answer question mutation
  const answerQuestionMutation = trpc.worksheet.answerQuestion.useMutation({
    onSuccess: () => {
      setIsSaving(false);
      lastSavedAnswerRef.current = localAnswer;
    },
    onError: (error: { message: string }) => {
      setIsSaving(false);
      toast.error(`Failed to save answer: ${error.message}`);
    },
  });

  // Sync local answer with prop answer when it changes externally
  useEffect(() => {
    setLocalAnswer(answer);
    lastSavedAnswerRef.current = answer;
  }, [answer]);

  // Debounced auto-save for this specific question
  useEffect(() => {
    if (effectiveReadonly || !worksheetResponseId) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    // Only save if answer has changed
    if (localAnswer === lastSavedAnswerRef.current) {
      return;
    }

    // Set up new debounced save
    saveTimeoutRef.current = setTimeout(() => {
      setIsSaving(true);
      
      const responseValue = typeof localAnswer === 'object' 
        ? JSON.stringify(localAnswer) 
        : String(localAnswer || '');

      answerQuestionMutation.mutate({
        worksheetResponseId,
        questionId: question.id,
        response: responseValue,
      });
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, [localAnswer, effectiveReadonly, worksheetResponseId, question.id, answerQuestionMutation]);

  const handleAnswerChange = useCallback((value: any) => {
    setLocalAnswer(value);
  }, [question.id, onAnswerChange]);

  return (
    <Card key={question.id} className="relative">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {getQuestionTypeIcon(question.type)}
                <span className="ml-1">{getQuestionTypeLabel(question.type)}</span>
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {question.points} {question.points === 1 ? 'point' : 'points'}
              </Badge>
              {question.required && (
                <Badge variant="destructive" className="text-xs">Required</Badge>
              )}
              {isAnswered && (
                <Badge variant="default" className="text-xs bg-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Answered
                </Badge>
              )}
              {!effectiveReadonly && worksheetResponseId && isSaving && (
                <Badge variant="outline" className="text-xs">
                  Saving...
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg">
              Question {index + 1}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-base text-foreground whitespace-pre-wrap">
            {question.question}
          </p>
        </div>

        {/* Multiple Choice */}
        {question.type === "MULTIPLE_CHOICE" && (() => {
          const options = (question.options && question.options.length > 0) ? question.options : [];
          
          return (
            <RadioGroup
              value={localAnswer || ""}
              onValueChange={(value) => handleAnswerChange(value)}
              disabled={effectiveReadonly}
              className="space-y-2"
            >
              {options.map((option: any) => (
                <div
                  key={option.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    localAnswer === option.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-muted/30 hover:bg-muted/50'
                  }`}
                >
                  <RadioGroupItem value={option.id} id={option.id} disabled={effectiveReadonly} />
                  <Label
                    htmlFor={option.id}
                    className="flex-1 cursor-pointer"
                  >
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          );
        })()}

        {/* True/False */}
        {question.type === "TRUE_FALSE" && (
          <div className="flex gap-3">
            <Button
              type="button"
              variant={localAnswer === 'true' || localAnswer === true ? "default" : "outline"}
              className="flex-1"
              onClick={() => !effectiveReadonly && handleAnswerChange(true)}
              disabled={effectiveReadonly}
            >
              True
            </Button>
            <Button
              type="button"
              variant={localAnswer === 'false' || localAnswer === false ? "default" : "outline"}
              className="flex-1"
              onClick={() => !effectiveReadonly && handleAnswerChange(false)}
              disabled={effectiveReadonly}
            >
              False
            </Button>
          </div>
        )}

        {/* Math Expression */}
        {question.type === "MATH_EXPRESSION" && (
          <div className="space-y-1">
            <Input
              value={localAnswer || ""}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Enter your answer (e.g., x = 2, x = 3)"
              disabled={effectiveReadonly}
            />
          </div>
        )}

        {/* Long Form */}
        {question.type === "LONG_ANSWER" && (
          <div className="space-y-1">
            <Textarea
              value={localAnswer || ""}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Enter your answer here..."
              rows={6}
              disabled={effectiveReadonly}
              className="resize-none"
            />
          </div>
        )}

        {/* Markscheme (shown in readonly mode) */}
        {effectiveReadonly && question.markschemeItems && question.markschemeItems.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium mb-3">Markscheme:</p>
            <div className="space-y-1">
              {question.markschemeItems.map((item: any) => (
                <div key={item.id} className="flex items-start gap-2 text-sm">
                  <Badge variant="secondary" className="mt-0.5">
                    {item.points} {item.points === 1 ? 'pt' : 'pts'}
                  </Badge>
                  <span className="text-muted-foreground">{item.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Question, MultipleChoiceOption } from "./WorksheetBlockEditor";

interface WorksheetQuestionEditorInputProps {
  question: Question;
  onUpdate: (updates: Partial<Question>) => void;
  onAddOption: () => void;
  onRemoveOption: (optionId: string) => void;
  onUpdateOption: (optionId: string, updates: Partial<MultipleChoiceOption>) => void;
  onToggleCorrectAnswer: (optionId: string) => void;
}

export function WorksheetQuestionEditorInput({
  question,
  onUpdate,
  onAddOption,
  onRemoveOption,
  onUpdateOption,
  onToggleCorrectAnswer,
}: WorksheetQuestionEditorInputProps) {
  const t = useTranslations('worksheets');

  return (
    <>
      {/* Multiple Choice Options */}
      {question.type === "MULTIPLE_CHOICE" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              Answer Options <span className="text-destructive">*</span>
            </Label>
            <Button
              variant="outline"
              size="sm"
              onClick={onAddOption}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          </div>
          <RadioGroup
            value={question.options?.find(opt => opt.isCorrect)?.id || ""}
            onValueChange={onToggleCorrectAnswer}
            className="space-y-2"
          >
            {question.options?.map((option, optIndex) => (
              <div key={option.id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                <RadioGroupItem value={option.id} id={option.id} className="mt-0.5" />
                <Input
                  value={option.text}
                  onChange={(e) => onUpdateOption(option.id, { text: e.target.value })}
                  placeholder={t('create.questions.optionPlaceholder', { number: optIndex + 1 })}
                  className="flex-1 border-0 bg-background"
                />
                {question.options && question.options.length > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveOption(option.id)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      {/* True/False */}
      {question.type === "TRUE_FALSE" && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Correct Answer <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-3">
            <Button
              variant={question.answer === "true" ? "default" : "outline"}
              className="flex-1"
              onClick={() => onUpdate({ answer: "true" })}
            >
              {t('create.questions.true')}
            </Button>
            <Button
              variant={question.answer === "false" ? "default" : "outline"}
              className="flex-1"
              onClick={() => onUpdate({ answer: "false" })}
            >
              {t('create.questions.false')}
            </Button>
          </div>
        </div>
      )}

      {/* Math Expression */}
      {question.type === "MATH_EXPRESSION" && (
        <div className="space-y-1">
          <Label className="text-sm font-medium">
            Expected Math Expression
          </Label>
          <Input
            value={question.answer || ""}
            onChange={(e) => onUpdate({ answer: e.target.value })}
            placeholder={t('create.questions.mathExpressionPlaceholder')}
          />
        </div>
      )}

      {/* Long Form */}
      {question.type === "LONG_ANSWER" && (
        <div className="space-y-1">
          <Label className="text-sm font-medium">
            Sample Answer (Optional)
          </Label>
          <Textarea
            value={question.answer || ""}
            onChange={(e) => onUpdate({ answer: e.target.value })}
            placeholder={t('create.questions.sampleAnswerPlaceholder')}
            rows={4}
          />
        </div>
      )}
    </>
  );
}


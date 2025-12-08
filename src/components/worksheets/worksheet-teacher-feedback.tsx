"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  CheckCircle2,
  Save
} from "lucide-react";

interface TeacherFeedbackProps {
  question: any;
  questionFeedback: {
    responseId: string;
    isCorrect: boolean | null;
    feedback: string;
    points: number | null;
    markschemeState: any;
  } | undefined;
  worksheetResponse: any;
  onFeedbackChange: (questionId: string, field: 'isCorrect' | 'feedback' | 'points' | 'markschemeState', value: any) => void;
  onSave: (questionId: string) => void;
  isSaving: boolean;
}

export function WorksheetTeacherFeedback({
  question,
  questionFeedback,
  worksheetResponse,
  onFeedbackChange,
  onSave,
  isSaving
}: TeacherFeedbackProps) {
  const handleMarkschemeItemToggle = (itemId: string, itemIndex: number) => {
    const currentState = questionFeedback?.markschemeState || {};
    const key = itemId || `item-${itemIndex}`;
    const newState = {
      ...currentState,
      [key]: !currentState[key],
    };
    onFeedbackChange(question.id, 'markschemeState', newState);
  };

  const handleCorrectChange = (checked: boolean) => {
    // Single checkbox: checked = correct (true), unchecked = not correct (null)
    onFeedbackChange(question.id, 'isCorrect', checked ? true : null);
  };

  // Markscheme Editor (if markscheme exists)
  if (question.markScheme && question.markScheme.length > 0) {
    return (
      <div className="space-y-4">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Mark Achieved Items:</Label>
          {question.markScheme.map((item: any, itemIndex: number) => {
            console.log(item);
            const itemId = item.id;
            const key = `item-${itemId}`;
            const isChecked = questionFeedback?.markschemeState?.[key] || false;
            return (
              <div
                key={itemId || itemIndex}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  isChecked
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-background'
                }`}
              >
                <Checkbox
                  id={`markscheme-${question.id}-${itemId}`}
                  checked={isChecked}
                  onCheckedChange={() => handleMarkschemeItemToggle(itemId, itemIndex)}
                />
                <Label
                  htmlFor={`markscheme-${question.id}-${itemId}`}
                  className="flex-1 cursor-pointer space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {item.points || 0} {(item.points || 0) === 1 ? 'pt' : 'pts'}
                    </Badge>
                    <span className="text-sm font-medium">
                      {item.description || item.text || `Item ${itemIndex + 1}`}
                    </span>
                  </div>
                </Label>
              </div>
            );
          })}
        </div>

        {/* Total Points Display */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Points:</span>
            <span className="text-lg font-bold">
              {questionFeedback?.points ?? 0} / {question.markScheme.reduce((sum: number, item: any) => sum + (item.points || 0), 0)}
            </span>
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={() => onSave(question.id)}
          disabled={isSaving}
          size="sm"
          variant="default"
          className="w-full"
        >
          {isSaving ? (
            <>
              <Save className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Markscheme Feedback
            </>
          )}
        </Button>
      </div>
    );
  }

  // Regular Feedback Form (no markscheme)
  return (
    <div className="space-y-4">
      {/* Correct Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`correct-${question.id}`}
          checked={questionFeedback?.isCorrect === true}
          onCheckedChange={handleCorrectChange}
        />
        <Label htmlFor={`correct-${question.id}`}>
          Mark as correct
        </Label>
      </div>

      {/* Points Input */}
      <div className="space-y-2">
        <Label htmlFor={`points-${question.id}`} className="text-sm font-medium">
          Points Awarded (out of {question.points || 0})
        </Label>
        <Input
          id={`points-${question.id}`}
          type="number"
          min="0"
          max={question.points || 0}
          value={questionFeedback?.points ?? ''}
          onChange={(e) => {
            const value = e.target.value === '' ? null : parseFloat(e.target.value);
            onFeedbackChange(question.id, 'points', value);
          }}
          placeholder={`0-${question.points || 0}`}
          className="max-w-32"
        />
      </div>

      {/* Save Button */}
      <Button
        onClick={() => onSave(question.id)}
        disabled={isSaving}
        size="sm"
        variant="default"
      >
        {isSaving ? (
          <>
            <Save className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Save Feedback
          </>
        )}
      </Button>
    </div>
  );
}


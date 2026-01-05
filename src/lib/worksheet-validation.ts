import type { Question, MultipleChoiceOption } from "@/components/worksheets/worksheeteditor/WorksheetBlockEditor";

export interface QuestionValidationError {
  type: 'missing_text' | 'insufficient_options' | 'no_correct_answer';
  message: string;
}

export interface QuestionValidationResult {
  isValid: boolean;
  errors: QuestionValidationError[];
}

/**
 * Validates a worksheet question and returns validation result
 * @param question - The question to validate
 * @returns Validation result with isValid flag and array of errors
 */
export function validateQuestion(question: Question): QuestionValidationResult {
  const errors: QuestionValidationError[] = [];

  // Check if question text is provided
  if (!question.question?.trim()) {
    errors.push({
      type: 'missing_text',
      message: 'Question text is required'
    });
  }

  // Validate multiple choice questions
  if (question.type === "MULTIPLE_CHOICE") {
    if (!question.options || question.options.length < 2) {
      errors.push({
        type: 'insufficient_options',
        message: 'Multiple choice questions need at least 2 options'
      });
    }
    if (question.options && !question.options.some((opt: MultipleChoiceOption) => opt.isCorrect)) {
      errors.push({
        type: 'no_correct_answer',
        message: 'Multiple choice questions need a correct answer'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

interface AnswerableQuestion {
  id?: string;
  type?: string | null;
  question?: string | null;
  options?: { id: string; text: string; isCorrect: boolean }[] | null;
}

/**
 * Validates a question from backend format (used in viewer/doer)
 * @param question - The question from the backend
 * @returns Whether the question is valid for answering
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isQuestionAnswerable(question: AnswerableQuestion | any): boolean {
  // Check if question text is provided
  if (!question.question?.trim()) {
    return false;
  }

  // Validate multiple choice questions
  if (question.type === "MULTIPLE_CHOICE") {
    if (!question.options || question.options.length < 2) {
      return false;
    }
    if (!question.options.some((opt: { isCorrect: boolean }) => opt.isCorrect)) {
      return false;
    }
  }

  return true;
}


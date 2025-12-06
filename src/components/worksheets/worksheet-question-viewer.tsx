"use client";

import { useState, useEffect, useCallback } from "react";
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
    CheckCircle2,
    XCircle,
    Send,
    Loader2,
    MessageCircle
} from "lucide-react";
import { RouterOutputs, trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { WorksheetTeacherFeedback } from "./worksheet-teacher-feedback";
import Comment from "../comments/Comment";
import { EmptyState } from "../ui/empty-state";

interface WorksheetQuestionViewerProps {
    question: any;
    index: number;
    answer: any;
    showAnswers: boolean;
    showFeedback?: boolean;
    isTeacher: boolean;
    submissionId?: string;
    worksheetResponse?: RouterOutputs['worksheet']['getWorksheetSubmission'];
    worksheetId: string;
    onChangeComment: (comment: string) => void;
}


type FeedbackState = {
    responseId: string;
    isCorrect: boolean | null;
    feedback: string;
    points: number | null;
    markschemeState: any;
};

export function WorksheetQuestionViewer({
    question,
    index,
    answer,
    showAnswers,
    showFeedback = false,
    isTeacher,
    submissionId,
    worksheetResponse,
    worksheetId,
    onChangeComment
}: WorksheetQuestionViewerProps) {
    // Initialize feedback state from worksheetResponse
    const [isActive, setIsActive] = useState(false);
    const [isAddingComment, setIsAddingComment] = useState(false);
    const addCommentMutation = trpc.worksheet.addComment.useMutation({
        onSuccess: () => {
            toast.success("Comment added");
            onChangeComment(newComment);
            setNewComment("");
            setIsAddingComment(false);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to add comment");
        },
    });

    const initializeFeedback = useCallback((): FeedbackState => {
        const response = worksheetResponse?.responses.find((r) => r.questionId === question.id); 

        if (!response) {
            return {
                responseId: '',
                isCorrect: null,
                feedback: '',
                points: null,
                markschemeState: null,
            };
        }

        let markschemeState = response.markschemeState || null;
        if (markschemeState && typeof markschemeState === 'string') {
            try {
                markschemeState = JSON.parse(markschemeState);
            } catch {
                // If parsing fails, keep as is
            }
        }

        return {
            responseId: response.id,
            isCorrect: response.isCorrect ?? null,
            feedback: response.feedback || '',
            points: response.points || null,
            markschemeState: markschemeState,
        };
    }, [question.id, worksheetResponse]);

    const [feedback, setFeedback] = useState(initializeFeedback);

    useEffect(() => {
        setFeedback(initializeFeedback());
    }, [initializeFeedback]);

    const utils = trpc.useUtils();

    // Grade answer mutation - handles its own saving
    const gradeAnswerMutation = trpc.worksheet.gradeAnswer.useMutation({
        onSuccess: async () => {
            toast.success("Feedback saved successfully!");
            // Invalidate and refetch the worksheet submission
            await utils.worksheet.getWorksheetSubmission.invalidate({
                worksheetId,
                submissionId: submissionId!,
            });
            // Refetch and update local state
            const result = await utils.worksheet.getWorksheetSubmission.fetch({
                worksheetId,
                submissionId: submissionId!,
            });
            if (result) {
                const updatedResponse = result.responses?.find((r: RouterOutputs['worksheet']['getWorksheetSubmission']['responses'][number]) => r.questionId === question.id);
                if (updatedResponse) {
                    const rawMarkschemeState = updatedResponse.markschemeState;
                    let processedMarkschemeState: string | null = null;
                    
                    if (rawMarkschemeState) {
                        if (typeof rawMarkschemeState === 'string') {
                            try {
                                processedMarkschemeState = JSON.parse(rawMarkschemeState);
                            } catch {
                                processedMarkschemeState = rawMarkschemeState;
                            }
                        } else {
                            processedMarkschemeState = rawMarkschemeState.toString();
                        }
                    }
                    
                    setFeedback({
                        responseId: updatedResponse.id,
                        isCorrect: updatedResponse.isCorrect ?? null,
                        feedback: updatedResponse.feedback || '',
                        points: updatedResponse.points ?? null,
                        markschemeState: processedMarkschemeState,
                    });
                }
            }
        },
        onError: (error) => {
            toast.error(`Failed to save feedback: ${error.message}`);
        },
    });

    const handleGradeChange = (field: 'isCorrect' | 'feedback' | 'points' | 'markschemeState', value: boolean | string | Record<string, boolean>) => {
        setFeedback(prev => {
            // If updating markschemeState, also update points automatically
            let updatedPoints = prev.points;
            if (field === 'markschemeState' && value && question.markScheme) {
                const checkedKeys = Array.isArray(value) ? value : Object.keys(value).filter(key => value[key]);
                updatedPoints = question.markScheme
                    .map((item: { id: string; points: number }, index: number) => {
                        const itemKey = item.id || `item-${index}`;
                        return checkedKeys.includes(itemKey) ? (item.points || 0) : 0;
                    })
                    .reduce((sum: number, points: number) => sum + points, 0);
            }

            return {
                ...prev,
                [field]: value,
                ...(field === 'markschemeState' && { points: updatedPoints }),
            };
        });
    };

    const handleSaveFeedback = () => {
        if (worksheetResponse?.id) {
            gradeAnswerMutation.mutate({
                questionId: question.id,
                responseId: feedback?.responseId,
                studentWorksheetResponseId: worksheetResponse.id,
                isCorrect: feedback?.isCorrect ?? false,
                ...(feedback?.feedback && { feedback: feedback.feedback }),
                ...(feedback?.points !== null && feedback?.points !== undefined && { points: feedback.points }),
                ...(feedback?.markschemeState && { markschemeState: feedback.markschemeState }),
            });
        }
    };

    const isAnswerCorrect = (): boolean | null => {
        if (!showAnswers) return null;

        switch (question.type) {
            case "MULTIPLE_CHOICE":
            case "multiple_choice":
                let options = question.options || [];
                if (!options.length && question.answer && typeof question.answer === 'string') {
                    try {
                        const parsed = JSON.parse(question.answer);
                        if (Array.isArray(parsed)) {
                            options = parsed.map((opt: any, index: number) => ({
                                id: `opt-${question.id}-${index}`,
                                text: opt.label || opt.text || '',
                                isCorrect: opt.correct || false,
                            }));
                        }
                    } catch { }
                }
                const correctOption = options.find((opt: any) => opt.isCorrect);
                return correctOption?.id === answer;
            case "TRUE_FALSE":
            case "true_false":
                const correctAnswer = question.answer === "true" || question.correctAnswer === true;
                return correctAnswer === answer;
            case "MATH_EXPRESSION":
            case "math_expression":
                const expected = question.answer || question.mathExpression;
                return expected?.toLowerCase().trim() === answer?.toLowerCase().trim();
            case "LONG_ANSWER":
            case "long_form":
                return null;
            default:
                return null;
        }
    };

    const isCorrect = isAnswerCorrect();

    const getQuestionTypeIcon = (type: string) => {
        switch (type) {
            case "MULTIPLE_CHOICE":
            case "multiple_choice":
                return <CheckCircle className="h-4 w-4" />;
            case "LONG_ANSWER":
            case "long_form":
                return <FileText className="h-4 w-4" />;
            case "MATH_EXPRESSION":
            case "math_expression":
                return <Calculator className="h-4 w-4" />;
            case "TRUE_FALSE":
            case "true_false":
                return <ToggleLeft className="h-4 w-4" />;
            default:
                return null;
        }
    };

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        addCommentMutation.mutate({
            responseId: feedback?.responseId,
            comment: newComment.trim(),
        });
        setIsAddingComment(true);
    };

    const getQuestionTypeLabel = (type: string) => {
        switch (type) {
            case "MULTIPLE_CHOICE":
            case "multiple_choice":
                return "Multiple Choice";
            case "LONG_ANSWER":
            case "long_form":
                return "Long Form Answer";
            case "MATH_EXPRESSION":
            case "math_expression":
                return "Math Answer";
            case "TRUE_FALSE":
            case "true_false":
                return "True/False";
            default:
                return type;
        }
    };

    const comments = worksheetResponse?.responses?.find((r) => r.questionId === question.id)?.comments;


    const [newComment, setNewComment] = useState("");

    return (
        <div className="relative">
            <Card className="relative">
                {showAnswers && isCorrect !== null && (
                    <div className="absolute top-4 right-4">
                        {isCorrect ? (
                            <Badge variant="default" className="bg-green-600">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Correct
                            </Badge>
                        ) : (
                            <Badge variant="destructive">
                                <XCircle className="h-3 w-3 mr-1" />
                                Incorrect
                            </Badge>
                        )}
                    </div>
                )}
                <CardHeader>
                    <div className="flex items-start justify-between gap-4 pr-20">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                    {getQuestionTypeIcon(question.type)}
                                    <span className="ml-1">{getQuestionTypeLabel(question.type)}</span>
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                    {!question.points ? 'No points'
                                        : `${question.points} ${question.points === 1 ? 'point' : 'points'}`}
                                </Badge>
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
                    {(question.type === "MULTIPLE_CHOICE" || question.type === "multiple_choice") && (() => {
                        let options: Array<{ id: string; text: string; isCorrect?: boolean }> = [];
                        if (question.options && question.options.length > 0) {
                            options = question.options;
                        } else if (question.answer && typeof question.answer === 'string') {
                            try {
                                const parsed = JSON.parse(question.answer);
                                if (Array.isArray(parsed)) {
                                    options = parsed.map((opt: any, index: number) => ({
                                        id: `opt-${question.id}-${index}`,
                                        text: opt.label || opt.text || '',
                                        isCorrect: opt.correct || false,
                                    }));
                                }
                            } catch { }
                        }

                        return (
                            <RadioGroup
                                value={answer || ""}
                                disabled={true}
                                className="space-y-2"
                            >
                                {options.map((option) => {
                                    const isSelected = answer === option.id;
                                    const showCorrect = showAnswers && option.isCorrect;
                                    const showIncorrect = showAnswers && isSelected && !option.isCorrect;

                                    return (
                                        <div
                                            key={option.id}
                                            className={`flex items-center gap-3 p-3 rounded-lg border ${showCorrect
                                                    ? 'border-green-500 bg-green-50 dark:bg-green-950'
                                                    : showIncorrect
                                                        ? 'border-red-500 bg-red-50 dark:bg-red-950'
                                                        : 'border-border bg-muted/30'
                                                }`}
                                        >
                                            <RadioGroupItem value={option.id} id={option.id} disabled={true} />
                                            <Label
                                                htmlFor={option.id}
                                                className="flex-1 cursor-pointer"
                                            >
                                                {option.text}
                                            </Label>
                                            {showCorrect && (
                                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                            )}
                                            {showIncorrect && (
                                                <XCircle className="h-5 w-5 text-red-600" />
                                            )}
                                        </div>
                                    );
                                })}
                            </RadioGroup>
                        );
                    })()}

                    {/* True/False */}
                    {(question.type === "TRUE_FALSE" || question.type === "true_false") && (() => {
                        const correctAnswer = question.answer === "true" || question.correctAnswer === true;
                        return (
                            <div className="flex gap-3">
                                <Button
                                    variant={answer === true ? "default" : "outline"}
                                    className={`flex-1 ${showAnswers && correctAnswer === true
                                            ? 'border-green-500 bg-green-50 dark:bg-green-950 hover:bg-green-100 dark:hover:bg-green-900'
                                            : ''
                                        }`}
                                    disabled={true}
                                >
                                    True
                                    {showAnswers && correctAnswer === true && (
                                        <CheckCircle2 className="h-4 w-4 ml-2 text-green-600" />
                                    )}
                                </Button>
                                <Button
                                    variant={answer === false ? "default" : "outline"}
                                    className={`flex-1 ${showAnswers && correctAnswer === false
                                            ? 'border-green-500 bg-green-50 dark:bg-green-950 hover:bg-green-100 dark:hover:bg-green-900'
                                            : ''
                                        }`}
                                    disabled={true}
                                >
                                    False
                                    {showAnswers && correctAnswer === false && (
                                        <CheckCircle2 className="h-4 w-4 ml-2 text-green-600" />
                                    )}
                                </Button>
                            </div>
                        );
                    })()}

                    {/* Math Expression */}
                    {(question.type === "MATH_EXPRESSION" || question.type === "math_expression") && (
                        <div className="space-y-1">
                            <Input
                                value={answer || ""}
                                placeholder="Enter your answer (e.g., x = 2, x = 3)"
                                disabled={true}
                                readOnly={true}
                                className={showAnswers && isCorrect === false ? 'border-red-500' : ''}
                            />
                            {showAnswers && (question.answer || question.mathExpression) && (
                                <p className="text-sm text-muted-foreground">
                                    Expected: {question.answer || question.mathExpression}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Long Form */}
                    {(question.type === "LONG_ANSWER" || question.type === "long_form") && (
                        <div className="space-y-1">
                            <Textarea
                                value={answer || ""}
                                placeholder="Enter your answer here..."
                                rows={6}
                                disabled={true}
                                readOnly={true}
                            />
                            {showAnswers && (question.answer || question.sampleAnswer) && (
                                <div className="mt-4 p-4 rounded-lg bg-muted border">
                                    <p className="text-sm font-medium mb-2">Sample Answer:</p>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {question.answer || question.sampleAnswer}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Markscheme (always shown in viewer) */}
                    {question.markScheme && question.markScheme.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                            <p className="text-sm font-medium mb-3">Markscheme:</p>
                            <div className="space-y-1">
                                {question.markScheme.map((item: any, index: number) => (
                                    <div key={item.id || index} className="flex items-start gap-2 text-sm">
                                        <Badge variant="secondary" className="mt-0.5">
                                            {item.points || 0} {(item.points || 0) === 1 ? 'pt' : 'pts'}
                                        </Badge>
                                        <span className="text-muted-foreground">{item.description || item.text || ''}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Teacher Feedback Section */}
                    {(showFeedback || isTeacher) && submissionId && (
                        <div className="mt-6 pt-6 space-y-4 bg-muted/60 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-semibold">Teacher Feedback</h3>
                                {feedback && feedback.isCorrect !== null && (
                                    <Badge variant="outline" className="text-xs">
                                        {feedback.isCorrect ? (
                                            <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3 mr-1" /> Correct</span>
                                        ) : (
                                            <span className="text-red-600 flex items-center gap-1"><XCircle className="h-3 w-3 mr-1" /> Incorrect</span>
                                        )}
                                    </Badge>
                                )}
                            </div>

                            {isTeacher ? (
                                <WorksheetTeacherFeedback
                                    question={question}
                                    questionFeedback={feedback}
                                    worksheetResponse={worksheetResponse}
                                    onFeedbackChange={(questionId, field, value) => handleGradeChange(field, value)}
                                    onSave={() => handleSaveFeedback()}
                                    isSaving={gradeAnswerMutation.isPending}
                                />
                            ) : (
                                <div className="space-y-3">
                                    {/* Read-only feedback display for students */}
                                    {feedback && (
                                        <>
                                            {feedback.points !== null && feedback.points !== undefined && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium">Points Awarded:</span>
                                                    <span className="text-lg font-bold">
                                                        {feedback.points} / {question.points || 0}
                                                    </span>
                                                </div>
                                            )}
                                            {feedback.feedback && (
                                                <div className="pt-2 border-t">
                                                    <p className="text-sm font-medium mb-2">Feedback:</p>
                                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                        {feedback.feedback}
                                                    </p>
                                                </div>
                                            )}
                                            {question.markScheme && question.markScheme.length > 0 && feedback.markschemeState && (
                                                <div className="pt-2 border-t">
                                                    <p className="text-sm font-medium mb-2">Markscheme Items Achieved:</p>
                                                    <div className="space-y-2">
                                                        {question.markScheme.map((item: any, itemIndex: number) => {
                                                            const itemId = item.id || `item-${itemIndex}`;
                                                            const key = itemId || `item-${itemIndex}`;
                                                            const isChecked = feedback.markschemeState?.[key] || false;
                                                            return isChecked ? (
                                                                <div key={itemId || itemIndex} className="flex items-start gap-2 text-sm">
                                                                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <Badge variant="secondary" className="text-xs">
                                                                                {item.points || 0} {(item.points || 0) === 1 ? 'pt' : 'pts'}
                                                                            </Badge>
                                                                            <span>{item.description || item.text || `Item ${itemIndex + 1}`}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : null;
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    {!feedback || (feedback.points === null && !feedback.feedback && !feedback.markschemeState) && (
                                        <p className="text-sm text-muted-foreground">No feedback provided yet.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
            {(showFeedback || isTeacher) && (<Button variant="outline" onClick={() => setIsActive(!isActive)} className="absolute left-[87%] top-12 z-50">
                <MessageCircle className="h-4 w-4" />
                {comments && comments.length > 0 ? comments.length : 0}
            </Button>)}
            {isActive && (
            <Card className="absolute left-full ml-5 top-0 w-96 z-50">
                <CardHeader>
                    <CardTitle className="text-sm font-semibold">Comments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">

                        <Input type="text" placeholder="Add a comment" value={newComment} onChange={(e) => setNewComment(e.target.value)} className="flex-1" />
                        <Button variant="default" size="icon" onClick={handleAddComment} disabled={isAddingComment}>
                            {isAddingComment ? (
                                <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4 flex-shrink-0" />
                            )}
                        </Button>
                    </div>
                    {comments && comments.length > 0 && comments.map((comment: any) => (
                        <Comment key={comment.id} comment={comment} />
                    ))}
                    {!comments || comments.length === 0 && (
                        <EmptyState
                            icon={MessageCircle}
                            title="No comments yet"
                            description="Be the first to comment!"
                        />
                    )}
                </CardContent>
            </Card>
            )}
        </div>
    );
}


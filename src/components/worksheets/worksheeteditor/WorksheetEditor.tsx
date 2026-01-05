"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useDebounce } from "use-debounce";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { PageLayout } from "@/components/ui/page-layout";
import {
  Plus,
  CheckCircle,
  FileText,
  Calculator,
  ToggleLeft,
  Loader2,
  ArrowLeft,
  Pen,
  Check,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { WorksheetBlockEditor, type Question, type QuestionType, type MultipleChoiceOption } from "./WorksheetBlockEditor";
import { QuestionListItem, DropZone } from "../question-list-item";
import { trpc } from "@/lib/trpc";

interface WorksheetEditorProps {
  worksheetId?: string;
  classId?: string;
  initialTitle?: string;
  initialQuestions?: Question[];
}

const convertQuestion = (q: any, worksheetId: string): Question => {
  const baseQuestion: Question = {
    questionId: q.id,
    type: q.type,
    question: q.question,
    points: 1, // Default, could be stored in backend
    answer: q.answer,
    worksheetId: worksheetId!,
    markScheme: q.markScheme || [],
    order: q.order,
    updated: false,
  };

  // Parse MCQ options from JSON answer
  if (q.type === 'MULTIPLE_CHOICE' && q.options) {
    try {
      if (Array.isArray(q.options)) {
        return {
          ...baseQuestion,
          options: q.options.map((opt: any) => ({
            id: opt.id,
            text: opt.text || '',
            isCorrect: opt.isCorrect || false,
          })),
        };
      }
    } catch (e) {
      // If parsing fails, return empty options
      console.error('Failed to parse MCQ options:', e);
    }
    return {
      ...baseQuestion,
      options: [],
    };
  }

  return baseQuestion as Question;
};

export function WorksheetEditor({ worksheetId: propWorksheetId, classId, initialTitle = "", initialQuestions = [] }: WorksheetEditorProps) {
  const t = useTranslations('worksheets');
  const router = useRouter();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isLoadingTitle, setIsLoadingTitle] = useState(false);
    // Load worksheet data if worksheetId is provided
  const worksheetQuery = propWorksheetId ? trpc.worksheet.getWorksheet.useQuery({
    worksheetId: propWorksheetId,
  }) : null;
  const worksheetData = worksheetQuery?.data ?? null;
  const isLoading = worksheetQuery?.isLoading ?? false;
  const refetchWorksheet = worksheetQuery?.refetch;

  const reorderQuestionsMutation = trpc.worksheet.reorderQuestions.useMutation();
  const deleteQuestionMutation = trpc.worksheet.deleteQuestion.useMutation();

  // Initialize worksheetId first since it's used in other state initializations
  const [worksheetId] = useState<string | null>(propWorksheetId || null);

  // Initialize with worksheet data
  const [title, setTitle] = useState(
    worksheetData?.name || initialTitle
  );

  const [questions, setQuestions] = useState<Question[]>(() => {
    if (worksheetData?.questions && worksheetData.questions.length > 0 && worksheetId) {
      // Convert backend questions to frontend format
      return worksheetData.questions.sort((a: any, b: any) => a.order - b.order).map((q: any) => convertQuestion(q, worksheetId));

    }
    return initialQuestions.length > 0 ? initialQuestions.sort((a, b) => a.order - b.order) : [];
  });
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    questions.length > 0 ? questions[0].questionId : null
  );
  const [originalQuestions, setOriginalQuestions] = useState<Question[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const isInitialMount = useRef(true);
  const isSavingRef = useRef(false);
  const [isSaved, setIsSaved] = useState(true);
  const lastSavedQuestionsRef = useRef<string>('');

  // Update title when worksheet data loads
  useEffect(() => {
    if (worksheetData?.name) {
      setTitle(worksheetData.name);
    }
  }, [worksheetData?.name]);

  useEffect(() => {
    setIsSaved(false);
  }, [questions])

  // Store original questions when they're loaded
  useEffect(() => {
    if (worksheetData?.questions && worksheetData.questions.length > 0 && worksheetId) {
      const convertedQuestions = worksheetData.questions.map((q: any) => convertQuestion(q, worksheetId));
      const sortedQuestions = convertedQuestions.sort((a, b) => a.order - b.order);
      setOriginalQuestions(sortedQuestions);
      // Update last saved reference when data loads
      lastSavedQuestionsRef.current = JSON.stringify(sortedQuestions.map(q => ({
        id: q.questionId,
        question: q.question,
        type: q.type,
        points: q.points,
        answer: q.answer,
        markScheme: q.markScheme,
        options: q.options
      })));
      setIsSaved(true);
    }
  }, [worksheetData, worksheetId]);


  // tRPC mutations
  const addQuestionMutation = trpc.worksheet.addQuestion.useMutation();
  const updateQuestionMutation = trpc.worksheet.updateQuestion.useMutation();
  const updateWorksheetMutation = trpc.worksheet.updateWorksheet.useMutation({
    onSuccess: () => {
      setIsEditingTitle(false);
    },
    onError: () => {
      toast.error(t('toasts.error'));
    },
  });

  const selectedQuestion = questions.find(q => q.questionId === selectedQuestionId) || questions[0] || null;
  const selectedQuestionIndex = selectedQuestion ? questions.findIndex(q => q.questionId === selectedQuestion.questionId) : -1;

  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      questionId: `q-${Date.now()}-${Math.random()}`,
      worksheetId: worksheetId!,
      type,
      question: "",
      points: 1,
      order: questions.length,
      markScheme: [],
      ...(type === "MULTIPLE_CHOICE" && {
        options: [
          { id: `opt-1`, text: "", isCorrect: false },
          { id: `opt-2`, text: "", isCorrect: false },
        ]
      }),
      ...(type === "TRUE_FALSE" && {
        correctAnswer: true
      }),
      updated: false,
    };
    const updatedQuestions = [...questions, newQuestion];
    setQuestions(updatedQuestions);
    setSelectedQuestionId(newQuestion.questionId);
  };

  const removeQuestion = (questionId: string) => {
    const updatedQuestions = questions.filter(q => q.questionId !== questionId);
    setQuestions(updatedQuestions);
    if (selectedQuestionId === questionId) {
      setSelectedQuestionId(updatedQuestions.length > 0 ? updatedQuestions[0].questionId : null);
    }
    deleteQuestionMutation.mutate({
      worksheetId: worksheetId!,
      questionId: questionId,
    });
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => 
      q.questionId === questionId ? { ...q, ...updates, updated: true } : q
    ));
  };

  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.questionId === questionId && q.type === "MULTIPLE_CHOICE") {
        const newOption: MultipleChoiceOption = {
          id: `opt-${Date.now()}`,
          text: "",
          isCorrect: false
        };
        return {
          ...q,
          updated: true,
          options: [...(q.options || []), newOption]
        };
      }
      return q;
    }));
  };

  const removeOption = (questionId: string, optionId: string) => {
    setQuestions(questions.map(q => {
      if (q.questionId === questionId && q.type === "MULTIPLE_CHOICE") {
        return {
          ...q,
          updated: true,
          options: q.options?.filter(opt => opt.id !== optionId) || []
        };
      }
      return q;
    }));
  };

  const updateOption = (questionId: string, optionId: string, updates: Partial<MultipleChoiceOption>) => {
    setQuestions(questions.map(q => {
      if (q.questionId === questionId && q.type === "MULTIPLE_CHOICE") {
        return {
          ...q,
          options: q.options?.map(opt =>
            opt.id === optionId ? { ...opt, ...updates } : opt
          ),
          updated: true,
        };
      }
      return q;
    }));
  };

  const toggleCorrectAnswer = (questionId: string, optionId: string) => {
    setQuestions(questions.map(q => {
      if (q.questionId === questionId && q.type === "MULTIPLE_CHOICE") {
        return {
          ...q,
          options: q.options?.map(opt => ({
            ...opt,
            isCorrect: opt.id === optionId ? !opt.isCorrect : false
          })),
          updated: true,
        };
      }
      return q;
    }));
  };

  const reorderQuestions = (draggedId: string, targetId: string, position: 'before' | 'after') => {
    reorderQuestionsMutation.mutate({
      worksheetId: worksheetId!,
      movedId: draggedId,
      targetId: targetId,
      position: position,
    });
    
    const targetIndex = questions.findIndex(q => q.questionId === targetId);
    const currentIndex = questions.findIndex(q => q.questionId === draggedId);
    if (currentIndex === -1 || currentIndex === targetIndex) return;
    if (targetIndex === -1) return;

    const newQuestions = [...questions];
    const [moved] = newQuestions.splice(currentIndex, 1);
    if (position === 'before') {
      newQuestions.splice(targetIndex - 1, 0, moved);
    } else {
      newQuestions.splice(targetIndex, 0, moved);
    }
    setQuestions(newQuestions);
  };

  const [changedQuestions] = useDebounce(questions, 500);

  // Memoize handleSave to prevent infinite loops
  const handleSaveMemoized = useCallback(async () => {
    // Use ref to check saving state without causing re-renders
    if (isSavingRef.current) return; // Prevent multiple simultaneous saves
    

    if (changedQuestions.length === 0) {
      return;
    }

    // Create a stable hash of questions to compare
    const questionsHash = JSON.stringify(changedQuestions.map(q => ({
      id: q.questionId,
      question: q.question,
      type: q.type,
      points: q.points,
      answer: q.answer,
      markScheme: q.markScheme,
      options: q.options
    })));

    // Skip if nothing actually changed
    if (questionsHash === lastSavedQuestionsRef.current) {
      return;
    }

    isSavingRef.current = true;


    setIsSaving(true);
    try {
      const currentWorksheetId = worksheetId;
      if (!currentWorksheetId) {
        toast.error("Worksheet ID is missing");
        return;
      }

      // Add/update only changed questions
      for (const q of changedQuestions) {
        const answer = q.answer || "";
        const markScheme = q.markScheme;
        const backendType = q.type;
        
        // Check if question has a server ID (starts with "q-" means it's local)
        if (q.questionId.startsWith("q-")) {
          const tempId = q.questionId;
          // New question - add it
          const result = await addQuestionMutation.mutateAsync({
            worksheetId: currentWorksheetId,
            question: q.question!.trim(),
            options: q.options,
            points: q.points,
            answer,
            markScheme,
            type: backendType!,
          });

          setQuestions(questions.map(q => q.questionId === tempId ? { ...q, questionId: result.id } : q));
        } else if (q.updated) {
          await updateQuestionMutation.mutateAsync({
            worksheetId: currentWorksheetId,
            questionId: q.questionId,
            question: q.question!.trim(),
            options: q.options,
            answer,
            points: q.points,
            markScheme,
            type: backendType!,
          });
          setQuestions(questions.map(q => q.questionId === q.questionId ? { ...q, updated: false } : q));
        }
      }

      // Update last saved hash before refetch to prevent race conditions
      lastSavedQuestionsRef.current = questionsHash;

      // Refetch worksheet data to update original questions
      if (propWorksheetId && refetchWorksheet) {
        await refetchWorksheet();
      }
    } catch (error) {
      console.error("Error saving worksheet:", error);
      toast.error(t('toasts.error'));
    } finally {
      setIsSaving(false);
      isSavingRef.current = false;
      console.log('endSaving');
    }
  }, [changedQuestions, worksheetId, addQuestionMutation, updateQuestionMutation, deleteQuestionMutation, propWorksheetId, refetchWorksheet, t]);

  useEffect(() => {
    // Skip auto-save on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // Store initial state as last saved
      if (changedQuestions.length > 0) {
        lastSavedQuestionsRef.current = JSON.stringify(changedQuestions.map(q => ({
          id: q.questionId,
          question: q.question,
          type: q.type,
          points: q.points,
          answer: q.answer,
          markScheme: q.markScheme,
          options: q.options
        })));
      }
      return;
    }

    // Only auto-save if worksheetId exists and we're not already saving
    if (worksheetId && !isSavingRef.current && changedQuestions.length > 0) {
      handleSaveMemoized();
    }
  }, [changedQuestions, worksheetId, handleSaveMemoized]);

  const getQuestionTypeLabel = (type: QuestionType): string => {
    switch (type) {
      case "MULTIPLE_CHOICE":
        return t('create.questionTypes.multipleChoice');
      case "LONG_ANSWER":
        return t('create.questionTypes.longForm');
      case "MATH_EXPRESSION":
        return t('create.questionTypes.math');
      case "TRUE_FALSE":
        return t('create.questionTypes.trueFalse');
      default:
        return type || "Unknown";
    }
  };

  const getQuestionTypeIcon = (type: QuestionType) => {
    switch (type) {
      case "MULTIPLE_CHOICE":
        return <CheckCircle className="h-3.5 w-3.5" />;
      case "LONG_ANSWER":
        return <FileText className="h-3.5 w-3.5" />;
      case "MATH_EXPRESSION":
        return <Calculator className="h-3.5 w-3.5" />;
      case "TRUE_FALSE":
        return <ToggleLeft className="h-3.5 w-3.5" />;
      default:
        return null;
    }
  };

  // Navigate back to worksheets list
  const handleBack = () => {
    if (classId) {
      router.push(`/class/${classId}/worksheets`);
    } else {
      router.back();
    }
  };

  // Show loading state with skeleton
  if (isLoading) {
    return (
      <PageLayout>
        <div className="space-y-6">
          {/* Back button skeleton */}
          <Skeleton className="h-4 w-16" />
          
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>

          {/* Content skeleton */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-1 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-9 w-28" />
              </div>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
            <div className="xl:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-7 w-36" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Back button */}
        <button 
          onClick={handleBack}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Worksheets
        </button>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!isEditingTitle ? (
              <>
                <div>
                  <div className="flex flex-row items-center gap-2">
                    <h1 className="text-2xl font-bold">{title || t('create.fields.titlePlaceholder')}</h1>
                    <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingTitle(true)}
                    className="h-8 w-8 p-0"
                  >
                    <Pen className="h-4 w-4" />
                  </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{questions.length} questions</p>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-80"
                  placeholder="Enter worksheet title..."
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={() => {
                    setIsLoadingTitle(true);
                    updateWorksheetMutation.mutate({
                      worksheetId: worksheetId!,
                      name: title.trim(),
                    });
                  }}
                  variant="ghost"
                  disabled={isLoadingTitle}
                >
                  {isLoadingTitle ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {isSaving ? (
              <Badge variant="secondary" className="gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
              </Badge>
            ) : isSaved ? (
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0 gap-1">
                <CheckCircle className="h-3 w-3" />
                Saved
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-0">
                Unsaved changes
              </Badge>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Sidebar - Question List */}
          <div className="xl:col-span-1">
            {/* <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Questions</h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => addQuestion("MULTIPLE_CHOICE")}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {t('create.questionTypes.multipleChoice')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addQuestion("LONG_ANSWER")}>
                    <FileText className="h-4 w-4 mr-2" />
                    {t('create.questionTypes.longForm')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addQuestion("MATH_EXPRESSION")}>
                    <Calculator className="h-4 w-4 mr-2" />
                    {t('create.questionTypes.math')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addQuestion("TRUE_FALSE")}>
                    <ToggleLeft className="h-4 w-4 mr-2" />
                    {t('create.questionTypes.trueFalse')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div> */}
            
            <DndProvider backend={HTML5Backend}>
              <div className="max-h-[calc(100vh-280px)] overflow-y-auto flex flex-col">
                {questions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium text-foreground mb-1">
                      No questions yet
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add your first question to get started
                    </p>
                  </div>
                ) : (
                  <>
                    {questions.map((question, index) => (
                      <QuestionListItem
                        key={question.questionId}
                        question={question}
                        index={index}
                        isSelected={selectedQuestionId === question.questionId}
                        onSelect={() => setSelectedQuestionId(question.questionId)}
                        onDelete={() => removeQuestion(question.questionId)}
                        onReorder={reorderQuestions}
                        getQuestionTypeIcon={getQuestionTypeIcon}
                        getQuestionTypeLabel={getQuestionTypeLabel}
                        className="mb-2"
                      />
                    ))}
                    <DropZone id={questions[questions.length - 1].questionId} position="after" onReorder={reorderQuestions} />
                  </>
                )}
              </div>
            </DndProvider>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="w-full mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => addQuestion("MULTIPLE_CHOICE")}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {t('create.questionTypes.multipleChoice')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addQuestion("LONG_ANSWER")}>
                    <FileText className="h-4 w-4 mr-2" />
                    {t('create.questionTypes.longForm')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addQuestion("MATH_EXPRESSION")}>
                    <Calculator className="h-4 w-4 mr-2" />
                    {t('create.questionTypes.math')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addQuestion("TRUE_FALSE")}>
                    <ToggleLeft className="h-4 w-4 mr-2" />
                    {t('create.questionTypes.trueFalse')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          </div>

          {/* Main Editor Area */}
          <div className="xl:col-span-2">
            {selectedQuestion ? (
              <WorksheetBlockEditor
                question={selectedQuestion}
                questionIndex={selectedQuestionIndex}
                onUpdate={(updates) => updateQuestion(selectedQuestion.questionId, updates)}
                onAddOption={() => addOption(selectedQuestion.questionId)}
                onRemoveOption={(optionId) => removeOption(selectedQuestion.questionId, optionId)}
                onUpdateOption={(optionId, updates) => updateOption(selectedQuestion.questionId, optionId, updates)}
                onToggleCorrectAnswer={(optionId) => toggleCorrectAnswer(selectedQuestion.questionId, optionId)}
              />
            ) : (
              <Card className="border-2 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <HelpCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    No question selected
                  </h3>
                  <p className="text-muted-foreground max-w-sm">
                    Choose a question from the list to start editing, or create a new one to begin building your worksheet.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

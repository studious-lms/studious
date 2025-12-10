"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Check, 
  Loader2, 
  Calendar, 
  ClipboardList, 
  FileText, 
  FolderPlus, 
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// Types for AI suggested content
export interface AssignmentToCreate {
  id: string;
  title: string;
  instructions: string;
  dueDate: string;
  acceptFiles: boolean;
  acceptExtendedResponse: boolean;
  acceptWorksheet: boolean;
  maxGrade: number;
  gradingBoundaryId?: string;
  markschemeId?: string;
  worksheetIds?: string[];
  studentIds?: string[];
  sectionId?: string;
  type: 'HOMEWORK' | 'QUIZ' | 'TEST' | 'PROJECT' | 'ESSAY' | 'DISCUSSION' | 'PRESENTATION' | 'LAB' | 'OTHER';
  attachments?: { id: string }[];
}

export interface WorksheetToCreate {
  id: string;
  title: string;
  questions: Array<{
    id: string;
    question: string;
    answer: string;
    options: Array<{
      id: string;
      text: string;
      isCorrect: boolean;
    }>;
    markScheme: Array<{
      id: string;
      points: number;
      description: boolean;
    }>;
    points: number;
    order: number;
  }>;
}

export interface SectionToCreate {
  id: string;
  name: string;
  color?: string | null;
}

export interface AISuggestedMeta {
  assignmentsToCreate?: AssignmentToCreate[];
  worksheetsToCreate?: WorksheetToCreate[];
  sectionsToCreate?: SectionToCreate[];
}

// Helper to parse meta from message
export function parseAISuggestedMeta(meta: unknown): AISuggestedMeta {
  try {
    const m = meta as Record<string, unknown>;
    return {
      assignmentsToCreate: Array.isArray(m?.assignmentsToCreate) ? m.assignmentsToCreate : undefined,
      worksheetsToCreate: Array.isArray(m?.worksheetsToCreate) ? m.worksheetsToCreate : undefined,
      sectionsToCreate: Array.isArray(m?.sectionsToCreate) ? m.sectionsToCreate : undefined,
    };
  } catch {
    return {};
  }
}

// Generic collapsible section component
interface SuggestedSectionProps<T> {
  items: T[];
  title: string;
  icon: React.ReactNode;
  colorClass: string;
  createdSet: Set<number>;
  isPending: boolean;
  onCreateItem: (item: T, index: number) => void;
  onCreateAll: () => void;
  renderItem: (item: T, index: number, isCreated: boolean) => React.ReactNode;
}

function SuggestedSection<T>({
  items,
  title,
  icon,
  colorClass,
  createdSet,
  isPending,
  onCreateItem,
  onCreateAll,
  renderItem,
}: SuggestedSectionProps<T>) {
  const [isExpanded, setIsExpanded] = useState(true);
  const allCreated = createdSet.size === items.length;

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className={cn("rounded-lg border overflow-hidden", colorClass)}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-primary/10 transition-colors">
            <div className="flex items-center gap-2">
              {icon}
              <span className="font-medium text-sm">
                {items.length} {title}{items.length !== 1 ? 's' : ''} Suggested
              </span>
              {createdSet.size > 0 && (
                <Badge className="text-xs bg-primary/20 text-primary border-0">
                  {createdSet.size} created
                </Badge>
              )}
            </div>
            <ChevronDown className={cn("h-4 w-4 text-primary transition-transform", isExpanded && "rotate-180")} />
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="border-t border-primary/10">
            {items.map((item, index) => {
              const isCreated = createdSet.has(index);
              return (
                <div 
                  key={index} 
                  className={cn(
                    "p-3 border-b border-primary/10 last:border-b-0",
                    isCreated && "bg-primary/5"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    {renderItem(item, index, isCreated)}
                    
                    {!isCreated && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onCreateItem(item, index)}
                        disabled={isPending}
                        className="shrink-0 border-primary/30 text-primary hover:bg-primary/10"
                      >
                        {isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Create
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Create All Button */}
            {!allCreated && (
              <div className="p-3 bg-primary/5 border-t border-primary/10">
                <Button
                  onClick={onCreateAll}
                  disabled={isPending}
                  className="w-full"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Accept All ({items.length - createdSet.size} remaining)
                    </>
                  )}
                </Button>
              </div>
            )}
            
            {/* All Created Message */}
            {allCreated && (
              <div className="p-3 bg-primary/10 text-center border-t border-primary/10">
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Check className="h-4 w-4" />
                  <span className="text-sm font-medium">All {title.toLowerCase()}s created!</span>
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// Main component
interface AISuggestedContentProps {
  meta: unknown;
  classId: string;
}

export function AISuggestedContent({ meta, classId }: AISuggestedContentProps) {
  const suggestedMeta = parseAISuggestedMeta(meta);
  
  const [createdAssignments, setCreatedAssignments] = useState<Set<number>>(new Set());
  const [createdWorksheets, setCreatedWorksheets] = useState<Set<number>>(new Set());
  const [createdSections, setCreatedSections] = useState<Set<number>>(new Set());
  const [isCheckingExistence, setIsCheckingExistence] = useState(true);

  const utils = trpc.useUtils();

  // Check if items already exist on mount
  useEffect(() => {
    const checkExistence = async () => {
      const { assignmentsToCreate, worksheetsToCreate, sectionsToCreate } = suggestedMeta;
      
      // Check assignments
      if (assignmentsToCreate?.length) {
        const existingIndices = new Set<number>();
        for (let i = 0; i < assignmentsToCreate.length; i++) {
          const assignment = assignmentsToCreate[i];
          if (assignment.id) {
            try {
              const exists = await utils.assignment.exists.fetch({ id: assignment.id, classId });
              if (exists) existingIndices.add(i);
            } catch { /* doesn't exist */ }
          }
        }
        setCreatedAssignments(existingIndices);
      }

      // Check worksheets
      if (worksheetsToCreate?.length) {
        const existingIndices = new Set<number>();
        for (let i = 0; i < worksheetsToCreate.length; i++) {
          const worksheet = worksheetsToCreate[i];
          if (worksheet.id) {
            try {
              const exists = await utils.worksheet.exists.fetch({ id: worksheet.id, classId });
              if (exists) existingIndices.add(i);
            } catch { /* doesn't exist */ }
          }
        }
        setCreatedWorksheets(existingIndices);
      }

      // Check sections
      if (sectionsToCreate?.length) {
        const existingIndices = new Set<number>();
        for (let i = 0; i < sectionsToCreate.length; i++) {
          const section = sectionsToCreate[i];
          if (section.id) {
            try {
              const exists = await utils.section.exists.fetch({ id: section.id, classId });
              console.log(exists)
              if (exists) existingIndices.add(i);
            } catch { /* doesn't exist */ }
          }
        }
        setCreatedSections(existingIndices);
      }

      setIsCheckingExistence(false);
    };

    checkExistence();
  }, [meta, classId, utils]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mutations
  const createAssignmentMutation = trpc.assignment.create.useMutation({
    onSuccess: () => toast.success("Assignment created!"),
    onError: (error) => toast.error("Failed to create assignment: " + error.message),
  });

  const createWorksheetMutation = trpc.worksheet.create.useMutation({
    onError: (error) => toast.error("Failed to create worksheet: " + error.message),
  });

  const addQuestionMutation = trpc.worksheet.addQuestion.useMutation();

  const createSectionMutation = trpc.section.create.useMutation({
    onSuccess: () => toast.success("Section created!"),
    onError: (error) => toast.error("Failed to create section: " + error.message),
  });

  // Handlers
  const handleCreateAssignment = async (assignment: AssignmentToCreate, index: number) => {
    if (!classId) return;
    try {
      await createAssignmentMutation.mutateAsync({
        id: assignment.id,
        classId,
        title: assignment.title,
        instructions: assignment.instructions,
        dueDate: assignment.dueDate,
        acceptFiles: assignment.acceptFiles,
        acceptExtendedResponse: assignment.acceptExtendedResponse,
        acceptWorksheet: assignment.acceptWorksheet,
        maxGrade: assignment.maxGrade,
        gradingBoundaryId: assignment.gradingBoundaryId || undefined,
        markSchemeId: assignment.markschemeId || undefined,
        worksheetIds: assignment.worksheetIds || undefined,
        studentIds: assignment.studentIds || undefined,
        sectionId: assignment.sectionId || undefined,
        type: assignment.type,
      });
      setCreatedAssignments(prev => new Set([...prev, index]));
    } catch { /* handled by mutation */ }
  };

  const handleCreateWorksheet = async (worksheet: WorksheetToCreate, index: number) => {
    if (!classId) return;
    try {
      const newWorksheet = await createWorksheetMutation.mutateAsync({
        // @ts-expect-error - id field types not generated yet
        id: worksheet.id,
        classId,
        name: worksheet.title,
      });
      
      for (const question of worksheet.questions) {
        const hasOptions = question.options && question.options.length > 0;
        await addQuestionMutation.mutateAsync({
          worksheetId: newWorksheet.id,
          question: question.question,
          options: question.options,
          points: question.points,
          answer: question.answer,
          markScheme: question.markScheme,
          type: hasOptions ? 'MULTIPLE_CHOICE' : 'LONG_ANSWER',
        });
      }
      
      toast.success(`Worksheet "${worksheet.title}" created with ${worksheet.questions.length} questions!`);
      setCreatedWorksheets(prev => new Set([...prev, index]));
    } catch { /* handled by mutation */ }
  };

  const handleCreateSection = async (section: SectionToCreate, index: number) => {
    if (!classId) return;
    try {
      await createSectionMutation.mutateAsync({
        id: section.id,
        classId,
        name: section.name,
        color: section.color || '#3b82f6',
      });
      setCreatedSections(prev => new Set([...prev, index]));
    } catch { /* handled by mutation */ }
  };

  const handleCreateAllAssignments = async () => {
    const items = suggestedMeta.assignmentsToCreate || [];
    for (let i = 0; i < items.length; i++) {
      if (!createdAssignments.has(i)) await handleCreateAssignment(items[i], i);
    }
  };

  const handleCreateAllWorksheets = async () => {
    const items = suggestedMeta.worksheetsToCreate || [];
    for (let i = 0; i < items.length; i++) {
      if (!createdWorksheets.has(i)) await handleCreateWorksheet(items[i], i);
    }
  };

  const handleCreateAllSections = async () => {
    const items = suggestedMeta.sectionsToCreate || [];
    for (let i = 0; i < items.length; i++) {
      if (!createdSections.has(i)) await handleCreateSection(items[i], i);
    }
  };

  const { assignmentsToCreate, worksheetsToCreate, sectionsToCreate } = suggestedMeta;
  const hasContent = (assignmentsToCreate?.length || 0) + (worksheetsToCreate?.length || 0) + (sectionsToCreate?.length || 0) > 0;

  if (!hasContent) return null;

  if (isCheckingExistence) {
    return (
      <div className="mt-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 text-primary">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Checking suggested content...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {/* Assignments */}
      {assignmentsToCreate && assignmentsToCreate.length > 0 && (
        <SuggestedSection
          items={assignmentsToCreate}
          title="Assignment"
          icon={<ClipboardList className="h-4 w-4 text-primary" />}
          colorClass="border-primary/20 bg-primary/5"
          createdSet={createdAssignments}
          isPending={createAssignmentMutation.isPending}
          onCreateItem={handleCreateAssignment}
          onCreateAll={handleCreateAllAssignments}
          renderItem={(assignment, _, isCreated) => (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm truncate">{assignment.title}</h4>
                <Badge variant="outline" className="text-xs shrink-0 border-primary/30 text-primary">{assignment.type}</Badge>
                {isCreated && (
                  <Badge className="bg-primary text-primary-foreground text-xs shrink-0">
                    <Check className="h-3 w-3 mr-1" />Created
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{assignment.instructions}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                </div>
                <span>{assignment.maxGrade} pts</span>
              </div>
            </div>
          )}
        />
      )}

      {/* Worksheets */}
      {worksheetsToCreate && worksheetsToCreate.length > 0 && (
        <SuggestedSection
          items={worksheetsToCreate}
          title="Worksheet"
          icon={<FileText className="h-4 w-4 text-primary" />}
          colorClass="border-primary/20 bg-primary/5"
          createdSet={createdWorksheets}
          isPending={createWorksheetMutation.isPending || addQuestionMutation.isPending}
          onCreateItem={handleCreateWorksheet}
          onCreateAll={handleCreateAllWorksheets}
          renderItem={(worksheet, _, isCreated) => (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm truncate">{worksheet.title}</h4>
                {isCreated && (
                  <Badge className="bg-primary text-primary-foreground text-xs shrink-0">
                    <Check className="h-3 w-3 mr-1" />Created
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <HelpCircle className="h-3 w-3" />
                  <span>{worksheet.questions.length} question{worksheet.questions.length !== 1 ? 's' : ''}</span>
                </div>
                <span>{worksheet.questions.reduce((sum, q) => sum + q.points, 0)} total pts</span>
              </div>
            </div>
          )}
        />
      )}

      {/* Sections */}
      {sectionsToCreate && sectionsToCreate.length > 0 && (
        <SuggestedSection
          items={sectionsToCreate}
          title="Section"
          icon={<FolderPlus className="h-4 w-4 text-primary" />}
          colorClass="border-primary/20 bg-primary/5"
          createdSet={createdSections}
          isPending={createSectionMutation.isPending}
          onCreateItem={handleCreateSection}
          onCreateAll={handleCreateAllSections}
          renderItem={(section, _, isCreated) => (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full shrink-0" 
                  style={{ backgroundColor: section.color || '#3b82f6' }}
                />
                <h4 className="font-medium text-sm truncate">{section.name}</h4>
                {isCreated && (
                  <Badge className="bg-primary text-primary-foreground text-xs shrink-0">
                    <Check className="h-3 w-3 mr-1" />Created
                  </Badge>
                )}
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
}


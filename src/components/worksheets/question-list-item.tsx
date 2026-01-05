"use client";

import { useRef, useMemo } from "react";
import { useDrag, useDrop, DropTargetMonitor } from "react-dnd";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trash2,
  MoreVertical,
  GripVertical,
  AlertCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Question, QuestionType } from "./worksheeteditor/WorksheetBlockEditor";
import { validateQuestion } from "@/lib/worksheet-validation";

interface QuestionListItemProps {
  question: Question;
  // id: string;
  className?: string;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onReorder: (draggedId: string, targetId: string, position: 'before' | 'after') => void;
  getQuestionTypeIcon: (type: QuestionType) => React.ReactNode;
  getQuestionTypeLabel: (type: QuestionType) => string;
}

export function DropZone({ id, position, onReorder }: { id: string; position: 'before' | 'after'; onReorder: (draggedId: string, targetId: string, position: 'before' | 'after') => void }) {
  const [{ isOver, draggedItem, canDrop }, drop] = useDrop({
    accept: "question",
    drop: (item: { id: string }, monitor: DropTargetMonitor) => {
      if (monitor.didDrop()) return;
      onReorder(item.id, id, position as 'before' | 'after');
      return { handled: true };
    },
    collect: (monitor: DropTargetMonitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
      draggedItem: monitor.getItem() as { id: string } | null,
    }),
  });

  const isDragging = !!draggedItem;
  const shouldShow = isDragging && canDrop;
  const isActive = isOver && shouldShow;

  // Always render the drop zone with a larger hit area, but only show indicator when dragging
  return (
    <div 
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      className={`transition-all duration-200 relative ${
        isActive 
          ? 'h-10 my-2' 
          : shouldShow
          ? 'h-6 my-1'
          : 'h-0'
      }`}
    >
      <div 
        className={`absolute inset-x-0 top-1/2 -translate-y-1/2 transition-all duration-200 ${
          isActive
            ? 'h-2 bg-primary rounded-full shadow-lg shadow-primary/50 opacity-100'
            : shouldShow
            ? 'h-1 bg-primary/40 rounded-full opacity-70'
            : 'h-0 bg-transparent opacity-0'
        }`}
      />
      {isActive && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-20">
          <div className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full border border-primary/30 backdrop-blur-sm">
            Drop here
          </div>
        </div>
      )}
    </div>
  );
}

export function QuestionListItem({
  question,
  index,
  isSelected,
  onSelect,
  onDelete,
  onReorder,
  getQuestionTypeIcon,
  getQuestionTypeLabel,
  className,
}: QuestionListItemProps) {
  const [{ isDragging }, drag] = useDrag({
    type: "question",
    item: { id: question.questionId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const dragRef = useRef<HTMLDivElement>(null);
  drag(dragRef);

  // Validate the question
  const validation = useMemo(() => validateQuestion(question), [question]);
  const isInvalid = !validation.isValid;

  return (
    <>
      <DropZone id={question.questionId} position="before" onReorder={onReorder} />
      <div
        ref={dragRef}
        className={`p-3 rounded-lg border cursor-pointer transition-all group ${className} ${
          isDragging ? 'opacity-50' : ''
        } ${
          isInvalid
            ? 'border-destructive/40 bg-destructive/5'
            : isSelected
            ? 'border-primary bg-primary/5 shadow-sm'
            : 'border-border hover:border-primary/50 hover:bg-muted/50'
        }`}
        onClick={onSelect}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <GripVertical className="h-4 w-4 text-muted-foreground mt-1 opacity-60 hover:opacity-100 transition-opacity flex-shrink-0 cursor-grab active:cursor-grabbing" />
            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold flex-shrink-0 mt-0.5 ${
              isInvalid 
                ? 'bg-destructive/10 text-destructive' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={`text-xs ${isInvalid ? 'border-destructive/30 text-destructive' : ''}`}>
                  {getQuestionTypeIcon(question.type)}
                  <span className="ml-1">{getQuestionTypeLabel(question.type)}</span>
                </Badge>
                {isInvalid && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 text-destructive">
                          <AlertCircle className="h-3.5 w-3.5" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <div className="space-y-1">
                          <p className="font-medium text-destructive">Draft Question</p>
                          {validation.errors.map((error, i) => (
                            <p key={i} className="text-xs">• {error.message}</p>
                          ))}
                          <p className="text-xs text-muted-foreground mt-1">
                            This question won&apos;t be answerable until fixed.
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <p className={`text-sm font-medium line-clamp-2 ${isInvalid ? 'text-destructive/80' : 'text-foreground'}`}>
                {question.question || `Question ${index + 1}`}
              </p>
              {question.question && (
                <p className="text-xs text-muted-foreground mt-1">
                  {question.points} {question.points === 1 ? 'point' : 'points'}
                </p>
              )}
              {isInvalid && (
                <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Draft - not answerable
                </p>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  );
}


"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { PageLayout } from "@/components/ui/page-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plus, 
  Search, 
  FileText,
  Eye,
  Edit,
  Trash2,
  Clock,
  MoreHorizontal,
  ChevronRight,
  HelpCircle,
  Layers
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RouterOutputs, trpc } from "@/lib/trpc";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type Worksheet = RouterOutputs['worksheet']['listWorksheets'][number];

// Worksheet card component
export default function WorksheetCard({ 
  worksheet, 
  isTeacher, 
  onEdit, 
  onDelete 
}: { 
  worksheet: Worksheet;
  isTeacher: boolean;
  onEdit: () => void;
  onDelete?: () => void;
}) {
  return (
    <div
      onClick={onEdit}
      className="group relative w-full text-left p-5 rounded-xl border bg-card hover:shadow-lg hover:border-primary/30 transition-all duration-200"
    >
      {/* Top row: Icon + Actions */}
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        
        {isTeacher && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              {onDelete && (
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">
        {worksheet.name}
      </h3>

      {/* Metadata */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <HelpCircle className="h-3.5 w-3.5" />
          <span>{worksheet.questionCount} questions</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          <span>{formatDistanceToNow(new Date(worksheet.updatedAt), { addSuffix: true })}</span>
        </div>
      </div>

      {/* Hover indicator */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight className="h-4 w-4 text-primary" />
      </div>
    </div>
  );
}

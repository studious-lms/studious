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
function WorksheetCard({ 
  worksheet, 
  isTeacher, 
  onView, 
  onEdit, 
  onDelete 
}: { 
  worksheet: Worksheet;
  isTeacher: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      onClick={onView}
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
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
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

// Loading skeleton
function WorksheetsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Search skeleton */}
      <Skeleton className="h-10 w-full max-w-sm" />

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="p-5 rounded-xl border bg-card">
            <div className="flex items-start justify-between mb-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <div className="flex gap-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Worksheets() {
  const t = useTranslations('worksheets');
  const { id: classId } = useParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  
  const appState = useSelector((state: RootState) => state.app);
  const isTeacher = appState.user.teacher;

  const { data: worksheetsData, isLoading } = trpc.worksheet.listWorksheets.useQuery({ 
    classId: classId as string 
  });

  // Filter worksheets based on search
  const filteredWorksheets = useMemo(() => {
    return worksheetsData?.filter(worksheet =>
      worksheet.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [worksheetsData, searchQuery]);

  const utils = trpc.useUtils();
  const deleteWorksheetMutation = trpc.worksheet.deleteWorksheet.useMutation({
    onSuccess: () => {
      toast.success(t('toasts.deleted'));
      utils.worksheet.listWorksheets.invalidate({ classId: classId as string });
    },
    onError: () => {
      toast.error(t('toasts.error'));
    },
  });

  const handleDelete = async (worksheetId: string) => {
    if (!confirm(t('confirm.delete'))) {
      return;
    }
    await deleteWorksheetMutation.mutateAsync({ worksheetId });
  };

  if (isLoading) {
    return (
      <PageLayout>
        <WorksheetsSkeleton />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground">{t('subtitle')}</p>
          </div>
          
          {isTeacher && (
            <Button onClick={() => router.push(`/class/${classId}/worksheets/create`)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('actions.create')}
            </Button>
          )}
        </div>

        {/* Search & Count */}
        {worksheetsData && worksheetsData.length > 0 && (
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Layers className="h-4 w-4" />
              <span>{filteredWorksheets?.length || 0} worksheets</span>
            </div>
          </div>
        )}

        {/* Worksheets Grid */}
        {filteredWorksheets && filteredWorksheets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredWorksheets.map((worksheet) => (
              <WorksheetCard
                key={worksheet.id}
                worksheet={worksheet}
                isTeacher={isTeacher}
                onView={() => router.push(`/class/${classId}/worksheets/${worksheet.id}`)}
                onEdit={() => router.push(`/class/${classId}/worksheets/edit/${worksheet.id}`)}
                onDelete={() => handleDelete(worksheet.id)}
              />
            ))}
          </div>
        ) : searchQuery ? (
          <EmptyState
            icon={Search}
            title={t('search.noResults')}
            description={t('search.noResultsDesc')}
          />
        ) : (
          <EmptyState
            icon={FileText}
            title={t('empty.title')}
            description={t('empty.description')}
          />
        )}
      </div>
    </PageLayout>
  );
}


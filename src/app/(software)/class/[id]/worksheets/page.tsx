"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { PageLayout } from "@/components/ui/page-layout";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  FileText,
  Layers
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { toast } from "sonner";
import WorksheetCard from "@/components/WorksheetCard";
import ResponsivePageHeader from "@/components/ResponsiveClassPageHeader";
import { CreateWorksheetModal } from "@/components/modals/CreateWorksheetModal";

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
        <div className="flex items-center flex-wrap gap-y-2 justify-between">
          <ResponsivePageHeader title={t('title')} description={t('subtitle')} />
          
          {isTeacher && (
            <CreateWorksheetModal classId={classId as string} />
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


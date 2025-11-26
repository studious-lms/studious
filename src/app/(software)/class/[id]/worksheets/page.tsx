"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { PageLayout } from "@/components/ui/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DataTable } from "@/components/ui/data-table";
import { 
  Plus, 
  Search, 
  FileText,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock
} from "lucide-react";
import { RouterOutputs, trpc } from "@/lib/trpc";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

type Worksheet = RouterOutputs['worksheet']['listWorksheets'][number];

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
      // Refetch worksheets list
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

  // Worksheet table columns
  const worksheetColumns: ColumnDef<Worksheet>[] = [
    {
      accessorKey: "name",
      header: t('columns.title'),
      cell: ({ row }) => {
        const worksheet = row.original;
        return (
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-medium">{worksheet.name}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "questionCount",
      header: t('columns.questionCount'),
      cell: ({ row }) => {
        const worksheet = row.original;
        return <div className="text-sm text-muted-foreground">{worksheet.questionCount} questions</div>;
      },
    },
    {
      accessorKey: "updatedAt",
      header: t('columns.lastUpdated'),
      cell: ({ row }) => {
        const worksheet = row.original;
        return (
          <div className="text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{new Date(worksheet.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "actions",
      header: t('columns.actions'),
      cell: ({ row }) => {
        const worksheet = row.original;
        return (
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/class/${classId}/worksheets/${worksheet.id}`)}
              className="h-8 px-3 text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              {t('actions.view')}
            </Button>
            {isTeacher && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-xs"
                  onClick={() => router.push(`/class/${classId}/worksheets/edit/${worksheet.id}`)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  {t('actions.edit')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-xs"
                  onClick={() => handleDelete(worksheet.id)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  {t('actions.delete')}
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <PageLayout>
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <Card>
            <CardHeader>
              <div className="h-5 w-40 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-40 w-full bg-muted rounded" />
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-6">
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


          {filteredWorksheets && filteredWorksheets.length > 0 ? (
            <DataTable
              columns={worksheetColumns}
              data={filteredWorksheets || []}
              searchKey="name"
              searchPlaceholder={t('search.placeholder')}
            />
          ) : (
            <EmptyState
              icon={FileText}
              title={t('empty.title')}
              description={t('empty.description')}
            />
          )}
    </PageLayout>
  );
}


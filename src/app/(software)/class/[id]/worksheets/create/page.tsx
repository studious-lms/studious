"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { PageLayout } from "@/components/ui/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { FileText } from "lucide-react";

export default function CreateWorksheet() {
  const t = useTranslations('worksheets');
  const { id: classId } = useParams();
  const router = useRouter();
  const appState = useSelector((state: RootState) => state.app);
  const isTeacher = appState.user.teacher;
  const [worksheetName, setWorksheetName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const createWorksheetMutation = trpc.worksheet.create.useMutation({
    onSuccess: (data) => {
      toast.success(t('create.toasts.created'));
      router.push(`/class/${classId}/worksheets/edit/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || t('toasts.error'));
      setIsCreating(false);
    },
  });

  const handleCreate = async () => {
    if (!worksheetName.trim()) {
      toast.error(t('create.errors.titleRequired'));
      return;
    }

    setIsCreating(true);
    await createWorksheetMutation.mutateAsync({
      classId: classId as string,
      name: worksheetName.trim(),
    });
  };

  if (!isTeacher) {
    return (
      <PageLayout>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">{t('create.errors.teacherOnly')}</p>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-muted-foreground" />
            <div>
              <CardTitle className="text-2xl">{t('create.title')}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{t('create.subtitle')}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="worksheet-name" className="text-base font-medium">
              {t('create.fields.title')}
            </Label>
            <Input
              id="worksheet-name"
              value={worksheetName}
              onChange={(e) => setWorksheetName(e.target.value)}
              placeholder={t('create.fields.titlePlaceholder')}
              className="text-lg"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && worksheetName.trim()) {
                  handleCreate();
                }
              }}
              autoFocus
            />
            <p className="text-sm text-muted-foreground">
              You can add questions after creating the worksheet.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/class/${classId}/worksheets`)}
            >
              {t('actions.cancel')}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!worksheetName.trim() || isCreating}
            >
              {isCreating ? 'Creating...' : t('actions.create')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

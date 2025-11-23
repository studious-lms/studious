"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { PageLayout } from "@/components/ui/page-layout";
import { Card, CardContent } from "@/components/ui/card";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { WorksheetEditor } from "@/components/worksheets/worksheeteditor/WorksheetEditor";
import { trpc } from "@/lib/trpc";

export default function EditWorksheet() {
  const t = useTranslations('worksheets');
  const { id: classId, worksheetId } = useParams();
  const appState = useSelector((state: RootState) => state.app);
  const isTeacher = appState.user.teacher;

  const { data: worksheet, isLoading } = trpc.worksheet.getWorksheet.useQuery({
    worksheetId: worksheetId as string,
  });

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

  if (isLoading) {
    return (
      <PageLayout>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Loading worksheet...</p>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  if (!worksheet) {
    return (
      <PageLayout>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Worksheet not found</p>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <WorksheetEditor worksheetId={worksheetId as string} />
  );
}


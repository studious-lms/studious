"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, FileText } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

interface CreateWorksheetModalProps {
  children?: React.ReactNode;
  classId: string;
  onWorksheetCreated?: (worksheetData: { id: string }) => void;
}

export function CreateWorksheetModal({ children, classId, onWorksheetCreated }: CreateWorksheetModalProps) {
  const t = useTranslations('worksheets');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [worksheetName, setWorksheetName] = useState("");

  const utils = trpc.useUtils();
  const createWorksheetMutation = trpc.worksheet.create.useMutation({
    onSuccess: (data) => {
      toast.success(t('create.toasts.created'));
      utils.worksheet.listWorksheets.invalidate({ classId });
      onWorksheetCreated?.(data);
      setWorksheetName("");
      setOpen(false);
      router.push(`/class/${classId}/worksheets/edit/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || t('toasts.error'));
      setLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!worksheetName.trim()) {
      toast.error(t('create.errors.titleRequired'));
      return;
    }

    setLoading(true);
    await createWorksheetMutation.mutateAsync({
      classId,
      name: worksheetName.trim(),
    });
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t('actions.create')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {t('create.title')}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {t('create.subtitle')}
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="worksheet-name" className="text-sm font-medium">
              {t('create.fields.title')}
            </Label>
            <Input
              id="worksheet-name"
              value={worksheetName}
              onChange={(e) => setWorksheetName(e.target.value)}
              placeholder={t('create.fields.titlePlaceholder')}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              You can add questions after creating the worksheet.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              {t('actions.cancel')}
            </Button>
            <Button type="submit" disabled={!worksheetName.trim() || loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                t('actions.create')
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


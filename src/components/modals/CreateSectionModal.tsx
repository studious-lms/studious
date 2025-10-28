"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Folder, Plus } from "lucide-react";
import { trpc, type RouterOutputs } from "@/lib/trpc";
import ColorPicker from "@/components/ui/color-picker";
import { toast } from "sonner";

type SectionFormData = RouterOutputs['section']['create'] | RouterOutputs['section']['update'];

interface SectionModalProps {
  children?: React.ReactNode;
  classId: string;
  section?: { id: string; name: string; color: string }; // If provided, edit mode
  open?: boolean; // External control
  onOpenChange?: (open: boolean) => void; // External control
  onSectionCreated?: (section: SectionFormData) => void;
  onSectionUpdated?: (section: SectionFormData) => void;
}

export function SectionModal({ 
  children, 
  classId, 
  section, 
  open: externalOpen, 
  onOpenChange: externalOnOpenChange,
  onSectionCreated, 
  onSectionUpdated 
}: SectionModalProps) {
  const t = useTranslations('createSection');
  const [internalOpen, setInternalOpen] = useState(false);
  const [sectionName, setSectionName] = useState(section?.name || "");
  const [sectionColor, setSectionColor] = useState(section?.color || '#3b82f6');

  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;
  const setOpen = isControlled ? (externalOnOpenChange || (() => {})) : setInternalOpen;
  
  const isEditMode = !!section;

  // Auto-populate form when section changes (edit mode)
  useEffect(() => {
    if (section) {
      setSectionName(section.name);
      setSectionColor(section.color);
    } else {
      setSectionName("");
      setSectionColor('#3b82f6');
    }
  }, [section]);
  

  const createSectionMutation = trpc.section.create.useMutation({
    onSuccess: (data) => {
      toast.success(t('created', { name: data.name }));
      onSectionCreated?.(data as SectionFormData);
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || t('errorCreate'));
    }
  });

  const updateSectionMutation = trpc.section.update.useMutation({
    onSuccess: (data) => {
      toast.success(t('updated', { name: data.name }));
      onSectionUpdated?.(data as SectionFormData);
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || t('errorUpdate'));
    }
  });

  const resetForm = () => {
    setSectionName(section?.name || "");
    setSectionColor(section?.color || '#3b82f6');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sectionName.trim()) {
      toast.error(t('errorEmpty'));
      return;
    }

    if (isEditMode) {
      updateSectionMutation.mutate({
        classId,
        id: section.id,
        name: sectionName.trim(),
        color: sectionColor as string
      });
    } else {
      createSectionMutation.mutate({
        classId,
        name: sectionName.trim(),
        color: sectionColor as string
      });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        {!isControlled && (
          <DialogTrigger asChild>
            {children || (
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                {t('buttonLabel')}
              </Button>
            )}
          </DialogTrigger>
        )}
        <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            {isEditMode ? t('titleEdit') : t('titleCreate')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="sectionName">{t('name')}</Label>
            <Input
              id="sectionName"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              placeholder={t('placeholder')}
              autoFocus
              required
            />
            <p className="text-xs text-muted-foreground">
              {t('helper')}
            </p>
          </div>

          <div className="space-y-2">
            <ColorPicker
              value={sectionColor}
              onChange={setSectionColor}
              label={t('color')}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={createSectionMutation.isPending || updateSectionMutation.isPending}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={(createSectionMutation.isPending || updateSectionMutation.isPending) || !sectionName.trim()}
            >
              {(createSectionMutation.isPending || updateSectionMutation.isPending) ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isEditMode ? t('updating') : t('creating')}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  {isEditMode ? t('update') : t('create')}
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Backward compatibility - keep the old name as well
export const CreateSectionModal = SectionModal;

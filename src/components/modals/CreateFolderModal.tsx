"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FolderPlus, Folder, Edit3 } from "lucide-react";
import { toast } from "sonner";
import ColorPicker from "@/components/ui/color-picker";
import { useTranslations } from "next-intl";

interface FolderData {
  id?: string;
  name: string;
  description?: string;
  color?: string;
}

interface CreateFolderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFolderCreated: (folderData: { name: string; description?: string; color?: string }) => void;
  onFolderUpdated?: (folderData: { id: string; name: string; description?: string; color?: string }) => void;
  existingFolder?: FolderData | null;
  isLoading?: boolean;
}

export function CreateFolderModal({
  open,
  onOpenChange,
  onFolderCreated,
  onFolderUpdated,
  existingFolder = null,
  isLoading = false,
}: CreateFolderModalProps) {
  const t = useTranslations('components.createFolder');
  const [formData, setFormData] = useState({
    name: existingFolder?.name || "",
    description: existingFolder?.description || "",
    color: existingFolder?.color || "#3b82f6",
  });

  const isEditing = !!existingFolder;

  // Reset form when modal opens/closes or when existingFolder changes
  useEffect(() => {
    if (open) {
      setFormData({
        name: existingFolder?.name || "",
        description: existingFolder?.description || "",
        color: existingFolder?.color || "#3b82f6",
      });
    } else {
      setFormData({ name: "", description: "", color: "#3b82f6" });
    }
  }, [open, existingFolder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error(t('toasts.errorRequired'));
      return;
    }

    // Validate folder name (basic validation)
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(formData.name)) {
      toast.error(t('toasts.errorInvalidChars'));
      return;
    }

    if (formData.name.length > 255) {
      toast.error(t('toasts.errorTooLong'));
      return;
    }

    try {
      if (isEditing && existingFolder && onFolderUpdated) {
        await onFolderUpdated({
          id: existingFolder.id!,
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          color: formData.color,
        });
      } else {
        await onFolderCreated({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          color: formData.color,
        });
      }

      // Reset form and close modal
      setFormData({ name: "", description: "", color: "#3b82f6" });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save folder:", error);
      // Error handling is done by the parent component
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    setFormData({ name: "", description: "", color: "#3b82f6" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Edit3 className="h-5 w-5" />
                  {t('titleEdit')}
                </>
              ) : (
                <>
                  <FolderPlus className="h-5 w-5" />
                  {t('titleCreate')}
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Folder Name */}
            <div className="space-y-2">
              <Label htmlFor="folder-name">{t('fields.name')}</Label>
              <div className="relative">
                <Folder className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="folder-name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder={t('placeholders.name')}
                  className="pl-10"
                  maxLength={255}
                  required
                  autoFocus
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {t('help.name')}
              </p>
            </div>

            {/* Folder Description */}
            <div className="space-y-2">
              <Label htmlFor="folder-description">{t('fields.description')}</Label>
              <Textarea
                id="folder-description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder={t('placeholders.description')}
                rows={3}
                maxLength={500}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                {t('help.description', { count: formData.description.length })}
              </p>
            </div>

            {/* Folder Color */}
            <div className="space-y-2">
              <ColorPicker
                value={formData.color}
                onChange={(color) => handleInputChange("color", color)}
                label={t('fields.color')}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              {t('actions.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
            >
              {isLoading
                ? isEditing
                  ? t('actions.updating')
                  : t('actions.creating')
                : isEditing
                ? t('actions.update')
                : t('actions.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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

interface FolderData {
  id?: string;
  name: string;
  description?: string;
}

interface CreateFolderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFolderCreated: (folderData: { name: string; description?: string }) => void;
  onFolderUpdated?: (folderData: { id: string; name: string; description?: string }) => void;
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
  const [formData, setFormData] = useState({
    name: existingFolder?.name || "",
    description: existingFolder?.description || "",
  });

  const isEditing = !!existingFolder;

  // Reset form when modal opens/closes or when existingFolder changes
  useEffect(() => {
    if (open) {
      setFormData({
        name: existingFolder?.name || "",
        description: existingFolder?.description || "",
      });
    } else {
      setFormData({ name: "", description: "" });
    }
  }, [open, existingFolder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Folder name is required");
      return;
    }

    // Validate folder name (basic validation)
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(formData.name)) {
      toast.error("Folder name contains invalid characters");
      return;
    }

    if (formData.name.length > 255) {
      toast.error("Folder name is too long (max 255 characters)");
      return;
    }

    try {
      if (isEditing && existingFolder && onFolderUpdated) {
        await onFolderUpdated({
          id: existingFolder.id!,
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        });
      } else {
        await onFolderCreated({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        });
      }

      // Reset form and close modal
      setFormData({ name: "", description: "" });
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
    setFormData({ name: "", description: "" });
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
                  Edit Folder
                </>
              ) : (
                <>
                  <FolderPlus className="h-5 w-5" />
                  Create New Folder
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Folder Name */}
            <div className="space-y-2">
              <Label htmlFor="folder-name">Folder Name *</Label>
              <div className="relative">
                <Folder className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="folder-name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter folder name"
                  className="pl-10"
                  maxLength={255}
                  required
                  autoFocus
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Choose a descriptive name for your folder
              </p>
            </div>

            {/* Folder Description */}
            <div className="space-y-2">
              <Label htmlFor="folder-description">Description (Optional)</Label>
              <Textarea
                id="folder-description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Add a description for this folder..."
                rows={3}
                maxLength={500}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/500 characters
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
            >
              {isLoading
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                ? "Update Folder"
                : "Create Folder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

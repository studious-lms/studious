"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ColorPicker from "@/components/ui/color-picker";

interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  fileType?: string;
  color?: string;
}

interface RenameModalProps {
  item: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRename: (item: FileItem, newName: string, color?: string) => void;
}

export function RenameModal({ item, isOpen, onClose, onRename }: RenameModalProps) {
  const t = useTranslations('rename');
  const [newName, setNewName] = useState("");
  const [folderColor, setFolderColor] = useState("#3b82f6");

  // Update fields when item changes
  useEffect(() => {
    if (item) {
      // Remove file extension for files to make editing easier
      const nameWithoutExt = item.type === "file" && item.name.includes(".")
        ? item.name.substring(0, item.name.lastIndexOf("."))
        : item.name;
      setNewName(nameWithoutExt);
      setFolderColor(item.color || "#3b82f6");
    }
  }, [item]);

  const handleOpen = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!item) return;

    let finalName = newName.trim() || item.name;
    
    // Add back file extension for files
    if (item.type === "file" && item.name.includes(".")) {
      const extension = item.name.substring(item.name.lastIndexOf("."));
      if (!finalName.endsWith(extension)) {
        finalName += extension;
      }
    }

    onRename(item, finalName, item.type === "folder" ? folderColor : undefined);
    onClose();
  };

  if (!item) return null;

  const fileExtension = item.type === "file" && item.name.includes(".")
    ? item.name.substring(item.name.lastIndexOf("."))
    : "";

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {item.type === "folder" ? t('editFolder') : t('renameFile')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('name')}</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t('placeholder', { type: item.type })}
                  className="flex-1"
                  autoFocus
                />
                {fileExtension && (
                  <span className="text-sm text-muted-foreground font-mono">
                    {fileExtension}
                  </span>
                )}
              </div>
            </div>

            {/* Folder Color - Only show for folders */}
            {item.type === "folder" && (
              <div className="space-y-2">
                <ColorPicker
                  value={folderColor}
                  onChange={setFolderColor}
                  label={t('folderColor')}
                  description={t('folderColorDescription')}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button type="submit">
              {item.type === "folder" ? t('saveChanges') : t('rename')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
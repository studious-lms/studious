"use client";
import { useState } from "react";
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

interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  fileType?: string;
}

interface RenameModalProps {
  item: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRename: (item: FileItem, newName: string) => void;
}

export function RenameModal({ item, isOpen, onClose, onRename }: RenameModalProps) {
  const [newName, setNewName] = useState("");

  const handleOpen = (open: boolean) => {
    if (open && item) {
      // Remove file extension for files to make editing easier
      const nameWithoutExt = item.type === "file" && item.name.includes(".")
        ? item.name.substring(0, item.name.lastIndexOf("."))
        : item.name;
      setNewName(nameWithoutExt);
    } else {
      setNewName("");
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !newName.trim()) return;

    let finalName = newName.trim();
    
    // Add back file extension for files
    if (item.type === "file" && item.name.includes(".")) {
      const extension = item.name.substring(item.name.lastIndexOf("."));
      if (!finalName.endsWith(extension)) {
        finalName += extension;
      }
    }

    onRename(item, finalName);
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
              Rename {item.type === "folder" ? "folder" : "file"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={`Enter ${item.type} name`}
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
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!newName.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
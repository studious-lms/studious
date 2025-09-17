"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Folder, Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface CreateSectionModalProps {
  children?: React.ReactNode;
  classId: string;
  onSectionCreated?: (section: any) => void;
}

export function CreateSectionModal({ children, classId, onSectionCreated }: CreateSectionModalProps) {
  const [open, setOpen] = useState(false);
  const [sectionName, setSectionName] = useState("");
  
  const { toast } = useToast();

  const createSectionMutation = trpc.section.create.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Section "${data.name}" created successfully.`
      });
      onSectionCreated?.(data);
      setOpen(false);
      setSectionName("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create section",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sectionName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a section name.",
        variant: "destructive"
      });
      return;
    }

    createSectionMutation.mutate({
      classId,
      name: sectionName.trim()
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSectionName("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New Section
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Create New Section
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="sectionName">Section Name *</Label>
            <Input
              id="sectionName"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              placeholder="e.g., Term 1, Unit 2, Chapter 5"
              autoFocus
              required
            />
            <p className="text-xs text-muted-foreground">
              Sections help organize assignments into groups or time periods.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={createSectionMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createSectionMutation.isPending || !sectionName.trim()}
            >
              {createSectionMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  Create Section
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

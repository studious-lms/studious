"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ColorPicker from "@/components/ui/color-picker";
import { Plus, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface CreateClassModalProps {
  children?: React.ReactNode;
  onClassCreated?: (classData: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function CreateClassModal({ children, onClassCreated }: CreateClassModalProps) {
  const t = useTranslations('components.createClass');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    section: "",
    subject: "",
    description: "",
    color: "#3b82f6",
    semester: "",
    credits: "",
    meetingTime: "",
    location: ""
  });
  const createClassMutation = trpc.class.create.useMutation();


  console.log(formData);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.section || !formData.subject) {
      toast.error(t('toasts.errorRequired'));
      return;
    }

    try {
      setLoading(true);
      
      // Create class using API
      const newClass = await createClassMutation.mutateAsync({
        name: formData.title,
        section: formData.section,
        subject: formData.subject,
        color: formData.color
      });

      onClassCreated?.(newClass);
      
      toast.success(t('toasts.success', { name: formData.title }));

      // Reset form
      setFormData({
        title: "",
        section: "",
        subject: "",
        description: "",
        color: "#3b82f6",
        semester: "",
        credits: "",
        meetingTime: "",
        location: ""
      });
      setOpen(false);
    } catch (error) {
      console.error("Failed to create class:", error);
      toast.error(t('toasts.errorFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t('buttonLabel')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t('fields.title')}</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={t('placeholders.title')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="section">{t('fields.section')}</Label>
              <Input
                id="section"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                placeholder={t('placeholders.section')}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">{t('fields.subject')}</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder={t('placeholders.subject')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="semester">{t('fields.semester')}</Label>
              <Input
                id="semester"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                placeholder={t('placeholders.semester')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="credits">{t('fields.credits')}</Label>
              <Input
                id="credits"
                type="number"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                placeholder={t('placeholders.credits')}
              />
            </div>
            <div className="space-y-2">
              <ColorPicker
                value={formData.color}
                onChange={(color) => setFormData({ ...formData, color })}
                label="Theme Color"
                description="Choose a color for this class"
                size="sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meetingTime">{t('fields.meetingTime')}</Label>
            <Input
              id="meetingTime"
              value={formData.meetingTime}
              onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })}
              placeholder={t('placeholders.meetingTime')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{t('fields.location')}</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder={t('placeholders.location')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('fields.description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('placeholders.description')}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              {t('actions.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('actions.creating')}
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
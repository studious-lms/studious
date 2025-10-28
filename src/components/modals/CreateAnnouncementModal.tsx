"use client";
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Bell, Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useTranslations } from "next-intl";


interface CreateAnnouncementModalProps {
  children?: React.ReactNode;
  onAnnouncementCreated?: (announcementData: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function CreateAnnouncementModal({ children, onAnnouncementCreated }: CreateAnnouncementModalProps) {
  const t = useTranslations('components.createAnnouncement');
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "normal",
    urgent: false,
    pinned: false,
    notifyEmail: true,
    notifyPush: true,
    scheduledDate: "",
    scheduledTime: "",
    expiryDate: ""
  });
const appState = useSelector((state: RootState) => state.app);
const params = useParams();
const classId = params.id as string;


  const priorities = [
    { label: t('priority.low'), value: "low" },
    { label: t('priority.normal'), value: "normal" },
    { label: t('priority.high'), value: "high" },
    { label: t('priority.urgent'), value: "urgent" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast.error(t('toasts.errorRequired'));
      return;
    }

    const publishDate = formData.scheduledDate && formData.scheduledTime
      ? new Date(`${formData.scheduledDate}T${formData.scheduledTime}`)
      : new Date();

    const newAnnouncement = {
      id: Date.now().toString(),
      title: formData.title,
      content: formData.content,
      priority: formData.priority,
      urgent: formData.urgent || formData.priority === "urgent",
      pinned: formData.pinned,
      publishedAt: publishDate.toISOString(),
      expiresAt: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
      notificationSettings: {
        email: formData.notifyEmail,
        push: formData.notifyPush
      },
      author: "Dr. Smith",
      readCount: 0,
      totalRecipients: 24,
      // Prisma-aligned fields
      remarks: formData.content,
      teacherId: appState.user.id,
      classId: classId ?? undefined
    };

    onAnnouncementCreated?.(newAnnouncement);
    
    toast.success(t('toasts.success'));

    setFormData({
      title: "",
      content: "",
      priority: "normal",
      urgent: false,
      pinned: false,
      notifyEmail: true,
      notifyPush: true,
      scheduledDate: "",
      scheduledTime: "",
      expiryDate: ""
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Bell className="h-4 w-4 mr-2" />
            {t('buttonLabel')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="content">{t('fields.content')}</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder={t('placeholders.content')}
              rows={5}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">{t('fields.priority')}</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">{t('fields.expiryDate')}</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">{t('sections.settings')}</h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>{t('settings.pinned.label')}</Label>
                <p className="text-sm text-muted-foreground">{t('settings.pinned.description')}</p>
              </div>
              <Switch
                checked={formData.pinned}
                onCheckedChange={(checked) => setFormData({ ...formData, pinned: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>{t('settings.urgent.label')}</Label>
                <p className="text-sm text-muted-foreground">{t('settings.urgent.description')}</p>
              </div>
              <Switch
                checked={formData.urgent}
                onCheckedChange={(checked) => setFormData({ ...formData, urgent: checked })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">{t('sections.notifications')}</h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>{t('notifications.email.label')}</Label>
                <p className="text-sm text-muted-foreground">{t('notifications.email.description')}</p>
              </div>
              <Switch
                checked={formData.notifyEmail}
                onCheckedChange={(checked) => setFormData({ ...formData, notifyEmail: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>{t('notifications.push.label')}</Label>
                <p className="text-sm text-muted-foreground">{t('notifications.push.description')}</p>
              </div>
              <Switch
                checked={formData.notifyPush}
                onCheckedChange={(checked) => setFormData({ ...formData, notifyPush: checked })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">{t('sections.schedule')}</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">{t('fields.publishDate')}</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  placeholder={t('placeholders.publishDate')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledTime">{t('fields.publishTime')}</Label>
                <Input
                  id="scheduledTime"
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('actions.cancel')}
            </Button>
            <Button type="submit">
              {formData.scheduledDate ? t('actions.schedule') : t('actions.publishNow')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useTranslations } from "next-intl";

interface EarlyAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EarlyAccessModal({ open, onOpenChange }: EarlyAccessModalProps) {
  const t = useTranslations('components.earlyAccess');
  const [email, setEmail] = useState("");
  const [institutionSize, setInstitutionSize] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createEarlyAccessMutation = trpc.marketing.earlyAccessRequest.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setIsSubmitting(false);
      toast.success(t('toasts.success'));
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call - replace with actual implementation
    createEarlyAccessMutation.mutate({
      email: email,
      institutionSize: institutionSize,
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after a delay to avoid showing reset during close animation
    setTimeout(() => {
      setSubmitted(false);
      setEmail("");
      setInstitutionSize("");
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {!submitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">{t('title')}</DialogTitle>
              <DialogDescription>
                {t('description')}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('fields.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('placeholders.email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="institution-size">{t('fields.institutionSize')}</Label>
                <Select value={institutionSize} onValueChange={setInstitutionSize} required>
                  <SelectTrigger id="institution-size">
                    <SelectValue placeholder={t('placeholders.institutionSize')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-30">{t('sizes.tiny')}</SelectItem>
                    <SelectItem value="31-100">{t('sizes.small')}</SelectItem>
                    <SelectItem value="101-500">{t('sizes.medium')}</SelectItem>
                    <SelectItem value="501-1000">{t('sizes.large')}</SelectItem>
                    <SelectItem value="1001+">{t('sizes.institution')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? t('actions.submitting') : t('actions.submit')}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl mb-2">{t('success.title')}</DialogTitle>
            <DialogDescription className="mb-6">
              {t('success.description', { email })}
            </DialogDescription>
            <Button onClick={handleClose} className="bg-primary hover:bg-primary/90">
              {t('actions.done')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2 } from "lucide-react";
import { RouterOutputs, trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface JoinClassModalProps {
  children?: React.ReactNode;
  onClassJoined?: (classData: RouterOutputs["class"]["join"]) => void;
}

export function JoinClassModal({ children, onClassJoined }: JoinClassModalProps) {
  const t = useTranslations('components.joinClass');
  const [open, setOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const joinClassMutation = trpc.class.join.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteCode.trim()) {
      toast.error(t('toasts.errorEmpty'));
      return;
    }

    try {
      setLoading(true);
      
      // Join class using API
      const joinedClass = await joinClassMutation.mutateAsync({
        classCode: inviteCode.trim()
      });

      onClassJoined?.(joinedClass);
      
      toast.success(t('toasts.success'));

      setInviteCode("");
      setOpen(false);
    } catch (error) {
      console.error("Failed to join class:", error);
      toast.error(t('toasts.errorInvalid'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline">
            <UserPlus className="h-4 w-4 mr-2" />
            {t('buttonLabel')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inviteCode">{t('fields.inviteCode')}</Label>
            <Input
              id="inviteCode"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder={t('placeholders.inviteCode')}
              className="font-mono"
              required
            />
            <p className="text-sm text-muted-foreground">
              {t('help')}
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">{t('howTo.title')}</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• {t('howTo.item1')}</li>
              <li>• {t('howTo.item2')}</li>
              <li>• {t('howTo.item3')}</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              {t('actions.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('actions.joining')}
                </>
              ) : (
                t('actions.join')
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
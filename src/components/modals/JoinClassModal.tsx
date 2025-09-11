"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Loader2 } from "lucide-react";
import { useJoinClass } from "@/lib/api";
import { toast as sonnerToast } from "sonner";

interface JoinClassModalProps {
  children?: React.ReactNode;
  onClassJoined?: (classData: any) => void;
}

export function JoinClassModal({ children, onClassJoined }: JoinClassModalProps) {
  const [open, setOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { joinClass } = useJoinClass();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid invite code.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      // Join class using API
      const joinedClass = await joinClass({
        classCode: inviteCode.trim()
      });

      onClassJoined?.(joinedClass);
      
      sonnerToast.success("Successfully Joined!", {
        description: `You've joined the class successfully.`
      });

      setInviteCode("");
      setOpen(false);
    } catch (error) {
      console.error("Failed to join class:", error);
      sonnerToast.error("Join Failed", {
        description: "Invalid invite code or class not found."
      });
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
            Join Class
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Join a Class</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inviteCode">Class Invite Code</Label>
            <Input
              id="inviteCode"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="e.g., MATH101-2025"
              className="font-mono"
              required
            />
            <p className="text-sm text-muted-foreground">
              Enter the invite code provided by your teacher
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">How to get an invite code:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Ask your teacher for the class invite code</li>
              <li>• Check your email for class enrollment instructions</li>
              <li>• Look for the code on your syllabus or course materials</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                "Join Class"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
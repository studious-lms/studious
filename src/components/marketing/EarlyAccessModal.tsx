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

interface EarlyAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EarlyAccessModal({ open, onOpenChange }: EarlyAccessModalProps) {
  const [email, setEmail] = useState("");
  const [institutionSize, setInstitutionSize] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createEarlyAccessMutation = trpc.marketing.earlyAccessRequest.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setIsSubmitting(false);
      toast.success("Successfully joined the waitlist!");
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
              <DialogTitle className="text-2xl">Request Early Access</DialogTitle>
              <DialogDescription>
                Join the waitlist and be among the first to experience Studious LMS
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="institution-size">Institution Size *</Label>
                <Select value={institutionSize} onValueChange={setInstitutionSize} required>
                  <SelectTrigger id="institution-size">
                    <SelectValue placeholder="Select institution size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-30">1-30 students (Individual Teacher)</SelectItem>
                    <SelectItem value="31-100">31-100 students (Small School)</SelectItem>
                    <SelectItem value="101-500">101-500 students (Medium School)</SelectItem>
                    <SelectItem value="501-1000">501-1,000 students (Large School)</SelectItem>
                    <SelectItem value="1001+">1,001+ students (Institution)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Request Access"}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl mb-2">You're on the list!</DialogTitle>
            <DialogDescription className="mb-6">
              We'll send you an email at <span className="font-medium text-foreground">{email}</span> when we're ready for you.
            </DialogDescription>
            <Button onClick={handleClose} className="bg-primary hover:bg-primary/90">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


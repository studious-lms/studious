"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import useWorksheetSubmission from "@/hooks/useWorksheetSubmission";
import { useParams } from "next/navigation";

interface StatusIndicatorProps {
  status: "CANCELLED" | "PENDING" | "COMPLETED" | "NOT_STARTED" | "FAILED";
  progressId: string;
  worksheetId: string;
  submissionId: string;
  onStatusChange?: () => void;
}

export default function StatusIndicator({ 
  status, 
  progressId,
  worksheetId,
  submissionId,
  onStatusChange 
}: StatusIndicatorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const { classId } = useParams();

  const { handleCancelGrading, handleRegradeQuestion } = useWorksheetSubmission(classId as string, worksheetId, submissionId);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      handleRegradeQuestion(progressId);
      onStatusChange?.();
    } catch {
      toast.error("Failed to generate feedback");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      handleCancelGrading(progressId);
      onStatusChange?.();
    } catch {
      toast.error("Failed to cancel");
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case "PENDING":
        return { label: "AI feedback generating...", icon: <Loader2 className="h-4 w-4 animate-spin" /> };
      case "COMPLETED":
        return { label: "AI feedback generated", icon: <CheckCircle2 className="h-4 w-4 text-green-600" /> };
      case "FAILED":
        return { label: "AI feedback failed", icon: <AlertCircle className="h-4 w-4 text-destructive" /> };
      case "CANCELLED":
        return { label: "AI feedback cancelled", icon: <XCircle className="h-4 w-4" /> };
      case "NOT_STARTED":
      default:
        return { label: "AI feedback", icon: <Sparkles className="h-4 w-4" /> };
    }
  };

  const getButtonConfig = () => {
    switch (status) {
      case "PENDING":
        return { label: "Cancel", icon: <XCircle className="h-3.5 w-3.5" /> };
      case "COMPLETED":
        return { label: "Regenerate", icon: <RefreshCw className="h-3.5 w-3.5" /> };
      case "FAILED":
        return { label: "Retry", icon: <RefreshCw className="h-3.5 w-3.5" /> };
      case "CANCELLED":
      case "NOT_STARTED":
      default:
        return { label: "Generate", icon: <Sparkles className="h-3.5 w-3.5" /> };
    }
  };

  const handleClick = () => {
    if (status === "PENDING") {
      handleCancel();
    } else {
      handleGenerate();
    }
  };

  const isLoading = status === "PENDING" ? isCancelling : isGenerating;
  const statusConfig = getStatusConfig();
  const buttonConfig = getButtonConfig();

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg border bg-card">
      <span className="text-sm text-foreground flex items-center gap-2">
        {statusConfig.icon}
        {statusConfig.label}
      </span>
      <Button 
        variant="secondary"
        size="sm"
        onClick={handleClick}
        disabled={isLoading}
        className="h-8 px-4"
      >
        {isLoading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : buttonConfig.icon}
        <span className="ml-1.5">{buttonConfig.label}</span>
      </Button>
    </div>
  );
}

"use client";

import { FileText, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { RouterOutputs } from "@/lib/trpc";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

type Worksheet = RouterOutputs['assignment']['get']['worksheets'][number];

interface WorksheetAttachmentProps {
    worksheet: Worksheet;
    classId: string;
    submissionId?: string;
    isTeacher?: boolean;
}

export default function WorksheetAttachment({ 
    worksheet, 
    classId,
    submissionId,
    isTeacher: isTeacherProp
}: WorksheetAttachmentProps) {
    const router = useRouter();
    const appState = useSelector((state: RootState) => state.app);
    
    // Use prop if provided, otherwise check from app state
    const isTeacher = isTeacherProp ?? appState.user.teacher;

    const handleClick = () => {
        if (isTeacher && !submissionId) {
            // Teachers navigate to edit page
            router.push(`/class/${classId}/worksheets/edit/${worksheet.id}`);
        } else if (submissionId) {
            // Students navigate to submission page (to complete/submit worksheet)
            router.push(`/class/${classId}/worksheets/${worksheet.id}/submission/${submissionId}`);
        }
        // If student without submissionId, do nothing (they need to submit the assignment first)
    };

    // Disable button if student doesn't have a submission yet
    const isDisabled = !isTeacher && !submissionId;

    return (
        <button
            onClick={handleClick}
            disabled={isDisabled}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <FileText className="h-4 w-4 text-primary" />
            <span className="max-w-[150px] truncate">{worksheet.name}</span>
            {worksheet.questionCount !== undefined && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <HelpCircle className="h-3 w-3" />
                    {worksheet.questionCount}
                </span>
            )}
        </button>
    );
}


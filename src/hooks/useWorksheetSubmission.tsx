import { trpc } from "@/lib/trpc";
import pusher from "@/lib/pusher";
import { useEffect, useState } from "react";

const STATUS_CODES = {
    setFailed: "set-failed",
    setPending: "set-pending",
    setCompleted: "set-completed",
    setCancelled: "set-cancelled",
}

interface WorksheetSubmissionSetterEvent {
    id: string;
}

interface GeneratingResponsesState {
    id: string;
    state: "CANCELLED" | "PENDING" | "COMPLETED" | "NOT_STARTED" | "FAILED";
}

const useWorksheetSubmission = (classId: string, worksheetId: string, submissionId: string) => {
    const { data: worksheet, refetch: refetchWorksheet, isLoading: isLoadingWorksheet } = trpc.worksheet.getWorksheet.useQuery({
        worksheetId,
    });

    const { data: worksheetResponse, refetch: refetchWorksheetResponse, isLoading: isLoadingWorksheetResponse } = trpc.worksheet.getWorksheetSubmission.useQuery({
        worksheetId,
        submissionId: submissionId,
    });

    const cancelGradingMutation = trpc.worksheet.cancelGrading.useMutation();
    const regradeQuestionMutation = trpc.worksheet.regradeQuestion.useMutation();

    const [generatingResponsesList, setGeneratingResponsesList] = useState<GeneratingResponsesState[]>([]);


    const handleCancelGrading = (progressId: string) => {
        cancelGradingMutation.mutate({
            worksheetResponseId: worksheetResponse?.id || '',
            progressId: progressId,
        });
    };

    const handleRegradeQuestion = (progressId: string) => {
        regradeQuestionMutation.mutate({
            worksheetResponseId: worksheetResponse?.id || '',
            progressId: progressId,
        });
    };

    useEffect(() => {
        if (worksheetResponse) {
            worksheetResponse.responses.map(response => {
                setGeneratingResponsesList(prev => [...prev, { id: response.id, state: response.status }]);
            });
        }
    }, [worksheetResponse]);


    useEffect(() => {
        const channel = pusher.subscribe(`class-${classId}-worksheetSubmission-${worksheetResponse?.id || ''}`);

        channel.bind(STATUS_CODES.setFailed, (data: WorksheetSubmissionSetterEvent) => {
            setGeneratingResponsesList(prev => prev.map(item => item.id === data.id ? { ...item, state: "FAILED" } : item));
        });

        channel.bind(STATUS_CODES.setPending, (data: WorksheetSubmissionSetterEvent) => {
            console.log("setPending", data);
            setGeneratingResponsesList(prev => prev.map(item => item.id === data.id ? { ...item, state: "PENDING" } : item));
        });

        channel.bind('status-pending', (data: WorksheetSubmissionSetterEvent) => {
            console.log("setPending", data);
            setGeneratingResponsesList(prev => prev.map(item => item.id === data.id ? { ...item, state: "PENDING" } : item));
        });

        channel.bind(STATUS_CODES.setCompleted, (data: WorksheetSubmissionSetterEvent) => {
            setGeneratingResponsesList(prev => prev.map(item => item.id === data.id ? { ...item, state: "COMPLETED" } : item));
            refetchWorksheetResponse();
        });

        channel.bind(STATUS_CODES.setCancelled, (data: WorksheetSubmissionSetterEvent) => {
            setGeneratingResponsesList(prev => prev.map(item => item.id === data.id ? { ...item, state: "CANCELLED" } : item));
        });

        return () => {
            pusher.unsubscribe(`class-${classId}-worksheetSubmission-${worksheetResponse?.id || ''}`);
        };
    }, []);

    return { worksheet, worksheetResponse, generatingResponsesList, refetchWorksheet, refetchWorksheetResponse, isLoading: isLoadingWorksheet || isLoadingWorksheetResponse, handleCancelGrading, handleRegradeQuestion };
};

export default useWorksheetSubmission;
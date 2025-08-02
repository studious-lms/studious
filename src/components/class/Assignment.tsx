import IconFrame from "../ui/IconFrame";
import Button from "../ui/Button";
import { addAlert, setRefetch } from "@/store/appSlice";
import { useDispatch } from "react-redux";
import Badge from "../Badge";
import { HiDocumentText, HiPencil, HiTrash, HiPaperClip, HiAnnotation, HiDocument, HiExternalLink, HiAcademicCap, HiGlobe } from "react-icons/hi";
import { emitAssignmentDelete } from "@/lib/socket";
import { trpc } from "@/utils/trpc";
import { AlertLevel } from "@/lib/alertLevel";
import Card from "../ui/Card";
import { assignmentTypes, formatAssignmentType, getAssignmentIcon } from "@/lib/assignment";
import { useNavigation, ROUTES } from "@/lib/navigation";

interface AssignmentProps {
    title: string;
    date: string | Date;
    isTeacher: boolean;
    classId: string;
    assignmentId: string;
    late?: boolean | null;
    returned?: boolean | null;
    submitted?: boolean | null;
    points?: number;
    type?: string;
    graded?: boolean;
    inProgress?: boolean;
}

export default function Assignment({
    title,
    date,
    isTeacher,
    classId,
    assignmentId,
    late,
    returned,
    submitted,
    points,
    type,
    graded,
    inProgress,
}: AssignmentProps) {
    const dispatch = useDispatch();
    const navigation = useNavigation();

    const { mutate: deleteAssignment } = trpc.assignment.delete.useMutation({
        onSuccess: () => {
            emitAssignmentDelete(classId, assignmentId);
            dispatch(addAlert({ level: AlertLevel.SUCCESS, remark: "Assignment deleted successfully" }));
            dispatch(setRefetch(true));
        },
        onError: (error) => {
            dispatch(addAlert({ level: AlertLevel.ERROR, remark: error.message }));
        }
    });

    const { mutate: publishDraft, isPending: isPublishing } = trpc.class.publishLabDraft.useMutation({
        onSuccess: () => {
            dispatch(addAlert({ level: AlertLevel.SUCCESS, remark: "Draft published successfully" }));
            dispatch(setRefetch(true));
        },
        onError: (error) => {
            dispatch(addAlert({ level: AlertLevel.ERROR, remark: error.message }));
        }
    });

    const handleViewAssignment = () => {
        navigation.push(ROUTES.ASSIGNMENT(classId, assignmentId));
    };

    const handleEditAssignment = () => {
        navigation.push(ROUTES.ASSIGNMENT_EDIT(classId, assignmentId));
    };

    const handlePublishDraft = () => {
        publishDraft({
            classId,
            draftId: assignmentId,
        });
    };

    return (
        <div className={`group relative border rounded-lg p-4 transition-all duration-200 shadow-sm hover:shadow-md ${
            inProgress 
                ? 'bg-amber-50 border-amber-200 hover:border-amber-300' 
                : 'bg-background border-border hover:border-primary-300'
        }`}>
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                        <IconFrame className={`p-2 size-8 rounded-lg ${
                            inProgress 
                                ? 'bg-amber-100 text-amber-600' 
                                : 'bg-primary-50 text-primary-600'
                        }`}>
                            {getAssignmentIcon(type as "HOMEWORK" | "QUIZ" | "TEST" | "PROJECT" | "ESSAY" | "DISCUSSION" | "PRESENTATION" | "LAB" | "OTHER")}
                        </IconFrame>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-foreground text-sm truncate">
                                {title}
                            </h4>
                            <Button.SM
                                onClick={handleViewAssignment}
                            >
                                <HiExternalLink/>
                            </Button.SM>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 text-xs text-foreground-muted mb-2">
                            <Badge variant={inProgress ? "warning" : "primary"}>
                                {formatAssignmentType(type || "OTHER")}
                            </Badge>
                            {inProgress && (
                                <Badge variant="warning">
                                    Draft
                                </Badge>
                            )}
                            {graded && points !== undefined && (
                                <Badge variant="success">
                                    {points} points
                                </Badge>
                            )}
                            {late && (
                                <Badge variant="error">
                                    Late
                                </Badge>
                            )}
                            {submitted && (
                                <Badge variant="primary">
                                    Submitted
                                </Badge>
                            )}
                            {returned && (
                                <Badge variant="foreground">
                                    Returned
                                </Badge>
                            )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-foreground-muted">
                            <div className="flex items-center space-x-1">
                                <HiDocumentText className="w-3 h-3" />
                                <span>Due: {date ? new Date(date).toLocaleDateString() : 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {isTeacher && (
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {inProgress && (
                            <Button.SM
                                onClick={handlePublishDraft}
                                isLoading={isPublishing}
                                className="bg-green-500 hover:bg-green-600 text-white"
                            >
                                <HiGlobe />
                            </Button.SM>
                        )}
                        <Button.SM
                            onClick={handleEditAssignment}
                        >
                            <HiPencil />
                        </Button.SM>
                        <Button.SM
                            onClick={() => deleteAssignment({ classId, id: assignmentId })}
                        >
                            <HiTrash />
                        </Button.SM>
                    </div>
                )}
            </div>
        </div>
    );
}
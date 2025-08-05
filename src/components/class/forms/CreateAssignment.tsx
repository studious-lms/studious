"use client";

import { AlertLevel } from "@/lib/alertLevel";
import { fileToBase64 } from "@/lib/fileToBase64";
import { addAlert, closeModal, openModal, setRefetch } from "@/store/appSlice";
import { useRef, useState } from "react";
import { HiDocument, HiAnnotation, HiPaperClip, HiPencil, HiDocumentText, HiPaperAirplane, HiTrash, HiX } from "react-icons/hi";
import { useDispatch } from "react-redux";
import { v4 } from "uuid";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import FileEdit from "../FileEdit";
import FileSelector from "../../ui/FileSelector";
import { emitAssignmentCreate, emitSectionCreate } from "@/lib/socket";
import { trpc } from "@/utils/trpc";
import type { RouterInputs } from "@/utils/trpc";
import IconFrame from "@/components/ui/IconFrame";
import { assignmentTypes, formatAssignmentType, getAssignmentIcon } from "@/lib/assignment";
import Checkbox from "@/components/ui/Checkbox";
import { validate } from "@/lib/validation";
import { Warning } from "postcss";

type FileData = {
    id: string;
    name: string;
    type: string;
    size: number;
    data: string;
};

type CreateAssignmentInput = Omit<RouterInputs['assignment']['create'], 'files'> & {
    files: FileData[];
};

interface AssignmentData {
    title: string;
    instructions: string;
    dueDate: string;
    sectionId?: string;
    graded: boolean;
    maxGrade: number;
    weight: number;
    type: 'HOMEWORK' | 'QUIZ' | 'TEST' | 'PROJECT' | 'ESSAY' | 'DISCUSSION' | 'PRESENTATION' | 'LAB' | 'OTHER';
    rubric?: {
        criteria: Array<{
            name: string;
            description: string;
            maxPoints: number;
        }>;
    };
    markSchemeId?: string | null;
    gradingBoundaryId?: string | null;
    inProgress: boolean;
    files: Array<{
        id?: string;
        type: string;
        name: string;
        data?: string;
        size: number;
    }>;
    classId: string;
}

export default function CreateAssignment({ classId, sections }: { classId: string, sections: { id: string; name: string; }[] }) {
    const dispatch = useDispatch();
    const REQUIRED_KEYS = ["title", "instructions"];
    const fileInput = useRef<HTMLInputElement>(null);
    const [_sections, _setSections] = useState(sections);
    const [showNewSection, setShowNewSection] = useState(false);
    const [newSectionName, setNewSectionName] = useState('');
    const [assignmentData, setAssignmentData] = useState<AssignmentData>({
        title: '',
        instructions: '',
        dueDate: new Date().toISOString().split('T')[0],
        sectionId: undefined,
        graded: false,
        maxGrade: 100,
        weight: 1,
        type: 'HOMEWORK',
        markSchemeId: null,
        gradingBoundaryId: null,
        inProgress: false,
        files: [],
        classId
    });

    const {mutate: createAssignment, isPending} = trpc.assignment.create.useMutation({
        onSuccess: (data) => {
            emitAssignmentCreate(classId, data);
            dispatch(setRefetch(true));
            dispatch(addAlert({
                level: AlertLevel.SUCCESS,
                remark: 'Assignment created successfully',
            }));
            dispatch(closeModal());
        },
        onError: (error) => {
            dispatch(addAlert({
                level: AlertLevel.ERROR,
                remark: error.message || 'Failed to create assignment',
            }));
        }
    });

    const createSection = trpc.section.create.useMutation({
        onSuccess: (data) => {
            // Emit socket event for real-time update
            emitSectionCreate(classId, data);
            setAssignmentData({
                ...assignmentData,
                sectionId: data.id
            });
            _setSections([
                ..._sections,
                data,
            ])
            setShowNewSection(false);
            setNewSectionName('');
            dispatch(addAlert({
                level: AlertLevel.SUCCESS,
                remark: 'Section created successfully',
            }));
        },
        onError: (error) => {
            dispatch(addAlert({
                level: AlertLevel.ERROR,
                remark: error.message || 'Failed to create section',
            }));
        }
    });

    // Fetch markschemes and grading boundaries
    const { data: markschemes } = trpc.class.listMarkSchemes.useQuery({ classId });
    const { data: gradingBoundaries } = trpc.class.listGradingBoundaries.useQuery({ classId });

    const handleCreateAssignment = async () => {
        // Calculate maxGrade from rubric if attached
        const validated = validate(REQUIRED_KEYS, assignmentData)

        if (!validated.valid) return dispatch(addAlert({
            level: AlertLevel.WARNING,
            remark: validated.remark,
        }));

        let finalMaxGrade = assignmentData.maxGrade;
        if (assignmentData.markSchemeId) {
            // The maxGrade will be calculated from the rubric criteria
            // This will be handled on the server side
            finalMaxGrade = 0; // Placeholder, will be calculated from rubric
        }

        // Separate new files from existing files
        const newFiles = assignmentData.files.filter(file => !file.id);
        const existingFileIds = assignmentData.files.filter(file => file.id).map(file => file.id!);

        const assignmentToCreate = {
            ...assignmentData,
            files: newFiles,
            existingFileIds: existingFileIds.length > 0 ? existingFileIds : undefined,
            maxGrade: finalMaxGrade,
            markSchemeId: assignmentData.markSchemeId === "none" || assignmentData.markSchemeId === null ? undefined : assignmentData.markSchemeId,
            gradingBoundaryId: assignmentData.gradingBoundaryId === "none" || assignmentData.gradingBoundaryId === null ? undefined : assignmentData.gradingBoundaryId
        };

        createAssignment(assignmentToCreate);
    };

    return (
        <div className="w-[50rem] max-w-full mx-auto flex flex-col space-y-5">
        <Input.Text
            label="Title"
            type="text"
            value={assignmentData.title}
            onChange={(e) => setAssignmentData({ ...assignmentData, title: e.target.value })}
            required />
        <div className="flex flex-col md:flex-row sm:space-y-5 md:space-x-5">
            <div className="flex flex-col space-y-4 md:w-2/3">
                <Input.Textarea
                    label="Instructions"
                    value={assignmentData.instructions}
                    onChange={(e) => setAssignmentData({ ...assignmentData, instructions: e.target.value })}
                    required />
            </div>
            <div className="flex flex-col space-y-4 md:w-1/3 shrink-0">
                <div className="flex flex-col space-y-3">
                    <Input.Text
                        label="Due Date"
                        onChange={(e) => setAssignmentData({ ...assignmentData, dueDate: new Date(e.target.value).toISOString() })}
                        value={new Date(assignmentData.dueDate).toISOString().split('T')[0]}
                        type="date" />
                </div>
                <div className="flex flex-col space-y-3">
                    <label className="text-xs font-bold">Section</label>
                    {showNewSection ? (
                        <div className="flex flex-col space-y-2">
                            <Input.Text
                                value={newSectionName}
                                onChange={(e) => setNewSectionName(e.target.value)}
                                placeholder="Enter section name..."
                            />
                            <div className="flex flex-row space-x-2">
                                <Button.Light
                                    onClick={() => {
                                        createSection.mutate({
                                            classId,
                                            name: newSectionName
                                        });
                                    }}
                                >
                                    Add
                                </Button.Light>
                                <Button.Light
                                    onClick={() => {
                                        setShowNewSection(false);
                                        setNewSectionName('');
                                    }}
                                >
                                    Cancel
                                </Button.Light>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col space-y-2">
                            <Input.Select
                                onChange={(e) => setAssignmentData({ ...assignmentData, sectionId: e.target.value === 'none' ? undefined : e.target.value })}
                                value={assignmentData.sectionId || 'none'}
                            >
                                {_sections.map((section) => (
                                    <option key={section.id} value={section.id}>{section.name}</option>
                                ))}
                                <option value="none">No section</option>
                            </Input.Select>
                            <Button.Light
                                onClick={() => setShowNewSection(true)}
                            >
                                + New Section
                            </Button.Light>
                        </div>
                    )}
                </div>
                <div className="flex flex-col space-y-3">
                    <Input.Select
                        label="Assignment Type"
                        value={assignmentData.type}
                        onChange={(e) => setAssignmentData({ ...assignmentData, type: e.target.value as AssignmentData['type'] })}
                    >
                        {assignmentTypes.map(assignmentType => <option key={assignmentType} value={assignmentType}>
                            <IconFrame className="p-1 size-6">{getAssignmentIcon(assignmentType)}</IconFrame>
                            <span>{formatAssignmentType(assignmentType)}</span>
                        </option>)}
                    </Input.Select>

                    <div className="flex flex-col space-y-2">
                        <div className="flex flex-row space-x-2">
                            <label className="text-xs font-bold">Graded</label>
                            <Checkbox checked={assignmentData.graded} onChange={() => setAssignmentData({ ...assignmentData, graded: !assignmentData.graded })} />
                        </div>
                        <div className="flex flex-row space-x-2">
                            <label className="text-xs font-bold">Save as Draft</label>
                            <Checkbox checked={assignmentData.inProgress} onChange={() => setAssignmentData({ ...assignmentData, inProgress: !assignmentData.inProgress })} />
                        </div>
                        {assignmentData.inProgress && (
                            <div className="text-xs text-foreground-secondary">
                                Draft assignments are saved to your Labs page and won't be visible to students until published.
                            </div>
                        )}
                        {assignmentData.graded && (
                            <div className="flex flex-col space-y-3">
                                {/* Grading Tools Section */}
                                <div className="mt-4 space-y-3">
                                    <span className="text-sm font-semibold text-foreground-secondary">Grading Tools</span>
                                    
                                    {/* Markscheme Selection */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-foreground-secondary">Rubric</label>
                                        <Input.Select
                                            value={assignmentData.markSchemeId || 'none'}
                                            onChange={(e) => setAssignmentData({
                                                ...assignmentData,
                                                markSchemeId: e.target.value === 'none' ? null : e.target.value
                                            })}
                                        >
                                            <option value="none">No rubric</option>
                                            {markschemes?.map((markscheme) => {
                                                let name = "Untitled Rubric";
                                                try {
                                                    const parsed = JSON.parse(markscheme.structured);
                                                    name = parsed.name || "Untitled Rubric";
                                                } catch (error) {
                                                    console.error("Error parsing markscheme:", error);
                                                }
                                                return (
                                                    <option key={markscheme.id} value={markscheme.id}>
                                                        {name}
                                                    </option>
                                                );
                                            })}
                                        </Input.Select>
                                    </div>

                                    {/* Grading Boundary Selection */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-foreground-secondary">Grading Boundaries</label>
                                        <Input.Select
                                            value={assignmentData.gradingBoundaryId || 'none'}
                                            onChange={(e) => setAssignmentData({
                                                ...assignmentData,
                                                gradingBoundaryId: e.target.value === 'none' ? null : e.target.value
                                            })}
                                        >
                                            <option value="none">No grading boundaries</option>
                                            {gradingBoundaries?.map((gradingBoundary) => {
                                                let name = "Untitled Grading Boundary";
                                                try {
                                                    const parsed = JSON.parse(gradingBoundary.structured);
                                                    name = parsed.name || "Untitled Grading Boundary";
                                                } catch (error) {
                                                    console.error("Error parsing grading boundary:", error);
                                                }
                                                return (
                                                    <option key={gradingBoundary.id} value={gradingBoundary.id}>
                                                        {name}
                                                    </option>
                                                );
                                            })}
                                        </Input.Select>
                                    </div>
                                </div>

                                {/* Max Score - only show if no rubric is attached */}
                                {!assignmentData.markSchemeId && (
                                    <Input.Text
                                        label="Max score"
                                        onChange={(e) => setAssignmentData({ ...assignmentData, maxGrade: parseInt(e.currentTarget.value) })}
                                        value={assignmentData.maxGrade}
                                        type="number"
                                    />
                                )}
                                
                                {assignmentData.markSchemeId && (
                                    <div className="p-3 bg-background-muted dark:bg-background-subtle rounded-md border border-border-secondary">
                                        <div className="text-sm text-foreground-secondary">
                                            Max score will be calculated from the attached rubric
                                        </div>
                                    </div>
                                )}

                                <Input.Text
                                    type="number"
                                    label="Weight"
                                    onChange={(e) => setAssignmentData({ ...assignmentData, weight: parseInt(e.currentTarget.value) })}
                                    value={assignmentData.weight}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
        <div className="flex flex-col space-y-3">
            <label className="text-sm font-bold">Files</label>
            {assignmentData.files.map((attachment) => (
                <FileEdit
                    key={attachment.id || attachment.name}
                    name={attachment.name}
                    type={attachment.type}
                    src={attachment.data || ''}
                    onDelete={() => setAssignmentData({ ...assignmentData, files: assignmentData.files.filter((f) => f.id !== attachment.id) })}
                />
            ))}
            {!assignmentData.files.length && (
                <div className="p-3 text-sm">No files attached</div>
            )}
            
            <FileSelector
                classId={classId}
                onFilesSelected={(files) => {
                    const newFiles = files.map(file => ({
                        id: file.id,
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: file.data || '',
                    }));
                    setAssignmentData({
                        ...assignmentData,
                        files: newFiles,
                    });
                }}
                selectedFiles={assignmentData.files}
                accept="*/*"
                multiple={true}
                maxSize={50 * 1024 * 1024} // 50MB
                maxFiles={20}
                showPreview={true}
            />

            <div className="flex flex-row items-center justify-end space-x-3 text-sm">
                <Button.Primary type="submit"
                    className="bg-black hover:bg-gray-800 text-white px-3 py-2 rounded-md"
                    onClick={handleCreateAssignment}
                    isLoading={isPending}
                >
                    {isPending ? 'Creating...' : assignmentData.inProgress ? 'Save as Draft' : 'Create Assignment'}
                </Button.Primary>
            </div>
        </div>
    </div>);
}
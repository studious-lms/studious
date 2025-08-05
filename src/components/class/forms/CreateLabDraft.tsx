"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { addAlert, setRefetch } from "@/store/appSlice";
import { AlertLevel } from "@/lib/alertLevel";
import { HiSave, HiX, HiDocumentText, HiClipboardList, HiAcademicCap } from "react-icons/hi";
import { MdAssignment, MdSchool } from "react-icons/md";
import { trpc } from "@/utils/trpc";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textbox from "@/components/ui/Textbox";
import Card from "@/components/ui/Card";

type LabDraftType = 'LAB' | 'HOMEWORK' | 'QUIZ' | 'TEST' | 'PROJECT' | 'ESSAY' | 'DISCUSSION' | 'PRESENTATION' | 'OTHER';

interface CreateLabDraftProps {
    classId: string;
    type: LabDraftType;
    onSuccess: () => void;
}

export default function CreateLabDraft({ classId, type, onSuccess }: CreateLabDraftProps) {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    
    const  createLabDraft = trpc.class.createLabDraft.useMutation();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        content: '',
        objectives: '',
        requirements: '',
        duration: '',
        difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
        tags: [] as string[],
    });

    const getTypeIcon = (type: LabDraftType) => {
        switch (type) {
            case 'LAB':
                return <MdAssignment className="h-5 w-5 text-blue-500" />;
            case 'PROJECT':
                return <MdSchool className="h-5 w-5 text-green-500" />;
            case 'QUIZ':
                return <HiClipboardList className="h-5 w-5 text-orange-500" />;
            case 'HOMEWORK':
                return <HiAcademicCap className="h-5 w-5 text-purple-500" />;
            case 'TEST':
                return <HiDocumentText className="h-5 w-5 text-red-500" />;
            default:
                return <HiDocumentText className="h-5 w-5 text-gray-500" />;
        }
    };

    const getTypeLabel = (type: LabDraftType) => {
        return type.charAt(0).toUpperCase() + type.slice(1);
    };

    const handleSave = async () => {
        if (!formData.title.trim()) {
            dispatch(addAlert({
                level: AlertLevel.ERROR,
                message: 'Please enter a title for your draft.'
            }));
            return;
        }

        if (!formData.content.trim()) {
            dispatch(addAlert({
                level: AlertLevel.ERROR,
                message: 'Please enter instructions for your draft.'
            }));
            return;
        }

        setIsLoading(true);
        try {
            await createLabDraft.mutateAsync({
                classId,
                type,
                title: formData.title,
                instructions: formData.content,
                description: formData.description,
                objectives: formData.objectives,
                requirements: formData.requirements,
                duration: formData.duration,
                difficulty: formData.difficulty,
            });

            dispatch(setRefetch(true));
            dispatch(addAlert({
                level: AlertLevel.SUCCESS,
                message: `${getTypeLabel(type)} draft saved successfully!`
            }));

            onSuccess();
        } catch (error) {
            dispatch(addAlert({
                level: AlertLevel.ERROR,
                message: 'Failed to save draft. Please try again.'
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        // Close modal - this will be handled by the parent component
        onSuccess();
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center space-x-3 mb-6">
                {getTypeIcon(type)}
                <div>
                    <h2 className="text-xl font-semibold text-foreground-primary">
                        Create {getTypeLabel(type)} Draft
                    </h2>
                    <p className="text-sm text-foreground-muted">
                        Draft your {type} content with rich text editing
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="space-y-6">
                {/* Basic Information */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-foreground-primary mb-4">Basic Information</h3>
                    <div className="space-y-4">
                                        <Input.Text
                    label="Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={`Enter ${type.toLowerCase()} title...`}
                    required
                />
                        
                        <Input.Textarea
                            label="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder={`Brief description of the ${type.toLowerCase()}...`}
                            rows={3}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input.Text
                                label="Estimated Duration"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                placeholder="e.g., 2 hours, 1 week"
                            />
                            
                            <Input.Select
                                label="Difficulty Level"
                                value={formData.difficulty}
                                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </Input.Select>
                        </div>
                    </div>
                </Card>

                {/* Learning Objectives */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-foreground-primary mb-4">Learning Objectives</h3>
                    <Input.Textarea
                        value={formData.objectives}
                        onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                        placeholder="What will students learn from this activity? (One objective per line)"
                        rows={4}
                    />
                </Card>

                {/* Requirements */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-foreground-primary mb-4">Requirements & Prerequisites</h3>
                    <Input.Textarea
                        value={formData.requirements}
                        onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                        placeholder="What do students need to know or have before starting this activity?"
                        rows={3}
                    />
                </Card>

                {/* Main Content */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-foreground-primary mb-4">Content</h3>
                    <Textbox
                        content={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e })}
                        placeholder={`Write your ${type.toLowerCase()} instructions here...`}
                        className="min-h-[300px]"
                    />
                </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 pb-4 border-t border-border">
                <Button.Light
                    onClick={handleCancel}
                    disabled={isLoading}
                >
                    <HiX className="w-4 h-4 mr-2" />
                    Cancel
                </Button.Light>
                <Button.Primary
                    onClick={handleSave}
                    isLoading={isLoading}
                >
                    <HiSave className="w-4 h-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save Draft'}
                </Button.Primary>
            </div>
        </div>
    );
} 
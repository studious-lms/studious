"use client";
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { useSession } from "@/hooks/use-session";


interface CreateAssignmentModalProps {
  children?: React.ReactNode;
  onAssignmentCreated?: (assignmentData: any) => void;
}

export function CreateAssignmentModal({ children, onAssignmentCreated }: CreateAssignmentModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    dueDate: "",
    dueTime: "23:59",
    type: "homework",
    points: "100",
    allowLateSubmission: true,
    latePenalty: "10",
    submissionFormat: "online",
    groupWork: false,
    rubricEnabled: false,
    visibleToStudents: true,
    notifyStudents: true
  });
const { toast } = useToast();
const { user } = useSession();
const { classId } = useParams();


  const assignmentTypes = [
    { label: "Homework", value: "homework" },
    { label: "Quiz", value: "quiz" },
    { label: "Exam", value: "exam" },
    { label: "Lab Report", value: "lab_report" },
    { label: "Project", value: "project" },
    { label: "Essay", value: "essay" },
    { label: "Presentation", value: "presentation" },
    { label: "Discussion", value: "discussion" }
  ];

  const submissionFormats = [
    { label: "Online Submission", value: "online" },
    { label: "File Upload", value: "file" },
    { label: "Text Entry", value: "text" },
    { label: "External Tool", value: "external" },
    { label: "No Submission", value: "none" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.dueDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const dueDateTime = new Date(`${formData.dueDate}T${formData.dueTime}`);

    const newAssignment = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      instructions: formData.instructions,
      dueDate: dueDateTime.toISOString(),
      // Prisma-aligned fields
      teacherId: user.id,
      classId: classId!,
      maxGrade: parseInt(formData.points) || 100,
      weight: 1,
      graded: false,
      inProgress: false,
      template: false,
      type: ({
        homework: 'HOMEWORK',
        quiz: 'QUIZ',
        exam: 'TEST',
        lab_report: 'LAB',
        project: 'PROJECT',
        essay: 'ESSAY',
        presentation: 'PRESENTATION',
        discussion: 'DISCUSSION'
      } as Record<string, string>)[formData.type] || 'OTHER',
      // Client-only fields for current UI
      submissionFormat: formData.submissionFormat,
      settings: {
        allowLateSubmission: formData.allowLateSubmission,
        latePenalty: parseInt(formData.latePenalty) || 0,
        groupWork: formData.groupWork,
        rubricEnabled: formData.rubricEnabled,
        visibleToStudents: formData.visibleToStudents
      },
      status: "open",
      createdAt: new Date().toISOString(),
      submissionCount: 0,
      gradedCount: 0
    };

    onAssignmentCreated?.(newAssignment);
    
    toast({
      title: "Assignment Created",
      description: `${formData.title} has been created successfully.`
    });

    if (formData.notifyStudents && formData.visibleToStudents) {
      toast({
        title: "Students Notified",
        description: "Students have been notified about the new assignment."
      });
    }

    setFormData({
      title: "",
      description: "",
      instructions: "",
      dueDate: "",
      dueTime: "23:59",
      type: "homework",
      points: "100",
      allowLateSubmission: true,
      latePenalty: "10",
      submissionFormat: "online",
      groupWork: false,
      rubricEnabled: false,
      visibleToStudents: true,
      notifyStudents: true
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Assignment</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-medium">Basic Information</h4>
            
            <div className="space-y-2">
              <Label htmlFor="title">Assignment Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Chapter 8 Problem Set"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Assignment Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assignmentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="points">Total Points</Label>
                <Input
                  id="points"
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                  placeholder="100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="submissionFormat">Submission Format</Label>
                <Select value={formData.submissionFormat} onValueChange={(value) => setFormData({ ...formData, submissionFormat: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {submissionFormats.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the assignment..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Detailed Instructions</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="Provide detailed instructions for students..."
                rows={5}
              />
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-4">
            <h4 className="font-medium">Due Date & Time</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueTime">Due Time</Label>
                <Input
                  id="dueTime"
                  type="time"
                  value={formData.dueTime}
                  onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h4 className="font-medium">Assignment Settings</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Allow Late Submissions</Label>
                  <p className="text-sm text-muted-foreground">Students can submit after the due date</p>
                </div>
                <Switch
                  checked={formData.allowLateSubmission}
                  onCheckedChange={(checked) => setFormData({ ...formData, allowLateSubmission: checked })}
                />
              </div>

              {formData.allowLateSubmission && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="latePenalty">Late Penalty (% per day)</Label>
                  <Input
                    id="latePenalty"
                    type="number"
                    value={formData.latePenalty}
                    onChange={(e) => setFormData({ ...formData, latePenalty: e.target.value })}
                    placeholder="10"
                    className="w-24"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Group Assignment</Label>
                  <p className="text-sm text-muted-foreground">Allow students to work in groups</p>
                </div>
                <Switch
                  checked={formData.groupWork}
                  onCheckedChange={(checked) => setFormData({ ...formData, groupWork: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enable Rubric</Label>
                  <p className="text-sm text-muted-foreground">Use a rubric for grading</p>
                </div>
                <Switch
                  checked={formData.rubricEnabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, rubricEnabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Visible to Students</Label>
                  <p className="text-sm text-muted-foreground">Students can see this assignment</p>
                </div>
                <Switch
                  checked={formData.visibleToStudents}
                  onCheckedChange={(checked) => setFormData({ ...formData, visibleToStudents: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Notify Students</Label>
                  <p className="text-sm text-muted-foreground">Send notification when published</p>
                </div>
                <Switch
                  checked={formData.notifyStudents}
                  onCheckedChange={(checked) => setFormData({ ...formData, notifyStudents: checked })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="outline">
              Save as Draft
            </Button>
            <Button type="submit">
              Create & Publish
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
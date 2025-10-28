"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MessageSquare } from "lucide-react";

interface AILabModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labType: string;
  classId: string;
  onSubmit?: (data: { title: string; context: any }) => void;
  isLoading?: boolean;
}

export function AILabModal({ open, onOpenChange, labType, classId, onSubmit, isLoading }: AILabModalProps) {
  const router = useRouter();
  const t = useTranslations('aiLab');
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    gradeLevel: "",
    description: "",
    requirements: "",
    duration: ""
  });

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.subject && formData.gradeLevel && onSubmit) {
      // Create AI context object
      const context = {
        subject: formData.subject,
        topic: formData.title,
        difficulty: getDifficultyFromGrade(formData.gradeLevel),
        objectives: formData.requirements ? formData.requirements.split('\n').filter(Boolean) : [],
        persona: getPersonaFromType(labType),
        constraints: getConstraintsFromType(labType),
        metadata: {
          type: labType,
          gradeLevel: formData.gradeLevel,
          description: formData.description,
          duration: formData.duration
        }
      };

      // Call the onSubmit handler
      onSubmit({
        title: formData.title,
        context
      });
      
      // Reset form
      setFormData({
        title: "",
        subject: "",
        gradeLevel: "",
        description: "",
        requirements: "",
        duration: ""
      });
    }
  };

  const getDifficultyFromGrade = (gradeLevel: string): string => {
    const grade = parseInt(gradeLevel.split('-')[0]);
    if (grade <= 5) return 'beginner';
    if (grade <= 8) return 'intermediate';
    return 'advanced';
  };

  const getPersonaFromType = (type: string): string => {
    const personas = {
      assignment: 'helpful teaching assistant',
      quiz: 'encouraging quiz guide',
      worksheet: 'patient tutor',
      'lesson-plan': 'experienced educator',
      rubric: 'assessment expert'
    };
    return personas[type as keyof typeof personas] || 'supportive AI assistant';
  };

  const getConstraintsFromType = (type: string): string[] => {
    const constraints = {
      assignment: [
        'Provide guidance without giving direct answers',
        'Encourage critical thinking',
        'Ask clarifying questions'
      ],
      quiz: [
        'Give hints rather than answers',
        'Explain reasoning behind correct answers',
        'Encourage learning from mistakes'
      ],
      worksheet: [
        'Break down complex problems into steps',
        'Provide examples when helpful',
        'Celebrate progress and effort'
      ],
      'lesson-plan': [
        'Focus on pedagogical best practices',
        'Suggest engaging activities',
        'Consider different learning styles'
      ],
      rubric: [
        'Ensure clear assessment criteria',
        'Provide specific feedback examples',
        'Align with learning objectives'
      ]
    };
    return constraints[type as keyof typeof constraints] || ['Be helpful and supportive'];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {t('title', { type: labType })}
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              <Sparkles className="h-3 w-3 mr-1" />
              {t('aiPowered')}
            </Badge>
          </DialogTitle>
          <p className="text-muted-foreground">
            {t('description')}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">{t('titleField')}</Label>
              <Input
                id="title"
                placeholder={t('titlePlaceholder', { type: labType })}
                value={formData.title}
                onChange={(e) => handleFormChange("title", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">{t('subject')}</Label>
              <Select 
                value={formData.subject} 
                onValueChange={(value) => handleFormChange("subject", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectSubject')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mathematics">{t('subjects.mathematics')}</SelectItem>
                  <SelectItem value="science">{t('subjects.science')}</SelectItem>
                  <SelectItem value="english">{t('subjects.english')}</SelectItem>
                  <SelectItem value="history">{t('subjects.history')}</SelectItem>
                  <SelectItem value="geography">{t('subjects.geography')}</SelectItem>
                  <SelectItem value="chemistry">{t('subjects.chemistry')}</SelectItem>
                  <SelectItem value="physics">{t('subjects.physics')}</SelectItem>
                  <SelectItem value="biology">{t('subjects.biology')}</SelectItem>
                  <SelectItem value="computer-science">{t('subjects.computerScience')}</SelectItem>
                  <SelectItem value="other">{t('subjects.other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gradeLevel">{t('gradeLevel')}</Label>
              <Select 
                value={formData.gradeLevel} 
                onValueChange={(value) => handleFormChange("gradeLevel", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectGrade')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="k-2">{t('grades.k2')}</SelectItem>
                  <SelectItem value="3-5">{t('grades.35')}</SelectItem>
                  <SelectItem value="6-8">{t('grades.68')}</SelectItem>
                  <SelectItem value="9-12">{t('grades.912')}</SelectItem>
                  <SelectItem value="college">{t('grades.college')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">{t('duration')}</Label>
              <Select 
                value={formData.duration} 
                onValueChange={(value) => handleFormChange("duration", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectDuration')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15-min">{t('durations.15min')}</SelectItem>
                  <SelectItem value="30-min">{t('durations.30min')}</SelectItem>
                  <SelectItem value="45-min">{t('durations.45min')}</SelectItem>
                  <SelectItem value="1-hour">{t('durations.1hour')}</SelectItem>
                  <SelectItem value="90-min">{t('durations.90min')}</SelectItem>
                  <SelectItem value="2-hours">{t('durations.2hours')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">{t('descriptionField')}</Label>
            <Textarea
              id="description"
              placeholder={t('descriptionPlaceholder', { type: labType })}
              value={formData.description}
              onChange={(e) => handleFormChange("description", e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="requirements">{t('requirements')}</Label>
            <Textarea
              id="requirements"
              placeholder={t('requirementsPlaceholder')}
              value={formData.requirements}
              onChange={(e) => handleFormChange("requirements", e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('cancel')}
            </Button>
            <Button 
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={!formData.title || !formData.subject || !formData.gradeLevel || isLoading}
            >
              {isLoading ? t('creatingLab') : t('createLab')}
              <MessageSquare className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

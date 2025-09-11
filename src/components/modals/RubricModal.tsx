"use client";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, BookOpen, Beaker, Presentation, FileText, CheckSquare, School, Edit3 } from "lucide-react";
import { Rubric, type RubricCriteria } from "../rubric";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";

interface RubricTemplate {
  id: string;
  name: string;
  description: string;
  totalPoints: number;
  criteria: RubricCriteria[];
  category: string;
}

interface RubricModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  existingRubric?: any; // For editing existing rubrics
}

const rubricTemplates = {
  ib_knowledge: {
    name: "IB Knowledge",
    description: "International Baccalaureate assessment criteria",
    category: "IB",
    totalPoints: 8,
    criteria: [
      {
        id: "1",
        title: "Knowledge and Understanding",
        description: "Assessment of subject-specific content knowledge",
        levels: [
          { id: "1", name: "Level 7-8", description: "Excellent knowledge and understanding", points: 8, color: "#059669" },
          { id: "2", name: "Level 5-6", description: "Substantial knowledge and understanding", points: 6, color: "#2563eb" },
          { id: "3", name: "Level 3-4", description: "Adequate knowledge and understanding", points: 4, color: "#ca8a04" },
          { id: "4", name: "Level 1-2", description: "Limited knowledge and understanding", points: 2, color: "#dc2626" }
        ]
      }
    ]
  },
  ap_scoring: {
    name: "AP Assessment",
    description: "Advanced Placement scoring guidelines",
    category: "AP",
    totalPoints: 5,
    criteria: [
      {
        id: "1",
        title: "Content Knowledge",
        description: "Demonstrates understanding and analytical skills",
        levels: [
          { id: "1", name: "Score 5", description: "Extremely well qualified", points: 5, color: "#059669" },
          { id: "2", name: "Score 4", description: "Well qualified", points: 4, color: "#2563eb" },
          { id: "3", name: "Score 3", description: "Qualified", points: 3, color: "#ca8a04" },
          { id: "4", name: "Score 2", description: "Possibly qualified", points: 2, color: "#ea580c" },
          { id: "5", name: "Score 1", description: "No recommendation", points: 1, color: "#dc2626" }
        ]
      }
    ]
  },
  essay_writing: {
    name: "Essay Writing",
    description: "Comprehensive essay evaluation rubric",
    category: "Essay",
    totalPoints: 20,
    criteria: [
      {
        id: "1",
        title: "Content and Ideas",
        description: "Quality of content and depth of ideas",
        levels: [
          { id: "1", name: "Excellent", description: "Sophisticated and insightful ideas", points: 20, color: "#059669" },
          { id: "2", name: "Proficient", description: "Clear and well-developed ideas", points: 15, color: "#2563eb" },
          { id: "3", name: "Developing", description: "Ideas present but lack depth", points: 10, color: "#ca8a04" },
          { id: "4", name: "Beginning", description: "Unclear or underdeveloped ideas", points: 5, color: "#dc2626" }
        ]
      }
    ]
  },
  presentation: {
    name: "Presentation",
    description: "Oral presentation evaluation rubric",
    category: "Presentation",
    totalPoints: 25,
    criteria: [
      {
        id: "1",
        title: "Content Knowledge",
        description: "Understanding of subject matter",
        levels: [
          { id: "1", name: "Exceptional", description: "Comprehensive understanding", points: 25, color: "#059669" },
          { id: "2", name: "Proficient", description: "Solid understanding", points: 20, color: "#2563eb" },
          { id: "3", name: "Developing", description: "Basic understanding", points: 15, color: "#ca8a04" },
          { id: "4", name: "Beginning", description: "Minimal understanding", points: 10, color: "#dc2626" }
        ]
      }
    ]
  }
};

const getTemplateIcon = (category: string) => {
  switch (category) {
    case "IB": return <CheckSquare className="h-4 w-4 text-blue-600" />;
    case "AP": return <School className="h-4 w-4 text-green-600" />;
    case "Essay": return <FileText className="h-4 w-4 text-purple-600" />;
    case "Presentation": return <Presentation className="h-4 w-4 text-orange-600" />;
    default: return <BookOpen className="h-4 w-4 text-gray-600" />;
  }
};

export function RubricModal({ open, onOpenChange, classId, existingRubric }: RubricModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [rubricCriteria, setRubricCriteria] = useState<RubricCriteria[]>([]);
  const [rubricName, setRubricName] = useState("");
  const [rubricDescription, setRubricDescription] = useState("");
  const [rubricCategory, setRubricCategory] = useState("");
  const { toast } = useToast();

  const createMarkScheme = trpc.class.createMarkScheme.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Rubric created successfully",
      });
      onOpenChange(false);
      // Reset form
      setSelectedTemplate("");
      setRubricCriteria([]);
      setRubricName("");
      setRubricDescription("");
      setRubricCategory("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create rubric",
        variant: "destructive",
      });
    },
  });

  const updateMarkScheme = trpc.class.updateMarkScheme.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Rubric updated successfully",
      });
      onOpenChange(false);
      // Reset form
      setSelectedTemplate("");
      setRubricCriteria([]);
      setRubricName("");
      setRubricDescription("");
      setRubricCategory("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update rubric",
        variant: "destructive",
      });
    },
  });

  // Load existing rubric data when editing
  React.useEffect(() => {
    if (existingRubric && open) {
      try {
        const parsed = JSON.parse(existingRubric.structured);
        setRubricName(parsed.name || "");
        setRubricDescription(parsed.description || "");
        setRubricCategory(parsed.category || "");
        setRubricCriteria(parsed.criteria || []);
        setSelectedTemplate("custom");
      } catch (error) {
        console.error("Error parsing existing rubric:", error);
      }
    } else if (open && !existingRubric) {
      // Reset form for new rubric
      setSelectedTemplate("");
      setRubricCriteria([]);
      setRubricName("");
      setRubricDescription("");
      setRubricCategory("");
    }
  }, [existingRubric, open]);

  const handleTemplateSelect = (templateKey: string) => {
    const template = rubricTemplates[templateKey as keyof typeof rubricTemplates];
    setRubricCriteria(template.criteria);
    setRubricName(template.name);
    setRubricDescription(template.description);
    setRubricCategory(template.category);
    setSelectedTemplate(templateKey);
  };

  const handleCreateCustom = () => {
    setRubricCriteria([]);
    setRubricName("New Rubric");
    setRubricDescription("");
    setRubricCategory("Custom");
    setSelectedTemplate("custom");
  };

  const handleCreate = () => {
    if (!rubricName.trim() || rubricCriteria.length === 0) {
      toast({
        title: "Error",
        description: "Please provide a name and at least one criterion",
        variant: "destructive",
      });
      return;
    }

    const totalPoints = rubricCriteria.reduce((sum, criterion) => 
      sum + Math.max(...criterion.levels.map(level => level.points), 0), 0);
    
    const structuredData = {
      name: rubricName,
      description: rubricDescription,
      category: rubricCategory,
      criteria: rubricCriteria,
      totalPoints 
    };

    if (existingRubric) {
      updateMarkScheme.mutate({
        classId,
        markSchemeId: existingRubric.id,
        name: rubricName,
        structure: JSON.stringify(structuredData),
      });
    } else {
      createMarkScheme.mutate({
        classId,
        name: rubricName,
        structure: JSON.stringify(structuredData),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{existingRubric ? "Edit Assessment Rubric" : "Create Assessment Rubric"}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex gap-6 min-h-0 overflow-hidden">
          {/* Left Panel - Templates */}
          <div className="w-72 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h3 className="font-medium">Templates</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateCustom}
                className="gap-1"
              >
                <PlusCircle className="h-3 w-3" />
                Custom
              </Button>
            </div>
            
            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-3 pr-4">
                {Object.entries(rubricTemplates).map(([key, template]) => (
                  <Card
                    key={key}
                    className={`cursor-pointer transition-colors ${
                      selectedTemplate === key 
                        ? "border-primary bg-primary/5" 
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => handleTemplateSelect(key)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        {getTemplateIcon(template.category)}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{template.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {template.description}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="outline" className="text-xs">
                              {template.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {template.totalPoints}pts
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Right Panel - Editor */}
          <div className="flex-1 flex flex-col min-w-0">
            {selectedTemplate ? (
              <ScrollArea className="flex-1">
                <div className="space-y-4 pr-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Edit3 className="h-4 w-4" />
                        <CardTitle className="text-base">Rubric Details</CardTitle>
                        <Badge variant="outline" className="ml-auto">
                          {rubricCategory}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="rubricName" className="text-xs">Name</Label>
                          <Input
                            id="rubricName"
                            value={rubricName}
                            onChange={(e) => setRubricName(e.target.value)}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label htmlFor="rubricCategory" className="text-xs">Category</Label>
                          <Input
                            id="rubricCategory"
                            value={rubricCategory}
                            onChange={(e) => setRubricCategory(e.target.value)}
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="rubricDescription" className="text-xs">Description</Label>
                        <Textarea
                          id="rubricDescription"
                          value={rubricDescription}
                          onChange={(e) => setRubricDescription(e.target.value)}
                          className="text-sm resize-none"
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Rubric
                    criteria={rubricCriteria}
                    onChange={setRubricCriteria}
                  />
                </div>
              </ScrollArea>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <h3 className="font-medium text-muted-foreground">Select a Template</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a template to start creating your rubric
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedTemplate && (
              <span>
                Total Points: <span className="font-medium">
                  {rubricCriteria.reduce((sum, criterion) => 
                    sum + Math.max(...criterion.levels.map(level => level.points), 0), 0
                  )}
                </span>
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={!selectedTemplate || !rubricName.trim() || createMarkScheme.isPending || updateMarkScheme.isPending}
            >
              {createMarkScheme.isPending || updateMarkScheme.isPending 
                ? (existingRubric ? "Updating..." : "Creating...") 
                : (existingRubric ? "Update Rubric" : "Create Rubric")
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
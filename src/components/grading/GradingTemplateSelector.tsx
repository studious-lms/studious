import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { gradingTemplates, GradingTemplate } from "./GradingBoundaryTemplates";
import { GradingBoundary } from "./GradingBoundary";

interface GradingTemplateSelectorProps {
  selectedTemplate: string;
  onTemplateSelect: (templateKey: string, template: GradingTemplate) => void;
  onCreateCustom: () => void;
}

export function GradingTemplateSelector({
  selectedTemplate,
  onTemplateSelect,
  onCreateCustom
}: GradingTemplateSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Templates</span>
        <Button
          variant="outline"
          size="sm"
          onClick={onCreateCustom}
          className="text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Create Custom
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
        {Object.entries(gradingTemplates).map(([key, template]) => (
          <Card
            key={key}
            className={`p-3 cursor-pointer hover:bg-muted transition-colors ${
              selectedTemplate === key ? 'border-primary bg-primary/5' : ''
            }`}
            onClick={() => onTemplateSelect(key, template)}
          >
            <CardHeader className="p-0 mb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{template.name}</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">{template.description}</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex gap-1">
                {template.boundaries.slice(0, 5).map((boundary, index) => (
                  <div
                    key={index}
                    className="flex-1 h-6 rounded flex items-center justify-center text-white text-xs font-medium"
                    style={{ backgroundColor: boundary.color }}
                  >
                    {boundary.grade}
                  </div>
                ))}
                {template.boundaries.length > 5 && (
                  <div className="text-xs text-muted-foreground self-center">
                    +{template.boundaries.length - 5}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
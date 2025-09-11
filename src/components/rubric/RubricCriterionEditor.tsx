"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, GripVertical, Eye, EyeOff } from "lucide-react";
import { PerformanceLevelEditor } from "./PerformanceLevelEditor";

export interface PerformanceLevel {
  id: string;
  name: string;
  description: string;
  points: number;
  color: string;
}

export interface RubricCriterion {
  id: string;
  title: string;
  description: string;
  levels: PerformanceLevel[];
  weight?: number;
  category?: string;
  isRequired?: boolean;
  helpText?: string;
}

interface RubricCriterionEditorProps {
  criterion: RubricCriterion;
  onUpdate: (criterion: RubricCriterion) => void;
  onDelete: () => void;
  categories: string[];
  totalWeight: number;
}

const defaultPerformanceLevels: PerformanceLevel[] = [
  { id: "1", name: "Excellent", description: "Exceeds expectations", points: 4, color: "text-emerald-600" },
  { id: "2", name: "Proficient", description: "Meets expectations", points: 3, color: "text-blue-600" },
  { id: "3", name: "Developing", description: "Approaching expectations", points: 2, color: "text-yellow-600" },
  { id: "4", name: "Beginning", description: "Below expectations", points: 1, color: "text-red-600" }
];

export function RubricCriterionEditor({
  criterion,
  onUpdate,
  onDelete,
  categories,
  totalWeight
}: RubricCriterionEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const updateCriterion = (field: keyof RubricCriterion, value: any) => {
    onUpdate({ ...criterion, [field]: value });
  };

  const updatePerformanceLevel = (levelId: string, updatedLevel: PerformanceLevel) => {
    const updatedLevels = criterion.levels.map(level =>
      level.id === levelId ? updatedLevel : level
    );
    updateCriterion('levels', updatedLevels);
  };

  const addPerformanceLevel = () => {
    const newLevel: PerformanceLevel = {
      id: Date.now().toString(),
      name: "",
      description: "",
      points: 0,
      color: "#9CA3AF"
    };
    updateCriterion('levels', [...criterion.levels, newLevel]);
  };

  const deletePerformanceLevel = (levelId: string) => {
    const updatedLevels = criterion.levels.filter(level => level.id !== levelId);
    updateCriterion('levels', updatedLevels);
  };

  const resetToDefaultLevels = () => {
    updateCriterion('levels', defaultPerformanceLevels);
  };

  const weightWarning = (criterion.weight || 0) + totalWeight > 100;
  const maxPointsSum = criterion.levels.reduce((sum, level) => Math.max(sum, level.points), 0);

  return (
    <Card className="border-l-4 border-l-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
            <div className="flex-1">
              <Input
                value={criterion.title}
                onChange={(e) => updateCriterion('title', e.target.value)}
                placeholder="Criterion title"
                className="font-medium text-base border-none p-0 h-auto focus-visible:ring-0"
              />
            </div>
            <div className="flex items-center gap-2">
               <Badge variant={criterion.isRequired ? "default" : "secondary"}>
                {criterion.weight || 0}% • {maxPointsSum}pts
               </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "Collapse" : "Expand"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <Textarea
          value={criterion.description}
          onChange={(e) => updateCriterion('description', e.target.value)}
          placeholder="Describe what this criterion evaluates..."
          className="resize-none"
          rows={2}
        />
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Criterion Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={criterion.category}
                onValueChange={(value) => updateCriterion('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Maximum Points (Auto-calculated)</Label>
              <Input
                type="number"
                value={maxPointsSum}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          {/* Weight Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Weight ({criterion.weight || 0}%)</Label>
              {weightWarning && (
                <Badge variant="destructive" className="text-xs">
                  Total weight exceeds 100%
                </Badge>
              )}
            </div>
            <Slider
              value={[criterion.weight || 25]}
              onValueChange={(value) => updateCriterion('weight', value[0])}
              max={50}
              min={5}
              step={5}
              className="w-full"
            />
          </div>

          {/* Required Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Required Criterion</Label>
              <p className="text-sm text-muted-foreground">
                Students must achieve minimum level to pass
              </p>
            </div>
            <Switch
              checked={criterion.isRequired}
              onCheckedChange={(checked) => updateCriterion('isRequired', checked)}
            />
          </div>

          {/* Help Text */}
          <div className="space-y-2">
            <Label>Help Text (Optional)</Label>
            <Textarea
              value={criterion.helpText}
              onChange={(e) => updateCriterion('helpText', e.target.value)}
              placeholder="Additional guidance for graders..."
              rows={2}
            />
          </div>

          {/* Performance Levels */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Performance Levels</Label>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetToDefaultLevels}
                >
                  Reset to Default
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addPerformanceLevel}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Level
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {criterion.levels
                .sort((a, b) => b.points - a.points)
                .map((level) => (
                <PerformanceLevelEditor
                  key={level.id}
                  level={level}
                  onUpdate={(updatedLevel) => updatePerformanceLevel(level.id, updatedLevel)}
                  onDelete={() => deletePerformanceLevel(level.id)}
                  canDelete={criterion.levels.length > 2}
                />
              ))}
            </div>
          </div>
        </CardContent>
      )}

      {/* Preview */}
      {showPreview && (
        <CardContent className="border-t bg-muted/30">
          <div className="space-y-3">
            <h4 className="font-medium">Grading Preview</h4>
            <div className="grid grid-cols-1 gap-2">
              {criterion.levels
                .sort((a, b) => b.points - a.points)
                .map((level) => (
                <div
                  key={level.id}
                  className="flex justify-between items-center p-2 rounded border bg-background"
                >
                  <div>
                    <span className={`font-medium ${level.color}`}>
                      {level.name}
                    </span>
                    <p className="text-sm text-muted-foreground">
                      {level.description}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {level.points}pts
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
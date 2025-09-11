"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, GripVertical, Eye, EyeOff } from "lucide-react";

import { GradingBoundary } from "./GradingBoundary";

interface GradingBoundaryEditorProps {
  boundaries: GradingBoundary[];
  onUpdate: (boundaries: GradingBoundary[]) => void;
  scaleName: string;
  onScaleNameChange: (name: string) => void;
}

export function GradingBoundaryEditor({
  boundaries,
  onUpdate,
  scaleName,
  onScaleNameChange
}: GradingBoundaryEditorProps) {
  const [showPreview, setShowPreview] = useState(false);

  const updateBoundary = (id: string, field: keyof GradingBoundary, value: string | number) => {
    const updatedBoundaries = boundaries.map(boundary =>
      boundary.id === id ? { ...boundary, [field]: value } : boundary
    );
    onUpdate(updatedBoundaries);
  };

  const addBoundary = () => {
    const newBoundary: GradingBoundary = {
      id: Date.now().toString(),
      grade: "New Grade",
      minPercentage: 0,
      maxPercentage: 100,
      color: "#6b7280",
      description: "Add description for this grade level"
    };
    onUpdate([...boundaries, newBoundary]);
  };

  const removeBoundary = (id: string) => {
    const updatedBoundaries = boundaries.filter(boundary => boundary.id !== id);
    onUpdate(updatedBoundaries);
  };

  const sortedBoundaries = [...boundaries].sort((a, b) => b.maxPercentage - a.maxPercentage);

  return (
    <div className="space-y-6">
      {/* Scale Name */}
      <div className="space-y-2">
        <Label htmlFor="scaleName">Scale Name</Label>
        <Input
          id="scaleName"
          value={scaleName}
          onChange={(e) => onScaleNameChange(e.target.value)}
          placeholder="Enter scale name..."
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Grade Boundaries</Label>
        <div className="space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={addBoundary}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Grade
          </Button>
        </div>
      </div>

      {/* Boundaries List */}
      <div className="space-y-3">
        {sortedBoundaries.map((boundary) => (
          <Card key={boundary.id} className="border-l-4" style={{ borderLeftColor: boundary.color }}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                <div className="flex-1 grid grid-cols-1 gap-3 items-start">
                   <div className="flex flex-wrap gap-3 items-end">
                     <div className="flex-1 min-w-20">
                       <Label className="text-xs">Grade</Label>
                       <Input
                         value={boundary.grade}
                         onChange={(e) => updateBoundary(boundary.id, 'grade', e.target.value)}
                         className="text-center font-medium"
                       />
                     </div>
                     
                     <div className="flex-1 min-w-20">
                       <Label className="text-xs">Min %</Label>
                       <Input
                         type="number"
                         value={boundary.minPercentage}
                         onChange={(e) => updateBoundary(boundary.id, 'minPercentage', parseInt(e.target.value) || 0)}
                         min="0"
                         max="100"
                       />
                     </div>
                     
                     <div className="flex-1 min-w-20">
                       <Label className="text-xs">Max %</Label>
                       <Input
                         type="number"
                         value={boundary.maxPercentage}
                         onChange={(e) => updateBoundary(boundary.id, 'maxPercentage', parseInt(e.target.value) || 0)}
                         min="0"
                         max="100"
                       />
                     </div>
                     
                     
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={() => removeBoundary(boundary.id)}
                       className="text-destructive hover:text-destructive hover:bg-destructive/10"
                       disabled={boundaries.length <= 1}
                     >
                       <Trash2 className="h-4 w-4" />
                     </Button>
                   </div>
                   
                   <div className="mt-2">
                     <Badge 
                       variant="outline" 
                       style={{ backgroundColor: boundary.color + '20', borderColor: boundary.color }}
                       className="text-xs"
                     >
                       {boundary.minPercentage}% - {boundary.maxPercentage}%
                     </Badge>
                   </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-2">
                <Label className="text-xs">Description</Label>
                <Textarea
                  value={boundary.description || ''}
                  onChange={(e) => updateBoundary(boundary.id, 'description', e.target.value)}
                  placeholder="Describe this grade level..."
                  className="text-sm resize-none"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview */}
      {showPreview && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">Scale Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sortedBoundaries.map((boundary) => (
                <div
                  key={boundary.id}
                  className="flex items-center justify-between p-3 rounded border"
                  style={{ borderLeftColor: boundary.color, borderLeftWidth: '4px' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: boundary.color }}
                    >
                      {boundary.grade.charAt(0)}
                    </div>
                    <div>
                      <span className="font-medium">{boundary.grade}</span>
                      <p className="text-sm text-muted-foreground">{boundary.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {boundary.minPercentage}% - {boundary.maxPercentage}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
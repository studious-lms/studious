import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, GripVertical } from "lucide-react";

export interface PerformanceLevel {
  id: string;
  name: string;
  description: string;
  points: number;
  color: string;
}

interface PerformanceLevelEditorProps {
  level: PerformanceLevel;
  onUpdate: (level: PerformanceLevel) => void;
  onDelete: () => void;
  canDelete: boolean;
}

const colorOptions = [
  { value: "text-emerald-600", label: "Emerald", preview: "bg-emerald-100" },
  { value: "text-blue-600", label: "Blue", preview: "bg-blue-100" },
  { value: "text-green-600", label: "Green", preview: "bg-green-100" },
  { value: "text-yellow-600", label: "Yellow", preview: "bg-yellow-100" },
  { value: "text-orange-600", label: "Orange", preview: "bg-orange-100" },
  { value: "text-red-600", label: "Red", preview: "bg-red-100" },
  { value: "text-purple-600", label: "Purple", preview: "bg-purple-100" },
  { value: "text-pink-600", label: "Pink", preview: "bg-pink-100" },
];

export function PerformanceLevelEditor({
  level,
  onUpdate,
  onDelete,
  canDelete
}: PerformanceLevelEditorProps) {
  const updateLevel = (field: keyof PerformanceLevel, value: string | number) => {
    onUpdate({ ...level, [field]: value });
  };

  return (
    <div className="border rounded-lg p-4 bg-card space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
        <div className="flex-1 grid grid-cols-12 gap-3 items-center">
          <div className="col-span-6">
            <Label className="text-xs font-medium">Level Name</Label>
            <Input
              value={level.name}
              onChange={(e) => updateLevel("name", e.target.value)}
              placeholder="e.g., Level 7-8 (Excellent)"
              className="mt-1"
            />
          </div>
          
          <div className="col-span-3">
            <Label className="text-xs font-medium">Points</Label>
            <Input
              type="number"
              value={level.points}
              onChange={(e) => updateLevel("points", Number(e.target.value))}
              placeholder="8"
              min="0"
              max="100"
              className="mt-1"
            />
          </div>
          
          <div className="col-span-2">
            <Label className="text-xs font-medium">Color</Label>
            <Select
              value={level.color}
              onValueChange={(value) => updateLevel("color", value)}
            >
              <SelectTrigger className="mt-1">
                <div className="flex items-center gap-2">
                  <div 
                    className={`w-3 h-3 rounded-full ${
                      colorOptions.find(c => c.value === level.color)?.preview || "bg-gray-100"
                    }`}
                  />
                  <span className="text-xs">
                    {colorOptions.find(c => c.value === level.color)?.label || "Select"}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent>
                {colorOptions.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${color.preview}`} />
                      <span>{color.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="col-span-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              disabled={!canDelete}
              className="mt-4 h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
      
      <div>
        <Label className="text-xs font-medium">Performance Description</Label>
        <Textarea
          value={level.description}
          onChange={(e) => updateLevel("description", e.target.value)}
          placeholder="Describes excellent knowledge and understanding of subject-specific content and concepts. Excellent knowledge of subject-specific content, deep understanding of concepts, extensive relevant examples provided."
          className="mt-1 resize-none"
          rows={3}
        />
      </div>
    </div>
  );
}
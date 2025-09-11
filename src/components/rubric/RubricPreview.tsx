import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calculator, Download, Eye } from "lucide-react";
import { RubricCriterion } from "./RubricCriterionEditor";

interface Rubric {
  id: string;
  name: string;
  description: string;
  totalPoints: number;
  criteria: RubricCriterion[];
}

interface RubricPreviewProps {
  rubric: Rubric;
  mode?: 'edit' | 'grade' | 'view';
}

export function RubricPreview({ rubric, mode = 'view' }: RubricPreviewProps) {
  const totalWeight = rubric.criteria.reduce((sum, criterion) => sum + (criterion.weight || 0), 0);
  const calculatedTotalPoints = rubric.criteria.reduce((sum, criterion) => 
    sum + Math.max(...criterion.levels.map(level => level.points), 0), 0);
  const weightWarning = totalWeight !== 100;

  const getCategoryColor = (category: string) => {
    const colors = {
      'Content': 'bg-blue-100 text-blue-800',
      'Communication': 'bg-green-100 text-green-800',
      'Critical Thinking': 'bg-purple-100 text-purple-800',
      'Collaboration': 'bg-orange-100 text-orange-800',
      'Technical Skills': 'bg-red-100 text-red-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors['Other'];
  };

  const groupedCriteria = rubric.criteria.reduce((groups, criterion) => {
    const category = criterion.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(criterion);
    return groups;
  }, {} as Record<string, RubricCriterion[]>);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">{rubric.name}</CardTitle>
            <p className="text-muted-foreground mt-1">{rubric.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {mode === 'edit' && (
              <>
                <Button variant="outline" size="sm">
                  <Calculator className="h-4 w-4 mr-1" />
                  Calculate
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </>
            )}
            <Badge variant={weightWarning ? "destructive" : "default"}>
              {calculatedTotalPoints} Total Points
            </Badge>
          </div>
        </div>

        {/* Weight Summary */}
        <div className="flex items-center gap-4 pt-2">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span>Weight Distribution</span>
              <span className={totalWeight !== 100 ? "text-destructive" : "text-muted-foreground"}>
                {totalWeight}%
              </span>
            </div>
            <Progress 
              value={totalWeight} 
              className={`h-2 ${totalWeight > 100 ? '[&>div]:bg-destructive' : ''}`}
            />
          </div>
          {weightWarning && (
            <Badge variant="destructive" className="text-xs">
              {totalWeight > 100 ? 'Over 100%' : 'Under 100%'}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {Object.entries(groupedCriteria).map(([category, criteria]) => (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className={getCategoryColor(category)}>
                {category}
              </Badge>
               <span className="text-sm text-muted-foreground">
                {criteria.length} criteria • {criteria.reduce((sum, c) => 
                  sum + Math.max(...c.levels.map(level => level.points), 0), 0)} points
               </span>
            </div>

            <div className="space-y-3">
              {criteria.map((criterion) => (
                <Card key={criterion.id} className="border-l-4 border-l-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                         <div className="flex items-center gap-2 mb-1">
                           <h4 className="font-medium">{criterion.title}</h4>
                           <Badge variant="outline" className="text-xs">
                             {criterion.weight || 0}% • {Math.max(...criterion.levels.map(level => level.points), 0)}pts
                           </Badge>
                          {criterion.isRequired && (
                            <Badge variant="default" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {criterion.description}
                        </p>
                        {criterion.helpText && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            {criterion.helpText}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Performance Levels */}
                     <div className="grid grid-cols-1 gap-2">
                       {criterion.levels
                         .sort((a, b) => b.points - a.points)
                         .map((level) => (
                        <div
                          key={level.id}
                          className="flex justify-between items-center p-2 rounded border bg-muted/30"
                        >
                          <div className="flex-1">
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
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {rubric.criteria.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No criteria added yet</p>
            <p className="text-sm">Add criteria to see the rubric preview</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
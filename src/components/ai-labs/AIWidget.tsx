"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AIWidgetProps {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  category: 'generate' | 'create';
  isActive: boolean;
  onClick: (id: string) => void;
}

export function AIWidget({ 
  id, 
  title, 
  description, 
  icon: Icon, 
  color, 
  category, 
  isActive, 
  onClick 
}: AIWidgetProps) {
  return (
    <Button
      variant={isActive ? "default" : "outline"}
      className={cn(
        "w-full p-4 h-auto text-left justify-start flex-col items-start gap-2",
        isActive && "ring-2 ring-purple-500"
      )}
      onClick={() => onClick(id)}
    >
      <div className="flex items-center gap-2 w-full">
        <div className={cn("p-1.5 rounded-md text-white", color)}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="font-medium text-sm">{title}</span>
        <Badge variant="secondary" className="ml-auto text-xs">
          {category}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground text-left">
        {description}
      </p>
    </Button>
  );
}

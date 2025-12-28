"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  color?: string;
  trend?: { 
    value: string; 
    isPositive: boolean; 
  };
  progress?: number; // Progress percentage (0-100)
}

/**
 * A reusable stats card component with optional colored styling.
 * 
 * @example
 * ```tsx
 * <StatsCard
 *   title="Total Users"
 *   value={1234}
 *   icon={Users}
 *   description="Active this month"
 *   color="#4E81EE"
 * />
 * ```
 */
export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  description,
  color,
  trend,
  progress,
}: StatsCardProps) {
  return (
    <Card 
      style={{ 
        backgroundColor: color ? `${color}20` : undefined, 
        borderColor: color ? `${color}80` : undefined 
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-5 w-5" style={{ color: color || 'hsl(var(--muted-foreground))' }} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className={`flex items-center text-xs mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.value}
          </div>
        )}
        {progress !== undefined && (
          <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{
            backgroundColor: color ? `${color}20` : 'hsl(var(--muted))'
          }}>
            <div 
              className="h-full rounded-full transition-all" 
              style={{ 
                width: `${Math.min(100, Math.max(0, progress))}%`,
                backgroundColor: color || 'hsl(var(--primary))'
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}


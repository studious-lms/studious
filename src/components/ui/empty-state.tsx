import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon | React.ReactNode;
  title: string;
  description: string;
  className?: string;
  iconClassName?: string;
  isTableRow?: boolean;
  colSpan?: number;
}

export function EmptyState({
  icon,
  title,
  description,
  className,
  iconClassName,
  isTableRow = false,
  colSpan
}: EmptyStateProps) {
  const content = (
    <div className={cn("flex flex-col items-center space-y-3", className)}>
      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
        {React.isValidElement(icon) ? (
          icon
        ) : (
          React.createElement(icon as LucideIcon, { 
            className: cn("h-6 w-6 text-muted-foreground opacity-50", iconClassName) 
          })
        )}
      </div>
      <div className="space-y-1 text-center">
        <p className="font-medium text-muted-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );

  if (isTableRow) {
    return (
      <tr>
        <td colSpan={colSpan} className="text-center py-12">
          {content}
        </td>
      </tr>
    );
  }

  return (
    <div className="text-center py-8">
      {content}
    </div>
  );
}

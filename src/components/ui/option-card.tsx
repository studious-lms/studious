"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";


// @todo: remove the custom component for radix-ui when they fix the component
//        there is an issue with the checkbox when inside of an dialog
//        (more like a checkbox inside a like dropdown select menu inside of a dialog window)
interface OptionCardProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  title: string;
  description?: string;
  icon?: LucideIcon;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

/**
 * A reusable option card component with a checkbox, title, description, and optional icon.
 * Used for toggleable options in forms.
 * 
 * @example
 * ```tsx
 * <OptionCard
 *   checked={formData.graded}
 *   onCheckedChange={(checked) => updateFormData({ graded: checked })}
 *   title="Graded Assignment"
 *   description="This assignment will count toward the final grade"
 *   icon={CheckCircle}
 * />
 * ```
 */
export function OptionCard({
  checked,
  onCheckedChange,
  title,
  description,
  icon: Icon,
  disabled = false,
  children,
  className,
}: OptionCardProps) {
  const handleClick = () => {
    if (!disabled) {
      onCheckedChange(!checked);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all",
        checked ? "bg-primary/5 border-primary" : "hover:bg-muted/50",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={handleClick}
    >
      <div
        className={cn(
          "h-4 w-4 shrink-0 rounded-sm border border-primary flex items-center justify-center",
          checked && "bg-primary text-primary-foreground",
          disabled && "opacity-50"
        )}
      >
        {checked && <Check className="h-3 w-3" />}
      </div>
      {Icon && <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {children}
      </div>
    </div>
  );
}

interface ExpandableOptionCardProps extends Omit<OptionCardProps, 'children'> {
  expanded?: boolean;
  expandedContent?: React.ReactNode;
  chevron?: boolean;
}

/**
 * An expandable option card that shows additional content when checked.
 * 
 * @example
 * ```tsx
 * <ExpandableOptionCard
 *   checked={formData.acceptWorksheet}
 *   onCheckedChange={(checked) => updateFormData({ acceptWorksheet: checked })}
 *   title="Worksheet Submission"
 *   description="Students will complete a worksheet"
 *   icon={ClipboardList}
 *   expandedContent={<WorksheetSelector />}
 * />
 * ```
 */
export function ExpandableOptionCard({
  checked,
  onCheckedChange,
  title,
  description,
  icon: Icon,
  disabled = false,
  expanded,
  expandedContent,
  chevron = true,
  className,
}: ExpandableOptionCardProps) {
  const isExpanded = expanded ?? checked;
  
  const handleClick = () => {
    if (!disabled) {
      onCheckedChange(!checked);
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl border transition-all",
        checked ? "bg-primary/5 border-primary" : "",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 p-4 cursor-pointer",
          !checked && "hover:bg-muted/50 rounded-xl",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={handleClick}
      >
        <div
          className={cn(
            "h-4 w-4 shrink-0 rounded-sm border border-primary flex items-center justify-center",
            checked && "bg-primary text-primary-foreground",
            disabled && "opacity-50"
          )}
        >
          {checked && <Check className="h-3 w-3" />}
        </div>
        {Icon && <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{title}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {chevron && (
          <svg
            className={cn(
              "h-4 w-4 transition-transform text-muted-foreground",
              isExpanded && "rotate-180"
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>
      
      {isExpanded && expandedContent && (
        <div className="px-4 pb-4">
          {expandedContent}
        </div>
      )}
    </div>
  );
}


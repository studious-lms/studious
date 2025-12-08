"use client";

import * as React from "react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { AI_POLICY_LEVELS, getAIPolicyLevel } from "@/lib/aiPolicy";

interface AIPolicyDisplayProps {
  level: number;
  defaultExpanded?: boolean;
  className?: string;
}

/**
 * A simple display component for showing AI policy level.
 * Just pass a level number and it handles the rest.
 * 
 * @example
 * ```tsx
 * <AIPolicyDisplay level={3} />
 * <AIPolicyDisplay level={assignment.aiPolicyLevel} defaultExpanded />
 * ```
 */
export function AIPolicyDisplay({
  level,
  defaultExpanded = false,
  className,
}: AIPolicyDisplayProps) {
  const t = useTranslations('components.createAssignment');
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  const policyConfig = getAIPolicyLevel(level);
  if (!policyConfig) return null;

  const policy = {
    level: policyConfig.level,
    title: t(policyConfig.titleKey),
    description: t(policyConfig.descriptionKey),
    useCases: t(policyConfig.useCasesKey),
    studentResponsibilities: t(policyConfig.studentResponsibilitiesKey),
    disclosureRequirements: t(policyConfig.disclosureRequirementsKey),
    color: policyConfig.hexColor,
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className={className}>
      <div
        className={cn(
          "rounded-xl border cursor-pointer transition-all",
          isExpanded ? "border-2" : "hover:bg-muted/50"
        )}
        style={
          isExpanded
            ? { borderColor: policy.color, backgroundColor: `${policy.color}10` }
            : {}
        }
      >
        <CollapsibleTrigger asChild>
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div
                className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                style={{ backgroundColor: policy.color }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{policy.title}</h4>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 ml-auto transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{policy.description}</p>
              </div>
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 pt-0 space-y-3 text-sm ml-6">
            <div>
              <p className="font-medium mb-1">{t('aiPolicy.useCases')}</p>
              <p className="text-muted-foreground">{policy.useCases}</p>
            </div>
            <div>
              <p className="font-medium mb-1">{t('aiPolicy.studentResponsibilities')}</p>
              <p className="text-muted-foreground">{policy.studentResponsibilities}</p>
            </div>
            <div>
              <p className="font-medium mb-1">{t('aiPolicy.disclosureRequirements')}</p>
              <p className="text-muted-foreground">{policy.disclosureRequirements}</p>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

interface AIPolicySelectorProps {
  selectedLevel: number;
  onSelectLevel: (level: number) => void;
  className?: string;
}

/**
 * A selector component for choosing from multiple AI policy levels.
 * Just pass the selected level and a callback - it handles the rest.
 * 
 * @example
 * ```tsx
 * <AIPolicySelector
 *   selectedLevel={formData.aiPolicyLevel}
 *   onSelectLevel={(level) => updateFormData({ aiPolicyLevel: level })}
 * />
 * ```
 */
export function AIPolicySelector({
  selectedLevel,
  onSelectLevel,
  className,
}: AIPolicySelectorProps) {
  const t = useTranslations('components.createAssignment');

  const policies = AI_POLICY_LEVELS.map(p => ({
    level: p.level,
    title: t(p.titleKey),
    description: t(p.descriptionKey),
    useCases: t(p.useCasesKey),
    studentResponsibilities: t(p.studentResponsibilitiesKey),
    disclosureRequirements: t(p.disclosureRequirementsKey),
    color: p.hexColor,
  }));

  return (
    <div className={cn("space-y-2", className)}>
      {policies.map((policy) => {
        const isSelected = selectedLevel === policy.level;
        return (
          <Collapsible
            key={policy.level}
            open={isSelected}
            onOpenChange={(open) => {
              if (open) onSelectLevel(policy.level);
            }}
          >
            <div
              className={cn(
                "rounded-xl border cursor-pointer transition-all",
                isSelected ? "border-2" : "hover:bg-muted/50"
              )}
              style={
                isSelected
                  ? { borderColor: policy.color, backgroundColor: `${policy.color}10` }
                  : {}
              }
            >
              <CollapsibleTrigger asChild>
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: policy.color }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{policy.title}</h4>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 ml-auto transition-transform",
                            isSelected && "rotate-180"
                          )}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">{policy.description}</p>
                    </div>
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 pb-4 pt-0 space-y-3 text-sm ml-6">
                  <div>
                    <p className="font-medium mb-1">{t('aiPolicy.useCases')}</p>
                    <p className="text-muted-foreground">{policy.useCases}</p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">{t('aiPolicy.studentResponsibilities')}</p>
                    <p className="text-muted-foreground">{policy.studentResponsibilities}</p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">{t('aiPolicy.disclosureRequirements')}</p>
                    <p className="text-muted-foreground">{policy.disclosureRequirements}</p>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        );
      })}
    </div>
  );
}

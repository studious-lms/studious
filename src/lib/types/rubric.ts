import type { RouterOutputs } from '@/lib/trpc';

// ===== RUBRIC/MARKSCHEME TYPES =====
export type MarkScheme = RouterOutputs['class']['listMarkSchemes'][number];
export type GradingBoundary = RouterOutputs['class']['listGradingBoundaries'][number];

// ===== RUBRIC CRITERIA TYPES =====
export interface RubricLevel {
  id: string;
  name: string;
  description: string;
  points: number;
  color: string;
}

export interface RubricCriteria {
  id: string;
  title: string;
  description: string;
  levels: RubricLevel[];
}

export interface RubricProps {
  criteria: RubricCriteria[];
  onChange: (criteria: RubricCriteria[]) => void;
  readonly?: boolean;
}

// ===== GRADING BOUNDARY TYPES =====
export interface GradeBoundary {
  id: string;
  grade: string;
  minPercentage: number;
  maxPercentage: number;
  description: string;
  color: string;
}

export interface GradingBoundarySet {
  id: string;
  name: string;
  boundaries: GradeBoundary[];
}

export interface GradingBoundaryProps {
  boundaries: GradeBoundary[];
  onChange: (boundaries: GradeBoundary[]) => void;
  readonly?: boolean;
}

// ===== PARSED DATA TYPES =====
export interface ParsedMarkScheme {
  name: string;
  criteria: RubricCriteria[];
}

export interface ParsedGradingBoundary {
  name: string;
  boundaries: GradeBoundary[];
}

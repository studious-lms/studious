import type { RubricCriteria, GradeBoundary } from './rubric';

// ===== PARSED MARK SCHEME TYPES =====
export interface ParsedMarkScheme {
  name: string;
  description?: string;
  criteria: RubricCriteria[];
  totalPoints?: number;
}

export interface StoredRubricItem {
  criteriaId: string;
  selectedLevelId: string;
  points: number;
  comments: string;
}

// ===== PARSED GRADING BOUNDARY TYPES =====
export interface ParsedGradingBoundary {
  name: string;
  description?: string;
  boundaries: GradeBoundary[];
}

// ===== RUBRIC GRADING TYPES =====
export interface RubricGrade {
  criteriaId: string;
  selectedLevelId: string;
  points: number;
  comments: string;
}

// ===== TYPE GUARDS =====
export function isValidMarkScheme(data: any): data is ParsedMarkScheme {
  return (
    data &&
    typeof data.name === 'string' &&
    Array.isArray(data.criteria) &&
    data.criteria.every((criterion: any) => 
      criterion.id &&
      criterion.title &&
      Array.isArray(criterion.levels)
    )
  );
}

export function isValidGradingBoundary(data: any): data is ParsedGradingBoundary {
  return (
    data &&
    typeof data.name === 'string' &&
    Array.isArray(data.boundaries) &&
    data.boundaries.every((boundary: any) => 
      boundary.grade &&
      typeof boundary.minPercentage === 'number' &&
      typeof boundary.maxPercentage === 'number'
    )
  );
}

// ===== PARSER UTILITIES =====
export function parseMarkScheme(structured: string): ParsedMarkScheme | null {
  try {
    const parsed = JSON.parse(structured);
    return isValidMarkScheme(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function parseGradingBoundary(structured: string): ParsedGradingBoundary | null {
  try {
    const parsed = JSON.parse(structured);
    return isValidGradingBoundary(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

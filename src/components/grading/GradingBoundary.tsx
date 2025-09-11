export interface GradingBoundary {
  id: string;
  grade: string;
  minPercentage: number;
  maxPercentage: number;
  color: string;
  description?: string;
}

export interface GradingBoundarySet {
  id: string;
  name: string;
  description: string;
  boundaries: GradingBoundary[];
  isActive: boolean;
}
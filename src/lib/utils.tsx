import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { RouterOutputs } from "./trpc"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { JSX } from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type Grade = RouterOutputs["class"]["getGrades"]["grades"][number];

/**
 * Calculates the trend of grades using linear regression
 * Returns "up", "down", or "neutral" based on the slope of the regression line
 */
export function calculateTrend(
  grades: Grade[]
): "up" | "down" | "neutral" {
  // Filter grades that have both a grade received and submission date
  const validGrades = grades
    .filter(
      (g) =>
        g.gradeReceived != null &&
        g.submittedAt != null &&
        g.assignment.maxGrade != null &&
        g.assignment.maxGrade > 0
    )
    .map((g) => ({
      date: new Date(g.submittedAt!).getTime(),
      percentage: (g.gradeReceived! / g.assignment.maxGrade!) * 100,
    }))
    .sort((a, b) => a.date - b.date); // Sort by date ascending

  // Need at least 2 data points to calculate a trend
  if (validGrades.length < 2) {
    return "neutral";
  }

  const n = validGrades.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  // Calculate linear regression: y = mx + b
  // where x is the index (0, 1, 2, ...) and y is the percentage
  validGrades.forEach((grade, index) => {
    const x = index;
    const y = grade.percentage;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  });

  // Calculate slope: m = (n*ΣXY - ΣX*ΣY) / (n*ΣX² - (ΣX)²)
  const denominator = n * sumX2 - sumX * sumX;
  
  // Avoid division by zero
  if (Math.abs(denominator) < 1e-10) {
    return "neutral";
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;

  // Threshold for determining trend (0.5% per assignment)
  // This means the grade needs to improve/decrease by at least 0.5% per assignment
  const threshold = 0.5;

  if (slope > threshold) {
    return "up";
  } else if (slope < -threshold) {
    return "down";
  } else {
    return "neutral";
  }
}

/**
 * Returns the appropriate trend icon component based on the trend value
 */
export function getTrendIcon(trend: "up" | "down" | "neutral"): JSX.Element {
  switch (trend) {
    case "up":
      return <TrendingUp className="text-green-600" />;
    case "down":
      return <TrendingDown className="text-red-600" />;
    default:
      return <Minus className="text-muted-foreground" />;
  }
}

/**
 * Configuration options for grade color calculation
 */
export interface GradeColorOptions {
  /** Custom thresholds for grade ranges (default: 90, 80, 70) */
  thresholds?: {
    excellent: number;
    good: number;
    passing: number;
  };
  /** Whether to include font weight classes (default: true) */
  includeFontWeight?: boolean;
}

/**
 * Returns Tailwind CSS classes for styling grades based on percentage thresholds.
 * Uses semantic colors (green, yellow, orange, red) that work in both light and dark modes.
 * 
 * @param grade - The grade percentage (0-100) or null if not graded
 * @param options - Optional configuration for custom thresholds and styling
 * @returns Tailwind CSS class string for text color and font weight
 * 
 * @example
 * ```tsx
 * <div className={getGradeColor(95)}>95%</div>
 * <div className={getGradeColor(null)}>Not graded</div>
 * <div className={getGradeColor(85, { thresholds: { excellent: 95, good: 85, passing: 75 } })}>85%</div>
 * ```
 */
export function getGradeColor(
  grade: number | null,
  options: GradeColorOptions = {}
): string {
  const {
    thresholds = { excellent: 90, good: 80, passing: 70 },
    includeFontWeight = true,
  } = options;

  // Handle missing or ungraded assignments
  if (grade === null || grade === undefined) {
    return cn("text-muted-foreground", includeFontWeight ? "font-medium" : "");
  }

  // Ensure grade is within valid range
  const clampedGrade = Math.max(0, Math.min(100, grade));
  const fontWeight = includeFontWeight ? "font-semibold" : "";

  // Excellent grade (A range) - Green
  if (clampedGrade >= thresholds.excellent) {
    return cn("text-green-600 dark:text-green-400", fontWeight);
  }

  // Good grade (B range) - Yellow
  if (clampedGrade >= thresholds.good) {
    return cn("text-yellow-600 dark:text-yellow-400", includeFontWeight ? "font-medium" : "");
  }

  // Passing grade (C range) - Orange
  if (clampedGrade >= thresholds.passing) {
    return cn("text-orange-600 dark:text-orange-400", includeFontWeight ? "font-medium" : "");
  }

  // Failing grade (below passing threshold) - Red
  return cn("text-red-600 dark:text-red-400", fontWeight);
}


/**
 * Returns Tailwind CSS classes for border and background styling based on grade percentage.
 * Creates a subtle gradient background effect that works in both light and dark modes.
 * 
 * @param grade - The grade percentage (0-100) or null if not graded
 * @param options - Optional configuration for custom thresholds
 * @returns Tailwind CSS class string for border and background colors
 * 
 * @example
 * ```tsx
 * <Card className={getGradeBorderAndBackground(95)}>Excellent!</Card>
 * <div className={getGradeBorderAndBackground(null)}>Not graded</div>
 * ```
 */
export function getGradeBorderAndBackground(
  grade: number | null,
  options: GradeColorOptions = {}
): string {
  const {
    thresholds = { excellent: 90, good: 80, passing: 70 },
  } = options;

  // Handle missing or ungraded assignments
  if (grade === null || grade === undefined) {
    return "border-border bg-muted/30";
  }

  // Ensure grade is within valid range
  const clampedGrade = Math.max(0, Math.min(100, grade));

  // Excellent grade (A range) - Green
  if (clampedGrade >= thresholds.excellent) {
    return "border-green-500/30 bg-gradient-to-br from-green-500/5 to-green-500/10";
  }

  // Good grade (B range) - Yellow
  if (clampedGrade >= thresholds.good) {
    return "border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-yellow-500/10";
  }

  // Passing grade (C range) - Orange
  if (clampedGrade >= thresholds.passing) {
    return "border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-orange-500/10";
  }

  // Failing grade (below passing threshold) - Red
  return "border-red-500/30 bg-gradient-to-br from-red-500/5 to-red-500/10";
}
import React from "react";

interface GradingBoundary {
  boundaries?: Array<{
    grade: string;
    minPercentage: number;
    maxPercentage: number;
  }>;
  structured?: any;
}

export default function getGradeDisplay(
  grade: number, 
  maxGrade: number, 
  gradingBoundary?: GradingBoundary | null
) {
  const percentage = maxGrade > 0 ? (grade / maxGrade) * 100 : 0;
  const structuredBoundary = JSON.parse(gradingBoundary?.structured || '{}');
  
  // Try to get letter grade if grading boundary is provided
  let letterGrade = '';
  let color = '';
  if (structuredBoundary.boundaries) {
    const boundary = structuredBoundary.boundaries.find(b =>
      percentage >= b.minPercentage && percentage <= b.maxPercentage
    );
    letterGrade = boundary?.grade || '';
    color = boundary?.color || '';
  }

  return (
    <div className="text-sm font-bold" style={{ color }}>
      {letterGrade}
    </div>
  );
}
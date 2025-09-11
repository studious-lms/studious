import { GradingBoundary } from './GradingBoundary';

export interface GradingTemplate {
  name: string;
  description: string;
  boundaries: Omit<GradingBoundary, 'id'>[];
}

export const gradingTemplates: Record<string, GradingTemplate> = {
  traditional: {
    name: "Traditional A-F",
    description: "Standard American grading scale",
    boundaries: [
      { grade: "A+", minPercentage: 97, maxPercentage: 100, color: "#059669", description: "Exceptional performance demonstrating comprehensive understanding and superior application of concepts" },
      { grade: "A", minPercentage: 93, maxPercentage: 96, color: "#059669", description: "Excellent performance showing strong mastery of concepts and skills" },
      { grade: "A-", minPercentage: 90, maxPercentage: 92, color: "#10b981", description: "Very good performance with solid understanding of most concepts" },
      { grade: "B+", minPercentage: 87, maxPercentage: 89, color: "#2563eb", description: "Good performance demonstrating adequate understanding with minor gaps" },
      { grade: "B", minPercentage: 83, maxPercentage: 86, color: "#2563eb", description: "Satisfactory performance showing basic understanding of concepts" },
      { grade: "B-", minPercentage: 80, maxPercentage: 82, color: "#3b82f6", description: "Acceptable performance with some understanding of key concepts" },
      { grade: "C+", minPercentage: 77, maxPercentage: 79, color: "#ca8a04", description: "Below average performance with limited understanding" },
      { grade: "C", minPercentage: 73, maxPercentage: 76, color: "#ca8a04", description: "Minimal performance showing basic grasp of fundamental concepts" },
      { grade: "C-", minPercentage: 70, maxPercentage: 72, color: "#eab308", description: "Poor performance with significant gaps in understanding" },
      { grade: "D", minPercentage: 60, maxPercentage: 69, color: "#ea580c", description: "Inadequate performance demonstrating insufficient understanding" },
      { grade: "F", minPercentage: 0, maxPercentage: 59, color: "#dc2626", description: "Failing performance showing little to no understanding of concepts" }
    ]
  },
  ib: {
    name: "IB Grading Scale",
    description: "International Baccalaureate 1-7 scale",
    boundaries: [
      { grade: "7", minPercentage: 80, maxPercentage: 100, color: "#059669", description: "Demonstrates excellent knowledge and understanding with sophisticated application" },
      { grade: "6", minPercentage: 70, maxPercentage: 79, color: "#2563eb", description: "Shows good knowledge and understanding with effective application" },
      { grade: "5", minPercentage: 60, maxPercentage: 69, color: "#16a34a", description: "Demonstrates adequate knowledge and understanding with some application" },
      { grade: "4", minPercentage: 50, maxPercentage: 59, color: "#ca8a04", description: "Shows limited knowledge and understanding with minimal application" },
      { grade: "3", minPercentage: 40, maxPercentage: 49, color: "#ea580c", description: "Demonstrates very limited knowledge and understanding" },
      { grade: "2", minPercentage: 30, maxPercentage: 39, color: "#ef4444", description: "Shows little knowledge and understanding with poor application" },
      { grade: "1", minPercentage: 0, maxPercentage: 29, color: "#dc2626", description: "Demonstrates no knowledge and understanding" }
    ]
  },
  ap: {
    name: "AP Grading Scale",
    description: "Advanced Placement 1-5 scale",
    boundaries: [
      { grade: "5", minPercentage: 85, maxPercentage: 100, color: "#059669", description: "Extremely well qualified - demonstrates comprehensive understanding" },
      { grade: "4", minPercentage: 70, maxPercentage: 84, color: "#2563eb", description: "Well qualified - shows strong understanding with good application" },
      { grade: "3", minPercentage: 55, maxPercentage: 69, color: "#ca8a04", description: "Qualified - demonstrates adequate understanding" },
      { grade: "2", minPercentage: 40, maxPercentage: 54, color: "#ea580c", description: "Possibly qualified - shows limited understanding" },
      { grade: "1", minPercentage: 0, maxPercentage: 39, color: "#dc2626", description: "No recommendation - insufficient understanding demonstrated" }
    ]
  },
  uk: {
    name: "UK GCSE Grading",
    description: "UK GCSE 9-1 grading scale",
    boundaries: [
      { grade: "9", minPercentage: 90, maxPercentage: 100, color: "#059669", description: "Exceptional performance exceeding grade 8" },
      { grade: "8", minPercentage: 80, maxPercentage: 89, color: "#10b981", description: "Strong performance similar to A*" },
      { grade: "7", minPercentage: 70, maxPercentage: 79, color: "#2563eb", description: "Good performance similar to A grade" },
      { grade: "6", minPercentage: 60, maxPercentage: 69, color: "#3b82f6", description: "Satisfactory performance similar to B grade" },
      { grade: "5", minPercentage: 50, maxPercentage: 59, color: "#16a34a", description: "Acceptable performance similar to C grade" },
      { grade: "4", minPercentage: 40, maxPercentage: 49, color: "#ca8a04", description: "Standard pass similar to C grade" },
      { grade: "3", minPercentage: 30, maxPercentage: 39, color: "#ea580c", description: "Below standard pass similar to D grade" },
      { grade: "2", minPercentage: 20, maxPercentage: 29, color: "#ef4444", description: "Limited achievement similar to E grade" },
      { grade: "1", minPercentage: 0, maxPercentage: 19, color: "#dc2626", description: "Minimal achievement similar to F grade" }
    ]
  },
  percentage: {
    name: "Percentage Only",
    description: "Simple percentage-based grading",
    boundaries: [
      { grade: "90-100%", minPercentage: 90, maxPercentage: 100, color: "#059669", description: "Outstanding achievement" },
      { grade: "80-89%", minPercentage: 80, maxPercentage: 89, color: "#2563eb", description: "Very good achievement" },
      { grade: "70-79%", minPercentage: 70, maxPercentage: 79, color: "#16a34a", description: "Good achievement" },
      { grade: "60-69%", minPercentage: 60, maxPercentage: 69, color: "#ca8a04", description: "Satisfactory achievement" },
      { grade: "Below 60%", minPercentage: 0, maxPercentage: 59, color: "#dc2626", description: "Needs improvement" }
    ]
  }
};
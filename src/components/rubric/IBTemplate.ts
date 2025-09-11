export const ibRubricTemplate = {
  name: "IB Complete Rubric",
  description: "International Baccalaureate assessment rubric with four criteria",
  category: "IB Assessment",
  totalPoints: 32,
  criteria: [
    {
      id: "a",
      title: "Criterion A - Knowledge and Understanding",
      description: "Demonstrate knowledge and understanding of subject-specific content and concepts through descriptions, explanations and examples.",
      levels: [
        {
          id: "a1",
          name: "Level 1-2 (Limited)",
          description: "Demonstrates limited knowledge and understanding of subject-specific content and concepts. Limited knowledge of subject-specific content, basic understanding of concepts, few relevant examples provided.",
          points: 2,
          color: "#FF9800"
        },
        {
          id: "a2",
          name: "Level 3-4 (Adequate)",
          description: "Demonstrates adequate knowledge and understanding of subject-specific content and concepts. Adequate knowledge of subject-specific content, good understanding of concepts, some relevant examples provided.",
          points: 4,
          color: "#FFEB3B"
        },
        {
          id: "a3",
          name: "Level 5-6 (Substantial)",
          description: "Demonstrates substantial knowledge and understanding of subject-specific content and concepts. Substantial knowledge of subject-specific content, thorough understanding of concepts, many relevant examples provided.",
          points: 6,
          color: "#8BC34A"
        },
        {
          id: "a4",
          name: "Level 7-8 (Excellent)",
          description: "Demonstrates excellent knowledge and understanding of subject-specific content and concepts. Excellent knowledge of subject-specific content, deep understanding of concepts, extensive relevant examples provided.",
          points: 8,
          color: "#4CAF50"
        }
      ]
    },
    {
      id: "b",
      title: "Criterion B - Application and Analysis",
      description: "Apply knowledge and understanding to identify, construct and appraise arguments.",
      levels: [
        {
          id: "b1",
          name: "Level 1-2 (Limited)",
          description: "Demonstrates limited application and analysis of knowledge and understanding. Limited application of knowledge, basic analysis of arguments, few connections made.",
          points: 2,
          color: "#FF9800"
        },
        {
          id: "b2",
          name: "Level 3-4 (Adequate)",
          description: "Demonstrates adequate application and analysis of knowledge and understanding. Adequate application of knowledge, good analysis of arguments, some connections made.",
          points: 4,
          color: "#FFEB3B"
        },
        {
          id: "b3",
          name: "Level 5-6 (Substantial)",
          description: "Demonstrates substantial application and analysis of knowledge and understanding. Substantial application of knowledge, thorough analysis of arguments, many connections made.",
          points: 6,
          color: "#8BC34A"
        },
        {
          id: "b4",
          name: "Level 7-8 (Excellent)",
          description: "Demonstrates excellent application and analysis of knowledge and understanding. Excellent application of knowledge, deep analysis of arguments, extensive connections made.",
          points: 8,
          color: "#4CAF50"
        }
      ]
    },
    {
      id: "c",
      title: "Criterion C - Synthesis and Evaluation",
      description: "Synthesize knowledge and understanding in order to make reasoned, substantiated judgments and solve problems.",
      levels: [
        {
          id: "c1",
          name: "Level 1-2 (Limited)",
          description: "Demonstrates limited synthesis and evaluation. Limited synthesis of knowledge, basic evaluation, few reasoned judgments.",
          points: 2,
          color: "#FF9800"
        },
        {
          id: "c2",
          name: "Level 3-4 (Adequate)",
          description: "Demonstrates adequate synthesis and evaluation. Adequate synthesis of knowledge, good evaluation, some reasoned judgments.",
          points: 4,
          color: "#FFEB3B"
        },
        {
          id: "c3",
          name: "Level 5-6 (Substantial)",
          description: "Demonstrates substantial synthesis and evaluation. Substantial synthesis of knowledge, thorough evaluation, many reasoned judgments.",
          points: 6,
          color: "#8BC34A"
        },
        {
          id: "c4",
          name: "Level 7-8 (Excellent)",
          description: "Demonstrates excellent synthesis and evaluation. Excellent synthesis of knowledge, deep evaluation, extensive reasoned judgments.",
          points: 8,
          color: "#4CAF50"
        }
      ]
    },
    {
      id: "d",
      title: "Criterion D - Use and Application of Appropriate Skills",
      description: "Use and apply appropriate skills and techniques.",
      levels: [
        {
          id: "d1",
          name: "Level 1-2 (Limited)",
          description: "Demonstrates limited use and application of appropriate skills and techniques. Limited use of skills, basic application of techniques, few appropriate methods used.",
          points: 2,
          color: "#FF9800"
        },
        {
          id: "d2",
          name: "Level 3-4 (Adequate)",
          description: "Demonstrates adequate use and application of appropriate skills and techniques. Adequate use of skills, good application of techniques, some appropriate methods used.",
          points: 4,
          color: "#FFEB3B"
        },
        {
          id: "d3",
          name: "Level 5-6 (Substantial)",
          description: "Demonstrates substantial use and application of appropriate skills and techniques. Substantial use of skills, thorough application of techniques, many appropriate methods used.",
          points: 6,
          color: "#8BC34A"
        },
        {
          id: "d4",
          name: "Level 7-8 (Excellent)",
          description: "Demonstrates excellent use and application of appropriate skills and techniques. Excellent use of skills, deep application of techniques, extensive appropriate methods used.",
          points: 8,
          color: "#4CAF50"
        }
      ]
    }
  ]
};
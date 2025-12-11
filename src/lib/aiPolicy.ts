// AI Policy Levels Configuration
// Used across assignment creation, editing, and display

export interface AIPolicyLevel {
  level: number;
  titleKey: string;
  descriptionKey: string;
  useCasesKey: string;
  studentResponsibilitiesKey: string;
  disclosureRequirementsKey: string;
  color: string; // Tailwind class
  hexColor: string; // Hex color for dynamic styling
}

// AI Policy levels configuration with translation keys
export const AI_POLICY_LEVELS: AIPolicyLevel[] = [
  {
    level: 0,
    titleKey: 'aiPolicy.level1.title',
    descriptionKey: 'aiPolicy.level1.description',
    useCasesKey: 'aiPolicy.level1.useCases',
    studentResponsibilitiesKey: 'aiPolicy.level1.studentResponsibilities',
    disclosureRequirementsKey: 'aiPolicy.level1.disclosureRequirements',
    color: 'bg-red-500',
    hexColor: '#EF4444'
  },
  {
    level: 1,
    titleKey: 'aiPolicy.level2.title',
    descriptionKey: 'aiPolicy.level2.description',
    useCasesKey: 'aiPolicy.level2.useCases',
    studentResponsibilitiesKey: 'aiPolicy.level2.studentResponsibilities',
    disclosureRequirementsKey: 'aiPolicy.level2.disclosureRequirements',
    color: 'bg-orange-500',
    hexColor: '#F97316'
  },
  {
    level: 2,
    titleKey: 'aiPolicy.level3.title',
    descriptionKey: 'aiPolicy.level3.description',
    useCasesKey: 'aiPolicy.level3.useCases',
    studentResponsibilitiesKey: 'aiPolicy.level3.studentResponsibilities',
    disclosureRequirementsKey: 'aiPolicy.level3.disclosureRequirements',
    color: 'bg-yellow-500',
    hexColor: '#EAB308'
  },
  {
    level: 3,
    titleKey: 'aiPolicy.level4.title',
    descriptionKey: 'aiPolicy.level4.description',
    useCasesKey: 'aiPolicy.level4.useCases',
    studentResponsibilitiesKey: 'aiPolicy.level4.studentResponsibilities',
    disclosureRequirementsKey: 'aiPolicy.level4.disclosureRequirements',
    color: 'bg-green-500',
    hexColor: '#22C55E'
  },
  {
    level: 4,
    titleKey: 'aiPolicy.level5.title',
    descriptionKey: 'aiPolicy.level5.description',
    useCasesKey: 'aiPolicy.level5.useCases',
    studentResponsibilitiesKey: 'aiPolicy.level5.studentResponsibilities',
    disclosureRequirementsKey: 'aiPolicy.level5.disclosureRequirements',
    color: 'bg-green-500',
    hexColor: '#22C55E'
  }
];

// Get AI policy level by number
export function getAIPolicyLevel(level: number): AIPolicyLevel | undefined {
  console.log('getAIPolicyLevel', level);
  console.log('AI_POLICY_LEVELS', AI_POLICY_LEVELS);
  return AI_POLICY_LEVELS.find(p => p.level === level);
}

// Get color class for AI policy level badge
export function getAIPolicyColor(level: number): string {
  switch (level) {
    case 1:
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    case 2:
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    case 3:
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 4:
    case 5:
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

// Get dot color for AI policy level indicator
export function getAIPolicyDotColor(level: number): string {
  switch (level) {
    case 1:
      return 'bg-red-500';
    case 2:
      return 'bg-orange-500';
    case 3:
      return 'bg-yellow-500';
    case 4:
    case 5:
      return 'bg-green-500';
    default:
      return 'bg-muted-foreground';
  }
}

// Short labels for AI policy levels (for badges)
export const AI_POLICY_SHORT_LABELS: Record<number, string> = {
  1: 'No AI',
  2: 'AI Assist',
  3: 'AI Draft',
  4: 'AI Co-Create',
  5: 'AI Full',
};

export const AI_POLICY_DESCRIPTIONS: Record<number, string> = {
  1: 'No AI tools allowed. All work must be entirely your own.',
  2: 'AI can be used for brainstorming and research only. Final work must be written by you.',
  3: 'AI can help draft content, but you must substantially revise and improve it.',
  4: 'Collaborate with AI as a partner. Cite AI contributions and add your own insights.',
  5: 'Full AI assistance allowed. Focus on prompt engineering and critical evaluation.',
};

export function getAIPolicyShortLabel(level: number): string {
  return AI_POLICY_SHORT_LABELS[level] || `Level ${level}`;
}

export function getAIPolicyDescription(level: number): string {
  return AI_POLICY_DESCRIPTIONS[level] || '';
}



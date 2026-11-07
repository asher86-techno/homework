export interface SolutionStep {
  stepNumber: number;
  title: string;
  explanation: string;
  mathFormula?: string;
  result?: string;
}

export interface PracticeProblem {
  question: string;
  hint: string;
  solution: string;
}

export interface HomeworkSolution {
  problemTitle: string;
  subject: string;
  topic: string;
  extractedProblemText: string;
  finalAnswer: string;
  confidence: 'High' | 'Medium' | 'Low' | string;
  stepByStep: SolutionStep[];
  keyConcepts: string[];
  formulasUsed: string[];
  whyItWorks: string;
  commonPitfalls?: string[];
  practiceProblem: PracticeProblem;
  graphableExpression?: string;
}

export interface SolvedProblemHistoryItem {
  id: string;
  timestamp: number;
  thumbnail: string;
  solution: HomeworkSolution;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

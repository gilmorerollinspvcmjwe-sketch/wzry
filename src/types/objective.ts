export type ObjectiveType = 
  | 'ranking'         
  | 'wins'           
  | 'development'    
  | 'financial'      
  | 'reputation'     
  | 'playoff'
  | 'championship'
  | 'fans'
  | 'training';

export type ObjectiveDifficulty = 'easy' | 'medium' | 'hard' | 'legend';

export type ExpectationLevel = 'survival' | 'playoff' | 'championship' | 'dynasty';

export type SeasonEvaluation = 'S' | 'A' | 'B' | 'C' | 'D';

export type ObjectiveCategory = 'primary' | 'secondary' | 'special';

export interface ObjectiveReward {
  funds: number;
  reputation: number;
  fans: number;
  special?: string;
}

export interface ObjectivePenalty {
  funds?: number;
  reputation?: number;
  fans?: number;
  patience?: number;
}

export interface SeasonObjective {
  id: string;
  type: ObjectiveType;
  title: string;
  description: string;
  difficulty: ObjectiveDifficulty;
  category: ObjectiveCategory;
  
  condition: {
    metric: string;
    target: number;
    current: number;
  };
  
  rewards: ObjectiveReward;
  penalty?: ObjectivePenalty;
  
  isPrimary: boolean;
  completed: boolean;
  failed: boolean;
  deadline?: number;
  progress?: number;
}

export interface BoardExpectation {
  expectationLevel: ExpectationLevel;
  primaryObjective: SeasonObjective | null;
  secondaryObjectives: SeasonObjective[];
  specialObjectives: SeasonObjective[];
  
  patience: number;
  lastEvaluationWeek: number;
  
  evaluation: {
    performance: number;
    trend: 'up' | 'stable' | 'down';
    comments: string;
  };
  
  expectations: BoardExpectationItem[];
  evaluations: EvaluationRecord[];
  fireRisk: number;
}

export interface BoardExpectationItem {
  id: string;
  type: ObjectiveType;
  description: string;
  weight: number;
  target: number;
  current: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export interface EvaluationRecord {
  week: number;
  performance: number;
  trend: 'up' | 'stable' | 'down';
  comment: string;
  patienceChange: number;
}

export interface SeasonSummary {
  season: number;
  year: number;
  phase: 'spring' | 'summer';
  
  evaluation: SeasonEvaluation;
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  finalRanking: number;
  
  objectivesCompleted: number;
  totalObjectives: number;
  primaryCompleted: boolean;
  secondaryCompleted: number;
  specialCompleted: number;
  
  rewards: {
    funds: number;
    reputation: number;
    fans: number;
  };
  
  penalty: ObjectivePenalty;
  boardComment: string;
  milestones: MilestoneRecord[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  type: 'achievement' | 'record' | 'special';
  condition: {
    metric: string;
    target: number;
  };
  rewards: ObjectiveReward;
  unlocked: boolean;
  unlockedAt?: number;
  season?: number;
}

export interface MilestoneRecord {
  milestoneId: string;
  title: string;
  unlockedAt: number;
  season: number;
}

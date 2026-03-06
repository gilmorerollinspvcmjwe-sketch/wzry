export type ObjectiveType = 
  | 'ranking'         
  | 'wins'           
  | 'development'    
  | 'financial'      
  | 'reputation'     
  | 'playoff';

export type ObjectiveDifficulty = 'easy' | 'medium' | 'hard' | 'legend';

export type ExpectationLevel = 'survival' | 'playoff' | 'championship' | 'dynasty';

export type SeasonEvaluation = 'S' | 'A' | 'B' | 'C' | 'D';

export interface ObjectiveReward {
  funds: number;
  reputation: number;
  fans: number;
  special?: string;
}

export interface SeasonObjective {
  id: string;
  type: ObjectiveType;
  title: string;
  description: string;
  difficulty: ObjectiveDifficulty;
  
  condition: {
    metric: string;
    target: number;
    current: number;
  };
  
  rewards: ObjectiveReward;
  
  isPrimary: boolean;
  completed: boolean;
  failed: boolean;
}

export interface BoardExpectation {
  expectationLevel: ExpectationLevel;
  primaryObjective: SeasonObjective | null;
  secondaryObjectives: SeasonObjective[];
  
  patience: number;
  lastEvaluationWeek: number;
  
  evaluation: {
    performance: number;
    trend: 'up' | 'stable' | 'down';
    comments: string;
  };
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
  
  rewards: {
    funds: number;
    reputation: number;
    fans: number;
  };
  
  boardComment: string;
}

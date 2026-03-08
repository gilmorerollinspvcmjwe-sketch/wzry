export type RelationshipType = 'friend' | 'rival' | 'mentor' | 'student' | 'neutral' | 'hostile';

export type TeamAtmosphere = 'harmonious' | 'neutral' | 'tense' | 'toxic';

export type RelationshipEventType = 
  | 'match_cooperation'
  | 'match_conflict'
  | 'training_together'
  | 'argument'
  | 'reconciliation'
  | 'celebration'
  | 'competition'
  | 'support'
  | 'betrayal'
  | 'mentorship';

export interface RelationshipHistory {
  date: Date;
  eventType: RelationshipEventType;
  description: string;
  change: number;
}

export interface RelationshipEffect {
  type: 'morale' | 'teamwork' | 'performance' | 'communication' | 'training';
  value: number;
  description: string;
}

export interface PlayerRelationship {
  player1Id: string;
  player2Id: string;
  type: RelationshipType;
  strength: number;
  history: RelationshipHistory[];
  effects: RelationshipEffect[];
  interactionFrequency: number;
  lastInteraction: Date;
}

export interface TeamConflict {
  id: string;
  player1Id: string;
  player2Id: string;
  type: 'personality' | 'position' | 'resource' | 'leadership' | 'performance';
  severity: number;
  description: string;
  status: 'active' | 'resolved' | 'escalating';
  startDate: Date;
  resolution?: string;
}

export interface ChemistryRecommendation {
  type: 'team_building' | 'mediation' | 'role_adjustment' | 'communication' | 'rest';
  priority: 'high' | 'medium' | 'low';
  description: string;
  targetPlayers?: string[];
  expectedImprovement: number;
}

export interface TeamChemistry {
  clubId: string;
  overallChemistry: number;
  relationships: PlayerRelationship[];
  atmosphere: TeamAtmosphere;
  conflicts: TeamConflict[];
  recommendations: ChemistryRecommendation[];
  lastUpdated: Date;
}

export interface RelationshipEvent {
  id: string;
  type: RelationshipEventType;
  player1Id: string;
  player2Id: string;
  description: string;
  impact: {
    relationshipChange: number;
    moraleEffect: number;
    teamworkEffect: number;
  };
  date: Date;
}

export const RELATIONSHIP_TYPE_NAMES: Record<RelationshipType, string> = {
  friend: '好友',
  rival: '竞争对手',
  mentor: '导师',
  student: '学生',
  neutral: '中立',
  hostile: '敌对',
};

export const TEAM_ATMOSPHERE_NAMES: Record<TeamAtmosphere, string> = {
  harmonious: '和谐',
  neutral: '一般',
  tense: '紧张',
  toxic: '有毒',
};

export const RELATIONSHIP_EVENT_NAMES: Record<RelationshipEventType, string> = {
  match_cooperation: '比赛配合',
  match_conflict: '比赛冲突',
  training_together: '一起训练',
  argument: '争吵',
  reconciliation: '和解',
  celebration: '庆祝胜利',
  competition: '竞争',
  support: '互相支持',
  betrayal: '背叛',
  mentorship: '指导',
};

export const CONFLICT_TYPE_NAMES: Record<TeamConflict['type'], string> = {
  personality: '性格不合',
  position: '位置竞争',
  resource: '资源分配',
  leadership: '领导权',
  performance: '表现问题',
};

export const RELATIONSHIP_STRENGTH_RANGE = {
  min: -100,
  max: 100,
  neutral: 0,
} as const;

export const CHEMISTRY_THRESHOLDS = {
  excellent: 80,
  good: 60,
  average: 40,
  poor: 20,
} as const;

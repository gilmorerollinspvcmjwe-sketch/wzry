export type CoachType = 'head' | 'assistant' | 'analyst' | 'psychological' | 'physical';

export type CoachStyle = 'aggressive' | 'defensive' | 'balanced' | 'development';

export interface CoachAbilities {
  tactics: number;
  drafting: number;
  motivation: number;
  development: number;
  analysis: number;
}

export interface CoachSpecialty {
  type: 'hero_pool' | 'position' | 'strategy' | 'mental' | 'physical' | 'youth';
  value: string;
  bonus: number;
}

export interface CoachContract {
  salary: number;
  endDate: Date;
  buyoutClause: number;
}

export interface Coach {
  id: string;
  name: string;
  type: CoachType;
  abilities: CoachAbilities;
  style: CoachStyle;
  specialties: CoachSpecialty[];
  contract: CoachContract;
  experience: number;
  reputation: number;
  achievements: string[];
}

export interface CoachMeeting {
  id: string;
  type: 'tactical' | 'player_review' | 'draft_prep' | 'team_building' | 'performance';
  date: Date;
  attendees: string[];
  topic: string;
  outcomes: MeetingOutcome[];
  moraleChange: number;
}

export interface MeetingOutcome {
  type: 'insight' | 'issue' | 'suggestion' | 'decision';
  description: string;
  impact?: {
    type: 'morale' | 'training' | 'tactics' | 'drafting';
    value: number;
  };
}

export interface CoachingStaff {
  headCoach: Coach | null;
  assistantCoaches: Coach[];
  analysts: Coach[];
  psychologicalCoach: Coach | null;
  physicalCoach: Coach | null;
  chemistry: number;
  meetings: CoachMeeting[];
}

export interface TrainingBonus {
  statType: string;
  bonus: number;
  reason: string;
}

export interface BPBonus {
  phase: 'ban' | 'pick';
  bonus: number;
  heroSuggestions: string[];
}

export const COACH_TYPE_NAMES: Record<CoachType, string> = {
  head: '主教练',
  assistant: '助理教练',
  analyst: '数据分析师',
  psychological: '心理教练',
  physical: '体能教练',
};

export const COACH_STYLE_NAMES: Record<CoachStyle, string> = {
  aggressive: '激进型',
  defensive: '防守型',
  balanced: '均衡型',
  development: '培养型',
};

export const COACH_SPECIALTY_NAMES: Record<CoachSpecialty['type'], string> = {
  hero_pool: '英雄池专精',
  position: '位置专精',
  strategy: '战术专精',
  mental: '心理专精',
  physical: '体能专精',
  youth: '青训专精',
};

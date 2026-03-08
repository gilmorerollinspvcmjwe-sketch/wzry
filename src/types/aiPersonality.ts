import type { Position } from './index';

export type PersonalityType = 'big-spender' | 'youth-factory' | 'traditional' | 'rising-star' | 'survivor';

export type FormationType = 'standard' | 'aggressive' | 'defensive' | 'jungle_core' | 'adc_core' | 'mid_core';

export type TacticalStyle = 'early_aggressive' | 'late_scaling' | 'balanced' | 'poke' | 'teamfight';

export type BanPriority = 'meta' | 'counter' | 'comfort' | 'flexible';

export type PickPriority = 'power' | 'synergy' | 'comfort' | 'counter';

export type DevelopmentFocus = 'mechanics' | 'awareness' | 'teamwork' | 'balanced';

export type RotationPolicy = 'strict' | 'flexible' | 'performance_based';

export type StorylineType = 'dynasty_building' | 'underdog' | 'rebuild' | 'championship_push' | 'financial_crisis';

export type StorylineEvent = {
  id: string;
  type: 'transfer' | 'match' | 'achievement' | 'crisis' | 'milestone';
  description: string;
  date: Date;
  impact: Record<string, number>;
};

export interface TransferPreference {
  preferYoung: boolean;
  preferStar: boolean;
  budgetRatio: number;
  maxSalary: number;
  patience: number;
}

export interface TacticalPreference {
  favoriteFormation: FormationType;
  banPriority: BanPriority;
  pickPriority: PickPriority;
  style: TacticalStyle;
}

export interface CoachingStyle {
  trainingIntensity: 'low' | 'medium' | 'high';
  rotationPolicy: RotationPolicy;
  developmentFocus: DevelopmentFocus;
}

export interface AIBehaviors {
  riskTolerance: number;
  spendingHabits: 'conservative' | 'moderate' | 'aggressive';
  patience: number;
  ambition: number;
}

export interface Storyline {
  type: StorylineType;
  currentChapter: number;
  events: StorylineEvent[];
  startedAt?: Date;
  completedAt?: Date;
}

export interface AIPersonalityProfile {
  clubId: string;
  personality: PersonalityType;
  transferPreference: TransferPreference;
  tacticalPreference: TacticalPreference;
  coachingStyle: CoachingStyle;
  behaviors: AIBehaviors;
  storyline: Storyline;
  createdAt: Date;
  updatedAt: Date;
}

export interface AITransferDecisionResult {
  shouldBid: boolean;
  playerId?: string;
  bidAmount?: number;
  reason: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface AITacticalDecisionResult {
  formation: FormationType;
  style: TacticalStyle;
  banList: string[];
  pickPriority: PickPriority;
  adjustments: string[];
}

export interface AIStorylineUpdate {
  newChapter: number;
  newEvents: StorylineEvent[];
  storylineComplete: boolean;
}

export const PERSONALITY_PRESETS: Record<PersonalityType, Omit<AIPersonalityProfile, 'clubId' | 'createdAt' | 'updatedAt'>> = {
  'big-spender': {
    personality: 'big-spender',
    transferPreference: {
      preferYoung: false,
      preferStar: true,
      budgetRatio: 0.8,
      maxSalary: 200,
      patience: 20,
    },
    tacticalPreference: {
      favoriteFormation: 'adc_core',
      banPriority: 'meta',
      pickPriority: 'power',
      style: 'early_aggressive',
    },
    coachingStyle: {
      trainingIntensity: 'medium',
      rotationPolicy: 'performance_based',
      developmentFocus: 'balanced',
    },
    behaviors: {
      riskTolerance: 85,
      spendingHabits: 'aggressive',
      patience: 25,
      ambition: 95,
    },
    storyline: {
      type: 'championship_push',
      currentChapter: 1,
      events: [],
    },
  },
  'youth-factory': {
    personality: 'youth-factory',
    transferPreference: {
      preferYoung: true,
      preferStar: false,
      budgetRatio: 0.3,
      maxSalary: 80,
      patience: 90,
    },
    tacticalPreference: {
      favoriteFormation: 'mid_core',
      banPriority: 'flexible',
      pickPriority: 'synergy',
      style: 'balanced',
    },
    coachingStyle: {
      trainingIntensity: 'high',
      rotationPolicy: 'flexible',
      developmentFocus: 'mechanics',
    },
    behaviors: {
      riskTolerance: 40,
      spendingHabits: 'conservative',
      patience: 85,
      ambition: 60,
    },
    storyline: {
      type: 'dynasty_building',
      currentChapter: 1,
      events: [],
    },
  },
  'traditional': {
    personality: 'traditional',
    transferPreference: {
      preferYoung: false,
      preferStar: false,
      budgetRatio: 0.5,
      maxSalary: 120,
      patience: 60,
    },
    tacticalPreference: {
      favoriteFormation: 'standard',
      banPriority: 'counter',
      pickPriority: 'comfort',
      style: 'teamfight',
    },
    coachingStyle: {
      trainingIntensity: 'medium',
      rotationPolicy: 'strict',
      developmentFocus: 'teamwork',
    },
    behaviors: {
      riskTolerance: 50,
      spendingHabits: 'moderate',
      patience: 65,
      ambition: 55,
    },
    storyline: {
      type: 'rebuild',
      currentChapter: 1,
      events: [],
    },
  },
  'rising-star': {
    personality: 'rising-star',
    transferPreference: {
      preferYoung: true,
      preferStar: false,
      budgetRatio: 0.4,
      maxSalary: 100,
      patience: 70,
    },
    tacticalPreference: {
      favoriteFormation: 'jungle_core',
      banPriority: 'meta',
      pickPriority: 'synergy',
      style: 'early_aggressive',
    },
    coachingStyle: {
      trainingIntensity: 'high',
      rotationPolicy: 'flexible',
      developmentFocus: 'awareness',
    },
    behaviors: {
      riskTolerance: 65,
      spendingHabits: 'moderate',
      patience: 55,
      ambition: 80,
    },
    storyline: {
      type: 'underdog',
      currentChapter: 1,
      events: [],
    },
  },
  'survivor': {
    personality: 'survivor',
    transferPreference: {
      preferYoung: false,
      preferStar: false,
      budgetRatio: 0.2,
      maxSalary: 60,
      patience: 40,
    },
    tacticalPreference: {
      favoriteFormation: 'defensive',
      banPriority: 'counter',
      pickPriority: 'counter',
      style: 'late_scaling',
    },
    coachingStyle: {
      trainingIntensity: 'low',
      rotationPolicy: 'strict',
      developmentFocus: 'balanced',
    },
    behaviors: {
      riskTolerance: 25,
      spendingHabits: 'conservative',
      patience: 30,
      ambition: 35,
    },
    storyline: {
      type: 'financial_crisis',
      currentChapter: 1,
      events: [],
    },
  },
};

export function getPersonalityPreset(type: PersonalityType): Omit<AIPersonalityProfile, 'clubId' | 'createdAt' | 'updatedAt'> {
  return PERSONALITY_PRESETS[type] || PERSONALITY_PRESETS.traditional;
}

export function generateRandomPersonalityType(): PersonalityType {
  const types: PersonalityType[] = ['big-spender', 'youth-factory', 'traditional', 'rising-star', 'survivor'];
  return types[Math.floor(Math.random() * types.length)]!;
}

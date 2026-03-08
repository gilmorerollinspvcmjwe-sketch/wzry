export const CommercialActivityType = {
  ENDORSEMENT: 'endorsement',
  STREAMING: 'streaming',
  FAN_MEET: 'fan-meet',
  PHOTOSHOOT: 'photoshoot',
  INTERVIEW: 'interview',
} as const;

export type CommercialActivityType = typeof CommercialActivityType[keyof typeof CommercialActivityType];

export const CommercialActivityStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type CommercialActivityStatus = typeof CommercialActivityStatus[keyof typeof CommercialActivityStatus];

export interface CommercialActivitySchedule {
  startDate: Date;
  endDate: Date;
  duration: number;
}

export interface CommercialActivityImpact {
  reputation: number;
  fans: number;
  income: number;
  morale: number;
  mediaExposure: number;
}

export interface CommercialActivityRisk {
  type: 'controversy' | 'injury' | 'reputation_damage' | 'schedule_conflict';
  probability: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface CommercialActivity {
  id: string;
  playerId: string;
  type: CommercialActivityType;
  title: string;
  brand: string;
  brandLogo?: string;
  description: string;
  income: number;
  impact: CommercialActivityImpact;
  risks: CommercialActivityRisk[];
  schedule: CommercialActivitySchedule;
  status: CommercialActivityStatus;
  requirements?: {
    type: 'min_fans' | 'min_reputation' | 'min_ranking' | 'no_controversy';
    value: number | boolean;
    description: string;
  }[];
  createdAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
  controversyHandled?: boolean;
}

export interface EndorsementContract {
  id: string;
  playerId: string;
  brandId: string;
  brandName: string;
  brandLogo?: string;
  type: CommercialActivityType;
  value: number;
  duration: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'terminated';
  totalEarned: number;
  requirements: {
    type: 'appearances' | 'social_posts' | 'exclusivity';
    target: number;
    current: number;
  }[];
  bonuses: {
    condition: string;
    amount: number;
    achieved: boolean;
  }[];
}

export interface PlayerCommercialPreferences {
  preferredBrands: string[];
  avoidedBrands: string[];
  maxActivitiesPerMonth: number;
  minIncomeThreshold: number;
  acceptHighRisk: boolean;
  exclusivityEnabled: boolean;
}

export interface PlayerCommercialProfile {
  playerId: string;
  commercialValue: number;
  marketability: number;
  brandAppeal: number;
  socialInfluence: number;
  activeEndorsements: EndorsementContract[];
  pastEndorsements: EndorsementContract[];
  pendingActivities: CommercialActivity[];
  completedActivities: CommercialActivity[];
  preferences: PlayerCommercialPreferences;
  reputation: {
    overall: number;
    professionalism: number;
    reliability: number;
    controversy: number;
  };
  statistics: {
    totalActivities: number;
    totalIncome: number;
    successfulActivities: number;
    controversyCount: number;
    averageRating: number;
  };
}

export interface CommercialMarketState {
  availableBrands: CommercialBrand[];
  marketTrends: {
    type: CommercialActivityType;
    demand: 'high' | 'medium' | 'low';
    averageValue: number;
  }[];
  seasonality: {
    month: number;
    activityMultiplier: number;
  }[];
}

export interface CommercialBrand {
  id: string;
  name: string;
  logo: string;
  industry: 'gaming' | 'tech' | 'fashion' | 'food' | 'sports' | 'entertainment' | 'other';
  reputation: number;
  budget: 'low' | 'medium' | 'high' | 'premium';
  preferredPlayerTypes: ('star' | 'rising' | 'veteran')[];
  exclusivityRequired: boolean;
  minRequirements: {
    fans?: number;
    reputation?: number;
    ranking?: number;
  };
}

export interface CommercialActivityOffer {
  id: string;
  activity: CommercialActivity;
  brand: CommercialBrand;
  expiresAt: Date;
  isExclusive: boolean;
  competingOffers: number;
  negotiationRoom: number;
}

export interface ControversyEvent {
  id: string;
  activityId: string;
  playerId: string;
  type: 'brand_mismatch' | 'public_backlash' | 'contract_violation' | 'media_scandal';
  severity: 'low' | 'medium' | 'high';
  description: string;
  impact: {
    reputation: number;
    fans: number;
    income: number;
  };
  resolutionOptions: {
    id: string;
    text: string;
    cost: number;
    impactReduction: number;
  }[];
  resolved: boolean;
  resolvedAt?: Date;
}

export const DEFAULT_COMMERCIAL_PREFERENCES: PlayerCommercialPreferences = {
  preferredBrands: [],
  avoidedBrands: [],
  maxActivitiesPerMonth: 3,
  minIncomeThreshold: 10,
  acceptHighRisk: false,
  exclusivityEnabled: true,
};

export const COMMERCIAL_CONFIG = {
  baseActivityChance: 0.15,
  starPlayerBonus: 0.2,
  reputationMultiplier: 0.01,
  maxPendingActivities: 5,
  activityExpirationDays: 7,
  controversyBaseChance: 0.05,
  highRiskControversyMultiplier: 2.0,
};

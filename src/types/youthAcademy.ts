import type { Position, PlayerStats, PlayerCondition, Contract, Trait, GrowthRecord } from '@/types';

export type YouthCoachSpecialty = 'training' | 'tactics' | 'mental' | 'physical' | 'hero_pool' | 'position';

export type YouthCoachStyle = 'strict' | 'encouraging' | 'balanced' | 'innovative';

export interface YouthCoachBonus {
  type: 'training_speed' | 'potential_growth' | 'morale' | 'hero_pool' | 'position_mastery';
  value: number;
}

export interface YouthCoach {
  id: string;
  name: string;
  specialty: YouthCoachSpecialty;
  level: number;
  bonuses: YouthCoachBonus[];
  style: YouthCoachStyle;
  salary: number;
  experience: number;
  reputation: number;
  positionFocus?: Position;
}

export interface YouthFacilityLevel {
  level: number;
  name: string;
  description: string;
  upgradeCost: number;
  benefits: {
    type: string;
    value: number;
  }[];
}

export interface YouthFacility {
  trainingGround: number;
  dormitory: number;
  medicalCenter: number;
  analysisRoom: number;
}

export interface YouthPlayerStats extends PlayerStats {
  potential: number;
  growthRate: number;
  trainingProgress: number;
}

export interface YouthPlayerCondition extends PlayerCondition {
  happiness: number;
  development: number;
}

export interface YouthPlayer {
  id: string;
  name: string;
  nickname?: string;
  avatar: string;
  age: number;
  position: Position;
  secondaryPositions: Position[];
  nationality: string;
  gender: 'male' | 'female';
  
  stats: YouthPlayerStats;
  condition: YouthPlayerCondition;
  
  potential: number;
  growthRate: number;
  trainingProgress: number;
  
  positionMastery: Record<Position, number>;
  traits: Trait[];
  growthHistory: GrowthRecord[];
  
  joinDate: Date;
  academyYears: number;
  contract: Contract;
  
  heroPreference: {
    preferredRoles: string[];
    favoriteHeroes: string[];
  };
  
  status: 'training' | 'injured' | 'loaned' | 'promoted';
  loanInfo?: Loan;
}

export interface LoanClause {
  type: 'buy_option' | 'buy_obligation' | 'recall_clause' | 'play_time_guarantee';
  value?: number;
  description: string;
}

export interface LoanReport {
  date: Date;
  rating: number;
  performance: string;
  development: number;
  recommendation: 'extend' | 'recall' | 'promote' | 'release';
}

export interface Loan {
  id: string;
  playerId: string;
  playerName: string;
  toClub: string;
  toClubId: string;
  startDate: Date;
  endDate: Date;
  fee: number;
  clauses: LoanClause[];
  reports: LoanReport[];
  status: 'active' | 'completed' | 'recalled';
}

export interface YouthLeagueMatch {
  id: string;
  date: Date;
  homeClubId: string;
  awayClubId: string;
  homeScore?: number;
  awayScore?: number;
  result?: 'win' | 'loss' | 'draw';
  played: boolean;
}

export interface YouthLeagueStanding {
  clubId: string;
  clubName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface YouthLeague {
  id: string;
  name: string;
  season: number;
  startDate: Date;
  endDate: Date;
  participants: string[];
  matches: YouthLeagueMatch[];
  standings: YouthLeagueStanding[];
  status: 'upcoming' | 'ongoing' | 'completed';
  champion?: string;
}

export interface YouthAcademy {
  clubId: string;
  level: number;
  reputation: number;
  
  coaches: YouthCoach[];
  facilities: YouthFacility;
  players: YouthPlayer[];
  
  league: YouthLeague | null;
  loans: Loan[];
  
  budget: number;
  weeklyCost: number;
  
  stats: {
    totalGraduates: number;
    activeInFirstTeam: number;
    totalSold: number;
    totalRevenue: number;
    averageRating: number;
  };
  
  trainingPrograms: TrainingProgram[];
}

export interface TrainingProgram {
  id: string;
  name: string;
  type: 'mechanics' | 'awareness' | 'mentality' | 'teamwork' | 'hero_pool' | 'physical';
  intensity: 'light' | 'normal' | 'intense';
  focus: Position | 'all';
  participants: string[];
  startDate: Date;
  duration: number;
  bonuses: {
    statType: string;
    bonus: number;
  }[];
}

export const YOUTH_COACH_SPECIALTY_NAMES: Record<YouthCoachSpecialty, string> = {
  training: '训练专精',
  tactics: '战术专精',
  mental: '心理专精',
  physical: '体能专精',
  hero_pool: '英雄池专精',
  position: '位置专精',
};

export const YOUTH_COACH_STYLE_NAMES: Record<YouthCoachStyle, string> = {
  strict: '严格型',
  encouraging: '鼓励型',
  balanced: '均衡型',
  innovative: '创新型',
};

export const FACILITY_NAMES: Record<keyof YouthFacility, string> = {
  trainingGround: '训练场',
  dormitory: '宿舍',
  medicalCenter: '医疗中心',
  analysisRoom: '分析室',
};

export const FACILITY_LEVELS: YouthFacilityLevel[] = [
  { level: 1, name: '基础', description: '基础设施', upgradeCost: 0, benefits: [] },
  { level: 2, name: '标准', description: '标准设施', upgradeCost: 500, benefits: [{ type: 'training_speed', value: 5 }] },
  { level: 3, name: '良好', description: '良好设施', upgradeCost: 1000, benefits: [{ type: 'training_speed', value: 10 }] },
  { level: 4, name: '优秀', description: '优秀设施', upgradeCost: 2000, benefits: [{ type: 'training_speed', value: 15 }] },
  { level: 5, name: '顶级', description: '顶级设施', upgradeCost: 5000, benefits: [{ type: 'training_speed', value: 25 }] },
];

export const YOUTH_PLAYER_STATUS_NAMES: Record<YouthPlayer['status'], string> = {
  training: '训练中',
  injured: '受伤',
  loaned: '外租',
  promoted: '已提拔',
};

export type FormationType = 'four-protect-one' | 'jungle-core' | 'dual-carry' | 'mid-jungle' | 'global';

export type TacticalStyle = 'aggressive' | 'defensive' | 'balanced' | 'teamfight' | 'split';

export type PacePreference = 'early-game' | 'mid-game' | 'late-game';

export interface InGameCommand {
  id: string;
  name: string;
  description: string;
  triggerCondition: string;
  effect: {
    type: 'morale' | 'coordination' | 'focus' | 'adaptation';
    value: number;
  };
  cooldown: number;
  lastUsed?: Date;
}

export interface BPStrategy {
  priorityHeroes: string[];
  banTargets: string[];
  counterPicks: Record<string, string[]>;
  flexPicks: string[];
  reserveStrategy: string[];
}

export interface Tactics {
  id: string;
  clubId: string;
  formation: FormationType;
  style: TacticalStyle;
  pace: PacePreference;
  corePlayer: string | null;
  bpStrategy: BPStrategy;
  inGameCommands: InGameCommand[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MetaHero {
  heroId: string;
  heroName: string;
  tier: 'S' | 'A' | 'B' | 'C';
  winRate: number;
  pickRate: number;
  banRate: number;
  positions: string[];
}

export interface MetaComposition {
  id: string;
  name: string;
  description: string;
  heroes: string[];
  winRate: number;
  counterBy: string[];
  strongAgainst: string[];
}

export interface VersionBonuses {
  heroMastery: number;
  compositionBonus: number;
  counterBonus: number;
  adaptationBonus: number;
}

export interface VersionUnderstanding {
  currentVersion: string;
  understandingLevel: number;
  metaHeroes: MetaHero[];
  metaCompositions: MetaComposition[];
  bonuses: VersionBonuses;
  lastUpdated: Date;
  researchProgress: number;
}

export interface TacticalAnalysis {
  opponentFormation: FormationType | null;
  opponentStyle: TacticalStyle | null;
  predictedCorePlayer: string | null;
  predictedPicks: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface BPRecommendation {
  phase: 'ban' | 'pick';
  priority: 'high' | 'medium' | 'low';
  heroId: string;
  heroName: string;
  reason: string;
  expectedWinRate: number;
  counterOptions: string[];
}

export const FORMATION_NAMES: Record<FormationType, string> = {
  'four-protect-one': '四保一',
  'jungle-core': '野核体系',
  'dual-carry': '双核体系',
  'mid-jungle': '中野联动',
  'global': '全球流',
};

export const FORMATION_DESCRIPTIONS: Record<FormationType, string> = {
  'four-protect-one': '以ADC为核心，全队资源倾斜，后期团战制胜',
  'jungle-core': '打野作为核心，前期节奏带动全场',
  'dual-carry': '双C位共同承担输出，容错率更高',
  'mid-jungle': '中野联动，前期节奏压制，滚雪球取胜',
  'global': '全图支援，分带牵制，多线作战',
};

export const TACTICAL_STYLE_NAMES: Record<TacticalStyle, string> = {
  aggressive: '激进型',
  defensive: '防守型',
  balanced: '均衡型',
  teamfight: '团战型',
  split: '分带型',
};

export const TACTICAL_STYLE_DESCRIPTIONS: Record<TacticalStyle, string> = {
  aggressive: '主动出击，压制对手，前期建立优势',
  defensive: '稳健运营，等待机会，后期发力',
  balanced: '攻守兼备，根据局势灵活调整',
  teamfight: '注重团战配合，5v5正面作战能力强',
  split: '分带牵制，多线施压，分散对手注意力',
};

export const PACE_NAMES: Record<PacePreference, string> = {
  'early-game': '前期节奏',
  'mid-game': '中期节奏',
  'late-game': '后期节奏',
};

export const PACE_DESCRIPTIONS: Record<PacePreference, string> = {
  'early-game': '前期强势，快速结束比赛',
  'mid-game': '中期发力，把握关键节奏点',
  'late-game': '后期决胜，稳健发育等待时机',
};

export const FORMATION_BONUSES: Record<FormationType, Record<string, number>> = {
  'four-protect-one': {
    lateGame: 15,
    teamfight: 10,
    coordination: 8,
  },
  'jungle-core': {
    earlyGame: 15,
    objectiveControl: 12,
    snowball: 10,
  },
  'dual-carry': {
    consistency: 12,
    teamfight: 8,
    adaptation: 6,
  },
  'mid-jungle': {
    earlyGame: 12,
    snowball: 15,
    coordination: 10,
  },
  'global': {
    mapControl: 15,
    splitPush: 12,
    adaptation: 8,
  },
};

export const STYLE_BONUSES: Record<TacticalStyle, Record<string, number>> = {
  aggressive: {
    earlyGame: 10,
    pressure: 15,
    risk: 5,
  },
  defensive: {
    lateGame: 10,
    stability: 15,
    counterAttack: 8,
  },
  balanced: {
    adaptation: 10,
    consistency: 8,
    flexibility: 12,
  },
  teamfight: {
    teamfight: 15,
    coordination: 12,
    focus: 8,
  },
  split: {
    mapControl: 12,
    objectiveControl: 10,
    distraction: 15,
  },
};

export const DEFAULT_BP_STRATEGY: BPStrategy = {
  priorityHeroes: [],
  banTargets: [],
  counterPicks: {},
  flexPicks: [],
  reserveStrategy: [],
};

export const DEFAULT_IN_GAME_COMMANDS: InGameCommand[] = [
  {
    id: 'cmd_rush',
    name: '强开团',
    description: '主动发起团战，提升团队士气',
    triggerCondition: '敌方站位分散时',
    effect: { type: 'morale', value: 10 },
    cooldown: 3,
  },
  {
    id: 'cmd_retreat',
    name: '战术撤退',
    description: '有序撤退，保存实力',
    triggerCondition: '局势不利时',
    effect: { type: 'focus', value: 8 },
    cooldown: 2,
  },
  {
    id: 'cmd_focus',
    name: '集火指令',
    description: '集中火力攻击关键目标',
    triggerCondition: '敌方核心暴露时',
    effect: { type: 'coordination', value: 12 },
    cooldown: 2,
  },
  {
    id: 'cmd_split',
    name: '分带指令',
    description: '分散推进，牵制对手',
    triggerCondition: '拥有兵线优势时',
    effect: { type: 'adaptation', value: 10 },
    cooldown: 3,
  },
  {
    id: 'cmd_objective',
    name: '资源争夺',
    description: '集中争夺龙/主宰等关键资源',
    triggerCondition: '资源刷新时',
    effect: { type: 'coordination', value: 15 },
    cooldown: 4,
  },
];

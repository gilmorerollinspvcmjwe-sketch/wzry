export type ChangeType = 'buff' | 'nerf' | 'rework' | 'new';

export type MetaType = 'early-game' | 'mid-game' | 'late-game' | 'teamfight' | 'split';

export type DominantRole = 'tank' | 'fighter' | 'assassin' | 'mage' | 'marksman' | 'support';

export interface HeroChange {
  heroId: string;
  heroName: string;
  changeType: ChangeType;
  tierChange: {
    from: number;
    to: number;
  };
  description: string;
  details: string[];
}

export interface ItemChange {
  itemId: string;
  itemName: string;
  changeType: 'buff' | 'nerf' | 'adjustment';
  description: string;
}

export interface MechanicChange {
  name: string;
  description: string;
  impact: 'major' | 'minor';
}

export interface VersionCharacteristics {
  pace: 'fast' | 'normal' | 'slow';
  meta: MetaType;
  dominantRoles: DominantRole[];
  description: string;
}

export interface GameVersion {
  version: string;
  releaseDate: Date;
  heroChanges: HeroChange[];
  itemChanges: ItemChange[];
  mechanicChanges: MechanicChange[];
  characteristics: VersionCharacteristics;
  patchNotes: string;
}

export interface VersionAdaptation {
  clubId: string;
  currentVersion: string;
  adaptationLevel: number;
  knownMetaHeroes: string[];
  knownCompositions: string[];
  researchInvestment: number;
  bonuses: VersionAdaptationBonus;
  lastResearchDate: Date | null;
  researchProgress: number;
}

export interface VersionAdaptationBonus {
  heroMastery: number;
  compositionBonus: number;
  counterBonus: number;
  adaptationBonus: number;
  bpInsight: number;
}

export interface VersionResearch {
  id: string;
  clubId: string;
  version: string;
  investment: number;
  progress: number;
  startDate: Date;
  completedDate: Date | null;
  findings: ResearchFinding[];
}

export interface ResearchFinding {
  type: 'hero' | 'composition' | 'counter' | 'mechanic';
  targetId: string;
  targetName: string;
  insight: string;
  value: number;
}

export interface VersionUpdateNotification {
  version: GameVersion;
  showAt: Date;
  isRead: boolean;
  highlights: string[];
}

export const CHANGE_TYPE_NAMES: Record<ChangeType, string> = {
  buff: '加强',
  nerf: '削弱',
  rework: '重做',
  new: '新增',
};

export const CHANGE_TYPE_COLORS: Record<ChangeType, string> = {
  buff: '#52c41a',
  nerf: '#ff4d4f',
  rework: '#722ed1',
  new: '#1890ff',
};

export const META_TYPE_NAMES: Record<MetaType, string> = {
  'early-game': '前期节奏',
  'mid-game': '中期节奏',
  'late-game': '后期节奏',
  'teamfight': '团战',
  'split': '分带',
};

export const PACE_NAMES: Record<'fast' | 'normal' | 'slow', string> = {
  fast: '快节奏',
  normal: '正常节奏',
  slow: '慢节奏',
};

export const DOMINANT_ROLE_NAMES: Record<DominantRole, string> = {
  tank: '坦克',
  fighter: '战士',
  assassin: '刺客',
  mage: '法师',
  marksman: '射手',
  support: '辅助',
};

export const DEFAULT_VERSION_CHARACTERISTICS: VersionCharacteristics = {
  pace: 'normal',
  meta: 'mid-game',
  dominantRoles: ['mage', 'marksman'],
  description: '均衡版本',
};

export const DEFAULT_VERSION_ADAPTATION_BONUS: VersionAdaptationBonus = {
  heroMastery: 0,
  compositionBonus: 0,
  counterBonus: 0,
  adaptationBonus: 0,
  bpInsight: 0,
};

export function createDefaultVersionAdaptation(clubId: string): VersionAdaptation {
  return {
    clubId,
    currentVersion: '1.0.0',
    adaptationLevel: 0,
    knownMetaHeroes: [],
    knownCompositions: [],
    researchInvestment: 0,
    bonuses: { ...DEFAULT_VERSION_ADAPTATION_BONUS },
    lastResearchDate: null,
    researchProgress: 0,
  };
}

export function calculateAdaptationBonuses(adaptationLevel: number): VersionAdaptationBonus {
  const level = Math.min(100, Math.max(0, adaptationLevel));
  return {
    heroMastery: level * 0.2,
    compositionBonus: level * 0.15,
    counterBonus: level * 0.12,
    adaptationBonus: level * 0.08,
    bpInsight: level * 0.1,
  };
}

export function getTierChangeDescription(from: number, to: number): string {
  if (from === to) return '强度不变';
  if (to < from) return `T${from} → T${to} (加强)`;
  return `T${from} → T${to} (削弱)`;
}

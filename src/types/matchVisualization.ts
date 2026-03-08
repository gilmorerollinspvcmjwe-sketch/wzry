export interface Position2D {
  x: number;
  y: number;
}

export interface MinimapPlayer {
  playerId: string;
  playerName: string;
  team: 'blue' | 'red';
  position: Position2D;
  heroId: string;
  heroName: string;
  isAlive: boolean;
  health: number;
}

export interface MinimapObjective {
  id: string;
  type: 'dragon' | 'baron' | 'tower' | 'inhibitor';
  position: Position2D;
  status: 'alive' | 'dead' | 'contested';
  team?: 'blue' | 'red';
}

export interface MinimapData {
  timestamp: number;
  players: MinimapPlayer[];
  objectives: MinimapObjective[];
  events: MinimapEvent[];
}

export interface MinimapEvent {
  id: string;
  type: 'kill' | 'assist' | 'objective' | 'teamfight';
  position: Position2D;
  timestamp: number;
  description: string;
  involvedPlayers: string[];
}

export interface GoldCurve {
  minute: number;
  blue: number;
  red: number;
  difference: number;
}

export interface PlayerLiveStats {
  playerId: string;
  playerName: string;
  team: 'blue' | 'red';
  position: string;
  heroId: string;
  heroName: string;
  kills: number;
  deaths: number;
  assists: number;
  gold: number;
  damage: number;
  cs: number;
  level: number;
  items: string[];
  killParticipation: number;
  damagePerGold: number;
}

export interface TeamLiveStats {
  team: 'blue' | 'red';
  totalKills: number;
  totalDeaths: number;
  totalGold: number;
  totalDamage: number;
  towers: number;
  dragons: number;
  barons: number;
  inhibitors: number;
  visionScore: number;
}

export interface LiveStats {
  timestamp: number;
  blueTeam: TeamLiveStats;
  redTeam: TeamLiveStats;
  players: PlayerLiveStats[];
}

export interface HeatmapPoint {
  x: number;
  y: number;
  intensity: number;
  eventType: 'kill' | 'death' | 'assist' | 'damage' | 'vision';
}

export interface PlayerHeatmap {
  playerId: string;
  playerName: string;
  points: HeatmapPoint[];
  totalEvents: number;
  hotZones: HeatmapZone[];
}

export interface HeatmapZone {
  name: string;
  x: number;
  y: number;
  radius: number;
  eventCount: number;
  description: string;
}

export interface DamageBreakdown {
  playerId: string;
  playerName: string;
  heroName: string;
  totalDamage: number;
  physicalDamage: number;
  magicDamage: number;
  trueDamage: number;
  damageToChampions: number;
  damageToObjectives: number;
  damageTaken: number;
  damageMitigated: number;
}

export interface VisionControl {
  playerId: string;
  playerName: string;
  wardsPlaced: number;
  wardsKilled: number;
  controlWardsBought: number;
  visionScore: number;
  detectedEnemies: number;
  mapCoverage: number;
}

export interface KeyFight {
  id: string;
  timestamp: number;
  duration: number;
  location: Position2D;
  participants: {
    blue: string[];
    red: string[];
  };
  result: 'blue' | 'red';
  kills: {
    blue: number;
    red: number;
  };
  goldSwing: number;
  description: string;
  impact: 'minor' | 'moderate' | 'major' | 'decisive';
}

export interface PostMatchAnalysis {
  heatmaps: PlayerHeatmap[];
  damageBreakdown: DamageBreakdown[];
  visionControl: VisionControl[];
  keyFights: KeyFight[];
  mvp: PlayerLiveStats | null;
  turningPoints: TurningPoint[];
  teamComparison: TeamComparison;
}

export interface TurningPoint {
  timestamp: number;
  type: 'objective' | 'teamfight' | 'pick' | 'baron' | 'dragon';
  description: string;
  goldSwing: number;
  momentumShift: number;
}

export interface TeamComparison {
  blue: TeamAnalysisMetrics;
  red: TeamAnalysisMetrics;
}

export interface TeamAnalysisMetrics {
  earlyGame: number;
  midGame: number;
  lateGame: number;
  teamfight: number;
  objectiveControl: number;
  visionControl: number;
  snowball: number;
  comeback: number;
}

export interface MatchVisualization {
  matchId: string;
  minimap: MinimapData[];
  goldCurve: GoldCurve[];
  liveStats: LiveStats[];
  postMatch: PostMatchAnalysis;
  duration: number;
  winner: 'blue' | 'red';
}

export const POSITION_NAMES: Record<string, string> = {
  top: '上单',
  jungle: '打野',
  mid: '中单',
  adc: '射手',
  support: '辅助',
};

export const OBJECTIVE_NAMES: Record<string, string> = {
  dragon: '小龙',
  baron: '大龙',
  tower: '防御塔',
  inhibitor: '水晶',
};

export const IMPACT_NAMES: Record<string, string> = {
  minor: '影响较小',
  moderate: '中等影响',
  major: '重大影响',
  decisive: '决定性',
};

export const EVENT_TYPE_NAMES: Record<string, string> = {
  kill: '击杀',
  death: '死亡',
  assist: '助攻',
  damage: '伤害',
  vision: '视野',
  objective: '资源',
  teamfight: '团战',
  pick: '抓人',
  baron: '大龙',
  dragon: '小龙',
};

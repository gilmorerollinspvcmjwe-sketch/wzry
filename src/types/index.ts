// 位置定义
export type Position = 'top' | 'jungle' | 'mid' | 'adc' | 'support';

// 英雄定位
export type HeroRole = 'tank' | 'fighter' | 'assassin' | 'mage' | 'marksman' | 'support';

// 战术风格
export type Strategy = 'balanced' | 'offensive' | 'defensive' | 'jungle_core' | 'adc_core' | 'mid_core';

// 比赛结果
export type MatchResult = 'win' | 'loss' | 'draw' | 'pending';

// 赛事类型
export type TournamentType = 'spring' | 'autumn' | 'playoff' | 'finals' | 'worlds';

// 赛事状态
export type TournamentStatus = 'upcoming' | 'ongoing' | 'completed';

// 分组
export type Group = 'S' | 'A' | 'B';

// 难度
export type Difficulty = 'easy' | 'normal' | 'hard';

// 游戏状态
export type GameState = 'menu' | 'playing' | 'paused' | 'ended';

// 事件类型
export type EventType = 'player' | 'club' | 'league' | 'special';

// 特质类型
export interface Trait {
  id: string;
  name: string;
  description: string;
  type: 'positive' | 'negative' | 'special';
  effects: Record<string, number>;
}

// 赞助商
export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  weeklyPayment: number;
  bonus: number;
  requirements: {
    type: 'win_rate' | 'ranking' | 'fans';
    target: number;
  }[];
}

// 设施
export interface Facilities {
  training: number;
  medical: number;
  analysis: number;
  youth: number;
}

// 俱乐部历史
export interface ClubHistory {
  championships: number;
  playoffAppearances: number;
  totalMatches: number;
  wins: number;
}

// 合同
export interface Contract {
  salary: number;
  endDate: Date;
  buyoutClause: number;
}

// 选手状态
export interface PlayerCondition {
  stamina: number;
  mentality: number;
  injury: number;
  morale: number;
}

// 选手属性
export interface PlayerStats {
  mechanics: number;
  awareness: number;
  mentality: number;
  teamwork: number;
  heroPool: number;
}

// 成长记录
export interface GrowthRecord {
  date: Date;
  statType: keyof PlayerStats;
  oldValue: number;
  newValue: number;
  reason: string;
}

// 比赛选手数据
export interface MatchPlayer {
  playerId: string;
  heroId: string;
  stats: {
    kills: number;
    deaths: number;
    assists: number;
    gold: number;
    damage: number;
  };
}

// 比赛统计
export interface MatchStats {
  duration: number;
  totalKills: number;
  totalGold: number;
  firstBlood: string;
  firstTower: string;
  firstDragon: string;
}

// 精彩时刻
export interface Highlight {
  time: number;
  type: 'kill' | 'teamfight' | 'objective' | 'highlight';
  description: string;
  playerId?: string;
}

// 奖励
export interface Reward {
  money: number;
  reputation: number;
  fans: number;
}

// 事件效果
export interface Effect {
  type: 'funds' | 'reputation' | 'fans' | 'player_stat' | 'condition' | 'facility';
  target?: string;
  value: number;
  duration?: number;
}

// 事件条件
export interface Condition {
  type: 'club_reputation' | 'club_fans' | 'player_stat' | 'match_result' | 'date';
  operator: '>' | '<' | '=' | '>=' | '<=';
  value: number | string;
}

// 事件选择
export interface EventChoice {
  text: string;
  effects: Effect[];
  requirements?: Requirement[];
}

// 需求
export interface Requirement {
  type: 'funds' | 'reputation' | 'player';
  value: number | string;
}

// 游戏事件
export interface GameEvent {
  id: string;
  type: EventType;
  category: string;
  trigger: {
    probability: number;
    conditions: Condition[];
  };
  title: string;
  description: string;
  choices?: EventChoice[];
  effects: Effect[];
  triggerAt?: Date;
  expiresAt?: Date;
}

// 策略加成
export interface StrategyBonus {
  offense: number;
  defense: number;
  lateGame: number;
}

// 战术策略
export interface StrategyInfo {
  id: string;
  name: string;
  description: string;
  offense: number;
  defense: number;
  earlyGame: number;
  lateGame: number;
}

export * from './aiPersonality';
export * from './homeVenue';
export * from './youthAcademy';
export * from './finance';
export * from './version';
export * from './transferWindow';
export * from './storyline';
export * from './retirement';
export * from './commercial';
export * from './coach';
export * from './tactics';
export * from './relationship';
export * from './leagueEcosystem';
export * from './matchVisualization';

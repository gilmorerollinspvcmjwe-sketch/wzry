// 趣味比赛战报系统类型定义

// 比赛战报
export interface BattleReport {
  preMatch: PreMatchAnalysis;
  earlyGame: GamePhaseReport;
  midGame: GamePhaseReport;
  lateGame: GamePhaseReport;
  conclusion: MatchConclusion;
}

// 赛前分析
export interface PreMatchAnalysis {
  summary: string[];
  keyMatchups: KeyMatchup[];
  predictions: string;
}

export interface KeyMatchup {
  position: string;
  homePlayer: string;
  awayPlayer: string;
  homeStat: number;
  awayStat: number;
  prediction: string;
}

// 阶段战报
export interface GamePhaseReport {
  phase: 'early' | 'mid' | 'late';
  duration: number;
  narrative: string[];
  keyEvents: BattleEvent[];
  phaseStats: PhaseStats;
}

export interface PhaseStats {
  homeKills: number;
  awayKills: number;
  homeGold: number;
  awayGold: number;
  homeTowers: number;
  awayTowers: number;
}

// 战报事件
export interface BattleEvent {
  time: number;
  type: BattleEventType;
  title: string;
  description: string;
  highlight: string;
  statBreakdown: StatBreakdown[];
  winner: 'home' | 'away';
  goldSwing: number;
  momentumShift: number;
}

export type BattleEventType = 
  | 'solo_kill' 
  | 'gank' 
  | 'teamfight' 
  | 'objective' 
  | 'turnaround'
  | 'first_blood'
  | 'dragon'
  | 'baron';

// 数值分析
export interface StatBreakdown {
  player: string;
  relevantStat: string;
  statValue: number;
  impact: string;
  rollResult: number;
}

// 赛后总结
export interface MatchConclusion {
  winner: string;
  score: string;
  duration: string;
  highlights: string[];
  analysis: string;
}

// 选手表现
export interface PlayerPerformance {
  playerId: string;
  playerName: string;
  position: string;
  kills: number;
  deaths: number;
  assists: number;
  gold: number;
  damage: number;
  rating: number;
  description: string;
  impact: string;
}

// 详细比赛数据
export interface DetailedMatch {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  result: MatchResult;
  battleReport: BattleReport;
  playerPerformances: PlayerPerformance[];
  mvp: PlayerPerformance;
}

export interface MatchResult {
  winner: 'home' | 'away';
  homeScore: number;
  awayScore: number;
  duration: number;
}

// 比赛状态（用于模拟过程）
export interface GameState {
  currentTime: number;
  homeMomentum: number;
  awayMomentum: number;
  homeGold: number;
  awayGold: number;
  homeKills: number;
  awayKills: number;
  eventHistory: BattleEvent[];
}

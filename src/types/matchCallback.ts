// 比赛回调类型定义

import type { Match } from '@/core/models/Match';
import type { Player } from '@/core/models/Player';

export type MatchResultCallback = (match: Match, context: MatchContext) => void | Promise<void>;

export interface MatchContext {
  isPlayerMatch: boolean;
  playerWon: boolean;
  playerClubId: string;
  week: number;
  season: number;
}

export interface PlayerMatchData {
  player: Player;
  kills: number;
  deaths: number;
  assists: number;
  heroId: string;
  heroName: string;
  mvp: boolean;
}

export interface CallbackPriority {
  HIGH: number;
  NORMAL: number;
  LOW: number;
}

export const PRIORITY: CallbackPriority = {
  HIGH: 100,
  NORMAL: 50,
  LOW: 10,
};

export interface CallbackRegistration {
  id: string;
  name: string;
  callback: MatchResultCallback;
  priority: number;
  enabled: boolean;
}

export type EventType = 
  | 'match_end'
  | 'player_performance'
  | 'achievement_check'
  | 'objective_update'
  | 'media_update'
  | 'statistics_update';

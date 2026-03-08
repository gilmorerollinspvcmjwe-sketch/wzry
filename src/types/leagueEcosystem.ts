// 联赛生态系统类型定义

import type { LeagueSeason, TeamStanding, PlayoffBracket } from './league';

export type LeagueType = 'professional' | 'developmental' | 'amateur';
export type CupType = 'national' | 'regional' | 'invitational';
export type InternationalEventType = 'worlds' | 'continental' | 'friendly';
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
export type QualificationType = 'direct' | 'regional_qualifier' | 'wildcard';

export interface LeagueEcosystem {
  currentSeason: SeasonInfo;
  leagues: League[];
  cups: Cup[];
  internationalEvents: InternationalEvent[];
  developmentalLeagues: DevelopmentalLeague[];
}

export interface SeasonInfo {
  year: number;
  season: 'spring' | 'summer';
  startDate: Date;
  endDate: Date;
  phase: 'preparing' | 'regular' | 'playoff' | 'offseason';
}

export interface League {
  id: string;
  name: string;
  type: LeagueType;
  tier: number;
  schedule: LeagueSchedule;
  standings: TeamStanding[];
  playoffs?: PlayoffBracket;
  prizes: PrizePool;
  relegationZone: number;
  promotionZone: number;
  status: EventStatus;
}

export interface LeagueSchedule {
  rounds: ScheduleRound[];
  currentRound: number;
  totalRounds: number;
}

export interface ScheduleRound {
  round: number;
  matches: LeagueMatchInfo[];
  startDate: Date;
  endDate: Date;
}

export interface LeagueMatchInfo {
  id: string;
  homeTeamId: string;
  homeTeamName: string;
  awayTeamId: string;
  awayTeamName: string;
  scheduledDate: Date;
  isFinished: boolean;
  homeScore?: number;
  awayScore?: number;
  winnerId?: string;
}

export interface Cup {
  id: string;
  name: string;
  type: CupType;
  format: CupFormat;
  participants: CupParticipant[];
  bracket: CupBracket;
  prizes: PrizePool;
  status: EventStatus;
  startDate: Date;
  endDate: Date;
}

export interface CupFormat {
  type: 'single_elimination' | 'double_elimination' | 'group_knockout';
  rounds: number;
  matchFormat: 'bo1' | 'bo3' | 'bo5';
  thirdPlaceMatch: boolean;
}

export interface CupParticipant {
  clubId: string;
  clubName: string;
  seed: number;
  eliminated: boolean;
  finalRank?: number;
}

export interface CupBracket {
  rounds: CupRound[];
  currentRound: number;
}

export interface CupRound {
  round: number;
  name: string;
  matches: CupMatch[];
}

export interface CupMatch {
  id: string;
  round: number;
  homeTeamId?: string;
  homeTeamName?: string;
  awayTeamId?: string;
  awayTeamName?: string;
  isFinished: boolean;
  homeWins?: number;
  awayWins?: number;
  winnerId?: string;
  games: CupGame[];
}

export interface CupGame {
  id: string;
  gameNumber: number;
  homeScore?: number;
  awayScore?: number;
  winnerId?: string;
  mvpId?: string;
}

export interface InternationalEvent {
  id: string;
  name: string;
  type: InternationalEventType;
  qualification: QualificationRule[];
  schedule: InternationalSchedule;
  prizes: PrizePool;
  status: EventStatus;
  startDate: Date;
  endDate: Date;
  hostRegion: string;
}

export interface QualificationRule {
  region: string;
  slots: number;
  type: QualificationType;
  requirements?: string[];
}

export interface InternationalSchedule {
  groupStage?: GroupStage;
  knockoutStage?: KnockoutStage;
}

export interface GroupStage {
  groups: Group[];
  currentRound: number;
}

export interface Group {
  name: string;
  teams: GroupTeam[];
  matches: LeagueMatchInfo[];
}

export interface GroupTeam {
  clubId: string;
  clubName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
}

export interface KnockoutStage {
  rounds: KnockoutRound[];
  currentRound: number;
}

export interface KnockoutRound {
  round: number;
  name: string;
  matches: CupMatch[];
}

export interface DevelopmentalLeague {
  id: string;
  name: string;
  parentLeagueId: string;
  teams: DevelopmentalTeam[];
  schedule: LeagueSchedule;
  standings: TeamStanding[];
  status: EventStatus;
}

export interface DevelopmentalTeam {
  clubId: string;
  clubName: string;
  parentClubId: string;
  played: number;
  won: number;
  lost: number;
  points: number;
}

export interface PrizePool {
  currency: string;
  distribution: PrizeDistribution[];
  totalAmount: number;
}

export interface PrizeDistribution {
  rank: number | 'participant';
  amount: number;
  description?: string;
}

export interface ClubQualification {
  clubId: string;
  clubName: string;
  qualifications: QualificationInfo[];
}

export interface QualificationInfo {
  eventId: string;
  eventName: string;
  eventType: 'league' | 'cup' | 'international';
  status: 'qualified' | 'pending' | 'eliminated';
  qualificationDate?: Date;
  group?: string;
}

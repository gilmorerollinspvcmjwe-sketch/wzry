// 联赛系统类型定义

export type LeaguePhase = 'preparing' | 'regular' | 'playoff' | 'offseason';
export type SeasonType = 'spring' | 'summer';

// 联赛赛季
export interface LeagueSeason {
  id: string;
  year: number;
  season: SeasonType;
  phase: LeaguePhase;
  startDate: Date;
  endDate: Date;
  currentRound: number;
  totalRounds: number;
  teams: LeagueTeam[];
  schedule: LeagueMatch[];
  standings: TeamStanding[];
  playoffBracket?: PlayoffBracket;
}

// 联赛参赛队伍
export interface LeagueTeam {
  clubId: string;
  clubName: string;
  logo?: string;
  played: number;
  won: number;
  lost: number;
  points: number;
  kills: number;
  deaths: number;
  towers: number;
  goldEarned: number;
}

// 积分榜排名
export interface TeamStanding {
  rank: number;
  clubId: string;
  clubName: string;
  played: number;
  won: number;
  lost: number;
  points: number;
  killDeathRatio: number;
  avgGameDuration: number;
}

// 联赛比赛
export interface LeagueMatch {
  id: string;
  round: number;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  scheduledDate: Date;
  isFinished: boolean;
  homeScore?: number;
  awayScore?: number;
  winnerId?: string;
  mvpId?: string;
}

// 季后赛对阵
export interface PlayoffBracket {
  semifinals: PlayoffMatch[];
  finals: PlayoffMatch;
  thirdPlace?: PlayoffMatch;
}

export interface PlayoffMatch {
  id: string;
  round: 'semifinal' | 'final' | 'third_place';
  homeTeamId: string;
  awayTeamId: string;
  homeWins: number;
  awayWins: number;
  isFinished: boolean;
  winnerId?: string;
  games: LeagueMatch[];
}

// 联赛奖励
export interface LeagueRewards {
  champion: number;
  runnerUp: number;
  thirdPlace: number;
  fourthPlace: number;
  playoffParticipant: number;
  regularParticipant: number;
}

// 联赛统计
export interface LeagueStats {
  totalMatches: number;
  avgGameDuration: number;
  totalKills: number;
  mostKillsTeam: string;
  longestWinStreak: { clubId: string; streak: number };
  biggestUpset: { winner: string; loser: string; powerDiff: number };
}

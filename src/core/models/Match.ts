import type { MatchPlayer, MatchStats, Highlight, MatchResult, Strategy } from '@/types';

export class Match {
  id: string;
  tournamentId: string;
  round: number;
  
  // 对阵双方
  homeTeam: {
    clubId: string;
    players: MatchPlayer[];
    score: number;
  };
  awayTeam: {
    clubId: string;
    players: MatchPlayer[];
    score: number;
  };
  
  // 比赛设置
  strategy: Strategy;
  bans: string[];
  picks: string[];
  
  // 比赛结果
  result: MatchResult;
  stats?: MatchStats;
  highlights: Highlight[];
  
  // 时间
  scheduledAt: Date;
  playedAt?: Date;
  
  constructor(tournamentId: string, round: number, homeClubId: string, awayClubId: string) {
    this.id = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.tournamentId = tournamentId;
    this.round = round;
    
    this.homeTeam = {
      clubId: homeClubId,
      players: [],
      score: 0,
    };
    this.awayTeam = {
      clubId: awayClubId,
      players: [],
      score: 0,
    };
    
    this.strategy = 'balanced';
    this.bans = [];
    this.picks = [];
    this.result = 'pending';
    this.highlights = [];
    this.scheduledAt = new Date();
  }
  
  // 设置主队阵容
  setHomeTeamPlayers(players: MatchPlayer[]): void {
    this.homeTeam.players = players;
  }
  
  // 设置客队阵容
  setAwayTeamPlayers(players: MatchPlayer[]): void {
    this.awayTeam.players = players;
  }
  
  // 设置 BP
  setBP(bans: string[], picks: string[]): void {
    this.bans = bans;
    this.picks = picks;
  }
  
  // 设置战术
  setStrategy(strategy: Strategy): void {
    this.strategy = strategy;
  }
  
  // 完成比赛
  finish(result: MatchResult, homeScore: number, awayScore: number, stats: MatchStats): void {
    this.result = result;
    this.homeTeam.score = homeScore;
    this.awayTeam.score = awayScore;
    this.stats = stats;
    this.playedAt = new Date();
  }
  
  // 添加精彩时刻
  addHighlight(highlight: Highlight): void {
    this.highlights.push(highlight);
  }
  
  // 获取胜者
  getWinner(): string | null {
    if (this.result === 'pending' || this.result === 'draw') {
      return null;
    }
    return this.result === 'win' ? this.homeTeam.clubId : this.awayTeam.clubId;
  }
  
  // 是否结束
  isFinished(): boolean {
    return this.result !== 'pending';
  }
}

import { defineStore } from 'pinia';
import { Match } from '@/core/models/Match';
import type { MatchPlayer, MatchStats } from '@/types';

interface MatchState {
  currentMatch: Match | null;
  upcomingMatches: Match[];
  matchHistory: Match[];
}

export const useMatchStore = defineStore('match', {
  state: (): MatchState => ({
    currentMatch: null,
    upcomingMatches: [],
    matchHistory: [],
  }),
  
  getters: {
    // 下一场比赛
    nextMatch: (state) => state.upcomingMatches[0],
    
    // 胜率统计
    winRate: (state) => {
      if (state.matchHistory.length === 0) return 0;
      const wins = state.matchHistory.filter(m => m.result === 'win').length;
      return (wins / state.matchHistory.length * 100).toFixed(1);
    },
  },
  
  actions: {
    // 创建比赛
    createMatch(homeClubId: string, awayClubId: string, tournamentId: string): Match {
      const match = new Match(tournamentId, 1, homeClubId, awayClubId);
      this.upcomingMatches.push(match);
      return match;
    },
    
    // 模拟比赛
    simulateMatch(matchId: string): { winner: string; homeScore: number; awayScore: number } {
      const match = this.upcomingMatches.find(m => m.id === matchId);
      if (!match) throw new Error('Match not found');
      
      // 简化版比赛模拟
      const homePower = 75 + Math.random() * 25; // 主队实力
      const awayPower = 75 + Math.random() * 25; // 客队实力
      
      // 计算胜负
      const homeAdvantage = 1.1; // 主场优势
      const homeFinalPower = homePower * homeAdvantage;
      
      const winner = homeFinalPower >= awayPower ? 'home' : 'away';
      const homeScore = winner === 'home' ? 3 : 1;
      const awayScore = winner === 'away' ? 3 : 1;
      
      // 生成统计数据
      const stats: MatchStats = {
        duration: 1200 + Math.floor(Math.random() * 600), // 20-30 分钟
        totalKills: 15 + Math.floor(Math.random() * 20),
        totalGold: 30000 + Math.floor(Math.random() * 10000),
        firstBlood: winner === 'home' ? match.homeTeam.clubId : match.awayTeam.clubId,
        firstTower: winner === 'home' ? match.homeTeam.clubId : match.awayTeam.clubId,
        firstDragon: winner === 'home' ? match.homeTeam.clubId : match.awayTeam.clubId,
      };
      
      // 完成比赛（直接修改属性，因为 Pinia 持久化后方法会丢失）
      (match as any).result = winner === 'home' ? 'win' : 'loss';
      match.homeTeam.score = homeScore;
      match.awayTeam.score = awayScore;
      (match as any).stats = stats;
      match.playedAt = new Date();
      
      // 移动到历史记录
      this.matchHistory.unshift(match);
      this.upcomingMatches = this.upcomingMatches.filter(m => m.id !== matchId);
      
      return { winner, homeScore, awayScore };
    },
    
    // 设置比赛阵容
    setMatchPlayers(matchId: string, team: 'home' | 'away', players: MatchPlayer[]) {
      const match = this.upcomingMatches.find(m => m.id === matchId);
      if (!match) return;
      
      if (team === 'home') {
        match.setHomeTeamPlayers(players);
      } else {
        match.setAwayTeamPlayers(players);
      }
    },
    
    // 添加比赛到列表
    addMatch(match: Match) {
      this.upcomingMatches.push(match);
    },
  },
  
  persist: true,
});

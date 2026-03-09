import { defineStore } from 'pinia';
import { Match } from '@/core/models/Match';
import type { MatchPlayer, MatchStats } from '@/types';
import { MatchCalculationService } from '@/core/services/matchCalculationService';
import { matchCallbackService } from '@/core/services/matchCallbackService';
import { useHeroStore } from '@/stores/hero';
import { useClubStore } from '@/stores/club';
import { useGameStore } from '@/stores/game';

interface MatchState {
  currentMatch: Match | null;
  upcomingMatches: Match[];
  matchHistory: Match[];
  // BP阶段选定的英雄
  homeTeamHeroes: Record<string, string>; // playerId -> heroId
  awayTeamHeroes: Record<string, string>;
}

export const useMatchStore = defineStore('match', {
  state: (): MatchState => ({
    currentMatch: null,
    upcomingMatches: [],
    matchHistory: [],
    homeTeamHeroes: {},
    awayTeamHeroes: {},
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
    
    // 获取已选英雄
    getSelectedHero: (state) => {
      return (playerId: string, team: 'home' | 'away'): string | null => {
        const heroes = team === 'home' ? state.homeTeamHeroes : state.awayTeamHeroes;
        return heroes[playerId] || null;
      };
    },
  },
  
  actions: {
    // 创建比赛
    createMatch(homeClubId: string, awayClubId: string, tournamentId: string): Match {
      const match = new Match(tournamentId, 1, homeClubId, awayClubId);
      this.upcomingMatches.push(match);
      return match;
    },
    
    // 选择英雄（BP阶段）
    selectHero(playerId: string, heroId: string, team: 'home' | 'away'): void {
      if (team === 'home') {
        this.homeTeamHeroes[playerId] = heroId;
      } else {
        this.awayTeamHeroes[playerId] = heroId;
      }
    },
    
    // 清除选择
    clearSelection(team: 'home' | 'away'): void {
      if (team === 'home') {
        this.homeTeamHeroes = {};
      } else {
        this.awayTeamHeroes = {};
      }
    },
    
    // 获取选手-英雄匹配度
    getPlayerHeroMatch(playerId: string, heroId: string, _team: 'home' | 'away'): number {
      const clubStore = useClubStore();
      const heroStore = useHeroStore();
      
      const roster = clubStore.currentClub?.roster || [];
      
      const player = roster.find(p => p.id === playerId);
      const hero = heroStore.getHeroById(heroId);
      
      if (!player || !hero) return 0;
      
      const matchResult = MatchCalculationService.calculatePlayerHeroMatch(
        player as any,
        hero
      );
      
      return matchResult.matchPercentage;
    },
    
    // 模拟比赛
    simulateMatch(matchId: string): { winner: string; homeScore: number; awayScore: number } {
      const match = this.upcomingMatches.find(m => m.id === matchId);
      if (!match) throw new Error('Match not found');
      
      const clubStore = useClubStore();
      const heroStore = useHeroStore();
      
      // 获取主客队选手
      const homeClub = clubStore.getClub(match.homeTeam.clubId);
      const awayClub = clubStore.getClub(match.awayTeam.clubId);
      
      let homeScore = 0;
      let awayScore = 0;
      let winner: 'home' | 'away' = 'home';
      
      // 模拟5局比赛（简化版：每路对战）
      const positions = ['top', 'jungle', 'mid', 'adc', 'support'];
      
      positions.forEach((_, index) => {
        const homePlayer = homeClub?.roster[index];
        const awayPlayer = awayClub?.roster[index];
        
        if (!homePlayer || !awayPlayer) return;
        
        // 获取选定的英雄
        const homeHeroId = this.homeTeamHeroes[homePlayer.id];
        const awayHeroId = this.awayTeamHeroes[awayPlayer.id];
        
        let homeHero = null;
        let awayHero = null;
        
        if (homeHeroId) {
          homeHero = heroStore.getHeroById(homeHeroId);
        }
        if (awayHeroId) {
          awayHero = heroStore.getHeroById(awayHeroId);
        }
        
        // 如果没有选择英雄，随机选择
        if (!homeHero) {
          const roleHeroes = heroStore.allHeroes.filter(h => h.role === homePlayer.position);
          homeHero = roleHeroes[Math.floor(Math.random() * roleHeroes.length)];
        }
        if (!awayHero) {
          const roleHeroes = heroStore.allHeroes.filter(h => h.role === awayPlayer.position);
          awayHero = roleHeroes[Math.floor(Math.random() * roleHeroes.length)];
        }
        
        // 确保英雄存在
        if (!homeHero || !awayHero) return;
        
        // 计算比赛结果
        const result = MatchCalculationService.simulateMatch(
          homePlayer as any,
          awayPlayer as any,
          homeHero,
          awayHero,
          match.homeTeam.clubId,
          match.awayTeam.clubId
        );
        
        if (result.homeWin) {
          homeScore++;
        } else {
          awayScore++;
        }
        
        // 记录英雄使用统计
        this.recordHeroUsage(homePlayer as any, homeHero, result.homeWin);
        this.recordHeroUsage(awayPlayer as any, awayHero, !result.homeWin);
      });
      
      // 根据总分确定胜负
      winner = homeScore > awayScore ? 'home' : 'away';
      
      // 确保至少赢一局
      if (homeScore === 0 && awayScore === 0) {
        homeScore = 3;
        awayScore = 1;
        winner = 'home';
      } else if (homeScore > awayScore && homeScore < 3) {
        homeScore = 3;
      } else if (awayScore > homeScore && awayScore < 3) {
        awayScore = 3;
      }
      
      // 生成统计数据
      const stats: MatchStats = {
        duration: 1200 + Math.floor(Math.random() * 600), // 20-30 分钟
        totalKills: 15 + Math.floor(Math.random() * 20),
        totalGold: 30000 + Math.floor(Math.random() * 10000),
        firstBlood: winner === 'home' ? match.homeTeam.clubId : match.awayTeam.clubId,
        firstTower: winner === 'home' ? match.homeTeam.clubId : match.awayTeam.clubId,
        firstDragon: winner === 'home' ? match.homeTeam.clubId : match.awayTeam.clubId,
      };
      
      // 完成比赛
      (match as any).result = winner === 'home' ? 'win' : 'loss';
      match.homeTeam.score = homeScore;
      match.awayTeam.score = awayScore;
      (match as any).stats = stats;
      match.playedAt = new Date();
      
      // 移动到历史记录
      this.matchHistory.unshift(match);
      this.upcomingMatches = this.upcomingMatches.filter(m => m.id !== matchId);
      
      // 清除BP选择
      this.clearSelection('home');
      this.clearSelection('away');
      
      // 触发比赛结果回调
      this.triggerMatchCallbacks(match, winner === 'home');
      
      return { winner, homeScore, awayScore };
    },
    
    // 触发比赛结果回调
    triggerMatchCallbacks(match: Match, playerWon: boolean): void {
      const clubStore = useClubStore();
      const gameStore = useGameStore();
      
      const playerClubId = clubStore.club?.id || '';
      const isPlayerMatch = match.homeTeam.clubId === playerClubId || match.awayTeam.clubId === playerClubId;
      
      const context = {
        isPlayerMatch,
        playerWon: isPlayerMatch && playerWon,
        playerClubId,
        week: gameStore.week,
        season: gameStore.season,
      };
      
      // 触发各类回调
      matchCallbackService.trigger('match_end', match, context);
      matchCallbackService.trigger('player_performance', match, context);
      matchCallbackService.trigger('achievement_check', match, context);
      matchCallbackService.trigger('objective_update', match, context);
      matchCallbackService.trigger('media_update', match, context);
      matchCallbackService.trigger('statistics_update', match, context);
    },
    
    // 记录英雄使用统计
    recordHeroUsage(player: any, hero: any, won: boolean): void {
      if (!player || !hero) return;
      
      // 使用 recordHeroUsage 方法（如果存在）
      if (typeof player.recordHeroUsage === 'function') {
        player.recordHeroUsage(hero.id, hero.name, won ? 'win' : 'loss', {
          kills: Math.floor(Math.random() * 8) + 1,
          deaths: Math.floor(Math.random() * 5),
          assists: Math.floor(Math.random() * 10) + 2
        });
      }
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

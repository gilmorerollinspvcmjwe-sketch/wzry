// 联赛系统 Store

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { LeagueSeason } from '@/types/league';
import { LeagueService } from '@/core/services/leagueService';
import { useClubStore } from './club';

export const useLeagueStore = defineStore('league', () => {
  // State
  const currentSeason = ref<LeagueSeason | null>(null);
  const isLoading = ref(false);

  // Getters
  const standings = computed(() => currentSeason.value?.standings || []);
  const currentRound = computed(() => currentSeason.value?.currentRound || 0);
  const totalRounds = computed(() => currentSeason.value?.totalRounds || 0);
  const phase = computed(() => currentSeason.value?.phase || 'preparing');
  
  const currentRoundMatches = computed(() => {
    if (!currentSeason.value) return [];
    return LeagueService.getCurrentRoundMatches(currentSeason.value);
  });

  const myClubMatches = computed(() => {
    if (!currentSeason.value) return [];
    const clubStore = useClubStore();
    const clubId = clubStore.currentClub?.id;
    if (!clubId) return [];
    return LeagueService.getClubMatches(currentSeason.value, clubId);
  });

  const myClubStanding = computed(() => {
    if (!currentSeason.value) return null;
    const clubStore = useClubStore();
    const clubId = clubStore.currentClub?.id;
    if (!clubId) return null;
    return standings.value.find(s => s.clubId === clubId) || null;
  });

  // Actions
  function createNewSeason(year: number, season: 'spring' | 'summer') {
    const clubStore = useClubStore();
    const allClubs = clubStore.clubs;
    
    if (allClubs.length < 2) {
      throw new Error('需要至少2个俱乐部才能创建联赛');
    }

    // 将普通对象转换为Club实例
    const clubInstances = allClubs.map(c => c as any);
    currentSeason.value = LeagueService.createSeason(year, season, clubInstances);
  }

  function startSeason() {
    if (!currentSeason.value) return;
    LeagueService.advancePhase(currentSeason.value);
  }

  function advanceToNextRound() {
    if (!currentSeason.value) return;
    LeagueService.advancePhase(currentSeason.value);
  }

  function updateMatchResult(
    matchId: string,
    homeScore: number,
    awayScore: number,
    winnerId: string
  ) {
    if (!currentSeason.value) return;
    
    LeagueService.updateMatchResult(
      currentSeason.value,
      matchId,
      homeScore,
      awayScore,
      winnerId
    );

    // 发放奖励
    const clubStore = useClubStore();
    const winner = clubStore.getClub(winnerId);
    if (winner) {
      (winner as any).addFunds?.(50); // 胜利奖励50万
    }
  }

  function simulateAllMatchesInRound() {
    if (!currentSeason.value) return;
    
    const matches = currentRoundMatches.value.filter(m => !m.isFinished);
    
    matches.forEach(match => {
      // 模拟比赛结果
      const homePower = getClubPower(match.homeTeamId);
      const awayPower = getClubPower(match.awayTeamId);
      
      const homeAdvantage = 5; // 主场优势
      const homeRoll = homePower + homeAdvantage + Math.random() * 20;
      const awayRoll = awayPower + Math.random() * 20;
      
      const winnerId = homeRoll > awayRoll ? match.homeTeamId : match.awayTeamId;
      const homeScore = homeRoll > awayRoll ? 3 : Math.floor(Math.random() * 2) + 1;
      const awayScore = homeRoll > awayRoll ? Math.floor(Math.random() * 2) + 1 : 3;
      
      updateMatchResult(match.id, homeScore, awayScore, winnerId);
    });

    // 进入下一轮
    advanceToNextRound();
  }

  function getClubPower(clubId: string): number {
    const clubStore = useClubStore();
    const club = clubStore.getClub(clubId);
    // 使用类型断言访问方法
    return (club as any)?.getTotalPower?.() || 0;
  }

  function finishSeason() {
    if (!currentSeason.value) return;
    
    // 发放赛季奖励
    const clubStore = useClubStore();
    standings.value.forEach(standing => {
      const club = clubStore.getClub(standing.clubId);
      if (club) {
        const reward = LeagueService.getLeagueRewards(standing.rank);
        (club as any).addFunds?.(reward);
      }
    });

    // 进入休赛期
    currentSeason.value.phase = 'offseason';
  }

  function resetSeason() {
    currentSeason.value = null;
  }

  return {
    // State
    currentSeason,
    isLoading,
    
    // Getters
    standings,
    currentRound,
    totalRounds,
    phase,
    currentRoundMatches,
    myClubMatches,
    myClubStanding,
    
    // Actions
    createNewSeason,
    startSeason,
    advanceToNextRound,
    updateMatchResult,
    simulateAllMatchesInRound,
    finishSeason,
    resetSeason,
  };
});

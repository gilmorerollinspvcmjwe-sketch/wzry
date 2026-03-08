import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { LeagueSeason } from '@/types/league';
import { LeagueService } from '@/core/services/leagueService';
import { useClubStore } from './club';
import { getClubTotalPower } from '@/utils/clubUtils';

export const useLeagueStore = defineStore('league', () => {
  const currentSeason = ref<LeagueSeason | null>(null);
  const isLoading = ref(false);

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

  function createNewSeason(year: number, season: 'spring' | 'summer') {
    const clubStore = useClubStore();
    const allClubs = clubStore.clubs;
    
    if (allClubs.length < 2) {
      throw new Error('需要至少2个俱乐部才能创建联赛');
    }

    currentSeason.value = LeagueService.createSeason(year, season, allClubs);
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

    const clubStore = useClubStore();
    const winner = clubStore.getClub(winnerId);
    if (winner) {
      clubStore.addFundsToClub(winnerId, 50);
    }
  }

  function simulateAllMatchesInRound() {
    if (!currentSeason.value) return;
    
    const matches = currentRoundMatches.value.filter(m => !m.isFinished);
    
    matches.forEach(match => {
      const homePower = getClubPower(match.homeTeamId);
      const awayPower = getClubPower(match.awayTeamId);
      
      const homeAdvantage = 5;
      const homeRoll = homePower + homeAdvantage + Math.random() * 20;
      const awayRoll = awayPower + Math.random() * 20;
      
      const winnerId = homeRoll > awayRoll ? match.homeTeamId : match.awayTeamId;
      const homeScore = homeRoll > awayRoll ? 3 : Math.floor(Math.random() * 2) + 1;
      const awayScore = homeRoll > awayRoll ? Math.floor(Math.random() * 2) + 1 : 3;
      
      updateMatchResult(match.id, homeScore, awayScore, winnerId);
    });

    advanceToNextRound();
  }

  function getClubPower(clubId: string): number {
    const clubStore = useClubStore();
    const club = clubStore.getClub(clubId);
    return getClubTotalPower(club);
  }

  function finishSeason() {
    if (!currentSeason.value) return;
    
    const clubStore = useClubStore();
    standings.value.forEach(standing => {
      const reward = LeagueService.getLeagueRewards(standing.rank);
      clubStore.addFundsToClub(standing.clubId, reward);
    });

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

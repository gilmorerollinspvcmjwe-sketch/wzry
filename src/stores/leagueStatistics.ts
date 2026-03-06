import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  ClubStatistics,
  PlayerStatistics,
  HeroStatistics,
  LeagueStatistics,
  MatchStatistics,
  LeaderboardType,
  LeaderboardEntry,
  StatisticsFilter,
  PlayerMatchStats,
} from '@/types/statistics';
import { leagueStatisticsService } from '@/core/services/leagueStatisticsService';
import type { Match } from '@/core/models/Match';

export const useLeagueStatisticsStore = defineStore('leagueStatistics', () => {
  const statistics = ref<LeagueStatistics | null>(null);
  const matchHistory = ref<MatchStatistics[]>([]);
  const isLoading = ref(false);

  const isInitialized = computed(() => statistics.value !== null);

  const totalMatches = computed(() => statistics.value?.totalMatches || 0);
  const totalKills = computed(() => statistics.value?.totalKills || 0);
  const averageGameDuration = computed(() => statistics.value?.averageGameDuration || 0);

  const clubStats = computed(() => statistics.value?.clubStats || []);
  const playerStats = computed(() => statistics.value?.playerStats || []);
  const heroStats = computed(() => statistics.value?.heroStats || []);

  const topClubs = computed(() => {
    return [...clubStats.value]
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 10);
  });

  const topPlayers = computed(() => {
    return [...playerStats.value]
      .sort((a, b) => b.kda - a.kda)
      .slice(0, 10);
  });

  const topHeroes = computed(() => {
    return [...heroStats.value]
      .sort((a, b) => b.picks - a.picks)
      .slice(0, 10);
  });

  function initialize(year: number = new Date().getFullYear(), phase: 'spring' | 'summer' = 'spring') {
    if (isInitialized.value) return;
    
    isLoading.value = true;
    leagueStatisticsService.initialize(year, phase);
    statistics.value = leagueStatisticsService.getStatistics();
    isLoading.value = false;
  }

  function recordMatch(match: Match, playerStats: PlayerMatchStats[]) {
    leagueStatisticsService.recordMatch(match, playerStats);
    statistics.value = leagueStatisticsService.getStatistics();
    matchHistory.value = leagueStatisticsService.getMatchHistory();
  }

  function getLeaderboard(type: LeaderboardType, limit: number = 10): LeaderboardEntry[] {
    return leagueStatisticsService.getLeaderboard(type, limit);
  }

  function getClubStatistics(clubId: string): ClubStatistics | undefined {
    return leagueStatisticsService.getClubStatistics(clubId);
  }

  function getPlayerStatistics(playerId: string): PlayerStatistics | undefined {
    return leagueStatisticsService.getPlayerStatistics(playerId);
  }

  function getHeroStatistics(heroId: string): HeroStatistics | undefined {
    return leagueStatisticsService.getHeroStatistics(heroId);
  }

  function filterStatistics(filter: StatisticsFilter) {
    return leagueStatisticsService.filterStatistics(filter);
  }

  function getClubRanking(clubId: string): number {
    const sorted = [...clubStats.value].sort((a, b) => b.winRate - a.winRate);
    return sorted.findIndex(c => c.clubId === clubId) + 1;
  }

  function getPlayerRanking(playerId: string, type: LeaderboardType): number {
    const leaderboard = getLeaderboard(type, 100);
    return leaderboard.findIndex(e => e.playerId === playerId) + 1;
  }

  function getHeroPickRate(heroId: string): number {
    const hero = getHeroStatistics(heroId);
    return hero?.pickRate || 0;
  }

  function getHeroWinRate(heroId: string): number {
    const hero = getHeroStatistics(heroId);
    return hero?.winRate || 0;
  }

  function getMostPickedHero(): string {
    return statistics.value?.mostPickedHero || '';
  }

  function getMostBannedHero(): string {
    return statistics.value?.mostBannedHero || '';
  }

  function getHighestWinRateClub(): string {
    return statistics.value?.highestWinRateClub || '';
  }

  function getMatchHistoryByClub(clubId: string): MatchStatistics[] {
    return matchHistory.value.filter(
      m => m.homeClubId === clubId || m.awayClubId === clubId
    );
  }

  function getMatchHistoryByPlayer(playerId: string): MatchStatistics[] {
    return matchHistory.value.filter(
      m => m.playerStats.some(p => p.playerId === playerId)
    );
  }

  function reset() {
    leagueStatisticsService.reset();
    statistics.value = null;
    matchHistory.value = [];
  }

  return {
    statistics,
    matchHistory,
    isLoading,
    isInitialized,
    totalMatches,
    totalKills,
    averageGameDuration,
    clubStats,
    playerStats,
    heroStats,
    topClubs,
    topPlayers,
    topHeroes,
    initialize,
    recordMatch,
    getLeaderboard,
    getClubStatistics,
    getPlayerStatistics,
    getHeroStatistics,
    filterStatistics,
    getClubRanking,
    getPlayerRanking,
    getHeroPickRate,
    getHeroWinRate,
    getMostPickedHero,
    getMostBannedHero,
    getHighestWinRateClub,
    getMatchHistoryByClub,
    getMatchHistoryByPlayer,
    reset,
  };
}, {
  persist: true,
});

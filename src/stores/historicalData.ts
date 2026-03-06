import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { historicalDataService, type HistoricalChampion, type SeasonHonors, type Record, type ClubHistory, type PlayerHistory } from '@/core/services/historicalDataService';

export const useHistoricalDataStore = defineStore('historicalData', () => {
  const isInitialized = ref(false);
  
  const champions = ref<HistoricalChampion[]>([]);
  const honors = ref<SeasonHonors[]>([]);
  const records = ref<Record[]>([]);

  function initialize() {
    if (isInitialized.value) return;
    
    historicalDataService.initialize();
    champions.value = historicalDataService.getChampions();
    honors.value = historicalDataService.getHonors();
    records.value = historicalDataService.getRecords();
    isInitialized.value = true;
  }

  function recordChampion(
    season: number,
    year: number,
    phase: 'spring' | 'summer',
    champion: any,
    runnerUp: any,
    finalsMVP: any,
    matchScore: string
  ) {
    historicalDataService.recordChampion(season, year, phase, champion, runnerUp, finalsMVP, matchScore);
    champions.value = historicalDataService.getChampions();
  }

  function getChampionsByClub(clubId: string): HistoricalChampion[] {
    return historicalDataService.getChampionsByClub(clubId);
  }

  function getHonorsBySeason(season: number): SeasonHonors | undefined {
    return historicalDataService.getHonorsBySeason(season);
  }

  function getHonorsByPlayer(playerId: string): SeasonHonors[] {
    return historicalDataService.getHonorsByPlayer(playerId);
  }

  function getRecordsByHolder(holderId: string): Record[] {
    return historicalDataService.getRecordsByHolder(holderId);
  }

  function getClubHistory(clubId: string): ClubHistory | undefined {
    return historicalDataService.getClubHistory(clubId);
  }

  function getPlayerHistory(playerId: string): PlayerHistory | undefined {
    return historicalDataService.getPlayerHistory(playerId);
  }

  return {
    isInitialized,
    champions,
    honors,
    records,
    initialize,
    recordChampion,
    getChampionsByClub,
    getHonorsBySeason,
    getHonorsByPlayer,
    getRecordsByHolder,
    getClubHistory,
    getPlayerHistory,
  };
});

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { SeasonObjective, BoardExpectation, SeasonSummary } from '@/types/objective';
import { seasonObjectiveService } from '@/core/services/seasonObjectiveService';

export const useSeasonObjectiveStore = defineStore('seasonObjective', () => {
  const objectives = ref<SeasonObjective[]>([]);
  const boardExpectation = ref<BoardExpectation | null>(null);
  const seasonHistory = ref<SeasonSummary[]>([]);
  const currentWeek = ref(1);
  const isInitialized = ref(false);

  const primaryObjective = computed(() => objectives.value.find(o => o.isPrimary) || null);
  const secondaryObjectives = computed(() => objectives.value.filter(o => !o.isPrimary));
  const completedCount = computed(() => objectives.value.filter(o => o.completed).length);
  const totalCount = computed(() => objectives.value.length);
  const patience = computed(() => boardExpectation.value?.patience || 0);
  const expectationLevel = computed(() => boardExpectation.value?.expectationLevel || 'survival');

  function initialize(season: number = 1, year: number = new Date().getFullYear(), phase: 'spring' | 'summer' = 'spring') {
    if (isInitialized.value) return;
    
    seasonObjectiveService.initialize(season, year, phase);
    objectives.value = seasonObjectiveService.getObjectives();
    boardExpectation.value = seasonObjectiveService.getBoardExpectation();
    seasonHistory.value = seasonObjectiveService.getSeasonHistory();
    currentWeek.value = seasonObjectiveService.getCurrentWeek();
    isInitialized.value = true;
  }

  function updateProgress(metric: string, value: number) {
    seasonObjectiveService.updateProgress(metric, value);
    objectives.value = [...seasonObjectiveService.getObjectives()];
  }

  function incrementProgress(metric: string, amount: number = 1) {
    seasonObjectiveService.incrementProgress(metric, amount);
    objectives.value = [...seasonObjectiveService.getObjectives()];
  }

  function advanceWeek() {
    seasonObjectiveService.advanceWeek();
    currentWeek.value = seasonObjectiveService.getCurrentWeek();
    boardExpectation.value = seasonObjectiveService.getBoardExpectation();
  }

  function evaluateSeason(finalRanking: number, totalWins: number, totalMatches: number, funds: number, reputation: number): SeasonSummary {
    const summary = seasonObjectiveService.evaluateSeason(finalRanking, totalWins, totalMatches, funds, reputation);
    seasonHistory.value = seasonObjectiveService.getSeasonHistory();
    return summary;
  }

  function nextSeason() {
    seasonObjectiveService.nextSeason();
    objectives.value = seasonObjectiveService.getObjectives();
    boardExpectation.value = seasonObjectiveService.getBoardExpectation();
    currentWeek.value = seasonObjectiveService.getCurrentWeek();
  }

  function getExpectationText(): string {
    const level = boardExpectation.value?.expectationLevel;
    const texts: Record<string, string> = {
      survival: '保级成功',
      playoff: '进入季后赛',
      championship: '争夺冠军',
      dynasty: '建立王朝',
    };
    return texts[level || 'survival'] || '保级成功';
  }

  function getNextEvaluationWeek(): number {
    const next = Math.ceil(currentWeek.value / 5) * 5;
    return next > currentWeek.value ? next : next + 5;
  }

  return {
    objectives,
    boardExpectation,
    seasonHistory,
    currentWeek,
    isInitialized,
    primaryObjective,
    secondaryObjectives,
    completedCount,
    totalCount,
    patience,
    expectationLevel,
    initialize,
    updateProgress,
    incrementProgress,
    advanceWeek,
    evaluateSeason,
    nextSeason,
    getExpectationText,
    getNextEvaluationWeek,
  };
}, {
  persist: true,
});

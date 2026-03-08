import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { 
  SeasonObjective, 
  BoardExpectation, 
  SeasonSummary, 
  Milestone, 
  MilestoneRecord 
} from '@/types/objective';
import { objectiveService } from '@/core/services/objectiveService';

export const useObjectiveStore = defineStore('objective', () => {
  const objectives = ref<SeasonObjective[]>([]);
  const boardExpectation = ref<BoardExpectation | null>(null);
  const seasonHistory = ref<SeasonSummary[]>([]);
  const currentWeek = ref(1);
  const currentSeason = ref(1);
  const isInitialized = ref(false);
  const milestones = ref<Milestone[]>([]);
  const unlockedMilestones = ref<MilestoneRecord[]>([]);

  const primaryObjective = computed(() => objectives.value.find(o => o.isPrimary) || null);
  const secondaryObjectives = computed(() => objectives.value.filter(o => o.category === 'secondary'));
  const specialObjectives = computed(() => objectives.value.filter(o => o.category === 'special'));
  const completedCount = computed(() => objectives.value.filter(o => o.completed).length);
  const totalCount = computed(() => objectives.value.length);
  const patience = computed(() => boardExpectation.value?.patience || 0);
  const expectationLevel = computed(() => boardExpectation.value?.expectationLevel || 'survival');
  const fireRisk = computed(() => boardExpectation.value?.fireRisk || 0);
  const progressPercentage = computed(() => {
    if (totalCount.value === 0) return 0;
    return Math.round((completedCount.value / totalCount.value) * 100);
  });

  function initialize(season: number = 1, year: number = new Date().getFullYear(), phase: 'spring' | 'summer' = 'spring') {
    if (isInitialized.value) return;

    objectiveService.initialize(season, year, phase);
    objectives.value = objectiveService.getObjectives();
    boardExpectation.value = objectiveService.getBoardExpectation();
    seasonHistory.value = objectiveService.getSeasonHistory();
    currentWeek.value = objectiveService.getCurrentWeek();
    currentSeason.value = objectiveService.getCurrentSeason();
    milestones.value = objectiveService.getMilestones();
    unlockedMilestones.value = objectiveService.getUnlockedMilestones();
    isInitialized.value = true;
  }

  function updateProgress(objectiveId: string, progress: number) {
    const updated = objectiveService.updateProgress(objectiveId, progress);
    if (updated) {
      objectives.value = objectiveService.getObjectives();
    }
  }

  function updateProgressByMetric(metric: string, value: number) {
    objectiveService.updateProgressByMetric(metric, value);
    objectives.value = objectiveService.getObjectives();
    milestones.value = objectiveService.getMilestones();
    unlockedMilestones.value = objectiveService.getUnlockedMilestones();
  }

  function incrementProgress(metric: string, amount: number = 1) {
    objectiveService.incrementProgress(metric, amount);
    objectives.value = objectiveService.getObjectives();
  }

  function checkCompletion(objectiveId: string) {
    return objectiveService.checkCompletion(objectiveId);
  }

  function evaluateBoardExpectations(clubId: string) {
    boardExpectation.value = objectiveService.evaluateBoardExpectations(clubId);
    objectives.value = objectiveService.getObjectives();
  }

  function calculateFireRisk(clubId: string) {
    return objectiveService.calculateFireRisk(clubId);
  }

  function advanceWeek() {
    objectiveService.advanceWeek();
    currentWeek.value = objectiveService.getCurrentWeek();
    boardExpectation.value = objectiveService.getBoardExpectation();
    objectives.value = objectiveService.getObjectives();
  }

  function evaluateSeason(finalRanking: number, totalWins: number, totalMatches: number, funds: number, reputation: number): SeasonSummary {
    const summary = objectiveService.evaluateSeason(finalRanking, totalWins, totalMatches, funds, reputation);
    seasonHistory.value = objectiveService.getSeasonHistory();
    return summary;
  }

  function nextSeason() {
    objectiveService.nextSeason();
    objectives.value = objectiveService.getObjectives();
    boardExpectation.value = objectiveService.getBoardExpectation();
    currentWeek.value = objectiveService.getCurrentWeek();
    currentSeason.value = objectiveService.getCurrentSeason();
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
    const next = Math.ceil(currentWeek.value / 4) * 4;
    return next > currentWeek.value ? next : next + 4;
  }

  function getDifficultyColor(difficulty: string): string {
    const colors: Record<string, string> = {
      easy: '#4caf50',
      medium: '#2196f3',
      hard: '#ff9800',
      legend: '#ffc107',
    };
    return colors[difficulty] || '#999';
  }

  function getDifficultyText(difficulty: string): string {
    const texts: Record<string, string> = {
      easy: '简单',
      medium: '中等',
      hard: '困难',
      legend: '传奇',
    };
    return texts[difficulty] || difficulty;
  }

  function getTrendIcon(trend: string): string {
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '→';
  }

  function getFireRiskLevel(): 'safe' | 'warning' | 'danger' | 'critical' {
    const risk = fireRisk.value;
    if (risk < 20) return 'safe';
    if (risk < 50) return 'warning';
    if (risk < 75) return 'danger';
    return 'critical';
  }

  function getFireRiskText(): string {
    const level = getFireRiskLevel();
    const texts: Record<string, string> = {
      safe: '职位安全',
      warning: '需要警惕',
      danger: '危险状态',
      critical: '濒临解雇',
    };
    return texts[level];
  }

  function getMilestonesByType(type: 'achievement' | 'record' | 'special') {
    return milestones.value.filter(m => m.type === type);
  }

  function getUnlockedMilestonesCount(): number {
    return milestones.value.filter(m => m.unlocked).length;
  }

  function reset() {
    objectiveService.reset();
    objectives.value = [];
    boardExpectation.value = null;
    seasonHistory.value = [];
    currentWeek.value = 1;
    currentSeason.value = 1;
    milestones.value = [];
    unlockedMilestones.value = [];
    isInitialized.value = false;
  }

  return {
    objectives,
    boardExpectation,
    seasonHistory,
    currentWeek,
    currentSeason,
    isInitialized,
    milestones,
    unlockedMilestones,
    primaryObjective,
    secondaryObjectives,
    specialObjectives,
    completedCount,
    totalCount,
    patience,
    expectationLevel,
    fireRisk,
    progressPercentage,
    initialize,
    updateProgress,
    updateProgressByMetric,
    incrementProgress,
    checkCompletion,
    evaluateBoardExpectations,
    calculateFireRisk,
    advanceWeek,
    evaluateSeason,
    nextSeason,
    getExpectationText,
    getNextEvaluationWeek,
    getDifficultyColor,
    getDifficultyText,
    getTrendIcon,
    getFireRiskLevel,
    getFireRiskText,
    getMilestonesByType,
    getUnlockedMilestonesCount,
    reset,
  };
}, {
  persist: true,
});

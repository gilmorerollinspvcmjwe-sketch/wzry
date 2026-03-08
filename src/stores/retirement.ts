import { defineStore } from 'pinia';
import type {
  Retirement,
  RetirementCeremony,
  PostCareer,
  Legacy,
  HallOfFameMember,
  ClubHallOfFame,
  Legend,
} from '@/types/retirement';
import { DEFAULT_CLUB_HALL_OF_FAME } from '@/types/retirement';
import {
  checkRetirementEligibility,
  initiateRetirement,
  planCeremony,
  selectPostCareer,
  transferLegacy,
  addToHallOfFame,
  getCeremonyOptions,
  createLegend,
  calculateRetirementImpact,
} from '@/core/services/retirementService';
import type { RetirementType, RetirementReason, PostCareerPath } from '@/types/retirement';

interface RetirementState {
  retirements: Retirement[];
  hallOfFame: ClubHallOfFame;
  pendingRetirements: string[];
}

export const useRetirementStore = defineStore('retirement', {
  state: (): RetirementState => ({
    retirements: [],
    hallOfFame: { ...DEFAULT_CLUB_HALL_OF_FAME },
    pendingRetirements: [],
  }),

  getters: {
    getRetirementByPlayerId: (state) => (playerId: string): Retirement | undefined => {
      return state.retirements.find(r => r.playerId === playerId);
    },

    getRetirementById: (state) => (retirementId: string): Retirement | undefined => {
      return state.retirements.find(r => r.id === retirementId);
    },

    getAllRetirements: (state) => (): Retirement[] => {
      return state.retirements;
    },

    getRecentRetirements: (state) => (limit: number = 5): Retirement[] => {
      return [...state.retirements]
        .sort((a, b) => new Date(b.retiredAt).getTime() - new Date(a.retiredAt).getTime())
        .slice(0, limit);
    },

    getHallOfFameMembers: (state) => (): HallOfFameMember[] => {
      return state.hallOfFame.members;
    },

    getRetiredNumbers: (state) => () => {
      return state.hallOfFame.retiredNumbers;
    },

    getLegends: (state) => (): Legend[] => {
      return state.hallOfFame.legends;
    },

    getLegendaryPlayers: (state) => (): Legend[] => {
      return state.hallOfFame.legends.filter(l => l.impact === 'legendary');
    },

    isPlayerRetired: (state) => (playerId: string): boolean => {
      return state.retirements.some(r => r.playerId === playerId);
    },

    isNumberRetired: (state) => (number: number): boolean => {
      return state.hallOfFame.retiredNumbers.some(rn => rn.number === number);
    },

    getPlayerLegacy: (state) => (playerId: string): Legacy | undefined => {
      const retirement = state.retirements.find(r => r.playerId === playerId);
      return retirement?.legacy;
    },

    getRetirementsByType: (state) => (type: RetirementType): Retirement[] => {
      return state.retirements.filter(r => r.type === type);
    },

    getRetirementsByYear: (state) => (year: number): Retirement[] => {
      return state.retirements.filter(r => new Date(r.retiredAt).getFullYear() === year);
    },

    getHallOfFameMemberById: (state) => (playerId: string): HallOfFameMember | undefined => {
      return state.hallOfFame.members.find(m => m.playerId === playerId);
    },

    getLegendByPlayerId: (state) => (playerId: string): Legend | undefined => {
      return state.hallOfFame.legends.find(l => l.playerId === playerId);
    },

    getTotalRetiredPlayers: (state) => (): number => {
      return state.retirements.length;
    },

    getHallOfFameCount: (state) => (): number => {
      return state.hallOfFame.members.length;
    },

    getRetiredNumbersCount: (state) => (): number => {
      return state.hallOfFame.retiredNumbers.length;
    },
  },

  actions: {
    addRetirement(retirement: Retirement) {
      this.retirements.push(retirement);
    },

    updateCeremony(playerId: string, ceremony: RetirementCeremony) {
      const retirement = this.retirements.find(r => r.playerId === playerId);
      if (retirement) {
        retirement.ceremony = ceremony;
      }
    },

    updatePostCareer(playerId: string, postCareer: PostCareer) {
      const retirement = this.retirements.find(r => r.playerId === playerId);
      if (retirement) {
        retirement.postCareer = postCareer;
      }
    },

    updateLegacy(playerId: string, legacy: Legacy) {
      const retirement = this.retirements.find(r => r.playerId === playerId);
      if (retirement) {
        retirement.legacy = legacy;
      }
    },

    addHallOfFameMember(member: HallOfFameMember) {
      const existingIndex = this.hallOfFame.members.findIndex(m => m.playerId === member.playerId);
      if (existingIndex === -1) {
        this.hallOfFame.members.push(member);
      }
    },

    addLegend(legend: Legend) {
      const existingIndex = this.hallOfFame.legends.findIndex(l => l.playerId === legend.playerId);
      if (existingIndex === -1) {
        this.hallOfFame.legends.push(legend);
      } else {
        this.hallOfFame.legends[existingIndex] = legend;
      }
    },

    addRetiredNumber(playerId: string, playerName: string, number: number, reason: string) {
      const existingIndex = this.hallOfFame.retiredNumbers.findIndex(rn => rn.number === number);
      if (existingIndex === -1) {
        this.hallOfFame.retiredNumbers.push({
          number,
          playerId,
          playerName,
          retiredAt: new Date(),
          reason,
        });
      }
    },

    removeRetiredNumber(number: number) {
      this.hallOfFame.retiredNumbers = this.hallOfFame.retiredNumbers.filter(
        rn => rn.number !== number
      );
    },

    checkPlayerRetirementEligibility(playerId: string) {
      return checkRetirementEligibility(playerId);
    },

    initiatePlayerRetirement(
      playerId: string,
      type: RetirementType,
      reason?: RetirementReason
    ): Retirement {
      return initiateRetirement(playerId, type, reason);
    },

    planPlayerCeremony(playerId: string, ceremony: RetirementCeremony) {
      return planCeremony(playerId, ceremony);
    },

    selectPlayerPostCareer(playerId: string, path: PostCareerPath) {
      return selectPostCareer(playerId, path);
    },

    transferPlayerLegacy(playerId: string, successorId: string) {
      return transferLegacy(playerId, successorId);
    },

    addPlayerToHallOfFame(playerId: string) {
      return addToHallOfFame(playerId);
    },

    getPlayerCeremonyOptions(playerId: string) {
      return getCeremonyOptions(playerId);
    },

    createPlayerLegend(playerId: string, title: string, description: string) {
      return createLegend(playerId, title, description);
    },

    calculatePlayerRetirementImpact(playerId: string) {
      return calculateRetirementImpact(playerId);
    },

    addPendingRetirement(playerId: string) {
      if (!this.pendingRetirements.includes(playerId)) {
        this.pendingRetirements.push(playerId);
      }
    },

    removePendingRetirement(playerId: string) {
      this.pendingRetirements = this.pendingRetirements.filter(id => id !== playerId);
    },

    clearPendingRetirements() {
      this.pendingRetirements = [];
    },

    getRetirementStatistics() {
      const total = this.retirements.length;
      const voluntary = this.retirements.filter(r => r.type === 'voluntary').length;
      const advised = this.retirements.filter(r => r.type === 'advised').length;
      const forced = this.retirements.filter(r => r.type === 'forced').length;

      const avgWinRate = total > 0
        ? Math.round(
            this.retirements.reduce((sum, r) => sum + r.stats.winRate, 0) / total
          )
        : 0;

      const avgYearsActive = total > 0
        ? Math.round(
            this.retirements.reduce((sum, r) => sum + r.stats.yearsActive, 0) / total
          )
        : 0;

      const totalChampionships = this.retirements.reduce(
        (sum, r) => sum + r.stats.championships,
        0
      );

      const totalMvpCount = this.retirements.reduce(
        (sum, r) => sum + r.stats.mvpCount,
        0
      );

      const postCareerPaths: Record<string, number> = {};
      for (const retirement of this.retirements) {
        const path = retirement.postCareer.path;
        postCareerPaths[path] = (postCareerPaths[path] || 0) + 1;
      }

      return {
        total,
        byType: { voluntary, advised, forced },
        avgWinRate,
        avgYearsActive,
        totalChampionships,
        totalMvpCount,
        postCareerPaths,
        hallOfFameMembers: this.hallOfFame.members.length,
        retiredNumbers: this.hallOfFame.retiredNumbers.length,
        legends: this.hallOfFame.legends.length,
      };
    },

    clearAllRetirements() {
      this.retirements = [];
      this.hallOfFame = { ...DEFAULT_CLUB_HALL_OF_FAME };
      this.pendingRetirements = [];
    },

    loadHallOfFame(hallOfFame: ClubHallOfFame) {
      this.hallOfFame = hallOfFame;
    },

    exportRetirementData() {
      return {
        retirements: this.retirements,
        hallOfFame: this.hallOfFame,
        statistics: this.getRetirementStatistics(),
      };
    },
  },

  persist: true,
});

import { defineStore } from 'pinia';
import type {
  Tactics,
  VersionUnderstanding,
  BPStrategy,
  InGameCommand,
  FormationType,
  TacticalStyle,
  PacePreference,
} from '@/types/tactics';
import { DEFAULT_BP_STRATEGY, DEFAULT_IN_GAME_COMMANDS } from '@/types/tactics';

interface TacticsState {
  tactics: Record<string, Tactics>;
  versionUnderstandings: Record<string, VersionUnderstanding>;
}

function createDefaultTactics(clubId: string): Tactics {
  return {
    id: `tactics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    clubId,
    formation: 'balanced',
    style: 'balanced',
    pace: 'mid-game',
    corePlayer: null,
    bpStrategy: { ...DEFAULT_BP_STRATEGY },
    inGameCommands: [...DEFAULT_IN_GAME_COMMANDS.map(cmd => ({ ...cmd }))],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function createDefaultVersionUnderstanding(): VersionUnderstanding {
  return {
    currentVersion: '1.0.0',
    understandingLevel: 0,
    metaHeroes: [],
    metaCompositions: [],
    bonuses: {
      heroMastery: 0,
      compositionBonus: 0,
      counterBonus: 0,
      adaptationBonus: 0,
    },
    lastUpdated: new Date(),
    researchProgress: 0,
  };
}

export const useTacticsStore = defineStore('tactics', {
  state: (): TacticsState => ({
    tactics: {},
    versionUnderstandings: {},
  }),

  getters: {
    getTactics: (state) => (clubId: string): Tactics | undefined => {
      return state.tactics[clubId];
    },

    getVersionUnderstanding: (state) => (clubId: string): VersionUnderstanding | undefined => {
      return state.versionUnderstandings[clubId];
    },

    getFormation: (state) => (clubId: string): FormationType => {
      return state.tactics[clubId]?.formation || 'balanced';
    },

    getStyle: (state) => (clubId: string): TacticalStyle => {
      return state.tactics[clubId]?.style || 'balanced';
    },

    getPace: (state) => (clubId: string): PacePreference => {
      return state.tactics[clubId]?.pace || 'mid-game';
    },

    getCorePlayer: (state) => (clubId: string): string | null => {
      return state.tactics[clubId]?.corePlayer || null;
    },

    getBPStrategy: (state) => (clubId: string): BPStrategy => {
      return state.tactics[clubId]?.bpStrategy || DEFAULT_BP_STRATEGY;
    },

    getInGameCommands: (state) => (clubId: string): InGameCommand[] => {
      return state.tactics[clubId]?.inGameCommands || DEFAULT_IN_GAME_COMMANDS;
    },

    getAvailableCommands: (state) => (clubId: string): InGameCommand[] => {
      const tactics = state.tactics[clubId];
      if (!tactics) return [];

      const now = new Date();
      return tactics.inGameCommands.filter(cmd => {
        if (!cmd.lastUsed) return true;
        const lastUsed = new Date(cmd.lastUsed);
        const daysSinceLastUse = Math.floor((now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceLastUse >= cmd.cooldown;
      });
    },

    hasTactics: (state) => (clubId: string): boolean => {
      return !!state.tactics[clubId];
    },

    getVersionUnderstandingLevel: (state) => (clubId: string): number => {
      return state.versionUnderstandings[clubId]?.understandingLevel || 0;
    },
  },

  actions: {
    initTactics(clubId: string): Tactics {
      if (!this.tactics[clubId]) {
        this.tactics[clubId] = createDefaultTactics(clubId);
      }
      if (!this.versionUnderstandings[clubId]) {
        this.versionUnderstandings[clubId] = createDefaultVersionUnderstanding();
      }
      return this.tactics[clubId];
    },

    setTactics(clubId: string, tactics: Tactics): void {
      this.tactics[clubId] = tactics;
    },

    setVersionUnderstanding(clubId: string, understanding: VersionUnderstanding): void {
      this.versionUnderstandings[clubId] = understanding;
    },

    updateFormation(clubId: string, formation: FormationType): void {
      if (this.tactics[clubId]) {
        this.tactics[clubId].formation = formation;
        this.tactics[clubId].updatedAt = new Date();
      }
    },

    updateStyle(clubId: string, style: TacticalStyle): void {
      if (this.tactics[clubId]) {
        this.tactics[clubId].style = style;
        this.tactics[clubId].updatedAt = new Date();
      }
    },

    updatePace(clubId: string, pace: PacePreference): void {
      if (this.tactics[clubId]) {
        this.tactics[clubId].pace = pace;
        this.tactics[clubId].updatedAt = new Date();
      }
    },

    updateCorePlayer(clubId: string, playerId: string | null): void {
      if (this.tactics[clubId]) {
        this.tactics[clubId].corePlayer = playerId;
        this.tactics[clubId].updatedAt = new Date();
      }
    },

    updateBPStrategy(clubId: string, strategy: Partial<BPStrategy>): void {
      if (this.tactics[clubId]) {
        this.tactics[clubId].bpStrategy = {
          ...this.tactics[clubId].bpStrategy,
          ...strategy,
        };
        this.tactics[clubId].updatedAt = new Date();
      }
    },

    addPriorityHero(clubId: string, heroId: string): void {
      if (this.tactics[clubId]) {
        const strategy = this.tactics[clubId].bpStrategy;
        if (!strategy.priorityHeroes.includes(heroId)) {
          strategy.priorityHeroes.push(heroId);
          this.tactics[clubId].updatedAt = new Date();
        }
      }
    },

    removePriorityHero(clubId: string, heroId: string): void {
      if (this.tactics[clubId]) {
        const strategy = this.tactics[clubId].bpStrategy;
        strategy.priorityHeroes = strategy.priorityHeroes.filter(id => id !== heroId);
        this.tactics[clubId].updatedAt = new Date();
      }
    },

    addBanTarget(clubId: string, heroId: string): void {
      if (this.tactics[clubId]) {
        const strategy = this.tactics[clubId].bpStrategy;
        if (!strategy.banTargets.includes(heroId)) {
          strategy.banTargets.push(heroId);
          this.tactics[clubId].updatedAt = new Date();
        }
      }
    },

    removeBanTarget(clubId: string, heroId: string): void {
      if (this.tactics[clubId]) {
        const strategy = this.tactics[clubId].bpStrategy;
        strategy.banTargets = strategy.banTargets.filter(id => id !== heroId);
        this.tactics[clubId].updatedAt = new Date();
      }
    },

    useCommand(clubId: string, commandId: string): boolean {
      if (this.tactics[clubId]) {
        const command = this.tactics[clubId].inGameCommands.find(c => c.id === commandId);
        if (command) {
          command.lastUsed = new Date();
          return true;
        }
      }
      return false;
    },

    updateVersionUnderstandingLevel(clubId: string, level: number): void {
      if (this.versionUnderstandings[clubId]) {
        this.versionUnderstandings[clubId].understandingLevel = Math.min(100, Math.max(0, level));
        this.versionUnderstandings[clubId].lastUpdated = new Date();
      }
    },

    addResearchProgress(clubId: string, progress: number): void {
      if (this.versionUnderstandings[clubId]) {
        const newProgress = this.versionUnderstandings[clubId].researchProgress + progress;
        this.versionUnderstandings[clubId].researchProgress = Math.min(100, newProgress);
        this.versionUnderstandings[clubId].understandingLevel = this.versionUnderstandings[clubId].researchProgress;
        this.versionUnderstandings[clubId].lastUpdated = new Date();
      }
    },

    clearTactics(clubId: string): void {
      delete this.tactics[clubId];
      delete this.versionUnderstandings[clubId];
    },

    resetTactics(clubId: string): void {
      this.tactics[clubId] = createDefaultTactics(clubId);
      this.versionUnderstandings[clubId] = createDefaultVersionUnderstanding();
    },
  },

  persist: true,
});

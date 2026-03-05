import { defineStore } from 'pinia';
import { heroSystem, type HeroPoolAnalysis, type VersionUpdate } from '@/core/services/heroSystem';
import { heroes } from '@/data/heroes';
import type { HeroRole, Position } from '@/types';
import type { Hero } from '@/core/models/Hero';

// 选手英雄熟练度数据
interface PlayerHeroData {
  playerId: string;
  heroMasteries: Record<string, number>; // heroId -> mastery
}

interface HeroState {
  initialized: boolean;
  playerHeroData: Map<string, PlayerHeroData>;
  currentVersion: string;
  versionHistory: VersionUpdate[];
  lastUpdateWeek: number;
}

export const useHeroStore = defineStore('hero', {
  state: (): HeroState => ({
    initialized: false,
    playerHeroData: new Map(),
    currentVersion: '1.0.0',
    versionHistory: [],
    lastUpdateWeek: 0,
  }),

  getters: {
    // 获取所有英雄
    allHeroes: () => heroSystem.getAllHeroes(),

    // 获取版本强势英雄
    metaHeroes: () => heroSystem.getMetaHeroes(2),

    // 获取当前版本
    currentVersion: (state) => state.currentVersion,

    // 获取版本历史
    versionHistory: (state) => state.versionHistory,

    // 获取选手英雄熟练度
    getPlayerHeroMasteries: (state) => (playerId: string): Map<string, number> => {
      const data = state.playerHeroData.get(playerId);
      if (!data) return new Map();
      return new Map(Object.entries(data.heroMasteries));
    },

    // 获取选手特定英雄熟练度
    getHeroMastery: (state) => (playerId: string, heroId: string): number => {
      const data = state.playerHeroData.get(playerId);
      if (!data) return 0;
      return data.heroMasteries[heroId] || 0;
    },

    // 分析选手英雄池
    getPlayerHeroPoolAnalysis: (state) => (playerId: string): HeroPoolAnalysis | null => {
      const masteries = new Map<string, number>();
      const data = state.playerHeroData.get(playerId);
      if (data) {
        Object.entries(data.heroMasteries).forEach(([heroId, mastery]) => {
          masteries.set(heroId, mastery);
        });
      }
      return heroSystem.analyzeHeroPool(masteries);
    },

    // 获取推荐英雄
    getRecommendedHeroes: () => (position: Position, playerId: string, limit: number = 5) => {
      const masteries = new Map<string, number>();
      // 这里需要从store获取选手的熟练度数据
      return heroSystem.recommendHeroesForPosition(position, masteries, limit);
    },

    // 根据定位筛选英雄
    getHeroesByRole: () => (role: HeroRole) => heroSystem.getHeroesByRole(role),

    // 根据位置筛选英雄
    getHeroesByPosition: () => (position: Position) => heroSystem.getHeroesByPosition(position),

    // 获取英雄
    getHero: () => (heroId: string): Hero | undefined => heroSystem.getHero(heroId),
  },

  actions: {
    // 初始化英雄系统
    initialize() {
      if (this.initialized) return;

      heroSystem.initialize(heroes);
      this.currentVersion = heroSystem.getCurrentVersion();
      this.initialized = true;
    },

    // 为选手初始化英雄熟练度
    initializePlayerHeroData(playerId: string, position: Position) {
      if (this.playerHeroData.has(playerId)) return;

      const heroMasteries: Record<string, number> = {};

      // 根据位置初始化一些基础熟练度
      const positionHeroes = heroSystem.getHeroesByPosition(position);
      positionHeroes.slice(0, 5).forEach(hero => {
        // 基础熟练度 10-30
        heroMasteries[hero.id] = 10 + Math.floor(Math.random() * 20);
      });

      this.playerHeroData.set(playerId, {
        playerId,
        heroMasteries,
      });
    },

    // 增加英雄熟练度
    addHeroMastery(playerId: string, heroId: string, amount: number) {
      const data = this.playerHeroData.get(playerId);
      if (!data) return;

      const current = data.heroMasteries[heroId] || 0;
      data.heroMasteries[heroId] = Math.min(100, current + amount);
    },

    // 训练英雄熟练度
    trainHeroMastery(playerId: string, heroId: string, intensity: number = 1) {
      const baseGain = 2 * intensity;
      const randomBonus = Math.random() * 2;
      const totalGain = baseGain + randomBonus;

      this.addHeroMastery(playerId, heroId, totalGain);
    },

    // 比赛后增加熟练度
    addMatchMastery(playerId: string, heroId: string, performance: number) {
      // 根据表现增加熟练度
      const baseGain = 1;
      const performanceBonus = performance * 0.5;
      const totalGain = baseGain + performanceBonus;

      this.addHeroMastery(playerId, heroId, totalGain);
    },

    // 应用版本更新
    applyVersionUpdate(currentWeek: number) {
      // 每4周进行一次版本更新
      if (currentWeek - this.lastUpdateWeek < 4) return;

      const update = heroSystem.generateRandomUpdate();
      heroSystem.applyVersionUpdate(update);

      this.currentVersion = update.version;
      this.versionHistory.push(update);
      this.lastUpdateWeek = currentWeek;
    },

    // 获取英雄熟练度等级信息
    getMasteryLevel(mastery: number) {
      return heroSystem.getMasteryLevel(mastery);
    },

    // 计算英雄加成
    calculateHeroBonus(playerStats: number, heroMastery: number): number {
      return heroSystem.calculateHeroBonus(playerStats, heroMastery);
    },

    // 重置数据
    reset() {
      this.playerHeroData.clear();
      this.versionHistory = [];
      this.currentVersion = '1.0.0';
      this.lastUpdateWeek = 0;
      this.initialized = false;
    },
  },

  persist: {
    serializer: {
      serialize: (state) => {
        return JSON.stringify({
          ...state,
          playerHeroData: Array.from(state.playerHeroData.entries()),
        });
      },
      deserialize: (value) => {
        const parsed = JSON.parse(value);
        return {
          ...parsed,
          playerHeroData: new Map(parsed.playerHeroData),
        };
      },
    },
  },
});

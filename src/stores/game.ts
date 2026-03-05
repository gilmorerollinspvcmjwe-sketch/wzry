import { defineStore } from 'pinia';
import type { GameState, Difficulty } from '@/types';

interface GameSettings {
  difficulty: Difficulty;
  autoSave: boolean;
  autoSaveInterval: number;
}

interface GameStateInterface {
  gameState: GameState;
  currentDate: Date;
  currentSeason: number;
  gameSpeed: number;
  settings: GameSettings;
  pendingEvents: any[];
  achievements: string[];
}

export const useGameStore = defineStore('game', {
  state: (): GameStateInterface => ({
    gameState: 'menu',
    currentDate: new Date(2024, 0, 1),
    currentSeason: 1,
    gameSpeed: 1,
    settings: {
      difficulty: 'normal',
      autoSave: true,
      autoSaveInterval: 5,
    },
    pendingEvents: [],
    achievements: [],
  }),
  
  getters: {
    // 当前阶段
    currentPhase: (state) => {
      const date = state.currentDate instanceof Date ? state.currentDate : new Date(state.currentDate);
      const month = date.getMonth();
      if (month < 2) return 'spring_season';
      if (month < 5) return 'spring_playoff';
      if (month < 8) return 'summer_break';
      if (month < 11) return 'autumn_season';
      return 'worlds';
    },
    
    // 是否为转会期
    isTransferWindow: (state) => {
      const date = state.currentDate instanceof Date ? state.currentDate : new Date(state.currentDate);
      const month = date.getMonth();
      return month === 0 || month === 6;
    },
  },
  
  actions: {
    // 开始新游戏
    newGame(_clubName: string, difficulty: Difficulty = 'normal') {
      this.gameState = 'playing';
      this.currentDate = new Date(2024, 0, 1);
      this.currentSeason = 1;
      this.settings.difficulty = difficulty;
      this.pendingEvents = [];
      this.achievements = [];
    },
    
    // 推进时间
    advanceTime(days: number = 1) {
      for (let i = 0; i < days; i++) {
        this.currentDate = new Date(this.currentDate.setDate(this.currentDate.getDate() + 1));
        this.onDayPassed();
      }
    },
    
    // 每日事件
    onDayPassed() {
      // 检查随机事件
      this.checkRandomEvents();
      
      // 每周一更新
      if (this.currentDate.getDay() === 1) {
        this.onWeekPassed();
      }
    },
    
    // 每周事件
    onWeekPassed() {
      // 这里会调用 clubStore 和 playerStore 的周更新
      console.log('Week passed');
    },
    
    // 检查随机事件
    checkRandomEvents() {
      // TODO: 实现事件触发逻辑
    },
    
    // 保存游戏
    saveGame(): string {
      const saveData = {
        game: this.$state,
      };
      const saveId = `save_${Date.now()}`;
      localStorage.setItem(saveId, JSON.stringify(saveData));
      return saveId;
    },
    
    // 加载游戏
    loadGame(saveId: string) {
      const saveData = JSON.parse(localStorage.getItem(saveId) || '{}');
      if (saveData.game) {
        this.$patch(saveData.game);
      }
    },
  },
  
  persist: true,
});

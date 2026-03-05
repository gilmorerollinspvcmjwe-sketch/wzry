import { defineStore } from 'pinia';
import type { GameState, Difficulty } from '@/types';
import { useClubStore } from './club';
import { usePlayerStore } from './player';
import { useHeroStore } from './hero';
import { useSponsorStore } from './sponsor';
import { useFanReputationStore } from './fanReputation';
import { useLeagueStore } from './league';

interface GameSettings {
  difficulty: Difficulty;
  autoSave: boolean;
  autoSaveInterval: number;
}

interface GameStateInterface {
  gameState: GameState;
  currentDate: Date;
  currentSeason: number;
  currentWeek: number;
  gameSpeed: number;
  settings: GameSettings;
  pendingEvents: any[];
  achievements: string[];
  weeklyReport: WeeklyReport | null;
}

// 周报数据
interface WeeklyReport {
  week: number;
  fanChange: number;
  reputationChange: number;
  sponsorIncome: number;
  sponsorBonus: number;
  fanIncome: number;
  totalIncome: number;
  message: string;
}

export const useGameStore = defineStore('game', {
  state: (): GameStateInterface => ({
    gameState: 'menu',
    currentDate: new Date(2024, 0, 1),
    currentSeason: 1,
    currentWeek: 1,
    gameSpeed: 1,
    settings: {
      difficulty: 'normal',
      autoSave: true,
      autoSaveInterval: 5,
    },
    pendingEvents: [],
    achievements: [],
    weeklyReport: null,
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
      this.currentWeek = 1;
      this.settings.difficulty = difficulty;
      this.pendingEvents = [];
      this.achievements = [];
      this.weeklyReport = null;

      // 初始化各子系统
      this.initializeSystems();
    },

    // 初始化各系统
    initializeSystems() {
      const heroStore = useHeroStore();
      const sponsorStore = useSponsorStore();
      const fanReputationStore = useFanReputationStore();

      // 初始化英雄系统
      heroStore.initialize();

      // 初始化赞助商系统
      sponsorStore.initialize();

      // 初始化粉丝声望系统
      fanReputationStore.initialize(10000, 30);
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
      this.currentWeek++;

      const clubStore = useClubStore();
      const playerStore = usePlayerStore();
      const heroStore = useHeroStore();
      const sponsorStore = useSponsorStore();
      const fanReputationStore = useFanReputationStore();
      const leagueStore = useLeagueStore();

      // 获取当前俱乐部数据
      const club = clubStore.currentClub;
      if (!club) return;

      // 1. 处理赞助商周结算
      const currentRanking = leagueStore.currentStanding?.position || 10;
      const winRate = leagueStore.currentStanding ?
        leagueStore.currentStanding.wins / Math.max(1, leagueStore.currentStanding.wins + leagueStore.currentStanding.losses) :
        0.5;

      const sponsorResult = sponsorStore.processWeeklySettlement(
        this.currentWeek,
        currentRanking,
        winRate,
        club.fans
      );

      // 添加赞助收入
      if (sponsorResult.income > 0) {
        clubStore.addFunds(sponsorResult.income + sponsorResult.bonus);
      }

      // 2. 处理粉丝与声望周增长
      const fanResult = fanReputationStore.processWeeklyGrowth(
        this.currentWeek,
        currentRanking,
        winRate,
        sponsorStore.hasSponsor
      );

      // 添加粉丝收入
      const fanIncome = fanReputationStore.weeklyFanIncome;
      clubStore.addFunds(fanIncome);

      // 同步粉丝和声望到俱乐部
      club.fans = fanReputationStore.totalFans;
      club.reputation = fanReputationStore.reputation;

      // 3. 检查版本更新
      heroStore.applyVersionUpdate(this.currentWeek);

      // 4. 选手恢复体力
      club.roster.forEach(player => {
        playerStore.recoverPlayer(player.id);
      });

      // 5. 生成周报
      this.weeklyReport = {
        week: this.currentWeek,
        fanChange: fanResult.fanChange,
        reputationChange: fanResult.reputationChange,
        sponsorIncome: sponsorResult.income,
        sponsorBonus: sponsorResult.bonus,
        fanIncome: fanIncome,
        totalIncome: sponsorResult.income + sponsorResult.bonus + fanIncome,
        message: sponsorResult.message,
      };

      console.log('Week passed:', this.currentWeek, 'Report:', this.weeklyReport);
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

import { defineStore } from 'pinia';
import type { GameState, Difficulty } from '@/types';
import { useClubStore } from './club';
import { usePlayerStore } from './player';
import { useSponsorStore } from './sponsor';
import { useFanReputationStore } from './fanReputation';
import { useEventStore } from './event';
import { useMediaStore } from './media';
import { useAIStore } from './ai';
import { AIService } from '@/core/services/aiService';

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
      const sponsorStore = useSponsorStore();
      const fanReputationStore = useFanReputationStore();
      const mediaStore = useMediaStore();

      // 初始化英雄系统 - 简化版无需初始化

      // 初始化赞助商系统
      sponsorStore.initialize();

      // 初始化粉丝声望系统
      fanReputationStore.initialize(10000, 30);

      // 初始化媒体系统
      mediaStore.initialize();
    },
    
    // 推进时间
    advanceTime(days: number = 1) {
      // 确保 currentDate 是 Date 对象（Pinia 持久化后会变成字符串）
      const currentDateObj = this.currentDate instanceof Date 
        ? this.currentDate 
        : new Date(this.currentDate);
      
      for (let i = 0; i < days; i++) {
        currentDateObj.setDate(currentDateObj.getDate() + 1);
        this.currentDate = new Date(currentDateObj);
        this.onDayPassed();
      }
    },
    
    // 每日事件
    onDayPassed() {
      // 确保 currentDate 是 Date 对象
      const currentDateObj = this.currentDate instanceof Date 
        ? this.currentDate 
        : new Date(this.currentDate);
      
      // 检查随机事件
      this.checkRandomEvents();
      
      // 每周一更新
      if (currentDateObj.getDay() === 1) {
        this.onWeekPassed();
      }
    },
    
    // 检查随机事件（集成事件系统）
    checkRandomEvents() {
      const eventStore = useEventStore();
      const clubStore = useClubStore();
      const club = clubStore.currentClub;
      
      if (!club) return;
      
      // 创建俱乐部状态对象用于事件触发
      const clubState = {
        funds: club.funds,
        reputation: club.reputation,
        fans: club.fans,
        week: this.currentWeek,
        ranking: 10, // TODO: 从联赛排名获取
        winRate: 0.5, // TODO: 从比赛记录获取
        seasonPhase: 'regular' as const,
        playerCount: club.roster.length,
        hasPlayer: (_playerType: string) => {
          // TODO: 实现选手类型检查
          return false;
        },
      };
      
      // 触发每日事件
      const currentDay = Math.floor((this.currentDate.getTime() - new Date(2024, 0, 1).getTime()) / (1000 * 60 * 60 * 24));
      eventStore.triggerDailyEvent(currentDay, clubState);
    },
    
    // 每周事件
    onWeekPassed() {
      this.currentWeek++;

      const clubStore = useClubStore();
      const playerStore = usePlayerStore();
      const sponsorStore = useSponsorStore();
      const fanReputationStore = useFanReputationStore();
      const mediaStore = useMediaStore();

      // 获取当前俱乐部数据
      const club = clubStore.currentClub;
      if (!club) return;

      // 1. AI 俱乐部周模拟
      this.simulateAIClubs();

      // 2. 处理赞助商周结算
      const currentRanking = 10;
      const winRate = 0.5;

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

      // 3. 处理粉丝与声望周增长
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

      // 4. 媒体系统周更新
      mediaStore.onWeekAdvance();

      // 5. 检查版本更新 - 简化版暂不实现

      // 6. 选手恢复体力
      club.roster.forEach(player => {
        playerStore.recoverPlayer(player.id);
      });

      // 7. 生成周报
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
    
    // AI 俱乐部周模拟
    simulateAIClubs() {
      const clubStore = useClubStore();
      const playerStore = usePlayerStore();
      const aiStore = useAIStore();

      // 获取所有 AI 俱乐部（排除玩家俱乐部）
      const allClubs = clubStore.allClubs;
      const playerClubId = clubStore.currentClub?.id;

      if (!playerClubId) return;

      // 获取所有可用选手（自由球员 + 青训）
      const availablePlayers = playerStore.availablePlayers;

      // 遍历所有 AI 俱乐部
      allClubs.forEach(club => {
        if (club.id === playerClubId) return; // 跳过玩家俱乐部

        // 初始化 AI 配置（如果还没有）
        if (!AIService.getAIProfile(club.id)) {
          // 优先从 store 恢复
          const storedProfile = aiStore.getAIProfile(club.id);
          if (storedProfile && storedProfile.template) {
            AIService.initAIClub(club.id, storedProfile.template);
          } else {
            AIService.initAIClub(club.id);
          }
        }

        // 执行 AI 周模拟（使用类型断言处理 Pinia 持久化后的对象）
        const clubWithMethods = club as any;
        if (clubWithMethods.roster) {
          AIService.simulateAIWeek(clubWithMethods, availablePlayers);
        }

        // 更新 AI Profile 到 store（持久化）
        const updatedProfile = AIService.getAIProfile(club.id);
        if (updatedProfile) {
          aiStore.setAIProfile(club.id, updatedProfile);
        }
      });
    },
    
    // 检查随机事件已在上面定义
    
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

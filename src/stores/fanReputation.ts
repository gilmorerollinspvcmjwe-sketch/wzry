import { defineStore } from 'pinia';
import {
  type FanSentiment,
  REPUTATION_LEVELS,
  type ReputationLevel,
} from '@/core/services/fanReputationSystem';

// 粉丝群体
interface FanBase {
  totalFans: number;
  activeFans: number;
  sentiment: FanSentiment;
  sentimentValue: number;
  loyalty: number;
  engagement: number;
}

interface FanReputationState {
  initialized: boolean;
  fanBase: FanBase | null;
  reputationValue: number;
  history: { week: number; fans: number; reputation: number }[];
}

export const useFanReputationStore = defineStore('fanReputation', {
  state: (): FanReputationState => ({
    initialized: false,
    fanBase: null,
    reputationValue: 30,
    history: [],
  }),

  getters: {
    // 粉丝数量
    totalFans: (state) => state.fanBase?.totalFans || 0,

    // 活跃粉丝
    activeFans: (state) => state.fanBase?.activeFans || 0,

    // 粉丝情绪
    sentiment: (state) => state.fanBase?.sentiment || 'neutral',

    // 粉丝情绪数值
    sentimentValue: (state) => state.fanBase?.sentimentValue || 50,

    // 粉丝忠诚度
    loyalty: (state) => state.fanBase?.loyalty || 50,

    // 粉丝参与度
    engagement: (state) => state.fanBase?.engagement || 30,

    // 声望值
    reputation: (state) => state.reputationValue,

    // 声望等级
    reputationLevel: (state): ReputationLevel => {
      const value = state.reputationValue;
      for (const level of REPUTATION_LEVELS) {
        if (value >= level.minReputation && value < level.maxReputation) {
          return level;
        }
      }
      return REPUTATION_LEVELS[REPUTATION_LEVELS.length - 1]!;
    },

    // 声望等级名称
    reputationLevelName: (state): string => {
      const value = state.reputationValue;
      for (const level of REPUTATION_LEVELS) {
        if (value >= level.minReputation && value < level.maxReputation) {
          return level.name;
        }
      }
      return REPUTATION_LEVELS[REPUTATION_LEVELS.length - 1]!.name;
    },

    // 周粉丝收入
    weeklyFanIncome: (state) => {
      const activeFans = state.fanBase?.activeFans || 0;
      return activeFans * 0.01;
    },

    // 所有声望等级
    allReputationLevels: () => REPUTATION_LEVELS,
  },

  actions: {
    // 初始化
    initialize(initialFans: number = 10000, initialReputation: number = 30) {
      if (this.initialized) return;

      this.fanBase = {
        totalFans: initialFans,
        activeFans: Math.floor(initialFans * 0.3),
        sentiment: 'neutral',
        sentimentValue: 50,
        loyalty: 50,
        engagement: 30,
      };
      this.reputationValue = initialReputation;
      this.history = [];
      this.initialized = true;
    },

    // 更新活跃粉丝
    _updateActiveFans() {
      if (!this.fanBase) return;
      const sentimentFactor = this.fanBase.sentimentValue / 100;
      const loyaltyFactor = this.fanBase.loyalty / 100;
      const activeRate = 0.2 + (sentimentFactor * 0.3) + (loyaltyFactor * 0.2);
      this.fanBase.activeFans = Math.floor(this.fanBase.totalFans * activeRate);
      this.fanBase.engagement = Math.floor((sentimentFactor + loyaltyFactor) * 50);
    },

    // 更新粉丝情绪
    _updateSentiment() {
      if (!this.fanBase) return;
      const value = this.fanBase.sentimentValue;
      if (value >= 80) {
        this.fanBase.sentiment = 'ecstatic';
      } else if (value >= 60) {
        this.fanBase.sentiment = 'happy';
      } else if (value >= 40) {
        this.fanBase.sentiment = 'neutral';
      } else if (value >= 20) {
        this.fanBase.sentiment = 'disappointed';
      } else {
        this.fanBase.sentiment = 'angry';
      }
    },

    // 处理比赛结果
    processMatchResult(won: boolean, isImportant: boolean = false, performance: number = 0.5) {
      if (!this.fanBase) return { type: 'match_result', description: '', fanChange: 0, sentimentChange: 0, reputationChange: 0 };

      const baseFanChange = won ? 100 : -50;
      const baseSentimentChange = won ? 5 : -10;
      const baseReputationChange = won ? 0.5 : -0.2;

      const multiplier = isImportant ? 2 : 1;
      const performanceMultiplier = 0.5 + performance;

      const impact = {
        type: 'match_result' as const,
        description: won ? '比赛获胜' : '比赛失利',
        fanChange: Math.round(baseFanChange * multiplier * performanceMultiplier),
        sentimentChange: baseSentimentChange * multiplier,
        reputationChange: baseReputationChange * multiplier * performanceMultiplier,
      };

      // 应用影响
      this.fanBase.totalFans = Math.max(0, this.fanBase.totalFans + impact.fanChange);
      this.fanBase.sentimentValue = Math.max(0, Math.min(100,
        this.fanBase.sentimentValue + impact.sentimentChange
      ));
      this.reputationValue = Math.max(0, Math.min(100,
        this.reputationValue + impact.reputationChange
      ));

      this._updateSentiment();
      this._updateActiveFans();

      return impact;
    },

    // 处理选手转会
    processPlayerTransfer(isSigning: boolean, playerReputation: number, isStar: boolean = false) {
      if (!this.fanBase) return { type: 'player_transfer', description: '', fanChange: 0, sentimentChange: 0, reputationChange: 0 };

      const impact = {
        type: 'player_transfer' as const,
        description: isSigning ? `签约${isStar ? '明星' : ''}选手` : '选手离队',
        fanChange: isSigning ? playerReputation * 10 : -playerReputation * 5,
        sentimentChange: isSigning ? (isStar ? 15 : 5) : -5,
        reputationChange: isSigning ? (isStar ? 2 : 0.5) : -0.5,
      };

      this.fanBase.totalFans = Math.max(0, this.fanBase.totalFans + impact.fanChange);
      this.fanBase.sentimentValue = Math.max(0, Math.min(100,
        this.fanBase.sentimentValue + impact.sentimentChange
      ));
      this.reputationValue = Math.max(0, Math.min(100,
        this.reputationValue + impact.reputationChange
      ));

      this._updateSentiment();
      this._updateActiveFans();

      return impact;
    },

    // 处理夺冠
    processTrophyWin(trophyLevel: 'championship' | 'playoff' | 'regular') {
      if (!this.fanBase) return { type: 'trophy', description: '', fanChange: 0, sentimentChange: 0, reputationChange: 0 };

      const multipliers = {
        championship: 5,
        playoff: 2,
        regular: 1,
      };
      const multiplier = multipliers[trophyLevel];

      const impact = {
        type: 'trophy' as const,
        description: trophyLevel === 'championship' ? '夺得联赛冠军' : '季后赛优胜',
        fanChange: 1000 * multiplier,
        sentimentChange: 30 * multiplier,
        reputationChange: 5 * multiplier,
      };

      this.fanBase.totalFans = Math.max(0, this.fanBase.totalFans + impact.fanChange);
      this.fanBase.sentimentValue = Math.max(0, Math.min(100,
        this.fanBase.sentimentValue + impact.sentimentChange
      ));
      this.reputationValue = Math.max(0, Math.min(100,
        this.reputationValue + impact.reputationChange
      ));

      this._updateSentiment();
      this._updateActiveFans();

      return impact;
    },

    // 处理丑闻
    processScandal(severity: 'minor' | 'major' | 'severe') {
      if (!this.fanBase) return { type: 'scandal', description: '', fanChange: 0, sentimentChange: 0, reputationChange: 0 };

      const multipliers = {
        minor: 0.5,
        major: 1,
        severe: 2,
      };
      const multiplier = multipliers[severity];

      const impact = {
        type: 'scandal' as const,
        description: '俱乐部丑闻',
        fanChange: Math.round(-500 * multiplier),
        sentimentChange: -20 * multiplier,
        reputationChange: -3 * multiplier,
      };

      this.fanBase.totalFans = Math.max(0, this.fanBase.totalFans + impact.fanChange);
      this.fanBase.sentimentValue = Math.max(0, Math.min(100,
        this.fanBase.sentimentValue + impact.sentimentChange
      ));
      this.reputationValue = Math.max(0, Math.min(100,
        this.reputationValue + impact.reputationChange
      ));

      this._updateSentiment();
      this._updateActiveFans();

      return impact;
    },

    // 处理周增长
    processWeeklyGrowth(currentWeek: number, currentRanking: number, winRate: number, hasSponsor: boolean) {
      if (!this.fanBase) return { fanChange: 0, reputationChange: 0 };

      // 基础增长
      let fanGrowth = this.fanBase.totalFans * 0.01;
      let reputationGrowth = 0.1;

      // 排名影响
      const rankingFactor = Math.max(0, (10 - currentRanking) / 10);
      fanGrowth *= (1 + rankingFactor);
      reputationGrowth += rankingFactor * 0.2;

      // 胜率影响
      fanGrowth *= (0.5 + winRate);
      reputationGrowth += (winRate - 0.5) * 0.3;

      // 赞助商影响
      if (hasSponsor) {
        fanGrowth *= 1.1;
        reputationGrowth *= 1.1;
      }

      // 情绪衰减
      const sentimentDecay = this.fanBase.sentimentValue > 50 ? -1 : 1;
      this.fanBase.sentimentValue = Math.max(0, Math.min(100,
        this.fanBase.sentimentValue + sentimentDecay
      ));
      this._updateSentiment();

      // 应用增长
      const fanChange = Math.round(fanGrowth);
      this.fanBase.totalFans += fanChange;
      this.reputationValue = Math.min(100, this.reputationValue + reputationGrowth);

      this._updateActiveFans();

      // 记录历史
      this.history.push({
        week: currentWeek,
        fans: this.fanBase.totalFans,
        reputation: this.reputationValue,
      });

      // 只保留最近10周的历史
      if (this.history.length > 10) {
        this.history.shift();
      }

      return {
        fanChange,
        reputationChange: reputationGrowth,
      };
    },

    // 增加忠诚度
    addLoyalty(amount: number) {
      if (!this.fanBase) return;
      this.fanBase.loyalty = Math.max(0, Math.min(100, this.fanBase.loyalty + amount));
      this._updateActiveFans();
    },

    // 增加粉丝数量（商业活动等场景使用）
    addFans(amount: number) {
      if (!this.fanBase) return;
      this.fanBase.totalFans = Math.max(0, this.fanBase.totalFans + amount);
      this._updateActiveFans();
    },

    // 增加声望值
    addReputation(amount: number) {
      this.reputationValue = Math.max(0, this.reputationValue + amount);
    },

    // 设置忠诚度
    setLoyalty(loyalty: number) {
      if (!this.fanBase) return;
      this.fanBase.loyalty = Math.max(0, Math.min(100, loyalty));
      this._updateActiveFans();
    },

    // 直接设置数值（用于加载存档）
    setValues(fans: number, reputation: number, sentiment: number, loyalty: number) {
      if (!this.fanBase) return;
      this.fanBase.totalFans = fans;
      this.fanBase.sentimentValue = sentiment;
      this.fanBase.loyalty = loyalty;
      this.reputationValue = reputation;
      this._updateSentiment();
      this._updateActiveFans();
    },

    // 获取声望等级信息
    getReputationLevel(value: number): ReputationLevel {
      for (const level of REPUTATION_LEVELS) {
        if (value >= level.minReputation && value < level.maxReputation) {
          return level;
        }
      }
      return REPUTATION_LEVELS[REPUTATION_LEVELS.length - 1]!;
    },

    // 重置
    reset() {
      this.fanBase = null;
      this.reputationValue = 30;
      this.history = [];
      this.initialized = false;
    },
  },

  persist: true,
});

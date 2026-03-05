// 粉丝情绪
export type FanSentiment = 'ecstatic' | 'happy' | 'neutral' | 'disappointed' | 'angry';

// 粉丝群体
export interface FanBase {
  totalFans: number;
  activeFans: number; // 活跃粉丝
  sentiment: FanSentiment;
  sentimentValue: number; // 0-100
  loyalty: number; // 忠诚度 0-100
  engagement: number; // 参与度 0-100
}

// 声望等级
export interface ReputationLevel {
  level: number;
  name: string;
  minReputation: number;
  maxReputation: number;
  color: string;
  benefits: string[];
}

// 声望等级定义
export const REPUTATION_LEVELS: ReputationLevel[] = [
  {
    level: 1,
    name: '默默无闻',
    minReputation: 0,
    maxReputation: 20,
    color: '#9e9e9e',
    benefits: ['基础转会市场'],
  },
  {
    level: 2,
    name: '初露锋芒',
    minReputation: 20,
    maxReputation: 40,
    color: '#8bc34a',
    benefits: ['更多转会选项', '小额赞助商'],
  },
  {
    level: 3,
    name: '小有名气',
    minReputation: 40,
    maxReputation: 60,
    color: '#4caf50',
    benefits: ['中级赞助商', '青训折扣'],
  },
  {
    level: 4,
    name: '声名鹊起',
    minReputation: 60,
    maxReputation: 80,
    color: '#2196f3',
    benefits: ['高级赞助商', '明星选手关注'],
  },
  {
    level: 5,
    name: '赫赫有名',
    minReputation: 80,
    maxReputation: 95,
    color: '#9c27b0',
    benefits: ['顶级赞助商', '转会优惠'],
  },
  {
    level: 6,
    name: '传奇俱乐部',
    minReputation: 95,
    maxReputation: 100,
    color: '#ff9800',
    benefits: ['独家赞助商', '传奇选手加盟意愿'],
  },
];

// 粉丝事件影响
export interface FanEventImpact {
  type: 'match_result' | 'player_transfer' | 'trophy' | 'scandal' | 'milestone';
  description: string;
  fanChange: number;
  sentimentChange: number;
  reputationChange: number;
}

// 粉丝与声望统计
export interface FanReputationStats {
  totalFans: number;
  activeFanRate: number;
  averageSentiment: number;
  reputation: number;
  reputationLevel: ReputationLevel;
  weeklyFanChange: number;
  weeklyReputationChange: number;
}

// 粉丝与声望系统服务
export class FanReputationSystem {
  private fanBase: FanBase = {
    totalFans: 10000,
    activeFans: 3000,
    sentiment: 'neutral',
    sentimentValue: 50,
    loyalty: 50,
    engagement: 30,
  };
  private reputation: number = 30;
  private history: { week: number; fans: number; reputation: number }[] = [];

  // 初始化
  initialize(initialFans: number = 10000, initialReputation: number = 30): void {
    this.fanBase = {
      totalFans: initialFans,
      activeFans: Math.floor(initialFans * 0.3),
      sentiment: 'neutral',
      sentimentValue: 50,
      loyalty: 50,
      engagement: 30,
    };
    this.reputation = initialReputation;
    this.history = [];
  }

  // 获取粉丝群体
  getFanBase(): FanBase {
    return { ...this.fanBase };
  }

  // 获取声望
  getReputation(): number {
    return this.reputation;
  }

  // 获取声望等级
  getReputationLevel(): ReputationLevel {
    for (const level of REPUTATION_LEVELS) {
      if (this.reputation >= level.minReputation && this.reputation < level.maxReputation) {
        return level;
      }
    }
    return REPUTATION_LEVELS[REPUTATION_LEVELS.length - 1]!;
  }

  // 获取声望等级通过数值
  getReputationLevelByValue(value: number): ReputationLevel {
    for (const level of REPUTATION_LEVELS) {
      if (value >= level.minReputation && value < level.maxReputation) {
        return level;
      }
    }
    return REPUTATION_LEVELS[REPUTATION_LEVELS.length - 1]!;
  }

  // 更新粉丝情绪
  private updateSentiment(): void {
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
  }

  // 处理比赛结果对粉丝的影响
  processMatchResult(
    won: boolean,
    isImportant: boolean = false,
    performance: number = 0.5
  ): FanEventImpact {
    const baseFanChange = won ? 100 : -50;
    const baseSentimentChange = won ? 5 : -10;
    const baseReputationChange = won ? 0.5 : -0.2;

    // 重要比赛影响加倍
    const multiplier = isImportant ? 2 : 1;
    // 表现影响
    const performanceMultiplier = 0.5 + performance;

    const impact: FanEventImpact = {
      type: 'match_result',
      description: won ? '比赛获胜' : '比赛失利',
      fanChange: Math.round(baseFanChange * multiplier * performanceMultiplier),
      sentimentChange: baseSentimentChange * multiplier,
      reputationChange: baseReputationChange * multiplier * performanceMultiplier,
    };

    this.applyImpact(impact);
    return impact;
  }

  // 处理选手转会
  processPlayerTransfer(
    isSigning: boolean,
    playerReputation: number,
    isStar: boolean = false
  ): FanEventImpact {
    const impact: FanEventImpact = {
      type: 'player_transfer',
      description: isSigning ? `签约${isStar ? '明星' : ''}选手` : '选手离队',
      fanChange: isSigning ? playerReputation * 10 : -playerReputation * 5,
      sentimentChange: isSigning ? (isStar ? 15 : 5) : -5,
      reputationChange: isSigning ? (isStar ? 2 : 0.5) : -0.5,
    };

    this.applyImpact(impact);
    return impact;
  }

  // 处理夺冠
  processTrophyWin(trophyLevel: 'championship' | 'playoff' | 'regular'): FanEventImpact {
    const multipliers = {
      championship: 5,
      playoff: 2,
      regular: 1,
    };
    const multiplier = multipliers[trophyLevel];

    const impact: FanEventImpact = {
      type: 'trophy',
      description: trophyLevel === 'championship' ? '夺得联赛冠军' : '季后赛优胜',
      fanChange: 1000 * multiplier,
      sentimentChange: 30 * multiplier,
      reputationChange: 5 * multiplier,
    };

    this.applyImpact(impact);
    return impact;
  }

  // 处理丑闻
  processScandal(severity: 'minor' | 'major' | 'severe'): FanEventImpact {
    const multipliers = {
      minor: 0.5,
      major: 1,
      severe: 2,
    };
    const multiplier = multipliers[severity];

    const impact: FanEventImpact = {
      type: 'scandal',
      description: '俱乐部丑闻',
      fanChange: Math.round(-500 * multiplier),
      sentimentChange: -20 * multiplier,
      reputationChange: -3 * multiplier,
    };

    this.applyImpact(impact);
    return impact;
  }

  // 应用影响
  private applyImpact(impact: FanEventImpact): void {
    // 更新粉丝数
    this.fanBase.totalFans = Math.max(0, this.fanBase.totalFans + impact.fanChange);

    // 更新情绪
    this.fanBase.sentimentValue = Math.max(0, Math.min(100,
      this.fanBase.sentimentValue + impact.sentimentChange
    ));
    this.updateSentiment();

    // 更新声望
    this.reputation = Math.max(0, Math.min(100,
      this.reputation + impact.reputationChange
    ));

    // 更新活跃粉丝
    this.updateActiveFans();
  }

  // 更新活跃粉丝
  private updateActiveFans(): void {
    const sentimentFactor = this.fanBase.sentimentValue / 100;
    const loyaltyFactor = this.fanBase.loyalty / 100;
    const activeRate = 0.2 + (sentimentFactor * 0.3) + (loyaltyFactor * 0.2);
    this.fanBase.activeFans = Math.floor(this.fanBase.totalFans * activeRate);
    this.fanBase.engagement = Math.floor((sentimentFactor + loyaltyFactor) * 50);
  }

  // 自然增长（每周调用）
  processWeeklyGrowth(
    currentRanking: number,
    winRate: number,
    hasSponsor: boolean
  ): { fanChange: number; reputationChange: number } {
    // 基础增长
    let fanGrowth = this.fanBase.totalFans * 0.01; // 1% 基础增长
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
    this.updateSentiment();

    // 应用增长
    const fanChange = Math.round(fanGrowth);
    this.fanBase.totalFans += fanChange;
    this.reputation = Math.min(100, this.reputation + reputationGrowth);

    this.updateActiveFans();

    return {
      fanChange,
      reputationChange: reputationGrowth,
    };
  }

  // 获取粉丝收入（每周）
  getWeeklyFanIncome(): number {
    // 活跃粉丝每人贡献 0.01 万
    return this.fanBase.activeFans * 0.01;
  }

  // 获取统计
  getStats(currentWeek: number): FanReputationStats {
    const prevRecord = this.history[this.history.length - 1];
    const weeklyFanChange = prevRecord
      ? this.fanBase.totalFans - prevRecord.fans
      : 0;
    const weeklyReputationChange = prevRecord
      ? this.reputation - prevRecord.reputation
      : 0;

    // 记录历史
    this.history.push({
      week: currentWeek,
      fans: this.fanBase.totalFans,
      reputation: this.reputation,
    });

    // 只保留最近10周的历史
    if (this.history.length > 10) {
      this.history.shift();
    }

    return {
      totalFans: this.fanBase.totalFans,
      activeFanRate: this.fanBase.activeFans / this.fanBase.totalFans,
      averageSentiment: this.fanBase.sentimentValue,
      reputation: this.reputation,
      reputationLevel: this.getReputationLevel(),
      weeklyFanChange,
      weeklyReputationChange,
    };
  }

  // 获取历史
  getHistory(): { week: number; fans: number; reputation: number }[] {
    return [...this.history];
  }

  // 设置粉丝忠诚度
  setLoyalty(loyalty: number): void {
    this.fanBase.loyalty = Math.max(0, Math.min(100, loyalty));
    this.updateActiveFans();
  }

  // 增加粉丝忠诚度
  addLoyalty(amount: number): void {
    this.setLoyalty(this.fanBase.loyalty + amount);
  }

  // 直接设置数值（用于加载存档）
  setValues(fans: number, reputation: number, sentiment: number, loyalty: number): void {
    this.fanBase.totalFans = fans;
    this.fanBase.sentimentValue = sentiment;
    this.fanBase.loyalty = loyalty;
    this.reputation = reputation;
    this.updateSentiment();
    this.updateActiveFans();
  }
}

// 创建单例实例
export const fanReputationSystem = new FanReputationSystem();

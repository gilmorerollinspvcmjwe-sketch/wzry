import type {
  FanCommunity,
  FanSegment,
  FanActivity,
  FanFeedback,
  SentimentAnalysis,
  CrisisManagement,
  Crisis,
  CrisisStrategy,
  CrisisRecord,
  FanCommunityStats,
  FanSegmentType,
  ActivityType,
  FeedbackType,
  FeedbackPriority,
  CrisisType,
  CrisisSeverity,
  StrategyType,
} from '@/types/fanCommunity';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export class FanCommunityService {
  private communities: Map<string, FanCommunity> = new Map();
  private crisisManagements: Map<string, CrisisManagement> = new Map();

  initializeFanCommunity(clubId: string, initialFans: number = 10000): FanCommunity {
    const now = new Date();
    const segments = this._createInitialSegments(initialFans);

    const community: FanCommunity = {
      clubId,
      segments,
      activities: [],
      feedback: [],
      culture: this._createDefaultCulture(),
      sentimentAnalysis: this._createInitialSentiment(),
      totalMembers: initialFans,
      activeRate: 0.3,
      createdAt: now,
      updatedAt: now,
    };

    this.communities.set(clubId, community);

    this.crisisManagements.set(clubId, {
      crisis: null,
      availableStrategies: [],
      selectedStrategy: null,
      handlingProgress: 0,
      history: [],
    });

    return community;
  }

  private _createInitialSegments(totalFans: number): FanSegment[] {
    return [
      {
        type: 'core' as FanSegmentType,
        count: Math.floor(totalFans * 0.05),
        percentage: 5,
        engagement: 95,
        spending: 500,
        loyalty: 98,
      },
      {
        type: 'active' as FanSegmentType,
        count: Math.floor(totalFans * 0.15),
        percentage: 15,
        engagement: 75,
        spending: 200,
        loyalty: 80,
      },
      {
        type: 'regular' as FanSegmentType,
        count: Math.floor(totalFans * 0.35),
        percentage: 35,
        engagement: 40,
        spending: 50,
        loyalty: 50,
      },
      {
        type: 'casual' as FanSegmentType,
        count: Math.floor(totalFans * 0.45),
        percentage: 45,
        engagement: 15,
        spending: 10,
        loyalty: 20,
      },
    ];
  }

  private _createDefaultCulture() {
    return {
      values: ['团队精神', '追求卓越', '尊重对手'],
      traditions: ['赛季初粉丝见面会', '夺冠庆祝活动'],
      slogans: ['永不言弃', '为荣耀而战'],
      symbols: ['队徽', '队色', '吉祥物'],
      history: [],
    };
  }

  private _createInitialSentiment(): SentimentAnalysis {
    return {
      overall: 50,
      trend: 'stable',
      breakdown: {
        positive: 40,
        neutral: 40,
        negative: 20,
      },
      hotTopics: [],
      riskLevel: 'low',
      lastUpdated: new Date(),
    };
  }

  getFanCommunity(clubId: string): FanCommunity | undefined {
    return this.communities.get(clubId);
  }

  updateFanSegments(clubId: string, factors: {
    matchResults?: { wins: number; losses: number };
    activities?: number;
    reputation?: number;
  } = {}): FanSegment[] {
    const community = this.communities.get(clubId);
    if (!community) return [];

    const { matchResults, activities, reputation } = factors;
    let totalFans = community.totalMembers;

    if (matchResults) {
      const netWins = matchResults.wins - matchResults.losses;
      totalFans += netWins * 100;
    }

    if (activities && activities > 0) {
      totalFans += activities * 50;
    }

    if (reputation) {
      totalFans = Math.floor(totalFans * (1 + (reputation - 50) / 200));
    }

    totalFans = Math.max(1000, totalFans);
    community.totalMembers = totalFans;

    const coreCount = Math.floor(totalFans * (0.03 + (reputation ? reputation / 1000 : 0.02)));
    const activeCount = Math.floor(totalFans * (0.12 + (activities ? activities / 100 : 0.03)));
    const regularCount = Math.floor(totalFans * 0.35);
    const casualCount = totalFans - coreCount - activeCount - regularCount;

    community.segments = [
      {
        type: 'core',
        count: coreCount,
        percentage: Math.round((coreCount / totalFans) * 100),
        engagement: 95,
        spending: 500,
        loyalty: 98,
      },
      {
        type: 'active',
        count: activeCount,
        percentage: Math.round((activeCount / totalFans) * 100),
        engagement: 75,
        spending: 200,
        loyalty: 80,
      },
      {
        type: 'regular',
        count: regularCount,
        percentage: Math.round((regularCount / totalFans) * 100),
        engagement: 40,
        spending: 50,
        loyalty: 50,
      },
      {
        type: 'casual',
        count: casualCount,
        percentage: Math.round((casualCount / totalFans) * 100),
        engagement: 15,
        spending: 10,
        loyalty: 20,
      },
    ];

    community.updatedAt = new Date();
    return community.segments;
  }

  addActivity(clubId: string, activityData: {
    type: ActivityType;
    title: string;
    description: string;
    scheduledAt: Date;
    duration: number;
    capacity: number;
    cost: number;
  }): FanActivity | null {
    const community = this.communities.get(clubId);
    if (!community) return null;

    const activity: FanActivity = {
      id: generateId(),
      type: activityData.type,
      title: activityData.title,
      description: activityData.description,
      scheduledAt: activityData.scheduledAt,
      duration: activityData.duration,
      capacity: activityData.capacity,
      participants: 0,
      cost: activityData.cost,
      rewards: this._calculateActivityRewards(activityData.type),
      status: 'planning',
      sentiment: 50,
    };

    community.activities.push(activity);
    community.updatedAt = new Date();
    return activity;
  }

  private _calculateActivityRewards(type: ActivityType) {
    const rewards = {
      fan_meeting: { loyalty: 15, engagement: 20, fans: 200, reputation: 2 },
      online_event: { loyalty: 5, engagement: 15, fans: 100, reputation: 1 },
      watch_party: { loyalty: 10, engagement: 25, fans: 50, reputation: 1 },
      charity: { loyalty: 20, engagement: 10, fans: 300, reputation: 5 },
      merchandise: { loyalty: 5, engagement: 5, fans: 0, reputation: 0 },
      training_open: { loyalty: 12, engagement: 18, fans: 150, reputation: 2 },
    };
    return rewards[type] || { loyalty: 5, engagement: 5, fans: 50, reputation: 1 };
  }

  updateActivityStatus(clubId: string, activityId: string, status: FanActivity['status']): FanActivity | null {
    const community = this.communities.get(clubId);
    if (!community) return null;

    const activity = community.activities.find(a => a.id === activityId);
    if (!activity) return null;

    activity.status = status;

    if (status === 'completed') {
      this._applyActivityRewards(clubId, activity);
    }

    community.updatedAt = new Date();
    return activity;
  }

  private _applyActivityRewards(clubId: string, activity: FanActivity): void {
    const community = this.communities.get(clubId);
    if (!community) return;

    const participationRate = activity.participants / activity.capacity;
    const multiplier = 0.5 + participationRate;

    community.totalMembers += Math.floor(activity.rewards.fans * multiplier);

    for (const segment of community.segments) {
      if (segment.type === 'core' || segment.type === 'active') {
        segment.loyalty = Math.min(100, segment.loyalty + activity.rewards.loyalty * multiplier * 0.5);
        segment.engagement = Math.min(100, segment.engagement + activity.rewards.engagement * multiplier * 0.5);
      }
    }

    this.updateFanSegments(clubId, { activities: 1 });
  }

  collectFeedback(clubId: string, feedbackData: {
    type: FeedbackType;
    priority?: FeedbackPriority;
    content: string;
    source: FanFeedback['source'];
    sentiment: number;
  }): FanFeedback | null {
    const community = this.communities.get(clubId);
    if (!community) return null;

    const feedback: FanFeedback = {
      id: generateId(),
      type: feedbackData.type,
      priority: feedbackData.priority || this._determinePriority(feedbackData.type, feedbackData.sentiment),
      content: feedbackData.content,
      source: feedbackData.source,
      sentiment: feedbackData.sentiment,
      likes: 0,
      createdAt: new Date(),
      status: 'pending',
    };

    community.feedback.unshift(feedback);

    if (community.feedback.length > 100) {
      community.feedback = community.feedback.slice(0, 100);
    }

    community.updatedAt = new Date();
    return feedback;
  }

  private _determinePriority(type: FeedbackType, sentiment: number): FeedbackPriority {
    if (type === 'complaint' && sentiment < 30) return 'urgent';
    if (type === 'complaint' && sentiment < 50) return 'high';
    if (type === 'suggestion') return 'medium';
    if (type === 'praise') return 'low';
    return 'medium';
  }

  respondToFeedback(clubId: string, feedbackId: string, response: string): FanFeedback | null {
    const community = this.communities.get(clubId);
    if (!community) return null;

    const feedback = community.feedback.find(f => f.id === feedbackId);
    if (!feedback) return null;

    feedback.response = response;
    feedback.status = 'addressed';
    community.updatedAt = new Date();
    return feedback;
  }

  calculateSentiment(clubId: string): SentimentAnalysis | null {
    const community = this.communities.get(clubId);
    if (!community) return null;

    const feedbacks = community.feedback.slice(0, 50);
    if (feedbacks.length === 0) {
      community.sentimentAnalysis.lastUpdated = new Date();
      return community.sentimentAnalysis;
    }

    const totalSentiment = feedbacks.reduce((sum, f) => sum + f.sentiment, 0);
    const avgSentiment = totalSentiment / feedbacks.length;

    const positive = feedbacks.filter(f => f.sentiment >= 60).length / feedbacks.length * 100;
    const negative = feedbacks.filter(f => f.sentiment < 40).length / feedbacks.length * 100;
    const neutral = 100 - positive - negative;

    const previousSentiment = community.sentimentAnalysis.overall;
    let trend: SentimentAnalysis['trend'] = 'stable';
    if (avgSentiment > previousSentiment + 5) trend = 'rising';
    else if (avgSentiment < previousSentiment - 5) trend = 'falling';

    let riskLevel: SentimentAnalysis['riskLevel'] = 'low';
    if (avgSentiment < 30 || negative > 50) riskLevel = 'critical';
    else if (avgSentiment < 40 || negative > 35) riskLevel = 'high';
    else if (avgSentiment < 50 || negative > 25) riskLevel = 'medium';

    community.sentimentAnalysis = {
      overall: Math.round(avgSentiment),
      trend,
      breakdown: {
        positive: Math.round(positive),
        neutral: Math.round(neutral),
        negative: Math.round(negative),
      },
      hotTopics: this._extractHotTopics(feedbacks),
      riskLevel,
      lastUpdated: new Date(),
    };

    community.updatedAt = new Date();
    return community.sentimentAnalysis;
  }

  private _extractHotTopics(feedbacks: FanFeedback[]) {
    const topics = new Map<string, { mentions: number; totalSentiment: number }>();

    for (const feedback of feedbacks) {
      const words = feedback.content.toLowerCase().split(/\s+/);
      for (const word of words) {
        if (word.length > 3) {
          const existing = topics.get(word) || { mentions: 0, totalSentiment: 0 };
          existing.mentions++;
          existing.totalSentiment += feedback.sentiment;
          topics.set(word, existing);
        }
      }
    }

    return Array.from(topics.entries())
      .filter(([_, data]) => data.mentions >= 3)
      .sort((a, b) => b[1].mentions - a[1].mentions)
      .slice(0, 5)
      .map(([topic, data]) => ({
        topic,
        mentions: data.mentions,
        sentiment: Math.round(data.totalSentiment / data.mentions),
        trend: 'stable' as const,
      }));
  }

  handleCrisis(clubId: string, crisisData: {
    type: CrisisType;
    severity: CrisisSeverity;
    title: string;
    description: string;
  }): Crisis | null {
    const community = this.communities.get(clubId);
    const crisisManagement = this.crisisManagements.get(clubId);
    if (!community || !crisisManagement) return null;

    const impact = this._calculateCrisisImpact(crisisData.severity);

    const crisis: Crisis = {
      id: generateId(),
      type: crisisData.type,
      severity: crisisData.severity,
      title: crisisData.title,
      description: crisisData.description,
      impact,
      detectedAt: new Date(),
      status: 'detected',
      mediaAttention: this._calculateMediaAttention(crisisData.severity),
      fanReaction: this._calculateFanReaction(crisisData.severity, community),
    };

    crisisManagement.crisis = crisis;
    crisisManagement.availableStrategies = this._generateStrategies(crisis);
    crisisManagement.selectedStrategy = null;
    crisisManagement.handlingProgress = 0;

    community.sentimentAnalysis.riskLevel = this._mapSeverityToRisk(crisisData.severity);
    community.updatedAt = new Date();

    return crisis;
  }

  private _calculateCrisisImpact(severity: CrisisSeverity) {
    const multipliers = { minor: 1, moderate: 2, major: 3, severe: 5 };
    const m = multipliers[severity];
    return {
      reputation: -5 * m,
      fans: -100 * m,
      revenue: -10 * m,
      morale: -10 * m,
      sponsorTrust: -5 * m,
    };
  }

  private _calculateMediaAttention(severity: CrisisSeverity): number {
    const attention = { minor: 20, moderate: 40, major: 70, severe: 95 };
    return attention[severity];
  }

  private _calculateFanReaction(severity: CrisisSeverity, community: FanCommunity): number {
    const baseReaction = { minor: 30, moderate: 50, major: 75, severe: 95 };
    const avgLoyalty = community.segments.reduce((sum, s) => sum + s.loyalty, 0) / community.segments.length;
    return Math.min(100, baseReaction[severity] * (1 + (100 - avgLoyalty) / 200));
  }

  private _mapSeverityToRisk(severity: CrisisSeverity): SentimentAnalysis['riskLevel'] {
    const mapping = {
      minor: 'medium' as const,
      moderate: 'high' as const,
      major: 'high' as const,
      severe: 'critical' as const,
    };
    return mapping[severity];
  }

  private _generateStrategies(crisis: Crisis): CrisisStrategy[] {
    const strategies: CrisisStrategy[] = [];
    const baseCost = crisis.severity === 'severe' ? 100 : crisis.severity === 'major' ? 50 : 20;

    strategies.push({
      id: generateId(),
      type: 'apology',
      title: '公开道歉',
      description: '发布正式道歉声明，承认错误并承诺改进',
      actions: [
        { id: generateId(), description: '起草道歉声明', timeline: '立即', responsible: '公关部', cost: 0, expectedImpact: 30 },
        { id: generateId(), description: '召开新闻发布会', timeline: '24小时内', responsible: '管理层', cost: baseCost * 0.2, expectedImpact: 40 },
        { id: generateId(), description: '社交媒体回应', timeline: '立即', responsible: '运营部', cost: 0, expectedImpact: 20 },
      ],
      estimatedRecovery: 60,
      cost: baseCost * 0.4,
      riskLevel: 'low',
    });

    strategies.push({
      id: generateId(),
      type: 'explanation',
      title: '事实澄清',
      description: '提供详细的事实说明，澄清误解',
      actions: [
        { id: generateId(), description: '收集证据材料', timeline: '12小时内', responsible: '法务部', cost: 0, expectedImpact: 25 },
        { id: generateId(), description: '发布官方声明', timeline: '24小时内', responsible: '公关部', cost: 0, expectedImpact: 35 },
        { id: generateId(), description: '媒体专访', timeline: '48小时内', responsible: '管理层', cost: baseCost * 0.3, expectedImpact: 30 },
      ],
      estimatedRecovery: 50,
      cost: baseCost * 0.3,
      riskLevel: 'medium',
    });

    strategies.push({
      id: generateId(),
      type: 'action',
      title: '实际行动',
      description: '采取具体行动解决问题，展示诚意',
      actions: [
        { id: generateId(), description: '制定整改方案', timeline: '24小时内', responsible: '管理层', cost: 0, expectedImpact: 20 },
        { id: generateId(), description: '执行整改措施', timeline: '一周内', responsible: '相关部门', cost: baseCost * 0.5, expectedImpact: 50 },
        { id: generateId(), description: '公布整改进度', timeline: '持续', responsible: '公关部', cost: 0, expectedImpact: 25 },
      ],
      estimatedRecovery: 80,
      cost: baseCost,
      riskLevel: 'low',
    });

    if (crisis.severity === 'minor' || crisis.severity === 'moderate') {
      strategies.push({
        id: generateId(),
        type: 'silence',
        title: '保持沉默',
        description: '暂不回应，等待事件自然平息',
        actions: [
          { id: generateId(), description: '监控舆论动态', timeline: '持续', responsible: '运营部', cost: 0, expectedImpact: 10 },
        ],
        estimatedRecovery: 30,
        cost: 0,
        riskLevel: 'high',
      });
    }

    return strategies;
  }

  selectCrisisStrategy(clubId: string, strategyId: string): CrisisStrategy | null {
    const crisisManagement = this.crisisManagements.get(clubId);
    if (!crisisManagement || !crisisManagement.crisis) return null;

    const strategy = crisisManagement.availableStrategies.find(s => s.id === strategyId);
    if (!strategy) return null;

    crisisManagement.selectedStrategy = strategy;
    crisisManagement.crisis.status = 'handling';
    crisisManagement.handlingProgress = 0;

    return strategy;
  }

  progressCrisisHandling(clubId: string, progress: number): Crisis | null {
    const community = this.communities.get(clubId);
    const crisisManagement = this.crisisManagements.get(clubId);
    if (!community || !crisisManagement || !crisisManagement.crisis || !crisisManagement.selectedStrategy) return null;

    crisisManagement.handlingProgress = Math.min(100, progress);

    if (progress >= 100) {
      const record: CrisisRecord = {
        id: generateId(),
        crisis: crisisManagement.crisis,
        strategy: crisisManagement.selectedStrategy,
        outcome: this._determineCrisisOutcome(crisisManagement),
        actualRecovery: crisisManagement.selectedStrategy.estimatedRecovery,
        lessonsLearned: this._extractLessons(crisisManagement),
        resolvedAt: new Date(),
      };

      crisisManagement.history.push(record);
      crisisManagement.crisis.status = 'resolved';
      community.sentimentAnalysis.riskLevel = 'low';
      community.updatedAt = new Date();
    }

    return crisisManagement.crisis;
  }

  private _determineCrisisOutcome(crisisManagement: CrisisManagement): 'success' | 'partial' | 'failure' {
    const strategy = crisisManagement.selectedStrategy!;
    const crisis = crisisManagement.crisis!;

    if (strategy.riskLevel === 'low' && crisis.severity !== 'severe') return 'success';
    if (strategy.riskLevel === 'high' && crisis.severity === 'severe') return 'failure';
    if (Math.random() > 0.5) return 'success';
    return 'partial';
  }

  private _extractLessons(crisisManagement: CrisisManagement): string[] {
    const lessons: string[] = [];
    const crisis = crisisManagement.crisis!;

    if (crisis.type === 'player_scandal') {
      lessons.push('加强选手行为管理');
      lessons.push('建立更完善的选手培训体系');
    }
    if (crisis.type === 'management_issue') {
      lessons.push('优化管理流程');
      lessons.push('加强内部沟通');
    }
    if (crisis.mediaAttention > 70) {
      lessons.push('提升媒体应对能力');
    }

    return lessons;
  }

  getCrisisManagement(clubId: string): CrisisManagement | undefined {
    return this.crisisManagements.get(clubId);
  }

  getStats(clubId: string): FanCommunityStats | null {
    const community = this.communities.get(clubId);
    if (!community) return null;

    const activeEvents = community.activities.filter(a => a.status === 'planning' || a.status === 'ongoing').length;
    const pendingFeedback = community.feedback.filter(f => f.status === 'pending').length;

    const prevTotal = community.segments.reduce((sum, s) => sum + s.count, 0);
    const growthRate = prevTotal > 0 ? ((community.totalMembers - prevTotal) / prevTotal) * 100 : 0;

    return {
      totalMembers: community.totalMembers,
      growthRate: Math.round(growthRate * 10) / 10,
      engagementRate: community.activeRate * 100,
      satisfactionScore: community.sentimentAnalysis.overall,
      activeEvents,
      pendingFeedback,
      crisisRisk: community.sentimentAnalysis.riskLevel,
    };
  }

  simulateFeedback(clubId: string, count: number = 10): FanFeedback[] {
    const feedbacks: FanFeedback[] = [];
    const types: FeedbackType[] = ['suggestion', 'complaint', 'praise', 'question'];
    const sources: FanFeedback['source'][] = ['social_media', 'official_forum', 'event', 'survey'];

    const templates = {
      suggestion: ['希望增加粉丝活动', '建议改善观赛体验', '期待更多周边产品', '希望加强青训培养'],
      complaint: ['活动组织有待改进', '周边价格偏高', '官方互动不够', '信息发布不及时'],
      praise: ['支持俱乐部！', '选手表现很棒！', '活动办得很好！', '为俱乐部骄傲！'],
      question: ['下场比赛时间？', '哪里可以买周边？', '如何参加粉丝活动？', '选手什么时候直播？'],
    };

    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const contents = templates[type];
      const content = contents[Math.floor(Math.random() * contents.length)];

      const sentiment = type === 'praise' ? 70 + Math.random() * 30 :
        type === 'complaint' ? 20 + Math.random() * 30 :
          40 + Math.random() * 20;

      const feedback = this.collectFeedback(clubId, {
        type,
        content,
        source: sources[Math.floor(Math.random() * sources.length)],
        sentiment: Math.round(sentiment),
      });

      if (feedback) feedbacks.push(feedback);
    }

    return feedbacks;
  }
}

export const fanCommunityService = new FanCommunityService();

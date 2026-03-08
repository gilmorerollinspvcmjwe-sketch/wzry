import type {
  CommercialActivity,
  CommercialActivityType,
  CommercialBrand,
  CommercialActivityOffer,
  PlayerCommercialProfile,
  EndorsementContract,
  ControversyEvent,
  DEFAULT_COMMERCIAL_PREFERENCES,
  COMMERCIAL_CONFIG,
} from '@/types/commercial';
import {
  CommercialActivityStatus,
  CommercialActivityType as ActivityType,
  DEFAULT_COMMERCIAL_PREFERENCES as defaultPrefs,
  COMMERCIAL_CONFIG as config,
} from '@/types/commercial';

const BRANDS_DATABASE: CommercialBrand[] = [
  {
    id: 'brand_gaming_1',
    name: '雷蛇',
    logo: '🐍',
    industry: 'gaming',
    reputation: 85,
    budget: 'high',
    preferredPlayerTypes: ['star', 'rising'],
    exclusivityRequired: true,
    minRequirements: { fans: 50000, reputation: 60 },
  },
  {
    id: 'brand_gaming_2',
    name: '罗技',
    logo: '🖱️',
    industry: 'gaming',
    reputation: 80,
    budget: 'high',
    preferredPlayerTypes: ['star', 'veteran'],
    exclusivityRequired: false,
    minRequirements: { fans: 30000, reputation: 50 },
  },
  {
    id: 'brand_tech_1',
    name: '华为',
    logo: '📱',
    industry: 'tech',
    reputation: 90,
    budget: 'premium',
    preferredPlayerTypes: ['star'],
    exclusivityRequired: true,
    minRequirements: { fans: 100000, reputation: 70 },
  },
  {
    id: 'brand_tech_2',
    name: '小米',
    logo: '📱',
    industry: 'tech',
    reputation: 75,
    budget: 'high',
    preferredPlayerTypes: ['star', 'rising'],
    exclusivityRequired: false,
    minRequirements: { fans: 40000, reputation: 55 },
  },
  {
    id: 'brand_fashion_1',
    name: '耐克',
    logo: '👟',
    industry: 'fashion',
    reputation: 95,
    budget: 'premium',
    preferredPlayerTypes: ['star'],
    exclusivityRequired: true,
    minRequirements: { fans: 200000, reputation: 80 },
  },
  {
    id: 'brand_fashion_2',
    name: '阿迪达斯',
    logo: '👕',
    industry: 'fashion',
    reputation: 90,
    budget: 'premium',
    preferredPlayerTypes: ['star', 'veteran'],
    exclusivityRequired: true,
    minRequirements: { fans: 150000, reputation: 75 },
  },
  {
    id: 'brand_food_1',
    name: '红牛',
    logo: '🥤',
    industry: 'food',
    reputation: 70,
    budget: 'medium',
    preferredPlayerTypes: ['star', 'rising', 'veteran'],
    exclusivityRequired: false,
    minRequirements: { fans: 20000, reputation: 40 },
  },
  {
    id: 'brand_food_2',
    name: '肯德基',
    logo: '🍗',
    industry: 'food',
    reputation: 65,
    budget: 'medium',
    preferredPlayerTypes: ['rising', 'veteran'],
    exclusivityRequired: false,
    minRequirements: { fans: 15000, reputation: 35 },
  },
  {
    id: 'brand_sports_1',
    name: '安踏',
    logo: '🏃',
    industry: 'sports',
    reputation: 75,
    budget: 'high',
    preferredPlayerTypes: ['star', 'rising'],
    exclusivityRequired: false,
    minRequirements: { fans: 30000, reputation: 50 },
  },
  {
    id: 'brand_entertainment_1',
    name: '斗鱼',
    logo: '📺',
    industry: 'entertainment',
    reputation: 70,
    budget: 'high',
    preferredPlayerTypes: ['star', 'rising'],
    exclusivityRequired: false,
    minRequirements: { fans: 25000, reputation: 45 },
  },
];

const ACTIVITY_TEMPLATES: Record<CommercialActivityType, {
  titleTemplates: string[];
  baseIncome: [number, number];
  baseImpact: { reputation: number; fans: number; morale: number; mediaExposure: number };
  baseRisk: number;
}> = {
  [ActivityType.ENDORSEMENT]: {
    titleTemplates: ['品牌代言', '形象大使', '品牌合作'],
    baseIncome: [50, 200],
    baseImpact: { reputation: 5, fans: 1000, morale: 3, mediaExposure: 10 },
    baseRisk: 0.1,
  },
  [ActivityType.STREAMING]: {
    titleTemplates: ['直播合作', '平台签约', '直播活动'],
    baseIncome: [20, 80],
    baseImpact: { reputation: 2, fans: 500, morale: 5, mediaExposure: 5 },
    baseRisk: 0.05,
  },
  [ActivityType.FAN_MEET]: {
    titleTemplates: ['粉丝见面会', '签名会', '粉丝互动活动'],
    baseIncome: [10, 50],
    baseImpact: { reputation: 3, fans: 2000, morale: 8, mediaExposure: 3 },
    baseRisk: 0.03,
  },
  [ActivityType.PHOTOSHOOT]: {
    titleTemplates: ['杂志拍摄', '广告拍摄', '形象照拍摄'],
    baseIncome: [30, 100],
    baseImpact: { reputation: 4, fans: 800, morale: 2, mediaExposure: 8 },
    baseRisk: 0.08,
  },
  [ActivityType.INTERVIEW]: {
    titleTemplates: ['媒体专访', '综艺节目', '访谈节目'],
    baseIncome: [15, 60],
    baseImpact: { reputation: 3, fans: 600, morale: 4, mediaExposure: 6 },
    baseRisk: 0.06,
  },
};

function generateId(): string {
  return `commercial_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getBudgetMultiplier(budget: CommercialBrand['budget']): number {
  const multipliers = {
    low: 0.5,
    medium: 1.0,
    high: 1.5,
    premium: 2.0,
  };
  return multipliers[budget];
}

function getPlayerType(
  avgStats: number,
  age: number
): 'star' | 'rising' | 'veteran' {
  if (avgStats >= 80) return 'star';
  if (age <= 20) return 'rising';
  return 'veteran';
}

export class CommercialService {
  private profiles: Map<string, PlayerCommercialProfile> = new Map();
  private activeControversies: Map<string, ControversyEvent> = new Map();

  initializeCommercialProfile(
    playerId: string,
    playerStats: {
      avgStats: number;
      age: number;
      fans: number;
      reputation: number;
    }
  ): PlayerCommercialProfile {
    const playerType = getPlayerType(playerStats.avgStats, playerStats.age);
    const commercialValue = this.calculateCommercialValue(playerId, playerStats);

    const profile: PlayerCommercialProfile = {
      playerId,
      commercialValue,
      marketability: Math.min(100, playerStats.avgStats * 0.8 + playerStats.fans / 1000),
      brandAppeal: Math.min(100, playerStats.reputation * 0.6 + playerStats.avgStats * 0.3),
      socialInfluence: Math.min(100, playerStats.fans / 1000 + playerStats.reputation * 0.2),
      activeEndorsements: [],
      pastEndorsements: [],
      pendingActivities: [],
      completedActivities: [],
      preferences: { ...defaultPrefs },
      reputation: {
        overall: playerStats.reputation,
        professionalism: 70 + Math.random() * 20,
        reliability: 70 + Math.random() * 20,
        controversy: 100,
      },
      statistics: {
        totalActivities: 0,
        totalIncome: 0,
        successfulActivities: 0,
        controversyCount: 0,
        averageRating: 0,
      },
    };

    this.profiles.set(playerId, profile);
    return profile;
  }

  calculateCommercialValue(
    playerId: string,
    playerStats: {
      avgStats: number;
      age: number;
      fans: number;
      reputation: number;
    }
  ): number {
    const statsFactor = playerStats.avgStats * 10;
    const fansFactor = playerStats.fans * 0.01;
    const reputationFactor = playerStats.reputation * 5;
    const ageFactor = playerStats.age <= 22 ? 1.2 : playerStats.age <= 26 ? 1.0 : 0.8;

    return Math.round((statsFactor + fansFactor + reputationFactor) * ageFactor);
  }

  generateEndorsementOffer(
    playerId: string,
    playerStats: {
      avgStats: number;
      age: number;
      fans: number;
      reputation: number;
      ranking?: number;
    }
  ): CommercialActivityOffer | null {
    const profile = this.profiles.get(playerId);
    if (!profile) return null;

    if (profile.pendingActivities.length >= config.maxPendingActivities) {
      return null;
    }

    const playerType = getPlayerType(playerStats.avgStats, playerStats.age);
    const eligibleBrands = BRANDS_DATABASE.filter(brand => {
      if (brand.minRequirements.fans && playerStats.fans < brand.minRequirements.fans) {
        return false;
      }
      if (brand.minRequirements.reputation && playerStats.reputation < brand.minRequirements.reputation) {
        return false;
      }
      if (!brand.preferredPlayerTypes.includes(playerType)) {
        return false;
      }
      if (profile.preferences.avoidedBrands.includes(brand.id)) {
        return false;
      }
      if (brand.exclusivityRequired && profile.activeEndorsements.length > 0) {
        const hasExclusive = profile.activeEndorsements.some(
          e => e.brandId === brand.id || brand.exclusivityRequired
        );
        if (hasExclusive) return false;
      }
      return true;
    });

    if (eligibleBrands.length === 0) return null;

    const selectedBrand = eligibleBrands[Math.floor(Math.random() * eligibleBrands.length)]!;
    const activityTypes = Object.values(ActivityType) as CommercialActivityType[];
    const selectedType = activityTypes[Math.floor(Math.random() * activityTypes.length)]!;
    const template = ACTIVITY_TEMPLATES[selectedType];

    const budgetMultiplier = getBudgetMultiplier(selectedBrand.budget);
    const baseIncome = randomInRange(template.baseIncome[0], template.baseIncome[1]);
    const finalIncome = Math.round(baseIncome * budgetMultiplier * (1 + playerStats.reputation / 100));

    const titleIndex = Math.floor(Math.random() * template.titleTemplates.length);
    const title = `${selectedBrand.name}${template.titleTemplates[titleIndex]}`;

    const duration = randomInRange(1, 3);
    const startDate = new Date();
    const endDate = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);

    const activity: CommercialActivity = {
      id: generateId(),
      playerId,
      type: selectedType,
      title,
      brand: selectedBrand.name,
      brandLogo: selectedBrand.logo,
      description: `参与${selectedBrand.name}的${title}活动`,
      income: finalIncome,
      impact: {
        reputation: Math.round(template.baseImpact.reputation * budgetMultiplier),
        fans: Math.round(template.baseImpact.fans * budgetMultiplier),
        income: finalIncome,
        morale: template.baseImpact.morale,
        mediaExposure: Math.round(template.baseImpact.mediaExposure * budgetMultiplier),
      },
      risks: this.generateRisks(template.baseRisk, selectedType),
      schedule: {
        startDate,
        endDate,
        duration,
      },
      status: CommercialActivityStatus.PENDING,
      createdAt: new Date(),
    };

    const offer: CommercialActivityOffer = {
      id: generateId(),
      activity,
      brand: selectedBrand,
      expiresAt: new Date(Date.now() + config.activityExpirationDays * 24 * 60 * 60 * 1000),
      isExclusive: selectedBrand.exclusivityRequired,
      competingOffers: Math.floor(Math.random() * 3),
      negotiationRoom: Math.round(finalIncome * 0.2),
    };

    profile.pendingActivities.push(activity);
    return offer;
  }

  private generateRisks(baseRisk: number, type: CommercialActivityType): CommercialActivity['risks'] {
    const risks: CommercialActivity['risks'] = [];

    if (Math.random() < baseRisk) {
      const riskTypes: Array<CommercialActivity['risks'][0]['type']> = [
        'controversy', 'injury', 'reputation_damage', 'schedule_conflict'
      ];
      const selectedRisk = riskTypes[Math.floor(Math.random() * riskTypes.length)]!;

      risks.push({
        type: selectedRisk,
        probability: Math.random() * 0.3 + 0.1,
        severity: Math.random() < 0.3 ? 'high' : Math.random() < 0.6 ? 'medium' : 'low',
        description: this.getRiskDescription(selectedRisk, type),
      });
    }

    return risks;
  }

  private getRiskDescription(riskType: string, activityType: CommercialActivityType): string {
    const descriptions: Record<string, string[]> = {
      controversy: ['可能引发公众争议', '品牌形象可能受损', '社交媒体可能产生负面评论'],
      injury: ['活动期间可能受伤', '行程紧张可能影响状态'],
      reputation_damage: ['可能影响个人声誉', '可能引发粉丝不满'],
      schedule_conflict: ['可能与比赛日程冲突', '可能与训练时间冲突'],
    };

    const options = descriptions[riskType] || ['存在一定风险'];
    return options[Math.floor(Math.random() * options.length)]!;
  }

  acceptActivity(playerId: string, activityId: string): {
    success: boolean;
    message: string;
    activity?: CommercialActivity;
  } {
    const profile = this.profiles.get(playerId);
    if (!profile) {
      return { success: false, message: '未找到选手商业档案' };
    }

    const activityIndex = profile.pendingActivities.findIndex(a => a.id === activityId);
    if (activityIndex === -1) {
      return { success: false, message: '未找到该活动' };
    }

    const activity = profile.pendingActivities[activityIndex]!;

    if (activity.status !== CommercialActivityStatus.PENDING) {
      return { success: false, message: '该活动已处理' };
    }

    activity.status = CommercialActivityStatus.ACCEPTED;
    activity.acceptedAt = new Date();

    profile.pendingActivities.splice(activityIndex, 1);

    if (activity.type === ActivityType.ENDORSEMENT) {
      const contract = this.createEndorsementContract(activity, profile);
      profile.activeEndorsements.push(contract);
    } else {
      activity.status = CommercialActivityStatus.IN_PROGRESS;
      profile.pendingActivities.push(activity);
    }

    return {
      success: true,
      message: `已接受 ${activity.title} 活动`,
      activity,
    };
  }

  private createEndorsementContract(
    activity: CommercialActivity,
    profile: PlayerCommercialProfile
  ): EndorsementContract {
    const duration = randomInRange(12, 24);
    return {
      id: generateId(),
      playerId: activity.playerId,
      brandId: activity.brand,
      brandName: activity.brand,
      brandLogo: activity.brandLogo,
      type: activity.type,
      value: activity.income,
      duration,
      startDate: new Date(),
      endDate: new Date(Date.now() + duration * 7 * 24 * 60 * 60 * 1000),
      status: 'active',
      totalEarned: 0,
      requirements: [
        { type: 'appearances', target: randomInRange(3, 6), current: 0 },
        { type: 'social_posts', target: randomInRange(5, 10), current: 0 },
      ],
      bonuses: [
        { condition: '赛季进入季后赛', amount: activity.income * 0.5, achieved: false },
        { condition: '粉丝增长超过20%', amount: activity.income * 0.3, achieved: false },
      ],
    };
  }

  rejectActivity(playerId: string, activityId: string): {
    success: boolean;
    message: string;
  } {
    const profile = this.profiles.get(playerId);
    if (!profile) {
      return { success: false, message: '未找到选手商业档案' };
    }

    const activityIndex = profile.pendingActivities.findIndex(a => a.id === activityId);
    if (activityIndex === -1) {
      return { success: false, message: '未找到该活动' };
    }

    const activity = profile.pendingActivities[activityIndex]!;
    activity.status = CommercialActivityStatus.REJECTED;

    profile.pendingActivities.splice(activityIndex, 1);
    profile.completedActivities.push(activity);

    return {
      success: true,
      message: `已拒绝 ${activity.title} 活动`,
    };
  }

  completeActivity(playerId: string, activityId: string): {
    success: boolean;
    message: string;
    impact?: CommercialActivity['impact'];
  } {
    const profile = this.profiles.get(playerId);
    if (!profile) {
      return { success: false, message: '未找到选手商业档案' };
    }

    const activityIndex = profile.pendingActivities.findIndex(a => a.id === activityId);
    if (activityIndex === -1) {
      return { success: false, message: '未找到该活动' };
    }

    const activity = profile.pendingActivities[activityIndex]!;

    if (activity.status !== CommercialActivityStatus.IN_PROGRESS &&
        activity.status !== CommercialActivityStatus.ACCEPTED) {
      return { success: false, message: '该活动无法完成' };
    }

    const controversyOccurred = this.checkForControversy(activity, profile);
    if (controversyOccurred) {
      return {
        success: false,
        message: '活动过程中发生争议，需要先处理',
      };
    }

    activity.status = CommercialActivityStatus.COMPLETED;
    activity.completedAt = new Date();

    profile.pendingActivities.splice(activityIndex, 1);
    profile.completedActivities.push(activity);

    profile.statistics.totalActivities++;
    profile.statistics.totalIncome += activity.income;
    profile.statistics.successfulActivities++;

    return {
      success: true,
      message: `已完成 ${activity.title} 活动，获得收入 ${activity.income} 万`,
      impact: activity.impact,
    };
  }

  private checkForControversy(
    activity: CommercialActivity,
    profile: PlayerCommercialProfile
  ): boolean {
    if (activity.risks.length === 0) return false;

    for (const risk of activity.risks) {
      if (Math.random() < risk.probability) {
        const controversy = this.createControversy(activity, risk);
        this.activeControversies.set(controversy.id, controversy);
        profile.statistics.controversyCount++;
        return true;
      }
    }

    return false;
  }

  private createControversy(
    activity: CommercialActivity,
    risk: CommercialActivity['risks'][0]
  ): ControversyEvent {
    const severityMultiplier = {
      low: 1,
      medium: 2,
      high: 3,
    };

    const mult = severityMultiplier[risk.severity];

    return {
      id: generateId(),
      activityId: activity.id,
      playerId: activity.playerId,
      type: 'public_backlash',
      severity: risk.severity,
      description: risk.description,
      impact: {
        reputation: -5 * mult,
        fans: -1000 * mult,
        income: -activity.income * 0.2 * mult,
      },
      resolutionOptions: [
        {
          id: 'apologize',
          text: '公开道歉',
          cost: 5 * mult,
          impactReduction: 0.5,
        },
        {
          id: 'donate',
          text: '捐款慈善',
          cost: 20 * mult,
          impactReduction: 0.8,
        },
        {
          id: 'ignore',
          text: '不予回应',
          cost: 0,
          impactReduction: 0.1,
        },
      ],
      resolved: false,
    };
  }

  handleControversy(
    playerId: string,
    activityId: string,
    resolutionId: string
  ): {
    success: boolean;
    message: string;
    impact?: ControversyEvent['impact'];
  } {
    const profile = this.profiles.get(playerId);
    if (!profile) {
      return { success: false, message: '未找到选手商业档案' };
    }

    let controversy: ControversyEvent | undefined;
    for (const [id, event] of this.activeControversies) {
      if (event.activityId === activityId && event.playerId === playerId) {
        controversy = event;
        break;
      }
    }

    if (!controversy) {
      return { success: false, message: '未找到相关争议事件' };
    }

    const resolution = controversy.resolutionOptions.find(r => r.id === resolutionId);
    if (!resolution) {
      return { success: false, message: '无效的解决方案' };
    }

    const reducedImpact = {
      reputation: Math.round(controversy.impact.reputation * (1 - resolution.impactReduction)),
      fans: Math.round(controversy.impact.fans * (1 - resolution.impactReduction)),
      income: Math.round(controversy.impact.income * (1 - resolution.impactReduction)),
    };

    controversy.resolved = true;
    controversy.resolvedAt = new Date();
    this.activeControversies.delete(controversy.id);

    const activity = profile.pendingActivities.find(a => a.id === activityId);
    if (activity) {
      activity.controversyHandled = true;
    }

    profile.reputation.controversy = Math.max(0, profile.reputation.controversy - 10);

    return {
      success: true,
      message: `争议已处理，花费 ${resolution.cost} 万`,
      impact: reducedImpact,
    };
  }

  getProfile(playerId: string): PlayerCommercialProfile | undefined {
    return this.profiles.get(playerId);
  }

  getActiveControversies(playerId: string): ControversyEvent[] {
    const controversies: ControversyEvent[] = [];
    for (const event of this.activeControversies.values()) {
      if (event.playerId === playerId) {
        controversies.push(event);
      }
    }
    return controversies;
  }

  processWeeklyEndorsements(playerId: string): {
    income: number;
    completedContracts: EndorsementContract[];
  } {
    const profile = this.profiles.get(playerId);
    if (!profile) {
      return { income: 0, completedContracts: [] };
    }

    let totalIncome = 0;
    const completedContracts: EndorsementContract[] = [];
    const now = new Date();

    for (let i = profile.activeEndorsements.length - 1; i >= 0; i--) {
      const contract = profile.activeEndorsements[i]!;

      if (now >= contract.endDate) {
        contract.status = 'expired';
        profile.pastEndorsements.push(contract);
        profile.activeEndorsements.splice(i, 1);
        completedContracts.push(contract);
        continue;
      }

      const weeklyIncome = Math.round(contract.value / contract.duration);
      contract.totalEarned += weeklyIncome;
      totalIncome += weeklyIncome;

      for (const req of contract.requirements) {
        if (req.type === 'appearances' && Math.random() < 0.1) {
          req.current = Math.min(req.current + 1, req.target);
        }
        if (req.type === 'social_posts' && Math.random() < 0.2) {
          req.current = Math.min(req.current + 1, req.target);
        }
      }
    }

    profile.statistics.totalIncome += totalIncome;

    return { income: totalIncome, completedContracts };
  }

  updatePreferences(
    playerId: string,
    preferences: Partial<PlayerCommercialProfile['preferences']>
  ): boolean {
    const profile = this.profiles.get(playerId);
    if (!profile) return false;

    profile.preferences = { ...profile.preferences, ...preferences };
    return true;
  }

  getAvailableBrands(): CommercialBrand[] {
    return [...BRANDS_DATABASE];
  }
}

export const commercialService = new CommercialService();

import type { Player } from '@/core/models/Player';
import { generatePlayers, generateStarPlayer, generateYouthPlayer } from './playerGenerator';

/**
 * AI 俱乐部经营风格
 */
export type ManagementStyle = 
  | 'big-spender'      // 氪金型：高投入高回报
  | 'youth-focused'    // 青训型：注重青训培养
  | 'stable'           // 稳健型：收支平衡
  | 'gambler'          // 赌徒型：孤注一掷
  | 'low-profile';     // 养老型：低投入

/**
 * AI 俱乐部决策配置
 */
export interface AIDecisionConfig {
  transferBudget: number;      // 转会预算占比（0-1）
  salaryBudget: number;        // 薪资预算占比（0-1）
  priority: 'championship' | 'profit' | 'survival';
  riskTolerance: number;       // 风险承受度（0-100）
  youthInvestment: number;     // 青训投资占比（0-1）
  facilityInvestment: number;  // 设施投资占比（0-1）
}

/**
 * 俱乐部名称库（参考 KPL 真实战队名）
 */
const CLUB_NAMES = [
  'AG超玩会', '狼队', 'eStarPro', 'TTG', 'DYG', 'GK', 'Hero久竞', 'EDG.M',
  'RNG.M', 'WE', 'LGD大鹅', 'TES.A', 'KSG', 'MTG', 'RW侠', 'VG',
  'XYG', '火豹', 'EMC', 'GOG', 'CW', 'MD', 'NBW', 'VTG',
  'TY', 'HI', '溯', '万臻', '喵鱼', 'TCG', 'BOA', 'KLG'
];

/**
 * 城市列表
 */
const CITIES = [
  '成都', '重庆', '武汉', '广州', '深圳', '上海', '北京', '南京',
  '杭州', '西安', '苏州', '长沙', '郑州', '青岛', '厦门', '佛山'
];

/**
 * 俱乐部 ID 生成器
 */
class ClubIdGenerator {
  private currentId = 0;
  
  generate(): string {
    this.currentId++;
    return `ai_club_${Date.now()}_${this.currentId}`;
  }
}

const clubIdGenerator = new ClubIdGenerator();

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!;
}

/**
 * 生成经营风格
 */
function generateManagementStyle(): ManagementStyle {
  const styles: ManagementStyle[] = [
    'big-spender', 'youth-focused', 'stable', 'gambler', 'low-profile'
  ];
  const weights = [0.15, 0.25, 0.35, 0.15, 0.10];
  
  const random = Math.random();
  let cumulative = 0;
  
  for (let i = 0; i < styles.length; i++) {
    const weight = weights[i];
    if (weight === undefined) continue;
    cumulative += weight;
    if (random < cumulative) {
      const style = styles[i];
      if (style) return style;
    }
  }
  
  return 'stable';
}

/**
 * 根据经营风格生成决策配置
 */
function generateDecisionConfig(style: ManagementStyle): AIDecisionConfig {
  const configs: Record<ManagementStyle, AIDecisionConfig> = {
    'big-spender': {
      transferBudget: 0.6,
      salaryBudget: 0.3,
      priority: 'championship',
      riskTolerance: 80,
      youthInvestment: 0.05,
      facilityInvestment: 0.05
    },
    'youth-focused': {
      transferBudget: 0.2,
      salaryBudget: 0.25,
      priority: 'championship',
      riskTolerance: 40,
      youthInvestment: 0.4,
      facilityInvestment: 0.15
    },
    'stable': {
      transferBudget: 0.3,
      salaryBudget: 0.35,
      priority: 'profit',
      riskTolerance: 50,
      youthInvestment: 0.2,
      facilityInvestment: 0.15
    },
    'gambler': {
      transferBudget: 0.5,
      salaryBudget: 0.35,
      priority: 'championship',
      riskTolerance: 90,
      youthInvestment: 0.1,
      facilityInvestment: 0.05
    },
    'low-profile': {
      transferBudget: 0.1,
      salaryBudget: 0.4,
      priority: 'survival',
      riskTolerance: 20,
      youthInvestment: 0.3,
      facilityInvestment: 0.2
    }
  };
  
  return configs[style];
}

/**
 * 根据经营风格生成阵容
 */
function generateRoster(style: ManagementStyle): Player[] {
  const roster: Player[] = [];
  
  switch (style) {
    case 'big-spender':
      // 氪金型：3 个明星 + 2 个普通
      roster.push(generateStarPlayer());
      roster.push(generateStarPlayer());
      roster.push(generateStarPlayer());
      roster.push(...generatePlayers(2));
      break;
      
    case 'youth-focused':
      // 青训型：2 个明星 + 3 个青训
      roster.push(generateStarPlayer());
      roster.push(generateStarPlayer());
      roster.push(generateYouthPlayer());
      roster.push(generateYouthPlayer());
      roster.push(generateYouthPlayer());
      break;
      
    case 'stable':
      // 稳健型：1 个明星 + 4 个普通
      roster.push(generateStarPlayer());
      roster.push(...generatePlayers(4));
      break;
      
    case 'gambler':
      // 赌徒型：4 个明星 + 1 个普通
      roster.push(generateStarPlayer());
      roster.push(generateStarPlayer());
      roster.push(generateStarPlayer());
      roster.push(generateStarPlayer());
      const gamblerPlayers = generatePlayers(1);
      if (gamblerPlayers[0]) roster.push(gamblerPlayers[0]);
      break;
      
    case 'low-profile':
      // 养老型：5 个普通选手
      roster.push(...generatePlayers(5));
      break;
  }
  
  return roster;
}

/**
 * AI 俱乐部接口 - 独立定义，不继承Club类
 */
export interface AIClub {
  id: string;
  name: string;
  location: string;
  foundedYear: number;
  fans: number;
  reputation: number;
  funds: number;
  roster: Player[];
  staff: {
    headCoach: any;
    assistantCoaches: any[];
    analysts: any[];
  };
  facilities: {
    training: { level: number; maxLevel: number };
    medical: { level: number; maxLevel: number };
    analysis: { level: number; maxLevel: number };
    academy: { level: number; maxLevel: number };
  };
  sponsor?: {
    weeklyPayment: number;
  };
  managementStyle: ManagementStyle;
  aiDecisionConfig: AIDecisionConfig;
  history: {
    seasons: any[];
    transfers: any[];
    honors: any[];
    financialHistory: any[];
  };
  // 方法
  getTotalPower: () => number;
  getWeeklyIncome: () => number;
  getWeeklyExpense: () => number;
  upgradeFacility: (type: keyof AIClub['facilities']) => { success: boolean; cost: number };
}

/**
 * 生成 AI 俱乐部
 */
export function generateAIClub(overrides?: Partial<AIClub>): AIClub {
  const id = clubIdGenerator.generate();
  const name = randomChoice(CLUB_NAMES);
  const location = randomChoice(CITIES);
  const foundedYear = randomInt(1990, 2024);
  
  // 经营风格
  const managementStyle = generateManagementStyle();
  const aiDecisionConfig = generateDecisionConfig(managementStyle);
  
  // 基础数据
  const fans = randomInt(10000, 100000);
  const reputation = randomInt(30, 80);
  const funds = randomInt(500, 2000);  // 万
  
  // 生成阵容
  const roster = generateRoster(managementStyle);
  
  // 创建俱乐部对象
  const club: AIClub = {
    id,
    name,
    location,
    foundedYear,
    fans,
    reputation,
    funds,
    roster,
    staff: {
      headCoach: null as any,
      assistantCoaches: [],
      analysts: []
    },
    facilities: {
      training: { level: 1, maxLevel: 5 },
      medical: { level: 1, maxLevel: 5 },
      analysis: { level: 1, maxLevel: 5 },
      academy: { level: 1, maxLevel: 5 }
    },
    sponsor: undefined,
    managementStyle,
    aiDecisionConfig,
    history: {
      seasons: [],
      transfers: [],
      honors: [],
      financialHistory: []
    },
    // Club 基类方法
    getTotalPower: function() {
      return this.roster.reduce((sum, player) => sum + ((player as any).getTotalPower?.() || 0), 0);
    },
    getWeeklyIncome: function() {
      const sponsorIncome = this.sponsor?.weeklyPayment || 0;
      return Math.floor(this.fans / 1000) + sponsorIncome;
    },
    getWeeklyExpense: function() {
      const salaryExpense = this.roster.reduce((sum, p) => sum + p.contract.salary / 52, 0);
      const facilityMaintenance = Object.values(this.facilities).reduce((sum, f) => sum + f.level * 10, 0);
      return salaryExpense + facilityMaintenance;
    },
    upgradeFacility: function(type: keyof AIClub['facilities']) {
      const facility = this.facilities[type];
      if (facility.level < facility.maxLevel) {
        const upgradeCost = facility.level * 50;  // 升级成本
        if (this.funds >= upgradeCost) {
          this.funds -= upgradeCost;
          this.history.financialHistory.push({
            type: 'facility_upgrade',
            amount: -upgradeCost,
            fromLevel: facility.level,
            toLevel: facility.level + 1,
            date: new Date()
          });
          facility.level += 1;
          return { success: true, cost: upgradeCost };
        }
      }
      return { success: false, cost: 0 };
    }
  };
  
  return { ...club, ...overrides };
}

/**
 * AI 俱乐部管理器
 */
export class AIClubManager {
  private clubs: Map<string, AIClub> = new Map();
  
  /**
   * 生成指定数量的 AI 俱乐部
   */
  generateClubs(count: number): AIClub[] {
    const clubs: AIClub[] = [];
    
    for (let i = 0; i < count; i++) {
      const club = generateAIClub();
      this.clubs.set(club.id, club);
      clubs.push(club);
    }
    
    return clubs;
  }
  
  /**
   * 获取指定俱乐部
   */
  getClub(clubId: string): AIClub | undefined {
    return this.clubs.get(clubId);
  }
  
  /**
   * 获取所有俱乐部
   */
  getAllClubs(): AIClub[] {
    return Array.from(this.clubs.values());
  }
  
  /**
   * 更新所有 AI 俱乐部的决策
   */
  updateAllDecisions(): void {
    this.clubs.forEach(club => {
      this.makeDecision(club);
    });
  }
  
  /**
   * 为单个俱乐部做决策
   */
  private makeDecision(club: AIClub): void {
    const config = club.aiDecisionConfig;
    
    // 根据优先级做决策
    switch (config.priority) {
      case 'championship':
        this.championshipStrategy(club);
        break;
      case 'profit':
        this.profitStrategy(club);
        break;
      case 'survival':
        this.survivalStrategy(club);
        break;
    }
  }
  
  /**
   * 争冠策略
   */
  private championshipStrategy(club: AIClub): void {
    // 优先补强阵容
    if (club.funds > 500 && Math.random() < 0.3) {
      // 30% 概率尝试签约明星选手
      console.log(`${club.name} 正在寻找明星选手...`);
    }
  }
  
  /**
   * 盈利策略
   */
  private profitStrategy(club: AIClub): void {
    // 控制支出，出售高薪选手
    const highSalaryPlayers = club.roster.filter(p => p.contract.salary > 30);
    if (highSalaryPlayers.length > 0 && Math.random() < 0.2) {
      console.log(`${club.name} 考虑出售高薪选手...`);
    }
  }
  
  /**
   * 生存策略
   */
  private survivalStrategy(club: AIClub): void {
    // 最小化支出，优先保证不破产
    if (club.funds < 100) {
      console.log(`${club.name} 资金紧张，正在缩减开支...`);
    }
  }
  
  /**
   * 获取俱乐部排名
   */
  getClubRankings(): AIClub[] {
    return this.getAllClubs().sort((a, b) => {
      return b.getTotalPower() - a.getTotalPower();
    });
  }
}

// 导出单例
export const aiClubManager = new AIClubManager();

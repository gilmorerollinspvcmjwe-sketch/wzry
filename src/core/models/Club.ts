import type { Facilities, ClubHistory, Sponsor } from '@/types';
import type { Player } from './Player';

export class Club {
  id: string;
  name: string;
  logo: string;
  founded: Date;
  
  // 核心资源
  funds: number;
  reputation: number;
  fans: number;
  
  // 设施等级（1-10 级）
  facilities: Facilities;
  
  // 当前阵容
  roster: Player[];
  youthTeam: Player[];
  
  // 赞助商
  sponsor?: Sponsor;
  
  // 历史战绩
  history: ClubHistory;
  
  constructor(name: string, logo: string = '') {
    this.id = `club_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.name = name;
    this.logo = logo;
    this.founded = new Date();
    
    // 初始资源
    this.funds = 1000; // 1000 万
    this.reputation = 50;
    this.fans = 10000;
    
    // 初始设施等级
    this.facilities = {
      training: 1,
      medical: 1,
      analysis: 1,
      youth: 1,
    };
    
    // 初始阵容
    this.roster = [];
    this.youthTeam = [];
    
    // 历史战绩
    this.history = {
      championships: 0,
      playoffAppearances: 0,
      totalMatches: 0,
      wins: 0,
    };
  }
  
  // 获取战队总实力
  getTotalPower(): number {
    if (this.roster.length === 0) return 0;
    const total = this.roster.reduce((sum, player) => sum + ((player as any).getTotalPower?.() || 0), 0);
    return Math.round(total / this.roster.length);
  }
  
  // 获取设施加成
  getFacilityBonus(type: 'training' | 'medical' | 'analysis' | 'youth'): number {
    return this.facilities[type] * 0.05; // 每级 5% 加成
  }
  
  // 计算周收入
  getWeeklyIncome(): number {
    const sponsorIncome = this.sponsor?.weeklyPayment || 0;
    const fanIncome = this.fans * 0.01; // 每个粉丝每周贡献 0.01 万
    return sponsorIncome + fanIncome;
  }
  
  // 计算周支出
  getWeeklyExpense(): number {
    const salaryExpense = this.roster.reduce((sum, p) => sum + p.contract.salary / 52, 0);
    const facilityMaintenance = Object.values(this.facilities).reduce((sum, level) => sum + level * 10, 0);
    return salaryExpense + facilityMaintenance;
  }
  
  // 添加选手
  addPlayer(player: Player, isYouth: boolean = false) {
    if (isYouth) {
      this.youthTeam.push(player);
    } else {
      this.roster.push(player);
    }
  }
  
  // 移除选手
  removePlayer(playerId: string): Player | undefined {
    const rosterIndex = this.roster.findIndex(p => p.id === playerId);
    if (rosterIndex > -1) {
      return this.roster.splice(rosterIndex, 1)[0];
    }
    
    const youthIndex = this.youthTeam.findIndex(p => p.id === playerId);
    if (youthIndex > -1) {
      return this.youthTeam.splice(youthIndex, 1)[0];
    }
    
    return undefined;
  }
  
  // 升级设施
  upgradeFacility(type: keyof Facilities): { success: boolean; cost: number } {
    const currentLevel = this.facilities[type];
    if (currentLevel >= 10) {
      return { success: false, cost: 0 }; // 已满级
    }
    
    const cost = this.calculateUpgradeCost(currentLevel);
    if (this.funds < cost) {
      return { success: false, cost };
    }
    
    this.funds -= cost;
    this.facilities[type]++;
    return { success: true, cost };
  }
  
  // 计算升级费用
  private calculateUpgradeCost(currentLevel: number): number {
    return 100 * Math.pow(1.5, currentLevel - 1); // 100, 150, 225, 338...
  }
  
  // 添加资金
  addFunds(amount: number): void {
    this.funds += amount;
  }
  
  // 花费资金
  spendFunds(amount: number): boolean {
    if (this.funds >= amount) {
      this.funds -= amount;
      return true;
    }
    return false;
  }
  
  // 获取指定位置的选手
  getPlayerAt(position: string): Player | undefined {
    return this.roster.find(p => p.position === position);
  }
  
  // 获取平均属性
  getAverageStat(stat: keyof Player['stats']): number {
    if (this.roster.length === 0) return 0;
    const total = this.roster.reduce((sum, p) => sum + p.stats[stat], 0);
    return total / this.roster.length;
  }
  
  // 获取平均心态
  getAverageMentality(): number {
    if (this.roster.length === 0) return 0;
    const total = this.roster.reduce((sum, p) => sum + p.condition.mentality, 0);
    return total / this.roster.length;
  }
}

import type { Position, PlayerStats, PlayerCondition, Contract, Trait, GrowthRecord } from '@/types';

export class Player {
  id: string;
  name: string;
  nickname?: string;
  avatar: string;
  
  // 基础信息
  age: number;
  position: Position;
  nationality: string;
  
  // 核心属性（1-100）
  stats: PlayerStats;
  
  // 位置熟练度
  positionMastery: Record<Position, number>;
  
  // 英雄熟练度 Map<heroId, mastery>
  heroMastery: Map<string, number>;
  
  // 特质列表
  traits: Trait[];
  
  // 当前状态（0-100）
  condition: PlayerCondition;
  
  // 合同信息
  contract: Contract;
  
  // 成长相关
  potential: number;
  experience: number;
  growthHistory: GrowthRecord[];
  
  constructor(
    name: string,
    age: number,
    position: Position,
    potential: number = 75
  ) {
    this.id = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.name = name;
    this.age = age;
    this.position = position;
    this.nationality = 'CN';
    this.avatar = '';
    this.potential = potential;
    this.experience = 0;
    this.growthHistory = [];
    
    // 初始化属性（根据潜力和年龄）
    this.stats = this.generateStats();
    
    // 初始化位置熟练度
    this.positionMastery = {
      top: 0,
      jungle: 0,
      mid: 0,
      adc: 0,
      support: 0,
    };
    this.positionMastery[position] = 70 + Math.floor(Math.random() * 20);
    
    // 初始化英雄熟练度
    this.heroMastery = new Map();
    
    // 初始化特质
    this.traits = [];
    
    // 初始化状态
    this.condition = {
      stamina: 100,
      mentality: 80,
      injury: 0,
      morale: 75,
    };
    
    // 初始化合同
    const salary = this.calculateSalary();
    this.contract = {
      salary: salary,
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 2), // 2 年合同
      buyoutClause: salary * 12 * 0.5, // 半年工资
    };
  }
  
  // 生成初始属性
  private generateStats(): PlayerStats {
    const baseValue = 50 + Math.floor(this.potential * 0.3);
    const variance = () => Math.floor(Math.random() * 10) - 5;
    
    return {
      mechanics: Math.min(100, baseValue + variance()),
      awareness: Math.min(100, baseValue + variance()),
      mentality: Math.min(100, baseValue + variance()),
      teamwork: Math.min(100, baseValue + variance()),
      heroPool: Math.min(100, 40 + Math.floor(this.potential * 0.4) + variance()),
    };
  }
  
  // 计算工资
  private calculateSalary(): number {
    const avgStats = this.getAverageStats();
    return Math.round(avgStats * 0.5); // 属性平均值 * 0.5 万
  }
  
  // 计算违约金
  private calculateBuyout(): number {
    return this.contract.salary * 12 * 0.5; // 半年工资
  }
  
  // 获取平均属性
  getAverageStats(): number {
    const values = Object.values(this.stats);
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }
  
  // 获取总实力
  getTotalPower(): number {
    const avgStats = this.getAverageStats();
    const positionBonus = this.positionMastery[this.position] * 0.3;
    const conditionFactor = (100 - this.condition.injury) / 100;
    const moraleFactor = this.condition.morale / 100;
    
    return Math.round((avgStats + positionBonus) * conditionFactor * moraleFactor);
  }
  
  // 获取英雄熟练度
  getHeroMastery(heroId: string): number {
    return this.heroMastery.get(heroId) || 0;
  }
  
  // 增加英雄熟练度
  addHeroMastery(heroId: string, amount: number): number {
    const current = this.getHeroMastery(heroId);
    const newValue = Math.min(100, current + amount);
    this.heroMastery.set(heroId, newValue);
    return newValue;
  }
  
  // 训练属性
  trainStat(statType: keyof PlayerStats, amount: number): void {
    const oldValue = this.stats[statType];
    const growthRate = this.getGrowthRate();
    const actualAmount = amount * growthRate;
    
    this.stats[statType] = Math.min(100, oldValue + actualAmount);
    
    // 记录成长
    if (this.stats[statType] > oldValue) {
      this.growthHistory.push({
        date: new Date(),
        statType,
        oldValue,
        newValue: this.stats[statType],
        reason: 'training',
      });
    }
  }
  
  // 获取成长率（根据年龄和潜力）
  getGrowthRate(): number {
    // 年龄因子：16-18 岁成长快，19-22 岁正常，23 岁后下降
    let ageFactor: number;
    if (this.age <= 18) {
      ageFactor = 1.2;
    } else if (this.age <= 22) {
      ageFactor = 1.0;
    } else {
      ageFactor = 0.8;
    }
    
    // 潜力因子
    const potentialFactor = this.potential / 100;
    
    // 当前属性越高成长越慢
    const avgStats = this.getAverageStats();
    const diminishingReturn = 1 - (avgStats - 50) / 200;
    
    return ageFactor * potentialFactor * diminishingReturn;
  }
  
  // 增加经验
  addExperience(amount: number): void {
    this.experience += amount;
    
    // 检查是否可以突破
    this.checkBreakthrough();
  }
  
  // 检查突破
  private checkBreakthrough(): void {
    // 每 100 经验有一次突破机会
    const breakthroughChance = Math.floor(this.experience / 100) / 10;
    if (Math.random() < breakthroughChance) {
      this.breakthrough();
      this.experience = 0;
    }
  }
  
  // 突破（属性大幅提升）
  private breakthrough(): void {
    const stats = Object.keys(this.stats) as (keyof PlayerStats)[];
    const randomStat = stats[Math.floor(Math.random() * stats.length)]!;
    const increase = 3 + Math.floor(Math.random() * 5); // 提升 3-7 点
    
    const oldValue = this.stats[randomStat];
    this.stats[randomStat] = Math.min(100, oldValue + increase);
    
    this.growthHistory.push({
      date: new Date(),
      statType: randomStat,
      oldValue,
      newValue: this.stats[randomStat],
      reason: 'breakthrough',
    });
  }
  
  // 训练（带强度参数）
  train(statType: keyof PlayerStats, intensity: number = 1): void {
    const oldValue = this.stats[statType];
    
    // 基础训练效果
    const baseEffect = 1 * intensity;
    
    // 应用成长率
    const growthRate = this.getGrowthRate();
    const actualEffect = baseEffect * growthRate;
    
    // 更新属性
    this.stats[statType] = Math.min(100, oldValue + actualEffect);
    
    // 消耗体力
    this.consumeStamina(10 * intensity);
    
    // 增加经验
    this.addExperience(5 * intensity);
    
    // 记录成长
    if (this.stats[statType] > oldValue) {
      this.growthHistory.push({
        date: new Date(),
        statType,
        oldValue,
        newValue: this.stats[statType],
        reason: 'training',
      });
    }
  }
  
  // 恢复状态
  recover(): void {
    this.condition.stamina = Math.min(100, this.condition.stamina + 20);
    this.condition.injury = Math.max(0, this.condition.injury - 5);
    this.condition.mentality = Math.min(100, this.condition.mentality + 10);
  }
  
  // 消耗体力
  consumeStamina(amount: number): void {
    this.condition.stamina = Math.max(0, this.condition.stamina - amount);
  }
  
  // 更新合同
  updateContract(years: number, salary: number): void {
    this.contract.endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * years);
    this.contract.salary = salary;
    this.contract.buyoutClause = this.calculateBuyout();
  }
}

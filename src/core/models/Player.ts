import type { Position, PlayerStats, PlayerCondition, Contract, Trait, GrowthRecord, HeroRole } from '@/types';
import { updatePlayerHeroData, getPlayerAllHeroes, getPlayerHeroData, getPlayerMostUsedHeroes } from '@/core/services/heroSystem';

// 性格特质类型
export type TrainingAttitude = 'diligent' | 'lazy' | 'self-disciplined';
export type PlayStyle = 'aggressive' | 'stable' | 'flexible';
export type TeamworkType = 'lone-wolf' | 'team-player' | 'leader';
export type PressureResistance = 'clutch' | 'fragile' | 'normal';
export type SocialSkill = 'introverted' | 'extroverted' | 'charismatic';

// 性格特质接口
export interface PlayerPersonality {
  trainingAttitude: TrainingAttitude;      // 训练态度
  playStyle: PlayStyle;                    // 比赛风格
  teamwork: TeamworkType;                  // 团队合作
  pressureResistance: PressureResistance;  // 抗压能力
  socialSkill: SocialSkill;                // 社交能力
}

// 特殊天赋效果类型
export type TalentEffectType = 
  | 'potential_bonus'
  | 'growth_extension'
  | 'hero_pool_bonus'
  | 'clutch_performance'
  | 'stamina_conservation'
  | 'stamina_recovery'
  | 'team_morale_bonus'
  | 'fan_growth_bonus';

// 天赋效果接口
export interface TalentEffect {
  type: TalentEffectType;
  value: number;
  condition?: string;  // 触发条件（如 'age < 18'）
}

// 特殊天赋接口
export interface PlayerTalent {
  id: string;
  name: string;
  description: string;
  effect: TalentEffect;
}

// 英雄使用统计
export interface HeroUsageStat {
  heroId: string;
  heroName: string;
  games: number;
  wins: number;
  winRate: number;
  avgKDA: number;
  lastUsed: Date;
}

// 选手英雄偏好
export interface HeroPreference {
  preferredRoles: HeroRole[];     // 擅长的定位（如法师、射手）
  preferredTags: string[];        // 偏好的标签（如控制、爆发）
  favoriteHeroes: string[];       //  favorite英雄ID列表
}

// 职业生涯统计
export interface CareerStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  mvpCount: number;
  goldMedals: number;
  silverMedals: number;
  averageKDA: number;
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  favoriteHeroes: string[];  // 常用英雄 ID
}

// 段位信息
export interface PlayerRank {
  tier: number;              // 段位等级
  stars: number;             // 星星数量
  rankName: string;          // 段位名称（如至尊星耀 II）
}

// 比赛记录
export interface MatchRecord {
  matchId: string;
  date: Date;
  result: 'win' | 'loss';
  heroId: string;
  kda: { kills: number; deaths: number; assists: number };
  score: number;
  medals?: ('gold' | 'silver' | 'mvp')[];
}

// 荣誉记录
export interface Honor {
  type: 'mvp' | 'gold' | 'silver' | 'champion' | 'runner_up';
  date: Date;
  description: string;
}

// 俱乐部历史
export interface ClubHistory {
  clubId: string;
  joinDate: Date;
  leaveDate?: Date;
  achievements: string[];
}

// 人际关系
export interface Relationship {
  playerId: string;
  type: 'teammate' | 'coach' | 'manager' | 'rival';
  value: number;  // 关系值 -100 到 100
}

export class PlayerClass {
  id: string;
  name: string;
  nickname?: string;
  avatar: string;
  
  // 基础信息
  age: number;
  position: Position;
  nationality: string;
  gender: 'male' | 'female';  // 新增：性别
  height: number;             // 新增：身高（cm）
  weight: number;             // 新增：体重（kg）
  gameId: string;             // 新增：游戏 ID
  
  // 核心属性（1-100）
  stats: PlayerStats;
  
  // 位置熟练度
  positionMastery: Record<Position, number>;
  
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
  
  // 新增：性格特质
  personality: PlayerPersonality;
  
  // 新增：特殊天赋
  talents: PlayerTalent[];
  
  // 新增：职业生涯统计
  careerStats: CareerStats;
  
  // 新增：段位
  rank?: PlayerRank;
  
  // 新增：生涯记录
  matchHistory: MatchRecord[];
  honors: Honor[];
  clubHistory: ClubHistory[];
  relationships: Relationship[];
  
  // 新增：英雄偏好
  heroPreference: HeroPreference;
  
  // 次要位置
  secondaryPositions: Position[];
  
  constructor(
    name: string,
    age: number,
    position: Position,
    potential: number = 75,
    gender: 'male' | 'female' = 'male',
    height: number = 175,
    weight: number = 65,
    gameId?: string,
    personality?: PlayerPersonality,
    talents: PlayerTalent[] = [],
    secondaryPositions: Position[] = []
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
    
    // 新增字段初始化
    this.gender = gender;
    this.height = height;
    this.weight = weight;
    this.gameId = gameId || `${name[0]}${name[name.length - 1]}`;
    this.personality = personality || this.generatePersonality();
    this.talents = talents;
    this.secondaryPositions = secondaryPositions;
    
    // 初始化职业生涯统计
    this.careerStats = {
      totalMatches: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      mvpCount: 0,
      goldMedals: 0,
      silverMedals: 0,
      averageKDA: 0,
      totalKills: 0,
      totalDeaths: 0,
      totalAssists: 0,
      favoriteHeroes: []
    };
    
    // 初始化生涯记录
    this.matchHistory = [];
    this.honors = [];
    this.clubHistory = [];
    this.relationships = [];
    
    // 初始化英雄偏好
    this.heroPreference = {
      preferredRoles: [],
      preferredTags: [],
      favoriteHeroes: []
    };
    
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
  
  // 生成默认性格
  private generatePersonality(): PlayerPersonality {
    const trainingAttitudes: TrainingAttitude[] = ['diligent', 'lazy', 'self-disciplined'];
    const playStyles: PlayStyle[] = ['aggressive', 'stable', 'flexible'];
    const teamworkTypes: TeamworkType[] = ['lone-wolf', 'team-player', 'leader'];
    const pressureResistances: PressureResistance[] = ['clutch', 'fragile', 'normal'];
    const socialSkills: SocialSkill[] = ['introverted', 'extroverted', 'charismatic'];
    
    const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]!;
    
    return {
      trainingAttitude: randomItem(trainingAttitudes),
      playStyle: randomItem(playStyles),
      teamwork: randomItem(teamworkTypes),
      pressureResistance: randomItem(pressureResistances),
      socialSkill: randomItem(socialSkills)
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
  
  // 设置英雄偏好
  setHeroPreference(preference: Partial<HeroPreference>): void {
    if (preference.preferredRoles) {
      this.heroPreference.preferredRoles = preference.preferredRoles;
    }
    if (preference.preferredTags) {
      this.heroPreference.preferredTags = preference.preferredTags;
    }
    if (preference.favoriteHeroes) {
      this.heroPreference.favoriteHeroes = preference.favoriteHeroes;
    }
  }
  
  // 记录英雄使用（比赛后调用）
  recordHeroUsage(heroId: string, heroName: string, result: 'win' | 'loss', kda: { kills: number; deaths: number; assists: number }): void {
    updatePlayerHeroData(
      this.id,
      heroId,
      heroName,
      result === 'win',
      false,
      15,
      kda
    );
    
    // 更新职业生涯统计
    this.careerStats.totalMatches += 1;
    if (result === 'win') {
      this.careerStats.wins += 1;
    } else {
      this.careerStats.losses += 1;
    }
    this.careerStats.winRate = Math.round((this.careerStats.wins / this.careerStats.totalMatches) * 100);
    this.careerStats.totalKills += kda.kills;
    this.careerStats.totalDeaths += kda.deaths;
    this.careerStats.totalAssists += kda.assists;
    this.careerStats.averageKDA = Math.round(
      ((this.careerStats.totalKills + this.careerStats.totalAssists) / Math.max(1, this.careerStats.totalDeaths)) * 100
    ) / 100;
  }
  
  // 获取英雄使用统计列表（按场次排序）
  getHeroStatsList() {
    return getPlayerAllHeroes(this.id);
  }
  
  // 获取最常用的英雄
  getMostUsedHeroes(limit: number = 5) {
    return getPlayerMostUsedHeroes(this.id, limit);
  }
  
  // 检查选手是否擅长某个英雄（根据使用场次和胜率）
  isGoodAtHero(heroId: string): boolean {
    return isPlayerGoodAtHero(this.id, heroId);
  }
  
  // 检查选手是否偏好某个标签
  prefersTag(tag: string): boolean {
    return this.heroPreference.preferredTags.includes(tag);
  }
  
  // 检查选手是否偏好某个定位
  prefersRole(role: HeroRole): boolean {
    return this.heroPreference.preferredRoles.includes(role);
  }
}

// 导出 Player 类作为默认导出
export { PlayerClass as Player };

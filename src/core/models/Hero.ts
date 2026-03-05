import type { HeroRole, Position } from '@/types';

export class Hero {
  id: string;
  name: string;
  avatar: string;
  
  // 基础属性
  role: HeroRole;
  difficulty: 1 | 2 | 3;
  powerSpike: 'early' | 'mid' | 'late' | 'all';
  
  // 版本相关
  tier: 0 | 1 | 2 | 3 | 4 | 5;
  versionStrength: number;
  
  // 位置适配
  viablePositions: Position[];
  
  // 克制关系
  counters: string[];
  counteredBy: string[];
  
  constructor(
    id: string,
    name: string,
    role: HeroRole,
    difficulty: 1 | 2 | 3,
    powerSpike: 'early' | 'mid' | 'late' | 'all',
    tier: 0 | 1 | 2 | 3 | 4 | 5,
    viablePositions: Position[]
  ) {
    this.id = id;
    this.name = name;
    this.avatar = '';
    this.role = role;
    this.difficulty = difficulty;
    this.powerSpike = powerSpike;
    this.tier = tier;
    this.versionStrength = this.calculateVersionStrength();
    this.viablePositions = viablePositions;
    this.counters = [];
    this.counteredBy = [];
  }
  
  // 计算版本强度
  private calculateVersionStrength(): number {
    const baseStrength = {
      0: 1.2, // T0
      1: 1.1, // T1
      2: 1.0, // T2
      3: 0.95, // T3
      4: 0.9, // T4
      5: 0.85, // T5
    };
    return baseStrength[this.tier];
  }
  
  // 获取英雄强度（考虑版本）
  getPower(): number {
    return 80 * this.versionStrength;
  }
  
  // 设置克制关系
  setCounters(counterIds: string[]): void {
    this.counters = counterIds;
  }
  
  // 设置被克制关系
  setCounteredBy(counteredBy: string[]): void {
    this.counteredBy = counteredBy;
  }
}

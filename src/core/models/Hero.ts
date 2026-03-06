import type { HeroRole } from '@/types';

// 简化版英雄接口 - 只保留核心字段
export interface SimpleHero {
  id: string;
  name: string;
  avatar: string;
  role: HeroRole;           // 定位（坦克、战士、刺客、法师、射手、辅助）
  tier: 0 | 1 | 2 | 3 | 4 | 5;  // 强度等级 T0-T5
  tags: string[];           // 标签，如"控制"、"爆发"、"突进"等
  counters: string[];       // 克制的英雄ID列表
  counteredBy: string[];    // 被克制的英雄ID列表
  versionHistory: VersionChange[];  // 版本变化历史
}

// 版本变化记录
export interface VersionChange {
  version: string;          // 版本号，如 "S35"
  date: Date;
  change: 'buff' | 'nerf' | 'adjust' | 'rework';
  description: string;      // 变化描述
  tierBefore: 0 | 1 | 2 | 3 | 4 | 5;  // 变化前强度
  tierAfter: 0 | 1 | 2 | 3 | 4 | 5;   // 变化后强度
}

// 英雄类 - 简化版
export class Hero {
  id: string;
  name: string;
  avatar: string;
  role: HeroRole;
  tier: 0 | 1 | 2 | 3 | 4 | 5;
  tags: string[];
  counters: string[];
  counteredBy: string[];
  versionHistory: VersionChange[];

  constructor(
    id: string,
    name: string,
    role: HeroRole,
    tier: 0 | 1 | 2 | 3 | 4 | 5 = 2,
    tags: string[] = [],
    counters: string[] = [],
    counteredBy: string[] = []
  ) {
    this.id = id;
    this.name = name;
    this.avatar = '';
    this.role = role;
    this.tier = tier;
    this.tags = tags;
    this.counters = counters;
    this.counteredBy = counteredBy;
    this.versionHistory = [];
  }

  // 获取当前版本强度系数
  getVersionStrength(): number {
    const baseStrength = {
      0: 1.15, // T0
      1: 1.08, // T1
      2: 1.0,  // T2
      3: 0.95, // T3
      4: 0.9,  // T4
      5: 0.85, // T5
    };
    return baseStrength[this.tier];
  }

  // 添加版本变化
  addVersionChange(change: VersionChange): void {
    this.versionHistory.unshift(change);
    this.tier = change.tierAfter;
  }

  // 设置克制关系
  setCounters(counterIds: string[]): void {
    this.counters = counterIds;
  }

  // 设置被克制关系
  setCounteredBy(counteredByIds: string[]): void {
    this.counteredBy = counteredByIds;
  }

  // 检查是否克制某个英雄
  countersHero(heroId: string): boolean {
    return this.counters.includes(heroId);
  }

  // 检查是否被某个英雄克制
  isCounteredBy(heroId: string): boolean {
    return this.counteredBy.includes(heroId);
  }
}

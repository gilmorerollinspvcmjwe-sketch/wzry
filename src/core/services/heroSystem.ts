import { Hero } from '@/core/models/Hero';
import type { HeroRole, Position } from '@/types';

// 英雄熟练度等级
export interface HeroMasteryLevel {
  level: number;
  name: string;
  minMastery: number;
  bonus: number;
  color: string;
}

// 英雄熟练度等级定义
export const MASTERY_LEVELS: HeroMasteryLevel[] = [
  { level: 0, name: '未入门', minMastery: 0, bonus: 0, color: '#9e9e9e' },
  { level: 1, name: '见习', minMastery: 10, bonus: 2, color: '#8bc34a' },
  { level: 2, name: '熟练', minMastery: 25, bonus: 5, color: '#4caf50' },
  { level: 3, name: '精通', minMastery: 45, bonus: 8, color: '#2196f3' },
  { level: 4, name: '宗师', minMastery: 70, bonus: 12, color: '#9c27b0' },
  { level: 5, name: '传说', minMastery: 90, bonus: 15, color: '#ff9800' },
];

// 版本更新记录
export interface VersionUpdate {
  version: string;
  date: Date;
  buffs: string[]; // 增强的英雄ID
  nerfs: string[]; // 削弱的英雄ID
  adjustments: string[]; // 调整的英雄ID
}

// 英雄池分析结果
export interface HeroPoolAnalysis {
  totalHeroes: number;
  averageMastery: number;
  roleCoverage: Record<HeroRole, number>;
  positionCoverage: Record<Position, number>;
  topHeroes: { heroId: string; mastery: number }[];
  weaknesses: string[];
}

// 英雄系统服务
export class HeroSystem {
  private heroes: Map<string, Hero> = new Map();
  private versionHistory: VersionUpdate[] = [];
  private currentVersion: string = '1.0.0';

  // 初始化英雄系统
  initialize(heroes: Hero[]): void {
    this.heroes.clear();
    heroes.forEach(hero => {
      this.heroes.set(hero.id, hero);
    });
  }

  // 获取英雄
  getHero(heroId: string): Hero | undefined {
    return this.heroes.get(heroId);
  }

  // 获取所有英雄
  getAllHeroes(): Hero[] {
    return Array.from(this.heroes.values());
  }

  // 根据定位获取英雄
  getHeroesByRole(role: HeroRole): Hero[] {
    return this.getAllHeroes().filter(h => h.role === role);
  }

  // 根据位置获取英雄
  getHeroesByPosition(position: Position): Hero[] {
    return this.getAllHeroes().filter(h => h.viablePositions.includes(position));
  }

  // 获取版本强势英雄
  getMetaHeroes(maxTier: number = 2): Hero[] {
    return this.getAllHeroes()
      .filter(h => h.tier <= maxTier)
      .sort((a, b) => a.tier - b.tier);
  }

  // 获取英雄熟练度等级
  getMasteryLevel(mastery: number): HeroMasteryLevel {
    for (let i = MASTERY_LEVELS.length - 1; i >= 0; i--) {
      if (mastery >= MASTERY_LEVELS[i].minMastery) {
        return MASTERY_LEVELS[i];
      }
    }
    return MASTERY_LEVELS[0];
  }

  // 计算英雄熟练度加成
  getMasteryBonus(mastery: number): number {
    const level = this.getMasteryLevel(mastery);
    return level.bonus;
  }

  // 计算使用英雄时的属性加成
  calculateHeroBonus(playerStats: number, heroMastery: number): number {
    const masteryBonus = this.getMasteryBonus(heroMastery);
    return playerStats * (1 + masteryBonus / 100);
  }

  // 计算英雄对战加成
  calculateMatchupBonus(heroId: string, opponentHeroId: string): number {
    const hero = this.getHero(heroId);
    if (!hero) return 0;

    // 克制关系加成
    if (hero.counters.includes(opponentHeroId)) {
      return 0.1; // 10% 加成
    }
    if (hero.counteredBy.includes(opponentHeroId)) {
      return -0.1; // 10% 减成
    }
    return 0;
  }

  // 版本更新
  applyVersionUpdate(update: VersionUpdate): void {
    this.versionHistory.push(update);
    this.currentVersion = update.version;

    // 应用增强
    update.buffs.forEach(heroId => {
      const hero = this.getHero(heroId);
      if (hero && hero.tier > 0) {
        hero.tier = (hero.tier - 1) as 0 | 1 | 2 | 3 | 4 | 5;
        hero.versionStrength = this.calculateVersionStrength(hero.tier);
      }
    });

    // 应用削弱
    update.nerfs.forEach(heroId => {
      const hero = this.getHero(heroId);
      if (hero && hero.tier < 5) {
        hero.tier = (hero.tier + 1) as 0 | 1 | 2 | 3 | 4 | 5;
        hero.versionStrength = this.calculateVersionStrength(hero.tier);
      }
    });
  }

  // 计算版本强度
  private calculateVersionStrength(tier: number): number {
    const baseStrength: Record<number, number> = {
      0: 1.2,
      1: 1.1,
      2: 1.0,
      3: 0.95,
      4: 0.9,
      5: 0.85,
    };
    return baseStrength[tier] || 1.0;
  }

  // 生成随机版本更新
  generateRandomUpdate(): VersionUpdate {
    const allHeroes = this.getAllHeroes();
    const buffCount = Math.floor(Math.random() * 3) + 1;
    const nerfCount = Math.floor(Math.random() * 3) + 1;

    const shuffled = [...allHeroes].sort(() => Math.random() - 0.5);
    const buffs = shuffled.slice(0, buffCount).map(h => h.id);
    const nerfs = shuffled.slice(buffCount, buffCount + nerfCount).map(h => h.id);

    // 递增版本号
    const versionParts = this.currentVersion.split('.').map(Number);
    versionParts[2]++;
    if (versionParts[2] > 9) {
      versionParts[2] = 0;
      versionParts[1]++;
    }
    if (versionParts[1] > 9) {
      versionParts[1] = 0;
      versionParts[0]++;
    }

    return {
      version: versionParts.join('.'),
      date: new Date(),
      buffs,
      nerfs,
      adjustments: [],
    };
  }

  // 分析英雄池
  analyzeHeroPool(heroMasteries: Map<string, number>): HeroPoolAnalysis {
    const entries = Array.from(heroMasteries.entries());
    const totalHeroes = entries.length;
    const averageMastery = totalHeroes > 0
      ? entries.reduce((sum, [, m]) => sum + m, 0) / totalHeroes
      : 0;

    // 定位覆盖
    const roleCoverage: Record<HeroRole, number> = {
      tank: 0,
      fighter: 0,
      assassin: 0,
      mage: 0,
      marksman: 0,
      support: 0,
    };

    // 位置覆盖
    const positionCoverage: Record<Position, number> = {
      top: 0,
      jungle: 0,
      mid: 0,
      adc: 0,
      support: 0,
    };

    entries.forEach(([heroId, mastery]) => {
      const hero = this.getHero(heroId);
      if (hero) {
        roleCoverage[hero.role] += mastery;
        hero.viablePositions.forEach(pos => {
          positionCoverage[pos] += mastery;
        });
      }
    });

    // 获取熟练度最高的英雄
    const topHeroes = entries
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([heroId, mastery]) => ({ heroId, mastery }));

    // 识别弱点
    const weaknesses: string[] = [];
    (Object.keys(roleCoverage) as HeroRole[]).forEach(role => {
      if (roleCoverage[role] < 50) {
        weaknesses.push(`${role}定位英雄熟练度不足`);
      }
    });
    (Object.keys(positionCoverage) as Position[]).forEach(pos => {
      if (positionCoverage[pos] < 50) {
        weaknesses.push(`${pos}位置英雄熟练度不足`);
      }
    });

    return {
      totalHeroes,
      averageMastery,
      roleCoverage,
      positionCoverage,
      topHeroes,
      weaknesses,
    };
  }

  // 推荐适合位置的英雄
  recommendHeroesForPosition(
    position: Position,
    heroMasteries: Map<string, number>,
    limit: number = 5
  ): { hero: Hero; mastery: number; score: number }[] {
    const heroes = this.getHeroesByPosition(position);

    return heroes
      .map(hero => {
        const mastery = heroMasteries.get(hero.id) || 0;
        // 综合评分 = 英雄强度 * 0.4 + 熟练度 * 0.6
        const score = hero.getPower() * 0.4 + mastery * 0.6;
        return { hero, mastery, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // 获取当前版本
  getCurrentVersion(): string {
    return this.currentVersion;
  }

  // 获取版本历史
  getVersionHistory(): VersionUpdate[] {
    return this.versionHistory;
  }
}

// 创建单例实例
export const heroSystem = new HeroSystem();

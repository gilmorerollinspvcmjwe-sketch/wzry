import type { Hero } from '@/core/models/Hero';

/**
 * 版本数据结构
 */
export interface VersionData {
  version: string;              // 版本号（如 "1.2.3"）
  releaseDate: Date;            // 发布日期
  heroes: HeroBalanceChange[];  // 英雄调整列表
  description: string;          // 版本说明
}

/**
 * 英雄平衡性调整
 */
export interface HeroBalanceChange {
  heroId: string;
  changeType: 'buff' | 'nerf' | 'adjustment';  // Buff/Nerf/调整
  changes: string[];              // 调整内容描述
  oldTier?: 0 | 1 | 2 | 3 | 4 | 5;  // 调整前 tier
  newTier?: 0 | 1 | 2 | 3 | 4 | 5;  // 调整后 tier
}

/**
 * 版本历史
 */
class VersionHistory {
  private versions: VersionData[] = [];
  private currentVersionIndex: number = -1;

  /**
   * 添加新版本
   */
  addVersion(version: VersionData): void {
    this.versions.push(version);
    this.currentVersionIndex = this.versions.length - 1;
  }

  /**
   * 获取当前版本
   */
  getCurrentVersion(): VersionData | undefined {
    if (this.currentVersionIndex >= 0) {
      return this.versions[this.currentVersionIndex];
    }
    return undefined;
  }

  /**
   * 获取所有版本
   */
  getAllVersions(): VersionData[] {
    return this.versions;
  }

  /**
   * 获取版本历史
   */
  getVersionHistory(): { version: string; date: Date; heroCount: number }[] {
    return this.versions.map(v => ({
      version: v.version,
      date: v.releaseDate,
      heroCount: v.heroes.length
    }));
  }
}

// 单例实例
const versionHistory = new VersionHistory();

/**
 * 应用版本更新到英雄
 */
export function applyVersionUpdate(
  heroes: Hero[],
  versionData: VersionData
): { updatedHeroes: Hero[]; changes: HeroBalanceChange[] } {
  const updatedHeroes = heroes.map(hero => {
    const change = versionData.heroes.find(h => h.heroId === hero.id);
    if (!change) return hero;

    // 创建英雄副本
    const updatedHero = Object.assign(Object.create(Object.getPrototypeOf(hero)), hero);

    // 应用 tier 变化
    if (change.newTier !== undefined && change.newTier !== change.oldTier) {
      updatedHero.tier = change.newTier;
      // 重新计算版本强度
      (updatedHero as any).versionStrength = updatedHero.calculateVersionStrength();
    }

    return updatedHero;
  });

  return {
    updatedHeroes,
    changes: versionData.heroes
  };
}

/**
 * 生成版本更新公告
 */
export function generatePatchNotes(versionData: VersionData): string {
  let notes = `## 版本 ${versionData.version} 更新公告\n\n`;
  notes += `**发布日期**: ${versionData.releaseDate.toLocaleDateString('zh-CN')}\n\n`;
  notes += `${versionData.description}\n\n`;

  // 按调整类型分组
  const buffs = versionData.heroes.filter(h => h.changeType === 'buff');
  const nerfs = versionData.heroes.filter(h => h.changeType === 'nerf');
  const adjustments = versionData.heroes.filter(h => h.changeType === 'adjustment');

  if (buffs.length > 0) {
    notes += `### 📈 英雄加强\n\n`;
    buffs.forEach(change => {
      notes += `#### ${change.heroId}\n`;
      change.changes.forEach(c => notes += `- ${c}\n`);
      if (change.oldTier && change.newTier) {
        notes += `- 强度调整：T${change.oldTier} → T${change.newTier}\n`;
      }
      notes += `\n`;
    });
  }

  if (nerfs.length > 0) {
    notes += `### 📉 英雄削弱\n\n`;
    nerfs.forEach(change => {
      notes += `#### ${change.heroId}\n`;
      change.changes.forEach(c => notes += `- ${c}\n`);
      if (change.oldTier && change.newTier) {
        notes += `- 强度调整：T${change.oldTier} → T${change.newTier}\n`;
      }
      notes += `\n`;
    });
  }

  if (adjustments.length > 0) {
    notes += `### 🔧 英雄调整\n\n`;
    adjustments.forEach(change => {
      notes += `#### ${change.heroId}\n`;
      change.changes.forEach(c => notes += `- ${c}\n`);
      if (change.oldTier && change.newTier) {
        notes += `- 强度调整：T${change.oldTier} → T${change.newTier}\n`;
      }
      notes += `\n`;
    });
  }

  return notes;
}

/**
 * 创建新版本
 */
export function createVersion(
  version: string,
  description: string,
  heroChanges: HeroBalanceChange[]
): VersionData {
  return {
    version,
    releaseDate: new Date(),
    heroes: heroChanges,
    description
  };
}

/**
 * 应用版本更新并添加到历史
 */
export function applyUpdate(
  heroes: Hero[],
  version: string,
  description: string,
  heroChanges: HeroBalanceChange[]
): { updatedHeroes: Hero[]; patchNotes: string } {
  const versionData = createVersion(version, description, heroChanges);
  versionHistory.addVersion(versionData);
  
  const { updatedHeroes } = applyVersionUpdate(heroes, versionData);
  const patchNotes = generatePatchNotes(versionData);

  return {
    updatedHeroes,
    patchNotes
  };
}

/**
 * 获取当前版本
 */
export function getCurrentVersion(): VersionData | undefined {
  return versionHistory.getCurrentVersion();
}

/**
 * 获取版本历史
 */
export function getVersionHistory(): { version: string; date: Date; heroCount: number }[] {
  return versionHistory.getVersionHistory();
}

/**
 * 预设版本更新模板
 */
export const PRESET_UPDATES = {
  // 赛季更新 - 大规模调整
  seasonUpdate: (seasonNumber: number): VersionData => ({
    version: `${seasonNumber}.0.0`,
    releaseDate: new Date(),
    description: `第 ${seasonNumber} 赛季更新 - 英雄平衡性大调整`,
    heroes: [
      {
        heroId: 'hero_009',
        changeType: 'nerf',
        changes: ['基础攻击力降低 10', '技能 1 冷却时间增加 2 秒'],
        oldTier: 0,
        newTier: 1
      },
      {
        heroId: 'hero_023',
        changeType: 'nerf',
        changes: ['大招伤害降低 15%', '镜像持续时间减少 1 秒'],
        oldTier: 0,
        newTier: 1
      },
      {
        heroId: 'hero_024',
        changeType: 'nerf',
        changes: ['2 技能吸血比例降低 5%', '基础生命值降低 200'],
        oldTier: 0,
        newTier: 1
      },
      {
        heroId: 'hero_039',
        changeType: 'buff',
        changes: ['被动攻击速度提升 10%', '2 技能冷却时间减少 1 秒'],
        oldTier: 0,
        newTier: 0
      },
      {
        heroId: 'hero_015',
        changeType: 'buff',
        changes: ['1 技能伤害提升 80', '大招击飞时间增加 0.25 秒'],
        oldTier: 1,
        newTier: 1
      }
    ]
  }),

  // 月度平衡 - 中等调整
  monthlyBalance: (month: number): VersionData => ({
    version: `1.${month}.0`,
    releaseDate: new Date(),
    description: `${month}月平衡性调整 - 优化部分英雄表现`,
    heroes: [
      {
        heroId: 'hero_001',
        changeType: 'buff',
        changes: ['被动免伤率提升 3%', '大招冷却时间减少 5 秒'],
        oldTier: 2,
        newTier: 2
      },
      {
        heroId: 'hero_016',
        changeType: 'adjustment',
        changes: ['1 技能前期伤害降低，后期伤害提升', '优化技能手感'],
        oldTier: 2,
        newTier: 2
      },
      {
        heroId: 'hero_031',
        changeType: 'nerf',
        changes: ['大招飞行速度降低', '前期清线能力下调'],
        oldTier: 1,
        newTier: 2
      }
    ]
  }),

  // 紧急热更 - 小调整
  hotfix: (issueNumber: number): VersionData => ({
    version: `1.0.${issueNumber}`,
    releaseDate: new Date(),
    description: '紧急平衡性调整',
    heroes: [
      {
        heroId: 'hero_046',
        changeType: 'nerf',
        changes: ['被动护盾值降低 15%', '2 技能控制时间减少 0.25 秒'],
        oldTier: 2,
        newTier: 2
      }
    ]
  })
};

/**
 * 应用预设更新
 */
export function applyPresetUpdate(
  heroes: Hero[],
  preset: VersionData
): { updatedHeroes: Hero[]; patchNotes: string } {
  versionHistory.addVersion(preset);
  const { updatedHeroes } = applyVersionUpdate(heroes, preset);
  const patchNotes = generatePatchNotes(preset);

  return {
    updatedHeroes,
    patchNotes
  };
}

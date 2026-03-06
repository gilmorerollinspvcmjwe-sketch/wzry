// 英雄熟练度系统服务

/**
 * 英雄熟练度等级
 */
export type MasteryLevel = '见习' | '熟练' | '精通' | '宗师' | '传说';

/**
 * 选手 - 英雄熟练度数据（统一数据模型）
 */
export interface PlayerHeroMastery {
  playerId: string;
  heroId: string;
  heroName: string;          // 英雄名称
  masteryPoints: number;     // 熟练度点数
  level: MasteryLevel;       // 熟练度等级
  gamesPlayed: number;       // 使用该英雄的比赛场数
  wins: number;              // 胜场
  winRate: number;           // 胜率 (0-100)
  avgKDA: number;            // 平均 KDA
  mvpCount: number;          // MVP 次数
  lastPlayedAt?: Date;      // 最后使用时间
}

/**
 * 熟练度等级配置
 */
const MASTERY_CONFIG: Record<MasteryLevel, { minPoints: number; maxPoints: number; bonus: number }> = {
  '见习': { minPoints: 0, maxPoints: 100, bonus: 0 },
  '熟练': { minPoints: 100, maxPoints: 300, bonus: 0.03 },
  '精通': { minPoints: 300, maxPoints: 600, bonus: 0.06 },
  '宗师': { minPoints: 600, maxPoints: 1000, bonus: 0.09 },
  '传说': { minPoints: 1000, maxPoints: 99999, bonus: 0.12 }
};

/**
 * 熟练度存储（玩家 - 英雄映射）
 */
class HeroMasteryStore {
  private masteryMap: Map<string, PlayerHeroMastery> = new Map();

  /**
   * 生成唯一键
   */
  private generateKey(playerId: string, heroId: string): string {
    return `${playerId}_${heroId}`;
  }

  /**
   * 获取或创建熟练度数据
   */
  getOrCreate(playerId: string, heroId: string, heroName: string = ''): PlayerHeroMastery {
    const key = this.generateKey(playerId, heroId);
    if (!this.masteryMap.has(key)) {
      this.masteryMap.set(key, {
        playerId,
        heroId,
        heroName,
        masteryPoints: 0,
        level: '见习',
        gamesPlayed: 0,
        wins: 0,
        winRate: 0,
        avgKDA: 0,
        mvpCount: 0,
        lastPlayedAt: undefined
      });
    }
    return this.masteryMap.get(key)!;
  }

  /**
   * 获取熟练度数据
   */
  get(playerId: string, heroId: string): PlayerHeroMastery | undefined {
    const key = this.generateKey(playerId, heroId);
    return this.masteryMap.get(key);
  }

  /**
   * 更新熟练度数据
   */
  update(data: PlayerHeroMastery): void {
    const key = this.generateKey(data.playerId, data.heroId);
    this.masteryMap.set(key, data);
  }

  /**
   * 获取选手的所有英雄熟练度
   */
  getByPlayer(playerId: string): PlayerHeroMastery[] {
    return Array.from(this.masteryMap.values()).filter(m => m.playerId === playerId);
  }

  /**
   * 获取英雄的所有选手熟练度
   */
  getByHero(heroId: string): PlayerHeroMastery[] {
    return Array.from(this.masteryMap.values()).filter(m => m.heroId === heroId);
  }

  /**
   * 序列化数据（用于存档）
   */
  serialize(): PlayerHeroMastery[] {
    return Array.from(this.masteryMap.values());
  }

  /**
   * 反序列化数据（加载存档）
   */
  deserialize(data: PlayerHeroMastery[]): void {
    this.masteryMap.clear();
    data.forEach(item => {
      const key = this.generateKey(item.playerId, item.heroId);
      this.masteryMap.set(key, item);
    });
  }
}

// 单例实例
const heroMasteryStore = new HeroMasteryStore();

/**
 * 获取熟练度等级
 */
export function getMasteryLevel(points: number): MasteryLevel {
  if (points >= 1000) return '传说';
  if (points >= 600) return '宗师';
  if (points >= 300) return '精通';
  if (points >= 100) return '熟练';
  return '见习';
}

/**
 * 获取熟练度加成（0-15%）
 */
export function getMasteryBonus(points: number): number {
  const level = getMasteryLevel(points);
  return MASTERY_CONFIG[level].bonus;
}

/**
 * 获取当前等级的进度
 */
export function getMasteryProgress(points: number): { current: number; max: number; percentage: number } {
  const level = getMasteryLevel(points);
  const config = MASTERY_CONFIG[level];
  const current = points - config.minPoints;
  const max = config.maxPoints - config.minPoints;
  return {
    current,
    max,
    percentage: Math.min(100, (current / max) * 100)
  };
}

/**
 * 计算比赛后获得的熟练度
 */
export function calculateMasteryGain(
  isWin: boolean,
  isMVP: boolean,
  gameDuration: number
): number {
  // 基础熟练度：20 点
  let gain = 20;
  
  // 胜利加成：+50%
  if (isWin) {
    gain *= 1.5;
  }
  
  // MVP 加成：+50%
  if (isMVP) {
    gain *= 1.5;
  }
  
  // 时长加成：每分钟 +1 点，最多 +20 点
  const durationBonus = Math.min(20, Math.floor(gameDuration / 1));
  gain += durationBonus;
  
  return Math.floor(gain);
}

/**
 * 更新选手英雄熟练度
 */
export function updatePlayerHeroMastery(
  playerId: string,
  heroId: string,
  heroName: string,
  isWin: boolean,
  isMVP: boolean,
  gameDuration: number
): PlayerHeroMastery {
  const mastery = heroMasteryStore.getOrCreate(playerId, heroId, heroName);
  
  // 增加熟练度点数
  const gain = calculateMasteryGain(isWin, isMVP, gameDuration);
  mastery.masteryPoints += gain;
  mastery.level = getMasteryLevel(mastery.masteryPoints);
  
  // 更新统计
  mastery.heroName = heroName;
  mastery.gamesPlayed += 1;
  if (isWin) {
    mastery.wins += 1;
  }
  mastery.winRate = Math.round((mastery.wins / mastery.gamesPlayed) * 100);
  if (isMVP) {
    mastery.mvpCount += 1;
  }
  mastery.lastPlayedAt = new Date();
  
  // 保存
  heroMasteryStore.update(mastery);
  
  return mastery;
}

/**
 * 统一更新选手英雄数据（熟练度 + 使用统计）
 */
export function updatePlayerHeroData(
  playerId: string,
  heroId: string,
  heroName: string,
  isWin: boolean,
  isMVP: boolean,
  gameDuration: number,
  kda: { kills: number; deaths: number; assists: number }
): PlayerHeroMastery {
  const mastery = heroMasteryStore.getOrCreate(playerId, heroId, heroName);
  
  // 更新英雄名称
  mastery.heroName = heroName;
  
  // 增加熟练度点数
  const gain = calculateMasteryGain(isWin, isMVP, gameDuration);
  mastery.masteryPoints += gain;
  mastery.level = getMasteryLevel(mastery.masteryPoints);
  
  // 更新使用统计
  mastery.gamesPlayed += 1;
  if (isWin) {
    mastery.wins += 1;
  }
  mastery.winRate = Math.round((mastery.wins / mastery.gamesPlayed) * 100);
  
  // 更新平均 KDA
  const currentKDA = (kda.kills + kda.assists) / Math.max(1, kda.deaths);
  if (mastery.gamesPlayed === 1) {
    mastery.avgKDA = Math.round(currentKDA * 100) / 100;
  } else {
    const totalKDA = mastery.avgKDA * (mastery.gamesPlayed - 1) + currentKDA;
    mastery.avgKDA = Math.round((totalKDA / mastery.gamesPlayed) * 100) / 100;
  }
  
  if (isMVP) {
    mastery.mvpCount += 1;
  }
  mastery.lastPlayedAt = new Date();
  
  // 保存
  heroMasteryStore.update(mastery);
  
  return mastery;
}

/**
 * 获取选手对某个英雄的熟练度加成
 */
export function getPlayerHeroBonus(playerId: string, heroId: string): number {
  const mastery = heroMasteryStore.get(playerId, heroId);
  if (!mastery) return 0;
  return getMasteryBonus(mastery.masteryPoints);
}

/**
 * 获取选手的常用英雄列表
 */
export function getPlayerFavoriteHeroes(playerId: string, limit: number = 5): PlayerHeroMastery[] {
  return heroMasteryStore
    .getByPlayer(playerId)
    .sort((a, b) => b.masteryPoints - a.masteryPoints)
    .slice(0, limit);
}

/**
 * 获取选手的英雄池深度（不同熟练度等级的英雄数量）
 */
export function getHeroPoolDepth(playerId: string): {
  total: number;
  master: number;     // 精通及以上
  expert: number;     // 宗师及以上
  legend: number;     // 传说
} {
  const masteries = heroMasteryStore.getByPlayer(playerId);
  return {
    total: masteries.length,
    master: masteries.filter(m => m.level === '精通' || m.level === '宗师' || m.level === '传说').length,
    expert: masteries.filter(m => m.level === '宗师' || m.level === '传说').length,
    legend: masteries.filter(m => m.level === '传说').length
  };
}

/**
 * 训练英雄（消耗时间/资金提升熟练度）
 */
export function trainHero(
  playerId: string,
  heroId: string,
  trainingType: 'basic' | 'advanced' | 'intensive'
): { cost: number; time: number; masteryGain: number } {
  const config = {
    'basic': { cost: 1, time: 1, gain: 10 },      // 基础训练：1 万/1 天/+10 熟练度
    'advanced': { cost: 5, time: 2, gain: 25 },   // 进阶训练：5 万/2 天/+25 熟练度
    'intensive': { cost: 10, time: 3, gain: 50 }  // 强化训练：10 万/3 天/+50 熟练度
  };
  
  const training = config[trainingType];
  const mastery = heroMasteryStore.getOrCreate(playerId, heroId);
  
  mastery.masteryPoints += training.gain;
  mastery.level = getMasteryLevel(mastery.masteryPoints);
  heroMasteryStore.update(mastery);
  
  return {
    cost: training.cost,
    time: training.time,
    masteryGain: training.gain
  };
}

/**
 * 导出所有熟练度数据（用于存档）
 */
export function exportMasteryData(): PlayerHeroMastery[] {
  return heroMasteryStore.serialize();
}

/**
 * 导入熟练度数据（加载存档）
 */
export function importMasteryData(data: PlayerHeroMastery[]): void {
  heroMasteryStore.deserialize(data);
}

/**
 * 获取选手的所有英雄数据（按场次排序）
 */
export function getPlayerAllHeroes(playerId: string): PlayerHeroMastery[] {
  return heroMasteryStore
    .getByPlayer(playerId)
    .sort((a, b) => b.gamesPlayed - a.gamesPlayed);
}

/**
 * 获取选手对某个英雄的数据
 */
export function getPlayerHeroData(playerId: string, heroId: string): PlayerHeroMastery | undefined {
  return heroMasteryStore.get(playerId, heroId);
}

/**
 * 获取选手最常用的英雄列表
 */
export function getPlayerMostUsedHeroes(playerId: string, limit: number = 5): PlayerHeroMastery[] {
  return getPlayerAllHeroes(playerId).slice(0, limit);
}

/**
 * 检查选手是否擅长某个英雄（根据使用场次和胜率）
 */
export function isPlayerGoodAtHero(playerId: string, heroId: string): boolean {
  const stat = getPlayerHeroData(playerId, heroId);
  if (!stat) return false;
  return stat.gamesPlayed >= 5 && stat.winRate >= 55;
}

import type { Player } from '@/core/models/Player';
import type { PlayerStats } from '@/types';

/**
 * 选手发展阶段
 */
export type PlayerLifeStage = 'growth' | 'peak' | 'decline' | 'retired';

/**
 * 技能专精方向
 */
export type Specialization = 'offense' | 'defense' | 'allround';

/**
 * 特殊技能
 */
export interface PlayerSkill {
  id: string;
  name: string;
  description: string;
  effect: string;
  unlockedAt: number;  // 解锁等级
}

/**
 * 伤病信息
 */
export interface Injury {
  type: 'minor' | 'moderate' | 'severe';
  affectedStat: keyof PlayerStats;
  recoveryDays: number;
  startDate: Date;
}

/**
 * 训练计划
 */
export interface TrainingPlan {
  playerId: string;
  focusStat: keyof PlayerStats;
  intensity: 'conservative' | 'balanced' | 'aggressive';
  duration: number;  // 天数
  cost: number;      // 费用（万）
}

/**
 * 可用的特殊技能列表
 */
export const AVAILABLE_SKILLS: PlayerSkill[] = [
  {
    id: 'skill_001',
    name: '领导力',
    description: '担任队长时全队士气 +10%',
    effect: 'team_morale_10',
    unlockedAt: 5
  },
  {
    id: 'skill_002',
    name: '关键先生',
    description: '决胜局表现 +20%',
    effect: 'clutch_20',
    unlockedAt: 5
  },
  {
    id: 'skill_003',
    name: '新人王',
    description: '18 岁以下属性成长 +30%',
    effect: 'youth_growth_30',
    unlockedAt: 3
  },
  {
    id: 'skill_004',
    name: '劳模',
    description: '体力消耗 -20%',
    effect: 'stamina_save_20',
    unlockedAt: 4
  },
  {
    id: 'skill_005',
    name: '战术大师',
    description: '团队属性 +15',
    effect: 'teamwork_15',
    unlockedAt: 6
  },
  {
    id: 'skill_006',
    name: '心理专家',
    description: '心态属性 +20',
    effect: 'mentality_20',
    unlockedAt: 4
  }
];

/**
 * 获取选手发展阶段
 */
export function getPlayerLifeStage(age: number): PlayerLifeStage {
  if (age < 16) return 'growth';
  if (age <= 22) return 'growth';
  if (age <= 26) return 'peak';
  if (age <= 30) return 'decline';
  return 'retired';
}

/**
 * 计算成长率
 */
export function calculateGrowthRate(player: Player): number {
  const stage = getPlayerLifeStage(player.age);
  
  // 阶段基础成长率
  const stageRates: Record<PlayerLifeStage, number> = {
    growth: 1.2,
    peak: 1.0,
    decline: 0.7,
    retired: 0
  };
  
  const stageRate = stageRates[stage];
  
  // 潜力因子
  const potentialFactor = player.potential / 100;
  
  // 当前属性影响（越高成长越慢）
  const avgStats = getAverageStats(player);
  const diminishingReturn = Math.max(0.3, 1 - (avgStats - 50) / 150);
  
  // 性格影响
  let personalityFactor = 1;
  if (player.personality.trainingAttitude === 'diligent') {
    personalityFactor = 1.1;
  } else if (player.personality.trainingAttitude === 'lazy') {
    personalityFactor = 0.9;
  }
  
  // 天赋影响
  let talentFactor = 1;
  if (player.talents.some(t => t.id === 'talent_001' && player.age < 18)) {
    talentFactor = 1.1;  // 天才少年
  }
  
  return stageRate * potentialFactor * diminishingReturn * personalityFactor * talentFactor;
}

/**
 * 获取平均属性
 */
function getAverageStats(player: Player): number {
  const values = Object.values(player.stats);
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * 训练属性
 */
export function trainPlayer(
  player: Player,
  statType: keyof PlayerStats,
  intensity: 'conservative' | 'balanced' | 'aggressive'
): { success: boolean; gain: number; fatigueGain: number; message: string } {
  // 检查是否受伤
  if (player.condition.injury > 0) {
    return {
      success: false,
      gain: 0,
      fatigueGain: 0,
      message: '选手受伤中，无法训练'
    };
  }
  
  // 检查体力
  const intensityConfig = {
    conservative: { baseGain: 0.5, fatigue: 5, cost: 1 },
    balanced: { baseGain: 1, fatigue: 10, cost: 2 },
    aggressive: { baseGain: 1.5, fatigue: 20, cost: 3 }
  };
  
  const config = intensityConfig[intensity];
  
  if (player.condition.stamina < config.fatigue) {
    return {
      success: false,
      gain: 0,
      fatigueGain: 0,
      message: '体力不足，需要休息'
    };
  }
  
  // 计算成长
  const growthRate = calculateGrowthRate(player);
  const gain = config.baseGain * growthRate;
  
  // 应用成长
  const oldValue = player.stats[statType];
  player.stats[statType] = Math.min(100, oldValue + gain);
  
  // 消耗体力
  player.condition.stamina -= config.fatigue;
  
  // 积累疲劳（激进训练更容易受伤）
  const injuryRisk = intensity === 'aggressive' ? 0.05 : intensity === 'balanced' ? 0.02 : 0.01;
  if (Math.random() < injuryRisk) {
    return {
      success: true,
      gain,
      fatigueGain: config.fatigue,
      message: `训练成功，属性 +${gain.toFixed(1)}，但选手感到轻微不适`
    };
  }
  
  // 记录成长历史
  player.growthHistory.push({
    date: new Date(),
    statType,
    oldValue,
    newValue: player.stats[statType],
    reason: `training_${intensity}`
  });
  
  return {
    success: true,
    gain,
    fatigueGain: config.fatigue,
    message: `训练成功，${statType} +${gain.toFixed(1)}`
  };
}

/**
 * 休息恢复
 */
export function restPlayer(player: Player): { staminaRecovered: number; injuryHealed: number } {
  const oldStamina = player.condition.stamina;
  const oldInjury = player.condition.injury;
  
  // 恢复体力
  let recoveryRate = 20;
  
  // 天赋影响
  if (player.talents.some(t => t.id === 'talent_006')) {
    recoveryRate *= 1.5;  // 快速恢复
  }
  
  player.condition.stamina = Math.min(100, player.condition.stamina + recoveryRate);
  
  // 恢复伤病
  player.condition.injury = Math.max(0, player.condition.injury - 10);
  
  // 恢复心态
  player.condition.mentality = Math.min(100, player.condition.mentality + 5);
  
  return {
    staminaRecovered: player.condition.stamina - oldStamina,
    injuryHealed: oldInjury - player.condition.injury
  };
}

/**
 * 检查伤病
 */
export function checkInjury(player: Player): { isInjured: boolean; injuryType?: string; days?: number } {
  // 疲劳过高导致伤病
  if (player.condition.stamina < 20) {
    const injuryChance = (20 - player.condition.stamina) / 100;
    if (Math.random() < injuryChance) {
      const injuries = [
        { type: '手腕疲劳', days: 3 },
        { type: '肩颈酸痛', days: 5 },
        { type: '腰部不适', days: 7 }
      ];
      const injury = injuries[Math.floor(Math.random() * injuries.length)];
      
      player.condition.injury = 30;
      
      if (injury) {
        return {
          isInjured: true,
          injuryType: injury.type,
          days: injury.days
        };
      }
    }
  }
  
  return { isInjured: false };
}

/**
 * 解锁特殊技能
 */
export function unlockSkill(player: Player, skillId: string): { success: boolean; message: string } {
  const skill = AVAILABLE_SKILLS.find(s => s.id === skillId);
  if (!skill) {
    return { success: false, message: '技能不存在' };
  }
  
  // 检查是否已解锁
  if (player.traits.some(t => t.id === skillId)) {
    return { success: false, message: '已解锁该技能' };
  }
  
  // 检查等级要求
  const playerLevel = Math.floor(player.experience / 100) + 1;
  if (playerLevel < skill.unlockedAt) {
    return { success: false, message: `需要等级 ${skill.unlockedAt} 才能解锁` };
  }
  
  // 解锁技能 - effect是字符串，解析它来获取效果类型和值
  const effectParts = skill.effect.split('_');
  const effectType = effectParts.slice(0, -1).join('_') || 'unknown';
  const effectValue = parseInt(effectParts[effectParts.length - 1] || '0', 10);
  
  player.traits.push({
    id: skill.id,
    name: skill.name,
    description: skill.description,
    type: 'special',
    effects: { [effectType]: effectValue }
  });
  
  return { success: true, message: `成功解锁技能：${skill.name}` };
}

/**
 * 选择专精方向
 */
export function setSpecialization(player: Player, spec: Specialization): void {
  (player as any).specialization = spec;
  
  // 根据专精方向调整属性成长
  switch (spec) {
    case 'offense':
      player.stats.mechanics = Math.min(100, player.stats.mechanics + 5);
      break;
    case 'defense':
      player.stats.awareness = Math.min(100, player.stats.awareness + 5);
      break;
    case 'allround':
      // 全能型小幅提升所有属性
      Object.keys(player.stats).forEach(key => {
        const statKey = key as keyof PlayerStats;
        player.stats[statKey] = Math.min(100, player.stats[statKey] + 2);
      });
      break;
  }
}

/**
 * 更新职业生涯统计
 */
export function updateCareerStats(
  player: Player,
  matchResult: {
    isWin: boolean;
    kda: { kills: number; deaths: number; assists: number };
    isMVP: boolean;
    isGold: boolean;
    isSilver: boolean;
    heroId: string;
  }
): void {
  const stats = player.careerStats;
  
  // 更新基本统计
  stats.totalMatches += 1;
  if (matchResult.isWin) {
    stats.wins += 1;
  } else {
    stats.losses += 1;
  }
  
  // 更新胜率
  stats.winRate = Math.round((stats.wins / stats.totalMatches) * 100);
  
  // 更新荣誉
  if (matchResult.isMVP) {
    stats.mvpCount += 1;
    player.honors.push({
      type: 'mvp',
      date: new Date(),
      description: `获得 MVP`
    });
  }
  if (matchResult.isGold) {
    stats.goldMedals += 1;
    player.honors.push({
      type: 'gold',
      date: new Date(),
      description: '获得金牌'
    });
  }
  if (matchResult.isSilver) {
    stats.silverMedals += 1;
    player.honors.push({
      type: 'silver',
      date: new Date(),
      description: '获得银牌'
    });
  }
  
  // 更新 KDA
  stats.totalKills += matchResult.kda.kills;
  stats.totalDeaths += matchResult.kda.deaths;
  stats.totalAssists += matchResult.kda.assists;
  
  const totalGames = stats.totalMatches;
  const avgKills = stats.totalKills / totalGames;
  const avgDeaths = stats.totalDeaths / totalGames;
  const avgAssists = stats.totalAssists / totalGames;
  stats.averageKDA = avgDeaths === 0 ? avgKills + avgAssists : (avgKills + avgAssists) / avgDeaths;
  
  // 更新常用英雄
  if (!stats.favoriteHeroes.includes(matchResult.heroId)) {
    stats.favoriteHeroes.push(matchResult.heroId);
  }
  
  // 记录比赛
  player.matchHistory.push({
    matchId: `match_${Date.now()}`,
    date: new Date(),
    result: matchResult.isWin ? 'win' : 'loss',
    heroId: matchResult.heroId,
    kda: matchResult.kda,
    score: 0,  // 由外部计算
    medals: matchResult.isMVP ? ['mvp'] : matchResult.isGold ? ['gold'] : matchResult.isSilver ? ['silver'] : undefined
  });
}

/**
 * 计算选手评分（1-16 分）
 */
export function calculatePlayerScore(_player: Player, matchStats: {
  kda: number;
  damageShare: number;
  goldShare: number;
  visionScore: number;
  csPerMin: number;
}): number {
  // 基础分 6 分
  let score = 6;
  
  // KDA 加成（最高 4 分）
  score += Math.min(4, matchStats.kda * 0.5);
  
  // 伤害占比（最高 2 分）
  score += Math.min(2, matchStats.damageShare * 2);
  
  // 经济占比（最高 2 分）
  score += Math.min(2, matchStats.goldShare * 2);
  
  // 视野得分（最高 1 分）
  score += Math.min(1, matchStats.visionScore / 10);
  
  // 补刀（最高 1 分）
  score += Math.min(1, matchStats.csPerMin / 10);
  
  return Math.min(16, Math.max(1, Math.round(score * 10) / 10));
}

/**
 * 判断金银牌
 */
export function calculateMedals(score: number, teamScores: number[]): { gold: boolean; silver: boolean } {
  // 排序分数
  const sortedScores = [...teamScores].sort((a, b) => b - a);
  const rank = sortedScores.indexOf(score);
  const totalPlayers = teamScores.length;
  
  // 前 25% 金牌，前 50% 银牌
  return {
    gold: rank < totalPlayers * 0.25,
    silver: rank < totalPlayers * 0.5
  };
}

/**
 * 更新段位
 */
export function updatePlayerRank(player: Player, isWin: boolean): void {
  if (!player.rank) {
    player.rank = {
      tier: 3,  // 默认黄金
      stars: 0,
      rankName: '荣耀黄金 IV'
    };
  }
  
  const rankNames = [
    '倔强青铜', '秩序白银', '荣耀黄金', '尊贵铂金', 
    '永恒钻石', '至尊星耀', '最强王者', '传奇王者'
  ];
  
  if (isWin) {
    player.rank.stars += 1;
    
    // 满星升段
    if (player.rank.stars >= 4) {
      player.rank.tier = Math.min(7, player.rank.tier + 1);
      player.rank.stars = 0;
    }
  } else {
    player.rank.stars -= 1;
    
    // 零星降段（王者以上不掉段）
    if (player.rank.stars < 0 && player.rank.tier < 6) {
      player.rank.tier = Math.max(0, player.rank.tier - 1);
      player.rank.stars = 3;
    }
  }
  
  // 更新段位名称
  const roman = ['IV', 'III', 'II', 'I'];
  player.rank.rankName = `${rankNames[player.rank.tier]} ${roman[player.rank.stars]}`;
}

/**
 * 获取选手市场价值
 */
export function getPlayerMarketValue(player: Player): number {
  const avgStats = getAverageStats(player);
  const ageFactor = player.age <= 22 ? 1.2 : player.age <= 26 ? 1.0 : 0.8;
  const potentialFactor = player.potential / 100;
  const experienceFactor = 1 + (player.careerStats.totalMatches / 100);
  
  // 基础价值 = 平均属性 * 年龄因子 * 潜力因子 * 经验因子
  const baseValue = avgStats * ageFactor * potentialFactor * experienceFactor;
  
  // 荣誉加成
  const honorBonus = player.careerStats.mvpCount * 5 + 
                     player.careerStats.goldMedals * 3 + 
                     player.careerStats.silverMedals;
  
  return Math.round(baseValue + honorBonus);
}

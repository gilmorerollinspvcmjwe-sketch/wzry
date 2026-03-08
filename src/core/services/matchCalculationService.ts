// 比赛计算服务 - 用于BP和比赛结果计算

import type { Player } from '@/core/models/Player';
import type { Hero } from '@/core/models/Hero';
import type { HeroRole } from '@/types';
import { calculateTacticalBonus, calculateBPBonusForClub } from '@/core/services/tacticsService';

export interface PlayerHeroMatchResult {
  heroId: string;
  heroName: string;
  role: HeroRole;
  matchPercentage: number;
  reasons: string[];
}

export interface MatchResultFactors {
  playerPower: number;
  heroFit: number;
  bpAdvantage: number;
  personalityBonus: number;
  talentBonus: number;
  staminaFactor: number;
  tacticalBonus: number;
  randomFactor: number;
  totalScore: number;
}

export class MatchCalculationService {
  // 计算选手与英雄的匹配度
  static calculatePlayerHeroMatch(player: Player, hero: Hero): PlayerHeroMatchResult {
    const reasons: string[] = [];
    let matchScore = 50; // 基础分数

    // 1. 定位匹配 (30%)
    if (player.heroPreference.preferredRoles.includes(hero.role)) {
      matchScore += 30;
      reasons.push(`擅长定位：${hero.role}`);
    }

    // 2. 标签偏好匹配 (25%)
    const matchingTags = hero.tags.filter(tag => 
      player.heroPreference.preferredTags.includes(tag)
    );
    if (matchingTags.length > 0) {
      const tagScore = Math.min(25, matchingTags.length * 10);
      matchScore += tagScore;
      reasons.push(`偏好标签：${matchingTags.join('、')}`);
    }

    // 3. 常用英雄 (20%)
    if (player.heroPreference.favoriteHeroes.includes(hero.id)) {
      matchScore += 20;
      reasons.push('常用英雄');
    } else if ((player as any).isGoodAtHero?.(hero.id)) {
      matchScore += 15;
      reasons.push('历史表现优秀');
    }

    // 4. 英雄强度 (15%)
    const heroStrength = hero.getVersionStrength();
    matchScore += (heroStrength - 1) * 100;
    if (hero.tier <= 1) {
      reasons.push(`版本强势英雄 (T${hero.tier})`);
    }

    // 5. 状态因素 (10%)
    if (player.condition.stamina >= 80) {
      matchScore += 10;
      reasons.push('体力充沛');
    } else if (player.condition.stamina < 30) {
      matchScore -= 15;
      reasons.push('体力不足');
    }

    if (player.condition.morale >= 80) {
      matchScore += 5;
      reasons.push('士气高涨');
    }

    // 限制分数范围 0-100
    matchScore = Math.max(0, Math.min(100, matchScore));

    return {
      heroId: hero.id,
      heroName: hero.name,
      role: hero.role,
      matchPercentage: Math.round(matchScore),
      reasons: reasons.length > 0 ? reasons : ['基础匹配']
    };
  }

  // 获取选手的最佳英雄列表
  static getBestHeroesForPlayer(player: Player, heroes: Hero[], limit: number = 5): PlayerHeroMatchResult[] {
    const matches = heroes.map(hero => this.calculatePlayerHeroMatch(player, hero));
    return matches
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, limit);
  }

  // 计算比赛结果因素
  static calculateMatchResult(
    player: Player,
    hero: Hero,
    _opponentPower: number = 70,
    clubId?: string
  ): MatchResultFactors {
    // 1. 选手实力
    const playerPower = (player as any).getTotalPower?.() || player.getTotalPower();

    // 2. 英雄适配度
    const heroMatch = this.calculatePlayerHeroMatch(player, hero);
    const heroFit = heroMatch.matchPercentage;

    // 3. BP优势（简化计算）
    let bpAdvantage = 50 + Math.random() * 20 - 10;
    
    // 4. 战术加成
    let tacticalBonusValue = 0;
    if (clubId) {
      const bpBonus = calculateBPBonusForClub(clubId);
      bpAdvantage += bpBonus * 100;
      
      const tacticalBonuses = calculateTacticalBonus(clubId);
      tacticalBonusValue = Object.values(tacticalBonuses).reduce((sum, v) => sum + v, 0);
    }

    // 5. 性格加成
    let personalityBonus = 0;
    if (player.personality.playStyle === 'aggressive') {
      personalityBonus += 5;
    } else if (player.personality.playStyle === 'stable') {
      personalityBonus += 3;
    }

    if (player.personality.pressureResistance === 'clutch') {
      personalityBonus += 8;
    } else if (player.personality.pressureResistance === 'fragile') {
      personalityBonus -= 5;
    }

    // 6. 天赋加成
    let talentBonus = 0;
    for (const talent of player.talents) {
      if (talent.effect.type === 'potential_bonus') {
        talentBonus += talent.effect.value;
      } else if (talent.effect.type === 'clutch_performance') {
        talentBonus += talent.effect.value;
      }
    }

    // 7. 体力因素
    const staminaFactor = player.condition.stamina / 100;

    // 8. 随机因素
    const randomFactor = Math.random() * 20;

    // 计算总分
    const totalScore = (
      playerPower * 0.3 +
      heroFit * 0.25 +
      bpAdvantage * 0.15 +
      personalityBonus * 0.1 +
      talentBonus * 0.1 +
      staminaFactor * 10 +
      tacticalBonusValue * 0.5 +
      randomFactor * 0.1
    );

    return {
      playerPower,
      heroFit,
      bpAdvantage,
      personalityBonus,
      talentBonus,
      staminaFactor,
      tacticalBonus: tacticalBonusValue,
      randomFactor,
      totalScore: Math.round(totalScore * 10) / 10
    };
  }

  // 模拟比赛并返回结果
  static simulateMatch(
    homePlayer: Player,
    awayPlayer: Player,
    homeHero: Hero,
    awayHero: Hero,
    homeClubId?: string,
    awayClubId?: string
  ): { homeWin: boolean; homeScore: number; awayScore: number } {
    const homeFactors = this.calculateMatchResult(homePlayer, homeHero, 70, homeClubId);
    const awayFactors = this.calculateMatchResult(awayPlayer, awayHero, 70, awayClubId);

    const homeScore = homeFactors.totalScore + Math.random() * 20;
    const awayScore = awayFactors.totalScore + Math.random() * 20;

    return {
      homeWin: homeScore > awayScore,
      homeScore: Math.round(homeScore),
      awayScore: Math.round(awayScore)
    };
  }

  // 获取位置推荐英雄
  static getRecommendedHeroesByPosition(
    player: Player,
    heroes: Hero[],
    position: HeroRole,
    limit: number = 3
  ): PlayerHeroMatchResult[] {
    const positionHeroes = heroes.filter(h => h.role === position);
    return this.getBestHeroesForPlayer(player, positionHeroes, limit);
  }
}

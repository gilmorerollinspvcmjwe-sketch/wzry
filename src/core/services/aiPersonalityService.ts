import type { Player } from '@/core/models/Player';
import type { Club } from '@/core/models/Club';
import type {
  AIPersonalityProfile,
  PersonalityType,
  AITransferDecisionResult,
  AITacticalDecisionResult,
  AIStorylineUpdate,
  StorylineEvent,
  FormationType,
  TacticalStyle,
} from '@/types/aiPersonality';
import {
  PERSONALITY_PRESETS,
  getPersonalityPreset,
  generateRandomPersonalityType,
} from '@/types/aiPersonality';
import { useAIPersonalityStore } from '@/stores/aiPersonality';
import { useClubStore } from '@/stores/club';
import { useGameStore } from '@/stores/game';
import { getDifficultyCoefficients } from './difficultyConfig';

export class AIPersonalityService {
  static generateAIPersonality(clubId: string, type?: PersonalityType): AIPersonalityProfile {
    const personalityType = type || generateRandomPersonalityType();
    const preset = getPersonalityPreset(personalityType);
    const now = new Date();

    const profile: AIPersonalityProfile = {
      ...preset,
      clubId,
      createdAt: now,
      updatedAt: now,
    };

    const store = useAIPersonalityStore();
    store.setProfile(profile);

    return profile;
  }

  static getProfile(clubId: string): AIPersonalityProfile | undefined {
    const store = useAIPersonalityStore();
    return store.getProfile(clubId);
  }

  static getTransferDecision(clubId: string, player: Player): AITransferDecisionResult {
    const profile = this.getProfile(clubId);
    if (!profile) {
      return {
        shouldBid: false,
        reason: 'No AI personality profile found',
        urgency: 'low',
      };
    }

    const clubStore = useClubStore();
    const club = clubStore.getClub(clubId);
    if (!club) {
      return {
        shouldBid: false,
        reason: 'Club not found',
        urgency: 'low',
      };
    }

    const gameStore = useGameStore();
    const difficulty = gameStore.settings?.difficulty || 'normal';
    const coeffs = getDifficultyCoefficients(difficulty);

    const { transferPreference, behaviors } = profile;
    const playerValue = this.evaluatePlayerValue(player, profile);
    const playerPrice = player.contract.buyoutClause;

    const positionNeed = this.evaluatePositionNeed(club, player.position, profile);

    if (positionNeed < 30) {
      return {
        shouldBid: false,
        reason: 'Position not needed',
        urgency: 'low',
      };
    }

    const maxBudget = club.funds * transferPreference.budgetRatio * coeffs.budgetMultiplier;
    if (playerPrice > maxBudget) {
      return {
        shouldBid: false,
        reason: `Player price ${playerPrice} exceeds budget ${maxBudget}`,
        urgency: 'low',
      };
    }

    if (player.contract.salary > transferPreference.maxSalary) {
      return {
        shouldBid: false,
        reason: `Player salary ${player.contract.salary} exceeds max ${transferPreference.maxSalary}`,
        urgency: 'low',
      };
    }

    const ageMatch = transferPreference.preferYoung
      ? player.age <= 22
      : transferPreference.preferStar
        ? player.age >= 20 && player.age <= 26
        : true;

    if (!ageMatch) {
      return {
        shouldBid: false,
        reason: 'Player age does not match preference',
        urgency: 'low',
      };
    }

    const valueRatio = playerValue / playerPrice;
    const shouldBid = valueRatio > 0.7 && Math.random() < (behaviors.riskTolerance / 100) * coeffs.decisionAccuracy;

    let urgency: 'low' | 'medium' | 'high' = 'low';
    if (positionNeed > 70) {
      urgency = 'high';
    } else if (positionNeed > 50) {
      urgency = 'medium';
    }

    const bidMultiplier = 1 + (behaviors.riskTolerance / 200);
    const bidAmount = Math.round(playerPrice * bidMultiplier * coeffs.budgetMultiplier);

    return {
      shouldBid,
      playerId: player.id,
      bidAmount,
      reason: shouldBid
        ? `Value ratio ${valueRatio.toFixed(2)}, position need ${positionNeed}`
        : 'Risk assessment failed',
      urgency,
    };
  }

  static getTacticalDecision(clubId: string, opponentClubId?: string): AITacticalDecisionResult {
    const profile = this.getProfile(clubId);
    if (!profile) {
      return {
        formation: 'standard',
        style: 'balanced',
        banList: [],
        pickPriority: 'power',
        adjustments: [],
      };
    }

    const clubStore = useClubStore();
    const club = clubStore.getClub(clubId);
    const opponent = opponentClubId ? clubStore.getClub(opponentClubId) : null;

    const { tacticalPreference, behaviors } = profile;

    let formation: FormationType = tacticalPreference.favoriteFormation;
    let style: TacticalStyle = tacticalPreference.style;
    const adjustments: string[] = [];

    if (opponent && club) {
      const myPower = club.getTotalPower();
      const oppPower = opponent.getTotalPower();

      const gameStore = useGameStore();
      const difficulty = gameStore.settings?.difficulty || 'normal';
      const coeffs = getDifficultyCoefficients(difficulty);

      const adjustedMyPower = myPower * coeffs.tacticsVariety;

      if (adjustedMyPower > oppPower * 1.2) {
        style = 'early_aggressive';
        adjustments.push('Overwhelming power advantage - aggressive start');
      } else if (adjustedMyPower < oppPower * 0.8) {
        style = 'late_scaling';
        adjustments.push('Underdog - play for late game');
      }

      if (behaviors.riskTolerance > 70 && adjustedMyPower > oppPower) {
        formation = 'aggressive';
        adjustments.push('High risk tolerance - aggressive formation');
      } else if (behaviors.riskTolerance < 30) {
        formation = 'defensive';
        adjustments.push('Low risk tolerance - defensive formation');
      }
    }

    const banList = this.generateBanList(profile, opponent);

    return {
      formation,
      style,
      banList,
      pickPriority: tacticalPreference.pickPriority,
      adjustments,
    };
  }

  static updateStoryline(clubId: string, eventType: string, eventData?: Record<string, unknown>): AIStorylineUpdate {
    const profile = this.getProfile(clubId);
    if (!profile) {
      return {
        newChapter: 1,
        newEvents: [],
        storylineComplete: false,
      };
    }

    const store = useAIPersonalityStore();
    const newEvents: StorylineEvent[] = [];

    const event: StorylineEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: eventType as StorylineEvent['type'],
      description: this.generateEventDescription(eventType, eventData),
      date: new Date(),
      impact: this.calculateEventImpact(eventType, profile),
    };

    newEvents.push(event);

    const chapterProgress = this.calculateChapterProgress(profile, event);
    let newChapter = profile.storyline.currentChapter;
    let storylineComplete = false;

    if (chapterProgress >= 100) {
      newChapter++;
      if (newChapter > 5) {
        storylineComplete = true;
        newChapter = 5;
      }
    }

    store.updateStoryline(clubId, {
      currentChapter: newChapter,
      events: [...profile.storyline.events, ...newEvents],
    });

    return {
      newChapter,
      newEvents,
      storylineComplete,
    };
  }

  private static evaluatePlayerValue(player: Player, profile: AIPersonalityProfile): number {
    const baseValue = player.getTotalPower();
    const { transferPreference, behaviors } = profile;

    let value = baseValue;

    if (transferPreference.preferYoung && player.age <= 20) {
      value += player.potential * 0.5;
    }

    if (transferPreference.preferStar && player.getTotalPower() > 80) {
      value *= 1.2;
    }

    const ambitionFactor = 1 + (behaviors.ambition - 50) / 100;
    value *= ambitionFactor;

    const randomFactor = 0.9 + Math.random() * 0.2;
    value *= randomFactor;

    return Math.round(value);
  }

  private static evaluatePositionNeed(club: Club, position: string, profile: AIPersonalityProfile): number {
    const roster = club.roster;
    const playerAtPosition = roster.find((p: Player) => p.position === position);

    let score = 0;

    if (!playerAtPosition) {
      score = 100;
    } else {
      const avgPower = roster.reduce((sum: number, p: Player) => sum + p.getTotalPower(), 0) / roster.length;
      const playerPower = playerAtPosition.getTotalPower();

      if (playerPower < avgPower * 0.8) {
        score = 70;
      } else if (playerAtPosition.age > 28) {
        score = 50;
      } else if (playerAtPosition.condition?.morale < 50) {
        score = 40;
      }
    }

    if (profile.behaviors.ambition > 70) {
      score *= 1.2;
    }

    return Math.min(100, Math.round(score));
  }

  private static generateBanList(profile: AIPersonalityProfile, opponent?: Club | null): string[] {
    const banList: string[] = [];
    const { tacticalPreference } = profile;

    switch (tacticalPreference.banPriority) {
      case 'meta':
        banList.push('meta_hero_1', 'meta_hero_2', 'meta_hero_3');
        break;
      case 'counter':
        if (opponent) {
          banList.push('counter_hero_1', 'counter_hero_2');
        }
        break;
      case 'comfort':
        banList.push('uncomfortable_hero_1', 'uncomfortable_hero_2');
        break;
      case 'flexible':
        banList.push('flexible_ban_1', 'flexible_ban_2');
        break;
    }

    return banList.slice(0, 3);
  }

  private static generateEventDescription(eventType: string, eventData?: Record<string, unknown>): string {
    const descriptions: Record<string, string> = {
      transfer: 'Completed a significant transfer',
      match: 'Important match result',
      achievement: 'Reached a milestone',
      crisis: 'Facing a challenging situation',
      milestone: 'Achieved a club milestone',
    };

    let description = descriptions[eventType] || 'Unknown event';

    if (eventData) {
      if (eventData.playerName) {
        description += ` - ${eventData.playerName}`;
      }
      if (eventData.result) {
        description += ` - Result: ${eventData.result}`;
      }
    }

    return description;
  }

  private static calculateEventImpact(eventType: string, profile: AIPersonalityProfile): Record<string, number> {
    const baseImpact: Record<string, number> = {
      morale: 0,
      reputation: 0,
      funds: 0,
    };

    switch (eventType) {
      case 'transfer':
        baseImpact.morale = profile.personality === 'big-spender' ? 10 : 5;
        break;
      case 'match':
        baseImpact.reputation = 5;
        baseImpact.morale = 10;
        break;
      case 'achievement':
        baseImpact.reputation = 15;
        baseImpact.morale = 15;
        break;
      case 'crisis':
        baseImpact.morale = -10;
        baseImpact.funds = -50;
        break;
      case 'milestone':
        baseImpact.reputation = 10;
        baseImpact.morale = 5;
        break;
    }

    return baseImpact;
  }

  private static calculateChapterProgress(profile: AIPersonalityProfile, event: StorylineEvent): number {
    const eventWeight: Record<string, number> = {
      transfer: 10,
      match: 15,
      achievement: 25,
      crisis: -10,
      milestone: 30,
    };

    const currentProgress = profile.storyline.events.length * 15;
    const eventValue = eventWeight[event.type] || 5;

    return currentProgress + eventValue;
  }

  static adaptPersonality(clubId: string, context: {
    recentResults?: ('win' | 'loss')[];
    financialStatus?: 'good' | 'stable' | 'critical';
    rosterStrength?: 'strong' | 'average' | 'weak';
  }): void {
    const profile = this.getProfile(clubId);
    if (!profile) return;

    const store = useAIPersonalityStore();
    const updates: Partial<AIPersonalityProfile> = {};

    if (context.recentResults) {
      const wins = context.recentResults.filter(r => r === 'win').length;
      const winRate = wins / context.recentResults.length;

      if (winRate < 0.3) {
        updates.behaviors = {
          ...profile.behaviors,
          patience: Math.max(10, profile.behaviors.patience - 10),
          riskTolerance: Math.min(100, profile.behaviors.riskTolerance + 10),
        };
      } else if (winRate > 0.7) {
        updates.behaviors = {
          ...profile.behaviors,
          ambition: Math.min(100, profile.behaviors.ambition + 5),
        };
      }
    }

    if (context.financialStatus === 'critical') {
      updates.transferPreference = {
        ...profile.transferPreference,
        budgetRatio: Math.max(0.1, profile.transferPreference.budgetRatio - 0.1),
        maxSalary: Math.max(30, profile.transferPreference.maxSalary - 20),
      };
    }

    if (context.rosterStrength === 'weak') {
      updates.coachingStyle = {
        ...profile.coachingStyle,
        trainingIntensity: 'high',
        developmentFocus: 'mechanics',
      };
    }

    if (Object.keys(updates).length > 0) {
      store.updateProfile(clubId, updates);
    }
  }

  static getPersonalityDescription(type: PersonalityType): string {
    const descriptions: Record<PersonalityType, string> = {
      'big-spender': '大手笔俱乐部：不惜重金引进明星选手，追求即时战绩',
      'youth-factory': '青训工厂：专注于培养年轻天才，耐心建设长期王朝',
      'traditional': '传统豪门：稳健经营，平衡发展，注重团队配合',
      'rising-star': '新锐力量：充满野心的新兴俱乐部，敢于冒险',
      'survivor': '生存者：资源有限，精打细算，在逆境中求生存',
    };

    return descriptions[type] || '未知类型';
  }
}

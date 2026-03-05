// AI俱乐部系统服务

import type { AIProfile, AITransferDecision, AITrainingDecision, AITactics } from '@/types/ai';
import { AI_TEMPLATES } from '@/types/ai';
import type { Club } from '@/core/models/Club';
import type { Player } from '@/core/models/Player';
import type { Position, PlayerStats } from '@/types';

export class AIService {
  private static aiProfiles: Map<string, AIProfile> = new Map();

  // 初始化AI俱乐部
  static initAIClub(clubId: string, templateName: string = 'balanced'): AIProfile {
    const template = AI_TEMPLATES[templateName] || AI_TEMPLATES.balanced;
    
    if (!template) {
      throw new Error('AI template not found');
    }
    
    const profile: AIProfile = {
      clubId,
      personality: { 
        aggressiveness: template.aggressiveness,
        patience: template.patience,
        riskTolerance: template.riskTolerance,
        loyalty: template.loyalty,
      },
      strategy: {
        preferredPlayStyle: 'balanced',
        transferFocus: 'balanced',
        trainingFocus: 'balanced',
      },
    };

    this.aiProfiles.set(clubId, profile);
    return profile;
  }

  // 获取AI配置
  static getAIProfile(clubId: string): AIProfile | undefined {
    return this.aiProfiles.get(clubId);
  }

  // 评估位置需求
  static evaluatePositionNeed(club: Club, position: Position, ai: AIProfile): number {
    const roster = club.roster;
    const player = roster.find(p => p.position === position);
    
    let score = 0;
    
    if (!player) {
      score = 100; // 空缺位置急需
    } else {
      const avgPower = roster.reduce((sum, p) => sum + p.getTotalPower(), 0) / roster.length;
      const playerPower = player.getTotalPower();
      
      if (playerPower < avgPower * 0.8) {
        score = 60; // 明显短板
      } else if (player.age > 28) {
        score = 40; // 老龄化
      } else if (player.condition.morale < 50) {
        score = 30; // 士气低落可能离队
      }
    }

    // 根据AI性格调整
    if (ai.personality.aggressiveness > 70) {
      score *= 1.2;
    }
    
    return score;
  }

  // 评估选手价值
  static evaluatePlayerValue(player: Player, ai: AIProfile): number {
    const baseValue = player.getTotalPower();
    const potentialBonus = (100 - player.age) * player.potential * 0.1;
    
    let value = baseValue;
    
    // 根据AI策略调整潜力权重
    if (ai.strategy.transferFocus === 'young_potential') {
      value += potentialBonus * 1.5;
    } else if (ai.strategy.transferFocus === 'proven_veteran') {
      value += potentialBonus * 0.5;
    } else {
      value += potentialBonus;
    }

    // 加入随机因素（模拟球探判断误差）
    const randomFactor = 0.9 + Math.random() * 0.2;
    value *= randomFactor;

    return value;
  }

  // 转会决策
  static makeTransferDecision(club: Club, availablePlayers: Player[]): AITransferDecision {
    const ai = this.getAIProfile(club.id);
    if (!ai) return { type: 'none', reason: 'No AI profile' };

    // 评估所有位置需求
    const positions: Position[] = ['top', 'jungle', 'mid', 'adc', 'support'];
    const needs = positions.map(pos => ({
      position: pos,
      score: this.evaluatePositionNeed(club, pos, ai),
    })).filter(n => n.score > 30);

    if (needs.length === 0) {
      return { type: 'none', reason: 'No position needs' };
    }

    // 寻找合适的目标
    const targets = availablePlayers.filter(p => 
      needs.some(n => n.position === p.position)
    );

    if (targets.length === 0) {
      return { type: 'none', reason: 'No available targets' };
    }

    // 评估每个目标
    const evaluated = targets.map(t => ({
      player: t,
      value: this.evaluatePlayerValue(t, ai),
      price: t.contract.buyoutClause,
      ratio: 0,
    }));

    // 计算性价比
    evaluated.forEach(e => {
      e.ratio = e.value / (e.price || 1);
    });

    // 选择性价比最高的
    const maxBudget = club.funds * (ai.personality.riskTolerance / 100);
    const best = evaluated
      .filter(e => e.price <= maxBudget)
      .sort((a, b) => b.ratio - a.ratio)[0];

    if (best && Math.random() < 0.7) {
      return {
        type: 'bid',
        playerId: best.player.id,
        price: best.price,
        reason: `Best value ratio: ${best.ratio.toFixed(2)}`,
      };
    }

    return { type: 'none', reason: 'No suitable target found' };
  }

  // 训练决策
  static makeTrainingDecision(player: Player, ai: AIProfile): AITrainingDecision {
    // 体力不足时休息
    if (player.condition.stamina < 30) {
      return {
        type: 'rest',
        playerId: player.id,
        reason: 'Low stamina',
      };
    }

    // 根据年龄和策略选择训练项目
    let stat: keyof PlayerStats;
    let intensity: 'low' | 'medium' | 'high';

    if (ai.strategy.trainingFocus === 'balanced') {
      // 年轻选手练操作，老将练意识
      if (player.age < 22) {
        stat = 'mechanics';
        intensity = 'high';
      } else if (player.age > 26) {
        stat = 'awareness';
        intensity = 'medium';
      } else {
        stat = 'teamwork';
        intensity = 'medium';
      }
    } else {
      stat = ai.strategy.trainingFocus as keyof PlayerStats;
      intensity = player.age < 25 ? 'high' : 'medium';
    }

    return {
      type: 'train',
      playerId: player.id,
      stat,
      intensity,
      reason: `Focus on ${stat} for ${player.age} year old player`,
    };
  }

  // 比赛战术决策
  static selectTactics(myClub: Club, opponent: Club, ai: AIProfile): AITactics {
    const myPower = myClub.getTotalPower();
    const oppPower = opponent.getTotalPower();

    let style: 'aggressive' | 'defensive' | 'balanced';
    let focus: 'early_game' | 'mid_game' | 'late_game' | 'balanced';

    // 实力对比决定基调
    if (myPower > oppPower * 1.2) {
      style = 'aggressive';
      focus = 'early_game';
    } else if (myPower < oppPower * 0.8) {
      style = 'defensive';
      focus = 'late_game';
    } else {
      // 实力相当，根据AI性格
      style = ai.personality.aggressiveness > 60 ? 'aggressive' : 'balanced';
      focus = 'mid_game';
    }

    return {
      style,
      focus,
      formation: 'standard',
    };
  }

  // 模拟AI一周行为
  static simulateAIWeek(club: Club, availablePlayers: Player[]): void {
    const ai = this.getAIProfile(club.id);
    if (!ai) return;

    // 1. 训练决策（100%执行）
    club.roster.forEach(player => {
      const decision = this.makeTrainingDecision(player, ai);
      if (decision.type === 'train' && decision.stat) {
        // 执行训练
        player.train(decision.stat, decision.intensity === 'high' ? 2 : 1);
      } else if (decision.type === 'rest') {
        player.recover();
      }
    });

    // 2. 转会决策（根据性格频率不同）
    const transferChance = ai.personality.aggressiveness / 100;
    if (Math.random() < transferChance) {
      const decision = this.makeTransferDecision(club, availablePlayers);
      if (decision.type === 'bid' && decision.playerId) {
        // 这里需要调用转会逻辑
        console.log(`AI ${club.name} wants to bid for player ${decision.playerId}`);
      }
    }
  }

  // 生成随机AI性格
  static generateRandomAI(): AIProfile {
    const templates = Object.keys(AI_TEMPLATES);
    const randomTemplateKey = templates[Math.floor(Math.random() * templates.length)];
    
    const template = randomTemplateKey ? AI_TEMPLATES[randomTemplateKey] : AI_TEMPLATES.balanced;
    
    if (!template) {
      throw new Error('AI template not found');
    }
    
    // 添加一些随机变化
    return {
      clubId: '',
      personality: {
        aggressiveness: Math.max(0, Math.min(100, template.aggressiveness + (Math.random() - 0.5) * 20)),
        patience: Math.max(0, Math.min(100, template.patience + (Math.random() - 0.5) * 20)),
        riskTolerance: Math.max(0, Math.min(100, template.riskTolerance + (Math.random() - 0.5) * 20)),
        loyalty: Math.max(0, Math.min(100, template.loyalty + (Math.random() - 0.5) * 20)),
      },
      strategy: {
        preferredPlayStyle: ['early_aggressive', 'late_scaling', 'balanced'][Math.floor(Math.random() * 3)] as any,
        transferFocus: ['young_potential', 'proven_veteran', 'balanced'][Math.floor(Math.random() * 3)] as any,
        trainingFocus: ['mechanics', 'awareness', 'teamwork', 'balanced'][Math.floor(Math.random() * 4)] as any,
      },
    };
  }
}

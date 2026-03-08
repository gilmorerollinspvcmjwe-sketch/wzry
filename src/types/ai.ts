// AI系统类型定义

import type { PlayerStats } from './index';

// AI性格特征
export interface AIPersonality {
  aggressiveness: number;    // 侵略性 0-100（影响转会竞价、比赛风格）
  patience: number;          // 耐心度 0-100（影响选手培养周期）
  riskTolerance: number;     // 风险承受 0-100（影响高价签约、战术选择）
  loyalty: number;           // 忠诚度 0-100（影响选手留队倾向）
}

// AI策略倾向
export interface AIStrategy {
  preferredPlayStyle: 'early_aggressive' | 'late_scaling' | 'balanced';
  transferFocus: 'young_potential' | 'proven_veteran' | 'balanced';
  trainingFocus: keyof PlayerStats | 'balanced';
}

// AI完整配置
export interface AIProfile {
  clubId: string;
  template?: string;  // AI模板名称
  personality: AIPersonality;
  strategy: AIStrategy;
}

// AI性格模板
export const AI_TEMPLATES: Record<string, AIPersonality> = {
  aggressive: { aggressiveness: 80, patience: 30, riskTolerance: 75, loyalty: 40 },
  balanced: { aggressiveness: 50, patience: 50, riskTolerance: 50, loyalty: 60 },
  conservative: { aggressiveness: 30, patience: 70, riskTolerance: 30, loyalty: 80 },
  gambler: { aggressiveness: 70, patience: 20, riskTolerance: 90, loyalty: 30 },
  developer: { aggressiveness: 40, patience: 90, riskTolerance: 40, loyalty: 70 },
};

// 获取AI模板
export function getAITemplate(name: string): AIPersonality {
  const template = AI_TEMPLATES[name] || AI_TEMPLATES.balanced;
  if (!template) {
    throw new Error(`AI template not found: ${name}`);
  }
  return template;
}

// AI转会决策
export interface AITransferDecision {
  type: 'bid' | 'sell' | 'none';
  playerId?: string;
  price?: number;
  reason: string;
}

// AI训练决策
export interface AITrainingDecision {
  type: 'train' | 'rest';
  playerId: string;
  stat?: keyof PlayerStats;
  intensity?: 'low' | 'medium' | 'high';
  reason: string;
}

// AI比赛战术
export interface AITactics {
  style: 'aggressive' | 'defensive' | 'balanced';
  focus: 'early_game' | 'mid_game' | 'late_game' | 'balanced';
  formation: string;
}

// AI每周行为记录
export interface AIWeeklyAction {
  week: number;
  clubId: string;
  transfers: AITransferDecision[];
  trainings: AITrainingDecision[];
  rosterChanges: string[];
}

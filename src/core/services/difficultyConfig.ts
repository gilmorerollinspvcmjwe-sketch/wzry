import type { Difficulty } from '@/types';

/**
 * 难度系数配置
 */
export interface DifficultyCoefficients {
  budgetMultiplier: number;      // 预算系数
  decisionAccuracy: number;       // 决策准确率
  trainingEffectiveness: number;  // 训练效果
  bidProbability: number;         // 竞价概率
  tacticsVariety: number;         // 战术多样性
}

/**
 * 难度配置表
 */
export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyCoefficients> = {
  easy: {
    budgetMultiplier: 0.7,        // 预算减少 30%
    decisionAccuracy: 0.7,        // 决策准确率 70%
    trainingEffectiveness: 0.8,   // 训练效果 80%
    bidProbability: 0.5,          // 竞价概率 50%
    tacticsVariety: 0.6,          // 战术多样性 60%
  },
  normal: {
    budgetMultiplier: 1.0,        // 预算正常
    decisionAccuracy: 1.0,        // 决策准确率 100%
    trainingEffectiveness: 1.0,   // 训练效果 100%
    bidProbability: 1.0,          // 竞价概率 100%
    tacticsVariety: 1.0,          // 战术多样性 100%
  },
  hard: {
    budgetMultiplier: 1.3,        // 预算增加 30%
    decisionAccuracy: 1.2,        // 决策准确率 120%
    trainingEffectiveness: 1.2,   // 训练效果 120%
    bidProbability: 1.5,          // 竞价概率 150%
    tacticsVariety: 1.3,          // 战术多样性 130%
  },
};

/**
 * 获取难度系数
 */
export function getDifficultyCoefficients(difficulty: Difficulty): DifficultyCoefficients {
  return DIFFICULTY_CONFIGS[difficulty] || DIFFICULTY_CONFIGS.normal;
}

/**
 * 应用难度系数到数值
 */
export function applyDifficultyCoefficient<T extends number>(
  value: T,
  difficulty: Difficulty,
  coefficientType: keyof DifficultyCoefficients
): T {
  const config = getDifficultyCoefficients(difficulty);
  const coefficient = config[coefficientType];
  return (value * coefficient) as T;
}

// 导出辅助函数
export const DifficultyHelper = {
  getBudgetMultiplier: (difficulty: Difficulty) => getDifficultyCoefficients(difficulty).budgetMultiplier,
  getDecisionAccuracy: (difficulty: Difficulty) => getDifficultyCoefficients(difficulty).decisionAccuracy,
  getTrainingEffectiveness: (difficulty: Difficulty) => getDifficultyCoefficients(difficulty).trainingEffectiveness,
  getBidProbability: (difficulty: Difficulty) => getDifficultyCoefficients(difficulty).bidProbability,
  getTacticsVariety: (difficulty: Difficulty) => getDifficultyCoefficients(difficulty).tacticsVariety,
};

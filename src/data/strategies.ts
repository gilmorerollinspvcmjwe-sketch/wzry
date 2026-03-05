import type { StrategyInfo } from '@/types';

// 战术定义
export const strategies: Record<string, StrategyInfo> = {
  balanced: {
    id: 'balanced',
    name: '均衡流',
    description: '攻守平衡，适应性强',
    offense: 1.0,
    defense: 1.0,
    earlyGame: 1.0,
    lateGame: 1.0,
  },
  offensive: {
    id: 'offensive',
    name: '进攻流',
    description: '前期主动出击，压制对手',
    offense: 1.15,
    defense: 0.9,
    earlyGame: 1.2,
    lateGame: 0.95,
  },
  defensive: {
    id: 'defensive',
    name: '防守流',
    description: '稳健防守，后期反击',
    offense: 0.9,
    defense: 1.15,
    earlyGame: 0.95,
    lateGame: 1.2,
  },
  jungle_core: {
    id: 'jungle_core',
    name: '野核',
    description: '围绕打野制定战术',
    offense: 1.05,
    defense: 1.05,
    earlyGame: 1.1,
    lateGame: 1.0,
  },
  adc_core: {
    id: 'adc_core',
    name: '射核',
    description: '围绕射手制定战术',
    offense: 1.1,
    defense: 1.0,
    earlyGame: 0.9,
    lateGame: 1.25,
  },
  mid_core: {
    id: 'mid_core',
    name: '中核',
    description: '围绕中单制定战术',
    offense: 1.1,
    defense: 1.0,
    earlyGame: 1.15,
    lateGame: 1.05,
  },
};

// 战术克制关系
export const strategyCounterMatrix: Record<string, Record<string, number>> = {
  balanced: {
    balanced: 1.0,
    offensive: 1.0,
    defensive: 1.0,
    jungle_core: 1.0,
    adc_core: 1.0,
    mid_core: 1.0,
  },
  offensive: {
    balanced: 1.05,    // 进攻克均衡
    offensive: 1.0,
    defensive: 0.9,    // 进攻被防守克制
    jungle_core: 1.05,
    adc_core: 1.0,
    mid_core: 1.1,     // 进攻克制中核（前期压制）
  },
  defensive: {
    balanced: 1.0,
    offensive: 1.1,    // 防守克进攻
    defensive: 1.0,
    jungle_core: 0.95,
    adc_core: 1.05,
    mid_core: 0.95,
  },
  jungle_core: {
    balanced: 1.0,
    offensive: 0.95,
    defensive: 1.05,
    jungle_core: 1.0,
    adc_core: 1.05,
    mid_core: 1.0,
  },
  adc_core: {
    balanced: 1.0,
    offensive: 1.0,
    defensive: 0.95,   // 射核被防守克制（前排保护）
    jungle_core: 0.95,
    adc_core: 1.0,
    mid_core: 1.1,     // 射核克制中核（远程优势）
  },
  mid_core: {
    balanced: 1.0,
    offensive: 0.9,    // 中核被进攻克制（前中期）
    defensive: 1.05,
    jungle_core: 1.0,
    adc_core: 0.9,     // 中核被射核克制
    mid_core: 1.0,
  },
};

// 获取战术信息
export function getStrategyById(id: string): StrategyInfo | undefined {
  return strategies[id];
}

// 获取所有战术
export function getAllStrategies(): StrategyInfo[] {
  return Object.values(strategies);
}

// 计算战术克制效果
export function calculateStrategyCounter(
  attackerStrategy: string,
  defenderStrategy: string
): number {
  const matrix = strategyCounterMatrix[attackerStrategy];
  if (matrix) {
    return matrix[defenderStrategy] || 1.0;
  }
  return 1.0;
}

// 战术效果计算
export function applyStrategyEffects(
  basePower: number,
  strategy: string,
  opponentStrategy: string,
  gameStage: 'early' | 'mid' | 'late' = 'mid'
): number {
  const strat = strategies[strategy];
  if (!strat) return basePower;
  
  // 基础战术加成
  let power = basePower;
  
  // 攻防系数
  if (gameStage === 'early') {
    power *= strat.earlyGame;
  } else if (gameStage === 'late') {
    power *= strat.lateGame;
  } else {
    // 中期
    const avg = (strat.earlyGame + strat.lateGame) / 2;
    power *= avg;
  }
  
  // 战术克制系数
  const counterEffect = calculateStrategyCounter(strategy, opponentStrategy);
  power *= counterEffect;
  
  return Math.round(power);
}

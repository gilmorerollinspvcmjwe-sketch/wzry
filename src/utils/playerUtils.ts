import type { PlayerStats, PlayerCondition, Position } from '@/types';

export interface PlayerLike {
  stats: PlayerStats;
  condition?: PlayerCondition;
  position: Position;
  positionMastery?: Record<Position, number>;
}

export function getPlayerAverageStats(player: PlayerLike): number {
  const values = Object.values(player.stats);
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

export function getPlayerTotalPower(player: PlayerLike): number {
  const avgStats = getPlayerAverageStats(player);
  const positionBonus = player.positionMastery 
    ? (player.positionMastery[player.position] || 0) * 0.3 
    : 0;
  const conditionFactor = player.condition 
    ? (100 - (player.condition.injury || 0)) / 100 
    : 1;
  const moraleFactor = player.condition 
    ? (player.condition.morale || 100) / 100 
    : 1;
  
  return Math.round((avgStats + positionBonus) * conditionFactor * moraleFactor);
}

export function getPlayerHeroStatsList(player: any): { heroId: string; games: number; winRate: number }[] {
  if (!player.heroStats) return [];
  return Object.entries(player.heroStats).map(([heroId, stats]: [string, any]) => ({
    heroId,
    games: stats.games || 0,
    winRate: stats.winRate || 0,
  }));
}

export function canPlayerRecover(player: PlayerLike): boolean {
  if (!player.condition) return false;
  return player.condition.stamina < 100 || player.condition.morale < 100;
}

export function recoverPlayer(player: PlayerLike, staminaAmount: number = 10, moraleAmount: number = 5): void {
  if (!player.condition) return;
  player.condition.stamina = Math.min(100, player.condition.stamina + staminaAmount);
  player.condition.morale = Math.min(100, player.condition.morale + moraleAmount);
}

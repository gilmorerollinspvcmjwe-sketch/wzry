/**
 * AI 经营风格类型
 */
export type ManagementStyle = 'big-spender' | 'youth-focused' | 'stable' | 'gambler' | 'low-profile';

/**
 * 获取经营风格的中文名称
 */
export function getManagementStyleName(style: ManagementStyle): string {
  const names: Record<ManagementStyle, string> = {
    'big-spender': '氪金型',
    'youth-focused': '青训型',
    'stable': '稳健型',
    'gambler': '赌徒型',
    'low-profile': '养老型',
  };
  return names[style] || '未知';
}

/**
 * 获取经营风格的图标
 */
export function getManagementStyleIcon(style: ManagementStyle): string {
  const icons: Record<ManagementStyle, string> = {
    'big-spender': '💰',
    'youth-focused': '🌱',
    'stable': '⚖️',
    'gambler': '🎲',
    'low-profile': '🏖️',
  };
  return icons[style] || '❓';
}

/**
 * 获取经营风格的颜色
 */
export function getManagementStyleColor(style: ManagementStyle): string {
  const colors: Record<ManagementStyle, string> = {
    'big-spender': '#FFD700',
    'youth-focused': '#4CAF50',
    'stable': '#2196F3',
    'gambler': '#F44336',
    'low-profile': '#9E9E9E',
  };
  return colors[style] || '#999999';
}

/**
 * 从 AI personality 推断经营风格
 */
export function inferManagementStyle(
  aggressiveness: number,
  patience: number,
  riskTolerance: number
): ManagementStyle {
  if (aggressiveness > 70 && riskTolerance > 70) {
    return 'big-spender';
  }
  if (patience > 70) {
    return 'youth-focused';
  }
  if (aggressiveness < 40 && riskTolerance < 40) {
    return 'low-profile';
  }
  if (riskTolerance > 80) {
    return 'gambler';
  }
  return 'stable';
}

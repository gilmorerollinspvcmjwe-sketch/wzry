import { Hero } from '@/core/models/Hero';
import type { HeroRole, Position } from '@/types';

// 创建英雄数据
export const heroes: Hero[] = [
  // 坦克
  new Hero('hero_001', '廉颇', 'tank', 1, 'early', 2, ['top', 'support']),
  new Hero('hero_002', '白起', 'tank', 1, 'mid', 2, ['top']),
  new Hero('hero_003', '项羽', 'tank', 1, 'early', 2, ['top', 'support']),
  new Hero('hero_004', '张飞', 'tank', 1, 'all', 1, ['support']),
  new Hero('hero_005', '牛魔', 'tank', 1, 'all', 1, ['support']),
  
  // 战士
  new Hero('hero_006', '铠', 'fighter', 1, 'late', 1, ['top', 'jungle']),
  new Hero('hero_007', '吕布', 'fighter', 2, 'late', 1, ['top']),
  new Hero('hero_008', '关羽', 'fighter', 3, 'mid', 2, ['top']),
  new Hero('hero_009', '马超', 'fighter', 3, 'mid', 0, ['top']),
  new Hero('hero_010', '花木兰', 'fighter', 3, 'mid', 2, ['top']),
  new Hero('hero_011', '芈月', 'fighter', 2, 'late', 2, ['top']),
  new Hero('hero_012', '老夫子', 'fighter', 2, 'late', 2, ['top']),
  new Hero('hero_013', '孙策', 'fighter', 2, 'mid', 2, ['top', 'support']),
  new Hero('hero_014', '猪八戒', 'fighter', 1, 'early', 1, ['top', 'jungle']),
  new Hero('hero_015', '夏洛特', 'fighter', 2, 'mid', 1, ['top']),
  
  // 刺客
  new Hero('hero_016', '李白', 'assassin', 3, 'mid', 2, ['jungle']),
  new Hero('hero_017', '韩信', 'assassin', 3, 'early', 2, ['jungle']),
  new Hero('hero_018', '赵云', 'assassin', 2, 'all', 2, ['jungle']),
  new Hero('hero_019', '孙悟空', 'assassin', 2, 'late', 2, ['jungle']),
  new Hero('hero_020', '阿轲', 'assassin', 2, 'late', 2, ['jungle']),
  new Hero('hero_021', '百里玄策', 'assassin', 3, 'mid', 1, ['jungle']),
  new Hero('hero_022', '裴擒虎', 'assassin', 3, 'early', 1, ['jungle']),
  new Hero('hero_023', '镜', 'assassin', 3, 'mid', 0, ['jungle']),
  new Hero('hero_024', '澜', 'assassin', 2, 'mid', 0, ['jungle']),
  
  // 法师
  new Hero('hero_025', '妲己', 'mage', 1, 'late', 3, ['mid']),
  new Hero('hero_026', '安琪拉', 'mage', 1, 'mid', 2, ['mid']),
  new Hero('hero_027', '小乔', 'mage', 1, 'late', 2, ['mid']),
  new Hero('hero_028', '王昭君', 'mage', 2, 'mid', 2, ['mid']),
  new Hero('hero_029', '貂蝉', 'mage', 3, 'mid', 1, ['mid']),
  new Hero('hero_030', '诸葛亮', 'mage', 2, 'mid', 2, ['mid', 'jungle']),
  new Hero('hero_031', '上官婉儿', 'mage', 3, 'mid', 1, ['mid']),
  new Hero('hero_032', '西施', 'mage', 2, 'mid', 1, ['mid']),
  new Hero('hero_033', '弈星', 'mage', 2, 'late', 2, ['mid']),
  new Hero('hero_034', '金蝉', 'mage', 1, 'mid', 1, ['mid']),
  
  // 射手
  new Hero('hero_035', '后羿', 'marksman', 1, 'late', 2, ['adc']),
  new Hero('hero_036', '鲁班七号', 'marksman', 1, 'late', 2, ['adc']),
  new Hero('hero_037', '马可波罗', 'marksman', 2, 'mid', 1, ['adc']),
  new Hero('hero_038', '孙尚香', 'marksman', 2, 'late', 1, ['adc']),
  new Hero('hero_039', '公孙离', 'marksman', 3, 'mid', 0, ['adc']),
  new Hero('hero_040', '大乔', 'marksman', 2, 'late', 1, ['adc']),
  new Hero('hero_041', '虞姬', 'marksman', 2, 'mid', 2, ['adc']),
  new Hero('hero_042', '狄仁杰', 'marksman', 1, 'all', 2, ['adc']),
  new Hero('hero_043', '蒙犽', 'marksman', 1, 'mid', 2, ['adc']),
  new Hero('hero_044', '戈娅', 'marksman', 2, 'mid', 1, ['adc']),
  
  // 辅助
  new Hero('hero_045', '大乔', 'support', 2, 'all', 1, ['support']),
  new Hero('hero_046', '瑶', 'support', 1, 'all', 2, ['support']),
  new Hero('hero_047', '东皇太一', 'support', 1, 'early', 1, ['support']),
  new Hero('hero_048', '钟馗', 'support', 2, 'all', 2, ['support', 'mid']),
  new Hero('hero_049', '蔡文姬', 'support', 1, 'late', 2, ['support']),
  new Hero('hero_050', '孙膑', 'support', 1, 'mid', 1, ['support']),
];

// 获取所有英雄
export function getAllHeroes(): Hero[] {
  return heroes;
}

// 根据 ID 获取英雄
export function getHeroById(id: string): Hero | undefined {
  return heroes.find(h => h.id === id);
}

// 根据定位筛选
export function getHeroesByRole(role: HeroRole): Hero[] {
  return heroes.filter(h => h.role === role);
}

// 根据位置筛选
export function getHeroesByPosition(position: Position): Hero[] {
  return heroes.filter(h => h.viablePositions.includes(position));
}

// 获取版本强势英雄
export function getMetaHeroes(tier: number = 1): Hero[] {
  return heroes.filter(h => h.tier <= tier);
}

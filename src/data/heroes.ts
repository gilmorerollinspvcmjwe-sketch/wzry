import { Hero } from '@/core/models/Hero';
import type { HeroRole } from '@/types';

// 创建英雄数据 - 简化版，只保留核心字段
export const heroes: Hero[] = [
  // 坦克
  new Hero('hero_001', '廉颇', 'tank', 2, ['控制', '坦克', '先手'], ['hero_038'], ['hero_023']),
  new Hero('hero_002', '白起', 'tank', 2, ['控制', '坦克', '团控'], ['hero_016', 'hero_017'], ['hero_023']),
  new Hero('hero_003', '项羽', 'tank', 2, ['控制', '坦克', '突进'], ['hero_038'], ['hero_023', 'hero_024']),
  new Hero('hero_004', '张飞', 'tank', 1, ['控制', '坦克', '辅助', '变身'], ['hero_016', 'hero_017'], ['hero_022']),
  new Hero('hero_005', '牛魔', 'tank', 1, ['控制', '坦克', '辅助'], ['hero_016'], ['hero_023']),
  
  // 战士
  new Hero('hero_006', '铠', 'fighter', 1, ['战士', '爆发', '单挑'], ['hero_016', 'hero_017'], ['hero_023']),
  new Hero('hero_007', '吕布', 'fighter', 1, ['战士', '真伤', '团控'], ['hero_006', 'hero_014'], ['hero_022']),
  new Hero('hero_008', '关羽', 'fighter', 2, ['战士', '突进', '控制'], ['hero_026', 'hero_027'], ['hero_032']),
  new Hero('hero_009', '马超', 'fighter', 0, ['战士', '突进', '持续输出'], ['hero_008'], ['hero_032', 'hero_033']),
  new Hero('hero_010', '花木兰', 'fighter', 2, ['战士', '突进', '爆发'], ['hero_026', 'hero_027'], ['hero_023']),
  new Hero('hero_011', '芈月', 'fighter', 2, ['战士', '法师', '吸血'], ['hero_007'], ['hero_016']),
  new Hero('hero_012', '老夫子', 'fighter', 2, ['战士', '单挑', '控制'], ['hero_009'], ['hero_023', 'hero_024']),
  new Hero('hero_013', '孙策', 'fighter', 2, ['战士', '突进', '控制'], ['hero_028', 'hero_029'], ['hero_032']),
  new Hero('hero_014', '猪八戒', 'fighter', 1, ['战士', '坦克', '控制'], ['hero_007'], ['hero_011']),
  new Hero('hero_015', '夏洛特', 'fighter', 1, ['战士', '突进', '持续输出'], ['hero_008', 'hero_009'], ['hero_023']),
  
  // 刺客
  new Hero('hero_016', '李白', 'assassin', 2, ['刺客', '突进', '爆发'], ['hero_026', 'hero_027'], ['hero_004', 'hero_005']),
  new Hero('hero_017', '韩信', 'assassin', 2, ['刺客', '突进', '机动'], ['hero_026', 'hero_028'], ['hero_004', 'hero_032']),
  new Hero('hero_018', '赵云', 'assassin', 2, ['刺客', '战士', '突进'], ['hero_026', 'hero_027'], ['hero_007']),
  new Hero('hero_019', '孙悟空', 'assassin', 2, ['刺客', '爆发', '控制'], ['hero_026', 'hero_028'], ['hero_004']),
  new Hero('hero_020', '阿轲', 'assassin', 2, ['刺客', '爆发', '隐身'], ['hero_026', 'hero_029'], ['hero_004', 'hero_005']),
  new Hero('hero_021', '百里玄策', 'assassin', 1, ['刺客', '控制', '机动'], ['hero_016', 'hero_017'], ['hero_023']),
  new Hero('hero_022', '裴擒虎', 'assassin', 1, ['刺客', '战士', '双形态'], ['hero_017', 'hero_018'], ['hero_007', 'hero_014']),
  new Hero('hero_023', '镜', 'assassin', 0, ['刺客', '爆发', '机动'], ['hero_016', 'hero_017'], ['hero_004', 'hero_005']),
  new Hero('hero_024', '澜', 'assassin', 0, ['刺客', '突进', '收割'], ['hero_016', 'hero_026'], ['hero_004', 'hero_005']),
  
  // 法师
  new Hero('hero_025', '妲己', 'mage', 3, ['法师', '爆发', '控制'], ['hero_016', 'hero_017'], ['hero_032']),
  new Hero('hero_026', '安琪拉', 'mage', 2, ['法师', '爆发', '控制'], ['hero_007', 'hero_014'], ['hero_023']),
  new Hero('hero_027', '小乔', 'mage', 2, ['法师', '爆发', '控制'], ['hero_016', 'hero_017'], ['hero_023']),
  new Hero('hero_028', '王昭君', 'mage', 2, ['法师', '控制', '团控'], ['hero_009', 'hero_010'], ['hero_023']),
  new Hero('hero_029', '貂蝉', 'mage', 1, ['法师', '持续输出', '真伤'], ['hero_007', 'hero_014'], ['hero_025']),
  new Hero('hero_030', '诸葛亮', 'mage', 2, ['法师', '爆发', '机动'], ['hero_026', 'hero_027'], ['hero_032']),
  new Hero('hero_031', '上官婉儿', 'mage', 1, ['法师', '突进', '爆发'], ['hero_026', 'hero_027'], ['hero_004', 'hero_005']),
  new Hero('hero_032', '西施', 'mage', 1, ['法师', '控制', '工具人'], ['hero_016', 'hero_017'], ['hero_023']),
  new Hero('hero_033', '弈星', 'mage', 2, ['法师', '控制', '团控'], ['hero_009', 'hero_010'], ['hero_023']),
  new Hero('hero_034', '金蝉', 'mage', 1, ['法师', '控制', '工具人'], ['hero_016', 'hero_023'], ['hero_025']),
  
  // 射手
  new Hero('hero_035', '后羿', 'marksman', 2, ['射手', '持续输出', '团控'], ['hero_007', 'hero_014'], ['hero_016', 'hero_017']),
  new Hero('hero_036', '鲁班七号', 'marksman', 2, ['射手', '爆发', '百分比伤害'], ['hero_007', 'hero_014'], ['hero_016', 'hero_017']),
  new Hero('hero_037', '马可波罗', 'marksman', 1, ['射手', '真伤', '机动'], ['hero_014', 'hero_006'], ['hero_023', 'hero_024']),
  new Hero('hero_038', '孙尚香', 'marksman', 1, ['射手', '爆发', '机动'], ['hero_007'], ['hero_016', 'hero_017']),
  new Hero('hero_039', '公孙离', 'marksman', 0, ['射手', '机动', '持续输出'], ['hero_007'], ['hero_016', 'hero_023']),
  new Hero('hero_040', '伽罗', 'marksman', 1, ['射手', '超远射程', '破盾'], ['hero_007'], ['hero_016', 'hero_017']),
  new Hero('hero_041', '虞姬', 'marksman', 2, ['射手', '免疫', '爆发'], ['hero_016', 'hero_017'], ['hero_023']),
  new Hero('hero_042', '狄仁杰', 'marksman', 2, ['射手', '控制', '解控'], ['hero_007'], ['hero_016']),
  new Hero('hero_043', '蒙犽', 'marksman', 2, ['射手', '持续输出', '回复'], ['hero_007'], ['hero_016', 'hero_023']),
  new Hero('hero_044', '戈娅', 'marksman', 1, ['射手', '机动', '团控'], ['hero_007'], ['hero_016', 'hero_023']),
  
  // 辅助
  new Hero('hero_045', '大乔', 'support', 1, ['辅助', '传送', '控制'], ['hero_028', 'hero_029'], ['hero_016', 'hero_017']),
  new Hero('hero_046', '瑶', 'support', 2, ['辅助', '附身', '护盾'], ['hero_016', 'hero_017'], ['hero_023']),
  new Hero('hero_047', '东皇太一', 'support', 1, ['辅助', '控制', '压制'], ['hero_023', 'hero_024'], ['hero_028', 'hero_029']),
  new Hero('hero_048', '钟馗', 'support', 2, ['辅助', '控制', '钩子'], ['hero_016', 'hero_017'], ['hero_023']),
  new Hero('hero_049', '蔡文姬', 'support', 2, ['辅助', '回复', '控制'], ['hero_007', 'hero_014'], ['hero_023']),
  new Hero('hero_050', '孙膑', 'support', 1, ['辅助', '加速', '团控'], ['hero_009', 'hero_010'], ['hero_016']),
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

// 获取版本强势英雄
export function getMetaHeroes(tier: number = 1): Hero[] {
  return heroes.filter(h => h.tier <= tier);
}

// 根据标签筛选
export function getHeroesByTag(tag: string): Hero[] {
  return heroes.filter(h => h.tags.includes(tag));
}

// 获取所有标签列表
export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  heroes.forEach(hero => {
    hero.tags.forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet);
}

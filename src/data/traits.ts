import type { Trait } from '@/types';

// 正面特质
const positiveTraits: Trait[] = [
  {
    id: 'big_heart',
    name: '大心脏',
    description: '关键局发挥更稳定，心态属性提升 30%',
    type: 'positive',
    effects: { mentality: 1.3 },
  },
  {
    id: 'hero_pool',
    name: '英雄海',
    description: '擅长英雄数量多，英雄池属性提升 50%',
    type: 'positive',
    effects: { heroPool: 1.5 },
  },
  {
    id: 'leader',
    name: '领袖气质',
    description: '团队协作能力出色，配合属性提升 25%',
    type: 'positive',
    effects: { teamwork: 1.25 },
  },
  {
    id: 'hardworking',
    name: '勤奋',
    description: '训练效果提升 20%',
    type: 'positive',
    effects: { teamwork: 1.1 },
  },
  {
    id: 'genius',
    name: '天才少年',
    description: '成长速度提升 30%',
    type: 'positive',
    effects: { mechanics: 1.1 },
  },
  {
    id: 'clutch_player',
    name: '关键先生',
    description: '决胜局操作提升 25%',
    type: 'positive',
    effects: { mechanics: 1.25 },
  },
  {
    id: 'tactical_master',
    name: '战术大师',
    description: '意识出众，大局观提升 30%',
    type: 'positive',
    effects: { awareness: 1.3 },
  },
  {
    id: 'iron_will',
    name: '钢铁意志',
    description: '逆风局心态更稳定，心态属性提升 35%',
    type: 'positive',
    effects: { mentality: 1.35 },
  },
  {
    id: 'team_player',
    name: '团队型选手',
    description: '配合能力提升 30%',
    type: 'positive',
    effects: { teamwork: 1.3 },
  },
  {
    id: 'versatile',
    name: '多面手',
    description: '可以胜任多个位置',
    type: 'positive',
    effects: { heroPool: 1.2 },
  },
];

// 负面特质
const negativeTraits: Trait[] = [
  {
    id: 'weak_mentality',
    name: '心态差',
    description: '逆风局容易崩，心态属性降低 20%',
    type: 'negative',
    effects: { mentality: 0.8 },
  },
  {
    id: 'hero_spoon',
    name: '英雄勺',
    description: '擅长英雄少，英雄池属性降低 30%',
    type: 'negative',
    effects: { heroPool: 0.7 },
  },
  {
    id: 'lazy',
    name: '懒散',
    description: '训练效果降低 25%',
    type: 'negative',
    effects: { teamwork: 0.85 },
  },
  {
    id: 'injury_prone',
    name: '易受伤',
    description: '更容易受伤',
    type: 'negative',
    effects: { mentality: 0.9 },
  },
  {
    id: 'selfish',
    name: '独狼',
    description: '团队配合能力差，配合属性降低 25%',
    type: 'negative',
    effects: { teamwork: 0.75 },
  },
  {
    id: 'nervous',
    name: '紧张',
    description: '关键局容易紧张，操作下降 15%',
    type: 'negative',
    effects: { mechanics: 0.85 },
  },
  {
    id: 'stubborn',
    name: '固执',
    description: '不愿改变战术，意识提升慢',
    type: 'negative',
    effects: { awareness: 0.9 },
  },
  {
    id: 'unreliable',
    name: '不稳定',
    description: '发挥时好时坏',
    type: 'negative',
    effects: { mentality: 0.85 },
  },
];

// 特殊特质
const specialTraits: Trait[] = [
  {
    id: 'version_son',
    name: '版本之子',
    description: '当前版本特别适合，所有属性提升 10%',
    type: 'special',
    effects: { mechanics: 1.1, awareness: 1.1, mentality: 1.1 },
  },
  {
    id: 'legend',
    name: '传奇选手',
    description: '历史级选手，所有属性提升 20%',
    type: 'special',
    effects: { mechanics: 1.2, awareness: 1.2, mentality: 1.2, teamwork: 1.2 },
  },
  {
    id: 'rookie_king',
    name: '新秀之王',
    description: '新秀赛季表现超常',
    type: 'special',
    effects: { mechanics: 1.15, heroPool: 1.1 },
  },
  {
    id: 'mvp_machine',
    name: 'MVP 机器',
    description: '更容易获得 MVP',
    type: 'special',
    effects: { mechanics: 1.15, awareness: 1.15 },
  },
  {
    id: 'clutch_gene',
    name: '决胜基因',
    description: '季后赛和决赛发挥更好',
    type: 'special',
    effects: { mentality: 1.4, mechanics: 1.1 },
  },
];

// 所有特质
export const allTraits: Trait[] = [
  ...positiveTraits,
  ...negativeTraits,
  ...specialTraits,
];

// 获取所有正面特质
export function getPositiveTraits(): Trait[] {
  return positiveTraits;
}

// 获取所有负面特质
export function getNegativeTraits(): Trait[] {
  return negativeTraits;
}

// 获取所有特殊特质
export function getSpecialTraits(): Trait[] {
  return specialTraits;
}

// 根据 ID 获取特质
export function getTraitById(id: string): Trait | undefined {
  return allTraits.find(t => t.id === id);
}

// 随机生成特质（正面 + 负面平衡）
export function generateRandomTraits(count: number = 2): Trait[] {
  const traits: Trait[] = [];
  const availablePositive = [...positiveTraits];
  const availableNegative = [...negativeTraits];
  const availableSpecial = [...specialTraits];
  
  for (let i = 0; i < count; i++) {
    const rand = Math.random();
    if (rand < 0.6 && availablePositive.length > 0) {
      // 60% 概率获得正面特质
      const index = Math.floor(Math.random() * availablePositive.length);
      const trait = availablePositive.splice(index, 1)[0];
      if (trait) traits.push(trait);
    } else if (rand < 0.9 && availableNegative.length > 0) {
      // 30% 概率获得负面特质
      const index = Math.floor(Math.random() * availableNegative.length);
      const trait = availableNegative.splice(index, 1)[0];
      if (trait) traits.push(trait);
    } else if (availableSpecial.length > 0 && Math.random() < 0.3) {
      // 10% 概率获得特殊特质
      const index = Math.floor(Math.random() * availableSpecial.length);
      const trait = availableSpecial.splice(index, 1)[0];
      if (trait) traits.push(trait);
    }
  }
  
  return traits;
}

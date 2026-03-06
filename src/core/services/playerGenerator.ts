import type { PlayerPersonality, PlayerTalent } from '@/core/models/Player';
import type { Position } from '@/types';
import { Player } from '@/core/models/Player';

/**
 * 名字生成器数据
 */
const NAME_DATA = {
  // 50 个常见姓氏
  surnames: [
    '王', '李', '张', '刘', '陈', '杨', '黄', '赵', '周', '吴',
    '徐', '孙', '马', '朱', '胡', '郭', '何', '高', '林', '罗',
    '郑', '梁', '谢', '宋', '唐', '许', '邓', '冯', '韩', '曹',
    '曾', '彭', '萧', '蔡', '潘', '田', '董', '袁', '于', '余',
    '叶', '蒋', '杜', '苏', '魏', '程', '吕', '丁', '任', '沈'
  ],

  // 50 个单字（男）
  maleSingle: [
    '伟', '强', '磊', '洋', '勇', '军', '杰', '娟', '芳', '娜',
    '敏', '静', '丽', '秀', '英', '华', '平', '斌', '浩', '文',
    '博', '峰', '俊', '超', '明', '辉', '建', '刚', '永', '卫',
    '利', '涛', '鹏', '龙', '飞', '宇', '翔', '阳', '健', '乐',
    '鑫', '毅', '诚', '瑞', '睿', '哲', '贤', '达', '远', '志'
  ],

  // 50 个单字（女）
  femaleSingle: [
    '芳', '娜', '敏', '静', '丽', '秀', '英', '华', '梅', '玲',
    '燕', '萍', '霞', '雪', '婷', '娟', '红', '芬', '琳', '倩',
    '颖', '丹', '晶', '晴', '雯', '蕾', '瑶', '璇', '璐', '琦',
    '瑾', '瑜', '璇', '菲', '萌', '薇', '彤', '悦', '欣', '怡',
    '涵', '淑', '清', '雅', '诗', '画', '梦', '雨', '露', '霜'
  ],

  // 50 个双字（男）
  maleDouble: [
    '志强', '建国', '伟强', '建军', '文明', '建华', '志强', '建平',
    '国强', '志伟', '建平', '永强', '志军', '伟民', '建明', '国强',
    '志平', '伟华', '建伟', '永明', '志强', '建华', '建民', '国伟',
    '志华', '伟建', '建强', '永伟', '志明', '伟志', '建国', '国军',
    '志远', '伟哲', '建辉', '永辉', '志辉', '伟达', '建远', '国辉',
    '志诚', '伟诚', '建诚', '永诚', '志睿', '伟睿', '建睿', '永睿'
  ],

  // 50 个双字（女）
  femaleDouble: [
    '秀英', '桂英', '秀兰', '玉兰', '秀珍', '桂珍', '秀梅', '玉梅',
    '秀芳', '桂芳', '秀娟', '桂娟', '秀霞', '玉霞', '秀丽', '桂丽',
    '秀红', '玉红', '秀云', '桂云', '秀芬', '玉芬', '秀萍', '桂萍',
    '秀琴', '玉琴', '秀玲', '桂玲', '秀燕', '玉燕', '秀娟', '桂娟',
    '雅文', '雅静', '雅丽', '雅芳', '雅婷', '雅琳', '雅娟', '雅萍',
    '诗涵', '诗雨', '诗琪', '诗瑶', '诗琪', '诗涵', '诗雨', '诗琪'
  ]
};

/**
 * 游戏 ID 生成器组件
 */
const GAME_ID_COMPONENTS = {
  // 形容词
  adjectives: [
    '无敌', '超级', '极限', '终极', '狂暴', '暗影', '圣光', '烈焰',
    '寒冰', '雷霆', '风暴', '天空', '大地', '深渊', '星辰', '梦幻',
    '飘逸', '灵动', '霸气', '冷酷', '孤傲', '寂寞', '逍遥', '风流',
    '潇洒', '帅气', '可爱', '呆萌', '腹黑', '傲娇', '温柔', '阳光'
  ],
  
  // 名词
  nouns: [
    '剑客', '刀锋', '刺客', '法师', '射手', '辅助', '坦克', '战士',
    '王者', '荣耀', '传奇', '神话', '传说', '英雄', '大神', '高手',
    '菜鸟', '萌新', '路人', '大神', '法王', '野王', '射王', '辅王',
    '浪子', '少年', '少女', '男神', '女神', '男神', '女王', '公主'
  ],

  // 符号
  symbols: ['', '', '', '丶', '丿', '', '彡', '', '乄', '']
};

/**
 * 特殊天赋池
 */
const TALENT_POOL: PlayerTalent[] = [
  {
    id: 'talent_001',
    name: '天才少年',
    description: '18 岁以下潜力 +10',
    effect: { type: 'potential_bonus', value: 10, condition: 'age < 18' }
  },
  {
    id: 'talent_002',
    name: '大器晚成',
    description: '24 岁后仍有成长',
    effect: { type: 'growth_extension', value: 0, condition: 'age >= 24' }
  },
  {
    id: 'talent_003',
    name: '英雄海',
    description: '英雄池深度 +50%',
    effect: { type: 'hero_pool_bonus', value: 0.5 }
  },
  {
    id: 'talent_004',
    name: '关键先生',
    description: '决胜局表现 +20%',
    effect: { type: 'clutch_performance', value: 0.2 }
  },
  {
    id: 'talent_005',
    name: '劳模',
    description: '体力消耗 -20%',
    effect: { type: 'stamina_conservation', value: 0.2 }
  },
  {
    id: 'talent_006',
    name: '快速恢复',
    description: '体力恢复 +50%',
    effect: { type: 'stamina_recovery', value: 0.5 }
  },
  {
    id: 'talent_007',
    name: '天生领袖',
    description: '担任队长时全队士气 +10%',
    effect: { type: 'team_morale_bonus', value: 0.1, condition: 'is_captain' }
  },
  {
    id: 'talent_008',
    name: '直播达人',
    description: '粉丝增长速度 +30%',
    effect: { type: 'fan_growth_bonus', value: 0.3 }
  }
];

/**
 * 全局选手 ID 生成器
 */
class PlayerIdGenerator {
  private yearCounter: Map<number, number> = new Map();

  /**
   * 生成唯一 ID（格式：P_年份_序号）
   */
  generate(): string {
    const year = new Date().getFullYear();
    const counter = this.yearCounter.get(year) || 0;
    const newCounter = counter + 1;
    this.yearCounter.set(year, newCounter);
    return `P_${year}_${String(newCounter).padStart(3, '0')}`;
  }

  /**
   * 重置计数器（用于新存档）
   */
  reset(): void {
    this.yearCounter.clear();
  }

  /**
   * 从存档恢复
   */
  loadFromSave(data: Map<number, number>): void {
    this.yearCounter = new Map(data);
  }

  /**
   * 导出到存档
   */
  exportToSave(): Map<number, number> {
    return new Map(this.yearCounter);
  }
}

// 单例实例
const playerIdGenerator = new PlayerIdGenerator();

/**
 * 随机数生成辅助函数
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!;
}

/**
 * 生成选手基本信息
 */
function generateBasicInfo(): {
  id: string;
  gender: 'male' | 'female';
  age: number;
  nationality: string;
  height: number;
  weight: number;
} {
  // 性别（7:3 男女比例）
  const gender = Math.random() < 0.7 ? 'male' : 'female';

  // 年龄（青训 16-18，主力 18-24，老将 24+）
  const ageRoll = Math.random();
  let age: number;
  if (ageRoll < 0.3) {
    age = randomInt(16, 18);  // 青训 30%
  } else if (ageRoll < 0.8) {
    age = randomInt(18, 24);  // 主力 50%
  } else {
    age = randomInt(24, 28);  // 老将 20%
  }

  // 国籍（大部分中国，少量外援）
  const nationalityRoll = Math.random();
  let nationality: string;
  if (nationalityRoll < 0.85) {
    nationality = '中国';
  } else if (nationalityRoll < 0.90) {
    nationality = '韩国';
  } else if (nationalityRoll < 0.95) {
    nationality = '越南';
  } else {
    nationality = '马来西亚';
  }

  // 身高体重（符合电竞选手特征）
  const height = gender === 'male' 
    ? randomInt(165, 185) 
    : randomInt(155, 175);
  const weight = gender === 'male'
    ? randomInt(55, 80)
    : randomInt(45, 65);

  return {
    id: playerIdGenerator.generate(),
    gender,
    age,
    nationality,
    height,
    weight
  };
}

/**
 * 生成选手名字
 */
function generateName(gender: 'male' | 'female'): { name: string; gameId: string } {
  const surname = randomChoice(NAME_DATA.surnames);
  
  // 70% 概率双字名，30% 概率单字名
  const isDoubleName = Math.random() < 0.7;
  let givenName: string;
  
  if (isDoubleName) {
    const nameList = gender === 'male' ? NAME_DATA.maleDouble : NAME_DATA.femaleDouble;
    givenName = randomChoice(nameList);
  } else {
    const nameList = gender === 'male' ? NAME_DATA.maleSingle : NAME_DATA.femaleSingle;
    givenName = randomChoice(nameList);
  }
  
  const name = surname + givenName;
  
  // 生成游戏 ID
  const adjective = randomChoice(GAME_ID_COMPONENTS.adjectives);
  const noun = randomChoice(GAME_ID_COMPONENTS.nouns);
  const symbol = randomChoice(GAME_ID_COMPONENTS.symbols);
  
  // 80% 概率使用形容词 + 名词，20% 概率使用其他格式
  let gameId: string;
  if (Math.random() < 0.8) {
    gameId = `${adjective}${noun}${symbol}`;
  } else {
    // 其他格式：名字缩写 + 数字，或纯英文
    const surnameInitial = surname[0]?.toUpperCase() || 'A';
    const givenNameInitial = givenName[0]?.toUpperCase() || 'B';
    const formats = [
      `${surnameInitial}${givenNameInitial}${randomInt(1, 99)}`,
      `${noun}${randomInt(1, 999)}`,
      `${adjective}${randomInt(1, 99)}`
    ];
    gameId = randomChoice(formats);
  }
  
  return { name, gameId };
}

/**
 * 生成选手位置
 */
function generatePosition(): { position: Position; secondaryPositions: Position[] } {
  const positions: Position[] = ['top', 'jungle', 'mid', 'adc', 'support'];
  const primaryPosition = randomChoice(positions);
  
  // 生成 1-2 个次要位置
  const secondaryCount = Math.random() < 0.5 ? 1 : 2;
  const secondaryPositions = positions
    .filter(p => p !== primaryPosition)
    .sort(() => Math.random() - 0.5)
    .slice(0, secondaryCount);
  
  return {
    position: primaryPosition,
    secondaryPositions
  };
}

/**
 * 生成选手属性
 */
function generateAttributes(age: number, potential: number): {
  mechanics: number;
  awareness: number;
  teamwork: number;
  mentality: number;
  stamina: number;
} {
  // 基础值在 50-70 之间，潜力决定上限
  const baseValue = () => randomInt(50, 70);
  
  // 年龄修正（18-22 岁成长最快）
  const ageBonus = age >= 18 && age <= 22 ? 5 : 0;
  
  return {
    mechanics: Math.min(potential, baseValue() + ageBonus),
    awareness: Math.min(potential, baseValue() + ageBonus),
    teamwork: Math.min(potential, baseValue() + ageBonus),
    mentality: Math.min(potential, baseValue() + ageBonus),
    stamina: Math.min(potential, baseValue() + (age < 25 ? 10 : 0))
  };
}

/**
 * 生成选手性格特质
 */
function generatePersonality(): PlayerPersonality {
  const traits = {
    trainingAttitude: randomChoice(['diligent', 'lazy', 'self-disciplined'] as const),
    playStyle: randomChoice(['aggressive', 'stable', 'flexible'] as const),
    teamwork: randomChoice(['lone-wolf', 'team-player', 'leader'] as const),
    pressureResistance: randomChoice(['clutch', 'fragile', 'normal'] as const),
    socialSkill: randomChoice(['introverted', 'extroverted', 'charismatic'] as const)
  };
  
  return traits;
}

/**
 * 生成特殊天赋（低概率）
 */
function generateTalents(): PlayerTalent[] {
  const talents: PlayerTalent[] = [];
  
  // 30% 概率拥有天赋
  if (Math.random() < 0.3) {
    // 随机选择 1-2 个天赋
    const talentCount = Math.random() < 0.8 ? 1 : 2;
    const availableTalents = [...TALENT_POOL];
    
    for (let i = 0; i < talentCount; i++) {
      if (availableTalents.length === 0) break;
      const index = Math.floor(Math.random() * availableTalents.length);
      const talent = availableTalents[index];
      if (talent) {
        talents.push(talent);
        availableTalents.splice(index, 1);
      }
    }
  }
  
  return talents;
}

/**
 * 生成潜力值（60-95）
 */
function generatePotential(): number {
  // 正态分布，均值 75，标准差 8
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  const potential = Math.round(75 + 8 * z);
  
  // 限制在 60-95 之间
  return Math.max(60, Math.min(95, potential));
}

/**
 * 生成完整选手
 */
export function generatePlayer(
  overrides?: Partial<Player>
): Player {
  // 基本信息
  const basic = generateBasicInfo();
  
  // 名字
  const { name, gameId } = generateName(basic.gender);
  
  // 位置
  const { position, secondaryPositions } = generatePosition();
  
  // 潜力
  const potential = generatePotential();
  
  // 属性
  const attributes = generateAttributes(basic.age, potential);
  
  // 性格
  const personality = generatePersonality();
  
  // 天赋
  const talents = generateTalents();
  
  // 创建选手实例
  const player = new Player(
    name,
    basic.age,
    position,
    potential,
    basic.gender,
    basic.height,
    basic.weight,
    gameId,
    personality,
    talents,
    secondaryPositions
  );
  
  // 手动设置属性（因为构造函数会生成默认属性）
  (player as any).stats = attributes;
  
  // 应用覆盖
  if (overrides) {
    Object.assign(player, overrides);
  }
  
  return player;
}

/**
 * 批量生成选手
 */
export function generatePlayers(count: number): Player[] {
  return Array.from({ length: count }, () => generatePlayer());
}

/**
 * 生成青训选手（16-18 岁，潜力较高）
 */
export function generateYouthPlayer(): Player {
  return generatePlayer({
    age: randomInt(16, 18),
    potential: randomInt(70, 90)
  });
}

/**
 * 生成明星选手（高潜力，高属性）
 */
export function generateStarPlayer(): Player {
  return generatePlayer({
    age: randomInt(18, 24),
    potential: randomInt(85, 95)
  });
}

/**
 * 导出 ID 生成器状态（用于存档）
 */
export function exportIdGeneratorState(): Map<number, number> {
  return playerIdGenerator.exportToSave();
}

/**
 * 导入 ID 生成器状态（加载存档）
 */
export function importIdGeneratorState(data: Map<number, number>): void {
  playerIdGenerator.loadFromSave(data);
}

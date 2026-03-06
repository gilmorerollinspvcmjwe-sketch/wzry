// 事件类别
export const EventCategory = {
  BUSINESS: 'business',           // 商业活动
  TRANSFER: 'transfer',           // 选手转会
  INJURY: 'injury',               // 伤病意外
  INTERNAL: 'internal',           // 内部矛盾
  MEDIA: 'media',                 // 媒体事件
  SPONSOR: 'sponsor',             // 赞助商相关
  COMPETITOR: 'competitor',       // 竞争对手动向
  LEAGUE_POLICY: 'league_policy', // 联赛政策
  EMERGENCY: 'emergency',         // 突发事件
  HONOR: 'honor'                  // 荣誉庆典
} as const;

export type EventCategory = typeof EventCategory[keyof typeof EventCategory];

// 事件稀有度
export const EventRarity = {
  COMMON: 'common',       // 普通 (60%)
  UNCOMMON: 'uncommon',   // 罕见 (30%)
  RARE: 'rare',          // 稀有 (9%)
  EPIC: 'epic'           // 史诗 (1%)
} as const;

export type EventRarity = typeof EventRarity[keyof typeof EventRarity];

// 事件后果接口
export interface EventConsequences {
  // 财务影响
  fundsChange?: number;        // 资金变化（万）
  salaryChange?: number;       // 薪资变化（万/周）
  
  // 声望影响
  reputationChange?: number;   // 俱乐部声望变化
  fanChange?: number;          // 粉丝数变化
  
  // 选手状态影响
  moraleChange?: number;       // 全队士气变化
  staminaChange?: number;      // 全队体力变化
  mentalityChange?: number;    // 全队心态变化
  
  // 特定选手影响
  affectedPlayerId?: string;   // 受影响的选手 ID
  playerMoraleChange?: number; // 特定选手士气变化
  playerStatChange?: {         // 特定选手属性变化
    statType: string;
    value: number;
    duration?: number; // 持续天数，undefined 为永久
  };
  
  // 持续时间效果
  duration?: number;  // 效果持续天数
  temporary?: boolean; // 是否为临时效果
}

// 触发条件接口
export interface EventTriggerCondition {
  // 俱乐部条件
  minReputation?: number;      // 最低声望要求
  maxReputation?: number;      // 最高声望要求
  minFunds?: number;           // 最低资金要求
  maxFunds?: number;           // 最高资金要求
  minFans?: number;            // 最低粉丝要求
  
  // 赛季条件
  seasonPhase?: 'regular' | 'playoff' | 'offseason'; // 赛季阶段
  minWeek?: number;            // 最低周数
  maxWeek?: number;            // 最高周数
  
  // 成绩条件
  minRanking?: number;         // 最低排名要求
  maxRanking?: number;         // 最高排名要求
  minWinRate?: number;         // 最低胜率要求
  
  // 选手条件
  hasPlayer?: string;          // 拥有特定选手
  playerCount?: number;        // 选手数量要求
  
  // 事件条件
  requiresEvent?: string;      // 需要先触发某事件
  excludesEvent?: string;      // 不能已触发某事件
  
  // 随机概率
  baseChance?: number;         // 基础触发概率 (0-1)
}

// 事件选项接口
export interface EventOption {
  id: string;
  text: string;                // 选项文本
  requirements?: {             // 选择该选项的要求
    minFunds?: number;
    maxFunds?: number;
    hasPlayer?: string;
  };
  consequences: EventConsequences; // 选择该选项的后果
  preview?: string;            // 后果预览文本
}

// 事件接口
export interface GameEvent {
  id: string;
  title: string;               // 事件标题
  description: string;         // 事件描述
  category: EventCategory;     // 事件类别
  rarity: EventRarity;         // 稀有度
  weight: number;              // 权重（影响触发概率）
  
  // 触发条件
  triggerConditions: EventTriggerCondition;
  
  // 事件选项（2-4 个）
  options: EventOption[];
  
  // 视觉效果
  icon?: string;               // 事件图标
  backgroundColor?: string;    // 背景颜色
  
  // 持续时间
  duration?: number;           // 事件持续天数（如果有持续效果）
  
  // 元数据
  createdAt?: Date;            // 创建时间
  triggeredAt?: Date;          // 触发时间
  resolvedAt?: Date;           // 解决时间
}

// 进行中的事件
export interface ActiveEvent extends GameEvent {
  selectedOptionId?: string;   // 已选择的选项 ID
  remainingDays?: number;      // 剩余持续天数
}

// 事件历史记录
export interface EventHistory {
  eventId: string;
  title: string;
  category: EventCategory;
  triggeredAt: Date;
  resolvedAt: Date;
  selectedOption: string;
  consequences: EventConsequences;
}

// 事件系统配置
export interface EventSystemConfig {
  // 基础触发概率
  baseTriggerChance: number;   // 每日基础触发概率
  
  // 稀有度权重
  rarityWeights: {
    [EventRarity.COMMON]: number;
    [EventRarity.UNCOMMON]: number;
    [EventRarity.RARE]: number;
    [EventRarity.EPIC]: number;
  };
  
  // 事件队列限制
  maxActiveEvents: number;     // 最大同时进行事件数
  minDaysBetweenEvents: number; // 两个事件最小间隔天数
  
  // 类别限制
  maxEventsPerCategory: number; // 每类别最大事件数
}

// 默认配置
export const DEFAULT_EVENT_CONFIG: EventSystemConfig = {
  baseTriggerChance: 0.3, // 30% 基础触发概率
  rarityWeights: {
    [EventRarity.COMMON]: 0.6,
    [EventRarity.UNCOMMON]: 0.3,
    [EventRarity.RARE]: 0.09,
    [EventRarity.EPIC]: 0.01,
  },
  maxActiveEvents: 2,
  minDaysBetweenEvents: 1,
  maxEventsPerCategory: 3,
};

export type StorylineType = 'rookie-rise' | 'veteran-twilight' | 'comeback' | 'transfer-saga' | 'controversy';

export type TriggerType = 'match_result' | 'training' | 'contract' | 'transfer' | 'achievement' | 'relationship' | 'time' | 'random';

export interface StoryTrigger {
  type: TriggerType;
  conditions: {
    matchWins?: number;
    matchLosses?: number;
    daysInClub?: number;
    age?: number;
    morale?: number;
    performance?: number;
    hasInjury?: boolean;
    contractMonthsLeft?: number;
    relationshipStrength?: number;
  };
  probability: number;
}

export interface StoryChoice {
  id: string;
  text: string;
  consequences: StoryImpact;
  nextChapter?: number;
  locked?: boolean;
  lockReason?: string;
}

export interface StoryImpact {
  attributes?: {
    mechanics?: number;
    awareness?: number;
    mentality?: number;
    teamwork?: number;
  };
  morale?: number;
  relationships?: {
    targetId?: string;
    type: 'improve' | 'worsen';
    value: number;
  }[];
  reputation?: number;
  loyalty?: number;
  stress?: number;
  special?: string;
}

export interface StoryChapter {
  number: number;
  title: string;
  description: string;
  trigger: StoryTrigger;
  choices: StoryChoice[];
  completed: boolean;
  selectedChoice?: string;
  completedAt?: Date;
}

export interface PlayerStoryline {
  id: string;
  playerId: string;
  type: StorylineType;
  title: string;
  description: string;
  currentChapter: number;
  chapters: StoryChapter[];
  impact: StoryImpact;
  status: 'active' | 'completed' | 'abandoned';
  startedAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export const STORYLINE_TYPE_NAMES: Record<StorylineType, string> = {
  'rookie-rise': '新秀崛起',
  'veteran-twilight': '老将暮年',
  'comeback': '王者归来',
  'transfer-saga': '转会风云',
  'controversy': '争议漩涡',
};

export const STORYLINE_TYPE_DESCRIPTIONS: Record<StorylineType, string> = {
  'rookie-rise': '一位天才新秀正在崭露头角，他的成长之路充满机遇与挑战。',
  'veteran-twilight': '老将的职业生涯即将走向尾声，他将如何书写最后的篇章？',
  'comeback': '经历低谷后的重返巅峰之路，这是一段关于坚持与信念的故事。',
  'transfer-saga': '转会市场上的焦点人物，他的去留牵动着无数人的心。',
  'controversy': '身处舆论漩涡之中，如何应对质疑与压力成为最大的考验。',
};

export const TRIGGER_TYPE_NAMES: Record<TriggerType, string> = {
  match_result: '比赛结果',
  training: '训练事件',
  contract: '合同事件',
  transfer: '转会事件',
  achievement: '成就达成',
  relationship: '关系变化',
  time: '时间触发',
  random: '随机触发',
};

export const STORYLINE_TEMPLATES: Record<StorylineType, {
  titleTemplate: string;
  chapterTemplates: Partial<StoryChapter>[];
}> = {
  'rookie-rise': {
    titleTemplate: '{playerName}的崛起之路',
    chapterTemplates: [
      {
        number: 1,
        title: '初露锋芒',
        description: '作为新人，第一次在重要比赛中展现自己的实力。',
        trigger: { type: 'match_result', conditions: { matchWins: 1 }, probability: 0.8 },
      },
      {
        number: 2,
        title: '成长烦恼',
        description: '随着名气增长，压力也随之而来。',
        trigger: { type: 'time', conditions: { daysInClub: 30 }, probability: 0.6 },
      },
      {
        number: 3,
        title: '证明自己',
        description: '面对质疑，需要用实力回应。',
        trigger: { type: 'match_result', conditions: { matchWins: 5 }, probability: 0.7 },
      },
      {
        number: 4,
        title: '新星闪耀',
        description: '成为队伍的核心力量，承担更多责任。',
        trigger: { type: 'achievement', conditions: {}, probability: 0.5 },
      },
    ],
  },
  'veteran-twilight': {
    titleTemplate: '{playerName}的最后一舞',
    chapterTemplates: [
      {
        number: 1,
        title: '岁月不饶人',
        description: '年龄带来的身体机能下降开始显现。',
        trigger: { type: 'time', conditions: { age: 28 }, probability: 0.7 },
      },
      {
        number: 2,
        title: '传承之路',
        description: '将经验传授给年轻队员。',
        trigger: { type: 'relationship', conditions: {}, probability: 0.6 },
      },
      {
        number: 3,
        title: '最后的机会',
        description: '职业生涯末期的关键比赛。',
        trigger: { type: 'match_result', conditions: {}, probability: 0.5 },
      },
      {
        number: 4,
        title: '完美谢幕',
        description: '以最好的方式结束职业生涯。',
        trigger: { type: 'achievement', conditions: {}, probability: 0.4 },
      },
    ],
  },
  'comeback': {
    titleTemplate: '{playerName}的归来',
    chapterTemplates: [
      {
        number: 1,
        title: '跌入谷底',
        description: '经历重大挫折后的至暗时刻。',
        trigger: { type: 'match_result', conditions: { matchLosses: 3 }, probability: 0.6 },
      },
      {
        number: 2,
        title: '重拾信心',
        description: '在低谷中找到重新站起来的力量。',
        trigger: { type: 'training', conditions: { morale: 30 }, probability: 0.5 },
      },
      {
        number: 3,
        title: '浴火重生',
        description: '状态逐渐回升，展现复苏迹象。',
        trigger: { type: 'match_result', conditions: { matchWins: 2 }, probability: 0.6 },
      },
      {
        number: 4,
        title: '王者归来',
        description: '重返巅峰，证明自己依然是最强的。',
        trigger: { type: 'achievement', conditions: {}, probability: 0.4 },
      },
    ],
  },
  'transfer-saga': {
    titleTemplate: '{playerName}的转会风波',
    chapterTemplates: [
      {
        number: 1,
        title: '转会传闻',
        description: '关于转会的流言开始传播。',
        trigger: { type: 'contract', conditions: { contractMonthsLeft: 6 }, probability: 0.5 },
      },
      {
        number: 2,
        title: '各方角力',
        description: '俱乐部、经纪人、球员之间的博弈。',
        trigger: { type: 'transfer', conditions: {}, probability: 0.6 },
      },
      {
        number: 3,
        title: '艰难抉择',
        description: '面临职业生涯的重要决定。',
        trigger: { type: 'time', conditions: {}, probability: 0.7 },
      },
      {
        number: 4,
        title: '尘埃落定',
        description: '转会风波最终有了结果。',
        trigger: { type: 'transfer', conditions: {}, probability: 0.5 },
      },
    ],
  },
  'controversy': {
    titleTemplate: '{playerName}的争议时刻',
    chapterTemplates: [
      {
        number: 1,
        title: '风波初起',
        description: '一场意外引发了外界的质疑。',
        trigger: { type: 'random', conditions: {}, probability: 0.3 },
      },
      {
        number: 2,
        title: '舆论漩涡',
        description: '面对铺天盖地的批评与质疑。',
        trigger: { type: 'time', conditions: {}, probability: 0.6 },
      },
      {
        number: 3,
        title: '正面回应',
        description: '选择如何面对这些争议。',
        trigger: { type: 'match_result', conditions: {}, probability: 0.5 },
      },
      {
        number: 4,
        title: '化解危机',
        description: '通过行动重新赢得信任。',
        trigger: { type: 'achievement', conditions: {}, probability: 0.4 },
      },
    ],
  },
};

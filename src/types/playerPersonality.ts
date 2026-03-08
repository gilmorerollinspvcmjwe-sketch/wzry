export type EmotionType = 'happy' | 'sad' | 'angry' | 'anxious' | 'neutral';

export type DemandType = 'playing_time' | 'salary' | 'transfer' | 'teammate' | 'facility';

export type DemandUrgency = 'low' | 'medium' | 'high' | 'critical';

export type DialogueContext = 'greeting' | 'happy' | 'sad' | 'angry' | 'anxious' | 'training_request' | 'match_feedback' | 'demand' | 'contract' | 'transfer';

export interface PlayerEmotion {
  type: EmotionType;
  value: number;
  reason: string;
  duration: number;
  startedAt: Date;
}

export interface PlayerDemand {
  id: string;
  type: DemandType;
  urgency: DemandUrgency;
  description: string;
  deadline: Date;
  satisfied: boolean;
  consequences: {
    morale: number;
    relationship: number;
    performance: number;
  };
  createdAt: Date;
}

export interface DialogueStyle {
  greeting: string[];
  happy: string[];
  sad: string[];
  angry: string[];
  anxious: string[];
  trainingRequest: string[];
  matchFeedback: string[];
  demand: string[];
  contract: string[];
  transfer: string[];
}

export interface PersonalityTrait {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface PlayerRelationshipRef {
  playerId: string;
  type: 'friend' | 'rival' | 'mentor' | 'student' | 'neutral' | 'hostile';
  strength: number;
}

export interface PlayerPersonalityEnhanced {
  playerId: string;
  dialogueStyle: DialogueStyle;
  currentDemands: PlayerDemand[];
  emotion: PlayerEmotion;
  relationships: PlayerRelationshipRef[];
  traits: PersonalityTrait;
  communicationStyle: 'direct' | 'indirect' | 'formal' | 'casual';
  ambitionLevel: number;
  loyaltyLevel: number;
  stressThreshold: number;
  lastDialogueAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DialogueMessage {
  id: string;
  playerId: string;
  context: DialogueContext;
  message: string;
  emotion: EmotionType;
  timestamp: Date;
  response?: string;
}

export interface EmotionEvent {
  type: 'match_win' | 'match_loss' | 'training' | 'contract' | 'transfer' | 'teammate' | 'facility' | 'recognition' | 'conflict' | 'achievement';
  impact: number;
  description: string;
}

export const EMOTION_TYPE_NAMES: Record<EmotionType, string> = {
  happy: '开心',
  sad: '沮丧',
  angry: '愤怒',
  anxious: '焦虑',
  neutral: '平静',
};

export const DEMAND_TYPE_NAMES: Record<DemandType, string> = {
  playing_time: '出场时间',
  salary: '薪资待遇',
  transfer: '转会请求',
  teammate: '队友问题',
  facility: '设施条件',
};

export const DEMAND_URGENCY_NAMES: Record<DemandUrgency, string> = {
  low: '低',
  medium: '中',
  high: '高',
  critical: '紧急',
};

export const COMMUNICATION_STYLE_NAMES: Record<string, string> = {
  direct: '直接',
  indirect: '委婉',
  formal: '正式',
  casual: '随意',
};

export const EMOTION_VALUE_RANGE = {
  min: -100,
  max: 100,
  neutral: 0,
} as const;

export const DEMAND_DEADLINE_DAYS: Record<DemandUrgency, number> = {
  low: 30,
  medium: 14,
  high: 7,
  critical: 3,
};

export const DEFAULT_DIALOGUE_STYLES: Record<string, DialogueStyle> = {
  default: {
    greeting: [
      '教练好！今天有什么安排吗？',
      '教练，我准备好了！',
      '今天状态不错，随时可以开始训练！',
    ],
    happy: [
      '太棒了！我就知道我们能行！',
      '这种感觉很棒，希望能一直保持！',
      '感谢教练的信任，我会继续努力！',
    ],
    sad: [
      '唉...最近状态不太好...',
      '我需要一些时间调整...',
      '希望能有机会证明自己...',
    ],
    angry: [
      '我不满意这个决定！',
      '这太不公平了！',
      '我需要和教练谈谈！',
    ],
    anxious: [
      '教练，我有点担心...',
      '不知道接下来会怎样...',
      '希望能得到更多机会...',
    ],
    trainingRequest: [
      '教练，我想加强一下操作训练。',
      '希望能多练练团队配合。',
      '最近感觉意识方面还需要提升。',
    ],
    matchFeedback: [
      '这场比赛我们配合得不错！',
      '有些地方还需要改进...',
      '下次一定能打得更好！',
    ],
    demand: [
      '教练，我有件事想和您谈谈...',
      '有些问题一直困扰着我...',
      '希望俱乐部能考虑一下我的想法...',
    ],
    contract: [
      '关于合同的事，我想谈谈...',
      '希望能得到更好的待遇...',
      '我对未来有些想法...',
    ],
    transfer: [
      '我在考虑未来的方向...',
      '有些机会需要认真考虑...',
      '希望能在更适合的地方发展...',
    ],
  },
  aggressive: {
    greeting: [
      '来了！今天练什么？',
      '准备好了，直接开始吧！',
      '等不及要上场了！',
    ],
    happy: [
      '哈！我就知道！',
      '这才是我想要的！',
      '继续保持，目标冠军！',
    ],
    sad: [
      '切，运气不好而已...',
      '下次一定赢回来！',
      '不甘心...',
    ],
    angry: [
      '开什么玩笑！',
      '这绝对有问题！',
      '我不服！',
    ],
    anxious: [
      '啧，有点麻烦...',
      '得想个办法...',
      '不能就这样...',
    ],
    trainingRequest: [
      '我要练得更强！',
      '给我加练！',
      '我要成为最强！',
    ],
    matchFeedback: [
      '赢得漂亮！',
      '输了下次赢回来！',
      '没什么能阻挡我们！',
    ],
    demand: [
      '我有要求！',
      '这事儿必须解决！',
      '别让我失望！',
    ],
    contract: [
      '我要更好的条件！',
      '这合同不够！',
      '给我应得的待遇！',
    ],
    transfer: [
      '我要去更强的队伍！',
      '这里限制了我的发展！',
      '给我自由！',
    ],
  },
  calm: {
    greeting: [
      '教练好，今天安排是什么？',
      '准备好了，请指示。',
      '随时待命。',
    ],
    happy: [
      '不错的结果。',
      '按计划进行。',
      '符合预期。',
    ],
    sad: [
      '需要反思一下...',
      '下次注意。',
      '继续努力。',
    ],
    angry: [
      '这个决定需要重新考虑。',
      '我持保留意见。',
      '希望能沟通一下。',
    ],
    anxious: [
      '有些不确定因素...',
      '需要更多信息。',
      '谨慎处理比较好。',
    ],
    trainingRequest: [
      '建议加强这方面训练。',
      '有提升空间。',
      '需要针对性练习。',
    ],
    matchFeedback: [
      '整体表现稳定。',
      '有进步空间。',
      '按战术执行。',
    ],
    demand: [
      '有些想法想和教练沟通。',
      '希望能考虑我的建议。',
      '有个提议。',
    ],
    contract: [
      '关于合同条款...',
      '有些细节需要讨论。',
      '希望能达成共识。',
    ],
    transfer: [
      '在考虑未来的规划。',
      '需要评估一下。',
      '有些想法需要时间考虑。',
    ],
  },
};

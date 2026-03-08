// 媒体类型
export const MediaOutletType = {
  ESPORTS_MEDIA: 'esports_media',       // 电竞媒体
  MAINSTREAM_MEDIA: 'mainstream_media',  // 主流媒体
  FAN_COMMUNITY: 'fan_community',        // 粉丝社区
} as const;

export type MediaOutletType = typeof MediaOutletType[keyof typeof MediaOutletType];

// 媒体机构
export interface MediaOutlet {
  id: string;
  name: string;
  type: MediaOutletType;
  influence: number;  // 影响力 1-10
  relation: number;   // 关系 -100 到 100
}

// 采访类型
export const InterviewType = {
  POST_MATCH: 'post_match',      // 赛后采访
  PRE_PLAYOFF: 'pre_playoff',    // 季后赛前采访
  TRANSFER: 'transfer',          // 转会采访
  SCANDAL: 'scandal',            // 丑闻采访
  RANDOM: 'random',              // 随机采访
} as const;

export type InterviewType = typeof InterviewType[keyof typeof InterviewType];

// 采访语气
export const InterviewTone = {
  CONFIDENT: 'confident',    // 自信
  HUMBLE: 'humble',          // 谦虚
  AGGRESSIVE: 'aggressive',  // 激进
  DIPLOMATIC: 'diplomatic',  // 外交
} as const;

export type InterviewTone = typeof InterviewTone[keyof typeof InterviewTone];

// 采访选项
export interface InterviewOption {
  id: string;
  text: string;
  tone: InterviewTone;
  consequences: {
    fanChange: number;
    reputationChange: number;
    playerMoraleChange: number;
    mediaRelationChange: number;
  };
}

// 采访问题
export interface InterviewQuestion {
  id: string;
  question: string;
  options: InterviewOption[];
}

// 采访影响
export interface InterviewImpact {
  fanChange: number;
  reputationChange: number;
  playerMoraleChange: number;
  mediaRelations: {
    mediaId: string;
    relationChange: number;
  }[];
}

// 采访
export interface Interview {
  id: string;
  type: InterviewType;
  media: MediaOutlet;
  questions: InterviewQuestion[];
  impact: InterviewImpact;
  createdAt: Date;
  deadline: Date;  // 截止时间
  status: 'pending' | 'completed' | 'expired';
  selectedAnswers?: {
    questionId: string;
    optionId: string;
  }[];
}

// 社交媒体帖子类型
export const SocialPostType = {
  MATCH_RESULT: 'match_result',       // 比赛结果
  PLAYER_HIGHLIGHT: 'player_highlight', // 选手高光
  ANNOUNCEMENT: 'announcement',       // 官方公告
  INTERACTION: 'interaction',         // 粉丝互动
  TRAINING: 'training',               // 训练日常
  TRANSFER: 'transfer',               // 转会官宣
} as const;

export type SocialPostType = typeof SocialPostType[keyof typeof SocialPostType];

// 社交媒体情感
export const SocialSentiment = {
  POSITIVE: 'positive',
  NEUTRAL: 'neutral',
  NEGATIVE: 'negative',
} as const;

export type SocialSentiment = typeof SocialSentiment[keyof typeof SocialSentiment];

// 社交媒体帖子
export interface SocialPost {
  id: string;
  content: string;
  type: SocialPostType;
  likes: number;
  comments: number;
  shares: number;
  sentiment: SocialSentiment;
  createdAt: Date;
  isHot: boolean;  // 是否上热搜
}

// 微博状态
export interface WeiboState {
  followers: number;      // 粉丝数
  posts: SocialPost[];    // 帖子
  isTrending: boolean;    // 是否上热搜
  trendingTopic?: string; // 热搜话题
  sentiment: SocialSentiment;
}

// 直播平台状态
export interface StreamingState {
  viewers: number;        // 观看人数
  subscribers: number;    // 订阅数
  revenue: number;        // 直播收入
}

// 社交媒体状态
export interface SocialMediaState {
  weibo: WeiboState;
  streaming: StreamingState;
}

// 媒体关系状态
export interface MediaRelationsState {
  outlets: MediaOutlet[];
  averageRelation: number;
  recentNews: MediaNews[];
}

// 媒体新闻
export interface MediaNews {
  id: string;
  title: string;
  content: string;
  mediaId: string;
  sentiment: SocialSentiment;
  impact: {
    fanChange?: number;
    reputationChange?: number;
  };
  createdAt: Date;
}

// 媒体中心完整状态
export interface MediaCenterState {
  mediaRelations: MediaRelationsState;
  socialMedia: SocialMediaState;
  pendingInterviews: Interview[];
  completedInterviews: Interview[];
}

// 采访配置
export interface InterviewConfig {
  postMatchTriggerChance: number;    // 赛后采访触发概率
  importantMatchMultiplier: number;  // 重要比赛倍率
  minDaysBetweenInterviews: number;  // 最小采访间隔
}

// 默认配置
export const DEFAULT_INTERVIEW_CONFIG: InterviewConfig = {
  postMatchTriggerChance: 0.3,
  importantMatchMultiplier: 2.0,
  minDaysBetweenInterviews: 3,
};

// 社交媒体配置
export interface SocialMediaConfig {
  baseFollowerGrowth: number;     // 基础粉丝增长
  winBonusMultiplier: number;     // 胜利奖励倍率
  hotTopicDuration: number;       // 热搜持续时间（天）
}

export const DEFAULT_SOCIAL_MEDIA_CONFIG: SocialMediaConfig = {
  baseFollowerGrowth: 100,
  winBonusMultiplier: 1.5,
  hotTopicDuration: 1,
};

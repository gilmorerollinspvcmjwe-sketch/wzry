export const FanSegmentType = {
  CORE: 'core',
  ACTIVE: 'active',
  REGULAR: 'regular',
  CASUAL: 'casual',
} as const;

export type FanSegmentType = typeof FanSegmentType[keyof typeof FanSegmentType];

export interface FanSegment {
  type: FanSegmentType;
  count: number;
  percentage: number;
  engagement: number;
  spending: number;
  loyalty: number;
}

export const ActivityType = {
  FAN_MEETING: 'fan_meeting',
  ONLINE_EVENT: 'online_event',
  WATCH_PARTY: 'watch_party',
  CHARITY: 'charity',
  MERCHANDISE: 'merchandise',
  TRAINING_OPEN: 'training_open',
} as const;

export type ActivityType = typeof ActivityType[keyof typeof ActivityType];

export interface FanActivity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  scheduledAt: Date;
  duration: number;
  capacity: number;
  participants: number;
  cost: number;
  rewards: ActivityReward;
  status: 'planning' | 'ongoing' | 'completed' | 'cancelled';
  sentiment: number;
}

export interface ActivityReward {
  loyalty: number;
  engagement: number;
  fans: number;
  reputation: number;
}

export const FeedbackType = {
  SUGGESTION: 'suggestion',
  COMPLAINT: 'complaint',
  PRAISE: 'praise',
  QUESTION: 'question',
} as const;

export type FeedbackType = typeof FeedbackType[keyof typeof FeedbackType];

export const FeedbackPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export type FeedbackPriority = typeof FeedbackPriority[keyof typeof FeedbackPriority];

export interface FanFeedback {
  id: string;
  type: FeedbackType;
  priority: FeedbackPriority;
  content: string;
  source: 'social_media' | 'official_forum' | 'event' | 'survey';
  sentiment: number;
  likes: number;
  createdAt: Date;
  status: 'pending' | 'reviewed' | 'addressed' | 'ignored';
  response?: string;
}

export interface CommunityCulture {
  values: string[];
  traditions: string[];
  slogans: string[];
  symbols: string[];
  history: CultureMilestone[];
}

export interface CultureMilestone {
  date: Date;
  event: string;
  significance: string;
}

export const SentimentTrend = {
  RISING: 'rising',
  STABLE: 'stable',
  FALLING: 'falling',
} as const;

export type SentimentTrend = typeof SentimentTrend[keyof typeof SentimentTrend];

export interface SentimentAnalysis {
  overall: number;
  trend: SentimentTrend;
  breakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  hotTopics: HotTopic[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: Date;
}

export interface HotTopic {
  topic: string;
  mentions: number;
  sentiment: number;
  trend: SentimentTrend;
}

export interface FanCommunity {
  clubId: string;
  segments: FanSegment[];
  activities: FanActivity[];
  feedback: FanFeedback[];
  culture: CommunityCulture;
  sentimentAnalysis: SentimentAnalysis;
  totalMembers: number;
  activeRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export const CrisisType = {
  PLAYER_SCANDAL: 'player_scandal',
  MANAGEMENT_ISSUE: 'management_issue',
  PERFORMANCE_CRISIS: 'performance_crisis',
  FAN_CONFLICT: 'fan_conflict',
  MEDIA_SCANDAL: 'media_scandal',
  FINANCIAL_ISSUE: 'financial_issue',
} as const;

export type CrisisType = typeof CrisisType[keyof typeof CrisisType];

export const CrisisSeverity = {
  MINOR: 'minor',
  MODERATE: 'moderate',
  MAJOR: 'major',
  SEVERE: 'severe',
} as const;

export type CrisisSeverity = typeof CrisisSeverity[keyof typeof CrisisSeverity];

export interface Crisis {
  id: string;
  type: CrisisType;
  severity: CrisisSeverity;
  title: string;
  description: string;
  impact: CrisisImpact;
  detectedAt: Date;
  status: 'detected' | 'analyzing' | 'handling' | 'resolved' | 'escalated';
  mediaAttention: number;
  fanReaction: number;
}

export interface CrisisImpact {
  reputation: number;
  fans: number;
  revenue: number;
  morale: number;
  sponsorTrust: number;
}

export const StrategyType = {
  APOLOGY: 'apology',
  EXPLANATION: 'explanation',
  ACTION: 'action',
  DEFLECTION: 'deflection',
  SILENCE: 'silence',
} as const;

export type StrategyType = typeof StrategyType[keyof typeof StrategyType];

export interface CrisisStrategy {
  id: string;
  type: StrategyType;
  title: string;
  description: string;
  actions: CrisisAction[];
  estimatedRecovery: number;
  cost: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface CrisisAction {
  id: string;
  description: string;
  timeline: string;
  responsible: string;
  cost: number;
  expectedImpact: number;
}

export interface CrisisManagement {
  crisis: Crisis | null;
  availableStrategies: CrisisStrategy[];
  selectedStrategy: CrisisStrategy | null;
  handlingProgress: number;
  history: CrisisRecord[];
}

export interface CrisisRecord {
  id: string;
  crisis: Crisis;
  strategy: CrisisStrategy;
  outcome: 'success' | 'partial' | 'failure';
  actualRecovery: number;
  lessonsLearned: string[];
  resolvedAt: Date;
}

export interface FanCommunityStats {
  totalMembers: number;
  growthRate: number;
  engagementRate: number;
  satisfactionScore: number;
  activeEvents: number;
  pendingFeedback: number;
  crisisRisk: 'low' | 'medium' | 'high' | 'critical';
}

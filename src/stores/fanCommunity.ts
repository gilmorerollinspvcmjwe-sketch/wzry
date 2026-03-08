import { defineStore } from 'pinia';
import { fanCommunityService } from '@/core/services/fanCommunityService';
import type {
  FanCommunity,
  FanSegment,
  FanActivity,
  FanFeedback,
  SentimentAnalysis,
  CrisisManagement,
  Crisis,
  CrisisStrategy,
  FanCommunityStats,
  ActivityType,
  FeedbackType,
  CrisisType,
  CrisisSeverity,
} from '@/types/fanCommunity';

interface FanCommunityState {
  initialized: boolean;
  clubId: string | null;
  community: FanCommunity | null;
  crisisManagement: CrisisManagement | null;
}

export const useFanCommunityStore = defineStore('fanCommunity', {
  state: (): FanCommunityState => ({
    initialized: false,
    clubId: null,
    community: null,
    crisisManagement: null,
  }),

  getters: {
    segments: (state): FanSegment[] => state.community?.segments || [],
    activities: (state): FanActivity[] => state.community?.activities || [],
    feedback: (state): FanFeedback[] => state.community?.feedback || [],
    sentimentAnalysis: (state): SentimentAnalysis | null => state.community?.sentimentAnalysis || null,
    culture: (state) => state.community?.culture || null,
    totalMembers: (state): number => state.community?.totalMembers || 0,
    activeRate: (state): number => state.community?.activeRate || 0,

    coreFans: (state): FanSegment | undefined => state.community?.segments.find(s => s.type === 'core'),
    activeFans: (state): FanSegment | undefined => state.community?.segments.find(s => s.type === 'active'),
    regularFans: (state): FanSegment | undefined => state.community?.segments.find(s => s.type === 'regular'),
    casualFans: (state): FanSegment | undefined => state.community?.segments.find(s => s.type === 'casual'),

    currentCrisis: (state): Crisis | null => state.crisisManagement?.crisis || null,
    availableStrategies: (state): CrisisStrategy[] => state.crisisManagement?.availableStrategies || [],
    selectedStrategy: (state): CrisisStrategy | null => state.crisisManagement?.selectedStrategy || null,
    handlingProgress: (state): number => state.crisisManagement?.handlingProgress || 0,
    crisisHistory: (state) => state.crisisManagement?.history || [],

    pendingFeedback: (state): FanFeedback[] => state.community?.feedback.filter(f => f.status === 'pending') || [],
    urgentFeedback: (state): FanFeedback[] => state.community?.feedback.filter(f => f.priority === 'urgent' || f.priority === 'high') || [],

    upcomingActivities: (state): FanActivity[] => {
      const now = new Date();
      return state.community?.activities.filter(a => a.status === 'planning' && new Date(a.scheduledAt) > now) || [];
    },
    ongoingActivities: (state): FanActivity[] => state.community?.activities.filter(a => a.status === 'ongoing') || [],
    completedActivities: (state): FanActivity[] => state.community?.activities.filter(a => a.status === 'completed') || [],

    sentimentRiskLevel: (state): 'low' | 'medium' | 'high' | 'critical' => state.community?.sentimentAnalysis?.riskLevel || 'low',
    sentimentTrend: (state) => state.community?.sentimentAnalysis?.trend || 'stable',
    overallSentiment: (state): number => state.community?.sentimentAnalysis?.overall || 50,

    stats: (state): FanCommunityStats | null => {
      if (!state.community || !state.clubId) return null;
      return fanCommunityService.getStats(state.clubId);
    },
  },

  actions: {
    initialize(clubId: string, initialFans: number = 10000) {
      if (this.initialized && this.clubId === clubId) return;

      this.community = fanCommunityService.initializeFanCommunity(clubId, initialFans);
      this.crisisManagement = fanCommunityService.getCrisisManagement(clubId) || null;
      this.clubId = clubId;
      this.initialized = true;
    },

    updateSegments(factors?: {
      matchResults?: { wins: number; losses: number };
      activities?: number;
      reputation?: number;
    }) {
      if (!this.clubId) return;
      const segments = fanCommunityService.updateFanSegments(this.clubId, factors);
      if (segments && this.community) {
        this.community.segments = segments;
      }
    },

    addActivity(activityData: {
      type: ActivityType;
      title: string;
      description: string;
      scheduledAt: Date;
      duration: number;
      capacity: number;
      cost: number;
    }): FanActivity | null {
      if (!this.clubId) return null;
      const activity = fanCommunityService.addActivity(this.clubId, activityData);
      if (activity && this.community) {
        this.community.activities = [...this.community.activities];
      }
      return activity;
    },

    updateActivityStatus(activityId: string, status: FanActivity['status']) {
      if (!this.clubId) return;
      const activity = fanCommunityService.updateActivityStatus(this.clubId, activityId, status);
      if (activity && this.community) {
        const index = this.community.activities.findIndex(a => a.id === activityId);
        if (index !== -1) {
          this.community.activities[index] = activity;
        }
      }
      return activity;
    },

    collectFeedback(feedbackData: {
      type: FeedbackType;
      content: string;
      source: FanFeedback['source'];
      sentiment: number;
    }): FanFeedback | null {
      if (!this.clubId) return null;
      const feedback = fanCommunityService.collectFeedback(this.clubId, feedbackData);
      if (feedback && this.community) {
        this.community.feedback = [...this.community.feedback];
      }
      return feedback;
    },

    respondToFeedback(feedbackId: string, response: string) {
      if (!this.clubId) return;
      const feedback = fanCommunityService.respondToFeedback(this.clubId, feedbackId, response);
      if (feedback && this.community) {
        const index = this.community.feedback.findIndex(f => f.id === feedbackId);
        if (index !== -1) {
          this.community.feedback[index] = feedback;
        }
      }
      return feedback;
    },

    calculateSentiment() {
      if (!this.clubId) return;
      const analysis = fanCommunityService.calculateSentiment(this.clubId);
      if (analysis && this.community) {
        this.community.sentimentAnalysis = analysis;
      }
      return analysis;
    },

    handleCrisis(crisisData: {
      type: CrisisType;
      severity: CrisisSeverity;
      title: string;
      description: string;
    }): Crisis | null {
      if (!this.clubId) return null;
      const crisis = fanCommunityService.handleCrisis(this.clubId, crisisData);
      this.crisisManagement = fanCommunityService.getCrisisManagement(this.clubId) || null;
      if (crisis && this.community) {
        this.community.sentimentAnalysis.riskLevel = this.community.sentimentAnalysis.riskLevel;
      }
      return crisis;
    },

    selectCrisisStrategy(strategyId: string) {
      if (!this.clubId) return;
      const strategy = fanCommunityService.selectCrisisStrategy(this.clubId, strategyId);
      this.crisisManagement = fanCommunityService.getCrisisManagement(this.clubId) || null;
      return strategy;
    },

    progressCrisisHandling(progress: number) {
      if (!this.clubId) return;
      const crisis = fanCommunityService.progressCrisisHandling(this.clubId, progress);
      this.crisisManagement = fanCommunityService.getCrisisManagement(this.clubId) || null;
      return crisis;
    },

    simulateFeedback(count: number = 10) {
      if (!this.clubId) return;
      const feedbacks = fanCommunityService.simulateFeedback(this.clubId, count);
      this.community = fanCommunityService.getFanCommunity(this.clubId) || null;
      return feedbacks;
    },

    refreshCommunity() {
      if (!this.clubId) return;
      this.community = fanCommunityService.getFanCommunity(this.clubId) || null;
      this.crisisManagement = fanCommunityService.getCrisisManagement(this.clubId) || null;
    },

    reset() {
      this.initialized = false;
      this.clubId = null;
      this.community = null;
      this.crisisManagement = null;
    },
  },

  persist: true,
});

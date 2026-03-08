import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  Interview,
  MediaOutlet,
  SocialPost,
  MediaNews,
  SocialMediaState,
  MediaRelationsState,
} from '@/types/media';
import { interviewSystem } from '@/core/services/interviewSystem';
import { socialMediaSystem } from '@/core/services/socialMediaSystem';
import { mediaRelationsSystem } from '@/core/services/mediaRelationsSystem';
import type { InterviewImpact } from '@/types/media';

export const useMediaStore = defineStore('media', () => {
  // State
  const pendingInterviews = ref<Interview[]>([]);
  const completedInterviews = ref<Interview[]>([]);
  const socialMediaState = ref<SocialMediaState | null>(null);
  const mediaRelationsState = ref<MediaRelationsState | null>(null);

  // Getters - Interviews
  const hasPendingInterviews = computed(() => pendingInterviews.value.length > 0);
  const pendingInterviewsCount = computed(() => pendingInterviews.value.length);
  const completedInterviewsCount = computed(() => completedInterviews.value.length);

  // Getters - Social Media
  const followers = computed(() => socialMediaState.value?.weibo.followers || 0);
  const isTrending = computed(() => socialMediaState.value?.weibo.isTrending || false);
  const trendingTopic = computed(() => socialMediaState.value?.weibo.trendingTopic);
  const recentPosts = computed(() => socialMediaState.value?.weibo.posts.slice(0, 10) || []);

  // Getters - Media Relations
  const averageRelation = computed(() => mediaRelationsState.value?.averageRelation || 0);
  const mediaOutlets = computed(() => mediaRelationsState.value?.outlets || []);
  const recentNews = computed(() => mediaRelationsState.value?.recentNews || []);
  const hasHostileMedia = computed(() => {
    return mediaRelationsState.value?.outlets.some(m => m.relation < -50) || false;
  });

  // Actions - Initialization
  function initialize(): void {
    socialMediaState.value = socialMediaSystem.getState();
    mediaRelationsState.value = mediaRelationsSystem.getState();
    loadInterviews();
  }

  // Actions - Interviews
  function loadInterviews(): void {
    pendingInterviews.value = interviewSystem.getPendingInterviews();
    completedInterviews.value = interviewSystem.getCompletedInterviews();
  }

  function answerInterview(interviewId: string, answers: { questionId: string; optionId: string }[]): InterviewImpact | null {
    const impact = interviewSystem.answerInterview(interviewId, answers);
    
    if (impact) {
      loadInterviews();
      
      // 应用影响
      applyInterviewImpact(impact);
    }
    
    return impact;
  }

  function declineInterview(interviewId: string): void {
    interviewSystem.declineInterview(interviewId);
    loadInterviews();
  }

  function applyInterviewImpact(impact: InterviewImpact): void {
    // 这里需要通过 clubStore 来应用影响
    // 实际使用时需要传入 clubStore 或通过事件系统处理
    console.log('Interview impact:', impact);
  }

  function clearExpiredInterviews(currentDay: number): void {
    interviewSystem.clearExpiredInterviews(currentDay);
    loadInterviews();
  }

  // Actions - Social Media
  function updateSocialMedia(): void {
    socialMediaState.value = socialMediaSystem.getState();
  }

  function postMatchResult(won: boolean, opponent: string, score: string): SocialPost {
    const post = socialMediaSystem.postMatchResult(won, opponent, score);
    updateSocialMedia();
    return post;
  }

  function postPlayerHighlight(playerName: string, achievement: string): SocialPost {
    const post = socialMediaSystem.postPlayerHighlight(playerName, achievement);
    updateSocialMedia();
    return post;
  }

  function postAnnouncement(title: string, content: string): SocialPost {
    const post = socialMediaSystem.postAnnouncement(title, content);
    updateSocialMedia();
    return post;
  }

  function postTransfer(playerName: string, isSigning: boolean, fromClub?: string): SocialPost {
    const post = socialMediaSystem.postTransfer(playerName, isSigning, fromClub);
    updateSocialMedia();
    return post;
  }

  function getPosts(limit: number = 10): SocialPost[] {
    return socialMediaSystem.getPosts(limit);
  }

  // Actions - Media Relations
  function updateMediaRelations(): void {
    mediaRelationsState.value = mediaRelationsSystem.getState();
  }

  function updateMediaRelation(mediaId: string, change: number): void {
    mediaRelationsSystem.updateRelation(mediaId, change);
    updateMediaRelations();
  }

  function publishNews(
    title: string,
    content: string,
    mediaId: string,
    sentiment: 'positive' | 'neutral' | 'negative',
    impact?: { fanChange?: number; reputationChange?: number }
  ): MediaNews {
    const news = mediaRelationsSystem.publishNews(title, content, mediaId, sentiment, impact);
    updateMediaRelations();
    return news;
  }

  function generateNewsFromPerformance(
    won: boolean,
    isImportant: boolean,
    ranking: number,
    day: number
  ): void {
    mediaRelationsSystem.generateNewsFromPerformance(won, isImportant, ranking, day);
    updateMediaRelations();
  }

  function publishTransferNews(playerName: string, isSigning: boolean, clubName?: string): void {
    mediaRelationsSystem.publishTransferNews(playerName, isSigning, clubName);
    updateMediaRelations();
  }

  function getNewsFeed(limit: number = 10): MediaNews[] {
    return mediaRelationsSystem.getNewsFeed(limit);
  }

  // Actions - Weekly Update
  function onWeekAdvance(): void {
    socialMediaSystem.onWeekAdvance();
    mediaRelationsSystem.onWeekAdvance();
    updateSocialMedia();
    updateMediaRelations();
  }

  // Actions - Reset
  function reset(): void {
    interviewSystem.reset();
    socialMediaSystem.reset();
    mediaRelationsSystem.reset();
    
    pendingInterviews.value = [];
    completedInterviews.value = [];
    socialMediaState.value = null;
    mediaRelationsState.value = null;
  }

  return {
    // State
    pendingInterviews,
    completedInterviews,
    socialMediaState,
    mediaRelationsState,

    // Getters - Interviews
    hasPendingInterviews,
    pendingInterviewsCount,
    completedInterviewsCount,

    // Getters - Social Media
    followers,
    isTrending,
    trendingTopic,
    recentPosts,

    // Getters - Media Relations
    averageRelation,
    mediaOutlets,
    recentNews,
    hasHostileMedia,

    // Actions
    initialize,
    loadInterviews,
    answerInterview,
    declineInterview,
    clearExpiredInterviews,
    updateSocialMedia,
    postMatchResult,
    postPlayerHighlight,
    postAnnouncement,
    postTransfer,
    getPosts,
    updateMediaRelations,
    updateMediaRelation,
    publishNews,
    generateNewsFromPerformance,
    publishTransferNews,
    getNewsFeed,
    onWeekAdvance,
    reset,
  };
}, {
  persist: true,
});

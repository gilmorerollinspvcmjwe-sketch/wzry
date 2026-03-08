import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { socialMediaSystem, type WeiboPost, type StreamingState, type WeiboState } from '@/backend/socialMediaSystem';

export const useSocialStore = defineStore('social', () => {
  const weiboPosts = ref<WeiboPost[]>([]);
  const weiboState = ref<WeiboState | null>(null);
  const streamingState = ref<StreamingState | null>(null);
  const hotTopics = ref<string[]>([]);

  const followers = computed(() => weiboState.value?.followers || 0);
  const followersGrowth = computed(() => weiboState.value?.followersGrowth || 0);
  const totalLikes = computed(() => weiboState.value?.totalLikes || 0);

  const isStreaming = computed(() => streamingState.value?.isStreaming || false);
  const viewerCount = computed(() => streamingState.value?.currentViewers || 0);
  const subscriberCount = computed(() => streamingState.value?.subscribers || 0);
  const streamingRevenue = computed(() => streamingState.value?.revenue || 0);

  function refreshSocialData(): void {
    weiboPosts.value = socialMediaSystem.getWeiboState().posts;
    weiboState.value = socialMediaSystem.getWeiboState();
    streamingState.value = socialMediaSystem.getStreamingState();
    hotTopics.value = socialMediaSystem.getHotTopics();
  }

  function publishMatchResult(matchResult: {
    matchId: string;
    opponent: string;
    result: 'win' | 'loss';
    score: string;
    duration: number;
    mvp?: string;
  }): void {
    socialMediaSystem.postMatchResult(
      matchResult.matchId,
      matchResult.opponent,
      matchResult.result,
      matchResult.score,
      matchResult.duration,
      matchResult.mvp
    );
    refreshSocialData();
  }

  function publishPlayerHighlight(highlight: {
    playerId: string;
    playerName: string;
    description: string;
    matchId?: string;
  }): void {
    socialMediaSystem.postPlayerHighlight(
      highlight.playerId,
      highlight.playerName,
      highlight.description,
      highlight.matchId
    );
    refreshSocialData();
  }

  function publishTransfer(transfer: {
    playerId: string;
    playerName: string;
    fromClub: string;
    toClub: string;
    fee: number;
  }): void {
    socialMediaSystem.postTransfer(
      transfer.playerId,
      transfer.playerName,
      transfer.fromClub,
      transfer.toClub,
      transfer.fee
    );
    refreshSocialData();
  }

  return {
    weiboPosts,
    weiboState,
    streamingState,
    hotTopics,
    followers,
    followersGrowth,
    totalLikes,
    isStreaming,
    viewerCount,
    subscriberCount,
    streamingRevenue,
    refreshSocialData,
    publishMatchResult,
    publishPlayerHighlight,
    publishTransfer
  };
});

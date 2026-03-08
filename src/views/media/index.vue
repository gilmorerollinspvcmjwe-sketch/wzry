<template>
  <div class="media-center-page">
    <div class="page-header">
      <h1 class="page-title">媒体中心</h1>
    </div>

    <!-- Tab 切换 -->
    <div class="tab-container">
      <van-tabs v-model:active="activeTab" swipeable>
        <van-tab title="待处理采访" :badge="pendingInterviewsCount">
          <interviews-section />
        </van-tab>
        <van-tab title="社交媒体">
          <social-media-section />
        </van-tab>
        <van-tab title="媒体关系">
          <media-relations-section />
        </van-tab>
        <van-tab title="新闻资讯" :badge="newsBadge">
          <news-section />
        </van-tab>
        <van-tab title="事件中心" :badge="eventBadge">
          <events-section />
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useMediaStore } from '@/stores/media';
import { useNewsStore } from '@/stores/news';
import { useEventStore } from '@/stores/event';
import InterviewsSection from '@/components/media/InterviewsSection.vue';
import SocialMediaSection from '@/components/media/SocialMediaSection.vue';
import MediaRelationsSection from '@/components/media/MediaRelationsSection.vue';
import NewsSection from './NewsSection.vue';
import EventsSection from './EventsSection.vue';

const mediaStore = useMediaStore();
const newsStore = useNewsStore();
const eventStore = useEventStore();
const activeTab = ref(0);

onMounted(() => {
  mediaStore.initialize();
  newsStore.refreshNews();
  eventStore.refreshEvents();
});

const pendingInterviewsCount = mediaStore.pendingInterviewsCount;

const newsBadge = computed(() => {
  const stats = newsStore.newsStats;
  return stats.positive + stats.negative > 0 ? `${stats.positive + stats.negative}` : undefined;
});

const eventBadge = computed(() => {
  return eventStore.pendingEventCount > 0 ? `${eventStore.pendingEventCount}` : undefined;
});
</script>

<style scoped lang="scss">
.media-center-page {
  padding: 16px;
  padding-bottom: 80px;
}

.page-header {
  margin-bottom: 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.tab-container {
  :deep(.van-tabs__wrap) {
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  :deep(.van-tab) {
    font-size: 15px;
    font-weight: 500;
  }

  :deep(.van-tabs__line) {
    background: #3b82f6;
    height: 3px;
  }
}
</style>

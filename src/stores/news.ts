import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { mediaRelationsSystem } from '@/core/services/mediaRelationsSystem';
import type { MediaNews, MediaOutlet, NewsFilter } from '@/types/media';

/**
 * 新闻 Store
 * 封装媒体关系系统的调用，管理新闻状态
 */
export const useNewsStore = defineStore('news', () => {
  // 状态
  const newsList = ref<MediaNews[]>([]);
  const mediaOutlets = ref<MediaOutlet[]>([]);
  const isLoading = ref(false);
  const currentFilter = ref<NewsFilter>({});

  // Getters
  const sortedNews = computed(() => {
    return [...newsList.value].sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  });

  const filteredNews = computed(() => {
    let result = sortedNews.value;
    
    if (currentFilter.value.sentiment) {
      result = result.filter(n => n.sentiment === currentFilter.value.sentiment);
    }
    
    if (currentFilter.value.type) {
      result = result.filter(n => n.type === currentFilter.value.type);
    }
    
    return result;
  });

  /**
   * 刷新新闻列表
   */
  function refreshNews(): void {
    newsList.value = mediaRelationsSystem.getNewsHistory();
    mediaOutlets.value = mediaRelationsSystem.getMediaOutlets();
  }

  /**
   * 设置过滤器
   */
  function setFilter(filter: NewsFilter): void {
    currentFilter.value = filter;
  }

  /**
   * 清除过滤器
   */
  function clearFilter(): void {
    currentFilter.value = {};
  }

  /**
   * 获取媒体关系值
   */
  function getMediaRelation(mediaId: string): number {
    return mediaRelationsSystem.getMediaRelation(mediaId);
  }

  /**
   * 获取新闻统计
   */
  const newsStats = computed(() => {
    const total = newsList.value.length;
    const positive = newsList.value.filter(n => n.sentiment === 'positive').length;
    const negative = newsList.value.filter(n => n.sentiment === 'negative').length;
    const neutral = newsList.value.filter(n => n.sentiment === 'neutral').length;
    
    return { total, positive, negative, neutral };
  });

  return {
    // 状态
    newsList,
    mediaOutlets,
    isLoading,
    currentFilter,
    
    // Getters
    sortedNews,
    filteredNews,
    newsStats,
    
    // Actions
    refreshNews,
    setFilter,
    clearFilter,
    getMediaRelation,
  };
});

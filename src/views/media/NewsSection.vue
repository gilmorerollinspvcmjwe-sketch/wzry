<template>
  <div class="news-section">
    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <span class="stat-value">{{ newsStore.newsStats.total }}</span>
        <span class="stat-label">总新闻</span>
      </div>
      <div class="stat-card positive">
        <span class="stat-value">{{ newsStore.newsStats.positive }}</span>
        <span class="stat-label">正面</span>
      </div>
      <div class="stat-card negative">
        <span class="stat-value">{{ newsStore.newsStats.negative }}</span>
        <span class="stat-label">负面</span>
      </div>
      <div class="stat-card neutral">
        <span class="stat-value">{{ newsStore.newsStats.neutral }}</span>
        <span class="stat-label">中性</span>
      </div>
    </div>

    <!-- 过滤器 -->
    <div class="filter-bar">
      <button 
        class="filter-btn" 
        :class="{ active: currentFilter === 'all' }"
        @click="setFilter('all')"
      >
        全部
      </button>
      <button 
        class="filter-btn" 
        :class="{ active: currentFilter === 'positive' }"
        @click="setFilter('positive')"
      >
        正面
      </button>
      <button 
        class="filter-btn" 
        :class="{ active: currentFilter === 'negative' }"
        @click="setFilter('negative')"
      >
        负面
      </button>
    </div>

    <!-- 新闻列表 -->
    <div class="news-list">
      <div v-if="filteredNews.length === 0" class="empty-state">
        <span class="icon">📰</span>
        <p>暂无新闻</p>
        <span class="sub-text">比赛和转会等事件会生成相关新闻</span>
      </div>

      <div 
        v-for="news in filteredNews" 
        :key="news.id"
        class="news-card"
        :class="news.sentiment"
        @click="showNewsDetail(news)"
      >
        <div class="news-header">
          <span class="news-type">{{ getTypeName(news.type) }}</span>
          <span class="news-time">{{ formatTime(news.publishedAt) }}</span>
        </div>
        <h3 class="news-title">{{ news.title }}</h3>
        <p class="news-content">{{ truncateContent(news.content) }}</p>
        <div class="news-footer">
          <span class="sentiment-badge" :class="news.sentiment">
            {{ getSentimentName(news.sentiment) }}
          </span>
          <span v-if="news.impact" class="impact-hint">
            <span v-if="news.impact.fanChange" :class="{ positive: news.impact.fanChange > 0 }">
              粉丝 {{ news.impact.fanChange > 0 ? '+' : '' }}{{ news.impact.fanChange }}
            </span>
          </span>
        </div>
      </div>
    </div>

    <!-- 新闻详情弹窗 -->
    <div v-if="selectedNews" class="modal-overlay" @click="closeDetail">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <span class="modal-type">{{ getTypeName(selectedNews.type) }}</span>
          <button class="close-btn" @click="closeDetail">×</button>
        </div>
        <h3 class="modal-title">{{ selectedNews.title }}</h3>
        <p class="modal-content-text">{{ selectedNews.content }}</p>
        <div class="modal-footer">
          <span class="modal-time">{{ formatTime(selectedNews.publishedAt) }}</span>
          <span class="sentiment-badge" :class="selectedNews.sentiment">
            {{ getSentimentName(selectedNews.sentiment) }}
          </span>
        </div>
        <div v-if="selectedNews.impact" class="modal-impact">
          <h4>新闻影响</h4>
          <div class="impact-items">
            <span v-if="selectedNews.impact.fanChange" class="impact-item" :class="{ positive: selectedNews.impact.fanChange > 0 }">
              粉丝 {{ selectedNews.impact.fanChange > 0 ? '+' : '' }}{{ selectedNews.impact.fanChange }}
            </span>
            <span v-if="selectedNews.impact.reputationChange" class="impact-item" :class="{ positive: selectedNews.impact.reputationChange > 0 }">
              声望 {{ selectedNews.impact.reputationChange > 0 ? '+' : '' }}{{ selectedNews.impact.reputationChange }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useNewsStore } from '@/stores/news';
import type { MediaNews, SocialSentiment } from '@/types/media';

const newsStore = useNewsStore();

// 状态
const currentFilter = ref<'all' | 'positive' | 'negative' | 'neutral'>('all');
const selectedNews = ref<MediaNews | null>(null);

// 过滤后的新闻
const filteredNews = computed(() => {
  if (currentFilter.value === 'all') return newsStore.sortedNews;
  return newsStore.sortedNews.filter(n => n.sentiment === currentFilter.value);
});

// 设置过滤器
const setFilter = (filter: 'all' | 'positive' | 'negative' | 'neutral') => {
  currentFilter.value = filter;
};

// 获取类型名称
const getTypeName = (type: string): string => {
  const names: Record<string, string> = {
    transfer: '转会',
    match: '比赛',
    management: '经营',
    announcement: '公告',
  };
  return names[type] || type;
};

// 获取情感名称
const getSentimentName = (sentiment: SocialSentiment): string => {
  const names: Record<SocialSentiment, string> = {
    positive: '正面',
    negative: '负面',
    neutral: '中性',
    mixed: '混合',
  };
  return names[sentiment] || sentiment;
};

// 格式化时间
const formatTime = (date: Date): string => {
  const d = new Date(date);
  return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
};

// 截断内容
const truncateContent = (content: string, maxLength: number = 80): string => {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
};

// 显示新闻详情
const showNewsDetail = (news: MediaNews) => {
  selectedNews.value = news;
};

// 关闭详情
const closeDetail = () => {
  selectedNews.value = null;
};
</script>

<style scoped lang="scss">
.news-section {
  padding: 10px 0;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 15px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 12px 8px;
  text-align: center;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 11px;
  color: #999;
}

.stat-card.positive .stat-value { color: #27ae60; }
.stat-card.negative .stat-value { color: #e74c3c; }
.stat-card.neutral .stat-value { color: #95a5a6; }

/* 过滤器 */
.filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
  background: white;
  padding: 4px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.filter-btn {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-btn.active {
  background: #3b82f6;
  color: white;
  font-weight: bold;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.empty-state .icon {
  font-size: 40px;
  display: block;
  margin-bottom: 12px;
}

.empty-state p {
  color: #333;
  font-size: 15px;
  margin-bottom: 6px;
}

.empty-state .sub-text {
  color: #999;
  font-size: 13px;
}

/* 新闻列表 */
.news-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.news-card {
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: transform 0.2s;
  border-left: 3px solid #ddd;
}

.news-card:active {
  transform: scale(0.98);
}

.news-card.positive { border-left-color: #27ae60; }
.news-card.negative { border-left-color: #e74c3c; }
.news-card.neutral { border-left-color: #95a5a6; }

.news-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.news-type {
  font-size: 11px;
  color: #666;
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 3px;
}

.news-time {
  font-size: 11px;
  color: #999;
}

.news-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin: 0 0 6px 0;
  line-height: 1.4;
}

.news-content {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 8px;
}

.news-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sentiment-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: bold;
}

.sentiment-badge.positive {
  background: #d4edda;
  color: #155724;
}

.sentiment-badge.negative {
  background: #f8d7da;
  color: #721c24;
}

.sentiment-badge.neutral {
  background: #e9ecef;
  color: #495057;
}

.impact-hint {
  font-size: 11px;
  color: #666;
}

.impact-hint .positive {
  color: #27ae60;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 20px;
  width: 100%;
  max-width: 360px;
  max-height: 70vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.modal-type {
  font-size: 11px;
  color: #666;
  background: #f0f0f0;
  padding: 3px 8px;
  border-radius: 3px;
}

.close-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: #f0f0f0;
  color: #666;
  font-size: 18px;
  cursor: pointer;
}

.modal-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.modal-content-text {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 15px;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #eee;
  margin-bottom: 15px;
}

.modal-time {
  font-size: 11px;
  color: #999;
}

.modal-impact {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 12px;
}

.modal-impact h4 {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #333;
}

.impact-items {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.impact-item {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 12px;
  background: #e9ecef;
  color: #666;
}

.impact-item.positive {
  background: #d4edda;
  color: #155724;
}
</style>

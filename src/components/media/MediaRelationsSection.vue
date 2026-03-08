<template>
  <div class="media-relations-section">
    <!-- 关系概览 -->
    <div class="overview-card">
      <div class="overview-item">
        <div class="label">平均关系</div>
        <div class="value" :class="getRelationClass(averageRelation)">
          {{ averageRelation > 0 ? '+' : '' }}{{ averageRelation.toFixed(1) }}
        </div>
      </div>
      <div class="overview-item">
        <div class="label">友好媒体</div>
        <div class="value friendly">{{ friendlyCount }}</div>
      </div>
      <div class="overview-item">
        <div class="label">敌对媒体</div>
        <div class="value hostile">{{ hostileCount }}</div>
      </div>
    </div>

    <!-- 媒体关系列表 -->
    <div class="media-list">
      <h3 class="section-title">媒体机构</h3>
      
      <div v-for="outlet in mediaOutlets" :key="outlet.id" class="media-card">
        <div class="media-header">
          <div class="media-info">
            <span class="media-name">{{ outlet.name }}</span>
            <span class="media-type-tag" :class="outlet.type">
              {{ getMediaTypeName(outlet.type) }}
            </span>
          </div>
          <div class="influence-badge">
            影响力：{{ '⭐'.repeat(outlet.influence) }}
          </div>
        </div>
        
        <div class="relation-bar-container">
          <div class="relation-bar">
            <div
              class="relation-fill"
              :class="getRelationClass(outlet.relation)"
              :style="{ width: getRelationWidth(outlet.relation) }"
            ></div>
          </div>
          <div class="relation-value" :class="getRelationClass(outlet.relation)">
            {{ outlet.relation > 0 ? '+' : '' }}{{ outlet.relation }}
          </div>
        </div>
        
        <div class="media-actions">
          <button
            v-if="outlet.relation < 50"
            class="btn-improve"
            @click="improveRelation(outlet.id)"
          >
            改善关系
          </button>
          <span v-else class="status-good">关系良好</span>
        </div>
      </div>
    </div>

    <!-- 最近新闻 -->
    <div class="news-section">
      <h3 class="section-title">最近新闻</h3>
      
      <div v-for="news in recentNews" :key="news.id" class="news-card">
        <div class="news-header">
          <span class="news-title">{{ news.title }}</span>
          <span class="sentiment-tag" :class="news.sentiment">
            {{ getSentimentText(news.sentiment) }}
          </span>
        </div>
        <p class="news-content">{{ news.content }}</p>
        <div class="news-time">{{ formatTime(news.createdAt) }}</div>
      </div>
      
      <div v-if="recentNews.length === 0" class="empty-news">
        <p>暂无相关新闻</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useMediaStore } from '@/stores/media';
import type { MediaOutletType, SocialSentiment } from '@/types/media';

const mediaStore = useMediaStore();

const averageRelation = computed(() => mediaStore.averageRelation);
const mediaOutlets = computed(() => mediaStore.mediaOutlets);
const recentNews = computed(() => mediaStore.recentNews);

const friendlyCount = computed(() => {
  return mediaOutlets.value.filter(m => m.relation > 50).length;
});

const hostileCount = computed(() => {
  return mediaOutlets.value.filter(m => m.relation < -50).length;
});

function getMediaTypeName(type: MediaOutletType): string {
  const types: Record<MediaOutletType, string> = {
    esports_media: '电竞媒体',
    mainstream_media: '主流媒体',
    fan_community: '粉丝社区',
  };
  return types[type] || type;
}

function getSentimentText(sentiment: SocialSentiment): string {
  const texts: Record<SocialSentiment, string> = {
    positive: '正面',
    neutral: '中立',
    negative: '负面',
  };
  return texts[sentiment] || sentiment;
}

function getRelationClass(relation: number): string {
  if (relation > 50) return 'good';
  if (relation > 0) return 'neutral';
  if (relation > -50) return 'bad';
  return 'hostile';
}

function getRelationWidth(relation: number): string {
  const normalized = (relation + 100) / 200 * 100;
  return `${Math.max(0, Math.min(100, normalized))}%`;
}

function improveRelation(mediaId: string): void {
  // 这里可以弹出确认框，确认后改善关系
  if (confirm('花费 10 万举办媒体见面会改善关系？')) {
    // TODO: 需要 clubStore 来扣减资金
    mediaStore.updateMediaRelation(mediaId, 10);
  }
}

function formatTime(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '未知时间';
  
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

onMounted(() => {
  mediaStore.updateMediaRelations();
});
</script>

<style scoped lang="scss">
.media-relations-section {
  padding: 16px;
}

.overview-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-around;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.overview-item {
  text-align: center;
  
  .label {
    font-size: 12px;
    color: #999;
    margin-bottom: 6px;
  }
  
  .value {
    font-size: 24px;
    font-weight: 700;
    
    &.good {
      color: #4caf50;
    }
    
    &.neutral {
      color: #2196f3;
    }
    
    &.bad {
      color: #ff9800;
    }
    
    &.hostile {
      color: #f44336;
    }
    
    &.friendly {
      color: #4caf50;
    }
    
    &.hostile {
      color: #f44336;
    }
  }
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px 0;
}

.media-list {
  margin-bottom: 32px;
}

.media-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.media-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.media-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.media-name {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.media-type-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 8px;
  font-weight: 500;
  
  &.esports_media {
    background: #e3f2fd;
    color: #1976d2;
  }
  
  &.mainstream_media {
    background: #f3e5f5;
    color: #7b1fa2;
  }
  
  &.fan_community {
    background: #fff3e0;
    color: #f57c00;
  }
}

.influence-badge {
  font-size: 11px;
  color: #ff9800;
}

.relation-bar-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.relation-bar {
  flex: 1;
  height: 8px;
  background: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
}

.relation-fill {
  height: 100%;
  transition: width 0.3s ease;
  
  &.good {
    background: #4caf50;
  }
  
  &.neutral {
    background: #2196f3;
  }
  
  &.bad {
    background: #ff9800;
  }
  
  &.hostile {
    background: #f44336;
  }
}

.relation-value {
  font-size: 14px;
  font-weight: 600;
  min-width: 50px;
  text-align: right;
  
  &.good {
    color: #4caf50;
  }
  
  &.neutral {
    color: #2196f3;
  }
  
  &.bad {
    color: #ff9800;
  }
  
  &.hostile {
    color: #f44336;
  }
}

.media-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.btn-improve {
  padding: 6px 16px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #2563eb;
  }
}

.status-good {
  font-size: 13px;
  color: #4caf50;
  font-weight: 500;
}

.news-section {
  .section-title {
    margin-bottom: 12px;
  }
}

.news-card {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  border-left: 3px solid #2196f3;
}

.news-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.news-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.sentiment-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
  
  &.positive {
    background: #e8f5e9;
    color: #2e7d32;
  }
  
  &.neutral {
    background: #f5f5f5;
    color: #666;
  }
  
  &.negative {
    background: #ffebee;
    color: #c62828;
  }
}

.news-content {
  font-size: 13px;
  line-height: 1.5;
  color: #666;
  margin: 0 0 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-time {
  font-size: 11px;
  color: #ccc;
  text-align: right;
}

.empty-news {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}
</style>

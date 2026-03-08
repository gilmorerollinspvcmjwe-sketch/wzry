<template>
  <div class="social-media-section">
    <!-- 微博状态概览 -->
    <div class="weibo-overview">
      <div class="overview-card">
        <div class="stat-item">
          <div class="stat-label">微博粉丝</div>
          <div class="stat-value">{{ formatNumber(followers) }}</div>
        </div>
        <div v-if="isTrending" class="trending-badge">
          🔥 热搜：{{ trendingTopic }}
        </div>
      </div>
    </div>

    <!-- 最新动态 -->
    <div class="posts-section">
      <h3 class="section-title">最新动态</h3>
      
      <div v-for="post in posts" :key="post.id" class="post-card">
        <div class="post-header">
          <span class="post-type-tag" :class="post.type">
            {{ getPostTypeText(post.type) }}
          </span>
          <span v-if="post.isHot" class="hot-badge">🔥 热门</span>
        </div>
        
        <p class="post-content">{{ post.content }}</p>
        
        <div class="post-stats">
          <span class="stat">👍 {{ formatNumber(post.likes) }}</span>
          <span class="stat">💬 {{ formatNumber(post.comments) }}</span>
          <span class="stat">🔁 {{ formatNumber(post.shares) }}</span>
        </div>
        
        <div class="post-time">{{ formatTime(post.createdAt) }}</div>
      </div>
    </div>

    <!-- 发布新动态 -->
    <div class="create-post-section">
      <h3 class="section-title">发布动态</h3>
      
      <div class="post-form">
        <van-field
          v-model="postContent"
          type="textarea"
          rows="3"
          placeholder="分享俱乐部的最新动态..."
          class="content-input"
        />
        
        <div class="form-actions">
          <van-button type="primary" size="small" @click="createPost" :disabled="!postContent.trim()">
            发布
          </van-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useMediaStore } from '@/stores/media';
import type { SocialPostType } from '@/types/media';

const mediaStore = useMediaStore();

const postContent = ref('');

const followers = computed(() => mediaStore.followers);
const isTrending = computed(() => mediaStore.isTrending);
const trendingTopic = computed(() => mediaStore.trendingTopic);
const posts = computed(() => mediaStore.recentPosts);

function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toString();
}

function getPostTypeText(type: SocialPostType): string {
  const types: Record<SocialPostType, string> = {
    match_result: '比赛结果',
    player_highlight: '选手高光',
    announcement: '官方公告',
    interaction: '粉丝互动',
    training: '训练日常',
    transfer: '转会官宣',
  };
  return types[type] || type;
}

function formatTime(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '未知时间';
  
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function createPost(): void {
  if (!postContent.value.trim()) return;
  
  mediaStore.postAnnouncement('俱乐部公告', postContent.value);
  postContent.value = '';
  
  // 显示成功提示
  // TODO: 使用 Toast 组件
}

onMounted(() => {
  mediaStore.updateSocialMedia();
});
</script>

<style scoped lang="scss">
.social-media-section {
  padding: 16px;
}

.weibo-overview {
  margin-bottom: 20px;
}

.overview-card {
  background: linear-gradient(135deg, #e91e63 0%, #ff4081 100%);
  border-radius: 12px;
  padding: 20px;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-item {
  .stat-label {
    font-size: 13px;
    opacity: 0.9;
    margin-bottom: 6px;
  }
  
  .stat-value {
    font-size: 28px;
    font-weight: 700;
  }
}

.trending-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px 0;
}

.posts-section {
  margin-bottom: 32px;
}

.post-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.post-type-tag {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 12px;
  font-weight: 500;
  
  &.match_result {
    background: #e3f2fd;
    color: #1976d2;
  }
  
  &.player_highlight {
    background: #fff3e0;
    color: #f57c00;
  }
  
  &.announcement {
    background: #f3e5f5;
    color: #7b1fa2;
  }
  
  &.transfer {
    background: #e8f5e9;
    color: #2e7d32;
  }
  
  &.training {
    background: #fce4ec;
    color: #c2185b;
  }
  
  &.interaction {
    background: #e0f7fa;
    color: #00838f;
  }
}

.hot-badge {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 12px;
  background: #ff5252;
  color: #fff;
  font-weight: 600;
}

.post-content {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  margin: 0 0 12px 0;
  white-space: pre-wrap;
}

.post-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.stat {
  font-size: 12px;
  color: #999;
}

.post-time {
  font-size: 11px;
  color: #ccc;
  text-align: right;
}

.create-post-section {
  .section-title {
    margin-bottom: 12px;
  }
}

.post-form {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.content-input {
  :deep(.van-field__control) {
    font-size: 14px;
    line-height: 1.6;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
</style>

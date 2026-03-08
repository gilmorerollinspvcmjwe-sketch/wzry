<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useFanCommunityStore } from '@/stores/fanCommunity';
import { useClubStore } from '@/stores/club';

const fanStore = useFanCommunityStore();
const clubStore = useClubStore();

const activeTab = ref<'feed' | 'trending' | 'crisis'>('feed');
const newPostContent = ref('');
const replyingTo = ref<string | null>(null);
const replyContent = ref('');

const currentClubId = computed(() => clubStore.currentClub?.id || '');
const community = computed(() => fanStore.getCommunity(currentClubId.value));

const posts = computed(() => {
  if (!currentClubId.value) return [];
  return fanStore.getPosts(currentClubId.value);
});

const trendingTopics = computed(() => {
  if (!currentClubId.value) return [];
  return fanStore.getTrendingTopics(currentClubId.value);
});

const activeCrises = computed(() => {
  if (!currentClubId.value) return [];
  return fanStore.getActiveCrises(currentClubId.value);
});

const sentimentColor = computed(() => {
  const sentiment = community.value?.sentiment || 50;
  if (sentiment >= 70) return '#4CAF50';
  if (sentiment >= 40) return '#FFC107';
  return '#F44336';
});

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  return `${days}天前`;
}

function formatNumber(num: number): string {
  if (num >= 10000) return (num / 10000).toFixed(1) + '万';
  return num.toString();
}

function createPost() {
  if (!newPostContent.value.trim() || !currentClubId.value) return;
  
  fanStore.createPost(currentClubId.value, {
    id: `post_${Date.now()}`,
    authorId: 'club_official',
    authorName: clubStore.currentClub?.name || '官方',
    authorAvatar: clubStore.currentClub?.logo,
    content: newPostContent.value,
    images: [],
    likes: 0,
    comments: 0,
    shares: 0,
    timestamp: new Date(),
    isOfficial: true,
    tags: [],
  });
  
  newPostContent.value = '';
}

function likePost(postId: string) {
  if (!currentClubId.value) return;
  fanStore.likePost(currentClubId.value, postId);
}

function startReply(postId: string) {
  replyingTo.value = postId;
  replyContent.value = '';
}

function submitReply() {
  if (!replyingTo.value || !replyContent.value.trim() || !currentClubId.value) return;
  
  fanStore.commentOnPost(currentClubId.value, replyingTo.value, {
    id: `comment_${Date.now()}`,
    authorId: 'club_manager',
    authorName: '俱乐部经理',
    content: replyContent.value,
    timestamp: new Date(),
    likes: 0,
  });
  
  replyingTo.value = null;
  replyContent.value = '';
}

function handleCrisis(crisisId: string, action: 'apologize' | 'explain' | 'ignore') {
  if (!currentClubId.value) return;
  fanStore.handleCrisis(currentClubId.value, crisisId, action);
}

onMounted(() => {
  if (currentClubId.value) {
    fanStore.initCommunity(currentClubId.value);
  }
});
</script>

<template>
  <div class="social-page">
    <div class="page-header">
      <h1 class="page-title">社交媒体</h1>
      <div class="sentiment-indicator" :style="{ color: sentimentColor }">
        粉丝情绪: {{ community?.sentiment || 50 }}%
      </div>
    </div>

    <!-- 标签页导航 -->
    <div class="tab-nav">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'feed' }"
        @click="activeTab = 'feed'"
      >
        动态流
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'trending' }"
        @click="activeTab = 'trending'"
      >
        热门话题
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'crisis' }"
        @click="activeTab = 'crisis'"
      >
        危机管理
        <span v-if="activeCrises.length > 0" class="badge">{{ activeCrises.length }}</span>
      </button>
    </div>

    <!-- 动态流 -->
    <div v-if="activeTab === 'feed'" class="tab-content">
      <!-- 发布框 -->
      <div class="create-post card">
        <textarea
          v-model="newPostContent"
          placeholder="发布俱乐部动态..."
          class="post-input"
          rows="3"
        ></textarea>
        <div class="post-actions">
          <button class="btn btn-primary" @click="createPost" :disabled="!newPostContent.trim()">
            发布
          </button>
        </div>
      </div>

      <!-- 动态列表 -->
      <div class="posts-list">
        <div v-for="post in posts" :key="post.id" class="post-card card">
          <div class="post-header">
            <div class="post-author">
              <div class="author-avatar" v-if="post.authorAvatar">
                <img :src="post.authorAvatar" :alt="post.authorName">
              </div>
              <div class="author-info">
                <div class="author-name">
                  {{ post.authorName }}
                  <span v-if="post.isOfficial" class="official-badge">官方</span>
                </div>
                <div class="post-time">{{ formatTime(post.timestamp) }}</div>
              </div>
            </div>
          </div>
          
          <div class="post-content">{{ post.content }}</div>
          
          <div v-if="post.tags.length > 0" class="post-tags">
            <span v-for="tag in post.tags" :key="tag" class="tag">#{{ tag }}</span>
          </div>
          
          <div class="post-stats">
            <button class="stat-btn" @click="likePost(post.id)">
              <span class="stat-icon">👍</span>
              <span>{{ formatNumber(post.likes) }}</span>
            </button>
            <button class="stat-btn" @click="startReply(post.id)">
              <span class="stat-icon">💬</span>
              <span>{{ formatNumber(post.comments) }}</span>
            </button>
            <button class="stat-btn">
              <span class="stat-icon">🔄</span>
              <span>{{ formatNumber(post.shares) }}</span>
            </button>
          </div>

          <!-- 回复框 -->
          <div v-if="replyingTo === post.id" class="reply-box">
            <textarea
              v-model="replyContent"
              placeholder="写下你的回复..."
              class="reply-input"
              rows="2"
            ></textarea>
            <div class="reply-actions">
              <button class="btn btn-secondary" @click="replyingTo = null">取消</button>
              <button class="btn btn-primary" @click="submitReply">回复</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 热门话题 -->
    <div v-if="activeTab === 'trending'" class="tab-content">
      <div class="trending-list">
        <div v-for="(topic, index) in trendingTopics" :key="topic.id" class="topic-card card">
          <div class="topic-rank">{{ index + 1 }}</div>
          <div class="topic-info">
            <div class="topic-name">#{{ topic.name }}</div>
            <div class="topic-stats">
              <span>{{ formatNumber(topic.mentions) }} 讨论</span>
              <span :class="{ 'trend-up': topic.trend === 'up', 'trend-down': topic.trend === 'down' }">
                {{ topic.trend === 'up' ? '↑' : topic.trend === 'down' ? '↓' : '→' }}
              </span>
            </div>
          </div>
          <div class="topic-sentiment" :style="{ color: topic.sentiment > 60 ? '#4CAF50' : topic.sentiment > 40 ? '#FFC107' : '#F44336' }">
            {{ topic.sentiment }}%
          </div>
        </div>
      </div>
    </div>

    <!-- 危机管理 -->
    <div v-if="activeTab === 'crisis'" class="tab-content">
      <div v-if="activeCrises.length === 0" class="empty-state card">
        <div class="empty-icon">✅</div>
        <div class="empty-text">当前没有危机事件</div>
        <div class="empty-desc">保持良好的俱乐部运营和粉丝关系</div>
      </div>

      <div v-for="crisis in activeCrises" :key="crisis.id" class="crisis-card card">
        <div class="crisis-header">
          <div class="crisis-level" :class="`level-${crisis.level}`">
            {{ crisis.level === 1 ? '低' : crisis.level === 2 ? '中' : '高' }}风险
          </div>
          <div class="crisis-time">{{ formatTime(crisis.startTime) }}</div>
        </div>
        
        <div class="crisis-title">{{ crisis.title }}</div>
        <div class="crisis-desc">{{ crisis.description }}</div>
        
        <div class="crisis-impact">
          <div class="impact-item">
            <span class="impact-label">影响范围:</span>
            <span class="impact-value">{{ formatNumber(crisis.impact.reach) }} 人</span>
          </div>
          <div class="impact-item">
            <span class="impact-label">情绪变化:</span>
            <span class="impact-value" :class="{ negative: crisis.impact.sentimentChange < 0 }">
              {{ crisis.impact.sentimentChange > 0 ? '+' : '' }}{{ crisis.impact.sentimentChange }}%
            </span>
          </div>
        </div>

        <div class="crisis-actions">
          <button class="btn btn-secondary" @click="handleCrisis(crisis.id, 'apologize')">
            公开道歉
          </button>
          <button class="btn btn-secondary" @click="handleCrisis(crisis.id, 'explain')">
            澄清说明
          </button>
          <button class="btn btn-secondary" @click="handleCrisis(crisis.id, 'ignore')">
            冷处理
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.social-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.sentiment-indicator {
  font-size: 16px;
  font-weight: 600;
}

.tab-nav {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 2px solid #e0e0e0;
}

.tab-btn {
  padding: 12px 24px;
  border: none;
  background: none;
  font-size: 15px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.tab-btn.active {
  color: #667eea;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #667eea, #764ba2);
}

.badge {
  background: #F44336;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 4px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.create-post {
  margin-bottom: 20px;
}

.post-input {
  width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  font-size: 15px;
  resize: vertical;
  margin-bottom: 12px;
}

.post-input:focus {
  outline: none;
  border-color: #667eea;
}

.post-actions {
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.post-card {
  margin-bottom: 16px;
}

.post-header {
  margin-bottom: 12px;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
}

.author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-info {
  flex: 1;
}

.author-name {
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.official-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
}

.post-time {
  font-size: 13px;
  color: #888;
  margin-top: 2px;
}

.post-content {
  color: #333;
  line-height: 1.6;
  margin-bottom: 12px;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.tag {
  color: #667eea;
  font-size: 14px;
}

.post-stats {
  display: flex;
  gap: 24px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.stat-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s;
}

.stat-btn:hover {
  color: #667eea;
}

.stat-icon {
  font-size: 16px;
}

.reply-box {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.reply-input {
  width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px;
  font-size: 14px;
  resize: vertical;
  margin-bottom: 10px;
}

.reply-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.trending-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.topic-card {
  display: flex;
  align-items: center;
  gap: 16px;
}

.topic-rank {
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
  width: 40px;
  text-align: center;
}

.topic-info {
  flex: 1;
}

.topic-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.topic-stats {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #888;
}

.trend-up {
  color: #4CAF50;
}

.trend-down {
  color: #F44336;
}

.topic-sentiment {
  font-size: 18px;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.empty-desc {
  color: #888;
}

.crisis-card {
  border-left: 4px solid #F44336;
}

.crisis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.crisis-level {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.level-1 {
  background: #FFF3E0;
  color: #EF6C00;
}

.level-2 {
  background: #FFEBEE;
  color: #C62828;
}

.level-3 {
  background: #F44336;
  color: white;
}

.crisis-time {
  font-size: 13px;
  color: #888;
}

.crisis-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.crisis-desc {
  color: #666;
  line-height: 1.5;
  margin-bottom: 16px;
}

.crisis-impact {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.impact-item {
  display: flex;
  gap: 8px;
}

.impact-label {
  color: #888;
  font-size: 13px;
}

.impact-value {
  font-weight: 600;
  color: #333;
}

.impact-value.negative {
  color: #F44336;
}

.crisis-actions {
  display: flex;
  gap: 12px;
}
</style>
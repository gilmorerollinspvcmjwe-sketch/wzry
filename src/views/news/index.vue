<script setup lang="ts">
import { ref, computed } from 'vue';

const activeTab = ref<'all' | 'club' | 'league' | 'transfer'>('all');
const showPublishModal = ref(false);

const newArticle = ref({
  title: '',
  content: '',
  category: 'club',
});

const newsList = ref([
  {
    id: '1',
    title: '俱乐部宣布新赛季阵容',
    content: '经过深思熟虑，我们很高兴地宣布新赛季的主力阵容...',
    category: 'club',
    author: '俱乐部官方',
    publishTime: new Date(),
    views: 12580,
    likes: 856,
    isOfficial: true,
  },
  {
    id: '2',
    title: 'KPL春季赛赛程公布',
    content: '王者荣耀职业联赛春季赛即将开幕，各战队准备就绪...',
    category: 'league',
    author: 'KPL官方',
    publishTime: new Date(Date.now() - 86400000),
    views: 56230,
    likes: 3421,
    isOfficial: false,
  },
]);

const filteredNews = computed(() => {
  if (activeTab.value === 'all') return newsList.value;
  return newsList.value.filter(n => n.category === activeTab.value);
});

const tabs = [
  { id: 'all', name: '全部' },
  { id: 'club', name: '俱乐部' },
  { id: 'league', name: '联赛' },
  { id: 'transfer', name: '转会' },
];

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (hours < 1) return '刚刚';
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return new Date(date).toLocaleDateString('zh-CN');
}

function formatNumber(num: number): string {
  if (num >= 10000) return (num / 10000).toFixed(1) + '万';
  return num.toString();
}

function publishArticle() {
  if (!newArticle.value.title.trim() || !newArticle.value.content.trim()) return;
  
  newsList.value.unshift({
    id: `news_${Date.now()}`,
    title: newArticle.value.title,
    content: newArticle.value.content,
    category: newArticle.value.category as any,
    author: '俱乐部官方',
    publishTime: new Date(),
    views: 0,
    likes: 0,
    isOfficial: true,
  });
  
  newArticle.value = { title: '', content: '', category: 'club' };
  showPublishModal.value = false;
}

function likeNews(id: string) {
  const news = newsList.value.find(n => n.id === id);
  if (news) news.likes++;
}
</script>

<template>
  <div class="news-page">
    <div class="page-header">
      <h1 class="page-title">新闻中心</h1>
      <button class="btn btn-primary" @click="showPublishModal = true">
        发布新闻
      </button>
    </div>

    <div class="tab-nav">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-btn"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.name }}
      </button>
    </div>

    <div class="news-list">
      <div v-for="news in filteredNews" :key="news.id" class="news-card card">
        <div class="news-header">
          <span v-if="news.isOfficial" class="official-badge">官方</span>
          <span class="news-category">{{ tabs.find(t => t.id === news.category)?.name }}</span>
        </div>
        <h3 class="news-title">{{ news.title }}</h3>
        <p class="news-content">{{ news.content }}</p>
        <div class="news-footer">
          <div class="news-meta">
            <span class="news-author">{{ news.author }}</span>
            <span class="news-time">{{ formatTime(news.publishTime) }}</span>
          </div>
          <div class="news-stats">
            <span class="stat-item">
              <span class="stat-icon">👁</span>
              {{ formatNumber(news.views) }}
            </span>
            <button class="stat-item like-btn" @click="likeNews(news.id)">
              <span class="stat-icon">👍</span>
              {{ formatNumber(news.likes) }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 发布弹窗 -->
    <div v-if="showPublishModal" class="modal-overlay" @click="showPublishModal = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">发布新闻</h3>
        <div class="modal-body">
          <div class="form-group">
            <label>标题</label>
            <input v-model="newArticle.title" type="text" class="form-input" placeholder="输入新闻标题">
          </div>
          <div class="form-group">
            <label>分类</label>
            <select v-model="newArticle.category" class="form-select">
              <option value="club">俱乐部</option>
              <option value="league">联赛</option>
              <option value="transfer">转会</option>
            </select>
          </div>
          <div class="form-group">
            <label>内容</label>
            <textarea v-model="newArticle.content" class="form-textarea" rows="6" placeholder="输入新闻内容"></textarea>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showPublishModal = false">取消</button>
          <button class="btn btn-primary" @click="publishArticle">发布</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.news-page {
  padding: 20px;
  max-width: 900px;
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

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
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

.card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.news-card {
  transition: transform 0.2s;
}

.news-card:hover {
  transform: translateY(-2px);
}

.news-header {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.official-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
}

.news-category {
  font-size: 13px;
  color: #667eea;
  font-weight: 500;
}

.news-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.news-content {
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.news-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #888;
}

.news-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #888;
}

.like-btn {
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
}

.like-btn:hover {
  color: #667eea;
}

.stat-icon {
  font-size: 14px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 600px;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: #333;
}

.modal-body {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.form-textarea {
  resize: vertical;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
</style>
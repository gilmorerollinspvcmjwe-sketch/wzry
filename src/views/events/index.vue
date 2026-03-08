<script setup lang="ts">
import { ref, computed } from 'vue';

const activeTab = ref<'active' | 'history'>('active');
const selectedCategory = ref<string>('all');

const categories = [
  { id: 'all', name: '全部' },
  { id: 'match', name: '比赛事件' },
  { id: 'player', name: '选手事件' },
  { id: 'club', name: '俱乐部事件' },
];

const activeEvents = ref([
  {
    id: '1',
    title: '选手状态异常',
    description: '主力选手在训练中表现不佳，情绪受到影响',
    category: 'player',
    severity: 'medium',
    createdAt: new Date(),
    deadline: new Date(Date.now() + 86400000),
  },
]);

const historyEvents = ref([
  {
    id: '2',
    title: '媒体采访请求',
    description: '电竞媒体申请采访主教练',
    category: 'club',
    severity: 'low',
    createdAt: new Date(Date.now() - 172800000),
    resolvedAt: new Date(Date.now() - 86400000),
    result: 'accepted',
  },
]);

const filteredActiveEvents = computed(() => {
  if (selectedCategory.value === 'all') return activeEvents.value;
  return activeEvents.value.filter(e => e.category === selectedCategory.value);
});

const filteredHistoryEvents = computed(() => {
  if (selectedCategory.value === 'all') return historyEvents.value;
  return historyEvents.value.filter(e => e.category === selectedCategory.value);
});

function getCategoryName(id: string): string {
  return categories.find(c => c.id === id)?.name || id;
}

function getSeverityClass(severity: string): string {
  const classes: Record<string, string> = {
    low: 'severity-low',
    medium: 'severity-medium',
    high: 'severity-high',
  };
  return classes[severity] || '';
}

function getSeverityLabel(severity: string): string {
  const labels: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
  };
  return labels[severity] || severity;
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleString('zh-CN');
}
</script>

<template>
  <div class="events-page">
    <div class="page-header">
      <h1 class="page-title">事件管理</h1>
    </div>

    <div class="filters card">
      <div class="filter-group">
        <label>事件类型:</label>
        <select v-model="selectedCategory" class="form-select">
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>
    </div>

    <div class="tab-nav">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'active' }"
        @click="activeTab = 'active'"
      >
        待处理 ({{ filteredActiveEvents.length }})
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'history' }"
        @click="activeTab = 'history'"
      >
        历史记录
      </button>
    </div>

    <div v-if="activeTab === 'active'" class="events-list">
      <div v-if="filteredActiveEvents.length === 0" class="empty-state card">
        <div class="empty-icon">📭</div>
        <div class="empty-text">没有待处理事件</div>
      </div>
      
      <div v-for="event in filteredActiveEvents" :key="event.id" class="event-card card">
        <div class="event-header">
          <span class="event-category">{{ getCategoryName(event.category) }}</span>
          <span class="event-severity" :class="getSeverityClass(event.severity)">
            {{ getSeverityLabel(event.severity) }}优先级
          </span>
        </div>
        <h3 class="event-title">{{ event.title }}</h3>
        <p class="event-desc">{{ event.description }}</p>
        <div class="event-meta">
          <span>发生时间: {{ formatTime(event.createdAt) }}</span>
          <span>截止时间: {{ formatTime(event.deadline) }}</span>
        </div>
        <div class="event-actions">
          <button class="btn btn-primary">处理</button>
          <button class="btn btn-secondary">忽略</button>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'history'" class="events-list">
      <div v-for="event in filteredHistoryEvents" :key="event.id" class="event-card card resolved">
        <div class="event-header">
          <span class="event-category">{{ getCategoryName(event.category) }}</span>
          <span class="event-status resolved">已解决</span>
        </div>
        <h3 class="event-title">{{ event.title }}</h3>
        <p class="event-desc">{{ event.description }}</p>
        <div class="event-meta">
          <span>处理时间: {{ formatTime(event.resolvedAt) }}</span>
          <span>处理结果: {{ event.result === 'accepted' ? '接受' : '拒绝' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.events-page {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.filters {
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-group label {
  font-weight: 500;
  color: #333;
}

.form-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.tab-nav {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
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

.empty-state {
  text-align: center;
  padding: 60px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-text {
  color: #888;
}

.event-card {
  border-left: 4px solid #667eea;
}

.event-card.resolved {
  border-left-color: #4CAF50;
  opacity: 0.8;
}

.event-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.event-category {
  font-size: 13px;
  color: #667eea;
  font-weight: 500;
}

.event-severity {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.severity-low {
  background: #E8F5E9;
  color: #2E7D32;
}

.severity-medium {
  background: #FFF3E0;
  color: #EF6C00;
}

.severity-high {
  background: #FFEBEE;
  color: #C62828;
}

.event-status.resolved {
  background: #E8F5E9;
  color: #2E7D32;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.event-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.event-desc {
  color: #666;
  line-height: 1.5;
  margin-bottom: 12px;
}

.event-meta {
  display: flex;
  gap: 24px;
  font-size: 13px;
  color: #888;
  margin-bottom: 16px;
}

.event-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}
</style>
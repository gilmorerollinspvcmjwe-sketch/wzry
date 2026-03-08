<script setup lang="ts">
import { ref, computed } from 'vue';

const activeTab = ref<'pending' | 'scheduled' | 'history'>('pending');
const showScheduleModal = ref(false);

const interviewRequests = ref([
  {
    id: '1',
    mediaName: '电竞周刊',
    mediaLogo: '',
    type: 'exclusive',
    target: '主教练',
    topic: '新赛季战术规划',
    influence: 85,
    deadline: new Date(Date.now() + 172800000),
    status: 'pending',
  },
  {
    id: '2',
    mediaName: '游戏日报',
    mediaLogo: '',
    type: 'group',
    target: '全队',
    topic: '训练日常',
    influence: 60,
    deadline: new Date(Date.now() + 86400000),
    status: 'pending',
  },
]);

const scheduledInterviews = ref([
  {
    id: '3',
    mediaName: '电竞世界',
    type: 'exclusive',
    target: '队长',
    topic: '队长专访',
    scheduledTime: new Date(Date.now() + 86400000),
    duration: 60,
    location: '线上',
  },
]);

const historyInterviews = ref([
  {
    id: '4',
    mediaName: '王者荣耀官方',
    type: 'group',
    target: '全队',
    topic: '夺冠回顾',
    completedTime: new Date(Date.now() - 604800000),
    impact: { fans: 1500, reputation: 10 },
  },
]);

const pendingCount = computed(() => interviewRequests.value.filter(i => i.status === 'pending').length);

const newInterview = ref({
  mediaName: '',
  type: 'exclusive',
  target: '',
  topic: '',
  scheduledTime: '',
  duration: 60,
});

function formatTime(date: Date): string {
  return new Date(date).toLocaleString('zh-CN');
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    exclusive: '独家专访',
    group: '群访',
    quick: '快问快答',
  };
  return labels[type] || type;
}

function acceptInterview(id: string) {
  const request = interviewRequests.value.find(i => i.id === id);
  if (request) {
    request.status = 'accepted';
    scheduledInterviews.value.push({
      id: request.id,
      mediaName: request.mediaName,
      type: request.type,
      target: request.target,
      topic: request.topic,
      scheduledTime: new Date(Date.now() + 86400000),
      duration: 60,
      location: '待定',
    });
  }
}

function rejectInterview(id: string) {
  const request = interviewRequests.value.find(i => i.id === id);
  if (request) request.status = 'rejected';
}

function scheduleInterview() {
  if (!newInterview.value.mediaName || !newInterview.value.target) return;
  
  scheduledInterviews.value.push({
    id: `int_${Date.now()}`,
    mediaName: newInterview.value.mediaName,
    type: newInterview.value.type as any,
    target: newInterview.value.target,
    topic: newInterview.value.topic,
    scheduledTime: new Date(newInterview.value.scheduledTime),
    duration: newInterview.value.duration,
    location: '待定',
  });
  
  showScheduleModal.value = false;
  newInterview.value = { mediaName: '', type: 'exclusive', target: '', topic: '', scheduledTime: '', duration: 60 };
}
</script>

<template>
  <div class="interview-page">
    <div class="page-header">
      <h1 class="page-title">采访管理</h1>
      <button class="btn btn-primary" @click="showScheduleModal = true">
        安排采访
      </button>
    </div>

    <div class="tab-nav">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'pending' }"
        @click="activeTab = 'pending'"
      >
        待处理
        <span v-if="pendingCount > 0" class="badge">{{ pendingCount }}</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'scheduled' }"
        @click="activeTab = 'scheduled'"
      >
        已安排
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'history' }"
        @click="activeTab = 'history'"
      >
        历史记录
      </button>
    </div>

    <!-- 待处理 -->
    <div v-if="activeTab === 'pending'" class="interview-list">
      <div v-if="interviewRequests.filter(i => i.status === 'pending').length === 0" class="empty-state card">
        <div class="empty-icon">📭</div>
        <div class="empty-text">没有待处理的采访请求</div>
      </div>
      
      <div v-for="request in interviewRequests.filter(i => i.status === 'pending')" :key="request.id" class="request-card card">
        <div class="request-header">
          <div class="media-info">
            <div class="media-logo" v-if="request.mediaLogo">
              <img :src="request.mediaLogo" :alt="request.mediaName">
            </div>
            <div class="media-name">{{ request.mediaName }}</div>
          </div>
          <div class="influence-score">
            影响力: {{ request.influence }}
          </div>
        </div>
        
        <div class="request-details">
          <div class="detail-item">
            <span class="detail-label">采访类型:</span>
            <span class="detail-value">{{ getTypeLabel(request.type) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">采访对象:</span>
            <span class="detail-value">{{ request.target }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">采访主题:</span>
            <span class="detail-value">{{ request.topic }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">截止时间:</span>
            <span class="detail-value">{{ formatTime(request.deadline) }}</span>
          </div>
        </div>
        
        <div class="request-actions">
          <button class="btn btn-primary" @click="acceptInterview(request.id)">接受</button>
          <button class="btn btn-secondary" @click="rejectInterview(request.id)">拒绝</button>
        </div>
      </div>
    </div>

    <!-- 已安排 -->
    <div v-if="activeTab === 'scheduled'" class="interview-list">
      <div v-for="interview in scheduledInterviews" :key="interview.id" class="scheduled-card card">
        <div class="scheduled-header">
          <div class="media-name">{{ interview.mediaName }}</div>
          <div class="interview-type">{{ getTypeLabel(interview.type) }}</div>
        </div>
        <div class="scheduled-details">
          <div class="detail-item">
            <span class="detail-label">采访对象:</span>
            <span class="detail-value">{{ interview.target }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">采访主题:</span>
            <span class="detail-value">{{ interview.topic }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">预约时间:</span>
            <span class="detail-value">{{ formatTime(interview.scheduledTime) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">预计时长:</span>
            <span class="detail-value">{{ interview.duration }} 分钟</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">地点:</span>
            <span class="detail-value">{{ interview.location }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 历史记录 -->
    <div v-if="activeTab === 'history'" class="interview-list">
      <div v-for="interview in historyInterviews" :key="interview.id" class="history-card card">
        <div class="history-header">
          <div class="media-name">{{ interview.mediaName }}</div>
          <div class="completed-badge">已完成</div>
        </div>
        <div class="history-details">
          <div class="detail-item">
            <span class="detail-label">采访对象:</span>
            <span class="detail-value">{{ interview.target }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">采访主题:</span>
            <span class="detail-value">{{ interview.topic }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">完成时间:</span>
            <span class="detail-value">{{ formatTime(interview.completedTime) }}</span>
          </div>
        </div>
        <div class="impact-summary">
          <div class="impact-item">
            <span class="impact-label">粉丝增长:</span>
            <span class="impact-value positive">+{{ interview.impact.fans }}</span>
          </div>
          <div class="impact-item">
            <span class="impact-label">声望提升:</span>
            <span class="impact-value positive">+{{ interview.impact.reputation }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 安排弹窗 -->
    <div v-if="showScheduleModal" class="modal-overlay" @click="showScheduleModal = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">安排采访</h3>
        <div class="modal-body">
          <div class="form-group">
            <label>媒体名称</label>
            <input v-model="newInterview.mediaName" type="text" class="form-input" placeholder="输入媒体名称">
          </div>
          <div class="form-group">
            <label>采访类型</label>
            <select v-model="newInterview.type" class="form-select">
              <option value="exclusive">独家专访</option>
              <option value="group">群访</option>
              <option value="quick">快问快答</option>
            </select>
          </div>
          <div class="form-group">
            <label>采访对象</label>
            <input v-model="newInterview.target" type="text" class="form-input" placeholder="输入采访对象">
          </div>
          <div class="form-group">
            <label>采访主题</label>
            <input v-model="newInterview.topic" type="text" class="form-input" placeholder="输入采访主题">
          </div>
          <div class="form-group">
            <label>预约时间</label>
            <input v-model="newInterview.scheduledTime" type="datetime-local" class="form-input">
          </div>
          <div class="form-group">
            <label>预计时长 (分钟)</label>
            <input v-model.number="newInterview.duration" type="number" class="form-input" min="15" max="180">
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showScheduleModal = false">取消</button>
          <button class="btn btn-primary" @click="scheduleInterview">安排</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.interview-page {
  padding: 20px;
  max-width: 1000px;
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

.request-card {
  border-left: 4px solid #667eea;
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.media-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.media-logo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}

.media-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.influence-score {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.request-details {
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.detail-label {
  color: #888;
  font-size: 14px;
  min-width: 80px;
}

.detail-value {
  color: #333;
  font-weight: 500;
}

.request-actions {
  display: flex;
  gap: 12px;
}

.scheduled-card {
  border-left: 4px solid #4CAF50;
}

.scheduled-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.interview-type {
  background: #E8F5E9;
  color: #2E7D32;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
}

.scheduled-details {
  margin-bottom: 12px;
}

.history-card {
  border-left: 4px solid #9E9E9E;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.completed-badge {
  background: #E8F5E9;
  color: #2E7D32;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
}

.history-details {
  margin-bottom: 16px;
}

.impact-summary {
  display: flex;
  gap: 24px;
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
  font-size: 14px;
}

.impact-value.positive {
  color: #4CAF50;
  font-weight: 600;
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
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
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
.form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
</style>
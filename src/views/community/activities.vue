<template>
  <div class="activities-page">
    <div class="page-header">
      <router-link to="/community" class="back-btn">← 返回社区</router-link>
      <h2 class="page-title">粉丝活动管理</h2>
    </div>

    <div v-if="!isReady" class="loading card">
      <p>加载中...</p>
    </div>

    <template v-else>
      <div class="overview-stats">
        <div class="stat-card">
          <span class="stat-icon">📅</span>
          <div class="stat-info">
            <span class="stat-value">{{ planningCount }}</span>
            <span class="stat-label">计划中</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">🎉</span>
          <div class="stat-info">
            <span class="stat-value">{{ ongoingCount }}</span>
            <span class="stat-label">进行中</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">✅</span>
          <div class="stat-info">
            <span class="stat-value">{{ completedCount }}</span>
            <span class="stat-label">已完成</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">👥</span>
          <div class="stat-info">
            <span class="stat-value">{{ totalParticipants.toLocaleString() }}</span>
            <span class="stat-label">总参与人数</span>
          </div>
        </div>
      </div>

      <div class="action-bar">
        <button class="create-btn" @click="showCreateModal = true">
          ➕ 创建新活动
        </button>
        <div class="filter-tabs">
          <button
            v-for="filter in filters"
            :key="filter.id"
            class="filter-btn"
            :class="{ active: activeFilter === filter.id }"
            @click="activeFilter = filter.id"
          >
            {{ filter.name }}
          </button>
        </div>
      </div>

      <div class="activities-list">
        <div
          v-for="activity in filteredActivities"
          :key="activity.id"
          class="activity-card"
          :class="activity.status"
        >
          <div class="activity-header">
            <span class="activity-type">{{ getActivityIcon(activity.type) }} {{ getActivityTypeName(activity.type) }}</span>
            <span class="activity-status" :class="activity.status">{{ getStatusName(activity.status) }}</span>
          </div>

          <h3 class="activity-title">{{ activity.title }}</h3>
          <p class="activity-description">{{ activity.description }}</p>

          <div class="activity-details">
            <div class="detail-item">
              <span class="detail-icon">📅</span>
              <span class="detail-value">{{ formatDate(activity.scheduledAt) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-icon">⏱️</span>
              <span class="detail-value">{{ activity.duration }} 小时</span>
            </div>
            <div class="detail-item">
              <span class="detail-icon">👥</span>
              <span class="detail-value">{{ activity.participants }} / {{ activity.capacity }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-icon">💰</span>
              <span class="detail-value">¥{{ activity.cost.toLocaleString() }}</span>
            </div>
          </div>

          <div class="participation-bar">
            <div class="bar-fill" :style="{ width: participationRate(activity) + '%' }"></div>
            <span class="bar-text">{{ participationRate(activity).toFixed(0) }}% 参与率</span>
          </div>

          <div class="activity-rewards">
            <span class="reward-label">活动奖励:</span>
            <span class="reward-item" v-if="activity.rewards.loyalty">❤️ 忠诚度 +{{ activity.rewards.loyalty }}</span>
            <span class="reward-item" v-if="activity.rewards.engagement">📊 参与度 +{{ activity.rewards.engagement }}</span>
            <span class="reward-item" v-if="activity.rewards.fans">👥 粉丝 +{{ activity.rewards.fans }}</span>
            <span class="reward-item" v-if="activity.rewards.reputation">🏆 声望 +{{ activity.rewards.reputation }}</span>
          </div>

          <div class="activity-actions">
            <button
              v-if="activity.status === 'planning'"
              class="action-btn start"
              @click="startActivity(activity.id)"
            >
              开始活动
            </button>
            <button
              v-if="activity.status === 'ongoing'"
              class="action-btn complete"
              @click="completeActivity(activity.id)"
            >
              完成活动
            </button>
            <button
              v-if="activity.status === 'planning'"
              class="action-btn cancel"
              @click="cancelActivity(activity.id)"
            >
              取消
            </button>
          </div>
        </div>

        <p v-if="filteredActivities.length === 0" class="no-data">
          暂无{{ activeFilter !== 'all' ? getFilterName(activeFilter) : '' }}活动
        </p>
      </div>

      <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
        <div class="modal-content">
          <h3 class="modal-title">创建新活动</h3>

          <div class="form-group">
            <label>活动类型</label>
            <select v-model="newActivity.type">
              <option v-for="type in activityTypes" :key="type.id" :value="type.id">
                {{ type.icon }} {{ type.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>活动标题</label>
            <input v-model="newActivity.title" type="text" placeholder="输入活动标题" />
          </div>

          <div class="form-group">
            <label>活动描述</label>
            <textarea v-model="newActivity.description" placeholder="描述活动内容" rows="3"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>活动时间</label>
              <input v-model="newActivity.scheduledAt" type="datetime-local" />
            </div>
            <div class="form-group">
              <label>持续时间(小时)</label>
              <input v-model.number="newActivity.duration" type="number" min="1" max="24" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>活动容量</label>
              <input v-model.number="newActivity.capacity" type="number" min="10" max="10000" />
            </div>
            <div class="form-group">
              <label>预算(万)</label>
              <input v-model.number="newActivity.cost" type="number" min="0" max="1000" />
            </div>
          </div>

          <div class="modal-actions">
            <button class="modal-btn cancel" @click="showCreateModal = false">取消</button>
            <button class="modal-btn confirm" @click="createActivity" :disabled="!isFormValid">创建</button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useFanCommunityStore } from '@/stores/fanCommunity';
import { useClubStore } from '@/stores/club';
import type { FanActivity, ActivityType } from '@/types/fanCommunity';

const fanCommunityStore = useFanCommunityStore();
const clubStore = useClubStore();
const isReady = ref(false);
const showCreateModal = ref(false);
const activeFilter = ref('all');

const filters = [
  { id: 'all', name: '全部' },
  { id: 'planning', name: '计划中' },
  { id: 'ongoing', name: '进行中' },
  { id: 'completed', name: '已完成' },
];

const activityTypes = [
  { id: 'fan_meeting', name: '粉丝见面会', icon: '🤝' },
  { id: 'online_event', name: '线上活动', icon: '💻' },
  { id: 'watch_party', name: '观赛派对', icon: '📺' },
  { id: 'charity', name: '公益活动', icon: '❤️' },
  { id: 'merchandise', name: '周边发售', icon: '🛍️' },
  { id: 'training_open', name: '训练开放日', icon: '🏟️' },
];

const newActivity = ref({
  type: 'fan_meeting' as ActivityType,
  title: '',
  description: '',
  scheduledAt: '',
  duration: 2,
  capacity: 100,
  cost: 10,
});

onMounted(() => {
  const clubId = clubStore.club?.id || 'default';
  if (!fanCommunityStore.initialized) {
    fanCommunityStore.initialize(clubId);
  }
  isReady.value = true;
});

const activities = computed(() => fanCommunityStore.activities);

const filteredActivities = computed(() => {
  if (activeFilter.value === 'all') return activities.value;
  return activities.value.filter(a => a.status === activeFilter.value);
});

const planningCount = computed(() => activities.value.filter(a => a.status === 'planning').length);
const ongoingCount = computed(() => activities.value.filter(a => a.status === 'ongoing').length);
const completedCount = computed(() => activities.value.filter(a => a.status === 'completed').length);
const totalParticipants = computed(() => activities.value.reduce((sum, a) => sum + a.participants, 0));

const isFormValid = computed(() => {
  return newActivity.value.title.trim() !== '' &&
    newActivity.value.description.trim() !== '' &&
    newActivity.value.scheduledAt !== '';
});

function getActivityIcon(type: string): string {
  const activity = activityTypes.find(t => t.id === type);
  return activity?.icon || '📅';
}

function getActivityTypeName(type: string): string {
  const activity = activityTypes.find(t => t.id === type);
  return activity?.name || type;
}

function getStatusName(status: string): string {
  const names: Record<string, string> = {
    planning: '计划中',
    ongoing: '进行中',
    completed: '已完成',
    cancelled: '已取消',
  };
  return names[status] || status;
}

function getFilterName(filter: string): string {
  const filterObj = filters.find(f => f.id === filter);
  return filterObj?.name || '';
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function participationRate(activity: FanActivity): number {
  if (activity.capacity === 0) return 0;
  return (activity.participants / activity.capacity) * 100;
}

function createActivity() {
  if (!isFormValid.value) return;

  const activity = fanCommunityStore.addActivity({
    type: newActivity.value.type,
    title: newActivity.value.title,
    description: newActivity.value.description,
    scheduledAt: new Date(newActivity.value.scheduledAt),
    duration: newActivity.value.duration,
    capacity: newActivity.value.capacity,
    cost: newActivity.value.cost,
  });

  if (activity) {
    showCreateModal.value = false;
    resetForm();
  }
}

function resetForm() {
  newActivity.value = {
    type: 'fan_meeting',
    title: '',
    description: '',
    scheduledAt: '',
    duration: 2,
    capacity: 100,
    cost: 10,
  };
}

function startActivity(activityId: string) {
  fanCommunityStore.updateActivityStatus(activityId, 'ongoing');
}

function completeActivity(activityId: string) {
  fanCommunityStore.updateActivityStatus(activityId, 'completed');
}

function cancelActivity(activityId: string) {
  fanCommunityStore.updateActivityStatus(activityId, 'cancelled');
}
</script>

<style scoped>
.activities-page {
  padding: 15px;
  padding-bottom: 80px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.back-btn {
  color: #007bff;
  text-decoration: none;
  font-size: 14px;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
  color: #333;
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 15px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 24px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 11px;
  color: #666;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.create-btn {
  padding: 10px 20px;
  border: none;
  background: #007bff;
  color: white;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
}

.create-btn:hover {
  background: #0056b3;
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.activity-card.planning { border-left: 4px solid #ffc107; }
.activity-card.ongoing { border-left: 4px solid #28a745; }
.activity-card.completed { border-left: 4px solid #007bff; }
.activity-card.cancelled { border-left: 4px solid #dc3545; }

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.activity-type {
  font-size: 13px;
  font-weight: 500;
}

.activity-status {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.activity-status.planning { background: #fff3cd; color: #856404; }
.activity-status.ongoing { background: #d4edda; color: #155724; }
.activity-status.completed { background: #cce5ff; color: #004085; }
.activity-status.cancelled { background: #f8d7da; color: #721c24; }

.activity-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.activity-description {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: #666;
}

.activity-details {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
}

.detail-icon {
  font-size: 14px;
}

.participation-bar {
  height: 20px;
  background: #e0e0e0;
  border-radius: 10px;
  position: relative;
  margin-bottom: 12px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #28a745, #20c997);
  border-radius: 10px;
  transition: width 0.3s;
}

.bar-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 11px;
  font-weight: 600;
  color: #333;
}

.activity-rewards {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.reward-label {
  font-size: 12px;
  color: #666;
}

.reward-item {
  padding: 3px 8px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 11px;
  color: #333;
}

.activity-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn.start {
  background: #28a745;
  color: white;
}

.action-btn.complete {
  background: #007bff;
  color: white;
}

.action-btn.cancel {
  background: #dc3545;
  color: white;
}

.no-data {
  text-align: center;
  color: #999;
  padding: 40px;
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
  border-radius: 12px;
  padding: 20px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-title {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.modal-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.modal-btn.cancel {
  background: #f0f0f0;
  color: #333;
}

.modal-btn.confirm {
  background: #007bff;
  color: white;
}

.modal-btn.confirm:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useObjectiveStore } from '@/stores/objective';
import type { Milestone } from '@/types/objective';

const router = useRouter();
const objectiveStore = useObjectiveStore();

const selectedType = ref<'all' | 'achievement' | 'record' | 'special'>('all');
const selectedStatus = ref<'all' | 'unlocked' | 'locked'>('all');
const showDetails = ref<string | null>(null);

onMounted(() => {
  objectiveStore.initialize();
});

const filteredMilestones = computed(() => {
  let milestones = objectiveStore.milestones;

  if (selectedType.value !== 'all') {
    milestones = milestones.filter(m => m.type === selectedType.value);
  }

  if (selectedStatus.value === 'unlocked') {
    milestones = milestones.filter(m => m.unlocked);
  } else if (selectedStatus.value === 'locked') {
    milestones = milestones.filter(m => !m.unlocked);
  }

  return milestones;
});

const milestoneStats = computed(() => ({
  total: objectiveStore.milestones.length,
  unlocked: objectiveStore.getUnlockedMilestonesCount(),
  locked: objectiveStore.milestones.length - objectiveStore.getUnlockedMilestonesCount(),
  achievementUnlocked: objectiveStore.getMilestonesByType('achievement').filter(m => m.unlocked).length,
  recordUnlocked: objectiveStore.getMilestonesByType('record').filter(m => m.unlocked).length,
  specialUnlocked: objectiveStore.getMilestonesByType('special').filter(m => m.unlocked).length,
}));

const typeStats = computed(() => ({
  achievement: {
    total: objectiveStore.getMilestonesByType('achievement').length,
    unlocked: objectiveStore.getMilestonesByType('achievement').filter(m => m.unlocked).length,
  },
  record: {
    total: objectiveStore.getMilestonesByType('record').length,
    unlocked: objectiveStore.getMilestonesByType('record').filter(m => m.unlocked).length,
  },
  special: {
    total: objectiveStore.getMilestonesByType('special').length,
    unlocked: objectiveStore.getMilestonesByType('special').filter(m => m.unlocked).length,
  },
}));

function goBack() {
  router.back();
}

function toggleDetails(milestoneId: string) {
  showDetails.value = showDetails.value === milestoneId ? null : milestoneId;
}

function getMilestoneIcon(milestone: Milestone): string {
  if (!milestone.unlocked) return '🔒';
  
  switch (milestone.type) {
    case 'achievement': return '🏅';
    case 'record': return '🎖️';
    case 'special': return '👑';
    default: return '🏆';
  }
}

function getMilestoneBgClass(milestone: Milestone): string {
  if (!milestone.unlocked) return 'locked';
  
  switch (milestone.type) {
    case 'achievement': return 'achievement';
    case 'record': return 'record';
    case 'special': return 'special';
    default: return 'achievement';
  }
}

function formatDate(timestamp: number | undefined): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}
</script>

<template>
  <div class="milestones-page">
    <div class="page-header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <h1>里程碑</h1>
    </div>

    <div class="overview-section">
      <div class="main-progress">
        <div class="progress-circle">
          <svg viewBox="0 0 100 100">
            <circle
              class="progress-bg"
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e0e0e0"
              stroke-width="8"
            />
            <circle
              class="progress-fill"
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#gradient)"
              stroke-width="8"
              stroke-linecap="round"
              :stroke-dasharray="`${milestoneStats.unlocked / milestoneStats.total * 283} 283`"
              transform="rotate(-90 50 50)"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#6c5ce7" />
                <stop offset="100%" stop-color="#a29bfe" />
              </linearGradient>
            </defs>
          </svg>
          <div class="progress-text">
            <div class="progress-value">{{ milestoneStats.unlocked }}</div>
            <div class="progress-label">/ {{ milestoneStats.total }}</div>
          </div>
        </div>
        <div class="progress-info">
          <h2>里程碑成就</h2>
          <p>解锁进度: {{ Math.round(milestoneStats.unlocked / milestoneStats.total * 100) }}%</p>
        </div>
      </div>

      <div class="type-breakdown">
        <div class="type-item achievement">
          <div class="type-icon">🏅</div>
          <div class="type-info">
            <div class="type-name">成就</div>
            <div class="type-count">{{ typeStats.achievement.unlocked }}/{{ typeStats.achievement.total }}</div>
          </div>
          <div class="type-bar">
            <div 
              class="type-fill"
              :style="{ width: `${typeStats.achievement.unlocked / typeStats.achievement.total * 100}%` }"
            ></div>
          </div>
        </div>

        <div class="type-item record">
          <div class="type-icon">🎖️</div>
          <div class="type-info">
            <div class="type-name">纪录</div>
            <div class="type-count">{{ typeStats.record.unlocked }}/{{ typeStats.record.total }}</div>
          </div>
          <div class="type-bar">
            <div 
              class="type-fill"
              :style="{ width: `${typeStats.record.unlocked / typeStats.record.total * 100}%` }"
            ></div>
          </div>
        </div>

        <div class="type-item special">
          <div class="type-icon">👑</div>
          <div class="type-info">
            <div class="type-name">特殊</div>
            <div class="type-count">{{ typeStats.special.unlocked }}/{{ typeStats.special.total }}</div>
          </div>
          <div class="type-bar">
            <div 
              class="type-fill"
              :style="{ width: `${typeStats.special.unlocked / typeStats.special.total * 100}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-group">
          <span class="filter-label">类型:</span>
          <div class="filter-buttons">
            <button 
              class="filter-btn"
              :class="{ active: selectedType === 'all' }"
              @click="selectedType = 'all'"
            >
              全部
            </button>
            <button 
              class="filter-btn achievement"
              :class="{ active: selectedType === 'achievement' }"
              @click="selectedType = 'achievement'"
            >
              成就
            </button>
            <button 
              class="filter-btn record"
              :class="{ active: selectedType === 'record' }"
              @click="selectedType = 'record'"
            >
              纪录
            </button>
            <button 
              class="filter-btn special"
              :class="{ active: selectedType === 'special' }"
              @click="selectedType = 'special'"
            >
              特殊
            </button>
          </div>
        </div>

        <div class="filter-group">
          <span class="filter-label">状态:</span>
          <div class="filter-buttons">
            <button 
              class="filter-btn"
              :class="{ active: selectedStatus === 'all' }"
              @click="selectedStatus = 'all'"
            >
              全部
            </button>
            <button 
              class="filter-btn unlocked"
              :class="{ active: selectedStatus === 'unlocked' }"
              @click="selectedStatus = 'unlocked'"
            >
              已解锁
            </button>
            <button 
              class="filter-btn locked"
              :class="{ active: selectedStatus === 'locked' }"
              @click="selectedStatus = 'locked'"
            >
              未解锁
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="milestones-grid">
      <div 
        v-for="milestone in filteredMilestones" 
        :key="milestone.id"
        class="milestone-card"
        :class="getMilestoneBgClass(milestone)"
        @click="toggleDetails(milestone.id)"
      >
        <div class="milestone-header">
          <div class="milestone-icon">{{ getMilestoneIcon(milestone) }}</div>
          <div class="milestone-title-area">
            <div class="milestone-title">{{ milestone.title }}</div>
            <div class="milestone-type-tag" :class="milestone.type">
              {{ milestone.type === 'achievement' ? '成就' : milestone.type === 'record' ? '纪录' : '特殊' }}
            </div>
          </div>
          <div v-if="milestone.unlocked" class="unlocked-badge">
            ✓
          </div>
        </div>

        <div class="milestone-description">{{ milestone.description }}</div>

        <div v-if="showDetails === milestone.id" class="milestone-details">
          <div class="detail-row">
            <span class="detail-label">解锁条件:</span>
            <span class="detail-value">{{ milestone.condition.metric }} 达到 {{ milestone.condition.target }}</span>
          </div>
          <div v-if="milestone.unlocked" class="detail-row">
            <span class="detail-label">解锁时间:</span>
            <span class="detail-value">{{ formatDate(milestone.unlockedAt) }}</span>
          </div>
          <div v-if="milestone.unlocked" class="detail-row">
            <span class="detail-label">解锁赛季:</span>
            <span class="detail-value">第 {{ milestone.season }} 赛季</span>
          </div>
          <div class="rewards-preview">
            <span class="rewards-label">奖励:</span>
            <div class="rewards-items">
              <span v-if="milestone.rewards.funds" class="reward-item">
                💰 {{ milestone.rewards.funds }}万
              </span>
              <span v-if="milestone.rewards.reputation" class="reward-item">
                ⭐ {{ milestone.rewards.reputation }}
              </span>
              <span v-if="milestone.rewards.fans" class="reward-item">
                👥 {{ milestone.rewards.fans }}
              </span>
              <span v-if="milestone.rewards.special" class="reward-item special">
                🎁 {{ milestone.rewards.special }}
              </span>
            </div>
          </div>
        </div>

        <div v-else class="rewards-mini">
          <span v-if="milestone.rewards.funds">💰{{ milestone.rewards.funds }}</span>
          <span v-if="milestone.rewards.reputation">⭐{{ milestone.rewards.reputation }}</span>
        </div>
      </div>
    </div>

    <div v-if="filteredMilestones.length === 0" class="empty-state">
      <div class="empty-icon">🏆</div>
      <div class="empty-text">暂无符合条件的里程碑</div>
    </div>

    <div class="recent-unlocks" v-if="objectiveStore.unlockedMilestones.length > 0">
      <h3 class="section-title">最近解锁</h3>
      <div class="unlock-list">
        <div 
          v-for="(record, index) in objectiveStore.unlockedMilestones.slice(-5).reverse()" 
          :key="record.milestoneId"
          class="unlock-item"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="unlock-icon">🏆</div>
          <div class="unlock-info">
            <div class="unlock-title">{{ record.title }}</div>
            <div class="unlock-season">第 {{ record.season }} 赛季</div>
          </div>
          <div class="unlock-date">{{ formatDate(record.unlockedAt) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.milestones-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 80px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.back-btn {
  padding: 8px 16px;
  background: #f5f5f5;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.overview-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.main-progress {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.progress-circle {
  position: relative;
  width: 100px;
  height: 100px;
}

.progress-circle svg {
  transform: rotate(0deg);
}

.progress-fill {
  transition: stroke-dasharray 0.5s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.progress-value {
  font-size: 24px;
  font-weight: bold;
  color: #6c5ce7;
}

.progress-label {
  font-size: 12px;
  color: #999;
}

.progress-info h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #333;
}

.progress-info p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.type-breakdown {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.type-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.type-icon {
  font-size: 24px;
}

.type-info {
  flex: 1;
}

.type-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.type-count {
  font-size: 12px;
  color: #999;
}

.type-bar {
  width: 100px;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.type-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.type-item.achievement .type-fill { background: #4caf50; }
.type-item.record .type-fill { background: #2196f3; }
.type-item.special .type-fill { background: #e91e63; }

.filter-section {
  background: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-label {
  font-size: 14px;
  color: #666;
  min-width: 40px;
}

.filter-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 15px;
  background: #f5f5f5;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn.active {
  background: #6c5ce7;
  color: white;
}

.filter-btn.achievement.active { background: #4caf50; }
.filter-btn.record.active { background: #2196f3; }
.filter-btn.special.active { background: #e91e63; }
.filter-btn.unlocked.active { background: #4caf50; }
.filter-btn.locked.active { background: #9e9e9e; }

.milestones-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.milestone-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid #e0e0e0;
}

.milestone-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.milestone-card.achievement { border-left-color: #4caf50; }
.milestone-card.record { border-left-color: #2196f3; }
.milestone-card.special { border-left-color: #e91e63; }

.milestone-card.locked {
  opacity: 0.6;
}

.milestone-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.milestone-icon {
  font-size: 28px;
}

.milestone-title-area {
  flex: 1;
}

.milestone-title {
  font-weight: bold;
  font-size: 14px;
  color: #333;
}

.milestone-type-tag {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  margin-top: 2px;
}

.milestone-type-tag.achievement {
  background: #e8f5e9;
  color: #4caf50;
}

.milestone-type-tag.record {
  background: #e3f2fd;
  color: #2196f3;
}

.milestone-type-tag.special {
  background: #fce4ec;
  color: #e91e63;
}

.unlocked-badge {
  width: 24px;
  height: 24px;
  background: #4caf50;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.milestone-description {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.milestone-details {
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
  margin-top: 10px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 12px;
}

.detail-label {
  color: #999;
}

.detail-value {
  color: #333;
  font-weight: 500;
}

.rewards-preview {
  margin-top: 10px;
  padding: 8px;
  background: #f9f9f9;
  border-radius: 6px;
}

.rewards-label {
  font-size: 12px;
  color: #999;
  display: block;
  margin-bottom: 6px;
}

.rewards-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.reward-item {
  font-size: 12px;
  color: #4caf50;
}

.reward-item.special {
  background: linear-gradient(135deg, #fff3e0, #ffe0b2);
  padding: 2px 8px;
  border-radius: 10px;
  color: #e65100;
}

.rewards-mini {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.empty-text {
  font-size: 14px;
}

.recent-unlocks {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #333;
}

.unlock-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.unlock-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
  animation: fadeInUp 0.3s ease forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.unlock-icon {
  font-size: 24px;
}

.unlock-info {
  flex: 1;
}

.unlock-title {
  font-weight: 500;
  font-size: 14px;
  color: #333;
}

.unlock-season {
  font-size: 12px;
  color: #999;
}

.unlock-date {
  font-size: 12px;
  color: #666;
}
</style>

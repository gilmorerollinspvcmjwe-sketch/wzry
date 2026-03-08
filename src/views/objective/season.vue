<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useObjectiveStore } from '@/stores/objective';
import type { SeasonObjective } from '@/types/objective';

const router = useRouter();
const objectiveStore = useObjectiveStore();

const selectedFilter = ref<'all' | 'primary' | 'secondary' | 'special'>('all');
const selectedStatus = ref<'all' | 'in_progress' | 'completed' | 'failed'>('all');
const showHistory = ref(false);

onMounted(() => {
  objectiveStore.initialize();
});

const filteredObjectives = computed(() => {
  let objectives: SeasonObjective[] = [];

  if (selectedFilter.value === 'all') {
    objectives = objectiveStore.objectives;
  } else if (selectedFilter.value === 'primary') {
    objectives = objectiveStore.primaryObjective ? [objectiveStore.primaryObjective] : [];
  } else if (selectedFilter.value === 'secondary') {
    objectives = objectiveStore.secondaryObjectives;
  } else if (selectedFilter.value === 'special') {
    objectives = objectiveStore.specialObjectives;
  }

  if (selectedStatus.value === 'in_progress') {
    objectives = objectives.filter(o => !o.completed && !o.failed);
  } else if (selectedStatus.value === 'completed') {
    objectives = objectives.filter(o => o.completed);
  } else if (selectedStatus.value === 'failed') {
    objectives = objectives.filter(o => o.failed);
  }

  return objectives;
});

const seasonStats = computed(() => ({
  total: objectiveStore.totalCount,
  completed: objectiveStore.completedCount,
  inProgress: objectiveStore.objectives.filter(o => !o.completed && !o.failed).length,
  failed: objectiveStore.objectives.filter(o => o.failed).length,
  progress: objectiveStore.progressPercentage,
}));

function goBack() {
  router.back();
}

function getObjectiveProgress(objective: SeasonObjective): number {
  return Math.min(100, (objective.condition.current / objective.condition.target) * 100);
}

function getProgressStatus(progress: number): 'low' | 'medium' | 'high' | 'complete' {
  if (progress >= 100) return 'complete';
  if (progress >= 70) return 'high';
  if (progress >= 40) return 'medium';
  return 'low';
}

function getDeadlineWarning(objective: SeasonObjective): string | null {
  if (!objective.deadline || objective.completed || objective.failed) return null;
  const remaining = objective.deadline - objectiveStore.currentWeek;
  if (remaining <= 0) return '已超时';
  if (remaining <= 2) return `剩余 ${remaining} 周`;
  return null;
}
</script>

<template>
  <div class="season-objectives-page">
    <div class="page-header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <h1>赛季目标</h1>
      <div class="season-badge">第 {{ objectiveStore.currentSeason }} 赛季</div>
    </div>

    <div class="stats-overview">
      <div class="stat-item">
        <div class="stat-number">{{ seasonStats.total }}</div>
        <div class="stat-label">总目标</div>
      </div>
      <div class="stat-item completed">
        <div class="stat-number">{{ seasonStats.completed }}</div>
        <div class="stat-label">已完成</div>
      </div>
      <div class="stat-item progress">
        <div class="stat-number">{{ seasonStats.inProgress }}</div>
        <div class="stat-label">进行中</div>
      </div>
      <div class="stat-item failed">
        <div class="stat-number">{{ seasonStats.failed }}</div>
        <div class="stat-label">已失败</div>
      </div>
    </div>

    <div class="progress-section">
      <div class="progress-header">
        <span>整体进度</span>
        <span class="progress-value">{{ seasonStats.progress }}%</span>
      </div>
      <div class="progress-bar-container">
        <div 
          class="progress-bar-fill"
          :style="{ width: `${seasonStats.progress}%` }"
        ></div>
      </div>
    </div>

    <div class="filter-section">
      <div class="filter-group">
        <span class="filter-label">类型:</span>
        <div class="filter-buttons">
          <button 
            class="filter-btn"
            :class="{ active: selectedFilter === 'all' }"
            @click="selectedFilter = 'all'"
          >
            全部
          </button>
          <button 
            class="filter-btn primary"
            :class="{ active: selectedFilter === 'primary' }"
            @click="selectedFilter = 'primary'"
          >
            主要
          </button>
          <button 
            class="filter-btn secondary"
            :class="{ active: selectedFilter === 'secondary' }"
            @click="selectedFilter = 'secondary'"
          >
            次要
          </button>
          <button 
            class="filter-btn special"
            :class="{ active: selectedFilter === 'special' }"
            @click="selectedFilter = 'special'"
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
            class="filter-btn"
            :class="{ active: selectedStatus === 'in_progress' }"
            @click="selectedStatus = 'in_progress'"
          >
            进行中
          </button>
          <button 
            class="filter-btn"
            :class="{ active: selectedStatus === 'completed' }"
            @click="selectedStatus = 'completed'"
          >
            已完成
          </button>
          <button 
            class="filter-btn"
            :class="{ active: selectedStatus === 'failed' }"
            @click="selectedStatus = 'failed'"
          >
            已失败
          </button>
        </div>
      </div>
    </div>

    <div class="objectives-list">
      <div 
        v-for="objective in filteredObjectives" 
        :key="objective.id"
        class="objective-item"
        :class="[
          objective.category,
          { completed: objective.completed, failed: objective.failed }
        ]"
      >
        <div class="objective-main">
          <div class="objective-left">
            <div class="category-indicator" :class="objective.category"></div>
            <div class="objective-info">
              <div class="objective-title-row">
                <span 
                  class="objective-title"
                  :style="{ color: objectiveStore.getDifficultyColor(objective.difficulty) }"
                >
                  {{ objective.title }}
                </span>
                <span 
                  class="difficulty-tag"
                  :style="{ backgroundColor: objectiveStore.getDifficultyColor(objective.difficulty) }"
                >
                  {{ objectiveStore.getDifficultyText(objective.difficulty) }}
                </span>
                <span v-if="getDeadlineWarning(objective)" class="deadline-warning">
                  {{ getDeadlineWarning(objective) }}
                </span>
              </div>
              <div class="objective-desc">{{ objective.description }}</div>
            </div>
          </div>

          <div class="objective-right">
            <div v-if="objective.completed" class="status-tag completed">
              ✓ 已完成
            </div>
            <div v-else-if="objective.failed" class="status-tag failed">
              ✗ 失败
            </div>
            <div v-else class="status-tag in-progress">
              进行中
            </div>
          </div>
        </div>

        <div class="objective-progress-section">
          <div class="progress-info">
            <span class="current-value">{{ objective.condition.current }}</span>
            <span class="separator">/</span>
            <span class="target-value">{{ objective.condition.target }}</span>
          </div>
          <div class="progress-track">
            <div 
              class="progress-fill"
              :class="getProgressStatus(getObjectiveProgress(objective))"
              :style="{ width: `${getObjectiveProgress(objective)}%` }"
            ></div>
          </div>
          <div class="progress-percentage">{{ Math.round(getObjectiveProgress(objective)) }}%</div>
        </div>

        <div class="objective-footer">
          <div class="rewards-section">
            <span class="section-label">奖励:</span>
            <div class="rewards-list">
              <span v-if="objective.rewards.funds" class="reward">
                💰 {{ objective.rewards.funds }}万
              </span>
              <span v-if="objective.rewards.reputation" class="reward">
                ⭐ {{ objective.rewards.reputation }}
              </span>
              <span v-if="objective.rewards.fans" class="reward">
                👥 {{ objective.rewards.fans }}
              </span>
              <span v-if="objective.rewards.special" class="reward special">
                🎁 {{ objective.rewards.special }}
              </span>
            </div>
          </div>

          <div v-if="objective.penalty && !objective.completed" class="penalty-section">
            <span class="section-label penalty">失败惩罚:</span>
            <div class="penalty-list">
              <span v-if="objective.penalty.funds" class="penalty">
                💰 {{ objective.penalty.funds }}万
              </span>
              <span v-if="objective.penalty.reputation" class="penalty">
                ⭐ {{ objective.penalty.reputation }}
              </span>
              <span v-if="objective.penalty.patience" class="penalty">
                📉 耐心度 {{ objective.penalty.patience }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredObjectives.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <div class="empty-text">暂无符合条件的目标</div>
      </div>
    </div>

    <div class="history-section">
      <button 
        class="history-toggle"
        @click="showHistory = !showHistory"
      >
        <span class="toggle-icon">{{ showHistory ? '▼' : '▶' }}</span>
        <span>历史赛季记录</span>
      </button>

      <div v-if="showHistory" class="history-list">
        <div 
          v-for="season in objectiveStore.seasonHistory" 
          :key="`${season.season}-${season.phase}`"
          class="history-item"
        >
          <div class="history-header">
            <span class="history-title">
              {{ season.year }}{{ season.phase === 'spring' ? '春季' : '夏季' }}赛
            </span>
            <span 
              class="evaluation-tag"
              :class="season.evaluation.toLowerCase()"
            >
              {{ season.evaluation }}级
            </span>
          </div>
          <div class="history-stats">
            <div class="history-stat">
              <span class="stat-label">排名</span>
              <span class="stat-value">第{{ season.finalRanking }}名</span>
            </div>
            <div class="history-stat">
              <span class="stat-label">战绩</span>
              <span class="stat-value">{{ season.wins }}胜{{ season.losses }}负</span>
            </div>
            <div class="history-stat">
              <span class="stat-label">目标完成</span>
              <span class="stat-value">{{ season.objectivesCompleted }}/{{ season.totalObjectives }}</span>
            </div>
          </div>
          <div class="history-comment">"{{ season.boardComment }}"</div>
        </div>

        <div v-if="objectiveStore.seasonHistory.length === 0" class="history-empty">
          暂无历史记录
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.season-objectives-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 80px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 15px;
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
  flex: 1;
}

.season-badge {
  padding: 4px 12px;
  background: #6c5ce7;
  color: white;
  border-radius: 15px;
  font-size: 12px;
  font-weight: bold;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.stat-item {
  background: white;
  border-radius: 10px;
  padding: 15px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.stat-item.completed .stat-number { color: #4caf50; }
.stat-item.progress .stat-number { color: #2196f3; }
.stat-item.failed .stat-number { color: #f44336; }

.stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.progress-section {
  background: white;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
  color: #666;
}

.progress-value {
  font-weight: bold;
  color: #6c5ce7;
}

.progress-bar-container {
  height: 12px;
  background: #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #6c5ce7, #a29bfe);
  border-radius: 6px;
  transition: width 0.3s ease;
}

.filter-section {
  background: white;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.filter-group:last-child {
  margin-bottom: 0;
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

.filter-btn.primary.active { background: #6c5ce7; }
.filter-btn.secondary.active { background: #2196f3; }
.filter-btn.special.active { background: #ffc107; color: #333; }

.objectives-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.objective-item {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #6c5ce7;
  transition: transform 0.2s ease;
}

.objective-item:hover {
  transform: translateX(4px);
}

.objective-item.primary { border-left-color: #6c5ce7; }
.objective-item.secondary { border-left-color: #2196f3; }
.objective-item.special { border-left-color: #ffc107; }
.objective-item.completed { border-left-color: #4caf50; opacity: 0.8; }
.objective-item.failed { border-left-color: #f44336; opacity: 0.6; }

.objective-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.objective-left {
  display: flex;
  gap: 12px;
  flex: 1;
}

.category-indicator {
  width: 4px;
  border-radius: 2px;
  background: #6c5ce7;
}

.category-indicator.primary { background: #6c5ce7; }
.category-indicator.secondary { background: #2196f3; }
.category-indicator.special { background: #ffc107; }

.objective-info {
  flex: 1;
}

.objective-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.objective-title {
  font-weight: bold;
  font-size: 16px;
}

.difficulty-tag {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  color: white;
}

.deadline-warning {
  padding: 2px 8px;
  background: #fff3e0;
  color: #e65100;
  border-radius: 10px;
  font-size: 10px;
}

.objective-desc {
  font-size: 13px;
  color: #666;
}

.objective-right {
  flex-shrink: 0;
}

.status-tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.status-tag.completed {
  background: #e8f5e9;
  color: #4caf50;
}

.status-tag.failed {
  background: #ffebee;
  color: #f44336;
}

.status-tag.in-progress {
  background: #e3f2fd;
  color: #2196f3;
}

.objective-progress-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.progress-info {
  display: flex;
  align-items: baseline;
  gap: 2px;
  min-width: 80px;
}

.current-value {
  font-size: 18px;
  font-weight: bold;
  color: #6c5ce7;
}

.separator {
  color: #ccc;
}

.target-value {
  font-size: 14px;
  color: #999;
}

.progress-track {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-fill.low { background: #f44336; }
.progress-fill.medium { background: #ff9800; }
.progress-fill.high { background: #2196f3; }
.progress-fill.complete { background: #4caf50; }

.progress-percentage {
  font-size: 12px;
  font-weight: bold;
  color: #666;
  min-width: 40px;
  text-align: right;
}

.objective-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.rewards-section,
.penalty-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-label {
  font-size: 12px;
  color: #999;
}

.section-label.penalty {
  color: #f44336;
}

.rewards-list,
.penalty-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.reward,
.penalty {
  font-size: 12px;
  color: #4caf50;
}

.penalty {
  color: #f44336;
}

.reward.special {
  background: linear-gradient(135deg, #fff3e0, #ffe0b2);
  padding: 2px 8px;
  border-radius: 10px;
  color: #e65100;
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

.history-section {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.history-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: none;
  border: none;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  text-align: left;
}

.toggle-icon {
  font-size: 12px;
  color: #999;
}

.history-list {
  padding: 0 15px 15px;
}

.history-item {
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 10px;
}

.history-item:last-child {
  margin-bottom: 0;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.history-title {
  font-weight: bold;
  color: #333;
}

.evaluation-tag {
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: bold;
  color: white;
}

.evaluation-tag.s { background: linear-gradient(135deg, #ffc107, #ff9800); }
.evaluation-tag.a { background: #4caf50; }
.evaluation-tag.b { background: #2196f3; }
.evaluation-tag.c { background: #ff9800; }
.evaluation-tag.d { background: #f44336; }

.history-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 8px;
}

.history-stat {
  display: flex;
  flex-direction: column;
}

.history-stat .stat-label {
  font-size: 11px;
  color: #999;
}

.history-stat .stat-value {
  font-size: 13px;
  font-weight: bold;
  color: #333;
}

.history-comment {
  font-size: 12px;
  color: #666;
  font-style: italic;
  padding: 8px;
  background: white;
  border-radius: 6px;
}

.history-empty {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
}
</style>

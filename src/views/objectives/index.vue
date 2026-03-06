<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSeasonObjectiveStore } from '@/stores/seasonObjective';

const router = useRouter();
const objectiveStore = useSeasonObjectiveStore();

const selectedTab = ref<'current' | 'history'>('current');

onMounted(() => {
  objectiveStore.initialize();
});

function getDifficultyColor(difficulty: string): string {
  const colors: Record<string, string> = {
    easy: '#4caf50',
    medium: '#2196f3',
    hard: '#ff9800',
    legend: '#ffc107',
  };
  return colors[difficulty] || '#999';
}

function getDifficultyText(difficulty: string): string {
  const texts: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
    legend: '传奇',
  };
  return texts[difficulty] || difficulty;
}

function getExpectationText(level: string): string {
  const texts: Record<string, string> = {
    survival: '保级',
    playoff: '季后赛',
    championship: '冠军',
    dynasty: '王朝',
  };
  return texts[level] || level;
}

function getTrendIcon(trend: string): string {
  if (trend === 'up') return '↗';
  if (trend === 'down') return '↘';
  return '→';
}

function goBack() {
  router.back();
}
</script>

<template>
  <div class="objectives-page">
    <div class="page-header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <h1>赛季目标</h1>
    </div>

    <!-- 标签切换 -->
    <div class="tab-bar">
      <button 
        class="tab-btn"
        :class="{ active: selectedTab === 'current' }"
        @click="selectedTab = 'current'"
      >
        当前目标
      </button>
      <button 
        class="tab-btn"
        :class="{ active: selectedTab === 'history' }"
        @click="selectedTab = 'history'"
      >
        历史赛季
      </button>
    </div>

    <!-- 当前目标页面 -->
    <div v-if="selectedTab === 'current'" class="tab-content">
      <!-- 董事会信息 -->
      <div class="board-section">
        <h3>董事会期望</h3>
        <div class="board-info">
          <div class="expectation-level">
            <span class="label">期望：</span>
            <span class="value">{{ getExpectationText(objectiveStore.expectationLevel) }}</span>
          </div>
          <div class="patience-bar">
            <span class="label">董事会耐心度：</span>
            <div class="bar-container">
              <div 
                class="bar-fill"
                :class="{ 
                  high: objectiveStore.patience >= 70,
                  medium: objectiveStore.patience >= 40 && objectiveStore.patience < 70,
                  low: objectiveStore.patience < 40
                }"
                :style="{ width: `${objectiveStore.patience}%` }"
              ></div>
            </div>
            <span class="patience-value">{{ objectiveStore.patience }}%</span>
          </div>
          <div class="next-evaluation">
            <span>下次评价：第 {{ objectiveStore.getNextEvaluationWeek() }} 周</span>
          </div>
        </div>
        
        <!-- 董事会评价 -->
        <div v-if="objectiveStore.boardExpectation" class="board-comment">
          <div class="comment-header">
            <span class="trend" :class="objectiveStore.boardExpectation.evaluation.trend">
              {{ getTrendIcon(objectiveStore.boardExpectation.evaluation.trend) }}
            </span>
            <span class="performance">
              表现评分：{{ objectiveStore.boardExpectation.evaluation.performance }}
            </span>
          </div>
          <p class="comment-text">{{ objectiveStore.boardExpectation.evaluation.comments }}</p>
        </div>
      </div>

      <!-- 目标进度 -->
      <div class="objectives-progress">
        <span>完成进度：{{ objectiveStore.completedCount }} / {{ objectiveStore.totalCount }}</span>
      </div>

      <!-- 主要目标 -->
      <div v-if="objectiveStore.primaryObjective" class="section">
        <h3>主要目标</h3>
        <div 
          class="objective-card primary"
          :class="{ completed: objectiveStore.primaryObjective.completed, failed: objectiveStore.primaryObjective.failed }"
        >
          <div class="objective-header">
            <span 
              class="objective-title"
              :style="{ color: getDifficultyColor(objectiveStore.primaryObjective.difficulty) }"
            >
              {{ objectiveStore.primaryObjective.title }}
            </span>
            <span 
              class="difficulty-badge"
              :style="{ backgroundColor: getDifficultyColor(objectiveStore.primaryObjective.difficulty) }"
            >
              {{ getDifficultyText(objectiveStore.primaryObjective.difficulty) }}
            </span>
          </div>
          <p class="objective-description">{{ objectiveStore.primaryObjective.description }}</p>
          <div class="objective-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill"
                :class="{ completed: objectiveStore.primaryObjective.completed }"
                :style="{ width: `${(objectiveStore.primaryObjective.condition.current / objectiveStore.primaryObjective.condition.target) * 100}%` }"
              ></div>
            </div>
            <span class="progress-text">
              {{ objectiveStore.primaryObjective.condition.current }} / {{ objectiveStore.primaryObjective.condition.target }}
            </span>
          </div>
          <div class="objective-rewards">
            <span>奖励：</span>
            <span v-if="objectiveStore.primaryObjective.rewards.funds">💰 {{ objectiveStore.primaryObjective.rewards.funds }}万</span>
            <span v-if="objectiveStore.primaryObjective.rewards.reputation">⭐ {{ objectiveStore.primaryObjective.rewards.reputation }}</span>
            <span v-if="objectiveStore.primaryObjective.rewards.fans">👥 {{ objectiveStore.primaryObjective.rewards.fans }}</span>
          </div>
          <div v-if="objectiveStore.primaryObjective.completed" class="status-badge completed">
            ✓ 已完成
          </div>
          <div v-else-if="objectiveStore.primaryObjective.failed" class="status-badge failed">
            ✗ 未完成
          </div>
        </div>
      </div>

      <!-- 次要目标 -->
      <div v-if="objectiveStore.secondaryObjectives.length > 0" class="section">
        <h3>次要目标</h3>
        <div class="secondary-objectives">
          <div 
            v-for="objective in objectiveStore.secondaryObjectives" 
            :key="objective.id"
            class="objective-card secondary"
            :class="{ completed: objective.completed, failed: objective.failed }"
          >
            <div class="objective-header">
              <span 
                class="objective-title"
                :style="{ color: getDifficultyColor(objective.difficulty) }"
              >
                {{ objective.title }}
              </span>
              <span 
                v-if="objective.completed"
                class="status-icon completed"
              >
                ✓
              </span>
            </div>
            <p class="objective-description">{{ objective.description }}</p>
            <div class="objective-progress">
              <div class="progress-bar small">
                <div 
                  class="progress-fill"
                  :class="{ completed: objective.completed }"
                  :style="{ width: `${(objective.condition.current / objective.condition.target) * 100}%` }"
                ></div>
              </div>
              <span class="progress-text">
                {{ objective.condition.current }} / {{ objective.condition.target }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 历史赛季页面 -->
    <div v-if="selectedTab === 'history'" class="tab-content">
      <div v-if="objectiveStore.seasonHistory.length === 0" class="empty-state">
        暂无历史赛季数据
      </div>
      <div v-else class="season-history">
        <div 
          v-for="season in objectiveStore.seasonHistory" 
          :key="`${season.season}-${season.phase}`"
          class="season-card"
        >
          <div class="season-header">
            <span class="season-title">{{ season.year }}{{ season.phase === 'spring' ? '春季' : '夏季' }}赛</span>
            <span 
              class="evaluation-badge"
              :class="{ s: season.evaluation === 'S', a: season.evaluation === 'A', b: season.evaluation === 'B', c: season.evaluation === 'C', d: season.evaluation === 'D' }"
            >
              {{ season.evaluation }}
            </span>
          </div>
          <div class="season-stats">
            <div class="stat">
              <span class="stat-label">排名</span>
              <span class="stat-value">第{{ season.finalRanking }}名</span>
            </div>
            <div class="stat">
              <span class="stat-label">战绩</span>
              <span class="stat-value">{{ season.wins }}胜 {{ season.losses }}负</span>
            </div>
            <div class="stat">
              <span class="stat-label">胜率</span>
              <span class="stat-value">{{ season.winRate.toFixed(1) }}%</span>
            </div>
            <div class="stat">
              <span class="stat-label">目标完成</span>
              <span class="stat-value">{{ season.objectivesCompleted }}/{{ season.totalObjectives }}</span>
            </div>
          </div>
          <div class="season-rewards">
            <span>获得奖励：</span>
            <span v-if="season.rewards.funds">💰 {{ season.rewards.funds }}万</span>
            <span v-if="season.rewards.reputation">⭐ {{ season.rewards.reputation }}</span>
            <span v-if="season.rewards.fans">👥 {{ season.rewards.fans }}</span>
          </div>
          <p class="board-comment">"{{ season.boardComment }}"</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.objectives-page {
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

/* 标签栏 */
.tab-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: #f5f5f5;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: #007bff;
  color: white;
}

/* 董事会信息 */
.board-section {
  background: #f9f9f9;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 20px;
}

.board-section h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #333;
}

.board-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.expectation-level {
  display: flex;
  align-items: center;
  gap: 10px;
}

.expectation-level .label {
  color: #666;
}

.expectation-level .value {
  font-weight: bold;
  color: #007bff;
}

.patience-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.patience-bar .label {
  color: #666;
  font-size: 14px;
}

.bar-container {
  flex: 1;
  height: 10px;
  background: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 0.3s ease;
}

.bar-fill.high {
  background: #4caf50;
}

.bar-fill.medium {
  background: #ff9800;
}

.bar-fill.low {
  background: #f44336;
}

.patience-value {
  font-weight: bold;
  min-width: 40px;
}

.next-evaluation {
  font-size: 12px;
  color: #999;
}

.board-comment {
  margin-top: 15px;
  padding: 10px;
  background: white;
  border-radius: 8px;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.trend {
  font-size: 18px;
  font-weight: bold;
}

.trend.up {
  color: #4caf50;
}

.trend.down {
  color: #f44336;
}

.performance {
  font-weight: bold;
  color: #333;
}

.comment-text {
  margin: 0;
  color: #666;
  font-size: 13px;
}

/* 目标进度 */
.objectives-progress {
  text-align: center;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

/* 目标卡片 */
.section {
  margin-bottom: 20px;
}

.section h3 {
  font-size: 16px;
  color: #333;
  margin-bottom: 10px;
}

.objective-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

.objective-card.primary {
  border-left: 4px solid #007bff;
}

.objective-card.completed {
  border-left-color: #4caf50;
}

.objective-card.failed {
  border-left-color: #f44336;
  opacity: 0.7;
}

.objective-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.objective-title {
  font-weight: bold;
  font-size: 16px;
}

.difficulty-badge {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  color: white;
}

.objective-description {
  color: #666;
  font-size: 13px;
  margin: 0 0 10px 0;
}

.objective-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.progress-bar {
  flex: 1;
  height: 12px;
  background: #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.progress-bar.small {
  height: 8px;
}

.progress-fill {
  height: 100%;
  background: #007bff;
  border-radius: 6px;
  transition: width 0.3s ease;
}

.progress-fill.completed {
  background: #4caf50;
}

.progress-text {
  font-size: 12px;
  color: #666;
  min-width: 60px;
  text-align: right;
}

.objective-rewards {
  font-size: 12px;
  color: #666;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.objective-rewards span:first-child {
  font-weight: bold;
}

.status-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: bold;
}

.status-badge.completed {
  background: #4caf50;
  color: white;
}

.status-badge.failed {
  background: #f44336;
  color: white;
}

.status-icon.completed {
  color: #4caf50;
  font-size: 20px;
  font-weight: bold;
}

/* 次要目标 */
.secondary-objectives {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.secondary .objective-title {
  font-size: 14px;
}

/* 历史赛季 */
.season-history {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.season-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.season-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.season-title {
  font-weight: bold;
  font-size: 16px;
  color: #333;
}

.evaluation-badge {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: bold;
  color: white;
}

.evaluation-badge.s {
  background: linear-gradient(135deg, #ffc107, #ff9800);
}

.evaluation-badge.a {
  background: #4caf50;
}

.evaluation-badge.b {
  background: #2196f3;
}

.evaluation-badge.c {
  background: #ff9800;
}

.evaluation-badge.d {
  background: #f44336;
}

.season-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 15px;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.stat-value {
  font-weight: bold;
  color: #333;
}

.season-rewards {
  font-size: 12px;
  color: #666;
  margin-bottom: 10px;
}

.season-rewards span:first-child {
  font-weight: bold;
}

.board-comment {
  font-style: italic;
  color: #666;
  font-size: 13px;
  margin: 0;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
}
</style>

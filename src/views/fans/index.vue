<template>
  <div class="fans-page">
    <h2 class="page-title">粉丝与声望</h2>

    <!-- 加载状态 -->
    <div v-if="!isReady" class="loading card">
      <p>加载中...</p>
    </div>

    <!-- 概览卡片 -->
    <template v-else>
    <div class="overview-cards">
      <div class="overview-card fans">
        <div class="icon">👥</div>
        <div class="info">
          <span class="label">总粉丝数</span>
          <span class="value">{{ fanReputationStore.totalFans.toLocaleString() }}</span>
          <span class="change" :class="{ positive: weeklyFanChange > 0, negative: weeklyFanChange < 0 }">
            {{ weeklyFanChange > 0 ? '+' : '' }}{{ weeklyFanChange }}
          </span>
        </div>
      </div>

      <div class="overview-card active-fans">
        <div class="icon">⭐</div>
        <div class="info">
          <span class="label">活跃粉丝</span>
          <span class="value">{{ fanReputationStore.activeFans.toLocaleString() }}</span>
          <span class="sub">{{ Math.round(activeFanRate * 100) }}% 活跃度</span>
        </div>
      </div>

      <div class="overview-card reputation">
        <div class="icon">🏆</div>
        <div class="info">
          <span class="label">俱乐部声望</span>
          <span class="value">{{ fanReputationStore.reputation }}</span>
          <span class="level" :style="{ color: reputationLevel?.color || '#999' }">
            {{ reputationLevel?.name || '加载中...' }}
          </span>
        </div>
      </div>

      <div class="overview-card income">
        <div class="icon">💰</div>
        <div class="info">
          <span class="label">周粉丝收入</span>
          <span class="value">{{ fanReputationStore.weeklyFanIncome.toFixed(1) }} 万</span>
          <span class="sub">来自活跃粉丝</span>
        </div>
      </div>
    </div>

    <!-- 粉丝情绪 -->
    <div class="sentiment-section card">
      <h3 class="card-title">粉丝情绪</h3>
      <div class="sentiment-display">
        <div class="sentiment-emoji">{{ sentimentEmoji }}</div>
        <div class="sentiment-bar">
          <div class="sentiment-fill" :style="{ width: sentimentValue + '%', background: sentimentColor }"></div>
        </div>
        <div class="sentiment-value">{{ sentimentValue }}/100</div>
      </div>
      <div class="sentiment-factors">
        <div class="factor">
          <span class="label">忠诚度</span>
          <div class="progress-bar">
            <div class="fill" :style="{ width: fanReputationStore.loyalty + '%' }"></div>
          </div>
          <span class="value">{{ fanReputationStore.loyalty }}</span>
        </div>
        <div class="factor">
          <span class="label">参与度</span>
          <div class="progress-bar">
            <div class="fill" :style="{ width: fanReputationStore.engagement + '%' }"></div>
          </div>
          <span class="value">{{ fanReputationStore.engagement }}</span>
        </div>
      </div>
    </div>

    <!-- 声望等级 -->
    <div class="reputation-levels card">
      <h3 class="card-title">声望等级</h3>
      <div class="levels-list">
        <div
          v-for="level in reputationLevels"
          :key="level.level"
          class="level-item"
          :class="{ current: level.level === reputationLevel.level, locked: fanReputationStore.reputation < level.minReputation }"
        >
          <div class="level-badge" :style="{ background: level.color }">
            Lv.{{ level.level }}
          </div>
          <div class="level-info">
            <h4>{{ level.name }}</h4>
            <p class="range">{{ level.minReputation }} - {{ level.maxReputation }} 声望</p>
            <div class="benefits">
              <span v-for="(benefit, index) in level.benefits" :key="index" class="benefit-tag">
                {{ benefit }}
              </span>
            </div>
          </div>
          <div v-if="level.level === reputationLevel.level" class="current-badge">
            当前
          </div>
        </div>
      </div>
    </div>

    <!-- 历史趋势 -->
    <div v-if="history && history.length > 0" class="history-section card">
      <h3 class="card-title">发展趋势</h3>
      <div class="history-chart">
        <div class="chart-legend">
          <span class="legend-item fans">粉丝数</span>
          <span class="legend-item reputation">声望</span>
        </div>
        <div class="chart-bars">
          <div
            v-for="(record, index) in history.slice(-10)"
            :key="index"
            class="bar-group"
          >
            <div class="bar fans-bar" :style="{ height: (record.fans / maxFans * 100) + '%' }"></div>
            <div class="bar reputation-bar" :style="{ height: (record.reputation / 100 * 100) + '%' }"></div>
            <span class="week-label">W{{ record.week }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 事件影响 -->
    <div class="events-section card">
      <h3 class="card-title">最近事件</h3>
      <div class="events-list">
        <div v-for="(event, index) in recentEvents" :key="index" class="event-item">
          <span class="event-icon">{{ event.icon }}</span>
          <div class="event-content">
            <p class="description">{{ event.description }}</p>
            <div class="impacts">
              <span v-if="event.fanChange !== 0" :class="{ positive: event.fanChange > 0, negative: event.fanChange < 0 }">
                粉丝 {{ event.fanChange > 0 ? '+' : '' }}{{ event.fanChange }}
              </span>
              <span v-if="event.reputationChange !== 0" :class="{ positive: event.reputationChange > 0, negative: event.reputationChange < 0 }">
                声望 {{ event.reputationChange > 0 ? '+' : '' }}{{ event.reputationChange }}
              </span>
            </div>
          </div>
        </div>
        <p v-if="recentEvents.length === 0" class="no-events">暂无近期事件</p>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useFanReputationStore } from '@/stores/fanReputation';

const fanReputationStore = useFanReputationStore();
const isReady = ref(false);

// 确保store已初始化
onMounted(() => {
  if (!fanReputationStore.initialized) {
    fanReputationStore.initialize();
  }
  isReady.value = true;
});

// 声望等级
const reputationLevel = computed(() => fanReputationStore.reputationLevel);
const reputationLevels = computed(() => fanReputationStore.allReputationLevels);

// 粉丝情绪
const sentimentValue = computed(() => fanReputationStore.sentimentValue);
const sentimentEmoji = computed(() => {
  const value = sentimentValue.value;
  if (value >= 80) return '😄';
  if (value >= 60) return '🙂';
  if (value >= 40) return '😐';
  if (value >= 20) return '😕';
  return '😠';
});

const sentimentColor = computed(() => {
  const value = sentimentValue.value;
  if (value >= 80) return '#28a745';
  if (value >= 60) return '#8bc34a';
  if (value >= 40) return '#ffc107';
  if (value >= 20) return '#ff9800';
  return '#dc3545';
});

// 活跃粉丝率
const activeFanRate = computed(() => {
  const total = fanReputationStore.totalFans;
  return total > 0 ? fanReputationStore.activeFans / total : 0;
});

// 历史记录
const history = computed(() => fanReputationStore.history);
const maxFans = computed(() => {
  if (history.value.length === 0) return 1;
  return Math.max(...history.value.map(h => h.fans), fanReputationStore.totalFans);
});

// 周变化（模拟数据）
const weeklyFanChange = ref(150);

// 最近事件（模拟数据）
const recentEvents = ref([
  { icon: '🏆', description: '联赛获胜 vs AG超玩会', fanChange: 120, reputationChange: 0.5 },
  { icon: '⭐', description: '签约明星选手', fanChange: 500, reputationChange: 2 },
  { icon: '📈', description: '周粉丝自然增长', fanChange: 150, reputationChange: 0.1 },
]);
</script>

<style scoped>
.fans-page {
  padding: 15px;
  padding-bottom: 80px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 16px;
  color: #333;
  margin: 0 0 12px 0;
}

/* 概览卡片 */
.overview-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 15px;
}

.overview-card {
  background: white;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.overview-card .icon {
  font-size: 28px;
}

.overview-card .info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.overview-card .label {
  font-size: 12px;
  color: #666;
}

.overview-card .value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.overview-card .sub {
  font-size: 11px;
  color: #999;
}

.overview-card .change {
  font-size: 12px;
  font-weight: 600;
}

.overview-card .change.positive {
  color: #28a745;
}

.overview-card .change.negative {
  color: #dc3545;
}

.overview-card .level {
  font-size: 12px;
  font-weight: 600;
}

/* 粉丝情绪 */
.sentiment-display {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.sentiment-emoji {
  font-size: 36px;
}

.sentiment-bar {
  flex: 1;
  height: 16px;
  background: #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.sentiment-fill {
  height: 100%;
  transition: all 0.3s;
}

.sentiment-value {
  font-weight: 600;
  color: #666;
  min-width: 50px;
  text-align: right;
  font-size: 13px;
}

.sentiment-factors {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.factor {
  display: flex;
  align-items: center;
  gap: 10px;
}

.factor .label {
  width: 50px;
  font-size: 13px;
  color: #666;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar .fill {
  height: 100%;
  background: #007bff;
  transition: width 0.3s;
}

.factor .value {
  width: 35px;
  text-align: right;
  font-weight: 600;
  font-size: 13px;
}

/* 声望等级 */
.levels-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.level-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.level-item.current {
  background: #e3f2fd;
  border: 2px solid #007bff;
}

.level-item.locked {
  opacity: 0.5;
}

.level-badge {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 12px;
}

.level-info {
  flex: 1;
}

.level-info h4 {
  margin: 0 0 3px 0;
  font-size: 14px;
  color: #333;
}

.level-info .range {
  margin: 0 0 6px 0;
  color: #666;
  font-size: 12px;
}

.benefits {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.benefit-tag {
  padding: 3px 6px;
  background: white;
  border-radius: 4px;
  font-size: 11px;
  color: #666;
}

.current-badge {
  padding: 3px 10px;
  background: #007bff;
  color: white;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}

/* 历史趋势 */
.history-chart {
  padding: 10px 0;
}

.chart-legend {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
}

.legend-item::before {
  content: '';
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.legend-item.fans::before {
  background: #007bff;
}

.legend-item.reputation::before {
  background: #28a745;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 150px;
  padding-bottom: 25px;
  position: relative;
}

.bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
  max-width: 40px;
}

.bar {
  width: 14px;
  border-radius: 3px 3px 0 0;
  transition: height 0.3s;
}

.bar.fans-bar {
  background: #007bff;
}

.bar.reputation-bar {
  background: #28a745;
}

.week-label {
  font-size: 10px;
  color: #999;
  position: absolute;
  bottom: 0;
}

/* 事件 */
.events-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
}

.event-icon {
  font-size: 20px;
}

.event-content {
  flex: 1;
}

.event-content .description {
  margin: 0 0 3px 0;
  color: #333;
  font-size: 13px;
}

.event-content .impacts {
  display: flex;
  gap: 10px;
}

.event-content .impacts span {
  font-size: 12px;
  font-weight: 600;
}

.event-content .impacts .positive {
  color: #28a745;
}

.event-content .impacts .negative {
  color: #dc3545;
}

.no-events {
  text-align: center;
  color: #999;
  padding: 20px;
  font-size: 14px;
}
</style>

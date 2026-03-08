<template>
  <div class="crisis-page">
    <div class="page-header">
      <router-link to="/community" class="back-btn">← 返回社区</router-link>
      <h2 class="page-title">危机公关管理</h2>
    </div>

    <div v-if="!isReady" class="loading card">
      <p>加载中...</p>
    </div>

    <template v-else>
      <div v-if="!currentCrisis" class="no-crisis">
        <div class="no-crisis-icon">✅</div>
        <h3>当前无危机事件</h3>
        <p>俱乐部运营状况良好，暂无需要处理的危机事件</p>

        <div class="simulation-section card">
          <h4>🧪 危机模拟测试</h4>
          <p>选择一个危机类型进行模拟处理演练</p>
          <div class="crisis-types">
            <button
              v-for="type in crisisTypes"
              :key="type.id"
              class="crisis-type-btn"
              @click="simulateCrisis(type.id)"
            >
              {{ type.icon }} {{ type.name }}
            </button>
          </div>
        </div>

        <div v-if="crisisHistory.length > 0" class="history-section card">
          <h4>📋 历史危机记录</h4>
          <div class="history-list">
            <div
              v-for="record in crisisHistory"
              :key="record.id"
              class="history-item"
            >
              <div class="history-header">
                <span class="crisis-type">{{ getCrisisIcon(record.crisis.type) }} {{ getCrisisTypeName(record.crisis.type) }}</span>
                <span class="crisis-severity" :class="record.crisis.severity">{{ getSeverityName(record.crisis.severity) }}</span>
              </div>
              <h5>{{ record.crisis.title }}</h5>
              <div class="history-meta">
                <span>策略: {{ record.strategy.title }}</span>
                <span>结果: {{ getOutcomeName(record.outcome) }}</span>
                <span>{{ formatDate(record.resolvedAt) }}</span>
              </div>
              <div v-if="record.lessonsLearned.length > 0" class="lessons">
                <span class="lessons-label">经验教训:</span>
                <span v-for="(lesson, index) in record.lessonsLearned" :key="index" class="lesson-tag">
                  {{ lesson }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="crisis-active">
        <div class="crisis-alert" :class="currentCrisis.severity">
          <div class="alert-header">
            <span class="alert-icon">🚨</span>
            <span class="alert-title">危机警报</span>
            <span class="alert-severity">{{ getSeverityName(currentCrisis.severity) }}</span>
          </div>
          <h3 class="crisis-title">{{ currentCrisis.title }}</h3>
          <p class="crisis-description">{{ currentCrisis.description }}</p>
          <div class="crisis-meta">
            <span>类型: {{ getCrisisTypeName(currentCrisis.type) }}</span>
            <span>检测时间: {{ formatDate(currentCrisis.detectedAt) }}</span>
            <span>状态: {{ getCrisisStatusName(currentCrisis.status) }}</span>
          </div>
        </div>

        <div class="impact-section card">
          <h4>📊 影响评估</h4>
          <div class="impact-grid">
            <div class="impact-item">
              <span class="impact-icon">🏆</span>
              <span class="impact-label">声望</span>
              <span class="impact-value" :class="{ negative: currentCrisis.impact.reputation < 0 }">
                {{ currentCrisis.impact.reputation > 0 ? '+' : '' }}{{ currentCrisis.impact.reputation }}
              </span>
            </div>
            <div class="impact-item">
              <span class="impact-icon">👥</span>
              <span class="impact-label">粉丝</span>
              <span class="impact-value" :class="{ negative: currentCrisis.impact.fans < 0 }">
                {{ currentCrisis.impact.fans > 0 ? '+' : '' }}{{ currentCrisis.impact.fans }}
              </span>
            </div>
            <div class="impact-item">
              <span class="impact-icon">💰</span>
              <span class="impact-label">收入</span>
              <span class="impact-value" :class="{ negative: currentCrisis.impact.revenue < 0 }">
                {{ currentCrisis.impact.revenue > 0 ? '+' : '' }}{{ currentCrisis.impact.revenue }}万
              </span>
            </div>
            <div class="impact-item">
              <span class="impact-icon">😊</span>
              <span class="impact-label">士气</span>
              <span class="impact-value" :class="{ negative: currentCrisis.impact.morale < 0 }">
                {{ currentCrisis.impact.morale > 0 ? '+' : '' }}{{ currentCrisis.impact.morale }}
              </span>
            </div>
            <div class="impact-item">
              <span class="impact-icon">🤝</span>
              <span class="impact-label">赞助商信任</span>
              <span class="impact-value" :class="{ negative: currentCrisis.impact.sponsorTrust < 0 }">
                {{ currentCrisis.impact.sponsorTrust > 0 ? '+' : '' }}{{ currentCrisis.impact.sponsorTrust }}
              </span>
            </div>
          </div>
          <div class="attention-meters">
            <div class="meter">
              <span class="meter-label">媒体关注度</span>
              <div class="meter-bar">
                <div class="meter-fill" :style="{ width: currentCrisis.mediaAttention + '%' }"></div>
              </div>
              <span class="meter-value">{{ currentCrisis.mediaAttention }}%</span>
            </div>
            <div class="meter">
              <span class="meter-label">粉丝反应度</span>
              <div class="meter-bar">
                <div class="meter-fill" :style="{ width: currentCrisis.fanReaction + '%' }"></div>
              </div>
              <span class="meter-value">{{ currentCrisis.fanReaction }}%</span>
            </div>
          </div>
        </div>

        <div v-if="!selectedStrategy" class="strategies-section card">
          <h4>🎯 选择应对策略</h4>
          <div class="strategies-list">
            <div
              v-for="strategy in availableStrategies"
              :key="strategy.id"
              class="strategy-card"
              :class="strategy.riskLevel"
              @click="selectStrategy(strategy.id)"
            >
              <div class="strategy-header">
                <span class="strategy-icon">{{ getStrategyIcon(strategy.type) }}</span>
                <span class="strategy-title">{{ strategy.title }}</span>
                <span class="strategy-risk" :class="strategy.riskLevel">
                  {{ getRiskName(strategy.riskLevel) }}风险
                </span>
              </div>
              <p class="strategy-description">{{ strategy.description }}</p>
              <div class="strategy-stats">
                <div class="stat">
                  <span class="stat-label">预计恢复</span>
                  <span class="stat-value">{{ strategy.estimatedRecovery }}%</span>
                </div>
                <div class="stat">
                  <span class="stat-label">执行成本</span>
                  <span class="stat-value">¥{{ strategy.cost }}万</span>
                </div>
              </div>
              <div class="strategy-actions-list">
                <span class="actions-label">执行步骤:</span>
                <div v-for="action in strategy.actions" :key="action.id" class="action-item">
                  <span class="action-timeline">{{ action.timeline }}</span>
                  <span class="action-desc">{{ action.description }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="handling-section">
          <div class="selected-strategy card">
            <h4>📋 执行中策略</h4>
            <div class="strategy-info">
              <span class="strategy-icon">{{ getStrategyIcon(selectedStrategy.type) }}</span>
              <span class="strategy-name">{{ selectedStrategy.title }}</span>
            </div>
            <p class="strategy-desc">{{ selectedStrategy.description }}</p>

            <div class="progress-section">
              <div class="progress-header">
                <span>处理进度</span>
                <span>{{ handlingProgress }}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: handlingProgress + '%' }"></div>
              </div>
            </div>

            <div class="action-steps">
              <h5>执行步骤</h5>
              <div
                v-for="(action, index) in selectedStrategy.actions"
                :key="action.id"
                class="step-item"
                :class="{ completed: isStepCompleted(index) }"
              >
                <span class="step-number">{{ index + 1 }}</span>
                <div class="step-content">
                  <span class="step-desc">{{ action.description }}</span>
                  <span class="step-timeline">{{ action.timeline }}</span>
                </div>
                <span class="step-status">{{ isStepCompleted(index) ? '✅' : '⏳' }}</span>
              </div>
            </div>
          </div>

          <div class="handling-actions">
            <button class="progress-btn" @click="progressHandling" :disabled="handlingProgress >= 100">
              推进处理 (+20%)
            </button>
            <button v-if="handlingProgress >= 100" class="resolve-btn" @click="resolveCrisis">
              完成处理
            </button>
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
import type { CrisisSeverity } from '@/types/fanCommunity';

const fanCommunityStore = useFanCommunityStore();
const clubStore = useClubStore();
const isReady = ref(false);

const crisisTypes = [
  { id: 'player_scandal', name: '选手丑闻', icon: '👤' },
  { id: 'management_issue', name: '管理问题', icon: '🏢' },
  { id: 'performance_crisis', name: '成绩危机', icon: '📉' },
  { id: 'fan_conflict', name: '粉丝冲突', icon: '⚔️' },
  { id: 'media_scandal', name: '媒体丑闻', icon: '📰' },
  { id: 'financial_issue', name: '财务问题', icon: '💸' },
];

onMounted(() => {
  const clubId = clubStore.club?.id || 'default';
  if (!fanCommunityStore.initialized) {
    fanCommunityStore.initialize(clubId);
  }
  isReady.value = true;
});

const currentCrisis = computed(() => fanCommunityStore.currentCrisis);
const availableStrategies = computed(() => fanCommunityStore.availableStrategies);
const selectedStrategy = computed(() => fanCommunityStore.selectedStrategy);
const handlingProgress = computed(() => fanCommunityStore.handlingProgress);
const crisisHistory = computed(() => fanCommunityStore.crisisHistory);

function getCrisisIcon(type: string): string {
  const crisis = crisisTypes.find(t => t.id === type);
  return crisis?.icon || '🚨';
}

function getCrisisTypeName(type: string): string {
  const crisis = crisisTypes.find(t => t.id === type);
  return crisis?.name || type;
}

function getSeverityName(severity: CrisisSeverity): string {
  const names: Record<CrisisSeverity, string> = {
    minor: '轻微',
    moderate: '中等',
    major: '严重',
    severe: '危急',
  };
  return names[severity];
}

function getCrisisStatusName(status: string): string {
  const names: Record<string, string> = {
    detected: '已检测',
    analyzing: '分析中',
    handling: '处理中',
    resolved: '已解决',
    escalated: '已升级',
  };
  return names[status] || status;
}

function getStrategyIcon(type: string): string {
  const icons: Record<string, string> = {
    apology: '🙏',
    explanation: '📢',
    action: '⚡',
    deflection: '🔄',
    silence: '🤫',
  };
  return icons[type] || '📋';
}

function getRiskName(risk: string): string {
  const names: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
  };
  return names[risk] || risk;
}

function getOutcomeName(outcome: string): string {
  const names: Record<string, string> = {
    success: '成功',
    partial: '部分成功',
    failure: '失败',
  };
  return names[outcome] || outcome;
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isStepCompleted(index: number): boolean {
  const progressPerStep = 100 / (selectedStrategy.value?.actions.length || 1);
  return handlingProgress.value >= (index + 1) * progressPerStep;
}

function simulateCrisis(type: string) {
  const severities: CrisisSeverity[] = ['minor', 'moderate', 'major', 'severe'];
  const randomSeverity = severities[Math.floor(Math.random() * severities.length)];

  const crisisData = getCrisisData(type);

  fanCommunityStore.handleCrisis({
    type: type as any,
    severity: randomSeverity,
    title: crisisData.title,
    description: crisisData.description,
  });
}

function getCrisisData(type: string): { title: string; description: string } {
  const data: Record<string, { title: string; description: string }> = {
    player_scandal: {
      title: '选手不当言论引发争议',
      description: '俱乐部选手在社交媒体上发表不当言论，引发粉丝和公众强烈不满，多家媒体已进行报道。',
    },
    management_issue: {
      title: '管理层决策失误',
      description: '俱乐部管理层的一项决策被曝光，引发粉丝质疑和不满，舆论持续发酵。',
    },
    performance_crisis: {
      title: '连败引发粉丝不满',
      description: '俱乐部近期连续失利，粉丝情绪激动，部分粉丝组织要求俱乐部做出改变。',
    },
    fan_conflict: {
      title: '粉丝群体冲突事件',
      description: '俱乐部粉丝与其他战队粉丝发生冲突，造成不良社会影响，媒体广泛报道。',
    },
    media_scandal: {
      title: '不实报道损害形象',
      description: '有媒体发布关于俱乐部的不实报道，对俱乐部形象造成严重损害，需要及时澄清。',
    },
    financial_issue: {
      title: '财务问题曝光',
      description: '俱乐部财务问题被媒体曝光，引发粉丝和赞助商担忧，需要妥善处理。',
    },
  };
  return data[type] || { title: '未知危机', description: '发生了一起危机事件' };
}

function selectStrategy(strategyId: string) {
  fanCommunityStore.selectCrisisStrategy(strategyId);
}

function progressHandling() {
  const newProgress = Math.min(100, handlingProgress.value + 20);
  fanCommunityStore.progressCrisisHandling(newProgress);
}

function resolveCrisis() {
  fanCommunityStore.progressCrisisHandling(100);
}
</script>

<style scoped>
.crisis-page {
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

.card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.no-crisis {
  text-align: center;
  padding: 20px;
}

.no-crisis-icon {
  font-size: 60px;
  margin-bottom: 15px;
}

.no-crisis h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.no-crisis p {
  margin: 0 0 20px 0;
  color: #666;
}

.simulation-section h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #333;
}

.simulation-section p {
  margin: 0 0 15px 0;
  font-size: 13px;
  color: #666;
}

.crisis-types {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.crisis-type-btn {
  padding: 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.crisis-type-btn:hover {
  background: #f0f0f0;
  border-color: #007bff;
}

.history-section h4 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #333;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.crisis-type {
  font-size: 13px;
  font-weight: 500;
}

.crisis-severity {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
}

.crisis-severity.minor { background: #d4edda; color: #155724; }
.crisis-severity.moderate { background: #fff3cd; color: #856404; }
.crisis-severity.major { background: #ffe0b2; color: #e65100; }
.crisis-severity.severe { background: #f8d7da; color: #721c24; }

.history-item h5 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #333;
}

.history-meta {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.lessons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.lessons-label {
  font-size: 12px;
  color: #666;
}

.lesson-tag {
  padding: 3px 8px;
  background: #e3f2fd;
  border-radius: 4px;
  font-size: 11px;
  color: #1565c0;
}

.crisis-alert {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.crisis-alert.minor { border-left: 5px solid #28a745; }
.crisis-alert.moderate { border-left: 5px solid #ffc107; }
.crisis-alert.major { border-left: 5px solid #ff9800; }
.crisis-alert.severe { border-left: 5px solid #dc3545; }

.alert-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.alert-icon {
  font-size: 24px;
}

.alert-title {
  font-size: 14px;
  font-weight: 600;
  color: #dc3545;
}

.alert-severity {
  margin-left: auto;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: #f8d7da;
  color: #721c24;
}

.crisis-title {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
}

.crisis-description {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: #666;
}

.crisis-meta {
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: #999;
}

.impact-section h4 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #333;
}

.impact-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-bottom: 15px;
}

.impact-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
}

.impact-icon {
  font-size: 20px;
}

.impact-label {
  font-size: 11px;
  color: #666;
}

.impact-value {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.impact-value.negative {
  color: #dc3545;
}

.attention-meters {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.meter {
  display: flex;
  align-items: center;
  gap: 10px;
}

.meter-label {
  width: 80px;
  font-size: 13px;
  color: #666;
}

.meter-bar {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.meter-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffc107, #ff9800, #dc3545);
  transition: width 0.3s;
}

.meter-value {
  width: 40px;
  text-align: right;
  font-size: 13px;
  font-weight: 600;
}

.strategies-section h4 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #333;
}

.strategies-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.strategy-card {
  padding: 15px;
  background: #f9f9f9;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.strategy-card:hover {
  background: #e3f2fd;
  transform: translateX(5px);
}

.strategy-card.low { border-left: 4px solid #28a745; }
.strategy-card.medium { border-left: 4px solid #ffc107; }
.strategy-card.high { border-left: 4px solid #dc3545; }

.strategy-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.strategy-icon {
  font-size: 20px;
}

.strategy-title {
  font-weight: 600;
  flex: 1;
}

.strategy-risk {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
}

.strategy-risk.low { background: #d4edda; color: #155724; }
.strategy-risk.medium { background: #fff3cd; color: #856404; }
.strategy-risk.high { background: #f8d7da; color: #721c24; }

.strategy-description {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: #666;
}

.strategy-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
}

.strategy-stats .stat {
  display: flex;
  flex-direction: column;
}

.strategy-stats .stat-label {
  font-size: 11px;
  color: #999;
}

.strategy-stats .stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.strategy-actions-list {
  border-top: 1px solid #e0e0e0;
  padding-top: 10px;
}

.actions-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  display: block;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 0;
  font-size: 12px;
}

.action-timeline {
  padding: 2px 6px;
  background: #e0e0e0;
  border-radius: 4px;
  font-size: 11px;
  color: #666;
}

.action-desc {
  flex: 1;
  color: #333;
}

.selected-strategy h4 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #333;
}

.strategy-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.strategy-info .strategy-icon {
  font-size: 24px;
}

.strategy-name {
  font-size: 16px;
  font-weight: 600;
}

.strategy-desc {
  margin: 0 0 15px 0;
  font-size: 13px;
  color: #666;
}

.progress-section {
  margin-bottom: 20px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  color: #666;
}

.progress-bar {
  height: 12px;
  background: #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #28a745, #20c997);
  transition: width 0.3s;
}

.action-steps h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #333;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 8px;
}

.step-item.completed {
  background: #e8f5e9;
}

.step-number {
  width: 24px;
  height: 24px;
  background: #007bff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.step-item.completed .step-number {
  background: #28a745;
}

.step-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.step-desc {
  font-size: 13px;
  color: #333;
}

.step-timeline {
  font-size: 11px;
  color: #999;
}

.step-status {
  font-size: 16px;
}

.handling-actions {
  display: flex;
  gap: 15px;
  margin-top: 15px;
}

.progress-btn,
.resolve-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.progress-btn {
  background: #007bff;
  color: white;
}

.progress-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.resolve-btn {
  background: #28a745;
  color: white;
}
</style>

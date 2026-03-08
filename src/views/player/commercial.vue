<template>
  <div class="player-commercial-page">
    <div class="page-header">
      <h2 class="page-title">选手商业活动</h2>
    </div>

    <div v-if="!isReady" class="loading card">
      <p>加载中...</p>
    </div>

    <template v-else-if="selectedPlayer">
      <div class="player-info card">
        <div class="player-header">
          <div class="player-avatar">{{ selectedPlayer.name?.[0] || '选' }}</div>
          <div class="player-details">
            <h3>{{ selectedPlayer.name }}</h3>
            <p class="player-position">{{ getPositionText(selectedPlayer.position) }}</p>
          </div>
          <div class="commercial-value">
            <span class="value-label">商业价值</span>
            <span class="value-number">{{ playerProfile?.commercialValue || 0 }}</span>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">市场吸引力</span>
            <span class="stat-value">{{ Math.round(playerProfile?.marketability || 0) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">品牌吸引力</span>
            <span class="stat-value">{{ Math.round(playerProfile?.brandAppeal || 0) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">社交影响力</span>
            <span class="stat-value">{{ Math.round(playerProfile?.socialInfluence || 0) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">专业度</span>
            <span class="stat-value">{{ Math.round(playerProfile?.reputation?.professionalism || 0) }}</span>
          </div>
        </div>
      </div>

      <div class="tab-bar">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'pending' }"
          @click="activeTab = 'pending'"
        >
          待处理 ({{ pendingActivities.length }})
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'endorsements' }"
          @click="activeTab = 'endorsements'"
        >
          代言合同 ({{ activeEndorsements.length }})
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'history' }"
          @click="activeTab = 'history'"
        >
          历史记录
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'controversies' }"
          @click="activeTab = 'controversies'"
        >
          争议事件 ({{ playerControversies.length }})
        </button>
      </div>

      <div v-if="activeTab === 'pending'" class="pending-section">
        <div class="section-header">
          <h3>待处理活动</h3>
          <button class="refresh-btn" @click="generateNewOffer" :disabled="isGeneratingOffer">
            {{ isGeneratingOffer ? '生成中...' : '寻找新机会' }}
          </button>
        </div>

        <div v-if="pendingActivities.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <p>暂无待处理的商业活动</p>
          <p class="empty-hint">点击"寻找新机会"获取商业合作邀请</p>
        </div>

        <div v-else class="activities-list">
          <div
            v-for="activity in pendingActivities"
            :key="activity.id"
            class="activity-card"
          >
            <div class="activity-header">
              <span class="activity-brand">{{ activity.brandLogo }} {{ activity.brand }}</span>
              <span class="activity-type" :style="{ backgroundColor: getTypeColor(activity.type) }">
                {{ getTypeText(activity.type) }}
              </span>
            </div>

            <h4 class="activity-title">{{ activity.title }}</h4>
            <p class="activity-desc">{{ activity.description }}</p>

            <div class="activity-details">
              <div class="detail-row">
                <span class="detail-label">收入</span>
                <span class="detail-value income">{{ activity.income }}万</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">时长</span>
                <span class="detail-value">{{ activity.schedule.duration }}天</span>
              </div>
            </div>

            <div class="activity-impact">
              <span class="impact-title">预期影响:</span>
              <div class="impact-items">
                <span v-if="activity.impact.reputation" class="impact-item positive">
                  声望 +{{ activity.impact.reputation }}
                </span>
                <span v-if="activity.impact.fans" class="impact-item positive">
                  粉丝 +{{ activity.impact.fans }}
                </span>
                <span v-if="activity.impact.mediaExposure" class="impact-item positive">
                  曝光 +{{ activity.impact.mediaExposure }}
                </span>
              </div>
            </div>

            <div v-if="activity.risks && activity.risks.length > 0" class="activity-risks">
              <span class="risk-title">潜在风险:</span>
              <div class="risk-items">
                <span
                  v-for="(risk, index) in activity.risks"
                  :key="index"
                  class="risk-item"
                  :class="risk.severity"
                >
                  {{ risk.description }}
                </span>
              </div>
            </div>

            <div class="activity-actions">
              <button class="accept-btn" @click="handleAccept(activity.id)">
                接受
              </button>
              <button class="reject-btn" @click="handleReject(activity.id)">
                拒绝
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'endorsements'" class="endorsements-section">
        <EndorsementManager
          :player-id="selectedPlayer.id"
          :endorsements="activeEndorsements"
          @complete="handleCompleteEndorsement"
        />
      </div>

      <div v-else-if="activeTab === 'history'" class="history-section">
        <div class="section-header">
          <h3>历史记录</h3>
        </div>

        <div class="stats-summary card">
          <div class="summary-item">
            <span class="summary-label">总活动数</span>
            <span class="summary-value">{{ playerProfile?.statistics?.totalActivities || 0 }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">总收入</span>
            <span class="summary-value">{{ playerProfile?.statistics?.totalIncome || 0 }}万</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">成功率</span>
            <span class="summary-value">
              {{ getSuccessRate() }}%
            </span>
          </div>
        </div>

        <div v-if="completedActivities.length === 0" class="empty-state">
          <div class="empty-icon">📊</div>
          <p>暂无历史记录</p>
        </div>

        <div v-else class="history-list">
          <div
            v-for="activity in completedActivities"
            :key="activity.id"
            class="history-card"
            :class="activity.status"
          >
            <div class="history-header">
              <span class="history-brand">{{ activity.brand }}</span>
              <span class="history-status">{{ getStatusText(activity.status) }}</span>
            </div>
            <div class="history-title">{{ activity.title }}</div>
            <div class="history-details">
              <span>{{ getTypeText(activity.type) }}</span>
              <span v-if="activity.status === 'completed'" class="history-income">
                +{{ activity.income }}万
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'controversies'" class="controversies-section">
        <div class="section-header">
          <h3>争议事件</h3>
        </div>

        <div v-if="playerControversies.length === 0" class="empty-state">
          <div class="empty-icon">✅</div>
          <p>暂无争议事件</p>
        </div>

        <div v-else class="controversies-list">
          <div
            v-for="controversy in playerControversies"
            :key="controversy.id"
            class="controversy-card"
            :class="controversy.severity"
          >
            <div class="controversy-header">
              <span class="controversy-type">{{ getControversyTypeText(controversy.type) }}</span>
              <span class="controversy-severity">{{ controversy.severity }}</span>
            </div>
            <p class="controversy-desc">{{ controversy.description }}</p>

            <div class="controversy-impact">
              <span>预计影响:</span>
              <span class="impact-value">声望 {{ controversy.impact.reputation }}</span>
              <span class="impact-value">粉丝 {{ controversy.impact.fans }}</span>
            </div>

            <div v-if="!controversy.resolved" class="resolution-options">
              <h4>解决方案:</h4>
              <div class="options-list">
                <button
                  v-for="option in controversy.resolutionOptions"
                  :key="option.id"
                  class="option-btn"
                  @click="handleResolveControversy(controversy.activityId, option.id)"
                >
                  <span class="option-text">{{ option.text }}</span>
                  <span class="option-cost">花费: {{ option.cost }}万</span>
                </button>
              </div>
            </div>

            <div v-else class="resolved-badge">
              已解决
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="no-player card">
      <div class="empty-icon">👤</div>
      <p>请先选择一名选手</p>
      <button class="select-btn" @click="showPlayerSelector = true">
        选择选手
      </button>
    </div>

    <div v-if="showPlayerSelector" class="modal-overlay" @click="showPlayerSelector = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>选择选手</h3>
          <button class="close-btn" @click="showPlayerSelector = false">×</button>
        </div>
        <div class="modal-body">
          <div class="player-list">
            <div
              v-for="player in allPlayers"
              :key="player.id"
              class="player-select-item"
              @click="selectPlayer(player)"
            >
              <div class="player-avatar-small">{{ player.name?.[0] || '选' }}</div>
              <div class="player-info-text">
                <span class="player-name">{{ player.name }}</span>
                <span class="player-pos">{{ getPositionText(player.position) }}</span>
              </div>
              <div class="player-stats-text">
                平均属性: {{ player.getAverageStats?.() || 0 }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useCommercialStore } from '@/stores/commercial';
import { usePlayerStore } from '@/stores/player';
import { useFanReputationStore } from '@/stores/fanReputation';
import EndorsementManager from '@/components/EndorsementManager.vue';
import type { CommercialActivity, EndorsementContract, ControversyEvent } from '@/types/commercial';
import type { Position } from '@/types';

const commercialStore = useCommercialStore();
const playerStore = usePlayerStore();
const fanReputationStore = useFanReputationStore();

const isReady = ref(false);
const selectedPlayer = ref<any>(null);
const activeTab = ref<'pending' | 'endorsements' | 'history' | 'controversies'>('pending');
const showPlayerSelector = ref(false);
const isGeneratingOffer = ref(false);

const playerProfile = computed(() => {
  if (!selectedPlayer.value) return null;
  return commercialStore.getProfile(selectedPlayer.value.id);
});

const pendingActivities = computed(() => {
  if (!selectedPlayer.value) return [];
  return commercialStore.getPlayerPendingActivities(selectedPlayer.value.id);
});

const activeEndorsements = computed(() => {
  if (!selectedPlayer.value) return [];
  return commercialStore.getPlayerActiveEndorsements(selectedPlayer.value.id);
});

const completedActivities = computed(() => {
  if (!selectedPlayer.value) return [];
  return commercialStore.getPlayerCompletedActivities(selectedPlayer.value.id);
});

const playerControversies = computed(() => {
  if (!selectedPlayer.value) return [];
  return commercialStore.getPlayerControversies(selectedPlayer.value.id);
});

const allPlayers = computed(() => playerStore.allPlayers);

onMounted(() => {
  if (!commercialStore.initialized) {
    commercialStore.initialize();
  }
  if (!fanReputationStore.initialized) {
    fanReputationStore.initialize();
  }
  isReady.value = true;
});

watch(selectedPlayer, (player) => {
  if (player) {
    initializePlayerProfile(player);
    commercialStore.loadControversies(player.id);
  }
});

function initializePlayerProfile(player: any) {
  const stats = {
    avgStats: player.getAverageStats?.() || 70,
    age: player.age || 20,
    fans: fanReputationStore.totalFans || 10000,
    reputation: fanReputationStore.reputation || 50,
  };
  commercialStore.initializePlayerProfile(player.id, stats);
}

function selectPlayer(player: any) {
  selectedPlayer.value = player;
  showPlayerSelector.value = false;
}

async function generateNewOffer() {
  if (!selectedPlayer.value) return;

  isGeneratingOffer.value = true;

  const stats = {
    avgStats: selectedPlayer.value.getAverageStats?.() || 70,
    age: selectedPlayer.value.age || 20,
    fans: fanReputationStore.totalFans || 10000,
    reputation: fanReputationStore.reputation || 50,
  };

  const offer = commercialStore.generateOfferForPlayer(selectedPlayer.value.id, stats);

  if (!offer) {
    alert('暂时没有找到合适的商业机会，请稍后再试');
  }

  isGeneratingOffer.value = false;
}

function handleAccept(activityId: string) {
  if (!selectedPlayer.value) return;

  const result = commercialStore.acceptActivity(selectedPlayer.value.id, activityId);
  alert(result.message);
}

function handleReject(activityId: string) {
  if (!selectedPlayer.value) return;

  const result = commercialStore.rejectActivity(selectedPlayer.value.id, activityId);
  alert(result.message);
}

function handleCompleteEndorsement(contractId: string) {
  if (!selectedPlayer.value) return;

  const result = commercialStore.completeActivity(selectedPlayer.value.id, contractId);
  alert(result.message);
}

function handleResolveControversy(activityId: string, resolutionId: string) {
  if (!selectedPlayer.value) return;

  const result = commercialStore.handleControversy(
    selectedPlayer.value.id,
    activityId,
    resolutionId
  );
  alert(result.message);
}

function getPositionText(position: Position): string {
  const texts: Record<Position, string> = {
    top: '对抗路',
    jungle: '打野',
    mid: '中路',
    adc: '发育路',
    support: '游走',
  };
  return texts[position] || position;
}

function getTypeText(type: string): string {
  const texts: Record<string, string> = {
    endorsement: '代言',
    streaming: '直播',
    'fan-meet': '粉丝见面会',
    photoshoot: '拍摄',
    interview: '采访',
  };
  return texts[type] || type;
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    endorsement: '#ff6b6b',
    streaming: '#4ecdc4',
    'fan-meet': '#ffd93d',
    photoshoot: '#a29bfe',
    interview: '#74b9ff',
  };
  return colors[type] || '#999';
}

function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    pending: '待处理',
    accepted: '已接受',
    rejected: '已拒绝',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消',
  };
  return texts[status] || status;
}

function getControversyTypeText(type: string): string {
  const texts: Record<string, string> = {
    brand_mismatch: '品牌不符',
    public_backlash: '公众反对',
    contract_violation: '合同违约',
    media_scandal: '媒体丑闻',
  };
  return texts[type] || type;
}

function getSuccessRate(): number {
  const stats = playerProfile.value?.statistics;
  if (!stats || stats.totalActivities === 0) return 0;
  return Math.round((stats.successfulActivities / stats.totalActivities) * 100);
}
</script>

<style scoped>
.player-commercial-page {
  padding: 15px;
  padding-bottom: 80px;
}

.page-header {
  margin-bottom: 15px;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.player-info {
  margin-bottom: 15px;
}

.player-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.player-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: bold;
}

.player-details h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.player-position {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #999;
}

.commercial-value {
  margin-left: auto;
  text-align: center;
}

.value-label {
  display: block;
  font-size: 11px;
  color: #999;
}

.value-number {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #ff6b6b;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.stat-item {
  text-align: center;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
}

.stat-label {
  display: block;
  font-size: 11px;
  color: #999;
  margin-bottom: 4px;
}

.stat-value {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.tab-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
  overflow-x: auto;
}

.tab-btn {
  flex-shrink: 0;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background: #f5f5f5;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: #007bff;
  color: white;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.refresh-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: #28a745;
  color: white;
  font-size: 13px;
  cursor: pointer;
}

.refresh-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  background: white;
  border-radius: 12px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.empty-state p {
  margin: 0;
  color: #666;
}

.empty-hint {
  margin-top: 8px !important;
  font-size: 12px;
  color: #999;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.activity-brand {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.activity-type {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  color: white;
}

.activity-title {
  margin: 0 0 8px 0;
  font-size: 15px;
  color: #333;
}

.activity-desc {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: #666;
}

.activity-details {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.detail-label {
  font-size: 12px;
  color: #999;
}

.detail-value {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.detail-value.income {
  color: #28a745;
}

.activity-impact {
  margin-bottom: 12px;
}

.impact-title {
  font-size: 12px;
  color: #666;
  margin-right: 8px;
}

.impact-items {
  display: inline-flex;
  gap: 8px;
}

.impact-item {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
}

.impact-item.positive {
  background: #d4edda;
  color: #155724;
}

.activity-risks {
  margin-bottom: 12px;
  padding: 10px;
  background: #fff3cd;
  border-radius: 8px;
}

.risk-title {
  font-size: 12px;
  color: #856404;
  margin-right: 8px;
}

.risk-items {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.risk-item {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
}

.risk-item.low {
  background: #d4edda;
  color: #155724;
}

.risk-item.medium {
  background: #fff3cd;
  color: #856404;
}

.risk-item.high {
  background: #f8d7da;
  color: #721c24;
}

.activity-actions {
  display: flex;
  gap: 10px;
}

.accept-btn,
.reject-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.accept-btn {
  background: #28a745;
  color: white;
}

.reject-btn {
  background: #f5f5f5;
  color: #666;
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 15px;
}

.summary-item {
  text-align: center;
}

.summary-label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.summary-value {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.history-card.completed {
  border-left: 3px solid #28a745;
}

.history-card.rejected {
  border-left: 3px solid #dc3545;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.history-brand {
  font-size: 13px;
  color: #666;
}

.history-status {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  background: #f5f5f5;
  color: #666;
}

.history-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 6px;
}

.history-details {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

.history-income {
  color: #28a745;
  font-weight: bold;
}

.controversies-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.controversy-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.controversy-card.low {
  border-left: 3px solid #28a745;
}

.controversy-card.medium {
  border-left: 3px solid #ffc107;
}

.controversy-card.high {
  border-left: 3px solid #dc3545;
}

.controversy-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.controversy-type {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.controversy-severity {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  background: #f5f5f5;
  color: #666;
  text-transform: uppercase;
}

.controversy-desc {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: #666;
}

.controversy-impact {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #999;
  margin-bottom: 12px;
}

.impact-value {
  color: #dc3545;
}

.resolution-options h4 {
  margin: 0 0 10px 0;
  font-size: 13px;
  color: #333;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option-btn:hover {
  background: #f9f9f9;
  border-color: #007bff;
}

.option-text {
  font-size: 13px;
  color: #333;
}

.option-cost {
  font-size: 12px;
  color: #ff6b6b;
}

.resolved-badge {
  text-align: center;
  padding: 10px;
  background: #d4edda;
  color: #155724;
  border-radius: 8px;
  font-size: 13px;
}

.no-player {
  text-align: center;
  padding: 60px 20px;
}

.select-btn {
  margin-top: 15px;
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  background: #007bff;
  color: white;
  font-size: 15px;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: #f5f5f5;
  border: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.modal-body {
  padding: 15px;
}

.player-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.player-select-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.player-select-item:hover {
  background: #e9ecef;
}

.player-avatar-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  font-weight: bold;
}

.player-info-text {
  flex: 1;
}

.player-name {
  display: block;
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.player-pos {
  display: block;
  font-size: 12px;
  color: #999;
}

.player-stats-text {
  font-size: 12px;
  color: #666;
}
</style>

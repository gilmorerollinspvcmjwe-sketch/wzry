<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { usePlayerPersonalityStore } from '@/stores/playerPersonality';
import { usePlayerStore } from '@/stores/player';
import type { PlayerDemand } from '@/types/playerPersonality';
import { DEMAND_TYPE_NAMES, DEMAND_URGENCY_NAMES } from '@/types/playerPersonality';

const props = defineProps<{
  playerId: string;
}>();

const emit = defineEmits<{
  demandProcessed: [demandId: string, satisfied: boolean];
}>();

const personalityStore = usePlayerPersonalityStore();
const playerStore = usePlayerStore();

const processingDemandId = ref<string | null>(null);
const showConfirmModal = ref(false);
const selectedDemand = ref<PlayerDemand | null>(null);
const confirmAction = ref<'accept' | 'reject' | null>(null);

const player = computed(() => playerStore.getPlayerById(props.playerId));

const personality = computed(() => personalityStore.getPersonality(props.playerId));

const activeDemands = computed(() => personalityStore.getActiveDemands(props.playerId));

const hasDemands = computed(() => activeDemands.value.length > 0);

const getUrgencyColor = (urgency: string) => {
  const colors: Record<string, string> = {
    low: '#52c41a',
    medium: '#1890ff',
    high: '#faad14',
    critical: '#ff4d4f',
  };
  return colors[urgency] || '#666';
};

const getUrgencyBgColor = (urgency: string) => {
  const colors: Record<string, string> = {
    low: '#f6ffed',
    medium: '#e6f7ff',
    high: '#fffbe6',
    critical: '#fff2f0',
  };
  return colors[urgency] || '#f5f5f5';
};

const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    playing_time: '⏱',
    salary: '💰',
    transfer: '🔄',
    teammate: '👥',
    facility: '🏟',
  };
  return icons[type] || '📋';
};

const getDaysRemaining = (deadline: Date | string) => {
  const now = new Date();
  const deadlineDate = deadline instanceof Date ? deadline : new Date(deadline);
  const diff = deadlineDate.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
};

const isOverdue = (deadline: Date | string) => {
  return getDaysRemaining(deadline) === 0;
};

const confirmProcessDemand = (demand: PlayerDemand, action: 'accept' | 'reject') => {
  selectedDemand.value = demand;
  confirmAction.value = action;
  showConfirmModal.value = true;
};

const processDemand = () => {
  if (!selectedDemand.value || !confirmAction.value) return;

  processingDemandId.value = selectedDemand.value.id;

  const satisfied = confirmAction.value === 'accept';

  const result = personalityStore.processPlayerDemand(
    props.playerId,
    selectedDemand.value.id,
    satisfied
  );

  if (result.success) {
    emit('demandProcessed', selectedDemand.value.id, satisfied);
  }

  showConfirmModal.value = false;
  selectedDemand.value = null;
  confirmAction.value = null;
  processingDemandId.value = null;
};

const cancelProcess = () => {
  showConfirmModal.value = false;
  selectedDemand.value = null;
  confirmAction.value = null;
};

const initPersonality = () => {
  personalityStore.initPersonality(props.playerId);
};

onMounted(() => {
  if (!personality.value) {
    initPersonality();
  }
});
</script>

<template>
  <div class="player-demands">
    <div class="demands-header">
      <h3>选手诉求</h3>
      <span class="demand-count" v-if="hasDemands">
        {{ activeDemands.length }} 项待处理
      </span>
    </div>

    <div v-if="hasDemands" class="demands-list">
      <div 
        v-for="demand in activeDemands" 
        :key="demand.id" 
        class="demand-card"
        :class="{ overdue: isOverdue(demand.deadline), critical: demand.urgency === 'critical' }"
      >
        <div class="demand-header">
          <span class="demand-type">
            {{ getTypeIcon(demand.type) }} {{ DEMAND_TYPE_NAMES[demand.type] }}
          </span>
          <span 
            class="demand-urgency"
            :style="{ 
              backgroundColor: getUrgencyBgColor(demand.urgency), 
              color: getUrgencyColor(demand.urgency) 
            }"
          >
            {{ DEMAND_URGENCY_NAMES[demand.urgency] }}
          </span>
        </div>

        <p class="demand-description">{{ demand.description }}</p>

        <div class="demand-meta">
          <div class="deadline" :class="{ urgent: getDaysRemaining(demand.deadline) <= 3 }">
            <span class="label">剩余时间</span>
            <span class="value">
              {{ isOverdue(demand.deadline) ? '已过期' : `${getDaysRemaining(demand.deadline)} 天` }}
            </span>
          </div>

          <div class="consequences">
            <span class="label">拒绝后果</span>
            <div class="consequence-values">
              <span class="consequence-item negative">
                士气 -{{ demand.consequences.morale }}
              </span>
              <span class="consequence-item negative">
                关系 -{{ demand.consequences.relationship }}
              </span>
            </div>
          </div>
        </div>

        <div class="demand-actions">
          <button 
            class="action-btn accept"
            :disabled="processingDemandId === demand.id"
            @click="confirmProcessDemand(demand, 'accept')"
          >
            同意
          </button>
          <button 
            class="action-btn reject"
            :disabled="processingDemandId === demand.id"
            @click="confirmProcessDemand(demand, 'reject')"
          >
            拒绝
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">✓</div>
      <p>暂无待处理的诉求</p>
      <span class="hint">选手状态良好，没有特殊要求</span>
    </div>

    <div v-if="showConfirmModal" class="modal-overlay" @click="cancelProcess">
      <div class="modal-content" @click.stop>
        <h4>确认操作</h4>
        <p v-if="selectedDemand">
          确定要{{ confirmAction === 'accept' ? '同意' : '拒绝' }}该诉求吗？
        </p>
        <div v-if="selectedDemand && confirmAction === 'reject'" class="warning">
          <p>拒绝后将会产生以下影响：</p>
          <ul>
            <li>士气 -{{ selectedDemand.consequences.morale }}</li>
            <li>关系 -{{ selectedDemand.consequences.relationship }}</li>
            <li>表现 -{{ selectedDemand.consequences.performance }}</li>
          </ul>
        </div>
        <div class="modal-actions">
          <button class="modal-btn cancel" @click="cancelProcess">取消</button>
          <button 
            class="modal-btn confirm" 
            :class="{ reject: confirmAction === 'reject' }"
            @click="processDemand"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.player-demands {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.demands-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.demands-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.demand-count {
  padding: 4px 10px;
  background: #fff2f0;
  color: #ff4d4f;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.demands-list {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.demand-card {
  padding: 16px;
  background: #fafafa;
  border-radius: 10px;
  border-left: 4px solid #1890ff;
  transition: all 0.3s;
}

.demand-card.overdue {
  border-left-color: #ff4d4f;
  background: #fff2f0;
}

.demand-card.critical {
  border-left-color: #ff4d4f;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.2); }
  50% { box-shadow: 0 0 0 8px rgba(255, 77, 79, 0); }
}

.demand-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.demand-type {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.demand-urgency {
  padding: 3px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.demand-description {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.demand-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 14px;
  padding: 10px;
  background: white;
  border-radius: 8px;
}

.demand-meta .label {
  display: block;
  font-size: 11px;
  color: #999;
  margin-bottom: 4px;
}

.demand-meta .value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.deadline.urgent .value {
  color: #ff4d4f;
}

.consequences {
  flex: 1;
}

.consequence-values {
  display: flex;
  gap: 10px;
}

.consequence-item {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.consequence-item.negative {
  background: #fff2f0;
  color: #ff4d4f;
}

.demand-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.accept {
  background: #f6ffed;
  color: #52c41a;
}

.action-btn.accept:hover:not(:disabled) {
  background: #52c41a;
  color: white;
}

.action-btn.reject {
  background: #fff2f0;
  color: #ff4d4f;
}

.action-btn.reject:hover:not(:disabled) {
  background: #ff4d4f;
  color: white;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 16px;
  background: #f6ffed;
  color: #52c41a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.empty-state p {
  margin: 0 0 6px 0;
  font-size: 15px;
  color: #333;
}

.empty-state .hint {
  font-size: 13px;
  color: #999;
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
  max-width: 360px;
}

.modal-content h4 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #333;
}

.modal-content p {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #666;
}

.warning {
  padding: 12px;
  background: #fff2f0;
  border-radius: 8px;
  margin-bottom: 16px;
}

.warning p {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #ff4d4f;
  font-weight: 500;
}

.warning ul {
  margin: 0;
  padding-left: 20px;
}

.warning li {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.modal-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-btn.cancel {
  background: #f5f5f5;
  color: #666;
}

.modal-btn.confirm {
  background: #52c41a;
  color: white;
}

.modal-btn.confirm.reject {
  background: #ff4d4f;
}

.modal-btn:hover {
  opacity: 0.9;
}
</style>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useTransferWindowStore } from '@/stores/transferWindow';
import { useClubStore } from '@/stores/club';
import type { TransferNegotiation, NegotiationRound } from '@/types/transferWindow';
import { getPlayerTotalPower } from '@/utils/playerUtils';

const props = defineProps<{
  negotiation: TransferNegotiation;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'completed'): void;
}>();

const transferWindowStore = useTransferWindowStore();
const clubStore = useClubStore();

const offerFee = ref(0);
const isSubmitting = ref(false);
const aiResponse = ref('');
const showAiResponse = ref(false);

const currentClub = computed(() => clubStore.currentClub);
const currentFunds = computed(() => currentClub.value?.funds || 0);

const isBuyer = computed(() => props.negotiation.buyingClubId === currentClub.value?.id);

const sellingClub = computed(() => clubStore.getClub(props.negotiation.sellingClubId));

const player = computed(() => {
  if (!sellingClub.value) return null;
  return sellingClub.value.roster.find((p: any) => p.id === props.negotiation.playerId);
});

const playerPower = computed(() => {
  if (!player.value) return 0;
  return getPlayerTotalPower(player.value);
});

const buyoutClause = computed(() => {
  return (player.value as any)?.contract?.buyoutClause || 100;
});

const currentRound = computed(() => props.negotiation.rounds.length + 1);

const maxRounds = computed(() => transferWindowStore.currentWindow?.rules.maxNegotiationRounds || 5);

const isNegotiationActive = computed(() => props.negotiation.status === 'in_progress');

const isNegotiationAgreed = computed(() => props.negotiation.status === 'agreed');

const lastRound = computed(() => {
  const rounds = props.negotiation.rounds;
  return rounds.length > 0 ? rounds[rounds.length - 1] : null;
});

const suggestedFee = computed(() => {
  if (lastRound.value?.counterOffer) {
    return lastRound.value.counterOffer.fee;
  }
  return Math.ceil(buyoutClause.value * 0.9);
});

const negotiationStatus = computed(() => {
  const statusMap: Record<string, { text: string; class: string }> = {
    pending: { text: '待处理', class: 'pending' },
    in_progress: { text: '谈判中', class: 'in-progress' },
    agreed: { text: '已达成', class: 'agreed' },
    rejected: { text: '已拒绝', class: 'rejected' },
    expired: { text: '已过期', class: 'expired' },
  };
  return statusMap[props.negotiation.status] || { text: '未知', class: '' };
});

watch(suggestedFee, (newVal) => {
  if (offerFee.value === 0 || offerFee.value < newVal) {
    offerFee.value = newVal;
  }
}, { immediate: true });

const submitOffer = async () => {
  if (!currentClub.value || !isBuyer.value) return;
  
  isSubmitting.value = true;
  showAiResponse.value = false;
  
  try {
    const result = transferWindowStore.processNegotiationRound(
      props.negotiation.id,
      { fee: offerFee.value },
      currentClub.value.id
    );
    
    if (result.aiResponse) {
      aiResponse.value = result.aiResponse;
      showAiResponse.value = true;
    }
    
    if (result.negotiation?.status === 'agreed') {
      setTimeout(() => {
        showAiResponse.value = false;
      }, 2000);
    }
  } catch (e) {
    console.error('Failed to submit offer:', e);
  } finally {
    isSubmitting.value = false;
  }
};

const completeTransfer = async () => {
  if (!currentClub.value) return;
  
  isSubmitting.value = true;
  
  try {
    const result = transferWindowStore.completeTransfer(
      props.negotiation.id,
      currentClub.value.id
    );
    
    if (result?.success) {
      emit('completed');
    }
  } catch (e) {
    console.error('Failed to complete transfer:', e);
  } finally {
    isSubmitting.value = false;
  }
};

const formatTime = (date: Date) => {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getResponseText = (response: string) => {
  const map: Record<string, string> = {
    accept: '接受',
    counter: '还价',
    reject: '拒绝',
    pending: '待回复',
  };
  return map[response] || response;
};

const getResponseClass = (response: string) => {
  const map: Record<string, string> = {
    accept: 'accepted',
    counter: 'countered',
    reject: 'rejected',
    pending: 'pending',
  };
  return map[response] || '';
};
</script>

<template>
  <div class="negotiation-panel">
    <div class="panel-header">
      <h3>转会谈判</h3>
      <button class="close-btn" @click="emit('close')">×</button>
    </div>
    
    <div class="negotiation-info">
      <div class="player-section">
        <div class="player-name">{{ negotiation.playerName }}</div>
        <div class="player-details">
          <span class="position-tag" :class="negotiation.position">
            {{ negotiation.position }}
          </span>
          <span class="power" v-if="player">实力: {{ playerPower }}</span>
        </div>
      </div>
      
      <div class="clubs-section">
        <div class="club-box buying">
          <div class="club-label">买方</div>
          <div class="club-name">{{ negotiation.buyingClubName }}</div>
          <div v-if="isBuyer" class="your-club-badge">你的俱乐部</div>
        </div>
        <div class="transfer-arrow">→</div>
        <div class="club-box selling">
          <div class="club-label">卖方</div>
          <div class="club-name">{{ negotiation.sellingClubName }}</div>
          <div v-if="!isBuyer" class="your-club-badge">你的俱乐部</div>
        </div>
      </div>
      
      <div class="status-bar">
        <span class="status-badge" :class="negotiationStatus.class">
          {{ negotiationStatus.text }}
        </span>
        <span class="round-info">第 {{ currentRound }} / {{ maxRounds }} 轮</span>
      </div>
    </div>
    
    <div v-if="negotiation.rounds.length > 0" class="rounds-history">
      <div class="history-title">谈判记录</div>
      <div class="rounds-list">
        <div 
          v-for="round in negotiation.rounds" 
          :key="round.round"
          class="round-item"
        >
          <div class="round-header">
            <span class="round-number">第 {{ round.round }} 轮</span>
            <span class="round-time">{{ formatTime(round.timestamp) }}</span>
          </div>
          <div class="round-content">
            <div class="offer-info">
              <span class="offer-label">出价:</span>
              <span class="offer-amount">{{ round.feeOffer }} 万</span>
            </div>
            <div class="response-info">
              <span class="response-badge" :class="getResponseClass(round.response)">
                {{ getResponseText(round.response) }}
              </span>
              <span v-if="round.counterOffer" class="counter-info">
                还价: {{ round.counterOffer.fee }} 万
              </span>
            </div>
          </div>
          <div v-if="round.aiReasoning" class="ai-reasoning">
            {{ round.aiReasoning }}
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="showAiResponse && aiResponse" class="ai-response-box">
      <div class="ai-icon">🤖</div>
      <div class="ai-text">{{ aiResponse }}</div>
    </div>
    
    <div v-if="isNegotiationActive && isBuyer" class="offer-form">
      <div class="form-header">
        <h4>提交报价</h4>
        <div class="last-counter" v-if="lastRound?.counterOffer">
          对方期望: <span class="highlight">{{ lastRound.counterOffer.fee }} 万</span>
        </div>
      </div>
      
      <div class="form-row">
        <label>转会费 (万)</label>
        <div class="input-group">
          <input 
            type="number" 
            v-model.number="offerFee"
            :min="0"
            :max="currentFunds"
            step="1"
          />
          <span class="unit">万</span>
        </div>
      </div>
      
      <div class="quick-offers">
        <button 
          class="quick-btn"
          @click="offerFee = Math.ceil(buyoutClause * 0.8)"
        >
          80%违约金
          <span>{{ Math.ceil(buyoutClause * 0.8) }}万</span>
        </button>
        <button 
          class="quick-btn"
          @click="offerFee = buyoutClause"
        >
          违约金
          <span>{{ buyoutClause }}万</span>
        </button>
        <button 
          class="quick-btn"
          @click="offerFee = Math.ceil(buyoutClause * 1.2)"
        >
          120%违约金
          <span>{{ Math.ceil(buyoutClause * 1.2) }}万</span>
        </button>
      </div>
      
      <div class="info-box">
        <div class="info-item">
          <span class="info-label">违约金</span>
          <span class="info-value">{{ buyoutClause }} 万</span>
        </div>
        <div class="info-item">
          <span class="info-label">可用资金</span>
          <span class="info-value" :class="{ warning: currentFunds < offerFee }">
            {{ currentFunds }} 万
          </span>
        </div>
      </div>
      
      <button 
        class="submit-btn"
        :disabled="isSubmitting || offerFee > currentFunds"
        @click="submitOffer"
      >
        {{ isSubmitting ? '处理中...' : '提交报价' }}
      </button>
    </div>
    
    <div v-if="isNegotiationAgreed" class="agreement-section">
      <div class="agreement-header">
        <span class="success-icon">✓</span>
        <span>谈判成功！</span>
      </div>
      
      <div class="agreement-details">
        <div class="detail-row">
          <span class="label">转会费</span>
          <span class="value highlight">{{ negotiation.agreement?.fee }} 万</span>
        </div>
        <div class="detail-row" v-if="negotiation.playerConsent">
          <span class="label">选手意愿</span>
          <span class="value success">同意转会</span>
        </div>
        <div class="detail-row" v-else>
          <span class="label">选手意愿</span>
          <span class="value warning">等待确认</span>
        </div>
      </div>
      
      <button 
        v-if="isBuyer && negotiation.playerConsent"
        class="complete-btn"
        :disabled="isSubmitting"
        @click="completeTransfer"
      >
        {{ isSubmitting ? '处理中...' : '确认完成转会' }}
      </button>
      
      <div v-if="!negotiation.playerConsent" class="player-consent-note">
        选手尚未同意转会，请等待选手确认...
      </div>
    </div>
    
    <div v-if="negotiation.status === 'rejected'" class="rejected-section">
      <div class="rejected-icon">✗</div>
      <div class="rejected-text">谈判失败</div>
      <div class="rejected-reason">
        双方未能就转会费达成一致
      </div>
    </div>
  </div>
</template>

<style scoped>
.negotiation-panel {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.panel-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.negotiation-info {
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.player-section {
  margin-bottom: 15px;
}

.player-name {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.player-details {
  display: flex;
  align-items: center;
  gap: 12px;
}

.position-tag {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  color: white;
}

.position-tag.top { background: #e74c3c; }
.position-tag.jungle { background: #27ae60; }
.position-tag.mid { background: #3498db; }
.position-tag.adc { background: #f39c12; }
.position-tag.support { background: #9b59b6; }

.power {
  font-size: 14px;
  color: #666;
}

.clubs-section {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.club-box {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  background: #f8f9fa;
}

.club-box.buying {
  border-left: 3px solid #28a745;
}

.club-box.selling {
  border-left: 3px solid #dc3545;
}

.club-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.club-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.your-club-badge {
  display: inline-block;
  margin-top: 4px;
  padding: 2px 6px;
  background: #007bff;
  color: white;
  border-radius: 4px;
  font-size: 10px;
}

.transfer-arrow {
  font-size: 20px;
  color: #999;
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.status-badge.pending { background: #fff3cd; color: #856404; }
.status-badge.in-progress { background: #cce5ff; color: #004085; }
.status-badge.agreed { background: #d4edda; color: #155724; }
.status-badge.rejected { background: #f8d7da; color: #721c24; }
.status-badge.expired { background: #e2e3e5; color: #383d41; }

.round-info {
  font-size: 13px;
  color: #666;
}

.rounds-history {
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.history-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.rounds-list {
  max-height: 200px;
  overflow-y: auto;
}

.round-item {
  background: white;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
}

.round-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.round-number {
  font-weight: bold;
  color: #333;
}

.round-time {
  font-size: 12px;
  color: #999;
}

.round-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.offer-info {
  display: flex;
  gap: 8px;
}

.offer-label {
  font-size: 13px;
  color: #666;
}

.offer-amount {
  font-weight: bold;
  color: #007bff;
}

.response-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.response-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.response-badge.accepted { background: #d4edda; color: #155724; }
.response-badge.countered { background: #fff3cd; color: #856404; }
.response-badge.rejected { background: #f8d7da; color: #721c24; }
.response-badge.pending { background: #e2e3e5; color: #383d41; }

.counter-info {
  font-size: 12px;
  color: #856404;
}

.ai-reasoning {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #eee;
  font-size: 12px;
  color: #666;
  font-style: italic;
}

.ai-response-box {
  margin: 15px 20px;
  padding: 12px;
  background: #e3f2fd;
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.ai-icon {
  font-size: 20px;
}

.ai-text {
  flex: 1;
  font-size: 14px;
  color: #1565c0;
}

.offer-form {
  padding: 20px;
}

.form-header {
  margin-bottom: 15px;
}

.form-header h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.last-counter {
  font-size: 13px;
  color: #666;
}

.last-counter .highlight {
  color: #007bff;
  font-weight: bold;
}

.form-row {
  margin-bottom: 15px;
}

.form-row label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-group input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  text-align: right;
}

.input-group input:focus {
  outline: none;
  border-color: #007bff;
}

.unit {
  font-size: 14px;
  color: #666;
}

.quick-offers {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
}

.quick-btn {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
}

.quick-btn:hover {
  border-color: #007bff;
  background: #f8f9fa;
}

.quick-btn span {
  display: block;
  font-weight: bold;
  color: #007bff;
  margin-top: 4px;
}

.info-box {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
}

.info-label {
  font-size: 13px;
  color: #666;
}

.info-value {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.info-value.warning {
  color: #dc3545;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #0056b3;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.agreement-section {
  padding: 20px;
  background: #f8f9fa;
}

.agreement-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: bold;
  color: #28a745;
}

.success-icon {
  width: 24px;
  height: 24px;
  background: #28a745;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.agreement-details {
  background: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.detail-row .label {
  color: #666;
}

.detail-row .value {
  font-weight: 500;
}

.detail-row .value.highlight {
  color: #007bff;
  font-size: 18px;
}

.detail-row .value.success {
  color: #28a745;
}

.detail-row .value.warning {
  color: #ffc107;
}

.complete-btn {
  width: 100%;
  padding: 14px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.complete-btn:hover:not(:disabled) {
  background: #218838;
}

.complete-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.player-consent-note {
  text-align: center;
  padding: 10px;
  color: #666;
  font-size: 13px;
}

.rejected-section {
  padding: 40px 20px;
  text-align: center;
}

.rejected-icon {
  width: 48px;
  height: 48px;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: 0 auto 15px;
}

.rejected-text {
  font-size: 18px;
  font-weight: bold;
  color: #dc3545;
  margin-bottom: 8px;
}

.rejected-reason {
  font-size: 14px;
  color: #666;
}
</style>

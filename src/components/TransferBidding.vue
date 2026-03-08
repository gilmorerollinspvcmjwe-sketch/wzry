<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useTransferWindowStore } from '@/stores/transferWindow';
import { useClubStore } from '@/stores/club';
import { usePlayerStore } from '@/stores/player';
import type { TransferBid } from '@/types/transferWindow';
import { getPlayerTotalPower } from '@/utils/playerUtils';

const props = defineProps<{
  playerId: string;
  playerName: string;
  position: string;
  buyoutClause: number;
  currentClubId: string;
  currentClubName: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'success'): void;
}>();

const transferWindowStore = useTransferWindowStore();
const clubStore = useClubStore();
const playerStore = usePlayerStore();

const bidAmount = ref(0);
const bidType = ref<'open' | 'sealed'>('open');
const isSubmitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const currentClub = computed(() => clubStore.currentClub);
const currentFunds = computed(() => currentClub.value?.funds || 0);

const existingBid = computed(() => {
  return transferWindowStore.activeBids.find(b => b.playerId === props.playerId);
});

const highestBid = computed(() => existingBid.value?.highestBid || 0);
const leadingClub = computed(() => {
  if (!existingBid.value?.leadingClubId) return null;
  return clubStore.getClub(existingBid.value.leadingClubId);
});

const minBidAmount = computed(() => {
  if (highestBid.value > 0) {
    const increment = Math.ceil(highestBid.value * 0.05);
    return highestBid.value + Math.max(10, increment);
  }
  return Math.max(10, props.buyoutClause * 0.5);
});

const suggestedBid = computed(() => {
  return Math.ceil(props.buyoutClause * 0.8);
});

const isLeading = computed(() => {
  return existingBid.value?.leadingClubId === currentClub.value?.id;
});

const bidHistory = computed(() => {
  return existingBid.value?.bids || [];
});

const player = computed(() => {
  return playerStore.getPlayer(props.playerId);
});

const playerPower = computed(() => {
  if (!player.value) return 0;
  return getPlayerTotalPower(player.value);
});

watch(minBidAmount, (newVal) => {
  if (bidAmount.value < newVal) {
    bidAmount.value = newVal;
  }
}, { immediate: true });

const quickBid = (multiplier: number) => {
  bidAmount.value = Math.ceil(props.buyoutClause * multiplier);
};

const placeBid = async () => {
  if (!currentClub.value) return;
  
  errorMessage.value = '';
  successMessage.value = '';
  
  if (bidAmount.value < minBidAmount.value) {
    errorMessage.value = `出价不能低于 ${minBidAmount.value} 万`;
    return;
  }
  
  if (bidAmount.value > currentFunds.value) {
    errorMessage.value = '资金不足';
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    const result = transferWindowStore.placeBid(
      props.playerId,
      currentClub.value.id,
      bidAmount.value,
      bidType.value
    );
    
    if (result.success) {
      successMessage.value = `成功出价 ${bidAmount.value} 万！`;
      emit('success');
    } else {
      errorMessage.value = result.reason || '出价失败';
    }
  } catch (e) {
    errorMessage.value = '出价失败，请重试';
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
</script>

<template>
  <div class="bidding-panel">
    <div class="panel-header">
      <h3>竞价出价</h3>
      <button class="close-btn" @click="emit('close')">×</button>
    </div>
    
    <div class="player-info">
      <div class="player-name">{{ playerName }}</div>
      <div class="player-details">
        <span class="position-tag" :class="position">{{ position }}</span>
        <span class="power">实力: {{ playerPower }}</span>
      </div>
      <div class="club-info">
        当前俱乐部: {{ currentClubName }}
      </div>
    </div>
    
    <div v-if="existingBid" class="current-bid-status">
      <div class="status-header">
        <span class="status-label">当前竞价状态</span>
        <span v-if="isLeading" class="leading-badge">领先</span>
        <span v-else class="outbid-badge">已被超越</span>
      </div>
      <div class="bid-info">
        <div class="info-row">
          <span class="label">最高出价</span>
          <span class="value highlight">{{ highestBid }} 万</span>
        </div>
        <div class="info-row" v-if="leadingClub">
          <span class="label">领先俱乐部</span>
          <span class="value">{{ leadingClub.name }}</span>
        </div>
      </div>
      
      <div v-if="bidHistory.length > 0" class="bid-history">
        <div class="history-title">出价记录</div>
        <div class="history-list">
          <div 
            v-for="bid in bidHistory.slice().reverse()" 
            :key="bid.id"
            class="history-item"
            :class="{ 
              leading: bid.status === 'leading',
              mine: bid.clubId === currentClub?.id 
            }"
          >
            <span class="club-name">{{ bid.clubName }}</span>
            <span class="bid-amount">{{ bid.amount }} 万</span>
            <span class="bid-time">{{ formatTime(bid.timestamp) }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="bid-form">
      <div class="form-row">
        <label>出价金额 (万)</label>
        <div class="input-group">
          <input 
            type="number" 
            v-model.number="bidAmount"
            :min="minBidAmount"
            :max="currentFunds"
            step="1"
          />
          <span class="unit">万</span>
        </div>
      </div>
      
      <div class="quick-bids">
        <button 
          v-for="mult in [0.8, 1.0, 1.2]" 
          :key="mult"
          class="quick-btn"
          @click="quickBid(mult)"
        >
          {{ mult === 1 ? '违约金' : `${mult}x违约金` }}
          <span class="quick-amount">{{ Math.ceil(buyoutClause * mult) }}万</span>
        </button>
      </div>
      
      <div class="form-row">
        <label>竞价方式</label>
        <div class="bid-type-toggle">
          <button 
            class="type-btn"
            :class="{ active: bidType === 'open' }"
            @click="bidType = 'open'"
          >
            公开竞价
          </button>
          <button 
            class="type-btn"
            :class="{ active: bidType === 'sealed' }"
            @click="bidType = 'sealed'"
          >
            密封竞价
          </button>
        </div>
      </div>
      
      <div class="info-box">
        <div class="info-item">
          <span class="info-label">违约金</span>
          <span class="info-value">{{ buyoutClause }} 万</span>
        </div>
        <div class="info-item">
          <span class="info-label">最低出价</span>
          <span class="info-value">{{ minBidAmount }} 万</span>
        </div>
        <div class="info-item">
          <span class="info-label">可用资金</span>
          <span class="info-value" :class="{ warning: currentFunds < bidAmount }">
            {{ currentFunds }} 万
          </span>
        </div>
      </div>
      
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
      
      <button 
        class="submit-btn"
        :disabled="isSubmitting || bidAmount > currentFunds"
        @click="placeBid"
      >
        {{ isSubmitting ? '处理中...' : '确认出价' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.bidding-panel {
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

.player-info {
  padding: 20px;
  border-bottom: 1px solid #eee;
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
  margin-bottom: 8px;
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

.club-info {
  font-size: 13px;
  color: #888;
}

.current-bid-status {
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.status-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.status-label {
  font-size: 14px;
  color: #666;
}

.leading-badge {
  padding: 2px 8px;
  background: #28a745;
  color: white;
  border-radius: 10px;
  font-size: 12px;
}

.outbid-badge {
  padding: 2px 8px;
  background: #dc3545;
  color: white;
  border-radius: 10px;
  font-size: 12px;
}

.bid-info {
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
}

.info-row .label {
  color: #666;
  font-size: 13px;
}

.info-row .value {
  font-weight: 500;
  color: #333;
}

.info-row .value.highlight {
  color: #007bff;
  font-size: 16px;
}

.bid-history {
  margin-top: 12px;
}

.history-title {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.history-list {
  max-height: 120px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  background: white;
  border-radius: 4px;
  margin-bottom: 4px;
  font-size: 12px;
}

.history-item.leading {
  background: #d4edda;
}

.history-item.mine {
  border-left: 3px solid #007bff;
}

.history-item .club-name {
  flex: 1;
  color: #333;
}

.history-item .bid-amount {
  font-weight: bold;
  color: #007bff;
}

.history-item .bid-time {
  color: #999;
}

.bid-form {
  padding: 20px;
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

.quick-bids {
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
}

.quick-btn:hover {
  border-color: #007bff;
  background: #f8f9fa;
}

.quick-btn .quick-amount {
  display: block;
  font-size: 14px;
  font-weight: bold;
  color: #007bff;
  margin-top: 4px;
}

.bid-type-toggle {
  display: flex;
  gap: 8px;
}

.type-btn {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.type-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
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

.error-message {
  padding: 10px;
  background: #f8d7da;
  color: #721c24;
  border-radius: 8px;
  margin-bottom: 15px;
  font-size: 13px;
}

.success-message {
  padding: 10px;
  background: #d4edda;
  color: #155724;
  border-radius: 8px;
  margin-bottom: 15px;
  font-size: 13px;
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
</style>

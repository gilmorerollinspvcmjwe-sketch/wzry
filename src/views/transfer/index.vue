<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { useClubStore } from '@/stores/club';
import { usePlayerStore } from '@/stores/player';
import { useGameStore } from '@/stores/game';
import { useTransferWindowStore } from '@/stores/transferWindow';
import { Player } from '@/core/models/Player';
import type { Position, PlayerStats } from '@/types';
import type { TransferNegotiation as TransferNegotiationType } from '@/types/transferWindow';
import { getPlayerTotalPower } from '@/utils/playerUtils';
import TransferBidding from '@/components/TransferBidding.vue';
import TransferNegotiationPanel from '@/components/TransferNegotiation.vue';

const clubStore = useClubStore();
const playerStore = usePlayerStore();
const gameStore = useGameStore();
const transferWindowStore = useTransferWindowStore();

const activeTab = ref<'market' | 'bidding' | 'negotiations' | 'free' | 'youth'>('market');
const selectedPlayer = ref<Player | null>(null);
const showPlayerDetail = ref(false);
const showBiddingPanel = ref(false);
const showNegotiationPanel = ref(false);
const selectedNegotiation = ref<TransferNegotiationType | null>(null);
const positionFilter = ref<Position | 'all'>('all');

const positionNames: Record<string, string> = {
  all: '全部',
  top: '对抗路',
  jungle: '打野',
  mid: '中路',
  adc: '发育路',
  support: '游走',
};

const statNames: Record<keyof PlayerStats, string> = {
  mechanics: '操作',
  awareness: '意识',
  mentality: '心态',
  teamwork: '团队',
  heroPool: '英雄池',
};

const getPlayerPower = (player: any): number => {
  return getPlayerTotalPower(player);
};

const marketPlayers = computed(() => {
  return playerStore.transferList.filter(p => {
    if (positionFilter.value === 'all') return true;
    return p.position === positionFilter.value;
  });
});

const freePlayers = computed(() => {
  return playerStore.availablePlayers.filter(p => {
    if (positionFilter.value === 'all') return true;
    return p.position === positionFilter.value;
  });
});

const currentFunds = computed(() => clubStore.currentClub?.funds || 0);

const isTransferWindow = computed(() => gameStore.isTransferWindow);

const currentClubId = computed(() => clubStore.currentClub?.id || '');

const myBids = computed(() => transferWindowStore.myBids);

const myNegotiations = computed(() => transferWindowStore.myNegotiations);

const pendingBidsCount = computed(() => transferWindowStore.pendingBidsCount);

const activeNegotiationsCount = computed(() => transferWindowStore.activeNegotiationsCount);

const windowStatus = computed(() => transferWindowStore.windowStatus);

const daysRemaining = computed(() => transferWindowStore.daysRemaining);

const openPlayerDetail = (player: any) => {
  selectedPlayer.value = player as Player;
  showPlayerDetail.value = true;
};

const closePlayerDetail = () => {
  showPlayerDetail.value = false;
  selectedPlayer.value = null;
};

const openBiddingPanel = (player: any) => {
  selectedPlayer.value = player as Player;
  showPlayerDetail.value = false;
  showBiddingPanel.value = true;
};

const closeBiddingPanel = () => {
  showBiddingPanel.value = false;
  selectedPlayer.value = null;
};

const openNegotiationPanel = (negotiation: TransferNegotiationType) => {
  selectedNegotiation.value = negotiation;
  showNegotiationPanel.value = true;
};

const closeNegotiationPanel = () => {
  showNegotiationPanel.value = false;
  selectedNegotiation.value = null;
};

const signPlayer = (player: any) => {
  if (!isTransferWindow.value) {
    alert('现在不是转会期，无法签约选手');
    return;
  }
  
  const result = clubStore.signPlayer(player);
  if (result.success) {
    const index = playerStore.transferList.findIndex(p => p.id === player.id);
    if (index > -1) {
      playerStore.transferList.splice(index, 1);
    }
    if (result.message) {
      alert(result.message);
    } else {
      alert(`成功签约 ${player.name}！`);
    }
    closePlayerDetail();
  } else {
    let message = result.message || '资金不足，无法签约该选手';
    if (result.competingClubs && result.competingClubs.length > 0) {
      message += `\n参与竞价的俱乐部：${result.competingClubs.join('、')}`;
    }
    alert(message);
  }
};

const generateYouthPlayer = () => {
  const cost = 50;
  if (currentFunds.value < cost) {
    alert('资金不足，需要 50 万');
    return;
  }
  
  if (confirm('花费 50 万挖掘一名青训选手？')) {
    clubStore.spendFunds(cost);
    const player = playerStore.generateYouthPlayer();
    const result = clubStore.signPlayer(player, true);
    if (result.message) {
      alert(result.message);
    } else {
      alert(`发现青训选手：${player.name}`);
    }
  }
};

const refreshMarket = () => {
  const cost = 10;
  if (currentFunds.value < cost) {
    alert('资金不足');
    return;
  }
  
  if (confirm('花费10万刷新转会市场？')) {
    clubStore.spendFunds(cost);
    for (let i = 0; i < 3; i++) {
      const player = playerStore.generatePlayer([18, 28], [60, 90]);
      playerStore.transferList.push(player);
    }
    alert('转会市场已刷新');
  }
};

const initTransferWindow = () => {
  const currentDate = gameStore.currentDate instanceof Date 
    ? gameStore.currentDate 
    : new Date(gameStore.currentDate);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const type = month >= 5 && month <= 7 ? 'summer' : 'winter';
  
  if (!transferWindowStore.currentWindow) {
    transferWindowStore.initializeWindow(year, type);
  }
  
  transferWindowStore.checkWindowStatus();
  
  if (currentClubId.value) {
    transferWindowStore.refreshClubData(currentClubId.value);
  }
};

const onBiddingSuccess = () => {
  if (currentClubId.value) {
    transferWindowStore.refreshClubData(currentClubId.value);
  }
};

const onNegotiationCompleted = () => {
  closeNegotiationPanel();
  if (currentClubId.value) {
    transferWindowStore.refreshClubData(currentClubId.value);
  }
};

const getNegotiationStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待处理',
    in_progress: '谈判中',
    agreed: '已达成',
    rejected: '已拒绝',
    expired: '已过期',
  };
  return map[status] || status;
};

const getNegotiationStatusClass = (status: string) => {
  const map: Record<string, string> = {
    pending: 'pending',
    in_progress: 'in-progress',
    agreed: 'agreed',
    rejected: 'rejected',
    expired: 'expired',
  };
  return map[status] || '';
};

watch(currentClubId, (newId) => {
  if (newId) {
    transferWindowStore.refreshClubData(newId);
  }
});

onMounted(() => {
  if (playerStore.transferList.length === 0) {
    for (let i = 0; i < 5; i++) {
      const player = playerStore.generatePlayer([18, 28], [60, 90]);
      playerStore.transferList.push(player);
    }
  }
  
  initTransferWindow();
});
</script>

<template>
  <div class="transfer-page">
    <h2 class="page-title">转会市场</h2>
    
    <div class="funds-bar">
      <div class="funds-item">
        <span class="funds-label">可用资金</span>
        <span class="funds-value">{{ currentFunds }}万</span>
      </div>
      <div class="window-info">
        <div class="transfer-status" :class="{ open: isTransferWindow }">
          {{ windowStatus }}
        </div>
        <div v-if="isTransferWindow && daysRemaining > 0" class="days-remaining">
          剩余 {{ daysRemaining }} 天
        </div>
      </div>
    </div>
    
    <div class="filter-bar">
      <button 
        v-for="(name, key) in positionNames" 
        :key="key"
        class="filter-btn"
        :class="{ active: positionFilter === key }"
        @click="positionFilter = key as Position | 'all'"
      >
        {{ name }}
      </button>
    </div>
    
    <div class="tab-bar">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'market' }"
        @click="activeTab = 'market'"
      >
        转会市场
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'bidding' }"
        @click="activeTab = 'bidding'"
      >
        竞价
        <span v-if="pendingBidsCount > 0" class="badge">{{ pendingBidsCount }}</span>
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'negotiations' }"
        @click="activeTab = 'negotiations'"
      >
        谈判
        <span v-if="activeNegotiationsCount > 0" class="badge">{{ activeNegotiationsCount }}</span>
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'free' }"
        @click="activeTab = 'free'"
      >
        自由选手
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'youth' }"
        @click="activeTab = 'youth'"
      >
        青训
      </button>
    </div>
    
    <div v-if="activeTab === 'market'" class="player-list">
      <div class="action-bar">
        <button class="refresh-btn" @click="refreshMarket">
          <span>🔄</span> 刷新市场 (10万)
        </button>
      </div>
      
      <div 
        v-for="player in marketPlayers" 
        :key="player.id"
        class="player-card"
        @click="openPlayerDetail(player)"
      >
        <div class="player-header">
          <div class="player-position" :class="player.position">
            {{ positionNames[player.position] }}
          </div>
          <div class="player-name">{{ player.name }}</div>
          <div class="player-age">{{ player.age }}岁</div>
        </div>
        
        <div class="player-stats">
          <div class="stat-row">
            <span class="stat-label">实力</span>
            <div class="stat-bar">
              <div 
                class="stat-fill" 
                :style="{ width: getPlayerPower(player) + '%' }"
              ></div>
            </div>
            <span class="stat-value">{{ getPlayerPower(player) }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">潜力</span>
            <div class="stat-bar">
              <div 
                class="stat-fill potential" 
                :style="{ width: player.potential + '%' }"
              ></div>
            </div>
            <span class="stat-value">{{ player.potential }}</span>
          </div>
        </div>
        
        <div class="player-footer">
          <span class="transfer-fee">
            违约金: {{ player.contract.buyoutClause.toFixed(1) }}万
          </span>
          <span class="salary">{{ player.contract.salary }}万/周</span>
        </div>
      </div>
      
      <div v-if="marketPlayers.length === 0" class="empty-state">
        <p>暂无可用选手，请刷新市场</p>
      </div>
    </div>
    
    <div v-else-if="activeTab === 'bidding'" class="bidding-section">
      <div class="section-header">
        <h3>我的竞价</h3>
        <span class="count-badge">{{ myBids.length }} 个</span>
      </div>
      
      <div v-if="myBids.length > 0" class="bids-list">
        <div 
          v-for="bid in myBids" 
          :key="bid.id"
          class="bid-card"
          :class="{ leading: bid.leadingClubId === currentClubId }"
        >
          <div class="bid-header">
            <div class="player-info">
              <span class="player-name">{{ bid.playerName }}</span>
              <span class="position-tag" :class="bid.position">{{ bid.position }}</span>
            </div>
            <span 
              class="bid-status"
              :class="bid.leadingClubId === currentClubId ? 'leading' : 'outbid'"
            >
              {{ bid.leadingClubId === currentClubId ? '领先' : '落后' }}
            </span>
          </div>
          <div class="bid-details">
            <div class="detail-item">
              <span class="label">当前最高价</span>
              <span class="value highlight">{{ bid.highestBid }} 万</span>
            </div>
            <div class="detail-item">
              <span class="label">违约金</span>
              <span class="value">{{ bid.buyoutClause }} 万</span>
            </div>
            <div class="detail-item">
              <span class="label">截止时间</span>
              <span class="value">{{ new Date(bid.deadline).toLocaleDateString() }}</span>
            </div>
          </div>
          <div class="bid-actions">
            <button 
              class="action-btn primary"
              @click="openBiddingPanel({ id: bid.playerId, name: bid.playerName, position: bid.position, buyoutClause: bid.buyoutClause, currentClubId: bid.currentClubId, currentClubName: bid.currentClubName })"
            >
              继续出价
            </button>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <p>暂无竞价记录</p>
        <p class="hint">在转会市场选择选手进行竞价</p>
      </div>
    </div>
    
    <div v-else-if="activeTab === 'negotiations'" class="negotiations-section">
      <div class="section-header">
        <h3>转会谈判</h3>
        <span class="count-badge">{{ myNegotiations.length }} 个</span>
      </div>
      
      <div v-if="myNegotiations.length > 0" class="negotiations-list">
        <div 
          v-for="negotiation in myNegotiations" 
          :key="negotiation.id"
          class="negotiation-card"
          :class="getNegotiationStatusClass(negotiation.status)"
          @click="openNegotiationPanel(negotiation)"
        >
          <div class="negotiation-header">
            <div class="player-info">
              <span class="player-name">{{ negotiation.playerName }}</span>
              <span class="position-tag" :class="negotiation.position">{{ negotiation.position }}</span>
            </div>
            <span class="negotiation-status" :class="getNegotiationStatusClass(negotiation.status)">
              {{ getNegotiationStatusText(negotiation.status) }}
            </span>
          </div>
          <div class="negotiation-details">
            <div class="clubs-info">
              <span class="club">{{ negotiation.buyingClubName }}</span>
              <span class="arrow">→</span>
              <span class="club">{{ negotiation.sellingClubName }}</span>
            </div>
            <div class="round-info">
              第 {{ negotiation.rounds.length + 1 }} 轮谈判
            </div>
          </div>
          <div v-if="negotiation.agreement" class="agreement-preview">
            已达成: {{ negotiation.agreement.fee }} 万
          </div>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <p>暂无谈判记录</p>
        <p class="hint">对其他俱乐部的选手发起转会谈判</p>
      </div>
    </div>
    
    <div v-else-if="activeTab === 'free'" class="player-list">
      <div 
        v-for="player in freePlayers" 
        :key="player.id"
        class="player-card"
        @click="openPlayerDetail(player)"
      >
        <div class="player-header">
          <div class="player-position" :class="player.position">
            {{ positionNames[player.position] }}
          </div>
          <div class="player-name">{{ player.name }}</div>
          <div class="player-age">{{ player.age }}岁</div>
        </div>
        
        <div class="player-stats">
          <div class="stat-row">
            <span class="stat-label">实力</span>
            <div class="stat-bar">
              <div 
                class="stat-fill" 
                :style="{ width: getPlayerPower(player) + '%' }"
              ></div>
            </div>
            <span class="stat-value">{{ getPlayerPower(player) }}</span>
          </div>
        </div>
        
        <div class="player-footer">
          <span class="free-badge">自由签约</span>
          <span class="salary">{{ player.contract.salary }}万/周</span>
        </div>
      </div>
      
      <div v-if="freePlayers.length === 0" class="empty-state">
        <p>暂无自由选手</p>
      </div>
    </div>
    
    <div v-else class="youth-section">
      <div class="youth-info">
        <h3>青训系统</h3>
        <p>花费资金挖掘有潜力的年轻选手</p>
        <ul class="youth-features">
          <li>年龄16-18岁，潜力更高</li>
          <li>薪资要求较低</li>
          <li>需要培养才能发挥潜力</li>
        </ul>
      </div>
      
      <button class="scout-btn" @click="generateYouthPlayer">
        <span class="btn-icon">🔍</span>
        <div class="btn-text">
          <span class="main-text">挖掘青训选手</span>
          <span class="sub-text">花费 50万</span>
        </div>
      </button>
    </div>
    
    <div v-if="showPlayerDetail && selectedPlayer" class="modal-overlay" @click="closePlayerDetail">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedPlayer.name }}</h3>
          <button class="close-btn" @click="closePlayerDetail">×</button>
        </div>
        
        <div class="modal-body">
          <div class="info-section">
            <div class="info-row">
              <span class="info-label">位置</span>
              <span class="info-value">{{ positionNames[selectedPlayer.position] }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">年龄</span>
              <span class="info-value">{{ selectedPlayer.age }}岁</span>
            </div>
            <div class="info-row">
              <span class="info-label">潜力</span>
              <span class="info-value">{{ selectedPlayer.potential }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">总实力</span>
              <span class="info-value highlight">{{ getPlayerPower(selectedPlayer) }}</span>
            </div>
          </div>
          
          <div class="stats-section">
            <h4>属性详情</h4>
            <div 
              v-for="(value, key) in selectedPlayer.stats" 
              :key="key"
              class="detail-stat-row"
            >
              <span class="stat-name">{{ statNames[key] }}</span>
              <div class="stat-bar">
                <div class="stat-fill" :style="{ width: value + '%' }"></div>
              </div>
              <span class="stat-num">{{ Math.round(value) }}</span>
            </div>
          </div>
          
          <div class="contract-section">
            <h4>合同信息</h4>
            <div class="info-row">
              <span class="info-label">周薪</span>
              <span class="info-value">{{ selectedPlayer.contract.salary }}万</span>
            </div>
            <div class="info-row" v-if="activeTab === 'market'">
              <span class="info-label">违约金</span>
              <span class="info-value highlight">{{ selectedPlayer.contract.buyoutClause.toFixed(1) }}万</span>
            </div>
            <div class="info-row" v-if="activeTab === 'free'">
              <span class="info-label">签约费</span>
              <span class="info-value highlight">免费</span>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <div class="action-buttons">
            <button 
              v-if="activeTab === 'market'"
              class="action-btn bidding"
              :disabled="!isTransferWindow"
              @click="openBiddingPanel(selectedPlayer)"
            >
              竞价出价
            </button>
            <button 
              class="action-btn sign"
              :disabled="!isTransferWindow || currentFunds < selectedPlayer.contract.buyoutClause"
              @click="signPlayer(selectedPlayer)"
            >
              <span v-if="!isTransferWindow">转会期关闭</span>
              <span v-else-if="currentFunds < selectedPlayer.contract.buyoutClause">资金不足</span>
              <span v-else>直接签约</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="showBiddingPanel && selectedPlayer" class="modal-overlay" @click="closeBiddingPanel">
      <div class="modal-content bidding-modal" @click.stop>
        <TransferBidding
          :playerId="selectedPlayer.id"
          :playerName="selectedPlayer.name"
          :position="selectedPlayer.position"
          :buyoutClause="selectedPlayer.contract.buyoutClause"
          :currentClubId="selectedPlayer.currentClubId || ''"
          :currentClubName="selectedPlayer.currentClubName || ''"
          @close="closeBiddingPanel"
          @success="onBiddingSuccess"
        />
      </div>
    </div>
    
    <div v-if="showNegotiationPanel && selectedNegotiation" class="modal-overlay" @click="closeNegotiationPanel">
      <div class="modal-content negotiation-modal" @click.stop>
        <TransferNegotiationPanel
          :negotiation="selectedNegotiation"
          @close="closeNegotiationPanel"
          @completed="onNegotiationCompleted"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.transfer-page {
  padding: 15px;
  padding-bottom: 80px;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

.funds-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.funds-item {
  display: flex;
  flex-direction: column;
}

.funds-label {
  font-size: 12px;
  color: #666;
}

.funds-value {
  font-size: 20px;
  font-weight: bold;
  color: #28a745;
}

.window-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.transfer-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  background: #f8d7da;
  color: #721c24;
}

.transfer-status.open {
  background: #d4edda;
  color: #155724;
}

.days-remaining {
  font-size: 11px;
  color: #666;
}

.filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
  overflow-x: auto;
  padding-bottom: 5px;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background: white;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.filter-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.tab-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
  overflow-x: auto;
  padding-bottom: 5px;
}

.tab-btn {
  flex: 1;
  min-width: 60px;
  padding: 10px 8px;
  border: none;
  border-radius: 8px;
  background: #f5f5f5;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.tab-btn.active {
  background: #007bff;
  color: white;
}

.badge {
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: #dc3545;
  color: white;
  border-radius: 9px;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-bar {
  margin-bottom: 10px;
}

.refresh-btn {
  width: 100%;
  padding: 12px;
  border: 1px dashed #007bff;
  border-radius: 8px;
  background: white;
  color: #007bff;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.player-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.player-card:active {
  transform: scale(0.98);
}

.player-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.player-position {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  color: white;
}

.player-position.top { background: #e74c3c; }
.player-position.jungle { background: #27ae60; }
.player-position.mid { background: #3498db; }
.player-position.adc { background: #f39c12; }
.player-position.support { background: #9b59b6; }

.player-name {
  flex: 1;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.player-age {
  font-size: 12px;
  color: #999;
}

.player-stats {
  margin-bottom: 12px;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.stat-label {
  width: 40px;
  font-size: 12px;
  color: #666;
}

.stat-bar {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.stat-fill {
  height: 100%;
  background: #007bff;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.stat-fill.potential {
  background: #9b59b6;
}

.stat-value {
  width: 35px;
  text-align: right;
  font-size: 13px;
  font-weight: bold;
  color: #333;
}

.player-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.transfer-fee {
  font-size: 12px;
  color: #dc3545;
  font-weight: bold;
}

.salary {
  font-size: 12px;
  color: #666;
}

.free-badge {
  padding: 4px 8px;
  background: #d4edda;
  color: #155724;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.count-badge {
  padding: 2px 8px;
  background: #e9ecef;
  border-radius: 10px;
  font-size: 12px;
  color: #666;
}

.bids-list,
.negotiations-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bid-card,
.negotiation-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid #ddd;
}

.bid-card.leading {
  border-left-color: #28a745;
}

.bid-card:active,
.negotiation-card:active {
  transform: scale(0.98);
}

.bid-header,
.negotiation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.bid-header .player-info,
.negotiation-header .player-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bid-header .player-name,
.negotiation-header .player-name {
  font-size: 16px;
  font-weight: bold;
}

.position-tag {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: bold;
  color: white;
}

.position-tag.top { background: #e74c3c; }
.position-tag.jungle { background: #27ae60; }
.position-tag.mid { background: #3498db; }
.position-tag.adc { background: #f39c12; }
.position-tag.support { background: #9b59b6; }

.bid-status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.bid-status.leading {
  background: #d4edda;
  color: #155724;
}

.bid-status.outbid {
  background: #f8d7da;
  color: #721c24;
}

.negotiation-status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.negotiation-status.pending { background: #fff3cd; color: #856404; }
.negotiation-status.in-progress { background: #cce5ff; color: #004085; }
.negotiation-status.agreed { background: #d4edda; color: #155724; }
.negotiation-status.rejected { background: #f8d7da; color: #721c24; }
.negotiation-status.expired { background: #e2e3e5; color: #383d41; }

.bid-details,
.negotiation-details {
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 13px;
}

.detail-item .label {
  color: #666;
}

.detail-item .value {
  font-weight: 500;
}

.detail-item .value.highlight {
  color: #007bff;
  font-weight: bold;
}

.clubs-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  margin-bottom: 8px;
}

.clubs-info .club {
  color: #333;
}

.clubs-info .arrow {
  color: #999;
}

.round-info {
  font-size: 12px;
  color: #666;
}

.agreement-preview {
  padding: 8px;
  background: #d4edda;
  border-radius: 6px;
  font-size: 13px;
  color: #155724;
  text-align: center;
}

.bid-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.primary {
  background: #007bff;
  color: white;
}

.action-btn.primary:hover {
  background: #0056b3;
}

.youth-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.youth-info {
  margin-bottom: 20px;
}

.youth-info h3 {
  font-size: 18px;
  color: #333;
  margin: 0 0 10px 0;
}

.youth-info p {
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
}

.youth-features {
  list-style: none;
  padding: 0;
  margin: 0;
}

.youth-features li {
  padding: 8px 0;
  padding-left: 20px;
  position: relative;
  color: #666;
  font-size: 14px;
}

.youth-features li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #28a745;
  font-weight: bold;
}

.scout-btn {
  width: 100%;
  padding: 20px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  transition: all 0.3s ease;
}

.scout-btn:active {
  transform: scale(0.98);
}

.btn-icon {
  font-size: 32px;
}

.btn-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.main-text {
  font-size: 18px;
  font-weight: bold;
}

.sub-text {
  font-size: 14px;
  opacity: 0.9;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-state .hint {
  font-size: 12px;
  margin-top: 8px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content.bidding-modal,
.modal-content.negotiation-modal {
  max-width: 450px;
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
  font-size: 20px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 20px;
}

.modal-body h4 {
  font-size: 14px;
  color: #666;
  margin: 0 0 12px 0;
}

.info-section,
.stats-section,
.contract-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.info-section:last-child,
.stats-section:last-child,
.contract-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.info-label {
  color: #666;
}

.info-value {
  color: #333;
  font-weight: 500;
}

.info-value.highlight {
  color: #007bff;
  font-size: 18px;
  font-weight: bold;
}

.detail-stat-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.stat-name {
  width: 50px;
  font-size: 13px;
  color: #666;
}

.stat-num {
  width: 30px;
  text-align: right;
  font-size: 13px;
  font-weight: bold;
  color: #333;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.action-buttons .action-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.action-buttons .action-btn.bidding {
  background: #17a2b8;
  color: white;
}

.action-buttons .action-btn.bidding:hover:not(:disabled) {
  background: #138496;
}

.action-buttons .action-btn.sign {
  background: #28a745;
  color: white;
}

.action-buttons .action-btn.sign:hover:not(:disabled) {
  background: #218838;
}

.action-buttons .action-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useClubStore } from '@/stores/club';
import { usePlayerStore } from '@/stores/player';
import { useGameStore } from '@/stores/game';
import { Player } from '@/core/models/Player';
import type { Position, PlayerStats } from '@/types';

const clubStore = useClubStore();
const playerStore = usePlayerStore();
const gameStore = useGameStore();

const activeTab = ref<'market' | 'free' | 'youth'>('market');
const selectedPlayer = ref<Player | null>(null);
const showPlayerDetail = ref(false);
const positionFilter = ref<Position | 'all'>('all');

// 位置名称映射
const positionNames: Record<string, string> = {
  all: '全部',
  top: '对抗路',
  jungle: '打野',
  mid: '中路',
  adc: '发育路',
  support: '游走',
};

// 属性名称映射
const statNames: Record<keyof PlayerStats, string> = {
  mechanics: '操作',
  awareness: '意识',
  mentality: '心态',
  teamwork: '团队',
  heroPool: '英雄池',
};

// 转会市场选手（模拟其他俱乐部的选手）
const marketPlayers = computed(() => {
  // 生成一些随机的可签约选手
  return playerStore.transferList.filter(p => {
    if (positionFilter.value === 'all') return true;
    return p.position === positionFilter.value;
  });
});

// 自由选手
const freePlayers = computed(() => {
  return playerStore.availablePlayers.filter(p => {
    if (positionFilter.value === 'all') return true;
    return p.position === positionFilter.value;
  });
});

// 当前资金
const currentFunds = computed(() => clubStore.currentClub?.funds || 0);

// 是否是转会期
const isTransferWindow = computed(() => gameStore.isTransferWindow);

// 打开选手详情
const openPlayerDetail = (player: any) => {
  selectedPlayer.value = player as Player;
  showPlayerDetail.value = true;
};

// 关闭选手详情
const closePlayerDetail = () => {
  showPlayerDetail.value = false;
  selectedPlayer.value = null;
};

// 签约选手
const signPlayer = (player: any) => {
  if (!isTransferWindow.value) {
    alert('现在不是转会期，无法签约选手');
    return;
  }
  
  const success = clubStore.signPlayer(player);
  if (success) {
    // 从转会列表移除
    const index = playerStore.transferList.findIndex(p => p.id === player.id);
    if (index > -1) {
      playerStore.transferList.splice(index, 1);
    }
    alert(`成功签约 ${player.name}！`);
    closePlayerDetail();
  } else {
    alert('资金不足，无法签约该选手');
  }
};

// 生成青训选手
const generateYouthPlayer = () => {
  const cost = 50; // 挖掘青训选手费用
  if (currentFunds.value < cost) {
    alert('资金不足，需要50万');
    return;
  }
  
  if (confirm('花费50万挖掘一名青训选手？')) {
    clubStore.spendFunds(cost);
    const player = playerStore.generateYouthPlayer();
    clubStore.signPlayer(player, true);
    alert(`发现青训选手：${player.name}`);
  }
};

// 刷新转会市场
const refreshMarket = () => {
  const cost = 10;
  if (currentFunds.value < cost) {
    alert('资金不足');
    return;
  }
  
  if (confirm('花费10万刷新转会市场？')) {
    clubStore.spendFunds(cost);
    // 生成新的选手
    for (let i = 0; i < 3; i++) {
      const player = playerStore.generatePlayer([18, 28], [60, 90]);
      playerStore.transferList.push(player);
    }
    alert('转会市场已刷新');
  }
};

// 初始化转会市场
onMounted(() => {
  // 如果转会市场为空，生成一些初始选手
  if (playerStore.transferList.length === 0) {
    for (let i = 0; i < 5; i++) {
      const player = playerStore.generatePlayer([18, 28], [60, 90]);
      playerStore.transferList.push(player);
    }
  }
});
</script>

<template>
  <div class="transfer-page">
    <h2 class="page-title">转会市场</h2>
    
    <!-- 资金显示 -->
    <div class="funds-bar">
      <div class="funds-item">
        <span class="funds-label">可用资金</span>
        <span class="funds-value">{{ currentFunds }}万</span>
      </div>
      <div class="transfer-status" :class="{ open: isTransferWindow }">
        {{ isTransferWindow ? '转会期开放' : '转会期关闭' }}
      </div>
    </div>
    
    <!-- 位置筛选 -->
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
    
    <!-- 标签切换 -->
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
    
    <!-- 转会市场 -->
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
                :style="{ width: (player as any).getTotalPower?.() + '%' }"
              ></div>
            </div>
            <span class="stat-value">{{ (player as any).getTotalPower?.() || 0 }}</span>
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
    
    <!-- 自由选手 -->
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
                :style="{ width: (player as any).getTotalPower?.() + '%' }"
              ></div>
            </div>
            <span class="stat-value">{{ (player as any).getTotalPower?.() || 0 }}</span>
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
    
    <!-- 青训 -->
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
    
    <!-- 选手详情弹窗 -->
    <div v-if="showPlayerDetail && selectedPlayer" class="modal-overlay" @click="closePlayerDetail">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedPlayer.name }}</h3>
          <button class="close-btn" @click="closePlayerDetail">×</button>
        </div>
        
        <div class="modal-body">
          <!-- 基本信息 -->
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
              <span class="info-value highlight">{{ (selectedPlayer as any).getTotalPower?.() || 0 }}</span>
            </div>
          </div>
          
          <!-- 属性详情 -->
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
          
          <!-- 合同信息 -->
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
          <button 
            class="sign-btn"
            :disabled="!isTransferWindow || currentFunds < selectedPlayer.contract.buyoutClause"
            @click="signPlayer(selectedPlayer)"
          >
            <span v-if="!isTransferWindow">转会期关闭</span>
            <span v-else-if="currentFunds < selectedPlayer.contract.buyoutClause">资金不足</span>
            <span v-else>签约选手</span>
          </button>
        </div>
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

/* 资金栏 */
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

/* 筛选栏 */
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

/* 标签栏 */
.tab-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.tab-btn {
  flex: 1;
  padding: 12px;
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

/* 选手列表 */
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

/* 属性条 */
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

/* 底部信息 */
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

/* 青训区域 */
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

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

/* 弹窗 */
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

.sign-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  background: #28a745;
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sign-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.sign-btn:not(:disabled):active {
  background: #218838;
}
</style>

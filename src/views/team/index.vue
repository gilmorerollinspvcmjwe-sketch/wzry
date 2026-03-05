<script setup lang="ts">
import { computed, ref } from 'vue';
import { useClubStore } from '@/stores/club';
import { usePlayerStore } from '@/stores/player';
import { Player } from '@/core/models/Player';
import type { PlayerStats } from '@/types';

const clubStore = useClubStore();
const playerStore = usePlayerStore();

const activeTab = ref<'roster' | 'youth'>('roster');
const selectedPlayer = ref<Player | null>(null);
const showPlayerDetail = ref(false);

// 当前阵容
const roster = computed(() => clubStore.currentClub?.roster || []);
const youthTeam = computed(() => clubStore.currentClub?.youthTeam || []);

// 位置名称映射
const positionNames: Record<string, string> = {
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

// 训练选手
const trainPlayer = (player: any, statType: keyof PlayerStats) => {
  const success = playerStore.trainPlayer(player.id, statType);
  if (success) {
    alert(`训练成功！${statNames[statType]}有所提升`);
  } else {
    alert('体力不足，无法训练');
  }
};

// 休息恢复
const restPlayer = (player: any) => {
  (player as any).recover?.();
  alert(`${player.name} 已休息恢复`);
};

// 提拔青训选手
const promoteYouth = (player: any) => {
  const success = clubStore.promoteYouthPlayer(player.id);
  if (success) {
    alert(`${player.name} 已提拔到一线队`);
  }
};

// 解约选手
const releasePlayer = (player: any) => {
  if (confirm(`确定要解约 ${player.name} 吗？需要支付违约金 ${player.contract.buyoutClause * 0.5}万`)) {
    const success = clubStore.releasePlayer(player.id);
    if (success) {
      alert(`${player.name} 已解约`);
    }
  }
};

// 获取状态颜色
const getStaminaColor = (stamina: number) => {
  if (stamina >= 80) return '#28a745';
  if (stamina >= 50) return '#ffc107';
  return '#dc3545';
};

// 获取状态文本
const getConditionText = (player: any) => {
  if (player.condition.injury > 0) return '受伤';
  if (player.condition.stamina < 30) return '疲劳';
  if (player.condition.morale < 50) return '低落';
  return '良好';
};

// 格式化日期
const formatDate = (date: Date | string) => {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '未知日期';
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
};
</script>

<template>
  <div class="team-page">
    <h2 class="page-title">阵容管理</h2>
    
    <!-- 标签切换 -->
    <div class="tab-bar">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'roster' }"
        @click="activeTab = 'roster'"
      >
        一线队 ({{ roster.length }})
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'youth' }"
        @click="activeTab = 'youth'"
      >
        青训队 ({{ youthTeam.length }})
      </button>
    </div>
    
    <!-- 一线队列表 -->
    <div v-if="activeTab === 'roster'" class="player-list">
      <div 
        v-for="player in roster" 
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
            <span class="stat-label">体力</span>
            <div class="stat-bar">
              <div 
                class="stat-fill stamina" 
                :style="{ 
                  width: player.condition.stamina + '%',
                  backgroundColor: getStaminaColor(player.condition.stamina)
                }"
              ></div>
            </div>
            <span class="stat-value">{{ player.condition.stamina }}</span>
          </div>
        </div>
        
        <div class="player-footer">
          <span class="condition-badge" :class="getConditionText(player)">
            {{ getConditionText(player) }}
          </span>
          <span class="salary">{{ player.contract.salary }}万/周</span>
        </div>
      </div>
      
      <div v-if="roster.length === 0" class="empty-state">
        <p>暂无选手，请前往转会市场签约</p>
        <router-link to="/game/transfer" class="link-btn">
          去签约
        </router-link>
      </div>
    </div>
    
    <!-- 青训队列表 -->
    <div v-else class="player-list">
      <div 
        v-for="player in youthTeam" 
        :key="player.id"
        class="player-card youth"
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
            <span class="stat-label">潜力</span>
            <div class="stat-bar">
              <div 
                class="stat-fill potential" 
                :style="{ width: player.potential + '%' }"
              ></div>
            </div>
            <span class="stat-value">{{ player.potential }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">当前</span>
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
          <button 
            class="action-btn promote"
            @click.stop="promoteYouth(player)"
          >
            提拔
          </button>
        </div>
      </div>
      
      <div v-if="youthTeam.length === 0" class="empty-state">
        <p>暂无青训选手</p>
      </div>
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
          
          <!-- 状态详情 -->
          <div class="condition-section">
            <h4>当前状态</h4>
            <div class="condition-grid">
              <div class="condition-item">
                <span class="condition-label">体力</span>
                <span class="condition-value" :style="{ color: getStaminaColor(selectedPlayer.condition.stamina) }">
                  {{ selectedPlayer.condition.stamina }}
                </span>
              </div>
              <div class="condition-item">
                <span class="condition-label">心态</span>
                <span class="condition-value">{{ selectedPlayer.condition.mentality }}</span>
              </div>
              <div class="condition-item">
                <span class="condition-label">士气</span>
                <span class="condition-value">{{ selectedPlayer.condition.morale }}</span>
              </div>
              <div class="condition-item">
                <span class="condition-label">伤病</span>
                <span class="condition-value" :class="{ injured: selectedPlayer.condition.injury > 0 }">
                  {{ selectedPlayer.condition.injury }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- 合同信息 -->
          <div class="contract-section">
            <h4>合同信息</h4>
            <div class="info-row">
              <span class="info-label">周薪</span>
              <span class="info-value">{{ selectedPlayer.contract.salary }}万</span>
            </div>
            <div class="info-row">
              <span class="info-label">违约金</span>
              <span class="info-value">{{ selectedPlayer.contract.buyoutClause.toFixed(1) }}万</span>
            </div>
            <div class="info-row">
              <span class="info-label">到期</span>
              <span class="info-value">{{ formatDate(selectedPlayer.contract.endDate) }}</span>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="action-section" v-if="activeTab === 'roster'">
            <h4>训练</h4>
            <div class="train-buttons">
              <button 
                v-for="(name, key) in statNames" 
                :key="key"
                class="train-btn"
                :disabled="selectedPlayer.condition.stamina < 20"
                @click="trainPlayer(selectedPlayer, key)"
              >
                {{ name }}
              </button>
            </div>
            <p class="train-hint" v-if="selectedPlayer.condition.stamina < 20">
              体力不足，请先休息
            </p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            v-if="activeTab === 'roster'"
            class="rest-btn"
            @click="restPlayer(selectedPlayer)"
          >
            休息恢复
          </button>
          <button 
            v-if="activeTab === 'roster'"
            class="release-btn"
            @click="releasePlayer(selectedPlayer); closePlayerDetail()"
          >
            解约
          </button>
          <button 
            v-if="activeTab === 'youth'"
            class="promote-btn"
            @click="promoteYouth(selectedPlayer); closePlayerDetail()"
          >
            提拔到一线队
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.team-page {
  padding: 15px;
  padding-bottom: 80px;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
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

.player-card.youth {
  border-left: 4px solid #28a745;
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

.stat-fill.stamina {
  background: #28a745;
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

.condition-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.condition-badge.良好 {
  background: #d4edda;
  color: #155724;
}

.condition-badge.疲劳 {
  background: #fff3cd;
  color: #856404;
}

.condition-badge.受伤 {
  background: #f8d7da;
  color: #721c24;
}

.condition-badge.低落 {
  background: #e2e3e5;
  color: #383d41;
}

.salary {
  font-size: 12px;
  color: #28a745;
  font-weight: bold;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.promote {
  background: #28a745;
  color: white;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-state p {
  margin-bottom: 15px;
}

.link-btn {
  display: inline-block;
  padding: 10px 20px;
  background: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 14px;
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
.condition-section,
.contract-section,
.action-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.info-section:last-child,
.stats-section:last-child,
.condition-section:last-child,
.contract-section:last-child,
.action-section:last-child {
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

.condition-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.condition-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
}

.condition-label {
  font-size: 13px;
  color: #666;
}

.condition-value {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.condition-value.injured {
  color: #dc3545;
}

/* 训练按钮 */
.train-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.train-btn {
  padding: 10px;
  border: 1px solid #007bff;
  border-radius: 8px;
  background: white;
  color: #007bff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.train-btn:active:not(:disabled) {
  background: #007bff;
  color: white;
}

.train-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: #ccc;
  color: #999;
}

.train-hint {
  font-size: 12px;
  color: #dc3545;
  margin-top: 10px;
  text-align: center;
}

/* 弹窗底部 */
.modal-footer {
  display: flex;
  gap: 10px;
  padding: 15px 20px;
  border-top: 1px solid #eee;
}

.modal-footer button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.rest-btn {
  background: #28a745;
  color: white;
}

.release-btn {
  background: #dc3545;
  color: white;
}

.promote-btn {
  background: #007bff;
  color: white;
}
</style>

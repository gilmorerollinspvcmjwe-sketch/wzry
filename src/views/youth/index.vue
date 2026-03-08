<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useClubStore } from '@/stores/club';
import { useYouthAcademyStore } from '@/stores/youthAcademy';
import { recruitYouthPlayer, promotePlayer } from '@/core/services/youthAcademyService';
import type { YouthPlayer } from '@/types/youthAcademy';
import { YOUTH_PLAYER_STATUS_NAMES } from '@/types/youthAcademy';

const router = useRouter();
const clubStore = useClubStore();
const academyStore = useYouthAcademyStore();

const activeTab = ref<'players' | 'overview'>('overview');
const selectedPlayer = ref<YouthPlayer | null>(null);
const showPlayerDetail = ref(false);
const showPromoteConfirm = ref(false);

const clubId = computed(() => clubStore.currentClub?.id || '');
const academy = computed(() => academyStore.getAcademy(clubId.value));
const weeklyCost = computed(() => academyStore.getWeeklyCost(clubId.value));
const availablePlayers = computed(() => academyStore.getAvailablePlayers(clubId.value));

const positionNames: Record<string, string> = {
  top: '对抗路',
  jungle: '打野',
  mid: '中路',
  adc: '发育路',
  support: '游走',
};

const statNames: Record<string, string> = {
  mechanics: '操作',
  awareness: '意识',
  mentality: '心态',
  teamwork: '配合',
  heroPool: '英雄池',
};

const formatDate = (date: Date | string) => {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '未知日期';
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
};

const getAverageStats = (player: YouthPlayer) => {
  return Math.round(
    (player.stats.mechanics + player.stats.awareness + player.stats.mentality + 
     player.stats.teamwork + player.stats.heroPool) / 5
  );
};

const getStatColor = (value: number) => {
  if (value >= 80) return '#52c41a';
  if (value >= 60) return '#1890ff';
  if (value >= 40) return '#faad14';
  return '#ff4d4f';
};

const getPotentialColor = (value: number) => {
  if (value >= 85) return '#722ed1';
  if (value >= 75) return '#52c41a';
  if (value >= 65) return '#1890ff';
  return '#faad14';
};

const openPlayerDetail = (player: YouthPlayer) => {
  selectedPlayer.value = player;
  showPlayerDetail.value = true;
};

const closePlayerDetail = () => {
  showPlayerDetail.value = false;
  selectedPlayer.value = null;
};

const handleRecruit = () => {
  const result = recruitYouthPlayer(clubId.value);
  if (result.success) {
    alert(result.message);
  } else {
    alert(result.message);
  }
};

const handlePromote = (player: YouthPlayer) => {
  selectedPlayer.value = player;
  showPromoteConfirm.value = true;
};

const confirmPromote = () => {
  if (!selectedPlayer.value) return;
  
  const result = promotePlayer(clubId.value, selectedPlayer.value.id);
  if (result.success) {
    alert(result.message);
    showPromoteConfirm.value = false;
    closePlayerDetail();
  } else {
    alert(result.message);
  }
};

const goToCoaches = () => {
  router.push('/youth/coaches');
};

const goToFacilities = () => {
  router.push('/youth/facilities');
};

const goToLeague = () => {
  router.push('/youth/league');
};
</script>

<template>
  <div class="youth-page">
    <h2 class="page-title">青训学院</h2>
    
    <div class="summary-cards">
      <div class="summary-card">
        <div class="summary-label">学院等级</div>
        <div class="summary-value">Lv.{{ academy.level }}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">青训球员</div>
        <div class="summary-value">{{ academy.players.length }}/20</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">周支出</div>
        <div class="summary-value">{{ weeklyCost }}万</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">已提拔</div>
        <div class="summary-value">{{ academy.stats.totalGraduates }}</div>
      </div>
    </div>
    
    <div class="quick-actions">
      <button class="action-btn" @click="goToCoaches">
        <span class="action-icon">👨‍🏫</span>
        <span class="action-text">教练管理</span>
      </button>
      <button class="action-btn" @click="goToFacilities">
        <span class="action-icon">🏟️</span>
        <span class="action-text">设施升级</span>
      </button>
      <button class="action-btn" @click="goToLeague">
        <span class="action-icon">🏆</span>
        <span class="action-text">青训联赛</span>
      </button>
      <button class="action-btn primary" @click="handleRecruit">
        <span class="action-icon">➕</span>
        <span class="action-text">招募球员</span>
      </button>
    </div>
    
    <div class="tab-bar">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'overview' }"
        @click="activeTab = 'overview'"
      >
        概览
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'players' }"
        @click="activeTab = 'players'"
      >
        球员列表 ({{ academy.players.length }})
      </button>
    </div>
    
    <div v-if="activeTab === 'overview'" class="overview-section">
      <div class="stats-panel">
        <h3>学院统计</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">学院声望</span>
            <span class="stat-value">{{ academy.reputation }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">青训预算</span>
            <span class="stat-value">{{ academy.budget }}万</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">现役一队</span>
            <span class="stat-value">{{ academy.stats.activeInFirstTeam }}人</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">外租球员</span>
            <span class="stat-value">{{ academy.loans.filter(l => l.status === 'active').length }}人</span>
          </div>
        </div>
      </div>
      
      <div class="coaches-panel">
        <h3>青训教练 ({{ academy.coaches.length }}/5)</h3>
        <div v-if="academy.coaches.length > 0" class="coaches-list">
          <div v-for="coach in academy.coaches" :key="coach.id" class="coach-item">
            <div class="coach-name">{{ coach.name }}</div>
            <div class="coach-specialty">{{ coach.specialty }}</div>
            <div class="coach-level">Lv.{{ coach.level }}</div>
          </div>
        </div>
        <div v-else class="empty-hint">
          <p>暂无青训教练</p>
          <button class="link-btn" @click="goToCoaches">聘请教练</button>
        </div>
      </div>
      
      <div class="facilities-panel">
        <h3>设施等级</h3>
        <div class="facilities-list">
          <div class="facility-item">
            <span class="facility-name">训练场</span>
            <div class="facility-level">
              <span v-for="i in 5" :key="i" class="level-dot" :class="{ active: i <= academy.facilities.trainingGround }"></span>
            </div>
          </div>
          <div class="facility-item">
            <span class="facility-name">宿舍</span>
            <div class="facility-level">
              <span v-for="i in 5" :key="i" class="level-dot" :class="{ active: i <= academy.facilities.dormitory }"></span>
            </div>
          </div>
          <div class="facility-item">
            <span class="facility-name">医疗中心</span>
            <div class="facility-level">
              <span v-for="i in 5" :key="i" class="level-dot" :class="{ active: i <= academy.facilities.medicalCenter }"></span>
            </div>
          </div>
          <div class="facility-item">
            <span class="facility-name">分析室</span>
            <div class="facility-level">
              <span v-for="i in 5" :key="i" class="level-dot" :class="{ active: i <= academy.facilities.analysisRoom }"></span>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="availablePlayers.length > 0" class="top-prospects">
        <h3>潜力新星</h3>
        <div class="prospects-list">
          <div 
            v-for="player in availablePlayers.slice(0, 3)" 
            :key="player.id" 
            class="prospect-card"
            @click="openPlayerDetail(player)"
          >
            <div class="prospect-header">
              <span class="prospect-name">{{ player.name }}</span>
              <span class="prospect-potential" :style="{ color: getPotentialColor(player.potential) }">
                潜力 {{ player.potential }}
              </span>
            </div>
            <div class="prospect-info">
              <span class="prospect-position">{{ positionNames[player.position] }}</span>
              <span class="prospect-age">{{ player.age }}岁</span>
              <span class="prospect-stats">平均 {{ getAverageStats(player) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="players-section">
      <div v-if="academy.players.length > 0" class="players-list">
        <div 
          v-for="player in academy.players" 
          :key="player.id" 
          class="player-card"
          :class="{ loaned: player.status === 'loaned' }"
          @click="openPlayerDetail(player)"
        >
          <div class="player-header">
            <div class="player-avatar">{{ player.name[0] }}</div>
            <div class="player-basic">
              <div class="player-name">{{ player.name }}</div>
              <div class="player-meta">
                <span class="player-position">{{ positionNames[player.position] }}</span>
                <span class="player-age">{{ player.age }}岁</span>
              </div>
            </div>
            <div class="player-status" :class="player.status">
              {{ YOUTH_PLAYER_STATUS_NAMES[player.status] }}
            </div>
          </div>
          <div class="player-stats">
            <div class="stat-row">
              <span class="stat-label">潜力</span>
              <span class="stat-value" :style="{ color: getPotentialColor(player.potential) }">{{ player.potential }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">平均</span>
              <span class="stat-value">{{ getAverageStats(player) }}</span>
            </div>
          </div>
          <div class="player-actions" v-if="player.status === 'training'" @click.stop>
            <button 
              class="promote-btn" 
              :disabled="getAverageStats(player) < 60"
              @click="handlePromote(player)"
            >
              提拔
            </button>
          </div>
        </div>
      </div>
      <div v-else class="empty-players">
        <p>暂无青训球员</p>
        <button class="recruit-btn" @click="handleRecruit">招募球员</button>
      </div>
    </div>
    
    <div v-if="showPlayerDetail && selectedPlayer" class="modal-overlay" @click="closePlayerDetail">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedPlayer.name }}</h3>
          <button class="close-btn" @click="closePlayerDetail">×</button>
        </div>
        
        <div class="modal-body">
          <div class="detail-section">
            <div class="detail-row">
              <span class="detail-label">位置</span>
              <span class="detail-value">{{ positionNames[selectedPlayer.position] }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">年龄</span>
              <span class="detail-value">{{ selectedPlayer.age }}岁</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">潜力</span>
              <span class="detail-value" :style="{ color: getPotentialColor(selectedPlayer.potential) }">
                {{ selectedPlayer.potential }}
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">状态</span>
              <span class="detail-value">{{ YOUTH_PLAYER_STATUS_NAMES[selectedPlayer.status] }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">入队时间</span>
              <span class="detail-value">{{ formatDate(selectedPlayer.joinDate) }}</span>
            </div>
          </div>
          
          <div class="abilities-section">
            <h4>能力属性</h4>
            <div v-for="(value, key) in selectedPlayer.stats" :key="key" class="ability-item" v-if="key !== 'potential' && key !== 'growthRate' && key !== 'trainingProgress'">
              <span class="ability-name">{{ statNames[key] || key }}</span>
              <div class="ability-bar">
                <div class="ability-fill" :style="{ width: value + '%', backgroundColor: getStatColor(value) }"></div>
              </div>
              <span class="ability-value">{{ Math.round(value) }}</span>
            </div>
          </div>
          
          <div class="condition-section">
            <h4>状态</h4>
            <div class="condition-grid">
              <div class="condition-item">
                <span class="condition-label">体力</span>
                <span class="condition-value">{{ selectedPlayer.condition.stamina }}%</span>
              </div>
              <div class="condition-item">
                <span class="condition-label">士气</span>
                <span class="condition-value">{{ selectedPlayer.condition.morale }}%</span>
              </div>
              <div class="condition-item">
                <span class="condition-label">幸福度</span>
                <span class="condition-value">{{ selectedPlayer.condition.happiness }}%</span>
              </div>
            </div>
          </div>
          
          <div v-if="selectedPlayer.loanInfo" class="loan-section">
            <h4>租借信息</h4>
            <div class="detail-row">
              <span class="detail-label">租借至</span>
              <span class="detail-value">{{ selectedPlayer.loanInfo.toClub }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">租借至</span>
              <span class="detail-value">{{ formatDate(selectedPlayer.loanInfo.endDate) }}</span>
            </div>
          </div>
        </div>
        
        <div class="modal-footer" v-if="selectedPlayer.status === 'training'">
          <button 
            class="promote-btn full" 
            :disabled="getAverageStats(selectedPlayer) < 60"
            @click="handlePromote(selectedPlayer)"
          >
            提拔到一队
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="showPromoteConfirm" class="modal-overlay" @click="showPromoteConfirm = false">
      <div class="confirm-modal" @click.stop>
        <h3>确认提拔</h3>
        <p>确定要将 <strong>{{ selectedPlayer?.name }}</strong> 提拔到一队吗？</p>
        <p class="hint">球员平均属性需要达到60才能提拔</p>
        <div class="confirm-actions">
          <button class="cancel-btn" @click="showPromoteConfirm = false">取消</button>
          <button class="confirm-btn" @click="confirmPromote">确认提拔</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.youth-page {
  padding: 15px;
  padding-bottom: 80px;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 15px;
}

.summary-card {
  background: white;
  border-radius: 10px;
  padding: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.summary-label {
  font-size: 11px;
  color: #999;
  margin-bottom: 5px;
}

.summary-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 15px;
}

.action-btn {
  background: white;
  border: none;
  border-radius: 10px;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:active {
  transform: scale(0.95);
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-icon {
  font-size: 20px;
}

.action-text {
  font-size: 11px;
  color: inherit;
}

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

.overview-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.stats-panel,
.coaches-panel,
.facilities-panel,
.top-prospects {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.stats-panel h3,
.coaches-panel h3,
.facilities-panel h3,
.top-prospects h3 {
  font-size: 15px;
  margin-bottom: 12px;
  color: #333;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-label {
  color: #999;
  font-size: 13px;
}

.stat-value {
  color: #333;
  font-weight: 600;
  font-size: 13px;
}

.coaches-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.coach-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
}

.coach-name {
  font-weight: 600;
  color: #333;
}

.coach-specialty {
  font-size: 12px;
  color: #666;
}

.coach-level {
  font-size: 12px;
  color: #007bff;
  font-weight: 600;
}

.empty-hint {
  text-align: center;
  padding: 20px;
  color: #999;
}

.link-btn {
  background: none;
  border: none;
  color: #007bff;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
}

.facilities-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.facility-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.facility-name {
  font-size: 13px;
  color: #666;
}

.facility-level {
  display: flex;
  gap: 4px;
}

.level-dot {
  width: 20px;
  height: 8px;
  border-radius: 4px;
  background: #e0e0e0;
}

.level-dot.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.prospects-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.prospect-card {
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.prospect-card:active {
  transform: scale(0.98);
}

.prospect-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.prospect-name {
  font-weight: 600;
  color: #333;
}

.prospect-potential {
  font-weight: 600;
}

.prospect-info {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #666;
}

.players-list {
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

.player-card.loaned {
  opacity: 0.7;
  border-left: 4px solid #faad14;
}

.player-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.player-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.player-basic {
  flex: 1;
}

.player-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.player-meta {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: #999;
}

.player-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.player-status.training {
  background: #e6f7ff;
  color: #1890ff;
}

.player-status.loaned {
  background: #fff7e6;
  color: #fa8c16;
}

.player-status.injured {
  background: #fff1f0;
  color: #ff4d4f;
}

.player-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
}

.stat-row {
  display: flex;
  gap: 8px;
  font-size: 13px;
}

.stat-row .stat-label {
  color: #999;
}

.stat-row .stat-value {
  color: #333;
  font-weight: 600;
}

.player-actions {
  display: flex;
  justify-content: flex-end;
}

.promote-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #52c41a;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.promote-btn:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}

.promote-btn.full {
  width: 100%;
  padding: 14px;
  font-size: 15px;
}

.empty-players {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.empty-players p {
  color: #999;
  margin-bottom: 15px;
}

.recruit-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background: #007bff;
  color: white;
  font-size: 14px;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

@media (min-width: 768px) {
  .modal-overlay {
    align-items: center;
  }
}

.modal-content {
  background: white;
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  overflow-y: auto;
}

@media (min-width: 768px) {
  .modal-content {
    border-radius: 16px;
    max-height: 80vh;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
}

.close-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  font-size: 24px;
  color: white;
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 50%;
}

.modal-body {
  padding: 20px;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-label {
  color: #999;
  font-size: 14px;
}

.detail-value {
  color: #333;
  font-size: 14px;
  font-weight: 600;
}

.abilities-section,
.condition-section,
.loan-section {
  margin-bottom: 20px;
}

.abilities-section h4,
.condition-section h4,
.loan-section h4 {
  font-size: 15px;
  color: #333;
  margin-bottom: 12px;
}

.ability-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.ability-name {
  width: 50px;
  font-size: 12px;
  color: #666;
}

.ability-bar {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.ability-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.ability-value {
  width: 30px;
  text-align: right;
  font-size: 12px;
  font-weight: bold;
  color: #333;
}

.condition-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.condition-item {
  text-align: center;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
}

.condition-label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 5px;
}

.condition-value {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
}

.confirm-modal {
  background: white;
  border-radius: 16px;
  padding: 20px;
  width: 90%;
  max-width: 350px;
  text-align: center;
}

.confirm-modal h3 {
  margin-bottom: 15px;
  color: #333;
}

.confirm-modal p {
  color: #666;
  margin-bottom: 10px;
}

.confirm-modal .hint {
  font-size: 12px;
  color: #999;
}

.confirm-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background: #52c41a;
  color: white;
}
</style>
